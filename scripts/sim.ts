// Headless balance simulation: a simple bot plays many games with expeditions.
// Run with: npm run sim [games] [weeks]
// `minChance` is kept as the bot's caution (0.35 bold, 0.5 careful, 0.65 cautious).
import {
  advanceWeek,
  buyMaterial,
  buySupplies,
  canBuild,
  canChoose,
  dispatchExpedition,
  hireRecruit,
  living,
  materialPrice,
  memberBlocked,
  newGame,
  nextLevel,
  planBlocked,
  resolveEvent,
  revealTag,
  sellGoods,
  sellMaterial,
  setAssignment,
  squadLimit,
  squadsOut,
  startBuild,
  suggestPlan,
  type Contract,
  type ExpPlan,
  type GameState,
  type MaterialId,
  type OpKind,
  activeRivals,
  feudStage,
  operationOptions,
  runOperation,
} from '../src/engine';

export interface BotOpts {
  minChance: number;
  chooser?: (s: GameState, ev: GameState['pendingEvents'][number]) => number;
  /** good: the suggested pack and orders; poor: little in the pack and stubborn orders */
  prep?: 'good' | 'poor';
  /** a player who picks fights: smears every rival, prefers contested jobs, and runs every operation it can */
  provoke?: boolean;
}

/** The provoking player's moves against each rival this week. */
function provokeRivals(s: GameState) {
  for (const id of activeRivals(s)) {
    const stage = feudStage(s, id);
    for (const kind of ['smear', ...(stage >= 1 ? ['intercept'] : []), ...(stage >= 2 ? ['raid'] : [])] as OpKind[]) {
      const opt = operationOptions(s, id).find((o) => o.kind === kind);
      if (!opt || opt.blocked) continue;
      if ((opt.cost.crowns ?? 0) > 0 && s.crowns - (opt.cost.crowns ?? 0) < 200) continue;
      runOperation(s, id, kind);
    }
  }
}

export function resolvePending(s: GameState, opts: BotOpts) {
  for (let guard = 0; s.pendingEvents.length && guard < 30; guard++) {
    const ev = s.pendingEvents[0];
    // avoid obviously ruinous choices (selling a share of income)
    const ok = ev.choices.map((c, i) => ({ c, i })).filter(({ c }) => !canChoose(s, c) && c.effects.flag !== 'hobbs_share');
    const pickIdx = opts.chooser ? opts.chooser(s, ev) : (ok.find(({ c }) => (c.effects.crowns ?? 0) >= 0 && !c.effects.mission?.withdraw)?.i ?? ok[0]?.i ?? 0);
    resolveEvent(s, ev.uid, pickIdx);
  }
}

/** How hard a posting is, on the contract threat scale. */
export function postingDifficulty(c: Contract) {
  // Old Pellam's postings and the other sites' own postings (a goal beyond "see it through") read like Old Pellam's
  if (c.expedition.site === 'pellam' || c.expedition.goal.kind !== 'complete') return { short: 2.5, medium: 5, long: 7.5 }[c.expedition.length];
  return c.threat + (c.expedition.length === 'medium' ? 1 : c.expedition.length === 'long' ? 2.5 : 0);
}

function poorPlan(p: ExpPlan): ExpPlan {
  return { ...p, squad: [...p.squad].reverse(), pack: { food: Math.max(1, Math.floor((p.pack.food ?? 0) / 2)) }, orders: { ...p.orders, retreat: 'stubborn', wanderers: 'fight' } };
}

export function botTurn(s: GameState, opts: BotOpts) {
  resolvePending(s, opts);
  // sell what came back
  sellGoods(s);
  for (const m of ['iron', 'leather', 'timber', 'reagents'] as MaterialId[]) if (s.materials[m] > 0) sellMaterial(s, m, s.materials[m]);
  const caution = opts.minChance;
  const margin = caution <= 0.4 ? 3 : caution <= 0.55 ? 1.5 : 0.5;
  const minHealth = caution <= 0.4 ? 45 : caution <= 0.55 ? 65 : 80;
  if (opts.provoke) provokeRivals(s);
  // contracts: the best-paying ones the squad can likely handle (a provoking player goes for fights first)
  const value = (c: Contract) => c.reward / Math.max(1, postingDifficulty(c)) + (opts.provoke && (c.contestedBy || (c.op && c.op.kind !== 'kill')) ? 1000 : 0);
  const board = [...s.board].sort((a, b) => value(b) - value(a));
  for (const c of board) {
    if (squadsOut(s) >= squadLimit(s)) break;
    if (c.hidden.some((h) => !h.revealed) && s.intel >= 2) revealTag(s, c.id, c.hidden.findIndex((h) => !h.revealed));
    let plan = suggestPlan(s, c);
    const team = plan.squad.map((id) => s.members.find((m) => m.id === id)!);
    if (team.length < Math.min(c.minSquad, 4)) continue;
    // a careful player doesn't send a pair into Old Pellam
    if ((c.expedition.site === 'pellam' || c.expedition.goal.kind !== 'complete') && team.length < 3 && caution >= 0.5) continue;
    if (team.some((m) => m.health < minHealth || m.fatigue >= 45)) continue;
    const level = team.reduce((t, m) => t + m.level, 0) / team.length;
    const power = level * 1.2 + team.length * 0.5;
    if (postingDifficulty(c) > power + margin) continue;
    if (opts.prep === 'poor') plan = poorPlan(plan);
    if (planBlocked(s, c, plan)) continue;
    if (s.crowns < 80 && !c.story) continue;
    dispatchExpedition(s, c.id, plan);
    resolvePending(s, opts);
  }
  // supplies for home
  const home = living(s).filter((m) => m.status !== 'mission').length;
  if (s.supplies < home * 3 + 6) buySupplies(s, home * 3 + 6 - s.supplies);
  // build when flush: only if the whole project, materials included, leaves a cushion
  if (!process.env.NOBUILD && !s.construction && s.crowns > 700) {
    for (const id of ['infirmary', 'muster', 'stables'] as const) {
      const next = nextLevel(s, id);
      if (!next) continue;
      const shortfall = (Object.keys(next.materials) as MaterialId[]).map((m) => ({ m, n: Math.max(0, (next.materials[m] ?? 0) - s.materials[m]) }));
      const cost = next.crowns + shortfall.reduce((t, x) => t + x.n * materialPrice(s, x.m), 0);
      if (s.crowns - cost < 450) continue;
      for (const x of shortfall) if (x.n) buyMaterial(s, x.m, x.n);
      if (!canBuild(s, id)) startBuild(s, id);
      break;
    }
  }
  // hire when flush, or when the roster is thin
  if ((s.crowns > 400 && living(s).length < 8) || (living(s).length < 5 && s.crowns > 120)) if (s.recruits.length) hireRecruit(s, 0);
  // assignments
  for (const m of living(s).filter((x) => x.status === 'idle')) {
    if (memberBlocked(s, m) || m.fatigue > 15 || m.health < 80) setAssignment(s, m.id, 'rest');
    else if (s.crowns < 150) setAssignment(s, m.id, 'labor');
    else setAssignment(s, m.id, 'rumors');
  }
}

