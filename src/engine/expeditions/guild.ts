// The guild between expeditions: recruiting, gear, supplies, the hall, the
// Weighhouse loan, sponsors, and the week-by-week healing and wages.
// Actions take the state, change it, and return an error message or nothing.
import { FIRST_NAMES, LAST_NAMES } from '../data/traits';
import { chance, pick, randInt, shuffle } from '../core/rng';
import type { RivalId } from '../core/types';
import { DELVER_PROFS, DELVER_PROF_IDS, GEAR, GEAR_IDS, GOODS, HABITS, LENGTHS, SPONSORS, SUPPLIES, SUPPLY_IDS, ZONES, ZONE_ORDER } from './data/content';
import { delverMaxHp, runExpedition } from './dive';
import { EXP_TUNING as T } from './tuning';
import type { Delver, DelverProf, DelverRecruit, ExpeditionResult, ExpGame, ExpLength, ExpPlan, GearDef, GoodId, StandingOrders, SupplyId } from './types';

export const EXP_SAVE_VERSION = 1;

const uidX = (g: ExpGame, p: string) => {
  g.nextId += 1;
  return `${p}${g.nextId}`;
};
const news = (g: ExpGame, text: string, tone?: 'good' | 'bad' | 'warn') => {
  g.news.unshift({ week: g.week, text, tone });
  g.news = g.news.slice(0, 40);
};

export const livingDelvers = (g: ExpGame) => g.members.filter((m) => m.status !== 'dead');
export const gearDef = (g: ExpGame, uid: string | undefined): GearDef | undefined => {
  if (!uid) return undefined;
  const it = g.gear.find((x) => x.uid === uid);
  return it ? GEAR[it.defId] : undefined;
};
export const gearLookup = (g: ExpGame) => (uid: string | undefined) => gearDef(g, uid);

/** Gear in store: owned and not worn by anyone. */
export function storedGear(g: ExpGame) {
  const worn = new Set(livingDelvers(g).flatMap((m) => [m.weapon, m.armor, m.trinket]).filter(Boolean));
  return g.gear.filter((x) => !worn.has(x.uid));
}

function addGear(g: ExpGame, defId: string) {
  const uid = uidX(g, 'g');
  g.gear.push({ uid, defId });
  return uid;
}

export function createDelver(g: ExpGame, prof: DelverProf, quality = 0): Delver {
  const def = DELVER_PROFS[prof];
  const attrs = { ...def.base };
  for (const k of Object.keys(attrs) as (keyof typeof attrs)[]) attrs[k] = Math.max(1, Math.min(10, attrs[k] + randInt(g, -1, 1) + (chance(g, 0.12 + quality * 0.12) ? 1 : 0)));
  const taken = new Set([...livingDelvers(g), ...g.recruits.map((r) => r.delver)].map((m) => m.name.split(' ')[0]));
  let first = pick(g, FIRST_NAMES);
  for (let i = 0; i < 20 && taken.has(first); i++) first = pick(g, FIRST_NAMES);
  const d: Delver = {
    id: uidX(g, 'd'),
    name: `${first} ${pick(g, LAST_NAMES)}`,
    prof,
    attrs,
    level: 1,
    xp: 0,
    hp: 0,
    grit: 70 + randInt(g, 0, 15),
    wage: def.wage,
    scars: [],
    habits: [],
    status: 'ready',
    task: 'rest',
    joinedWeek: g.week,
    dives: 0,
    kills: 0,
    fame: 0,
    deeds: [],
  };
  if (quality >= 2 && chance(g, 0.5)) {
    d.level = 2;
    d.xp = T.xp.levels[1];
    d.attrs[def.main] += 1;
    d.wage += 2;
  }
  d.hp = delverMaxHp(d);
  return d;
}

function equipStarting(g: ExpGame, d: Delver, gear: string[]) {
  for (const id of gear) {
    const uid = addGear(g, id);
    const slot = GEAR[id].slot;
    d[slot] = uid;
  }
}

