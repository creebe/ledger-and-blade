// Odds check: does the estimate the prep sheet shows match how trips really go?
// Plays seeded games with the balance bot; before each dispatch it takes the
// estimate for the bot's plan, then compares it with the sealed outcome.
// Also times the estimate. `npm run odds` (GAMES=n to change the count).
import { advanceWeek, expeditionOdds, newGame } from '../src/engine';
import type { GameState } from '../src/engine';
import { botTurn } from './sim';

const GAMES = Number(process.env.GAMES ?? 30);
const WEEKS = 40;
type Row = { lo: number; hi: number; mid: number; death: number; met: boolean; died: boolean; ms: number };
const rows: Row[] = [];
for (let g = 0; g < GAMES; g++) {
  const s: GameState = newGame(9001 + g * 104729);
  for (let w = 0; w < WEEKS && !s.gameOver; w++) {
    const before = new Set(s.missions.map((m) => m.id));
    // estimate just before dispatch: wrap the bot's turn by snapshotting the board
    const snap = JSON.parse(JSON.stringify(s)) as GameState;
    botTurn(s, { minChance: 0.5 });
    for (const ms of s.missions.filter((m) => !before.has(m.id))) {
      const c = snap.board.find((x) => x.id === ms.contract.id);
      if (!c) continue;
      const t0 = performance.now();
      const o = expeditionOdds(snap, c, ms.plan);
      const dt = performance.now() - t0;
      if (!o) continue;
      rows.push({ lo: o.goal.min, hi: o.goal.max, mid: o.cases.reduce((t, x) => t + x.goal, 0) / o.cases.length, death: o.cases.reduce((t, x) => t + x.death, 0) / o.cases.length, met: false, died: false, ms: dt });
      (ms as unknown as { _row: Row })._row = rows[rows.length - 1];
    }
    advanceWeek(s);
    for (const ms of [...s.missions, ...s.history]) {
      const r = (ms as unknown as { _row?: Row })._row;
      if (r && ms.result && ms.sealed) {
        r.met = ms.result.goalMet;
        r.died = ms.result.members.some((o) => o.died);
      }
    }
  }
}
const pct = (x: number) => `${Math.round(x * 100)}%`;
console.log(`${rows.length} trips across ${GAMES} games`);
const bands = [0, 0.4, 0.6, 0.75, 0.9, 1.01];
for (let i = 0; i < bands.length - 1; i++) {
  const r = rows.filter((x) => x.mid >= bands[i] && x.mid < bands[i + 1]);
  if (!r.length) continue;
  const pred = r.reduce((t, x) => t + x.mid, 0) / r.length;
  const real = r.filter((x) => x.met).length / r.length;
  console.log(`estimate ${pct(bands[i])}-${pct(Math.min(1, bands[i + 1]))}: ${r.length} trips, predicted ${pct(pred)}, real ${pct(real)}`);
}
const pd = rows.reduce((t, x) => t + x.death, 0) / rows.length;
const rd = rows.filter((x) => x.died).length / rows.length;
console.log(`death: predicted ${pct(pd)}, real ${pct(rd)}`);
const pg = rows.reduce((t, x) => t + x.mid, 0) / rows.length;
const rg = rows.filter((x) => x.met).length / rows.length;
console.log(`goal: predicted ${pct(pg)}, real ${pct(rg)}`);
const inRange = rows.filter((x) => x.lo !== x.hi).length;
console.log(`${inRange} trips had an unconfirmed danger (a range)`);
const ms = rows.map((x) => x.ms).sort((a, b) => a - b);
console.log(`time per estimate: median ${ms[Math.floor(ms.length / 2)].toFixed(1)} ms, 90th ${ms[Math.floor(ms.length * 0.9)].toFixed(1)} ms, max ${ms[ms.length - 1].toFixed(1)} ms`);
