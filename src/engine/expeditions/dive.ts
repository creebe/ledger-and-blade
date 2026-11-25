// The expedition simulation: builds a route through a site from a seed and
// plays it out against the plan. Pure and deterministic: the same setup
// always gives the same log. No React, no Math.random.
import { chance, nextFloat, pick, randInt, shuffle, weighted } from '../core/rng';
import type { DamageType, Element, ProfessionId } from '../core/types';
import {
  BAD_HABITS,
  CHANGES,
  GOOD_HABITS,
  GOODS,
  HABITS,
  LENGTHS,
  MONSTERS,
  SCARS,
  SITES,
  TAG_DIVE,
  ZONES,
  ZONE_ORDER,
  routeOf,
  type MarkDef,
  type MonsterDef,
  type RouteStep,
} from './data/content';
import { LINES as PELLAM_LINES } from './data/lines';
import { SITE_LINES } from './data/lines-sites';
import { EXP_TUNING as T } from './tuning';
import type { Delver, DelverOutcome, DiveGear, DiveSetup, EnemySnap, ExpeditionResult, GoodId, LogKind, LogLine, MonsterId, SquadSnap, SupplyId, ZoneId } from './types';

type Rng = { rng: number };

const LINES: Record<string, string[]> = { ...PELLAM_LINES, ...SITE_LINES };

interface Actor {
  d: Delver;
  name: string;
  prof: ProfessionId;
  maxHp: number;
  hp: number;
  fatigue: number;
  exposure: number;
  masked: boolean;
  acc: number;
  dodge: number;
  prot: number;
  speed: number;
  crit: number;
  weapon?: DiveGear;
  trinket?: DiveGear;
  /** an oil or salts from their kit: their blows carry it */
  element?: Element;
  /** healing draughts in their own kit */
  draughts: number;
  marks: MarkDef[];
  state: 'ok' | 'down' | 'dead';
  stunned: boolean;
  bleed: number;
  poison: number;
  covering?: Actor;
  xp: number;
  kills: number;
  killsBy: Partial<Record<MonsterId, number>>;
  deeds: string[];
  fame: number;
  newScars: string[];
  wentDown: boolean;
  gotUp: boolean;
  wasSpent: boolean;
  sawDeath: boolean;
  newChanges: string[];
  /** running the Sink fever: the change it will leave, and rooms to go */
  fever?: { change: string; rooms: number };
  freeCastUsed: boolean;
  healed: number;
  covers: number;
  bossKill: boolean;
  died?: string;
}

interface Foe {
  def: MonsterDef;
  label: string;
  hp: number;
  maxHp: number;
  acc: number;
  dodge: number;
  prot: number;
  dmg: [number, number];
  speed: number;
  stunned: boolean;
  bleed: number;
  pinned: number;
  charged: boolean;
  turns: number;
  burned: boolean;
}

type Room = { kind: 'passage' | 'fight' | 'trap' | 'find' | 'curio' | 'camp' | 'boss' | 'goal'; zone: ZoneId };

const mark = (d: Pick<Delver, 'scars' | 'changes' | 'habits'>): MarkDef[] => [...d.scars.map((x) => SCARS[x]), ...(d.changes ?? []).map((c) => CHANGES[c]), ...d.habits.map((h) => HABITS[h])].filter(Boolean);
const sum = (ms: MarkDef[], k: keyof MarkDef) => ms.reduce((t, m) => t + ((m[k] as number | undefined) ?? 0), 0);

/** Max HP for a member, scars included. */
export function delverMaxHp(d: Pick<Delver, 'attrs' | 'level' | 'scars' | 'changes' | 'habits'>): number {
  return Math.max(8, T.hp.base + d.attrs.might * T.hp.perMight + (d.level - 1) * T.hp.perLevel + sum(mark(d), 'maxHp'));
}

/** The numbers a member fights with, from attributes, gear, scars and habits. */
export function delverStats(d: Delver) {
  const ms = mark(d);
  const armor = d.gear.armor;
  const trinket = d.gear.trinket;
  return {
    maxHp: delverMaxHp(d),
    acc: 74 + d.attrs.finesse * 2 + d.level * 2 + (trinket?.acc ?? 0) + sum(ms, 'acc'),
    dodge: Math.max(0, 4 + d.attrs.finesse * 2 - (armor?.bulk ?? 0) + (trinket?.dodge ?? 0) + d.gear.consumables.reduce((t, c) => t + (c.dodge ?? 0), 0) + sum(ms, 'dodge')),
    prot: (armor?.protection ?? 0) + sum(ms, 'prot'),
    speed: d.attrs.finesse + sum(ms, 'speed'),
    crit: 0.05 + d.attrs.wits * 0.006,
  };
}

/** Plan the rooms of a route. Separate from the play so the route is known up front. */
function buildRoute(r: Rng, steps: RouteStep[], rivalZone: ZoneId | undefined): Room[] {
  const rooms: Room[] = [];
  let last = '';
  let run = 0;
  steps.forEach((step, i) => {
    if (step === 'camp') return rooms.push({ kind: 'camp', zone: (steps[i - 1] as ZoneId) ?? steps[0] });
    if (step === 'boss') return rooms.push({ kind: 'boss', zone: 'sink' });
    const z = ZONES[step];
    if (i === steps.length - 1) return rooms.push({ kind: 'goal', zone: step });
    const w = { ...z.rooms };
    if (rivalZone === step) w.fight *= 0.5;
    const opts = (Object.keys(w) as (keyof typeof w)[]).map((k) => ({ item: k, weight: k === last && run >= 1 ? w[k] * 0.3 : w[k] }));
    // the first room of the trip is never a trap
    const kind = i === 0 ? weighted(r, opts.filter((o) => o.item !== 'trap')) : weighted(r, opts);
    run = kind === last ? run + 1 : 0;
    last = kind;
    rooms.push({ kind, zone: step });
  });
  return rooms;
}

