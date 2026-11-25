// Bringing a classic save (version 12) into expeditions.
import { TEMPLATE_BY_ID } from '../data/contracts';
import { REGIONS } from '../data/factions';
import { expeditionFor } from '../economy/board';
import type { Contract, GameState, Mission } from '../core/types';
import { freshStores } from './run';
import { DEFAULT_ORDERS } from './prep';
import type { ExpeditionResult } from './types';

type OldMission = Mission & { approaches?: unknown; retreatOnCritical?: unknown; supplies?: number; arriveWeek?: number; chainStart?: number; difficultyMult?: number };

function regionIdOf(name: string) {
  return Object.keys(REGIONS).find((k) => REGIONS[k].name === name) ?? 'varrow';
}

/** Give a classic contract its expedition: the site of its region, a length for its threat. */
export function contractToExpedition(c: Contract) {
  if (c.expedition) return;
  const t = TEMPLATE_BY_ID[c.templateId];
  c.expedition = t ? expeditionFor(t, regionIdOf(c.region), c.threat) : { site: 'varrow', length: 'short', goal: { kind: 'complete' } };
}

/**
 * A squad that was out on a classic contract. If it already had its report, it
 * comes home as before. Otherwise it comes home next week with the job done, the
 * way the classic odds most likely had it: "the road was quiet".
 */
function convertMission(g: GameState, old: OldMission, number: number) {
  contractToExpedition(old.contract);
  const ids = old.memberIds;
  const names = ids.map((id) => g.members.find((m) => m.id === id)?.name ?? 'Somebody');
  const result: ExpeditionResult = {
    seed: 1,
    squad: [...ids],
    names,
    outcome: 'complete',
    deepest: old.contract.expedition.site === 'pellam' ? 'culverts' : 'lowertown',
    roomsCleared: 0,
    roomsPlanned: 0,
    weeks: 1,
    log: [],
    loot: {},
    lootValue: 0,
    crownsFound: 0,
    leftover: {},
    used: {},
    members: [],
    kills: {},
    renown: 0,
    deeds: [],
    goalMet: true,
  };
  const ms = old as Mission;
  ms.plan = { squad: [...ids], pack: {}, orders: { ...DEFAULT_ORDERS } };
  ms.number = number;
  ms.sealed = true;
  ms.plannedWeeks = Math.max(1, old.returnWeek - old.dispatchedWeek + 1);
  ms.foeScale = old.difficultyMult;
  ms.setup = {
    seed: 1,
    site: old.contract.expedition.site,
    length: old.contract.expedition.length,
    goal: old.contract.expedition.goal,
    tags: [],
    threat: old.contract.threat,
    roadOut: 0,
    roadBack: 0,
    foeScale: 1,
    fieldLog: [...(old.fieldLog ?? []), 'The road was quiet.'],
    plan: ms.plan,
    squad: [],
  };
  if (!ms.report) {
    // home at the end of the coming week, paid as a plain success
    ms.returnWeek = Math.max(g.week, old.returnWeek ?? g.week);
    for (const id of ids) {
      const m = g.members.find((x) => x.id === id);
      if (!m) continue;
      result.members.push({ id, hp: m.health, maxHp: 100, fatigue: Math.min(100, m.fatigue + 10), exposure: 0, changes: [], xp: 9, scars: [], habits: [], kills: 0, deeds: [], fame: 0, wentDown: false, draughtsUsed: 0 });
    }
  }
  ms.result = { ...result, weeks: Math.max(1, ms.returnWeek - ms.dispatchedWeek + 1) };
  delete old.approaches;
  delete old.retreatOnCritical;
  delete old.supplies;
  delete old.arriveWeek;
  delete old.chainStart;
  delete old.difficultyMult;
}

export function migrateToExpeditions(g: GameState) {
  for (const m of [...g.members, ...g.recruits.map((r) => r.member)]) {
    m.exposure = m.exposure ?? 0;
    m.changes = m.changes ?? [];
    m.scars = m.scars ?? [];
    m.habits = m.habits ?? [];
  }
  for (const c of g.board) contractToExpedition(c);
  let n = 0;
  for (const ms of g.missions) convertMission(g, ms as OldMission, ms.report ? 0 : Math.min(3, ++n));
  for (const ms of g.history) convertMission(g, ms as OldMission, 0);
  g.stores = freshStores();
  g.goods = {};
  g.delve = { zonesReached: [], count: 0 };
  if (g.facilities && g.facilities.muster === undefined) g.facilities.muster = 0;
}
