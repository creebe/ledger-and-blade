// Preparing an expedition: the squad and its ranks, the pack and the standing
// orders. Blocks say why a plan can't go; warnings say what will hurt.
import { PROFESSIONS } from '../data/professions';
import { REGIONS } from '../data/factions';
import { level, tripWeeks } from '../economy/buildings';
import { supplyPrice } from '../economy/market';
import type { Contract, GameState, Member } from '../core/types';
import { living } from '../core/util';
import { DELVER_PROFS, GOODS, LENGTHS, MONSTERS, PELLAM_GOALS, SITES, SUPPLIES, SUPPLY_IDS, ZONES, routeOf, type RouteStep } from './data/content';
import { delverMaxHp } from './dive';
import { EXP_TUNING as T } from './tuning';
import type { ExpPlan, PostingInfo, StandingOrders, SupplyId, ZoneId } from './types';

export const DEFAULT_ORDERS: StandingOrders = { retreat: 'steady', healFirst: 'worst', wanderers: 'avoid', camp: 'sites', consumables: 'sparingly' };

export const slotsFor = (id: SupplyId, n: number) => Math.ceil(n / SUPPLIES[id].perSlot);
export const packSlots = (pack: Partial<Record<SupplyId, number>>) => SUPPLY_IDS.reduce((s, k) => s + slotsFor(k, pack[k] ?? 0), 0);

/** How many of a supply the guild has at home. Food is the guild's supplies. */
export const stockOf = (s: GameState, id: SupplyId) => (id === 'food' ? s.supplies : (s.stores?.[id] ?? 0));
/** The price of one more of a supply. */
export const supplyUnitPrice = (s: GameState, id: SupplyId) => (id === 'food' ? supplyPrice(s) : SUPPLIES[id].price);

/** What packing this would cost beyond what's at home. */
export function packCost(s: GameState, pack: Partial<Record<SupplyId, number>>) {
  return Math.ceil(SUPPLY_IDS.reduce((t, k) => t + Math.max(0, (pack[k] ?? 0) - stockOf(s, k)) * supplyUnitPrice(s, k), 0));
}

/** Squads out at once: two, or three with a Muster room. */
export const squadLimit = (s: GameState) => (level(s, 'muster') >= 1 ? T.squadsMuster : T.squads);
/** Squads away now, those still in the yard included. */
export const squadsOut = (s: GameState) => s.missions.filter((m) => !m.report || m.returnWeek > s.week).length;

/** Smallest and largest squad a contract takes, in a dive of at most four ranks. */
export function squadSize(c: Contract): { min: number; max: number } {
  const max = Math.min(4, c.maxSquad);
  return { min: Math.min(c.minSquad, max), max };
}

/** Weeks on the road there and back. */
export function roadWeeks(s: GameState, c: Contract) {
  const travel = REGIONS[SITES[c.expedition.site].region]?.travel ?? 0;
  return tripWeeks(s, travel);
}

/** How long the trip should take, road included, if nothing sends them home early. */
export function plannedWeeks(s: GameState, c: Contract) {
  const r = roadWeeks(s, c);
  return r.out + LENGTHS[c.expedition.length].weeks + r.back;
}

/** The route the contract takes, room by room. */
export const contractRoute = (c: Contract): RouteStep[] => routeOf(c.expedition.site, c.expedition.length);

/** Why this member can't go, if they can't. */
export function memberBlocked(_s: GameState, m: Member): string | undefined {
  const first = m.name.split(' ')[0];
  if (m.status === 'mission') return `${first} is already away.`;
  if (m.status !== 'idle' && m.status !== 'recovering') return `${first} is not with the guild.`;
  if (m.health < 40) return `${first} is too badly hurt to go (health ${m.health}).`;
  if (m.fever) return `${first} is in bed with the Sink fever for ${m.fever.weeks === 1 ? 'another week' : `${m.fever.weeks} more weeks`}.`;
  return undefined;
}

