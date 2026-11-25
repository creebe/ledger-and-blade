// An expedition's life: dispatched from the board, sealed (simulated in full)
// when it leaves, revealed one week at a time at each End Week, and settled
// when the squad comes home. See docs/EXPEDITIONS-API.md.
import { TEMPLATE_BY_ID } from '../data/contracts';
import { RIVALS } from '../data/factions';
import { removeItem } from '../economy/items';
import { ITEMS } from '../data/items';
import { PROFESSIONS } from '../data/professions';
import { MATERIAL_INFO } from '../economy/market';
import { earnDeedFame, earnFame, mournLegend, squadHas } from '../people/legends';
import { levelUp } from '../missions/missions';
import { triggerDoorScene } from '../story/scenes';
import { addRecord } from '../missions/narrative';
import { raiseFeud, resolveOperation } from '../rivals/war';
import { chance, uid } from '../core/rng';
import type { Approach, Contract, GameState, MaterialId, Member, Mission, MissionReport, OutcomeTier } from '../core/types';
import { addDispatch, clamp, living } from '../core/util';
import { applyContractEffect, applyStanding, earn, factionName, spend, track } from '../core/effects';
import { CHANGES, GOODS, SITES, SUPPLY_IDS, ZONES, ZONE_ORDER } from './data/content';
import { runExpedition } from './dive';
import { delverOf } from './gear';
import { goalText, packCost, planBlocked, plannedWeeks, roadWeeks, stockOf, supplyUnitPrice } from './prep';
import { EXP_TUNING as T } from './tuning';
import type { DiveSetup, ExpeditionResult, ExpPlan, GoodId, LogLine, StoreId, SupplyId } from './types';

const mix = (a: number, b: number) => {
  let h = (a ^ Math.imul(b + 0x9e3779b9, 0x85ebca6b)) | 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) | 0 || 1;
};

const hashId = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) | 0;
  return h;
};

const trueTags = (c: Contract) => [...c.tags, ...c.hidden.map((h) => h.trueTag)];

/** The frozen inputs for a trip, from the squad and the world as they are now. */
export function buildSetup(s: GameState, ms: Mission): DiveSetup {
  const c = ms.contract;
  const road = roadWeeks(s, c);
  const extraDelay = Math.max(0, ms.plannedWeeks - plannedWeeks(s, c));
  return {
    // the seed belongs to the job, so calling a squad off and sending it again doesn't reroll the trip
    seed: ms.setup?.seed ?? mix(s.seed, hashId(c.id)),
    site: c.expedition.site,
    length: c.expedition.length,
    goal: c.expedition.goal,
    tags: [...new Set([...trueTags(c), ...(ms.extraTags ?? [])])],
    threat: c.threat,
    roadOut: road.out + extraDelay,
    roadBack: road.back,
    rivalAhead: c.contestedBy && s.rivals[c.contestedBy]?.active ? c.contestedBy : undefined,
    kilnBroken: s.delve?.kilnBroken,
    foeScale: ms.foeScale ?? 1,
    fieldLog: [...(ms.fieldLog ?? [])],
    plan: JSON.parse(JSON.stringify(ms.plan)) as ExpPlan,
    squad: ms.plan.squad.map((id) => s.members.find((m) => m.id === id)).filter((m): m is Member => !!m && m.status !== 'dead' && m.status !== 'left').map((m) => delverOf(s, m)),
  };
}

const LOG_CACHE = new Map<string, LogLine[]>();
const cacheKey = (setup: DiveSetup) => JSON.stringify(setup);

