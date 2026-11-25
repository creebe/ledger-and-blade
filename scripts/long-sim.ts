// Two-year balance check: guild wars and Legends over 96 weeks.
// Run with: npm run sim:long [games]
// Reports, over every game started (about 30% end in year one):
// - the passive bot (never runs hostile operations): share of games that reach a feud in
//   year one, and that ever reach open war by week 96;
// - the provoking bot (`provoke: true`): the same, to show escalation still leads to war;
// - Legends per game by week 96, and the week of the first.
// Targets are in .claude/agents/balance-reviewer.md.
import { advanceWeek, fameTier, feudStage, newGame, type GameState, type RivalId } from '../src/engine';
import { botTurn, type BotOpts } from './sim';

const topStage = (s: GameState) => Math.max(0, ...(Object.keys(s.rivals) as RivalId[]).filter((id) => s.rivals[id].active).map((id) => feudStage(s, id)));

export function longSim(games: number, provoke = false) {
  let feudY1 = 0, warY1 = 0, warBy96 = 0, warAt96 = 0, alive96 = 0, legends = 0, before50 = 0;
  const firstLegend: number[] = [];
  for (let g = 0; g < games; g++) {
    const s = newGame(1000 + g * 7919);
    const opts: BotOpts = { minChance: 0.5, prep: 'good', provoke };
    const seen = new Set<string>();
    let maxY1 = 0, max96 = 0;
    for (let w = 0; w < 96 && !s.gameOver; w++) {
      botTurn(s, opts);
      if (advanceWeek(s) && !s.gameOver) {
        botTurn(s, opts);
        advanceWeek(s);
      }
      const stage = topStage(s);
      if (w < 48) maxY1 = Math.max(maxY1, stage);
      max96 = Math.max(max96, stage);
      for (const m of s.members)
        if (!seen.has(m.id) && fameTier(m) === 3) {
          seen.add(m.id);
          legends++;
          firstLegend.push(s.week);
          if (s.week < 50) before50++;
        }
    }
    if (maxY1 >= 1) feudY1++;
    if (maxY1 === 2) warY1++;
    if (max96 === 2) warBy96++;
    if (!s.gameOver) {
      alive96++;
      if (topStage(s) === 2) warAt96++;
    }
  }
  const pct = (n: number, d = games) => `${((n / Math.max(1, d)) * 100).toFixed(1)}%`;
  firstLegend.sort((a, b) => a - b);
  return {
    games,
    bot: provoke ? 'provoking' : 'passive',
    feudInYear1: pct(feudY1),
    warInYear1: pct(warY1),
    everAtWarBy96: pct(warBy96),
    atWarInWeek96OfSurvivors: pct(warAt96, alive96),
    survivedTo96: pct(alive96),
    legendsPerGame: +(legends / games).toFixed(2),
    legendsBeforeWeek50: before50,
    firstLegendWeek: firstLegend[0],
    medianLegendWeek: firstLegend[firstLegend.length >> 1],
  };
}

const games = Number(process.argv[2] ?? 300);
console.log(JSON.stringify(longSim(games)));
console.log(JSON.stringify(longSim(games, true)));