export function newExpGame(seed = 1 + Math.floor(Math.random() * 2147483000)): ExpGame {
  const g: ExpGame = {
    version: EXP_SAVE_VERSION,
    seed,
    rng: seed,
    week: 1,
    crowns: T.start.crowns,
    renown: 0,
    nextId: 0,
    members: [],
    recruits: [],
    gear: [],
    stock: [],
    stores: { ...T.start.stores },
    goods: {},
    hall: { infirmary: 0, taproom: 0 },
    debt: { lender: 'weighhouse', principal: T.debt.principal, installment: T.debt.installment, dueWeek: 1 + T.debt.every, missed: 0 },
    sponsors: [],
    zonesReached: [],
    expeditions: 0,
    history: [],
    news: [],
  };
  for (const p of DELVER_PROF_IDS) {
    const d = createDelver(g, p);
    equipStarting(g, d, DELVER_PROFS[p].gear);
    g.members.push(d);
  }
  refreshRecruits(g);
  refreshStock(g);
  refreshSponsors(g);
  news(g, 'The guild takes the hall on Tallow Street, and the steps down to Old Pellam are behind the chandler\'s.');
  return g;
}

export function refreshRecruits(g: ExpGame) {
  const quality = g.renown >= 20 ? 2 : g.renown >= 8 ? 1 : 0;
  g.recruits = [];
  for (let i = 0; i < T.recruit.hall; i++) {
    const d = createDelver(g, pick(g, DELVER_PROF_IDS), quality);
    g.recruits.push({ delver: d, signOn: d.wage * T.recruit.signOnWeeks, gear: DELVER_PROFS[d.prof].gear });
  }
}

export function refreshStock(g: ExpGame) {
  const avail = GEAR_IDS.filter((id) => (GEAR[id].minRenown ?? 0) <= g.renown);
  g.stock = shuffle(g, [...avail]).slice(0, 8).sort((a, b) => GEAR_IDS.indexOf(a) - GEAR_IDS.indexOf(b));
}

export function refreshSponsors(g: ExpGame) {
  g.sponsors = g.sponsors.filter((s) => s.expiresWeek > g.week);
  const avail = SPONSORS.filter((s) => s.minRenown <= g.renown && !g.sponsors.some((x) => x.title === s.title));
  while (g.sponsors.length < 2 && avail.length) {
    const s = avail.splice(randInt(g, 0, avail.length - 1), 1)[0];
    g.sponsors.push({ id: uidX(g, 's'), faction: s.faction, title: s.title, text: s.text, goal: s.goal, reward: s.reward, renown: s.renown, expiresWeek: g.week + 4 + randInt(g, 0, 2) });
  }
}

// ---------------------------------------------------------------------------
// Actions at the guild
// ---------------------------------------------------------------------------

export function hireDelver(g: ExpGame, index: number): string | undefined {
  const r: DelverRecruit | undefined = g.recruits[index];
  if (!r) return 'That recruit has gone.';
  if (g.crowns < r.signOn) return `Signing ${r.delver.name.split(' ')[0]} costs ${r.signOn} crowns.`;
  g.crowns -= r.signOn;
  r.delver.joinedWeek = g.week;
  equipStarting(g, r.delver, r.gear);
  g.members.push(r.delver);
  g.recruits.splice(index, 1);
  news(g, `${r.delver.name} signs on as ${/^[AEIOU]/.test(DELVER_PROFS[r.delver.prof].name) ? 'an' : 'a'} ${DELVER_PROFS[r.delver.prof].name}.`);
}

export function dismissDelver(g: ExpGame, id: string): string | undefined {
  const i = g.members.findIndex((m) => m.id === id && m.status !== 'dead');
  if (i < 0) return 'No such member.';
  const d = g.members[i];
  // their gear stays in the store
  g.members.splice(i, 1);
  news(g, `${d.name} collects their wages and leaves the guild.`);
}

export function buyGear(g: ExpGame, defId: string): string | undefined {
  const def = GEAR[defId];
  if (!def || !g.stock.includes(defId)) return 'That is not for sale this week.';
  if (g.crowns < def.price) return `${def.name} costs ${def.price} crowns.`;
  g.crowns -= def.price;
  addGear(g, defId);
}

