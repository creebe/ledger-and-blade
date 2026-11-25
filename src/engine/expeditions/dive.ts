// The expedition simulation: builds a route through Old Pellam from a seed
// and plays it out against the plan. Pure and deterministic: the same seed,
// squad and plan always give the same log. No React, no Math.random.
import { chance, nextFloat, pick, randInt, shuffle, weighted } from '../core/rng';
import type { DamageType, Element } from '../core/types';
import { GEAR, GOODS, HABITS, LENGTHS, MONSTERS, SCARS, ZONES, BAD_HABITS, GOOD_HABITS, type MarkDef, type MonsterDef } from './data/content';
import { LINES } from './data/lines';
import { EXP_TUNING as T } from './tuning';
import type {
  Delver,
  DelverOutcome,
  EnemySnap,
  ExpeditionResult,
  ExpPlan,
  GearDef,
  GoodId,
  LogKind,
  LogLine,
  MonsterId,
  SquadSnap,
  SupplyId,
  ZoneId,
} from './types';

type Rng = { rng: number };

interface Actor {
  d: Delver;
  name: string;
  prof: Delver['prof'];
  maxHp: number;
  hp: number;
  grit: number;
  acc: number;
  dodge: number;
  prot: number;
  speed: number;
  crit: number;
  weapon?: GearDef;
  trinket?: GearDef;
  marks: MarkDef[];
  state: 'ok' | 'down' | 'dead';
  shaken: boolean;
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
  wasShaken: boolean;
  sawDeath: boolean;
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
}

type Room =
  | { kind: 'passage' | 'fight' | 'trap' | 'find' | 'curio'; zone: ZoneId }
  | { kind: 'camp'; zone: ZoneId }
  | { kind: 'boss'; zone: ZoneId }
  | { kind: 'goal'; zone: ZoneId };

export interface DiveContext {
  seed: number;
  /** a rival has been through the Culverts this week */
  rivalAhead?: boolean;
  gear: (uid: string | undefined) => GearDef | undefined;
}

const mark = (d: Delver): MarkDef[] => [...d.scars.map((s) => SCARS[s]), ...d.habits.map((h) => HABITS[h])].filter(Boolean);
const sum = (ms: MarkDef[], k: keyof MarkDef) => ms.reduce((s, m) => s + ((m[k] as number | undefined) ?? 0), 0);

/** Max HP for a member, scars included. */
export function delverMaxHp(d: Delver): number {
  return Math.max(8, T.hp.base + d.attrs.might * T.hp.perMight + (d.level - 1) * T.hp.perLevel + sum(mark(d), 'maxHp'));
}

/** The numbers a member fights with, from attributes, gear, scars and habits. */
export function delverStats(d: Delver, gear: DiveContext['gear']) {
  const ms = mark(d);
  const armor = gear(d.armor);
  const trinket = gear(d.trinket);
  return {
    maxHp: delverMaxHp(d),
    acc: 74 + d.attrs.finesse * 2 + d.level * 2 + (trinket?.acc ?? 0) + sum(ms, 'acc'),
    dodge: Math.max(0, 4 + d.attrs.finesse * 2 - (armor?.bulk ?? 0) + (trinket?.dodge ?? 0) + sum(ms, 'dodge')),
    prot: armor?.protection ?? 0,
    speed: d.attrs.finesse + sum(ms, 'speed'),
    crit: 0.05 + d.attrs.wits * 0.006,
  };
}