/** Why a plan can't go, if it can't. */
export function planBlocked(s: GameState, c: Contract, plan: ExpPlan): string | undefined {
  if (s.gameOver) return 'The guild is closed.';
  if (!s.board.some((x) => x.id === c.id)) return 'That contract is no longer on the board.';
  const out = squadsOut(s);
  if (out >= squadLimit(s)) return squadLimit(s) < T.squadsMuster ? `${out} squads are already out, and the hall can send no more. A Muster room would let a third go.` : `${out} squads are already out, which is all the hall can send.`;
  const size = squadSize(c);
  if (plan.squad.length < size.min) return `This job needs at least ${size.min} people.`;
  if (plan.squad.length > size.max) return `This job takes at most ${size.max} people.`;
  if (new Set(plan.squad).size !== plan.squad.length) return 'Each member can only take one rank.';
  for (const id of plan.squad) {
    const m = s.members.find((x) => x.id === id);
    if (!m) return 'One of the squad is no longer with the guild.';
    const why = memberBlocked(s, m);
    if (why) return why;
  }
  if (packSlots(plan.pack) > T.packSlots) return `The pack holds ${T.packSlots} slots.`;
  const cost = packCost(s, plan.pack);
  if (cost > 0 && cost > s.crowns) return `Packing this means buying ${cost} crowns of supplies, and the guild has ${s.crowns}.`;
  return undefined;
}

/** The dark rooms on a route (each one burns a flask of oil). */
function darkRooms(steps: RouteStep[], c: Contract) {
  const tagDark = [...c.tags, ...c.hidden.filter((h) => h.revealed).map((h) => h.trueTag)].some((t) => t === 'dark' || t === 'night');
  return steps.filter((x, i) => {
    const z = (x === 'boss' ? 'sink' : x === 'camp' ? steps[i - 1] : x) as ZoneId;
    return i > 0 && x !== 'camp' && (ZONES[z].dark || tagDark);
  }).length;
}

/** Meals a route will want. */
export const routeMeals = (steps: RouteStep[]) => Math.floor(steps.length / T.mealEvery) + steps.filter((x) => x === 'camp').length;

/** Things worth knowing before setting out. Each is a plain warning, not a block. */
export function planWarnings(s: GameState, c: Contract, plan: ExpPlan): string[] {
  const w: string[] = [];
  const steps = contractRoute(c);
  const squad = plan.squad.map((id) => s.members.find((m) => m.id === id)).filter(Boolean) as Member[];
  const meals = routeMeals(steps);
  const dark = darkRooms(steps, c);
  if ((plan.pack.food ?? 0) < meals) w.push(`About ${meals} meals on this route, and ${plan.pack.food ?? 0} packed.`);
  if (dark && (plan.pack.oil ?? 0) < dark) w.push(`About ${dark} dark rooms, and oil for ${plan.pack.oil ?? 0}.`);
  if (!(plan.pack.tools ?? 0) && !squad.some((m) => m.profession === 'infiltrator')) w.push('No tools and no Infiltrator: traps and strongboxes will be a problem.');
  if (squad.some((m) => m.profession === 'arcanist') && !(plan.pack.reagents ?? 0)) w.push('No reagents: the Arcanist will cast from their own blood.');
  squad.forEach((m, i) => {
    const first = m.name.split(' ')[0];
    const ranks = DELVER_PROFS[m.profession].ranks;
    if (!ranks.includes(i + 1)) w.push(`${first} is ${/^[AEIOU]/.test(PROFESSIONS[m.profession].name) ? 'an' : 'a'} ${PROFESSIONS[m.profession].name} in rank ${i + 1}. They work best from rank ${ranks.join(' or ')}.`);
    if (m.health < 60) w.push(`${first} is still hurt (health ${m.health}).`);
    if (m.fatigue >= T.fatigue.tired) w.push(`${first} is ${m.fatigue >= T.fatigue.spent ? 'worn out' : 'tired'} before they start (fatigue ${m.fatigue}).`);
    const nextTh = T.exposure.thresholds.find((t) => t > (m.exposure ?? 0));
    if (nextTh && (m.exposure ?? 0) >= nextTh - 12 && (steps.includes('sink') || steps.includes('reeds')))
      w.push(`${first} is close to a Sink change (Exposure ${m.exposure} of ${nextTh}). Rested, they'll run the Sink fever first; worn out, it takes at once.`);
  });
  if (!squad.some((m) => m.profession === 'chaplain') && !(plan.pack.bandages ?? 0)) w.push('No Chaplain and no bandages.');
  if (steps.includes('sink') && (plan.pack.masks ?? 0) < squad.length) w.push(`The Sink ahead, and ${plan.pack.masks ?? 0} wet masks for ${squad.length} people.`);
  const loan = s.loans[0];
  const weeks = plannedWeeks(s, c);
  if (loan && loan.dueWeek < s.week + weeks) w.push(`A Weighhouse payment of ${loan.paymentDue} falls due while they're away. If the money at home is short, the Weighhouse waits for the squad.`);
  if (c.contestedBy) w.push(`A rival wants this job too. If their crew goes in first, there will be fewer fights at the start and thinner finds.`);
  return w;
}