export function sellGear(g: ExpGame, uid: string): string | undefined {
  if (!storedGear(g).some((x) => x.uid === uid)) return 'Only gear in the store can be sold.';
  const it = g.gear.find((x) => x.uid === uid)!;
  g.crowns += Math.floor(GEAR[it.defId].price / 2);
  g.gear = g.gear.filter((x) => x.uid !== uid);
}

export function equipGear(g: ExpGame, delverId: string, slot: 'weapon' | 'armor' | 'trinket', uid: string | undefined): string | undefined {
  const d = livingDelvers(g).find((m) => m.id === delverId);
  if (!d) return 'No such member.';
  if (uid) {
    const it = g.gear.find((x) => x.uid === uid);
    if (!it || GEAR[it.defId].slot !== slot) return 'That does not go there.';
    // take it off whoever is wearing it
    for (const m of livingDelvers(g)) if (m[slot] === uid) m[slot] = undefined;
  }
  d[slot] = uid;
}

export function buyExpSupplies(g: ExpGame, id: SupplyId, n: number): string | undefined {
  const cost = SUPPLIES[id].price * n;
  if (g.crowns < cost) return `${n} ${SUPPLIES[id].name.toLowerCase()} cost ${cost} crowns.`;
  g.crowns -= cost;
  g.stores[id] += n;
}

export function sellGoods(g: ExpGame, good?: GoodId): number {
  let total = 0;
  for (const k of Object.keys(g.goods) as GoodId[]) {
    if (good && k !== good) continue;
    total += Math.round((g.goods[k] ?? 0) * GOODS[k].value * T.sellRate);
    delete g.goods[k];
  }
  g.crowns += total;
  return total;
}

export function buildHall(g: ExpGame, which: 'infirmary' | 'taproom'): string | undefined {
  if (g.hall[which]) return 'Already built.';
  const cost = T.hall[which];
  if (g.crowns < cost) return `It costs ${cost} crowns.`;
  g.crowns -= cost;
  g.hall[which] = 1;
  news(g, which === 'infirmary' ? 'The back room becomes an infirmary, with beds and a basin.' : 'The cellar becomes a taproom, and the guild drinks its own beer.', 'good');
}

export function payDebt(g: ExpGame, amount: number): string | undefined {
  amount = Math.min(amount, g.debt.principal);
  if (amount <= 0) return 'Nothing is owed.';
  if (g.crowns < amount) return `That needs ${amount} crowns.`;
  g.crowns -= amount;
  g.debt.principal -= amount;
  if (g.debt.principal <= 0) {
    news(g, 'The Weighhouse note is paid in full. Alderman Coster sends a receipt and a short, sour letter.', 'good');
    g.renown += 5;
  }
}

export function setTask(g: ExpGame, id: string, task: Delver['task']) {
  const d = livingDelvers(g).find((m) => m.id === id);
  if (d) d.task = task;
}

// ---------------------------------------------------------------------------
// Planning
// ---------------------------------------------------------------------------

export const slotsFor = (id: SupplyId, n: number) => Math.ceil(n / SUPPLIES[id].perSlot);
export const packSlots = (pack: Partial<Record<SupplyId, number>>) => SUPPLY_IDS.reduce((s, k) => s + slotsFor(k, pack[k] ?? 0), 0);
/** What packing this would cost beyond what's in the stores. */
export function packCost(g: ExpGame, pack: Partial<Record<SupplyId, number>>) {
  return SUPPLY_IDS.reduce((s, k) => s + Math.max(0, (pack[k] ?? 0) - g.stores[k]) * SUPPLIES[k].price, 0);
}

export const DEFAULT_ORDERS: StandingOrders = { retreat: 'steady', healFirst: 'worst', wanderers: 'avoid', camp: 'sites', consumables: 'sparingly' };