/** Plan the rooms of a route. Separate from the play so the route is known up front. */
function buildRoute(r: Rng, plan: ExpPlan, ctx: DiveContext): Room[] {
  const L = LENGTHS[plan.length];
  const rooms: Room[] = [];
  let last = '';
  let run = 0;
  L.route.forEach((step, i) => {
    if (step === 'camp') return rooms.push({ kind: 'camp', zone: (L.route[i - 1] as ZoneId) ?? 'culverts' });
    if (step === 'boss') return rooms.push({ kind: 'boss', zone: 'sink' });
    const z = ZONES[step];
    const isLast = i === L.route.length - 1;
    if (isLast) return rooms.push({ kind: 'goal', zone: step });
    const w = { ...z.rooms };
    if (ctx.rivalAhead && step === 'culverts') w.fight *= 0.5;
    const opts = (Object.keys(w) as (keyof typeof w)[]).map((k) => ({ item: k, weight: k === last && run >= 1 ? w[k] * 0.3 : w[k] }));
    // the first room of the trip is never a trap
    const kind = i === 0 ? weighted(r, opts.filter((o) => o.item !== 'trap')) : weighted(r, opts);
    run = kind === last ? run + 1 : 0;
    last = kind;
    rooms.push({ kind, zone: step });
  });
  return rooms;
}