/** A sensible starting plan: the healthiest squad in sensible ranks, and a pack for the route. */
export function suggestPlan(s: GameState, c: Contract, orders: StandingOrders = s.delve?.lastPlan?.orders ?? DEFAULT_ORDERS): ExpPlan {
  const alive = living(s).filter((m) => !memberBlocked(s, m));
  const score = (m: Member) => m.health / 100 - m.fatigue / 150 - (m.exposure ?? 0) / 300 + m.level * 0.1;
  const byProf = (p: Member['profession']) => alive.filter((m) => m.profession === p).sort((a, b) => score(b) - score(a));
  const size = squadSize(c);
  const picked: Member[] = [];
  const people = c.tags.includes('urban') || ['varrow', 'anselm'].includes(c.expedition.site);
  const want: Member['profession'][][] = [
    ['vanguard', 'skirmisher', 'infiltrator'],
    ['skirmisher', 'vanguard', 'infiltrator', 'scout'],
    people ? ['envoy', 'chaplain', 'marksman', 'scout'] : ['chaplain', 'marksman', 'scout', 'envoy'],
    ['arcanist', 'marksman', 'chaplain', 'scout', 'envoy'],
  ];
  for (const opts of want) {
    if (picked.length >= size.max) break;
    const m = opts.flatMap((p) => byProf(p)).find((x) => !picked.includes(x));
    if (m) picked.push(m);
  }
  for (const m of [...alive].sort((a, b) => score(b) - score(a))) if (picked.length < size.max && !picked.includes(m)) picked.push(m);
  // keep the ranks sensible: front-liners first, casters last
  const rankPref: Record<Member['profession'], number> = { vanguard: 0, skirmisher: 1, infiltrator: 2, scout: 3, chaplain: 4, envoy: 5, marksman: 6, arcanist: 7 };
  picked.sort((a, b) => rankPref[a.profession] - rankPref[b.profession]);
  const steps = contractRoute(c);
  const long = c.expedition.length === 'long';
  const pack: Partial<Record<SupplyId, number>> = {
    food: routeMeals(steps) + 1,
    oil: darkRooms(steps, c) ? darkRooms(steps, c) + 2 : 0,
    bandages: c.expedition.length === 'short' ? 3 : 6,
    tools: picked.some((m) => m.profession === 'infiltrator') ? 0 : long ? 4 : 2,
    reagents: picked.some((m) => m.profession === 'arcanist') ? (long ? 6 : 3) : 0,
    masks: steps.includes('sink') ? Math.min(4, picked.length) : 0,
    draughts: long ? 2 : 1,
  };
  // trim to fit the pack, least important first
  const trim: SupplyId[] = ['masks', 'draughts', 'tools', 'reagents', 'bandages', 'oil', 'food'];
  for (const k of trim) while (packSlots(pack) > T.packSlots && (pack[k] ?? 0) > 0) pack[k] = (pack[k] ?? 0) - 1;
  return { squad: picked.map((m) => m.id), pack, orders: { ...orders } };
}

export { delverMaxHp };

/** What the job asks, in a line: "Bring back 2 Assay seals". */
export function goalText(c: Contract): string {
  const g = c.expedition.goal;
  const site = SITES[c.expedition.site];
  if (g.kind === 'reach') return `Reach ${ZONES[g.zone].name} and come back`;
  if (g.kind === 'bring') return `Bring back ${g.count === 1 ? GOODS[g.good].one : `${g.count} ${GOODS[g.good].many}`}`;
  if (g.kind === 'kill') return g.monster === 'kiln' ? 'Break the Kiln Engine' : `Kill ${g.count === 1 ? `a ${MONSTERS[g.monster].name.toLowerCase()}` : `${g.count} ${MONSTERS[g.monster].plural}`}`;
  if (site.id === 'pellam') return PELLAM_GOALS[c.expedition.length];
  return `See the job through in ${site.name}`;
}

/** A posting as the board shows it. */
export function postingInfo(s: GameState, c: Contract): PostingInfo {
  const site = SITES[c.expedition.site];
  const zones = [...new Set(contractRoute(c).filter((x): x is ZoneId => x !== 'camp' && x !== 'boss'))];
  return { site: site.id, siteName: site.name, zones, length: c.expedition.length, weeks: plannedWeeks(s, c), goal: c.expedition.goal, goalText: goalText(c), patron: c.patron };
}