/** Why a plan can't go, if it can't. */
export function planBlocked(g: ExpGame, plan: ExpPlan): string | undefined {
  if (plan.squad.length !== 4) return 'An expedition needs four members.';
  const ids = new Set(plan.squad);
  if (ids.size !== 4) return 'Each member can only take one rank.';
  for (const id of plan.squad) {
    const d = livingDelvers(g).find((m) => m.id === id);
    if (!d) return 'One of the squad is no longer with the guild.';
    if (d.hp < 1) return `${d.name.split(' ')[0]} cannot walk yet.`;
  }
  if (packSlots(plan.pack) > T.packSlots) return `The pack holds ${T.packSlots} slots.`;
  const cost = packCost(g, plan.pack);
  if (cost > g.crowns) return `Packing this means buying ${cost} crowns of supplies, and the guild has ${g.crowns}.`;
  if (g.gameOver) return 'The guild is closed.';
}

/** Things worth knowing before setting out. Each is a plain warning, not a block. */
export function planWarnings(g: ExpGame, plan: ExpPlan): string[] {
  const w: string[] = [];
  const L = LENGTHS[plan.length];
  const squad = plan.squad.map((id) => livingDelvers(g).find((m) => m.id === id)).filter(Boolean) as Delver[];
  const meals = Math.floor(L.route.length / T.mealEvery) + L.route.filter((x) => x === 'camp').length;
  // every room after the first burns a flask in the dark, camps included
  const dark = L.route.filter((x, i) => {
    const z = x === 'boss' ? 'sink' : x === 'camp' ? L.route[i - 1] : x;
    return i > 0 && z !== 'camp' && z !== 'boss' && ZONES[z].dark;
  }).length;
  if ((plan.pack.food ?? 0) < meals) w.push(`About ${meals} meals on this route, and ${plan.pack.food ?? 0} packed.`);
  if (dark && (plan.pack.oil ?? 0) < dark) w.push(`About ${dark} dark rooms, and oil for ${plan.pack.oil ?? 0}.`);
  if (!(plan.pack.tools ?? 0)) w.push('No tools: traps and strongboxes will be a problem.');
  if (squad.some((d) => d.prof === 'arcanist') && !(plan.pack.reagents ?? 0)) w.push('No reagents: the Arcanist will cast from their own blood.');
  squad.forEach((d, i) => {
    const ranks = DELVER_PROFS[d.prof].ranks;
    if (!ranks.includes(i + 1)) w.push(`${d.name.split(' ')[0]} is a ${DELVER_PROFS[d.prof].name} in rank ${i + 1}. They work best from rank ${ranks.join(' or ')}.`);
    if (d.hp < delverMaxHp(d) * 0.6) w.push(`${d.name.split(' ')[0]} is still hurt (${d.hp} of ${delverMaxHp(d)} HP).`);
    if (d.grit < 35) w.push(`${d.name.split(' ')[0]} is close to breaking (grit ${d.grit}).`);
  });
  if (!squad.some((d) => d.prof === 'chaplain') && !(plan.pack.bandages ?? 0)) w.push('No Chaplain and no bandages.');
  return w;
}