/** Simulate the trip from the squad and world as they are now. Called at dispatch and again as it leaves. */
export function sealExpedition(s: GameState, ms: Mission) {
  ms.setup = buildSetup(s, ms);
  const full = runExpedition(ms.setup);
  // bounded here too: headless runs (sim, playthroughs) seal thousands of trips and never read a log
  if (LOG_CACHE.size > 40) LOG_CACHE.clear();
  LOG_CACHE.set(cacheKey(ms.setup), full.log);
  ms.result = { ...full, log: [] };
  // until it has left, the real return week stays hidden: an early one would give away a retreat
  ms.returnWeek = ms.sealed ? ms.dispatchedWeek + full.weeks - 1 : ms.dispatchedWeek + ms.plannedWeeks - 1;
}

/** The whole log of a trip, rebuilt from its frozen inputs. Don't show lines past `revealedWeeks()`. */
export function expeditionLog(ms: Pick<Mission, 'setup'>): LogLine[] {
  // a trip carried over from a classic save has no squad to replay: just its road notes
  if (!ms.setup.squad.length) {
    const n = ms.setup.fieldLog.length;
    return ms.setup.fieldLog.map((text, i) => ({ kind: 'road' as const, text, week: 1, t: (i + 0.5) / n, squad: { hp: [], maxHp: [], fatigue: [], exposure: [], state: [] } }));
  }
  const k = cacheKey(ms.setup);
  let log = LOG_CACHE.get(k);
  if (!log) {
    log = runExpedition(ms.setup).log;
    if (LOG_CACHE.size > 40) LOG_CACHE.clear();
    LOG_CACHE.set(k, log);
  }
  return log;
}

/** How many of the trip's weeks the player has seen. 0 while the squad is still in the yard. */
export function revealedWeeks(s: GameState, ms: Mission): number {
  // a squad called off at the door never went: its first simulation is not to be shown
  if (ms.report?.tier === 'Withdrawn') return 0;
  if (ms.report) return ms.result.weeks;
  if (!ms.sealed) return 0;
  return Math.max(0, Math.min(ms.result.weeks, s.week - ms.dispatchedWeek));
}

/** The lines the player may read so far. */
export function visibleLog(s: GameState, ms: Mission): LogLine[] {
  const w = revealedWeeks(s, ms);
  return expeditionLog(ms).filter((l) => l.week <= w);
}

/** One week of a trip (1-based). */
export function weekLines(ms: Mission, tripWeek: number): LogLine[] {
  return expeditionLog(ms).filter((l) => l.week === tripWeek);
}

/** The trip week that the End Week of game week `gameWeek` reveals for this squad (0 if none). */
export const tripWeekOf = (ms: Mission, gameWeek: number) => {
  if (ms.report?.tier === 'Withdrawn') return 0;
  const w = gameWeek - ms.dispatchedWeek + 1;
  return w >= 1 && w <= ms.result.weeks ? w : 0;
};

export interface WeekSummary {
  rooms: number;
  fights: number;
  finds: number;
  down: string[];
  dead: string[];
  home: boolean;
  /** "4 rooms, a fight, Brenna is down" */
  text: string;
}

/** What one week of a trip held, in a line. */
export function weekSummary(ms: Mission, tripWeek: number): WeekSummary {
  const lines = weekLines(ms, tripWeek);
  const rooms = new Set(lines.filter((l) => l.room !== undefined).map((l) => l.room)).size;
  const fights = lines.filter((l) => l.kind === 'fight').length;
  const finds = lines.filter((l) => l.kind === 'find').length;
  const name = (i: number) => (ms.result.names[i] ?? '').split(' ')[0];
  const last = lines[lines.length - 1]?.squad;
  const before = expeditionLog(ms).filter((l) => l.week < tripWeek).pop()?.squad;
  const dead = last ? last.state.map((st, i) => (st === 'dead' && before?.state[i] !== 'dead' ? name(i) : '')).filter(Boolean) : [];
  const down = [...new Set(lines.filter((l) => l.kind === 'down').flatMap((l) => l.squad.state.map((st, i) => (st === 'down' ? name(i) : ''))).filter(Boolean))].filter((n) => !dead.includes(n));
  const home = tripWeek >= ms.result.weeks;
  const bits: string[] = [];
  if (rooms) bits.push(rooms === 1 ? 'a room' : `${rooms} rooms`);
  else if (lines.some((l) => l.kind === 'road')) bits.push('on the road');
  if (fights) bits.push(fights === 1 ? 'a fight' : `${fights} fights`);
  for (const n of down) bits.push(`${n} went down`);
  for (const n of dead) bits.push(`${n} died`);
  if (home) bits.push('home');
  return { rooms, fights, finds, down, dead, home, text: bits.join(', ') || 'a quiet week' };
}

