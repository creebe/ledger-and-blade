import { advanceWeek, expeditionOdds, newGame, runExpedition } from '../src/engine';
import type { GameState } from '../src/engine';
import { botTurn } from './sim';
// for plans with mid-range odds: estimate at 40/120/480 runs, and the sealed setup over 5 other 120-seed sequences
const out: string[] = [];
let n = 0; const spreads: number[] = []; const d40: number[] = []; const d120: number[] = [];
for (let g = 0; g < 40 && n < 40; g++) {
  const s: GameState = newGame(5003 + g * 7717);
  for (let w = 0; w < 40 && !s.gameOver && n < 40; w++) {
    const snap = JSON.parse(JSON.stringify(s)) as GameState;
    const before = new Set(s.missions.map((m) => m.id));
    botTurn(s, { minChance: 0.35 });
    for (const ms of s.missions.filter((m) => !before.has(m.id))) {
      const c = snap.board.find((x) => x.id === ms.contract.id); if (!c) continue;
      const o120 = expeditionOdds(s, c, ms.plan, 120)!; if (!o120 || o120.cases.length !== 1) continue;
      const p = o120.goal.min; if (p < 0.3 || p > 0.92) continue;
      const o40 = expeditionOdds(s, c, ms.plan, 40)!.goal.min;
      const o480 = expeditionOdds(s, c, ms.plan, 480)!.goal.min;
      const base = ms.setup;
      const alt = [1, 2, 3, 4, 5].map((k) => { let m = 0; for (let i = 0; i < 120; i++) if (runExpedition({ ...base, seed: (k * 0x3c6ef372 + i * 2654435761) | 0 || 1 }, { quiet: true }).goalMet) m++; return m / 120; });
      spreads.push(Math.max(...alt) - Math.min(...alt)); d40.push(o40 - o480); d120.push(p - o480);
      out.push(`${c.title.slice(0, 28).padEnd(28)} 40:${(o40 * 100).toFixed(0)} 120:${(p * 100).toFixed(0)} 480:${(o480 * 100).toFixed(0)} alt120:${alt.map((x) => (x * 100).toFixed(0)).join('/')}`);
      n++;
    }
    advanceWeek(s);
  }
}
console.log(out.join('\n'));
const rms = (a: number[]) => (Math.sqrt(a.reduce((t, x) => t + x * x, 0) / a.length) * 100).toFixed(1);
console.log(`n=${n}; 120 vs 480 rms ${rms(d120)} pts, 40 vs 480 rms ${rms(d40)} pts; spread of 5 alternative 120-seed sequences: median ${(spreads.sort((a, b) => a - b)[Math.floor(n / 2)] * 100).toFixed(0)} pts, max ${(spreads[n - 1] * 100).toFixed(0)}`);