/** A sensible starting plan: the healthiest squad in sensible ranks, and a pack for the route. */
export function suggestPlan(g: ExpGame, length: ExpLength, orders: StandingOrders = DEFAULT_ORDERS): ExpPlan {
  const alive = livingDelvers(g).filter((d) => d.hp >= 1);
  const score = (d: Delver) => d.hp / delverMaxHp(d) + d.grit / 150 + d.level * 0.1;
  const byProf = (p: DelverProf) => alive.filter((d) => d.prof === p).sort((a, b) => score(b) - score(a));
  const picked: Delver[] = [];
  const want: DelverProf[][] = [['vanguard', 'skirmisher'], ['skirmisher', 'vanguard', 'scout'], ['chaplain', 'marksman', 'scout'], ['arcanist', 'marksman', 'chaplain']];
  for (const opts of want) {
    const d = opts.flatMap((p) => byProf(p)).find((x) => !picked.includes(x));
    if (d) picked.push(d);
  }
  for (const d of alive.sort((a, b) => score(b) - score(a))) if (picked.length < 4 && !picked.includes(d)) picked.push(d);
  // keep the ranks sensible: front-liners first, casters last
  const rankPref: Record<DelverProf, number> = { vanguard: 0, skirmisher: 1, scout: 2, chaplain: 3, marksman: 4, arcanist: 5 };
  picked.sort((a, b) => rankPref[a.prof] - rankPref[b.prof]);
  const L = LENGTHS[length];
  const meals = Math.floor(L.route.length / T.mealEvery) + L.route.filter((x) => x === 'camp').length;
  const dark = L.route.filter((x) => x === 'streets' || x === 'sink' || x === 'boss').length;
  const pack: Partial<Record<SupplyId, number>> = {
    food: meals + 1,
    oil: dark ? dark + 2 : 0,
    bandages: length === 'short' ? 3 : 6,
    tools: length === 'long' ? 4 : 2,
    reagents: picked.some((d) => d.prof === 'arcanist') ? (length === 'long' ? 6 : 3) : 0,
    charms: length === 'short' ? 0 : 2,
    draughts: length === 'long' ? 2 : 1,
  };
  // trim to fit the pack, least important first
  const trim: SupplyId[] = ['charms', 'draughts', 'tools', 'reagents', 'bandages', 'oil', 'food'];
  for (const k of trim) while (packSlots(pack) > T.packSlots && (pack[k] ?? 0) > 0) pack[k] = (pack[k] ?? 0) - 1;
  return { length, squad: picked.map((d) => d.id), pack, orders: { ...orders } };
}

// ---------------------------------------------------------------------------
// Time passing
// ---------------------------------------------------------------------------

const mix = (a: number, b: number) => {
  let h = (a ^ Math.imul(b + 0x9e3779b9, 0x85ebca6b)) | 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) | 0 || 1;
};

/** The seed the next expedition will use. */
export const nextDiveSeed = (g: ExpGame) => mix(g.seed, g.expeditions + 1);

function levelFor(xp: number) {
  let l = 1;
  T.xp.levels.forEach((need, i) => {
    if (xp >= need) l = i + 1;
  });
  return Math.min(5, l);
}

/** One week at the guild. `away` members are down in Pellam and don't rest. */
export function passWeek(g: ExpGame, away: string[] = []) {
  g.week += 1;
  const crew = livingDelvers(g);
  const wages = crew.reduce((s, m) => s + m.wage, 0);
  g.crowns -= wages;
  for (const d of crew) {
    if (away.includes(d.id)) continue;
    const max = delverMaxHp(d);
    const marks = d.habits.map((h) => HABITS[h]).filter(Boolean);
    const homeHeal = marks.reduce((s, m) => s + (m.homeHeal ?? 0), 0);
    const homeGrit = marks.reduce((s, m) => s + (m.homeGrit ?? 0), 0);
    d.hp = Math.min(max, Math.round(d.hp + max * (T.home.heal + (g.hall.infirmary ? T.home.infirmary : 0)) + homeHeal));
    d.hp = Math.max(d.hp, 1);
    let grit = T.home.grit + (g.hall.taproom ? T.home.taproom : 0) + homeGrit;
    if (d.task === 'train') {
      if (g.crowns >= T.home.trainCost) {
        g.crowns -= T.home.trainCost;
        grantXp(g, d, T.home.trainXp);
        grit += T.home.trainGrit;
      } else d.task = 'rest';
    }
    d.grit = Math.min(100, d.grit + grit);
  }
  // the Weighhouse
  if (g.debt.principal > 0 && g.week >= g.debt.dueWeek) {
    const due = Math.min(g.debt.installment, g.debt.principal);
    if (g.crowns >= due) {
      g.crowns -= due;
      g.debt.principal -= due;
      g.debt.missed = 0;
      news(g, `The guild pays the Weighhouse ${due} crowns. ${g.debt.principal > 0 ? `${g.debt.principal} crowns are still owed.` : 'The note is paid off.'}`, g.debt.principal > 0 ? undefined : 'good');
      if (g.debt.principal <= 0) g.renown += 5;
    } else {
      g.debt.missed += 1;
      g.debt.principal += Math.round(due * T.debt.penalty);
      news(g, g.debt.missed >= T.debt.missedToLose ? 'The Weighhouse payment is missed again.' : `The Weighhouse payment of ${due} crowns is missed. Coster adds a fifth to the note and writes to say so.`, 'bad');
    }
    g.debt.dueWeek += T.debt.every;
    if (g.debt.missed >= T.debt.missedToLose) {
      g.gameOver = { week: g.week, text: "Two payments missed. The Weighhouse takes the hall on Tallow Street, and the guild's name goes on a list of bad debts." };
    }
  }
  if (g.week % 2 === 0) refreshRecruits(g);
  refreshStock(g);
  refreshSponsors(g);
  if (chance(g, 0.2)) {
    const rival: RivalId = pick(g, ['hobbs', 'ninth'] as RivalId[]);
    g.rivalAhead = { rival, week: g.week };
    news(g, rival === 'hobbs' ? "Hobb & Daughters have sent a crew down into the Culverts this week." : 'A party from the Ninth went down into the Culverts this week, looking for anything they can sell.', 'warn');
  }
  if (!livingDelvers(g).length && !g.recruits.some((r) => r.signOn <= g.crowns)) {
    g.gameOver = { week: g.week, text: 'There is nobody left to send down, and no money to pay anyone who might go.' };
  }
}