/** Where a squad is, as of the lines revealed so far: for a squad card. */
export function squadStatus(s: GameState, ms: Mission) {
  const seen = visibleLog(s, ms);
  const last = seen[seen.length - 1];
  const room = [...seen].reverse().find((l) => l.room !== undefined);
  return {
    number: ms.number,
    site: SITES[ms.contract.expedition.site].name,
    zone: room?.zone ? ZONES[room.zone].name : undefined,
    room: room?.room !== undefined ? room.room + 1 : 0,
    rooms: ms.result.roomsPlanned,
    latest: last,
    squad: last?.squad,
    names: ms.result.names,
    revealed: revealedWeeks(s, ms),
    plannedWeeks: ms.plannedWeeks,
    home: !!ms.report,
    preparing: !ms.sealed,
  };
}

/** Squads whose lines the End Week of `gameWeek` revealed, merged in the order things happened. */
export function feedForWeek(s: GameState, gameWeek: number, missions: Mission[] = [...s.missions, ...s.history.slice(-3)]) {
  const out: { missionId: string; number: number; line: LogLine }[] = [];
  for (const ms of missions) {
    // a squad called back at the door never went: it has no lines to show
    if (!ms.sealed || ms.report?.tier === 'Withdrawn') continue;
    const w = tripWeekOf(ms, gameWeek);
    if (!w) continue;
    for (const line of weekLines(ms, w)) out.push({ missionId: ms.id, number: ms.number, line });
  }
  return out.sort((a, b) => a.line.t - b.line.t || a.number - b.number);
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

/** Send a squad on a contract. Buys what the pack needs beyond the stores, and simulates the trip. */
export function dispatchExpedition(s: GameState, contractId: string, plan: ExpPlan): string | undefined {
  const c = s.board.find((x) => x.id === contractId);
  if (!c) return 'That contract is no longer on the board.';
  const blocked = planBlocked(s, c, plan);
  if (blocked) return blocked;
  const cost = packCost(s, plan.pack);
  if (cost) spend(s, 'Expedition supplies', cost);
  for (const k of SUPPLY_IDS) {
    const want = plan.pack[k] ?? 0;
    const have = stockOf(s, k);
    if (k === 'food') s.supplies = Math.max(0, have - want);
    else s.stores[k] = Math.max(0, have - want);
  }
  track(s, 'dispatch');
  const known = [...c.tags, ...c.hidden.filter((h) => h.revealed).map((h) => h.trueTag)];
  const carried = plan.squad.flatMap((id) => {
    const m = s.members.find((x) => x.id === id);
    return m ? [m.loadout.trinket, ...m.loadout.consumables].map((u) => ITEMS[s.items.find((i) => i.uid === u)?.defId ?? '']?.counters ?? []).flat() : [];
  });
  if (known.some((t) => carried.includes(t))) track(s, 'countered');
  const id = uid(s, 'x');
  const used = new Set(s.missions.filter((m) => !m.report).map((m) => m.number));
  let number = 1;
  while (used.has(number)) number++;
  const ms: Mission = {
    id,
    contract: c,
    memberIds: [...plan.squad],
    plan: JSON.parse(JSON.stringify(plan)),
    number,
    dispatchedWeek: s.week,
    plannedWeeks: plannedWeeks(s, c),
    returnWeek: s.week,
    sealed: false,
    setup: undefined as unknown as DiveSetup,
    result: undefined as unknown as ExpeditionResult,
  };
  s.delve.count += 1;
  s.delve.lastPlan = JSON.parse(JSON.stringify(plan));
  for (const mid of plan.squad) {
    const m = s.members.find((x) => x.id === mid)!;
    m.status = 'mission';
    m.missionId = id;
  }
  s.missions.push(ms);
  sealExpedition(s, ms);
  triggerDoorScene(s, ms);
  s.board = s.board.filter((x) => x.id !== c.id);
  // members scouting this contract can stop
  for (const m of s.members) if (m.assignment === 'scout' && m.scoutTarget === c.id) m.assignment = 'rest';
  return undefined;
}

/** Call off a squad that hasn't left yet: the pack goes back to the stores and the contract returns to the board. */
export function cancelExpedition(s: GameState, missionId: string): string | undefined {
  const ms = s.missions.find((x) => x.id === missionId);
  if (!ms) return 'No such expedition.';
  if (ms.sealed || ms.report) return 'They have already left.';
  if (ms.fieldWeeks?.length) return 'They have had their last orders at the door. Nobody can call them back now.';
  returnPack(s, ms.plan.pack);
  for (const id of ms.memberIds) {
    const m = s.members.find((x) => x.id === id);
    if (m) {
      m.status = 'idle';
      m.missionId = undefined;
    }
  }
  s.missions = s.missions.filter((x) => x !== ms);
  if (ms.contract.expiresWeek >= s.week) s.board.unshift(ms.contract);
  return undefined;
}

function returnPack(s: GameState, pack: Partial<Record<SupplyId, number>>) {
  for (const k of SUPPLY_IDS) {
    const n = pack[k] ?? 0;
    if (!n) continue;
    if (k === 'food') s.supplies += n;
    else s.stores[k] = (s.stores[k] ?? 0) + n;
  }
}

/** The expedition stores a new guild starts with. */
export const freshStores = (): Record<StoreId, number> => ({ bandages: 6, oil: 8, tools: 2, masks: 2, reagents: 3, draughts: 1 });

/** Buy supplies for the pack's stores ahead of time. */
export function buyStores(s: GameState, id: SupplyId, n: number): string | undefined {
  if (n <= 0) return 'Nothing to buy.';
  const cost = Math.ceil(supplyUnitPrice(s, id) * n);
  if (s.crowns < cost) return `That costs ${cost} crowns, and the guild has ${s.crowns}.`;
  spend(s, 'Expedition supplies', cost);
  if (id === 'food') s.supplies += n;
  else s.stores[id] = (s.stores[id] ?? 0) + n;
  return undefined;
}

// ---------------------------------------------------------------------------
// Goods and Saint Oda's
// ---------------------------------------------------------------------------

export const goodsValue = (s: GameState) => (Object.keys(s.goods ?? {}) as GoodId[]).reduce((t, g) => t + (s.goods[g] ?? 0) * GOODS[g].value, 0);

/** Sell loot at the market: all of it, or one kind. Returns the crowns earned. */
export function sellGoods(s: GameState, good?: GoodId): number {
  let total = 0;
  for (const k of Object.keys(s.goods) as GoodId[]) {
    if (good && k !== good) continue;
    total += (s.goods[k] ?? 0) * GOODS[k].value;
    delete s.goods[k];
  }
  earn(s, 'Goods sold', total);
  return total;
}

/** Saint Oda's fever beds draw some of the Exposure out of a member, for a fee. */
export function treatExposure(s: GameState, id: string): string | undefined {
  const m = s.members.find((x) => x.id === id);
  if (!m || m.status === 'dead' || m.status === 'left') return 'No such member.';
  if (m.status === 'mission') return `${m.name.split(' ')[0]} is away.`;
  if ((m.exposure ?? 0) <= 0) return 'There is nothing in them to draw out.';
  if (s.crowns < T.exposure.treatCost) return `Saint Oda's asks ${T.exposure.treatCost} crowns, and the guild has ${s.crowns}.`;
  spend(s, "Saint Oda's", T.exposure.treatCost);
  m.exposure = Math.max(0, m.exposure - T.exposure.treat);
  addDispatch(s, 'roster', `${m.name} at Saint Oda's`, [`${m.name.split(' ')[0]} spends a night in the fever beds and comes back smelling of vinegar. Exposure −${T.exposure.treat}.`]);
  return undefined;
}

// ---------------------------------------------------------------------------
// Coming home
// ---------------------------------------------------------------------------

const SUCCESS_TIERS: OutcomeTier[] = ['Triumph', 'Success', 'Costly Success'];

/** The verdict on a contract from how the trip went. */
export function tierOf(res: ExpeditionResult): OutcomeTier {
  const dead = res.members.filter((o) => o.died).length;
  if (res.goalMet) {
    if (dead) return 'Costly Success';
    if (res.outcome === 'complete' && res.roomsCleared > 0 && !res.members.some((o) => o.wentDown)) return 'Triumph';
    return 'Success';
  }
  return res.outcome === 'lost' || dead ? 'Disaster' : 'Failure';
}

/** The squad is home: write the trip into the roster, the stores and the ledger, and settle the contract. */
export function settleExpedition(s: GameState, ms: Mission) {
  const c = ms.contract;
  const res = ms.result;
  const site = SITES[c.expedition.site];
  const squad = ms.memberIds.map((id) => s.members.find((m) => m.id === id)).filter((m): m is Member => !!m);
  const summary: string[] = [];
  const casualties: string[] = [];
  const wounded: { id: string; amount: number }[] = [];
  const tier = tierOf(res);
  const won = SUCCESS_TIERS.includes(tier);
  const loot: Partial<Record<GoodId, number>> = { ...res.loot };

  // a rival waiting on the road home
  if (ms.ambush && res.outcome !== 'lost') {
    const name = RIVALS[ms.ambush].name;
    // only someone who walked home can spot them: the trip's dead are not marked dead until further down
    const eyes = squad.some((m) => !res.members.find((o) => o.id === m.id)?.died && (m.profession === 'scout' || m.profession === 'infiltrator'));
    if (eyes && chance(s, 0.5)) summary.push(`${name}'s people were waiting on the road home. The squad saw them first and went round.`);
    else {
      // they take a third of what the squad carries, but the job's own goods were kept back
      const kept = c.expedition.goal.kind === 'bring' ? c.expedition.goal.good : undefined;
      for (const k of Object.keys(loot) as GoodId[]) if (k !== kept) loot[k] = Math.floor((loot[k] ?? 0) * 0.66);
      summary.push(`${name}'s people were waiting on the road home and took a third of what the squad was carrying.`);
      raiseFeud(s, ms.ambush, 3);
    }
  }

  // the members
  for (const o of res.members) {
    const m = s.members.find((x) => x.id === o.id);
    if (!m) continue;
    m.missions += 1;
    m.kills = (m.kills ?? 0) + o.kills;
    if (o.died) {
      casualties.push(m.id);
      m.status = 'dead';
      m.health = 0;
      m.diedWeek = s.week;
      m.causeOfDeath = `Died on "${c.title}": ${o.died}`;
      m.missionId = undefined;
      addRecord(m, `Week ${s.week} · Died on "${c.title}" in ${site.name}: ${o.died}.`);
      mournLegend(s, m);
      const owed = Math.round(m.wage * T.deathCost.wageWeeks);
      if (owed) {
        spend(s, 'Paid to families', owed);
        summary.push(`The guild pays ${m.name.split(' ')[0]}'s family ${owed} crowns.`);
      }
      // a lost squad leaves its dead and some of their gear behind
      for (const u of [m.loadout.weapon, m.loadout.armor, m.loadout.trinket]) if (u && res.outcome === 'lost' && chance(s, 0.5)) removeItem(s, u);
      for (const u of [...m.loadout.consumables]) removeItem(s, u);
      m.loadout = { consumables: [] };
      continue;
    }
    const before = m.health;
    m.health = clamp(Math.round((o.hp / Math.max(1, o.maxHp)) * 100), 1, 100);
    if (m.health < before) wounded.push({ id: m.id, amount: before - m.health });
    m.fatigue = clamp(o.fatigue, 0, 100);
    m.exposure = clamp(o.exposure, 0, 100);
    m.changes = [...(m.changes ?? []), ...o.changes];
    for (const ch of o.changes) summary.push(`${m.name.split(' ')[0]} came back changed: ${CHANGES[ch].name.toLowerCase()}.`);
    if (o.fever) {
      m.fever = { change: o.fever, weeks: T.exposure.feverWeeks };
      summary.push(`${m.name.split(' ')[0]} came home with the Sink fever and goes to bed.`);
    }
    m.scars = [...(m.scars ?? []), ...o.scars];
    m.habits = [...(m.habits ?? []), ...o.habits];
    m.xp += Math.round(o.xp / T.xp.perClassic);
    m.status = m.health < 40 ? 'recovering' : 'idle';
    m.missionId = undefined;
    m.assignment = 'rest';
    // kit: oils and salts are spent on the trip; draughts only if drunk
    let draughts = o.draughtsUsed;
    for (const u of [...m.loadout.consumables]) {
      const inst = s.items.find((i) => i.uid === u);
      const isDraught = inst?.defId === 'draught';
      if (isDraught && draughts <= 0) continue;
      if (isDraught) draughts -= 1;
      removeItem(s, u);
    }
    m.loadout.consumables = m.loadout.consumables.filter((u) => s.items.some((i) => i.uid === u));
    const bits = [o.wentDown ? 'went down and got up' : '', o.kills >= 4 ? `${o.kills} kills` : '', ...o.scars.map(() => 'a new scar')].filter(Boolean);
    addRecord(m, `Week ${s.week} · "${c.title}" (${site.name}): ${tier}${bits.length ? ` (${bits.join('; ')})` : ''}.`);
    levelUp(s, m);
    // what they did down there counts as leading with their Profession's strength
    const apt = PROFESSIONS[m.profession].aptitude;
    const approach = (Object.keys(apt) as Approach[]).sort((a, b) => (apt[b] ?? 0) - (apt[a] ?? 0))[0] ?? 'endurance';
    earnFame(s, m, { contract: c, tier, tags: trueTags(c), led: [{ approach, result: tier === 'Triumph' ? 'strong' : won ? 'success' : 'fail', danger: 1 }] });
    if (o.fame) earnDeedFame(s, m, o.fame * T.fameScale, o.deeds[0], site.name);
  }

  // what came home
  returnPack(s, res.leftover);
  if (won && c.expedition.goal.kind === 'bring') loot[c.expedition.goal.good] = Math.max(0, (loot[c.expedition.goal.good] ?? 0) - c.expedition.goal.count);
  const mats: string[] = [];
  for (const g of Object.keys(loot) as GoodId[]) {
    const n = loot[g] ?? 0;
    if (n <= 0) continue;
    if (GOODS[g].material) {
      s.materials[g as MaterialId] += n;
      mats.push(`${n} ${MATERIAL_INFO[g as MaterialId].name.toLowerCase()}`);
    } else s.goods[g] = (s.goods[g] ?? 0) + n;
  }
  const goodsHome = (Object.keys(loot) as GoodId[]).filter((g) => !GOODS[g].material && (loot[g] ?? 0) > 0);
  if (goodsHome.length) summary.push(`Brought back ${goodsHome.map((g) => (loot[g] === 1 ? GOODS[g].one : `${loot[g]} ${GOODS[g].many}`)).join(', ')}, to sell at the market.`);
  if (mats.length) summary.push(`Brought back ${mats.join(', ')}.`);
  if (res.crownsFound) {
    earn(s, 'Found on expeditions', res.crownsFound);
    summary.push(`Found ${res.crownsFound} crowns in loose coin.`);
  }
  if (res.renown) {
    s.renown = Math.max(0, s.renown + res.renown);
    summary.push(...res.deeds.map((d) => `${d}.`));
  }
  for (const z of ZONE_ORDER.slice(0, ZONE_ORDER.indexOf(res.deepest) + 1).filter((x) => SITES[c.expedition.site].zones.includes(x))) {
    if (res.outcome === 'lost' && z === res.deepest) continue;
    if (s.delve.zonesReached.includes(z)) continue;
    s.delve.zonesReached.push(z);
    const bonus = T.renown.zoneFirst[z] ?? 0;
    if (bonus) {
      s.renown += bonus;
      summary.push(`First to reach ${ZONES[z].name} (+${bonus} renown).`);
    }
  }
  if ((res.kills.kiln ?? 0) > 0 && !s.delve.kilnBroken) {
    s.delve.kilnBroken = true;
    // nobody can break it twice: postings for it come off the board
    s.board = s.board.filter((x) => !(x.expedition.goal.kind === 'kill' && x.expedition.goal.monster === 'kiln'));
    summary.push("The college sends a cart for the Kiln Engine's core, and a letter that is mostly about who is going to pay for the cart.");
  }

  // the contract
  const rewardMult = tier === 'Triumph' ? 1.25 : tier === 'Success' ? 1 : tier === 'Costly Success' ? 0.8 : 0;
  const alive = squad.filter((m) => m.status !== 'dead');
  const fee = squadHas(alive, 'worth_the_fee') ? 1.1 : 1;
  let reward = Math.round(c.reward * rewardMult * fee) + (rewardMult > 0 ? (ms.bonusReward ?? 0) : 0);
  const materials: Partial<Record<MaterialId, number>> = {};
  if (rewardMult > 0) {
    for (const [k, v] of Object.entries(c.materials)) {
      const amt = tier === 'Costly Success' ? Math.floor(v! / 2) : tier === 'Triumph' ? v! + 1 : v!;
      if (amt > 0) {
        materials[k as MaterialId] = amt;
        s.materials[k as MaterialId] += amt;
      }
    }
    if (s.flags.hobbs_share && reward > 0) {
      const cut = Math.round(reward * 0.25);
      reward -= cut;
      s.rivals.hobbs.crowns += cut;
      summary.push(`Hobb & Daughters took their quarter share: ${cut} crowns.`);
    }
    earn(s, 'Contracts', reward);
    summary.unshift(`Paid ${reward} crowns.`);
    const ms2 = Object.entries(materials).map(([k, v]) => `${v} ${MATERIAL_INFO[k as MaterialId].name}`);
    if (ms2.length) summary.push(`The patron adds ${ms2.join(', ')}.`);
    applyContractEffect(s, c.onSuccess, summary);
    if (tier === 'Triumph') {
      s.renown += 2;
      summary.push('Renown +2 for a flawless job');
    }
    if (squadHas(alive, 'draws_a_crowd')) {
      s.renown += 1;
      summary.push('Renown +1: people came out to watch');
    }
  } else {
    summary.unshift(res.outcome === 'lost' ? 'The squad was lost, and the job with it.' : `The job was not done: ${goalText(c).charAt(0).toLowerCase()}${goalText(c).slice(1)}.`);
    applyContractEffect(s, c.onFailure, summary);
    if (tier === 'Disaster' && !c.op) {
      applyStanding(s, c.patron, -3);
      s.renown = Math.max(0, s.renown - 2);
      summary.push(`${factionName(c.patron)} is furious. Renown −2`);
    }
  }
  if (c.op) resolveOperation(s, c, rewardMult > 0, summary);
  else if (c.contestedBy && rewardMult > 0) raiseFeud(s, c.contestedBy, 3);
  const tpl = TEMPLATE_BY_ID[c.templateId];
  const outcomeFlag = rewardMult > 0 ? tpl?.successFlag : tpl?.failFlag;
  if (outcomeFlag) s.flags[outcomeFlag] = true;

  // morale
  const moraleDelta = tier === 'Triumph' ? 10 : tier === 'Success' ? 6 : tier === 'Costly Success' ? 0 : tier === 'Failure' ? -8 : -15;
  for (const m of squad) if (m.status !== 'dead') m.morale = clamp(m.morale + moraleDelta - casualties.length * 10, 0, 100);
  if (casualties.length) for (const m of living(s)) if (!squad.includes(m)) m.morale = clamp(m.morale - 5 * casualties.length, 0, 100);

  const report: MissionReport = {
    tier,
    phases: [],
    casualties,
    wounded,
    reward: rewardMult > 0 ? reward : 0,
    materials,
    summary,
    trip: {
      outcome: res.outcome,
      deepest: ZONES[res.deepest]?.name,
      rooms: res.roomsCleared,
      roomsPlanned: res.roomsPlanned,
      loot,
      lootValue: (Object.keys(loot) as GoodId[]).reduce((t, g) => t + (loot[g] ?? 0) * GOODS[g].value, 0),
      crownsFound: res.crownsFound,
      goalMet: res.goalMet,
      deeds: res.deeds,
      wentDown: res.members.filter((o) => o.wentDown && !o.died).map((o) => o.id),
    },
  };
  ms.report = report;
  const deadNames = casualties.map((id) => s.members.find((m) => m.id === id)!.name);
  const verdict = res.outcome === 'lost' ? 'was lost' : res.goalMet ? (res.outcome === 'complete' ? 'came back with the job done' : 'turned back early, with the job done') : res.outcome === 'complete' ? 'walked the whole route without getting what the job needed' : 'turned back early';
  addDispatch(s, 'mission', `${tier}: ${c.title}`, [`Squad ${ms.number} ${verdict}. ${site.name}, ${res.roomsCleared} of ${res.roomsPlanned} rooms.`, ...(deadNames.length ? [`Did not come home: ${deadNames.join(', ')}.`] : []), ...summary], ms.id);
}

/** Withdrawn at the door by a scene: nobody goes, the job fails, and the patron is annoyed. */
export function withdrawAtDoor(s: GameState, ms: Mission) {
  const c = ms.contract;
  returnPack(s, ms.plan.pack);
  for (const id of ms.memberIds) {
    const m = s.members.find((x) => x.id === id);
    if (m) {
      m.status = 'idle';
      m.missionId = undefined;
      m.morale = clamp(m.morale - 3, 0, 100);
      addRecord(m, `Week ${s.week} · "${c.title}": called off at the door.`);
    }
  }
  if (!c.op) applyStanding(s, c.patron, -3);
  const summary = [c.op ? 'Called off at the door. The operation is off.' : `Called off at the door. −3 standing with ${factionName(c.patron)}.`];
  ms.report = { tier: 'Withdrawn', phases: [], casualties: [], wounded: [], reward: 0, materials: {}, summary, trip: { outcome: 'withdrawn', rooms: 0, roomsPlanned: ms.result.roomsPlanned, loot: {}, lootValue: 0, crownsFound: 0, goalMet: false, deeds: [], wentDown: [] } };
  ms.sealed = true;
  ms.returnWeek = s.week;
  // a story job called off counts as failed, so the story can move on
  const tpl = TEMPLATE_BY_ID[c.templateId];
  if (tpl?.failFlag) s.flags[tpl.failFlag] = true;
  addDispatch(s, 'mission', `Withdrawn: ${c.title}`, summary, ms.id);
}

/** Members at home while a squad is away. */
export const awaySquads = (s: GameState) => s.missions.filter((m) => !m.report);