export function runExpedition(squad: Delver[], plan: ExpPlan, ctx: DiveContext): ExpeditionResult {
  const r: Rng = { rng: ctx.seed | 0 || 1 };
  const route = buildRoute(r, plan, ctx);
  const pack: Record<SupplyId, number> = { food: 0, bandages: 0, oil: 0, tools: 0, charms: 0, reagents: 0, draughts: 0, ...plan.pack } as Record<SupplyId, number>;
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
  let deepest: ZoneId = 'culverts';
  let cleared = 0;
  let outcome: ExpeditionResult['outcome'] = 'complete';
  let wanderersWon = 0;
  let foes: Foe[] = [];

  // ---- the squad ----
  const A: Actor[] = squad.map((d) => {
    const s = delverStats(d, ctx.gear);
    return {
      d,
      name: d.name.split(' ')[0],
      prof: d.prof,
      maxHp: s.maxHp,
      hp: Math.min(d.hp, s.maxHp),
      grit: d.grit,
      acc: s.acc,
      dodge: s.dodge,
      prot: s.prot,
      speed: s.speed,
      crit: s.crit,
      weapon: ctx.gear(d.weapon),
      trinket: ctx.gear(d.trinket),
      marks: mark(d),
      state: 'ok',
      shaken: d.grit <= 0,
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
      wasShaken: d.grit <= 0,
      sawDeath: false,
      healed: 0,
      covers: 0,
      bossKill: false,
    };
  });
  const standing = () => A.filter((a) => a.state === 'ok');
  const rankOf = (a: Actor) => standing().indexOf(a) + 1;
  const hasProf = (p: Delver['prof']) => standing().some((a) => a.prof === p);
  const findsBonus = () => standing().reduce((s, a) => s + (a.trinket?.finds ?? 0) + sum(a.marks, 'finds'), 0) + (hasProf('scout') ? 0.15 : 0);

  // ---- narration ----
  const usedLines: Record<string, number> = {};
  const order: Record<string, number[]> = {};
  const fill = (t: string, v: Record<string, string | number | undefined>) => t.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
  /** pick a line for this situation, cycling through its variants before repeating any */
  const say = (key: string, v: Record<string, string | number | undefined> = {}) => {
    const opts = LINES[key];
    if (!opts || !opts.length) return key;
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
    grit: A.map((a) => Math.round(a.grit)),
    state: A.map((a) => (a.state === 'dead' ? 'dead' : a.state === 'down' ? 'down' : a.shaken ? 'shaken' : 'ok')),
  });
  const snapFoes = (): EnemySnap[] | undefined =>
    foes.length ? foes.map((f) => ({ monster: f.def.id, name: f.label, hp: Math.max(0, Math.round(f.hp)), maxHp: f.maxHp })) : undefined;
  const put = (kind: LogKind, text: string, extra: Partial<LogLine> = {}) => {
    log.push({ kind, text, squad: snapSquad(), enemies: snapFoes(), ...extra });
  };

  // ---- grit ----
  const gritChange = (a: Actor, n: number) => {
    if (a.state === 'dead') return;
    if (n < 0) {
      const guard = (a.trinket?.gritGuard ?? 0) - sum(a.marks, 'gritLoss');
      const resolve = 1 - (a.d.attrs.resolve - 5) * 0.06;
      n = Math.min(0, Math.round(n * resolve) + guard);
    }
    const before = a.grit;
    a.grit = Math.max(0, Math.min(100, a.grit + n));
    if (before > 0 && a.grit <= 0 && a.state === 'ok') {
      if (pack.charms > 0) {
        pack.charms -= 1;
        a.grit = T.grit.charm;
        put('grit', say('charm', { a: a.name }), { note: "an Oda's token" });
      } else if (!a.shaken) {
        a.shaken = true;
        a.wasShaken = true;
        put('grit', say('shaken', { a: a.name }), { big: true });
      }
    } else if (a.shaken && a.grit >= 25) {
      a.shaken = false;
      put('grit', say('unshaken', { a: a.name, w: (a.weapon?.name ?? 'weapon').toLowerCase() }));
    }
  };
  const gritAll = (n: number, except?: Actor) => standing().forEach((a) => a !== except && gritChange(a, n));

  // ---- helpers ----
  const zoneScale = (def: MonsterDef, z: ZoneId) => 1 + Math.max(0, ZONES[z].depth - ZONES[def.zone].depth) * T.depthScale;
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
      return { def, label, hp, maxHp: hp, acc: def.acc + (s - 1) * 20, dodge: def.dodge, prot: def.prot, dmg: [Math.round(def.dmg[0] * s * T.foe.dmg), Math.round(def.dmg[1] * s * T.foe.dmg)], speed: def.speed, stunned: false, bleed: 0, pinned: 0, charged: false, turns: 0 };
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
    return Math.max(0.05, Math.min(0.95, 0.2 + (hasProf('scout') ? 0.4 : 0) + best - (dark ? 0.25 : 0)));
  };

  // ---- going down, and dying ----
  const goDown = (a: Actor, overkill: number, cause: string) => {
    if (pack.draughts > 0) {
      pack.draughts -= 1;
      a.hp = Math.round(a.maxHp * 0.35);
      put('heal', say('draught', { a: a.name }), { big: true, note: 'a draught' });
      return;
    }
    a.state = 'down';
    a.wentDown = true;
    a.covering = undefined;
    for (const x of A) if (x.covering === a) x.covering = undefined;
    const p = Math.max(T.death.min, Math.min(T.death.max, T.death.base + (overkill / a.maxHp) * T.death.overkill + (dark ? T.death.dark : 0) - (hasProf('chaplain') ? T.death.chaplain : 0)));
    if (chance(r, p)) {
      a.state = 'dead';
      a.hp = 0;
      a.died = cause;
      put('death', say('death', { a: a.name, m: cause }), { big: true });
      for (const x of standing()) {
        x.sawDeath = true;
        gritChange(x, T.grit.deathAlly);
      }
    } else {
      a.hp = 0;
      put('down', say('down', { a: a.name }), { big: true });
      gritAll(T.grit.downAlly);
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
    put('win', say(`kill_${f.def.id}`, { a: a.name, m: f.label }));
    a.kills += 1;
    a.killsBy[f.def.id] = (a.killsBy[f.def.id] ?? 0) + 1;
    kills[f.def.id] = (kills[f.def.id] ?? 0) + 1;
    if (f.def.id === 'kiln') a.bossKill = true;
    gritChange(a, T.grit.kill);
    if (f.def.coin) crownsFound += f.def.coin + randInt(r, 0, f.def.coin);
    if (f.def.loot && chance(r, f.def.loot.chance)) addLoot(f.def.loot.good, 1);
  };
  /** One blow. Returns true if it landed. */
  const strike = (a: Actor, f: Foe, o: { key: string; power: number; type?: DamageType; el?: Element; accMod?: number; armorPierce?: number; critMod?: number; mult?: number }) => {
    const vs = a.marks.reduce((s, m) => s + (m.accVs?.monster === f.def.id ? m.accVs.acc : 0), 0);
    const hitP = Math.max(0.12, Math.min(0.96, (a.acc + (o.accMod ?? 0) + vs - f.dodge - (dark ? 10 : 0) - (a.shaken ? 25 : 0)) / 100));
    const v = { a: a.name, m: f.label, w: (a.weapon?.name ?? 'bare hands').toLowerCase() };
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
    const weak = multFor(f, o.type, o.el) > 1.01;
    const strong = multFor(f, o.type, o.el) < 0.99;
    put('hit', say(crit ? 'crit' : `${o.key}_hit`, v), { note: `${dmg}${weak ? ', it hates that' : strong ? ', it shrugs' : ''}` });
    if (crit) gritChange(a, T.grit.crit);
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
  const useDose = (n: number) => {
    if (pack.reagents >= n) {
      pack.reagents -= n;
      return true;
    }
    return false;
  };
  const memberTurn = (a: Actor) => {
    const rank = rankOf(a);
    const w = a.weapon;
    if (a.shaken && chance(r, 0.5)) {
      put('grit', say('cower', { a: a.name, w: (a.weapon?.name ?? 'weapon').toLowerCase() }));
      return;
    }
    const { might, finesse, wits, resolve } = a.d.attrs;
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
        const pow = w.power! + Math.floor(wits / 2) + 1;
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
        if (boltOk && useDose(1)) return void strike(a, t, { key: 'spell', power: pow, el, accMod: accMod + 8, mult: 1.1 });
        if (pack.reagents <= 0 && t.hp >= 20 && a.hp > a.maxHp * 0.5) {
          a.hp -= 4;
          put('enemy', say('blood_cast', { a: a.name }), { note: '4 of their own' });
          gritChange(a, -3);
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
          const n = heal(t, T.heal.dress + wits + (a.trinket?.heal ?? 0));
          a.healed += n;
          return put('heal', say(t === a ? 'dress_self' : 'dress', { a: a.name, t: t.name }), { note: `+${n}` });
        }
        const low = standing().filter((x) => x.grit < 35).sort((x, y) => x.grit - y.grit)[0];
        if (low && chance(r, 0.75)) {
          put('grit', say(low === a ? 'steady_self' : 'steady', { a: a.name, t: low.name }), { note: `+${T.grit.steady + resolve} grit` });
          gritChange(low, T.grit.steady + resolve);
          return;
        }
        if (w?.focus && w.element === 'radiant' && pack.reagents > 0 && O.consumables !== 'hoard') {
          const t = pickTarget(liveFoes(), (f) => (multFor(f, undefined, 'radiant') > 1 ? 0.6 : 0));
          if (t && useDose(1)) strike(a, t, { key: 'censer', power: w.power! + Math.floor(wits / 2), el: 'radiant', accMod: 6 });
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
    }
  };

  // ---- foes act ----
  const foeTurn = (f: Foe) => {
    f.turns += 1;
    const live = standing();
    if (!live.length) return;
    const fRank = liveFoes().indexOf(f) + 1;
    const v = (t: Actor) => ({ m: f.label, t: t.name });
    if (f.def.special === 'blast' && f.turns % 4 === 0) {
      put('enemy', say('kiln_blast', { m: f.label }), { big: true });
      for (const t of [...live]) {
        const dmg = Math.max(1, Math.round(randInt(r, 5, 8) - t.prot * 0.3));
        t.hp -= dmg;
        gritChange(t, -3);
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
    const hitP = Math.max(0.1, Math.min(0.95, (f.acc + (dark ? 5 : 0) - t.dodge - (f.pinned > 0 ? 20 : 0)) / 100));
    if (!chance(r, hitP)) {
      put('miss', say(`${f.def.id}_miss`, v(t)));
      return;
    }
    let dmg = randInt(r, f.dmg[0], f.dmg[1]);
    if (f.def.special === 'charge' && !f.charged) {
      f.charged = true;
      dmg = Math.round(dmg * 1.5);
    }
    const crit = chance(r, 0.08);
    dmg = Math.max(1, Math.round((dmg - (crit ? 0 : t.prot * 0.6)) * (crit ? 1.5 : 1)));
    t.hp -= dmg;
    put('enemy', say(crit ? `${f.def.id}_crit` : `${f.def.id}_hit`, v(t)), { note: `${dmg}` });
    if (crit) gritChange(t, -5);
    if (f.def.special === 'poison' && t.hp > 0) t.poison = 2;
    if (f.def.special === 'swarm') gritChange(t, -1);
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
    foes = makeFoes(ids, z);
    const lead = foes[0].def;
    // the first sight of each kind of monster
    const kinds = [...new Set(ids)];
    put('fight', say(o.boss ? 'boss_sight' : `sight_${lead.id}`, { m: foes[0].label, n: foes.length }), { big: !!o.boss });
    const dread = Math.max(...kinds.map((k) => MONSTERS[k].dread));
    if (dread > 0) gritAll(-dread);
    if (kinds.includes('moths') && pack.oil > 0) {
      const n = Math.min(pack.oil, randInt(r, 1, 2));
      pack.oil -= n;
      put('supply', say('moths_oil', {}), { note: `−${n} oil` });
    }
    let ambushed = !!o.ambushed;
    if (kinds.includes('eel') && !ambushed && !chance(r, spotChance())) ambushed = true;
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
    gritAll(T.grit.fightWon);
    if (o.wanderer) wanderersWon += 1;
    // the fallen get up
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
    return 'won';
  };

  // ---- between rooms ----
  const bandageAt = O.consumables === 'freely' ? 0.65 : O.consumables === 'sparingly' ? 0.4 : 0.2;
  const upkeep = (z: ZoneId) => {
    // the deeper they go, the more it wears on them
    gritAll(T.grit.room[z]);
    if (ZONES[z].dark) {
      if (pack.oil > 0) {
        pack.oil -= 1;
        dark = false;
      } else {
        dark = true;
        if (!outOfOilSaid) {
          outOfOilSaid = true;
          put('supply', say(packed.oil > 0 ? 'oil_out' : 'no_oil', {}), { big: true });
        }
        for (const a of standing()) gritChange(a, T.grit.darkRoom - sum(a.marks, 'darkGrit'));
        if (chance(r, 0.35)) put('grit', say('dark_room', { a: pick(r, standing())?.name }));
      }
    }
    sinceMeal += 1;
    sinceCamp += 1;
    if (sinceMeal >= T.mealEvery) {
      sinceMeal = 0;
      if (pack.food > 0) {
        pack.food -= 1;
        put('camp', say('meal', { a: pick(r, standing())?.name }), { note: '1 food' });
        gritAll(T.grit.meal);
      } else {
        put('camp', say('hungry', { a: pick(r, standing())?.name }), { big: true });
        gritAll(T.grit.hungry);
      }
    }
    for (const a of hurtOrder(standing().filter((x) => x.hp < x.maxHp * bandageAt))) {
      if (pack.bandages <= 0) break;
      if (a.hp >= a.maxHp * bandageAt) continue;
      pack.bandages -= 1;
      const chap = standing().find((x) => x.prof === 'chaplain');
      const n = heal(a, T.heal.bandage + (chap ? T.heal.chaplainBandage + (chap.trinket?.heal ?? 0) : 0));
      if (chap) chap.healed += n;
      put('heal', say(chap && chap !== a ? 'bandage_chaplain' : 'bandage', { a: a.name, t: chap?.name }), { note: `+${n}` });
    }
    if (O.consumables === 'freely') {
      for (const a of standing().filter((x) => x.grit < 25)) {
        if (pack.charms <= 0) break;
        pack.charms -= 1;
        put('grit', say('charm_freely', { a: a.name }), { note: `+${T.grit.charm - 10} grit` });
        gritChange(a, T.grit.charm - 10);
      }
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
        const n = heal(a, a.maxHp * (T.camp.heal + (chap ? 0.1 : 0) + sum(a.marks, 'campHeal')));
        void n;
        const mult = a.marks.reduce((s, m) => s * (m.campGrit ?? 1), 1);
        gritChange(a, Math.round((T.camp.grit + (chap ? T.camp.chaplainGrit : 0)) * mult));
      }
      put('camp', say(chap ? 'camp_fed_chaplain' : 'camp_fed', { a: pick(r, standing())?.name }), { note: '1 food' });
    } else {
      for (const a of standing()) heal(a, a.maxHp * T.camp.healHungry);
      gritAll(T.camp.gritHungry);
      put('camp', say('camp_hungry', { a: pick(r, standing())?.name }), { big: true });
    }
    if (chance(r, T.camp.visit + (dark ? 0.1 : 0))) {
      put('fight', say('camp_visit', {}));
      return fight(wandererGroup(z), z, { wanderer: true });
    }
    return 'won';
  };

  const wandererGroup = (z: ZoneId): MonsterId[] => {
    const g = pick(r, ZONES[z].fights);
    return g.slice(0, Math.min(g.length, randInt(r, 1, 2)));
  };

  const wander = (z: ZoneId, prob: number): 'won' | 'lost' | 'none' => {
    if (!chance(r, prob)) return 'none';
    const ids = wandererGroup(z);
    if (O.wanderers === 'avoid') {
      const bulk = standing().reduce((s, a) => s + (ctx.gear(a.d.armor)?.bulk ?? 0), 0);
      const quiet = standing().reduce((s, a) => s + (a.trinket?.dodge ? 0.05 : 0), 0);
      const p = Math.max(0.15, Math.min(0.92, 0.45 + (hasProf('scout') ? 0.25 : 0) + quiet - bulk * 0.012 - (dark ? 0.15 : 0)));
      if (chance(r, p)) {
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
    const kinds = z === 'culverts' ? ['tripwire', 'grate'] : z === 'streets' ? ['floor', 'tripwire', 'gas'] : ['gas', 'floor'];
    const k = pick(r, kinds);
    const scale = 1 + (ZONES[z].depth - 1) * 0.3;
    if (chance(r, spotChance())) {
      const spotter = standing().find((a) => a.prof === 'scout') ?? pick(r, standing());
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
    const victims = k === 'gas' ? standing() : k === 'grate' ? standing().slice(0, 2) : [pick(r, standing())];
    for (const v of victims) {
      const dmg = Math.round(randInt(r, k === 'gas' ? 3 : 5, k === 'gas' ? 5 : 9) * scale);
      v.hp -= dmg;
      put('trap', say(`trap_${k}_hit`, { a: v.name }), { note: `${dmg}` });
      if (v.hp <= 0) goDown(v, -v.hp, k === 'gas' ? 'bad air' : 'a trap');
    }
    gritAll(T.grit.trap);
  };

  const find = (z: ZoneId, big = false) => {
    const zd = ZONES[z];
    const f = weighted(r, zd.finds.map((x) => ({ item: x, weight: x.weight })));
    let n = randInt(r, f.min, f.max) + (big ? 2 : 0);
    if (chance(r, Math.min(0.9, findsBonus()))) n += 1;
    if (ctx.rivalAhead && z === 'culverts') n -= 1;
    if (n <= 0) {
      put('find', say('find_picked', {}));
      return;
    }
    addLoot(f.good, n);
    put('find', say(big ? `goal_${zd.id}` : `find_${zd.id}`, { a: pick(r, standing())?.name, g: goodName(f.good, n) }), { note: goodName(f.good, n) });
    gritAll(T.grit.find);
    if (big) crownsFound += randInt(r, 10, 20) * zd.depth;
  };

  const curio = (z: ZoneId) => {
    const c = pick(r, ZONES[z].curios);
    const who = pick(r, standing());
    switch (c) {
      case 'shrine':
        if (pack.charms > 0 && (O.consumables === 'freely' || standing().some((a) => a.grit < 50))) {
          pack.charms -= 1;
          put('find', say('shrine_charm', { a: who.name }), { note: "1 token, +15 grit each" });
          gritAll(15);
        } else if (hasProf('chaplain')) {
          put('find', say('shrine_chaplain', { a: standing().find((a) => a.prof === 'chaplain')!.name }), { note: '+6 grit each' });
          gritAll(6);
        } else put('room', say('shrine_pass', { a: who.name }));
        return;
      case 'strongbox':
        if (pack.tools > 0) {
          pack.tools -= 1;
          addLoot('seal', 1);
          addLoot('coin', 2);
          put('find', say('strongbox_open', { a: who.name }), { note: 'an Assay seal, 2 purses of coin' });
        } else if (chance(r, 0.5)) {
          addLoot('coin', 1);
          put('find', say('strongbox_smash', { a: who.name }), { note: 'a purse of coin' });
        } else put('find', say('strongbox_ruin', { a: who.name }));
        return;
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
          gritChange(who, -5);
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
        } else if (chance(r, 0.5)) {
          heal(who, 6);
          gritChange(who, 5);
          put('find', say('still_good', { a: who.name }));
        } else {
          who.hp -= 5;
          gritChange(who, -4);
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
    const shaken = live.filter((a) => a.shaken).length;
    if (!live.length) return true;
    if (O.retreat === 'cautious') return dead > 0 || hurt > 0 || shaken > 0;
    if (O.retreat === 'steady') return dead > 0 || hurt >= 2 || shaken >= 2 || hurt + shaken >= 3;
    return dead >= 2 || dead + hurt >= 3;
  };

  // ---- the expedition ----
  put('room', say(`setout_${plan.length}`, { a: A[0].name, b: A[A.length - 1].name }));
  if (ctx.rivalAhead) put('room', say('rival_ahead', {}));
  let i = 0;
  for (; i < route.length; i++) {
    const room = route[i];
    const z = room.zone;
    if (z !== zone) {
      zone = z;
      deepest = z;
      put('zone', say(`enter_${z}`, {}), { big: true });
      if (ZONES[z].dark && pack.oil > 0) put('supply', say('lamps_lit', {}));
    }
    if (i > 0 && room.kind !== 'camp' && room.kind !== 'boss') {
      const p = T.wander.base + ZONES[z].depth * T.wander.perDepth + (dark ? T.wander.dark : 0) + (ctx.rivalAhead && z === 'culverts' ? T.wander.rivalAhead : 0);
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
          const g: GoodId = z === 'culverts' ? 'coin' : z === 'streets' ? 'silver' : 'salts';
          addLoot(g, 1);
          put('find', say('scout_cache', { a: standing().find((a) => a.prof === 'scout')!.name, g: GOODS[g].one }), { note: GOODS[g].one });
        }
        break;
      case 'fight':
        res = fight(pick(r, ZONES[z].fights), z);
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
      case 'goal':
        put('room', say(`goalroom_${z}`, {}));
        res = fight(pick(r, ZONES[z].fights), z);
        if (res === 'won') find(z, true);
        break;
      case 'boss':
        res = fight(['kiln', 'seep'], 'sink', { boss: true });
        if (res === 'won') find('sink', true);
        break;
    }
    if (res === 'lost' || !standing().length) {
      outcome = 'lost';
      break;
    }
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
  if (outcome === 'lost') {
    const survivors: Actor[] = [];
    for (const a of A.filter((x) => x.state === 'down')) {
      if (chance(r, T.death.wipe)) {
        a.state = 'dead';
        a.died = a.died ?? 'left in Old Pellam';
        put('death', say('wipe_death', { a: a.name }), { big: true });
      } else {
        a.state = 'ok';
        a.hp = 1;
        a.gotUp = true;
        survivors.push(a);
      }
    }
    for (const k of Object.keys(loot)) delete loot[k as GoodId];
    crownsFound = 0;
    put('end', say(survivors.length ? 'lost_crawl' : 'lost_all', { a: survivors[0]?.name }), { big: true });
  } else {
    const z = zone ?? 'culverts';
    const p = 0.06 + ZONES[z].depth * 0.04 + (dark ? 0.08 : 0);
    put('room', say(outcome === 'complete' ? 'climb_back' : 'turn_back', {}));
    const res = wander(z, p);
    if (res === 'lost') {
      for (const a of A.filter((x) => x.state === 'down')) {
        if (chance(r, T.death.wipe)) {
          a.state = 'dead';
          a.died = 'on the way home';
        } else {
          a.state = 'ok';
          a.hp = 1;
        }
      }
      for (const k of Object.keys(loot)) delete loot[k as GoodId];
      crownsFound = 0;
      outcome = 'lost';
      put('end', say('lost_home', {}), { big: true });
    } else {
      put('end', say(outcome === 'complete' ? `home_${plan.length}` : 'home_retreat', {}), { big: true });
    }
  }

  // ---- deeds, renown and what the members bring home ----
  const L = LENGTHS[plan.length];
  if (outcome === 'complete') renownDeeds.push({ text: `Completed a ${L.name.toLowerCase()} expedition`, renown: L.renown });
  if (A.some((a) => a.bossKill)) renownDeeds.push({ text: 'Broke the Kiln Engine', renown: T.renown.boss });
  if (wanderersWon) renownDeeds.push({ text: `Fought off ${wanderersWon === 1 ? 'a wandering pack' : `${wanderersWon} wandering packs`}`, renown: wanderersWon * T.renown.wanderer });
  const carried = A.filter((a) => a.gotUp && a.state !== 'dead').length;
  if (outcome !== 'lost' && carried) renownDeeds.push({ text: `Brought ${carried === 1 ? 'a fallen member' : `${carried} fallen members`} home`, renown: carried * T.renown.carried });
  if (plan.length === 'long' && outcome === 'complete' && A.every((a) => a.state !== 'dead')) renownDeeds.push({ text: 'Came back from the Sink with nobody lost', renown: T.renown.nobodyFell });

  const habitChance = (a: Actor): string | undefined => {
    if (a.d.habits.length >= 3) return undefined;
    const free = (ids: string[]) => ids.filter((h) => !a.d.habits.includes(h));
    if (a.wasShaken && chance(r, 0.55)) return pick(r, free(BAD_HABITS));
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
      grit: Math.round(a.grit),
      xp: a.state === 'dead' ? 0 : a.xp + (outcome === 'complete' ? L.xp : 0),
      died: a.state === 'dead' ? (a.died ?? 'Old Pellam') : undefined,
      scars: a.newScars,
      habits: h ? [h] : [],
      kills: a.kills,
      deeds: a.deeds,
      fame: a.fame,
    };
  });

  const lootValue = (Object.keys(loot) as GoodId[]).reduce((s, g) => s + (loot[g] ?? 0) * GOODS[g].value, 0);
  const used: Partial<Record<SupplyId, number>> = {};
  for (const k of Object.keys(packed) as SupplyId[]) {
    const u = (packed[k] ?? 0) - (pack[k] ?? 0);
    if (u > 0) used[k] = u;
  }
  return {
    seed: ctx.seed,
    plan,
    outcome,
    deepest,
    roomsCleared: cleared,
    roomsPlanned: route.length,
    log,
    loot,
    lootValue,
    crownsFound,
    leftover: { ...pack },
    used,
    members,
    kills,
    renown: renownDeeds.reduce((s, d) => s + d.renown, 0),
    deeds: renownDeeds.map((d) => `${d.text} (+${d.renown} renown)`),
  };
}

function elName(el?: Element) {
  return el ?? 'plain';
}

/** For the UI and the bot: the length's planned route, as zone names. */
export function routeSummary(length: ExpPlan['length']) {
  return LENGTHS[length].route;
}

export { GEAR };