/** Play a whole trip. The same setup always gives the same result. */
export function runExpedition(setup: DiveSetup): ExpeditionResult {
  const r: Rng = { rng: setup.seed | 0 || 1 };
  const plan = setup.plan;
  const site = SITES[setup.site];
  const steps = routeOf(setup.site, setup.length);
  const firstZone = steps[0] as ZoneId;
  const rivalZone = setup.rivalAhead ? firstZone : undefined;
  const route = buildRoute(r, steps, rivalZone);
  const squad = setup.squad;
  const tagFx = setup.tags.map((t) => TAG_DIVE[t]).filter(Boolean);
  const carried = new Set(squad.flatMap((d) => d.gear.consumables.flatMap((c) => c.counters ?? [])).concat(squad.flatMap((d) => d.gear.trinket?.counters ?? [])));
  const live = (t: string) => setup.tags.includes(t) && !carried.has(t) && !(TAG_DIVE[t]?.counterProf && squad.some((d) => d.prof === TAG_DIVE[t].counterProf));
  const tagFatigue = setup.tags.filter(live).reduce((n, t) => n + (TAG_DIVE[t].fatigue ?? 0), 0);
  const tagExposure = setup.tags.filter(live).reduce((n, t) => n + (TAG_DIVE[t].exposure ?? 0), 0);
  const tagDark = setup.tags.some((t) => live(t) && TAG_DIVE[t].dark);
  const tagAvoid = tagFx.reduce((n, x) => n + (x.avoid ?? 0), 0);
  const bogs = setup.tags.some((t) => live(t) && TAG_DIVE[t].bogs);
  const foeProt = tagFx.reduce((n, x) => n + (x.foeProt ?? 0), 0);
  const tagGroups = tagFx.flatMap((x) => x.groups ?? []);
  const sigs = new Set(squad.map((d) => d.signature).filter(Boolean));
  const threatScale = Math.max(T.threat.min, 1 + (setup.threat - T.threat.base) * T.threat.perPoint) * (setup.foeScale || 1) * (setup.site === 'pellam' ? 1 : T.thinFoe);
  const darkZone = (z: ZoneId) => ZONES[z].dark || tagDark;
  const pack: Record<SupplyId, number> = { food: 0, bandages: 0, oil: 0, tools: 0, masks: 0, reagents: 0, draughts: 0, ...plan.pack } as Record<SupplyId, number>;
  const packed = { ...pack };
  const O = plan.orders;
  const log: LogLine[] = [];
  const loot: Partial<Record<GoodId, number>> = {};
  const kills: Partial<Record<MonsterId, number>> = {};
  const renownDeeds: { text: string; renown: number }[] = [];
  let crownsFound = 0;
  let dark = false;
  let outOfOilSaid = false;
  let sinceMeal = 0;
  let sinceCamp = 99;
  let zone: ZoneId | undefined;
  let deepest: ZoneId = firstZone;
  let cleared = 0;
  let outcome: ExpeditionResult['outcome'] = 'complete';
  let wanderersWon = 0;
  let parleys = 0;
  // the last group the squad met (fought, talked off or slipped past), and where: the next meeting is with someone else
  let lastMet: MonsterId[] = [];
  let lastMetRoom = -99;
  let foes: Foe[] = [];
  // the week each line falls in: the road out, the rooms spread over the length's weeks, the road home
  const diveWeeks = LENGTHS[setup.length].weeks;
  let week = 1;
  let roomNo: number | undefined;
  const weekOfRoom = (i: number) => setup.roadOut + 1 + Math.min(diveWeeks - 1, Math.floor((i * diveWeeks) / route.length));

  // ---- the squad ----
  const A: Actor[] = squad.map((d) => {
    const s = delverStats(d);
    return {
      d,
      name: d.name.split(' ')[0],
      prof: d.prof,
      maxHp: s.maxHp,
      hp: Math.max(1, Math.round((s.maxHp * d.health) / 100)),
      fatigue: d.fatigue,
      exposure: d.exposure,
      masked: false,
      acc: s.acc,
      dodge: s.dodge,
      prot: s.prot,
      speed: s.speed,
      crit: s.crit,
      weapon: d.gear.weapon,
      trinket: d.gear.trinket,
      element: d.gear.consumables.find((c) => c.grantsElement)?.grantsElement,
      draughts: d.gear.consumables.filter((c) => c.draught).length,
      marks: mark(d),
      state: 'ok',
      stunned: false,
      bleed: 0,
      poison: 0,
      xp: 0,
      kills: 0,
      killsBy: {},
      deeds: [],
      fame: 0,
      newScars: [],
      wentDown: false,
      gotUp: false,
      wasSpent: false,
      sawDeath: false,
      newChanges: [],
      freeCastUsed: false,
      healed: 0,
      covers: 0,
      bossKill: false,
    };
  });
  const standing = () => A.filter((a) => a.state === 'ok');
  const rankOf = (a: Actor) => standing().indexOf(a) + 1;
  const hasProf = (p: ProfessionId) => standing().some((a) => a.prof === p);
  const kitSum = (a: Actor, k: 'avoid' | 'parley' | 'spot' | 'finds') => (a.trinket?.[k] ?? 0) + (a.d.gear.armor?.[k] ?? 0) + a.d.gear.consumables.reduce((t, c) => t + (c[k] ?? 0), 0);
  const findsBonus = () => standing().reduce((t, a) => t + kitSum(a, 'finds') + sum(a.marks, 'finds'), 0) + (hasProf('scout') ? 0.15 : 0);
  if (sigs.has('front_rank')) for (const a of A) a.acc += 4;

  // ---- narration ----
  const usedLines: Record<string, number> = {};
  const order: Record<string, number[]> = {};
  const fill = (t: string, v: Record<string, string | number | undefined>) => t.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
  /** pick a line for this situation, cycling through its variants before repeating any */
  /** a site's own lines first, then its kind of place (underground, town, overland), then everyone's */
  const resolve = (key: string) => [`${key}:${site.id}`, `${key}:${site.group}`, key].find((k) => LINES[k]?.length);
  /** a monster's own line, or its voice's */
  const mkey = (def: MonsterDef, k: string, kill = false) => {
    const own = kill ? `kill_${def.id}` : `${def.id}_${k}`;
    if (resolve(own) || !def.voice) return own;
    return kill ? `kill_${def.voice}` : `${def.voice}_${k}`;
  };
  const say = (key0: string, v: Record<string, string | number | undefined> = {}) => {
    const key = resolve(key0) ?? key0;
    const opts = LINES[key];
    if (!opts || !opts.length) return key0;
    const n = usedLines[key] ?? 0;
    if (n % opts.length === 0) {
      // reshuffle the order this key's variants come out in
      order[key] = shuffle(r, opts.map((_, i) => i));
    }
    usedLines[key] = n + 1;
    const out = fill(opts[order[key][n % opts.length]], v);
    // a placeholder can start a sentence: give it a capital
    return out.replace(/(^|[.!?]["”]?\s+)([a-z])/g, (_, p: string, c: string) => p + c.toUpperCase());
  };
  const snapSquad = (): SquadSnap => ({
    hp: A.map((a) => Math.max(0, Math.round(a.hp))),
    maxHp: A.map((a) => a.maxHp),
    fatigue: A.map((a) => Math.round(a.fatigue)),
    exposure: A.map((a) => Math.round(a.exposure)),
    fever: A.map((a) => !!a.fever),
    state: A.map((a) => (a.state === 'dead' ? 'dead' : a.state === 'down' ? 'down' : a.fatigue >= 100 ? 'out' : a.fatigue >= T.fatigue.spent ? 'spent' : 'ok')),
  });
  const snapFoes = (): EnemySnap[] | undefined =>
    foes.length ? foes.map((f) => ({ monster: f.def.id, name: f.label, hp: Math.max(0, Math.round(f.hp)), maxHp: f.maxHp })) : undefined;
  const put = (kind: LogKind, text: string, extra: Partial<LogLine> = {}) => {
    log.push({ kind, text, squad: snapSquad(), enemies: snapFoes(), week, t: 0, room: roomNo, zone, ...extra });
  };

  // ---- fatigue and exposure ----
  /** Physical wear. Resolve and some habits change how fast it builds. */
  const tire = (a: Actor, n: number) => {
    if (a.state === 'dead') return;
    if (n > 0) n = Math.max(0, n * (1 - (a.d.attrs.resolve - 5) * 0.06) - ((a.trinket?.ease ?? 0) + (sigs.has('keeps_walking') ? 1 : 0)) * 0.5);
    const before = a.fatigue;
    a.fatigue = Math.max(0, Math.min(100, a.fatigue + n));
    if (a.state !== 'ok') return;
    if (before < 100 && a.fatigue >= 100) {
      a.wasSpent = true;
      put('fatigue', say('collapse', { a: a.name }), { big: true });
    } else if (before < T.fatigue.spent && a.fatigue >= T.fatigue.spent) {
      a.wasSpent = true;
      put('fatigue', say('spent', { a: a.name }), { big: true });
    } else if (before >= T.fatigue.spent && a.fatigue < T.fatigue.spent - 10) {
      put('fatigue', say('second_wind_back', { a: a.name, w: wname(a) }));
    }
  };
  const tireAll = (n: number) => standing().forEach((a) => tire(a, n));
  /** Give a member a Sink change now: it works from this room on. */
  const takeChange = (a: Actor, c: string, key: string) => {
    const def = CHANGES[c];
    a.newChanges.push(c);
    a.marks.push(def);
    a.maxHp += def.maxHp ?? 0;
    a.hp += Math.max(0, def.maxHp ?? 0);
    a.prot += def.prot ?? 0;
    a.fever = undefined;
    put('exposure', `${say(key, { a: a.name })} ${say(`change_${c}`, { a: a.name })}`, { big: true, note: def.name });
  };
  /** Pick the change a threshold brings: deeper thresholds draw from better tiers. */
  const drawChange = (a: Actor, th: number): string | undefined => {
    const have = new Set([...(a.d.changes ?? []), ...a.newChanges, ...(a.fever ? [a.fever.change] : [])]);
    const odds = T.exposure.tierOdds[th];
    for (let tries = 0; tries < 3; tries++) {
      const tier = weighted(r, [1, 2, 3].map((t, i) => ({ item: t, weight: odds[i] })));
      const free = Object.keys(CHANGES).filter((c) => CHANGES[c].tier === tier && !have.has(c));
      if (free.length) return pick(r, free);
    }
    const any = Object.keys(CHANGES).filter((c) => !have.has(c));
    return any.length ? pick(r, any) : undefined;
  };
  /**
   * Reagent runoff in the body. Wet masks halve it. Crossing a threshold starts a Sink change:
   * a worn-out body takes it at once; a rested one runs the Sink fever first.
   */
  const expose = (a: Actor, n: number) => {
    if (a.state === 'dead' || n <= 0) return;
    if (a.masked) n = n / 2;
    n *= a.marks.reduce((m, x) => m * (x.exposureRate ?? 1), 1);
    const before = a.exposure;
    a.exposure = Math.min(100, a.exposure + n);
    T.exposure.thresholds.forEach((th, i) => {
      if (before >= th || a.exposure < th || a.fever) return;
      const c = drawChange(a, i);
      if (!c) return;
      if (a.fatigue >= T.exposure.takeAt) takeChange(a, c, 'change_take');
      else {
        a.fever = { change: c, rooms: T.exposure.feverRooms };
        put('exposure', say('fever_start', { a: a.name }), { big: true, note: 'the Sink fever' });
      }
    });
  };
  /** Each room, the fever runs its course, or a tired body gives in to the change early. */
  const feverTick = () => {
    for (const a of standing()) {
      if (!a.fever) continue;
      tire(a, T.exposure.feverFatigue);
      a.fever.rooms -= 1;
      if (a.fatigue >= T.exposure.takeAt || a.fever.rooms <= 0) takeChange(a, a.fever.change, 'fever_breaks');
      else if (chance(r, 0.35)) put('exposure', say('fever_room', { a: a.name }));
    }
  };
  const exposeAll = (n: number) => standing().forEach((a) => expose(a, n));
  const wname = (a: Actor) => (a.weapon?.name ?? 'bare hands').toLowerCase();
  /** aim and dodge lost to fatigue */
  const wear = (a: Actor) => (a.fatigue >= T.fatigue.spent ? T.fatigue.spentPenalty : a.fatigue >= T.fatigue.tired ? T.fatigue.tiredPenalty : 0) + (a.fever ? T.exposure.feverPenalty : 0);

  // ---- helpers ----
  const zoneScale = (def: MonsterDef, z: ZoneId) => (1 + Math.max(0, ZONES[z].depth - def.depth) * T.depthScale) * threatScale;
  const makeFoes = (ids: MonsterId[], z: ZoneId): Foe[] => {
    const counts: Record<string, number> = {};
    ids.forEach((id) => (counts[id] = (counts[id] ?? 0) + 1));
    const seen: Record<string, number> = {};
    return ids.map((id) => {
      const def = MONSTERS[id];
      const s = zoneScale(def, z);
      seen[id] = (seen[id] ?? 0) + 1;
      const nth = ['first', 'second', 'third', 'fourth'][seen[id] - 1];
      const label = id === 'kiln' ? 'the Kiln Engine' : counts[id] > 1 ? `the ${nth} ${def.one}` : `the ${def.one}`;
      const hp = Math.round(def.hp * s * T.foe.hp);
      return { def, label, hp, maxHp: hp, acc: def.acc + (s - 1) * 20, dodge: def.dodge, prot: def.prot + foeProt, dmg: [Math.round(def.dmg[0] * s * T.foe.dmg), Math.round(def.dmg[1] * s * T.foe.dmg)], speed: def.speed, stunned: false, bleed: 0, pinned: 0, charged: false, turns: 0, burned: false };
    });
  };
  const addLoot = (g: GoodId, n: number) => {
    if (n <= 0) return;
    loot[g] = (loot[g] ?? 0) + n;
  };
  const goodName = (g: GoodId, n: number) => (n === 1 ? GOODS[g].one : `${n} ${GOODS[g].many}`);
  const heal = (a: Actor, n: number) => {
    const before = a.hp;
    a.hp = Math.min(a.maxHp, a.hp + n);
    return Math.round(a.hp - before);
  };
  const hurtOrder = (list: Actor[]) => {
    if (O.healFirst === 'front') return [...list];
    if (O.healFirst === 'back') return [...list].reverse();
    return [...list].sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp);
  };
  const spotChance = () => {
    const best = Math.max(0, ...standing().map((a) => a.d.attrs.wits * 0.03 + sum(a.marks, 'spot')));
    return Math.max(0.05, Math.min(0.95, 0.2 + (hasProf('scout') ? 0.4 : 0) + (hasProf('infiltrator') ? 0.15 : 0) + best - (dark ? 0.25 : 0)));
  };

  // ---- going down, and dying ----
  const goDown = (a: Actor, overkill: number, cause: string) => {
    if (a.draughts > 0 || pack.draughts > 0) {
      if (a.draughts > 0) a.draughts -= 1;
      else pack.draughts -= 1;
      a.hp = Math.round(a.maxHp * 0.35);
      put('heal', say('draught', { a: a.name }), { big: true, note: 'a draught' });
      return;
    }
    a.state = 'down';
    a.wentDown = true;
    a.covering = undefined;
    for (const x of A) if (x.covering === a) x.covering = undefined;
    const p = Math.max(T.death.min, Math.min(T.death.max, T.death.base + (overkill / a.maxHp) * T.death.overkill + (dark && !a.marks.some((m) => m.nightEyes) ? T.death.dark : 0) - (hasProf('chaplain') ? T.death.chaplain : 0) - (sigs.has('nobody_dies') ? 0.08 : 0) + (a.fatigue >= T.fatigue.spent ? T.death.spent : a.fatigue >= T.fatigue.tired ? T.death.tired : 0) + sum(a.marks, 'deathRoll')));
    if (chance(r, p)) {
      a.state = 'dead';
      a.hp = 0;
      a.died = cause;
      put('death', say('death', { a: a.name, m: cause }), { big: true });
      for (const x of standing()) {
        x.sawDeath = true;
      }
    } else {
      a.hp = 0;
      put('down', say('down', { a: a.name }), { big: true });
    }
  };

  // ---- a member hits a foe ----
  const multFor = (f: Foe, type?: DamageType, el?: Element) => {
    let m = 1;
    for (const k of [type, el]) {
      if (!k) continue;
      if (f.def.weak.includes(k)) m *= 1.5;
      if (f.def.resist.includes(k)) m *= 0.5;
    }
    return m;
  };
  const killFoe = (a: Actor, f: Foe) => {
    put('win', say(mkey(f.def, '', true), { a: a.name, m: f.label }));
    a.kills += 1;
    a.killsBy[f.def.id] = (a.killsBy[f.def.id] ?? 0) + 1;
    kills[f.def.id] = (kills[f.def.id] ?? 0) + 1;
    if (f.def.id === 'kiln') a.bossKill = true;
    if (f.def.coin) crownsFound += f.def.coin + randInt(r, 0, f.def.coin);
    if (f.def.loot && chance(r, f.def.loot.chance)) addLoot(f.def.loot.good, 1);
  };
  /** One blow. Returns true if it landed. */
  const strike = (a: Actor, f: Foe, o: { key: string; power: number; type?: DamageType; el?: Element; accMod?: number; armorPierce?: number; critMod?: number; mult?: number }) => {
    if (!o.el && o.type && a.element) o = { ...o, el: a.element };
    if (!o.el && o.type && a.marks.some((m) => m.fireBlows)) o = { ...o, el: 'fire' };
    const vs = a.marks.reduce((s, m) => s + (m.accVs?.monster === f.def.id ? m.accVs.acc : 0), 0);
    const hitP = Math.max(0.12, Math.min(0.96, (a.acc + (o.accMod ?? 0) + vs - f.dodge - (dark && !a.marks.some((m) => m.nightEyes) ? 10 : 0) - wear(a)) / 100));
    const v = { a: a.name, m: f.label, w: wname(a) };
    if (!chance(r, hitP)) {
      put('miss', say(`${o.key}_miss`, v));
      return false;
    }
    const crit = chance(r, a.crit + (o.critMod ?? 0));
    const dmgVs = a.marks.reduce((s, m) => s + (m.dmgVs?.monster === f.def.id ? m.dmgVs.dmg : 0), 0);
    let dmg = o.power + randInt(r, 0, 2) + dmgVs;
    const armor = crit ? 0 : f.prot * 0.6 * (1 - (o.armorPierce ?? 0));
    dmg = Math.max(1, Math.round((dmg - armor) * multFor(f, o.type, o.el) * (o.mult ?? 1) * (crit ? 1.5 : 1)));
    f.hp -= dmg;
    if (o.el === 'fire') f.burned = true;
    const weak = multFor(f, o.type, o.el) > 1.01;
    const strong = multFor(f, o.type, o.el) < 0.99;
    put('hit', say(crit ? 'crit' : `${o.key}_hit`, v), { note: `${dmg}${weak ? ', it hates that' : strong ? ', it shrugs' : ''}` });
    if (f.hp <= 0) {
      killFoe(a, f);
      foes = foes.filter((x) => x !== f);
    }
    return true;
  };
  const liveFoes = () => foes.filter((f) => f.hp > 0);
  const frontFoes = () => liveFoes().slice(0, 2);
  const pickTarget = (list: Foe[], prefer?: (f: Foe) => number) => {
    if (!list.length) return undefined;
    const scored = list.map((f) => ({ f, s: (prefer ? prefer(f) : 0) - f.hp / f.maxHp + nextFloat(r) * 0.3 }));
    scored.sort((x, y) => y.s - x.s);
    return scored[0].f;
  };

  // ---- members act ----
  const useDose = (n: number, a?: Actor) => {
    if (a && !a.freeCastUsed && a.marks.some((m) => m.freeCast)) {
      a.freeCastUsed = true;
      return true;
    }
    if (pack.reagents >= n) {
      pack.reagents -= n;
      return true;
    }
    return false;
  };
  const memberTurn = (a: Actor) => {
    const rank = rankOf(a);
    const w = a.weapon;
    if (a.fatigue >= 100 || (a.fatigue >= T.fatigue.spent && chance(r, 0.25))) {
      put('fatigue', say(a.fatigue >= 100 ? 'too_tired' : 'spent_fumble', { a: a.name, w: wname(a) }));
      return;
    }
    const { might, finesse, wits } = a.d.attrs;
    const meleePower = (w?.power ?? 2) + Math.floor(might / 2);
    const front = frontFoes();
    switch (a.prof) {
      case 'vanguard': {
        if (rank > 2) return put('miss', say('cant_reach', { a: a.name }));
        const hurt = standing().filter((x) => x !== a && x.hp < x.maxHp * 0.4 && !A.some((y) => y.covering === x));
        if (hurt.length && a.hp > a.maxHp * 0.5 && !a.covering && chance(r, 0.7)) {
          a.covering = hurtOrder(hurt)[0];
          a.covers += 1;
          return put('heal', say('cover', { a: a.name, t: a.covering.name }));
        }
        const t = pickTarget(front);
        if (!t) return;
        if (!t.stunned && !t.def.construct && chance(r, 0.35)) {
          if (strike(a, t, { key: 'bash', power: Math.round(meleePower * 0.6), type: 'blunt' }) && t.hp > 0 && chance(r, 0.35 + might * 0.03)) {
            t.stunned = true;
            put('hit', say('stunned', { m: t.label }));
          }
          return;
        }
        strike(a, t, { key: 'melee', power: meleePower, type: w?.damage ?? 'blunt' });
        return;
      }
      case 'skirmisher': {
        if (rank > 2) return put('miss', say('cant_reach', { a: a.name }));
        const t = pickTarget(front);
        if (!t) return;
        if (!t.def.construct && t.bleed === 0 && t.hp > 12 && chance(r, 0.35)) {
          if (strike(a, t, { key: 'hamstring', power: Math.round(meleePower * 0.7), type: w?.damage ?? 'slash' }) && t.hp > 0) t.bleed = 2;
          return;
        }
        strike(a, t, { key: 'melee', power: Math.round(meleePower * 0.65), type: w?.damage ?? 'slash' });
        const t2 = pickTarget(frontFoes());
        if (t2) strike(a, t2, { key: 'second', power: Math.round(meleePower * 0.65), type: w?.damage ?? 'slash' });
        return;
      }
      case 'marksman': {
        if (!w?.ranged) {
          if (rank > 2) return put('miss', say('cant_reach', { a: a.name }));
          const t = pickTarget(front);
          if (t) strike(a, t, { key: 'melee', power: meleePower, type: w?.damage ?? 'blunt' });
          return;
        }
        const pow = w.power! + Math.floor(finesse / 2);
        const accMod = rank === 1 ? -15 : 0;
        const nasty = liveFoes().filter((f) => f.dmg[1] >= 8 && f.pinned === 0);
        if (nasty.length && chance(r, 0.3)) {
          const t = nasty[0];
          if (strike(a, t, { key: 'pin', power: Math.round(pow * 0.6), type: w.damage, accMod }) && t.hp > 0) t.pinned = 2;
          return;
        }
        const t = pickTarget(liveFoes(), (f) => (multFor(f, w.damage) > 1 ? 0.5 : 0) + (liveFoes().indexOf(f) >= 2 ? 0.3 : 0));
        if (t) strike(a, t, { key: 'shot', power: pow, type: w.damage, accMod, critMod: 0.08 });
        return;
      }
      case 'arcanist': {
        if (!w?.focus) {
          if (rank > 2) return put('miss', say('cant_reach', { a: a.name }));
          const t = pickTarget(front);
          if (t) strike(a, t, { key: 'melee', power: meleePower, type: w?.damage ?? 'blunt' });
          return;
        }
        const el = w.element;
        const pow = w.power! + Math.floor(wits / 2) + 1 + (sigs.has('steady_hands') ? 2 : 0);
        const accMod = rank === 1 ? -15 : 0;
        const live = liveFoes();
        const big = live.some((f) => f.maxHp >= 40);
        const t = pickTarget(live, (f) => (multFor(f, undefined, el) > 1 ? 0.6 : multFor(f, undefined, el) < 1 ? -0.6 : 0) + (f.maxHp >= 20 ? 0.2 : 0));
        if (!t) return;
        // how freely to spend doses follows the standing orders
        const burstOk = live.length >= 3 && (O.consumables === 'freely' ? pack.reagents >= 2 : O.consumables === 'sparingly' ? pack.reagents >= 3 : false);
        const boltOk = pack.reagents >= 1 && (O.consumables === 'freely' || (O.consumables === 'sparingly' ? t.maxHp >= 20 || big : big));
        if (burstOk) {
          useDose(2);
          put('hit', say('burst', { a: a.name, el: elName(el) }), { note: '2 doses' });
          for (const f of [...live]) strike(a, f, { key: 'spell', power: Math.round(pow * 0.6), el, accMod: accMod + 10 });
          return;
        }
        if ((boltOk || (!a.freeCastUsed && a.marks.some((m) => m.freeCast))) && useDose(1, a)) return void strike(a, t, { key: 'spell', power: pow, el, accMod: accMod + 8, mult: 1.1 });
        if (pack.reagents <= 0 && t.hp >= 20 && a.hp > a.maxHp * 0.5) {
          a.hp -= 4;
          put('enemy', say('blood_cast', { a: a.name }), { note: '4 of their own' });
          if (zone === 'sink') expose(a, T.exposure.bloodCast);
          strike(a, t, { key: 'spell', power: pow, el, accMod, mult: 0.9 });
          if (a.hp <= 0) goDown(a, -a.hp, 'their own spell');
          return;
        }
        strike(a, t, { key: 'spark', power: Math.round(pow * 0.45), el, accMod });
        return;
      }
      case 'chaplain': {
        const hurt = standing().filter((x) => x.hp < x.maxHp * 0.5);
        if (hurt.length) {
          const t = hurtOrder(hurt)[0];
          const n = heal(t, T.heal.dress + wits);
          a.healed += n;
          return put('heal', say(t === a ? 'dress_self' : 'dress', { a: a.name, t: t.name }), { note: `+${n}` });
        }
        const low = standing().filter((x) => x.fatigue >= T.fatigue.spent).sort((x, y) => y.fatigue - x.fatigue)[0];
        if (low && chance(r, 0.75)) {
          const n = T.fatigue.secondWind + a.d.attrs.resolve;
          put('fatigue', say(low === a ? 'steady_self' : 'steady', { a: a.name, t: low.name }), { note: `−${n} fatigue` });
          tire(low, -n);
          return;
        }
        if (w?.focus && w.element === 'radiant' && pack.reagents > 0 && O.consumables !== 'hoard') {
          const t = pickTarget(liveFoes(), (f) => (multFor(f, undefined, 'radiant') > 1 ? 0.6 : 0));
          if (t && useDose(1, a)) strike(a, t, { key: 'censer', power: w.power! + Math.floor(wits / 2), el: 'radiant', accMod: 6 });
          return;
        }
        if (rank > 2) return put('miss', say('cant_reach', { a: a.name }));
        const t = pickTarget(front);
        if (t) strike(a, t, { key: 'melee', power: meleePower, type: w?.damage ?? 'blunt' });
        return;
      }
      case 'scout': {
        if (w?.ranged) {
          const t = pickTarget(liveFoes());
          if (t) strike(a, t, { key: 'shot', power: w.power! + Math.floor(finesse / 2), type: w.damage, accMod: rank === 1 ? -15 : 0 });
          return;
        }
        if (rank <= 2) {
          const t = pickTarget(front, (f) => f.prot / 5);
          if (t) strike(a, t, { key: 'knife', power: (w?.power ?? 2) + Math.floor(finesse / 2), type: w?.damage ?? 'pierce', armorPierce: 0.6, critMod: 0.1 });
          return;
        }
        const t = pickTarget(liveFoes());
        if (t) strike(a, t, { key: 'throw', power: Math.round(((w?.power ?? 2) + Math.floor(finesse / 2)) * 0.6), type: 'pierce' });
        return;
      }
      case 'infiltrator': {
        if (rank <= 2) {
          const t = pickTarget(front, (f) => f.prot / 5 + (f.stunned ? 0.4 : 0));
          if (t) strike(a, t, { key: 'backstab', power: (w?.power ?? 2) + Math.floor(finesse / 2), type: w?.damage ?? 'pierce', armorPierce: 0.6, critMod: 0.15 });
          return;
        }
        const t = pickTarget(liveFoes());
        if (t) strike(a, t, { key: 'throw', power: Math.round(((w?.power ?? 2) + Math.floor(finesse / 2)) * 0.6), type: 'pierce' });
        return;
      }
      case 'envoy': {
        // a few hard words to one of the other side, if they are people who can hear them
        const talk = liveFoes().filter((f) => f.def.people && !f.stunned);
        if (talk.length && chance(r, 0.55)) {
          const t = talk[0];
          if (chance(r, Math.min(0.85, 0.3 + wits * 0.05 + kitSum(a, 'parley')))) {
            t.stunned = true;
            put('hit', say('hard_words', { a: a.name, m: t.label }));
          } else put('miss', say('hard_words_miss', { a: a.name, m: t.label }));
          return;
        }
        if (rank <= 2) {
          const t = pickTarget(front);
          if (t) strike(a, t, { key: 'melee', power: meleePower, type: w?.damage ?? 'pierce' });
          return;
        }
        const t = pickTarget(liveFoes());
        if (t) strike(a, t, { key: 'throw', power: Math.round(((w?.power ?? 2) + Math.floor(finesse / 2)) * 0.6), type: 'pierce' });
        return;
      }
    }
  };

  // ---- foes act ----
  const foeTurn = (f: Foe) => {
    f.turns += 1;
    if (f.def.special === 'regen' && !f.burned && f.hp < f.maxHp) {
      f.hp = Math.min(f.maxHp, f.hp + 5);
      put('enemy', say('regen', { m: f.label }), { note: '+5' });
    }
    const live = standing();
    if (!live.length) return;
    const fRank = liveFoes().indexOf(f) + 1;
    const v = (t: Actor) => ({ m: f.label, t: t.name });
    if (f.def.special === 'blast' && f.turns % 4 === 0) {
      put('enemy', say('kiln_blast', { m: f.label }), { big: true });
      for (const t of [...live]) {
        const dmg = Math.max(1, Math.round(randInt(r, 5, 8) - t.prot * 0.3));
        t.hp -= dmg;
        expose(t, T.exposure.kilnBlast);
        if (t.hp <= 0 && t.state === 'ok') goDown(t, -t.hp, 'the Kiln Engine');
      }
      return;
    }
    if (!f.def.ranged && fRank > 2) {
      if (chance(r, 0.4)) put('enemy', say('foe_wait', { m: f.label }));
      return;
    }
    const pool = f.def.ranged ? live : live.slice(0, 2);
    let t = pool.length > 1 && chance(r, f.def.ranged ? 0.5 : 0.35) ? pool[randInt(r, 1, pool.length - 1)] : pool[0];
    const cover = A.find((x) => x.covering === t && x.state === 'ok');
    if (cover) {
      put('heal', say('covered', { a: cover.name, t: t.name, m: f.label }));
      t = cover;
    }
    const hitP = Math.max(0.1, Math.min(0.95, (f.acc + (dark ? 5 : 0) - t.dodge + wear(t) - (f.pinned > 0 ? 20 : 0) + t.marks.reduce((x, m) => x + (m.foeAccVs?.monster === f.def.id ? m.foeAccVs.acc : 0), 0)) / 100));
    if (!chance(r, hitP)) {
      put('miss', say(mkey(f.def, 'miss'), v(t)));
      return;
    }
    let dmg = randInt(r, f.dmg[0], f.dmg[1]);
    if (f.def.special === 'charge' && !f.charged) {
      f.charged = true;
      dmg = Math.round(dmg * 1.5);
    }
    const crit = chance(r, 0.08);
    const skin = f.def.id === 'seep' || f.def.id === 'kiln' ? sum(t.marks, 'burnGuard') : 0;
    dmg = Math.max(1, Math.round((dmg - (crit ? 0 : t.prot * 0.6)) * (crit ? 1.5 : 1)) - skin);
    t.hp -= dmg;
    put('enemy', say(mkey(f.def, crit ? 'crit' : 'hit'), v(t)), { note: `${dmg}` });
    if (f.def.special === 'poison' && t.hp > 0) t.poison = t.marks.some((m) => m.shortPoison) ? 1 : 2;
    if (f.def.id === 'seep') expose(t, T.exposure.seepHit);
    if (f.def.special === 'thief' && chance(r, 0.12)) {
      const have = (Object.keys(loot) as GoodId[]).filter((g) => (loot[g] ?? 0) > 0);
      if (have.length) {
        const g = pick(r, have);
        loot[g]! -= 1;
        put('enemy', say('stolen', { m: f.label, g: GOODS[g].one }));
      }
    }
    if (t.hp <= 0) goDown(t, -t.hp, f.def.id === 'kiln' ? 'the Kiln Engine' : `a ${f.def.one}`);
  };

  // ---- a fight ----
  const fight = (ids: MonsterId[], z: ZoneId, o: { ambushed?: boolean; boss?: boolean; wanderer?: boolean } = {}): 'won' | 'lost' => {
    lastMet = [...ids];
    lastMetRoom = roomNo ?? 999;
    foes = makeFoes(ids, z);
    const lead = foes[0].def;
    // the first sight of each kind of monster
    const kinds = [...new Set(ids)];
    put('fight', say(o.boss ? 'boss_sight' : resolve(`sight_${lead.id}`) ? `sight_${lead.id}` : `sight_${lead.voice ?? 'beast'}`, { m: foes[0].label, n: foes.length }), { big: !!o.boss });
    // an Envoy can talk people out of a fight, or buy them off with what the squad found
    const envoy = standing().find((a) => a.prof === 'envoy');
    if (envoy && !o.boss && foes.every((f) => f.def.people)) {
      const p = Math.min(T.parley.max, T.parley.base + envoy.d.attrs.wits * T.parley.perWits + kitSum(envoy, 'parley') + (sigs.has('known_face') ? 0.15 : 0) + (setup.tags.includes('urban') ? 0.05 : 0) - (o.ambushed ? 0.2 : 0) - foes.length * 0.04);
      if (chance(r, p)) {
        parleys += 1;
        const bribe = T.parley.bribe * foes.length;
        if (crownsFound >= bribe && chance(r, 0.5)) {
          crownsFound -= bribe;
          put('win', say('parley_bribe', { a: envoy.name, m: foes[0].label }), { note: `−${bribe} crowns` });
        } else put('win', say('parley_ok', { a: envoy.name, m: foes[0].label }));
        foes = [];
        for (const a of standing()) a.xp += 1;
        return 'won';
      }
      put('fight', say('parley_fail', { a: envoy.name, m: foes[0].label }));
    }
    for (const a of A.filter((x) => x.state === 'ok')) a.freeCastUsed = false;
    for (const a of standing()) {
      const bolt = sum(a.marks, 'openingStrike');
      const t = foes[0];
      if (!bolt || !t) continue;
      t.hp -= bolt;
      put('hit', say('storm_fingers', { a: a.name, m: t.label }), { note: `${bolt}` });
      if (t.hp <= 0) {
        killFoe(a, t);
        foes = foes.filter((x) => x !== t);
      }
    }
    if (!foes.length) {
      put('win', say('fight_won', {}));
      return 'won';
    }
    if (kinds.includes('moths') && pack.oil > 0) {
      const n = Math.min(pack.oil, randInt(r, 1, 2));
      pack.oil -= n;
      put('supply', say('moths_oil', {}), { note: `−${n} oil` });
    }
    let ambushed = !!o.ambushed;
    if (foes.some((f) => f.def.special === 'ambush') && !ambushed && !chance(r, spotChance())) ambushed = true;
    if (ambushed) put('enemy', say('ambush', { m: foes[0].label }), { big: true });
    for (let round = 1; round <= 14; round++) {
      const actors: ({ kind: 'a'; a: Actor; s: number } | { kind: 'f'; f: Foe; s: number })[] = [
        ...standing().map((a) => ({ kind: 'a' as const, a, s: a.speed + randInt(r, 0, 4) - (ambushed && round === 1 ? 100 : 0) })),
        ...liveFoes().map((f) => ({ kind: 'f' as const, f, s: f.speed + randInt(r, 0, 4) + (ambushed && round === 1 ? 100 : 0) })),
      ];
      actors.sort((x, y) => y.s - x.s);
      for (const x of actors) {
        if (!liveFoes().length || !standing().length) break;
        if (x.kind === 'a') {
          const a = x.a;
          if (a.state !== 'ok') continue;
          if (a.poison > 0 || a.bleed > 0) {
            const n = a.poison > 0 ? 3 : 2;
            a.hp -= n;
            a.poison = Math.max(0, a.poison - 1);
            a.bleed = Math.max(0, a.bleed - 1);
            put('enemy', say('poisoned', { a: a.name }), { note: `${n}` });
            if (a.hp <= 0) {
              goDown(a, -a.hp, 'spider venom');
              continue;
            }
          }
          if (a.stunned) {
            a.stunned = false;
            continue;
          }
          a.covering = a.covering?.state === 'ok' && a.covering.hp < a.covering.maxHp * 0.5 ? a.covering : undefined;
          memberTurn(a);
          if (a.state === 'ok' && a.hp <= 0) goDown(a, -a.hp, 'their own spell');
        } else {
          const f = x.f;
          if (f.hp <= 0) continue;
          if (f.bleed > 0) {
            f.bleed -= 1;
            f.hp -= 3;
            put('hit', say('bleeds', { m: f.label }), { note: '3' });
            if (f.hp <= 0) {
              put('win', say('kill_bleed', { m: f.label }));
              kills[f.def.id] = (kills[f.def.id] ?? 0) + 1;
              if (f.def.coin) crownsFound += f.def.coin + randInt(r, 0, f.def.coin);
              if (f.def.loot && chance(r, f.def.loot.chance)) addLoot(f.def.loot.good, 1);
              foes = foes.filter((y) => y !== f);
              continue;
            }
          }
          if (f.pinned > 0) f.pinned -= 1;
          if (f.stunned) {
            f.stunned = false;
            continue;
          }
          foeTurn(f);
        }
      }
      if (!liveFoes().length || !standing().length) break;
      if (round === 14) {
        put('fight', say('foes_withdraw', { m: liveFoes()[0].label }));
        foes = [];
      }
    }
    const won = standing().length > 0;
    foes = [];
    for (const a of A) {
      a.covering = undefined;
      a.poison = 0;
      a.bleed = 0;
      a.stunned = false;
    }
    if (!won) return 'lost';
    const xp = T.xp.fight + (ZONES[z].depth - 1) * T.xp.perDepth + (o.boss ? 10 : 0);
    for (const a of A) if (a.state !== 'dead') a.xp += xp;
    put('win', say(o.boss ? 'boss_won' : 'fight_won', {}));
    tireAll(o.boss ? T.fatigue.boss : T.fatigue.fight);
    if (o.wanderer) wanderersWon += 1;
    standUp();
    return 'won';
  };

  /** The fallen get up once the danger has passed, often with a scar. */
  function standUp() {
    for (const a of A.filter((x) => x.state === 'down')) {
      a.state = 'ok';
      a.hp = 1;
      a.gotUp = true;
      const free = Object.keys(SCARS).filter((s) => !a.d.scars.includes(s) && !a.newScars.includes(s));
      if (free.length && chance(r, 0.6)) {
        const s = pick(r, free);
        a.newScars.push(s);
        put('down', say('gets_up_scar', { a: a.name, s: SCARS[s].name.toLowerCase() }), { note: SCARS[s].name });
      } else put('down', say('gets_up', { a: a.name }));
    }
  }

  // ---- between rooms ----
  const bandageAt = O.consumables === 'freely' ? 0.65 : O.consumables === 'sparingly' ? 0.4 : 0.2;
  const upkeep = (z: ZoneId) => {
    feverTick();
    // every room wears on them: more deeper down, more in heavy armor, more under a heavy bag
    const load = Math.floor((Object.values(loot) as number[]).reduce((x, y) => x + y, 0) / T.fatigue.loadEvery);
    for (const a of standing()) tire(a, T.fatigue.room[ZONES[z].depth] + ((a.d.gear.armor?.bulk ?? 0) * (bogs ? 2 : 1)) / T.fatigue.bulkDiv + load + tagFatigue + sum(a.marks, 'roomFatigue'));
    if (z === 'sink') standing().forEach((a) => expose(a, T.exposure.sinkRoom + randInt(r, -1, 2)));
    if ((ZONES[z].exposure ?? 0) + tagExposure > 0) exposeAll((ZONES[z].exposure ?? 0) + tagExposure);
    if (darkZone(z)) {
      if (pack.oil > 0) {
        pack.oil -= 1;
        dark = false;
      } else {
        dark = true;
        if (!outOfOilSaid) {
          outOfOilSaid = true;
          put('supply', say(packed.oil > 0 ? 'oil_out' : 'no_oil', {}), { big: true });
        }
        for (const a of standing()) tire(a, T.fatigue.dark + sum(a.marks, 'darkFatigue'));
        if (chance(r, 0.35)) put('fatigue', say('dark_room', { a: pick(r, standing())?.name }));
      }
    }
    sinceMeal += 1;
    sinceCamp += 1;
    if (sinceMeal >= T.mealEvery) {
      sinceMeal = 0;
      if (pack.food > 0) {
        pack.food -= 1;
        put('camp', say('meal', { a: pick(r, standing())?.name }), { note: '1 food' });
        tireAll(T.fatigue.meal);
      } else {
        put('camp', say('hungry', { a: pick(r, standing())?.name }), { big: true, note: `+${T.fatigue.hungry} fatigue each` });
        standing().forEach((a) => tire(a, a.marks.some((m) => m.hungerHalf) ? T.fatigue.hungry / 2 : T.fatigue.hungry));
      }
    }
    for (const a of hurtOrder(standing().filter((x) => x.hp < x.maxHp * bandageAt))) {
      if (pack.bandages <= 0) break;
      if (a.hp >= a.maxHp * bandageAt) continue;
      pack.bandages -= 1;
      const chap = standing().find((x) => x.prof === 'chaplain');
      const n = heal(a, T.heal.bandage + sum(a.marks, 'bandageBonus') + (chap ? T.heal.chaplainBandage : 0));
      if (chap) chap.healed += n;
      put('heal', say(chap && chap !== a ? 'bandage_chaplain' : 'bandage', { a: a.name, t: chap?.name }), { note: `+${n}` });
    }
  };

  const camp = (z: ZoneId, site: boolean) => {
    sinceCamp = 0;
    sinceMeal = 0;
    const chap = hasProf('chaplain');
    put('camp', say(site ? `camp_${z}` : 'camp_hurt', {}), { big: true });
    if (pack.food > 0) {
      pack.food -= 1;
      for (const a of standing()) {
        heal(a, a.maxHp * (T.camp.heal + (chap ? 0.1 : 0) + sum(a.marks, 'campHeal')));
        const mult = a.marks.reduce((s, m) => s * (m.campRest ?? 1), 1);
        a.fatigue = Math.min(a.fatigue, 99);
        tire(a, -Math.round((T.fatigue.camp + (chap ? T.fatigue.chaplainCamp : 0)) * mult));
      }
      put('camp', say(chap ? 'camp_fed_chaplain' : 'camp_fed', { a: pick(r, standing())?.name }), { note: '1 food' });
    } else {
      for (const a of standing()) {
        heal(a, a.maxHp * T.camp.healHungry);
        a.fatigue = Math.min(a.fatigue, 99);
        tire(a, -T.fatigue.campHungry);
      }
      put('camp', say('camp_hungry', { a: pick(r, standing())?.name }), { big: true });
    }
    if (chance(r, T.camp.visit + (dark ? 0.1 : 0))) {
      const visitors = wandererGroup(z);
      if (visitors) {
        put('fight', say('camp_visit', {}));
        return fight(visitors, z, { wanderer: true });
      }
    }
    return 'won';
  };

  /** a fight for this zone: its own groups, and the contract's dangers weighted up */
  const fightGroup = (z: ZoneId): MonsterId[] =>
    weighted(r, [...ZONES[z].fights.map((g) => ({ item: g, weight: 1 })), ...(ZONES[z].site === 'pellam' ? [] : tagGroups.map((g) => ({ item: g, weight: 2 })))]);
  /** a group that isn't the one the squad has only just dealt with; undefined if the zone has nobody else */
  const freshGroup = (z: ZoneId): MonsterId[] | undefined => {
    const recent = (roomNo ?? 999) - lastMetRoom <= 1;
    for (let i = 0; i < 6; i++) {
      const g = fightGroup(z);
      if (!recent || !lastMet.includes(g[0])) return g;
    }
    return undefined;
  };
  const wandererGroup = (z: ZoneId): MonsterId[] | undefined => {
    const g = freshGroup(z);
    if (!g) return undefined;
    return g.slice(0, Math.min(g.length, randInt(r, 1, 2)));
  };

  const wander = (z: ZoneId, prob: number): 'won' | 'lost' | 'none' => {
    if (!chance(r, prob)) return 'none';
    const ids = wandererGroup(z);
    if (!ids) return 'none';
    if (O.wanderers === 'avoid') {
      const bulk = standing().reduce((t, a) => t + (a.d.gear.armor?.bulk ?? 0), 0);
      const quiet = standing().reduce((t, a) => t + kitSum(a, 'avoid'), 0);
      const p = Math.max(0.15, Math.min(0.92, 0.45 + (hasProf('scout') ? 0.25 : 0) + (hasProf('infiltrator') ? 0.2 : 0) + (sigs.has('quiet_feet') ? 0.15 : 0) + tagAvoid + Math.max(0, ...standing().map((a) => sum(a.marks, 'avoid'))) + quiet - bulk * 0.012 - (dark ? 0.15 : 0)));
      if (chance(r, p)) {
        lastMet = [...ids];
        lastMetRoom = roomNo ?? 999;
        put('room', say('wander_avoided', { m: MONSTERS[ids[0]].plural }));
        return 'none';
      }
      put('fight', say('wander_failed', { m: MONSTERS[ids[0]].plural }));
      return fight(ids, z, { ambushed: true, wanderer: true });
    }
    put('fight', say('wander_fight', { m: MONSTERS[ids[0]].plural }));
    return fight(ids, z, { wanderer: true });
  };

  const trap = (z: ZoneId) => {
    const k = pick(r, ZONES[z].traps);
    const scale = (1 + (ZONES[z].depth - 1) * 0.3) * threatScale;
    if (chance(r, spotChance())) {
      const spotter = standing().find((a) => a.prof === 'infiltrator') ?? standing().find((a) => a.prof === 'scout') ?? pick(r, standing());
      if (spotter.prof === 'infiltrator' && chance(r, 0.85)) {
        put('trap', say(`trap_${k}_disarm`, { a: spotter.name }), { note: 'no tools needed' });
        return;
      }
      if (pack.tools > 0) {
        pack.tools -= 1;
        if (chance(r, 0.8 + (hasProf('scout') ? 0.15 : 0))) {
          put('trap', say(`trap_${k}_disarm`, { a: spotter.name }), { note: '1 tools' });
          return;
        }
        put('trap', say('trap_disarm_fail', { a: spotter.name }));
      } else {
        sinceMeal += 2;
        put('trap', say(`trap_${k}_around`, { a: spotter.name }), { note: 'no tools: the long way' });
        return;
      }
    } else put('trap', say('trap_unseen', {}));
    const victims = k === 'gas' ? standing() : k === 'grate' || k === 'collapse' ? standing().slice(0, 2) : [pick(r, standing())];
    for (const v of victims) {
      const dmg = Math.round(randInt(r, k === 'gas' ? 3 : 5, k === 'gas' ? 5 : 9) * scale);
      v.hp -= dmg;
      put('trap', say(`trap_${k}_hit`, { a: v.name }), { note: `${dmg}` });
      if (k === 'gas') expose(v, T.exposure.gas);
      if (v.hp <= 0) goDown(v, -v.hp, k === 'gas' ? 'bad air' : k === 'collapse' ? 'a fall of rock' : k === 'bog' ? 'the bog' : 'a trap');
    }
    tireAll(T.fatigue.trap + (k === 'bog' ? 4 : 0));
  };

  const find = (z: ZoneId, big = false, want?: GoodId) => {
    const zd = ZONES[z];
    const f = (want && zd.finds.find((x) => x.good === want)) || weighted(r, zd.finds.map((x) => ({ item: x, weight: x.weight })));
    let n = randInt(r, f.min, f.max) + (big ? 2 : 0);
    if (chance(r, Math.min(0.9, findsBonus()))) n += 1;
    if (rivalZone === z) n -= 1;
    if (n <= 0) {
      put('find', say('find_picked', {}));
      return;
    }
    addLoot(f.good, n);
    put('find', say(big ? `goal_${zd.id}` : `find_${zd.id}`, { a: pick(r, standing())?.name, g: goodName(f.good, n) }), { note: goodName(f.good, n) });
    if (big) crownsFound += randInt(r, 10, 20) * zd.depth;
  };

  const curio = (z: ZoneId) => {
    const c = pick(r, ZONES[z].curios);
    const who = pick(r, standing());
    switch (c) {
      case 'shrine':
        if (hasProf('chaplain')) {
          put('find', say('shrine_chaplain', { a: standing().find((a) => a.prof === 'chaplain')!.name }), { note: '−10 fatigue each' });
          tireAll(-10);
        } else {
          put('room', say('shrine_pass', { a: who.name }), { note: '−4 fatigue each' });
          tireAll(-4);
        }
        return;
      case 'strongbox': {
        const pickLock = standing().find((a) => a.prof === 'infiltrator');
        if (pickLock || pack.tools > 0) {
          if (!pickLock) pack.tools -= 1;
          const pellam = site.id === 'pellam';
          if (pellam) addLoot('seal', 1);
          addLoot('coin', pellam ? 2 : 3);
          put('find', say(pickLock ? 'strongbox_pick' : 'strongbox_open', { a: (pickLock ?? who).name }), { note: pellam ? 'an Assay seal, 2 purses of coin' : '3 purses of coin' });
        } else if (chance(r, 0.5)) {
          addLoot('coin', 1);
          put('find', say('strongbox_smash', { a: who.name }), { note: 'a purse of coin' });
        } else put('find', say('strongbox_ruin', { a: who.name }));
        return;
      }
      case 'grubber_cache':
        if (hasProf('scout') || chance(r, 0.4)) {
          addLoot('coin', 2);
          pack.food += 1;
          put('find', say('cache', { a: who.name }), { note: '2 purses of coin, 1 food' });
        } else put('room', say('cache_missed', {}));
        return;
      case 'cart':
        if (pack.tools > 0) {
          pack.tools -= 1;
          addLoot('silver', 2);
          put('find', say('cart_tools', { a: who.name }), { note: '2 × Pellam silver' });
        } else if (chance(r, 0.4)) {
          const dmg = randInt(r, 5, 8);
          who.hp -= dmg;
          put('trap', say('cart_bitten', { a: who.name }), { note: `${dmg}` });
          if (who.hp <= 0) goDown(who, -who.hp, 'something in a drowned cart');
        } else {
          addLoot('silver', 1);
          put('find', say('cart_reach', { a: who.name }), { note: 'a piece of Pellam silver' });
        }
        return;
      case 'still': {
        const arc = standing().find((a) => a.prof === 'arcanist');
        if (arc) {
          pack.reagents += 2;
          put('find', say('still_arcanist', { a: arc.name }), { note: '+2 reagents' });
        } else if (who.marks.some((m) => m.stillSafe) || chance(r, 0.5)) {
          heal(who, 6);
          tire(who, -8);
          put('find', say('still_good', { a: who.name }));
        } else {
          who.hp -= 5;
          expose(who, T.exposure.stillBad);
          put('trap', say('still_bad', { a: who.name }), { note: '5' });
          if (who.hp <= 0) goDown(who, -who.hp, 'a college still');
        }
        return;
      }
    }
  };

  const shouldRetreat = (): boolean => {
    const dead = A.filter((a) => a.state === 'dead').length;
    const live = standing();
    const hurt = live.filter((a) => a.hp < a.maxHp * 0.35).length;
    const spent = live.filter((a) => a.fatigue >= T.fatigue.spent && a.hp >= a.maxHp * 0.35).length;
    const out = live.filter((a) => a.fatigue >= 100).length;
    if (!live.length) return true;
    if (O.retreat === 'cautious') return dead > 0 || hurt > 0 || spent > 0;
    if (O.retreat === 'steady') return dead > 0 || hurt + spent >= 2;
    return dead >= 2 || dead + hurt + out >= 3;
  };

  // ---- the expedition ----
  // the road out: a day or a week of walking, and whatever happened at the door
  for (let w = 1; w <= setup.roadOut; w++) {
    week = w;
    if (w === 1) for (const l of setup.fieldLog) put('road', l);
    put('road', say(w === 1 ? 'road_out' : 'road_on', { a: pick(r, A).name, p: site.name }));
    tireAll(T.fatigue.road);
  }
  week = setup.roadOut + 1;
  if (!setup.roadOut) for (const l of setup.fieldLog) put('road', l);
  put('room', say(`setout_${setup.length}`, { a: A[0].name, b: A[A.length - 1].name, p: site.name }));
  if (setup.rivalAhead) put('room', say(setup.rivalAhead === 'hobbs' && chance(r, 0.5) ? 'rival_ahead_hobbs' : 'rival_ahead', {}));
  let i = 0;
  for (; i < route.length; i++) {
    const room = route[i];
    const z = room.zone;
    week = weekOfRoom(i);
    roomNo = i;
    if (z !== zone) {
      zone = z;
      if (ZONE_ORDER.indexOf(z) > ZONE_ORDER.indexOf(deepest)) deepest = z;
      put('zone', say(`enter_${z}`, {}), { big: true });
      if (darkZone(z) && pack.oil > 0) put('supply', say('lamps_lit', {}));
      if (z === 'sink') {
        const n = Math.min(pack.masks, standing().length);
        standing()
          .slice(0, n)
          .forEach((a) => (a.masked = true));
        pack.masks -= n;
        put('supply', say(n === 0 ? 'masks_none' : n < standing().length ? 'masks_some' : 'masks_all', {}), n ? { note: `${n} mask${n === 1 ? '' : 's'}` } : {});
      }
    }
    if (i > 0 && room.kind !== 'camp' && room.kind !== 'boss') {
      const p = T.wander.base + ZONES[z].depth * T.wander.perDepth + standing().filter((a) => a.fatigue >= 100).length * 0.08 + (dark ? T.wander.dark : 0) + (rivalZone === z ? T.wander.rivalAhead : 0);
      if (wander(z, p) === 'lost') {
        outcome = 'lost';
        break;
      }
    }
    let res: 'won' | 'lost' = 'won';
    switch (room.kind) {
      case 'passage':
        put('room', say(`passage_${z}`, { a: pick(r, standing()).name }));
        if (hasProf('scout') && chance(r, 0.2)) {
          const g: GoodId = ZONES[z].scoutFind;
          addLoot(g, 1);
          put('find', say('scout_cache', { a: standing().find((a) => a.prof === 'scout')!.name, g: GOODS[g].one }), { note: GOODS[g].one });
        }
        break;
      case 'fight':
        res = fight(freshGroup(z) ?? fightGroup(z), z);
        break;
      case 'trap':
        trap(z);
        break;
      case 'find':
        put('room', say(`room_${z}`, {}));
        find(z);
        break;
      case 'curio':
        curio(z);
        break;
      case 'camp':
        res = camp(z, true);
        break;
      case 'goal': {
        // the place the job points to holds what the job is about
        const g = setup.goal;
        put('room', say(`goalroom_${z}`, {}));
        const group = g.kind === 'kill' && g.monster !== 'kiln' ? [g.monster, ...fightGroup(z).filter((x) => x !== g.monster)].slice(0, g.monster === 'rats' ? 3 : 2) : fightGroup(z);
        if (g.kind === 'kill' && g.monster === 'rats') group.splice(0, group.length, 'rats', 'rats', 'rats');
        res = fight(group, z);
        if (res === 'won') find(z, true, g.kind === 'bring' ? g.good : undefined);
        break;
      }
      case 'boss':
        if (setup.kilnBroken) {
          // the Kiln Engine is gone; its yard is still busy
          put('room', say('kiln_yard', {}));
          res = fight(['engine', 'engine', 'seep'], 'sink');
        } else res = fight(['kiln', 'seep'], 'sink', { boss: true });
        if (res === 'won') find('sink', true);
        break;
    }
    if (res === 'lost' || !standing().length) {
      outcome = 'lost';
      break;
    }
    // anyone knocked down by a trap or a curio gets up once the room is behind them
    standUp();
    cleared += 1;
    for (const a of standing()) a.xp += T.xp.room;
    if (i === route.length - 1) break;
    upkeep(route[i + 1].zone);
    if (!standing().length) {
      outcome = 'lost';
      break;
    }
    if (O.camp === 'hurt' && route[i + 1].kind !== 'camp' && sinceCamp >= 3 && pack.food > 0) {
      const avg = standing().reduce((s, a) => s + a.hp / a.maxHp, 0) / standing().length;
      if (avg < 0.5) {
        if (camp(route[i + 1].zone, false) === 'lost') {
          outcome = 'lost';
          break;
        }
      }
    }
    if (shouldRetreat()) {
      outcome = 'retreated';
      put('retreat', say(`retreat_${O.retreat}`, { a: standing()[0]?.name }), { big: true });
      break;
    }
  }

  // ---- the way home ----
  roomNo = undefined;
  if (outcome === 'lost') {
    const survivors: Actor[] = [];
    for (const a of A.filter((x) => x.state === 'down')) {
      if (chance(r, T.death.wipe)) {
        a.state = 'dead';
        a.died = a.died ?? `left behind in ${site.name}`;
        put('death', say('wipe_death', { a: a.name, p: site.name }), { big: true });
      } else {
        a.state = 'ok';
        a.hp = 1;
        a.gotUp = true;
        survivors.push(a);
      }
    }
    for (const k of Object.keys(loot)) delete loot[k as GoodId];
    crownsFound = 0;
    put('end', say(survivors.length ? 'lost_crawl' : 'lost_all', { a: survivors[0]?.name, p: site.name }), { big: true });
  } else {
    const z = zone ?? firstZone;
    const p = 0.06 + ZONES[z].depth * 0.04 + (dark ? 0.08 : 0);
    put('room', say(outcome === 'complete' ? 'climb_back' : 'turn_back', { p: site.name }));
    const res = wander(z, p + standing().filter((a) => a.fatigue >= 100).length * 0.08);
    if (res === 'lost') {
      for (const a of A.filter((x) => x.state === 'down')) {
        if (chance(r, T.death.wipe)) {
          a.state = 'dead';
          a.died = 'on the way home';
          put('death', say('wipe_death', { a: a.name, p: site.name }), { big: true });
        } else {
          a.state = 'ok';
          a.hp = 1;
        }
      }
      for (const k of Object.keys(loot)) delete loot[k as GoodId];
      crownsFound = 0;
      outcome = 'lost';
      put('end', say('lost_home', { p: site.name }), { big: true });
    } else if (!setup.roadBack) {
      put('end', say(outcome === 'complete' ? `home_${setup.length}` : 'home_retreat', { p: site.name }), { big: true });
    }
  }
  // the road home, for anyone left to walk it
  if (setup.roadBack && A.some((a) => a.state !== 'dead')) {
    for (let w = 1; w <= setup.roadBack; w++) {
      week += 1;
      const last = w === setup.roadBack;
      put(last ? 'end' : 'road', say(last ? (outcome === 'complete' ? 'road_home' : outcome === 'lost' ? 'road_home_lost' : 'home_retreat') : 'road_back', { a: pick(r, A.filter((x) => x.state !== 'dead')).name, p: site.name }), { big: last });
    }
  }

  // ---- deeds, renown and what the members bring home ----
  const L = LENGTHS[setup.length];
  if (outcome === 'complete') renownDeeds.push({ text: `Completed a ${L.name.toLowerCase()} expedition`, renown: L.renown });
  if (A.some((a) => a.bossKill)) renownDeeds.push({ text: 'Broke the Kiln Engine', renown: T.renown.boss });
  if (wanderersWon) renownDeeds.push({ text: `Fought off ${wanderersWon === 1 ? 'a wandering pack' : `${wanderersWon} wandering packs`}`, renown: wanderersWon * T.renown.wanderer });
  const carriedHome = A.filter((a) => a.gotUp && a.state !== 'dead').length;
  if (outcome !== 'lost' && carriedHome) renownDeeds.push({ text: `Brought ${carriedHome === 1 ? 'a fallen member' : `${carriedHome} fallen members`} home`, renown: carriedHome * T.renown.carried });
  if (setup.site === 'pellam' && setup.length === 'long' && outcome === 'complete' && A.every((a) => a.state !== 'dead')) renownDeeds.push({ text: 'Came back from the Sink with nobody lost', renown: T.renown.nobodyFell });
  if (kills.rioter) renownDeeds.push({ text: `Hurt ${kills.rioter === 1 ? 'a rioter' : `${kills.rioter} rioters`} in the street`, renown: -kills.rioter });
  if (parleys >= 2) renownDeeds.push({ text: `Talked their way past ${parleys} fights`, renown: 1 });

  const habitChance = (a: Actor): string | undefined => {
    if (a.d.habits.length >= 3) return undefined;
    const free = (ids: string[]) => ids.filter((h) => !a.d.habits.includes(h));
    if (a.wasSpent && chance(r, 0.4)) return pick(r, free(BAD_HABITS));
    if (a.sawDeath && chance(r, 0.25)) return pick(r, free(BAD_HABITS));
    if ((a.kills >= 4 || a.bossKill || a.gotUp) && chance(r, 0.3)) return pick(r, free(GOOD_HABITS));
    return undefined;
  };
  const members: DelverOutcome[] = A.map((a) => {
    if (a.state !== 'dead') {
      if (a.bossKill) {
        a.deeds.push('broke the Kiln Engine');
        a.fame += 5;
      }
      if (a.kills >= 4) {
        a.deeds.push(`killed ${a.kills} things on one trip`);
        a.fame += 2;
      }
      if (a.gotUp) {
        a.deeds.push(`got up again in ${ZONES[deepest].name}`);
        a.fame += 1;
      }
      if (a.healed >= 30) {
        a.deeds.push('kept the squad on its feet');
        a.fame += 2;
      }
      if (a.covers >= 2) {
        a.deeds.push('stood in front of the others');
        a.fame += 2;
      }
    }
    const h = a.state !== 'dead' ? habitChance(a) : undefined;
    return {
      id: a.d.id,
      hp: Math.max(0, Math.round(a.hp)),
      maxHp: a.maxHp,
      fatigue: Math.round(a.fatigue),
      exposure: Math.round(a.exposure),
      changes: a.newChanges,
      fever: a.state !== 'dead' ? a.fever?.change : undefined,
      xp: a.state === 'dead' ? 0 : a.xp + (outcome === 'complete' ? L.xp : 0),
      died: a.state === 'dead' ? (a.died ?? site.name) : undefined,
      scars: a.newScars,
      habits: h ? [h] : [],
      kills: a.kills,
      deeds: a.deeds,
      fame: a.fame,
      wentDown: a.wentDown,
      draughtsUsed: a.d.gear.consumables.filter((c) => c.draught).length - a.draughts,
    };
  });

  const lootValue = (Object.keys(loot) as GoodId[]).reduce((t, g) => t + (loot[g] ?? 0) * GOODS[g].value, 0);
  const used: Partial<Record<SupplyId, number>> = {};
  for (const k of Object.keys(packed) as SupplyId[]) {
    const u = (packed[k] ?? 0) - (pack[k] ?? 0);
    if (u > 0) used[k] = u;
  }
  // where each line falls inside its week, so several squads' weeks can be interleaved
  const perWeek: Record<number, number> = {};
  for (const l of log) perWeek[l.week] = (perWeek[l.week] ?? 0) + 1;
  const seen: Record<number, number> = {};
  for (const l of log) {
    const n = (seen[l.week] = (seen[l.week] ?? 0) + 1);
    l.t = Math.round(((n - 0.5) / perWeek[l.week]) * 1000) / 1000;
  }
  const g = setup.goal;
  const goalMet =
    outcome !== 'lost' &&
    (g.kind === 'complete'
      ? outcome === 'complete'
      : g.kind === 'reach'
        ? ZONE_ORDER.indexOf(deepest) >= ZONE_ORDER.indexOf(g.zone) && cleared > route.findIndex((x) => x.zone === g.zone)
        : g.kind === 'bring'
          ? (loot[g.good] ?? 0) >= g.count
          : (kills[g.monster] ?? 0) >= g.count);
  return {
    seed: setup.seed,
    squad: A.map((a) => a.d.id),
    names: A.map((a) => a.d.name),
    outcome,
    deepest,
    roomsCleared: cleared,
    roomsPlanned: route.length,
    weeks: log.length ? log[log.length - 1].week : 1,
    log,
    loot,
    lootValue,
    crownsFound,
    leftover: outcome === 'lost' && A.every((a) => a.state === 'dead') ? {} : { ...pack },
    used,
    members,
    kills,
    renown: renownDeeds.reduce((t, d) => t + d.renown, 0),
    deeds: renownDeeds.map((d) => `${d.text} (${d.renown > 0 ? '+' : ''}${d.renown} renown)`),
    goalMet,
  };
}

function elName(el?: Element) {
  return el ?? 'plain';
}

/** The weeks a route takes inside the site. */
export const diveWeeks = (length: keyof typeof LENGTHS) => LENGTHS[length].weeks;