function grantXp(g: ExpGame, d: Delver, xp: number) {
  const before = d.level;
  d.xp += xp;
  const after = levelFor(d.xp);
  if (after > before) {
    for (let l = before; l < after; l++) d.attrs[DELVER_PROFS[d.prof].main] += 1;
    d.level = after;
    d.hp += (after - before) * T.hp.perLevel;
    news(g, `${d.name} reaches level ${after}.`, 'good');
  }
}

/** Rest the whole guild for a week. */
export function restWeek(g: ExpGame): string | undefined {
  if (g.gameOver) return 'The guild is closed.';
  passWeek(g);
}

const EPITHETS: { test: (d: Delver) => boolean; name: (first: string) => string }[] = [
  { test: (d) => d.deeds.some((x) => x.includes('Kiln')), name: (f) => `${f} of the Kiln` },
  { test: (d) => d.deeds.some((x) => x.includes('on its feet')), name: (f) => `${f} the Stitcher` },
  { test: (d) => d.deeds.some((x) => x.includes('in front')), name: (f) => `${f} the Door` },
  { test: (d) => d.deeds.filter((x) => x.includes('got up')).length >= 2, name: (f) => `${f} Twice-Buried` },
  { test: (d) => d.kills >= 12, name: (f) => `Pellam's ${f}` },
  { test: () => true, name: (f) => `${f} of Tallow Street` },
];

/** Set out: buy what the pack needs, play the expedition, and bring home what comes back. */
export function launchExpedition(g: ExpGame, plan: ExpPlan): string | undefined {
  const blocked = planBlocked(g, plan);
  if (blocked) return blocked;
  const cost = packCost(g, plan.pack);
  g.crowns -= cost;
  for (const k of SUPPLY_IDS) {
    const want = plan.pack[k] ?? 0;
    g.stores[k] = Math.max(0, g.stores[k] - want);
  }
  const squad = plan.squad.map((id) => livingDelvers(g).find((m) => m.id === id)!);
  const rivalAhead = !!g.rivalAhead && g.rivalAhead.week === g.week;
  const seed = nextDiveSeed(g);
  const result = runExpedition(squad, plan, { seed, rivalAhead, gear: gearLookup(g) });
  g.expeditions += 1;
  g.lastPlan = JSON.parse(JSON.stringify(plan));
  const L = LENGTHS[plan.length];
  for (let w = 0; w < L.weeks; w++) passWeek(g, plan.squad);
  applyResult(g, result);
  return undefined;
}