export function runSim(games: number, weeks: number, minChance = 0.5, prep: 'good' | 'poor' = 'good') {
  const results = { survived: 0, bankrupt: 0, charter: 0, collapse: 0, crowns: 0, deaths: 0, missions: 0, wins: 0, renown: 0, members: 0, expDeaths: 0, lost: 0, loot: 0, changes: 0 };
  const byStart: Record<string, [number, number]> = {}; // backer or circumstance -> [survived, games]
  const bySite: Record<string, [number, number, number]> = {}; // site -> [trips, deaths, wins]
  for (let g = 0; g < games; g++) {
    const s = newGame(1000 + g * 7919);
    const opts: BotOpts = { minChance, prep };
    for (let w = 0; w < weeks && !s.gameOver; w++) {
      botTurn(s, opts);
      const err = advanceWeek(s);
      if (err && !s.gameOver) {
        // resolve any events that arrived and retry
        botTurn(s, opts);
        advanceWeek(s);
      }
    }
    if (s.gameOver) results[s.gameOver.reason] += 1;
    else results.survived += 1;
    for (const k of [s.start.backer, ...s.start.circumstances]) {
      const e = (byStart[k] ??= [0, 0]);
      e[0] += s.gameOver ? 0 : 1;
      e[1] += 1;
    }
    results.crowns += s.crowns;
    results.renown += s.renown;
    results.deaths += s.members.filter((m) => m.status === 'dead').length;
    results.members += living(s).length;
    results.changes += s.members.reduce((t, m) => t + (m.changes?.length ?? 0), 0);
    const done = [...s.history, ...s.missions.filter((m) => m.report)].filter((m) => m.report!.tier !== 'Withdrawn');
    results.missions += done.length;
    results.wins += done.filter((m) => ['Triumph', 'Success', 'Costly Success'].includes(m.report!.tier)).length;
    for (const m of done) {
      const dead = m.report!.casualties.length;
      results.expDeaths += dead;
      results.lost += m.result.outcome === 'lost' ? 1 : 0;
      results.loot += m.result.lootValue;
      const e = (bySite[m.contract.expedition.site] ??= [0, 0, 0]);
      e[0] += 1;
      e[1] += dead;
      e[2] += ['Triumph', 'Success', 'Costly Success'].includes(m.report!.tier) ? 1 : 0;
    }
  }
  const n = Math.max(1, results.missions);
  return {
    games,
    weeks,
    prep,
    survivalRate: results.survived / games,
    bankrupt: results.bankrupt,
    charter: results.charter,
    collapse: results.collapse,
    avgCrowns: Math.round(results.crowns / games),
    avgRenown: Math.round(results.renown / games),
    avgDeaths: +(results.deaths / games).toFixed(2),
    avgMembers: +(results.members / games).toFixed(1),
    avgExpeditions: +(results.missions / games).toFixed(1),
    winRate: +(results.wins / n).toFixed(2),
    deathsPerExpedition: +(results.expDeaths / n).toFixed(3),
    lostRate: +(results.lost / n).toFixed(3),
    lootPerExpedition: Math.round(results.loot / n),
    sinkChangesPerGame: +(results.changes / games).toFixed(1),
    bySite: Object.fromEntries(Object.entries(bySite).map(([k, [t, d, w]]) => [k, `${t} trips, ${Math.round((w / t) * 100)}% won, ${(d / t).toFixed(2)} deaths each`])),
    byStart: Object.fromEntries(Object.entries(byStart).map(([k, [w, nn]]) => [k, `${Math.round((w / nn) * 100)}% of ${nn}`])),
  };
}
