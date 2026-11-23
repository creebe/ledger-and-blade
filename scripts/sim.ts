// Headless balance simulation: a simple, reasonably careful bot plays many
// games. Run with: npx vite-node scripts/sim.ts [games] [weeks]
import {
  advanceWeek,
  bestApproaches,
  buySupplies,
  canChoose,
  dispatchMission,
  hireRecruit,
  living,
  newGame,
  previewMission,
  resolveEvent,
  revealTag,
  sellMaterial,
  setAssignment,
  suppliesNeeded,
  type GameState,
  type Member,
  type MaterialId,
} from '../src/engine';

export function botTurn(s: GameState, opts: { minChance: number }) {
  // events: take the first affordable choice
  for (let guard = 0; s.pendingEvents.length && guard < 30; guard++) {
    const ev = s.pendingEvents[0];
    // avoid obviously ruinous choices (selling a share of income)
    const ok = ev.choices.map((c, i) => ({ c, i })).filter(({ c }) => !canChoose(s, c) && c.effects.flag !== 'hobbs_share');
    const pickIdx = ok.find(({ c }) => (c.effects.crowns ?? 0) >= 0)?.i ?? ok[0]?.i ?? 0;
    resolveEvent(s, ev.uid, pickIdx);
  }
  // sell materials
  for (const m of ['iron', 'leather', 'timber', 'reagents'] as MaterialId[]) if (s.materials[m] > 0) sellMaterial(s, m, s.materials[m]);
  // contracts
  for (const c of [...s.board].sort((a, b) => b.reward - a.reward)) {
    if (c.hidden.some((h) => !h.revealed) && s.intel >= 2) revealTag(s, c.id, c.hidden.findIndex((h) => !h.revealed));
    const avail = living(s).filter((m) => m.status === 'idle' && m.health >= 60);
    if (avail.length < c.minSquad) continue;
    let best: { members: Member[]; chance: number } | undefined;
    for (let size = c.minSquad; size <= Math.min(c.maxSquad, avail.length); size++) {
      // greedy: rank members by their average contribution
      const ranked = [...avail].sort((a, b) => score(s, c, [b]) - score(s, c, [a]));
      const team = ranked.slice(0, size);
      const ap = bestApproaches(s, c, team);
      const pv = previewMission(s, c, team, ap);
      const ch = pv.phases.reduce((m, p) => Math.min(m, p.min), 1);
      if (pv.risk === 'Deadly') continue;
      if (!best || ch > best.chance + 0.03) best = { members: team, chance: ch };
    }
    if (best && best.chance >= opts.minChance) {
      const need = suppliesNeeded(c, best.members.length);
      if (s.supplies < need + 4) buySupplies(s, need + 4 - s.supplies);
      const ids = best.members.map((m) => m.id);
      dispatchMission(s, c.id, ids, bestApproaches(s, c, best.members), true);
    }
  }
  // supplies for home
  const home = living(s).filter((m) => m.status !== 'mission').length;
  if (s.supplies < home * 3) buySupplies(s, home * 3 - s.supplies);
  // hire when flush
  if (s.crowns > 450 && living(s).length < 7 && s.recruits.length) hireRecruit(s, 0);
  // assignments
  for (const m of living(s).filter((x) => x.status === 'idle')) {
    if (m.fatigue > 15 || m.health < 80) setAssignment(s, m.id, 'rest');
    else if (s.crowns < 150) setAssignment(s, m.id, 'labor');
    else setAssignment(s, m.id, 'rumors');
  }
}

function score(s: GameState, c: GameState['board'][number], team: Member[]) {
  const pv = previewMission(s, c, team, bestApproaches(s, c, team));
  return pv.phases.reduce((sum, p) => sum + p.chance, 0);
}

export function runSim(games: number, weeks: number, minChance = 0.5) {
  const results = { survived: 0, bankrupt: 0, charter: 0, collapse: 0, crowns: 0, deaths: 0, missions: 0, wins: 0, renown: 0, members: 0 };
  for (let g = 0; g < games; g++) {
    const s = newGame(1000 + g * 7919);
    for (let w = 0; w < weeks && !s.gameOver; w++) {
      botTurn(s, { minChance });
      const err = advanceWeek(s);
      if (err && !s.gameOver) {
        // resolve any events that arrived and retry
        botTurn(s, { minChance });
        advanceWeek(s);
      }
    }
    if (s.gameOver) results[s.gameOver.reason] += 1;
    else results.survived += 1;
    results.crowns += s.crowns;
    results.renown += s.renown;
    results.deaths += s.members.filter((m) => m.status === 'dead').length;
    results.members += living(s).length;
    const done = [...s.history, ...s.missions.filter((m) => m.report)];
    results.missions += done.length;
    results.wins += done.filter((m) => ['Triumph', 'Success', 'Costly Success'].includes(m.report!.tier)).length;
  }
  return {
    games,
    weeks,
    survivalRate: results.survived / games,
    bankrupt: results.bankrupt,
    charter: results.charter,
    collapse: results.collapse,
    avgCrowns: Math.round(results.crowns / games),
    avgRenown: Math.round(results.renown / games),
    avgDeaths: +(results.deaths / games).toFixed(2),
    avgMembers: +(results.members / games).toFixed(1),
    avgMissions: +(results.missions / games).toFixed(1),
    winRate: +(results.wins / Math.max(1, results.missions)).toFixed(2),
  };
}