export function applyResult(g: ExpGame, res: ExpeditionResult) {
  const dead: string[] = [];
  for (const o of res.members) {
    const d = g.members.find((m) => m.id === o.id);
    if (!d) continue;
    d.dives += 1;
    d.kills += o.kills;
    if (o.died) {
      d.status = 'dead';
      d.hp = 0;
      d.diedWeek = g.week;
      d.causeOfDeath = o.died;
      dead.push(d.name);
      // their gear goes back in the store
      continue;
    }
    d.hp = Math.max(1, o.hp);
    d.grit = o.grit;
    d.scars.push(...o.scars);
    d.habits.push(...o.habits);
    d.deeds.push(...o.deeds);
    d.fame += o.fame;
    d.hp = Math.min(d.hp, delverMaxHp(d));
    grantXp(g, d, o.xp);
    if (!d.epithet && d.fame >= T.fame.epithet) {
      d.epithet = EPITHETS.find((e) => e.test(d))!.name(d.name.split(' ')[0]);
      news(g, `The Lower Town has started calling ${d.name} "${d.epithet}".`, 'good');
      g.renown += 2;
    }
  }
  // the dead keep nothing: their gear comes home on the others' backs
  for (const m of g.members.filter((x) => x.status === 'dead')) {
    m.weapon = undefined;
    m.armor = undefined;
    m.trinket = undefined;
  }
  for (const k of SUPPLY_IDS) g.stores[k] += res.leftover[k] ?? 0;
  const loot = { ...res.loot };
  // the sponsor
  if (res.plan.sponsorId) {
    const s = g.sponsors.find((x) => x.id === res.plan.sponsorId);
    if (s && res.outcome !== 'lost') {
      const goal = s.goal;
      const met =
        goal.kind === 'reach'
          ? ZONE_ORDER.indexOf(res.deepest) >= ZONE_ORDER.indexOf(goal.zone)
          : goal.kind === 'bring'
            ? (loot[goal.good] ?? 0) >= goal.count
            : (res.kills[goal.monster] ?? 0) >= goal.count;
      if (met) {
        if (goal.kind === 'bring') loot[goal.good] = (loot[goal.good] ?? 0) - goal.count;
        g.crowns += s.reward;
        g.renown += s.renown;
        g.sponsors = g.sponsors.filter((x) => x !== s);
        res.sponsorMet = true;
        news(g, `${s.title}: done. The sponsor pays ${s.reward} crowns.`, 'good');
      } else {
        res.sponsorMet = false;
      }
    }
  }
  for (const k of Object.keys(loot) as GoodId[]) if ((loot[k] ?? 0) > 0) g.goods[k] = (g.goods[k] ?? 0) + (loot[k] ?? 0);
  g.crowns += res.crownsFound;
  g.renown += res.renown;
  for (const z of ZONE_ORDER.slice(0, ZONE_ORDER.indexOf(res.deepest) + 1)) {
    if (!g.zonesReached.includes(z)) {
      g.zonesReached.push(z);
      const bonus = T.renown.zoneFirst[z];
      if (bonus) {
        g.renown += bonus;
        res.deeds.push(`First to reach ${z === 'streets' ? 'the Buried Streets' : 'the College Sink'} (+${bonus} renown)`);
      }
    }
  }
  g.last = res;
  g.history.push({ n: g.expeditions, week: g.week, length: res.plan.length, outcome: res.outcome, deepest: res.deepest, lootValue: res.lootValue, dead, renown: res.renown });
  const verdict = res.outcome === 'complete' ? 'came back with the job done' : res.outcome === 'retreated' ? 'turned back early' : 'was lost';
  news(g, `The ${LENGTHS[res.plan.length].name.toLowerCase()} expedition ${verdict}.${dead.length ? ` ${dead.join(' and ')} did not come home.` : ''}`, res.outcome === 'lost' || dead.length ? 'bad' : res.outcome === 'complete' ? 'good' : 'warn');
}

// ---------------------------------------------------------------------------
// Saves
// ---------------------------------------------------------------------------

/** Upgrade an older trial save in place. Returns null if it can't be used. */
export function migrateExpSave(g: ExpGame | null | undefined): ExpGame | null {
  if (!g || typeof g !== 'object' || typeof g.week !== 'number' || !Array.isArray(g.members)) return null;
  // v1 is the first trial save. Later shapes add a step here, as core/save.ts does.
  return g.version === EXP_SAVE_VERSION ? g : null;
}
