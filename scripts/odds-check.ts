// Odds check: does the estimate the prep sheet shows match how trips really go?
// Plays seeded games with the balance bot; just after each dispatch it takes the
// estimate for the bot's plan (squad and gear as they left the yard), then
// compares it with the sealed outcome. `npm run odds` (GAMES=n, WEEKS=n, MIN=0.5).
//
// Besides the calibration per band it reports:
// - door: how many trips had a door scene change the trip (foe scale, a new
//   danger or a delay), which the estimate can't see, and calibration without them;
// - oracle: the real sealed setup walked over fresh seeds, so the gap between
//   estimate and oracle is what the estimate misses (door scenes, yard changes,
//   the hidden-danger average), apart from luck;
// - noise: for trips with nothing hidden and no door scene, the estimate against
//   the same setup walked over 1000 other seeds (sampling noise of the estimate).
// Road ambushes only cost loot at settlement, so they can't move goal or death odds.
import { advanceWeek, expeditionOdds, newGame, runExpedition } from '../src/engine';
import type { DiveSetup, GameState, Mission } from '../src/engine';
import { botTurn } from './sim';

const GAMES = Number(process.env.GAMES ?? 30);
const WEEKS = Number(process.env.WEEKS ?? 40);
const MIN = Number(process.env.MIN ?? 0.5);
const ORACLE = Number(process.env.ORACLE ?? 300);
type Row = {
  lo: number; hi: number; mid: number; death: number; truthGoal: number; truthDeath: number; cases: number; per: number;
  met: boolean; died: boolean; done: boolean; door: boolean; oracleGoal: number; oracleDeath: number; noise?: number; ms: number; pw: number;
};
const rows: Row[] = [];
const walk = (setup: DiveSetup, n: number, off: number) => {
  let g = 0, d = 0;
  for (let i = 0; i < n; i++) {
    const r = runExpedition({ ...setup, seed: (off + i * 7919) | 0 || 1 }, { quiet: true });
    if (r.goalMet) g++;
    if (r.members.some((o) => o.died)) d++;
  }
  return { g: g / n, d: d / n };
};
const tagsKey = (t: string[]) => [...new Set(t)].sort().join(',');
for (let g = 0; g < GAMES; g++) {
  const s: GameState = newGame(9001 + g * 104729);
  const live = new Map<Mission, Row>();
  for (let w = 0; w < WEEKS && !s.gameOver; w++) {
    const before = new Set(s.missions.map((m) => m.id));
    const snap = JSON.parse(JSON.stringify(s)) as GameState;
    botTurn(s, { minChance: MIN });
    for (const ms of s.missions.filter((m) => !before.has(m.id))) {
      const c = snap.board.find((x) => x.id === ms.contract.id);
      if (!c) continue;
      const t0 = performance.now();
      // the squad as it left the yard: what the player saw on the prep sheet as they pressed send
      const o = expeditionOdds(s, c, ms.plan);
      const dt = performance.now() - t0;
      if (!o) continue;
      const truth = c.hidden.filter((h) => !h.revealed).map((h) => h.trueTag);
      const tc = o.cases.find((x) => x.assumed.join() === truth.join()) ?? o.cases[0];
      const row: Row = {
        lo: o.goal.min, hi: o.goal.max, mid: o.cases.reduce((t, x) => t + x.goal, 0) / o.cases.length,
        death: o.cases.reduce((t, x) => t + x.death, 0) / o.cases.length, truthGoal: tc.goal, truthDeath: tc.death,
        cases: o.cases.length, per: o.runs / o.cases.length,
        met: false, died: false, done: false, door: false, oracleGoal: 0, oracleDeath: 0, ms: dt, pw: ms.plannedWeeks,
      };
      rows.push(row);
      live.set(ms, row);
    }
    advanceWeek(s);
    for (const [ms, r] of live) {
      if (!ms.sealed || !ms.result || r.done) continue;
      r.done = ms.report?.tier !== 'Withdrawn';
      r.met = ms.result.goalMet;
      r.died = ms.result.members.some((o) => o.died);
      const su = ms.setup;
      const base = tagsKey([...ms.contract.tags, ...ms.contract.hidden.map((h) => h.trueTag)]);
      r.door = (su.foeScale ?? 1) !== 1 || tagsKey(su.tags) !== base || ms.plannedWeeks !== r.pw || (ms.extraTags ?? []).length > 0 || su.fieldLog.length > 0;
      const or = walk(su, ORACLE, 0x2545f491);
      r.oracleGoal = or.g;
      r.oracleDeath = or.d;
      if (r.cases === 1 && !r.door) r.noise = walk(su, 1000, 0x1b873593).g;
      live.delete(ms);
    }
  }
}
const pct = (x: number) => `${(x * 100).toFixed(0)}%`;
const done = rows.filter((x) => x.done);
console.log(`${rows.length} dispatches, ${done.length} trips went (${rows.length - done.length} withdrawn or unfinished) across ${GAMES} games, bot minChance ${MIN}`);
const report = (label: string, rs: Row[]) => {
  if (!rs.length) return;
  const avg = (f: (x: Row) => number) => rs.reduce((t, x) => t + f(x), 0) / rs.length;
  const se = (p: number) => Math.sqrt((p * (1 - p)) / rs.length);
  const real = avg((x) => +x.met);
  console.log(`${label}: ${rs.length} trips, goal est ${pct(avg((x) => x.mid))} truth-case ${pct(avg((x) => x.truthGoal))} oracle ${pct(avg((x) => x.oracleGoal))} real ${pct(real)} (±${pct(se(real))}); death est ${pct(avg((x) => x.death))} oracle ${pct(avg((x) => x.oracleDeath))} real ${pct(avg((x) => +x.died))}`);
};
console.log('-- goal calibration by estimate (mid of range)');
const bands = [0, 0.4, 0.6, 0.75, 0.9, 0.97, 1.01];
for (let i = 0; i < bands.length - 1; i++) report(`  ${pct(bands[i])}-${pct(Math.min(1, bands[i + 1]))}`, done.filter((x) => x.mid >= bands[i] && x.mid < bands[i + 1]));
console.log('-- death calibration by estimate');
const db = [0, 0.03, 0.1, 0.25, 1.01];
for (let i = 0; i < db.length - 1; i++) report(`  death ${pct(db[i])}-${pct(Math.min(1, db[i + 1]))}`, done.filter((x) => x.death >= db[i] && x.death < db[i + 1]));
console.log('-- slices');
report('all', done);
report('no door scene', done.filter((x) => !x.door));
report('door scene', done.filter((x) => x.door));
report('nothing hidden', done.filter((x) => x.cases === 1));
report('a range', done.filter((x) => x.cases > 1));
const ranged = done.filter((x) => x.cases > 1);
if (ranged.length) {
  const w = ranged.map((x) => x.hi - x.lo).sort((a, b) => a - b);
  const inside = ranged.filter((x) => x.oracleGoal >= x.lo - 0.05 && x.oracleGoal <= x.hi + 0.05).length;
  console.log(`range width: median ${pct(w[Math.floor(w.length / 2)])}, 90th ${pct(w[Math.floor(w.length * 0.9)])}; oracle inside range (±5): ${inside}/${ranged.length}; cases ${[...new Set(ranged.map((x) => x.cases))].sort().join('/')}, runs per case ${[...new Set(ranged.map((x) => x.per))].sort((a, b) => a - b).join('/')}`);
}
const nz = done.filter((x) => x.noise !== undefined);
if (nz.length) {
  const d = nz.map((x) => x.mid - x.noise!);
  const sd = Math.sqrt(d.reduce((t, x) => t + x * x, 0) / d.length);
  const exp = Math.sqrt(nz.reduce((t, x) => t + (x.noise! * (1 - x.noise!)) / x.per, 0) / nz.length);
  const big = d.filter((x) => Math.abs(x) > 0.08).length;
  console.log(`noise (120 fixed seeds vs 1000 other seeds, ${nz.length} trips): mean ${(d.reduce((t, x) => t + x, 0) / d.length * 100).toFixed(1)} pts, rms ${(sd * 100).toFixed(1)} pts (binomial expects ${(exp * 100).toFixed(1)}), off by >8 pts: ${big}`);
  const capped = nz.filter((x) => x.noise! >= 0.97);
  console.log(`trips whose 1000-seed odds are >=97%: ${capped.length}, their real goal rate ${pct(capped.filter((x) => x.met).length / Math.max(1, capped.length))}`);
}
const t = rows.map((x) => x.ms).sort((a, b) => a - b);
console.log(`time per estimate: median ${t[Math.floor(t.length / 2)].toFixed(1)} ms, 90th ${t[Math.floor(t.length * 0.9)].toFixed(1)} ms, max ${t[t.length - 1].toFixed(1)} ms`);
