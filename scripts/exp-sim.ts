// Balance report for the expeditions trial: `npm run exp:sim [runs]`.
import { sampleCampaigns, sampleDives, type ExpLength } from '../src/engine';
const runs = Number(process.argv[2] ?? 300);
const pct = (a: number, b: number) => `${Math.round((a / b) * 100)}%`;
console.log(`One expedition from a fresh guild, ${runs} seeds each\n`);
console.log('length  prep  | done  back  lost | squad intact | deaths/exp | loot/exp | renown/exp');
for (const l of ['short', 'medium', 'long'] as ExpLength[]) {
  for (const p of ['good', 'poor'] as const) {
    const s = sampleDives(l, p, runs);
    console.log(
      `${l.padEnd(7)} ${p.padEnd(5)} | ${pct(s.complete, runs).padStart(4)} ${pct(s.retreated, runs).padStart(5)} ${pct(s.lost, runs).padStart(5)} | ${pct(s.squadIntact, runs).padStart(12)} | ${(s.deaths / runs).toFixed(2).padStart(10)} | ${Math.round(s.loot / runs).toString().padStart(8)} | ${(s.renown / runs).toFixed(1).padStart(10)}`,
    );
  }
}
const games = Math.max(40, Math.round(runs / 3));
for (const p of ['good', 'poor'] as const) {
  const c = sampleCampaigns(games, 24, p);
  console.log(
    `\nCampaign, ${p} preparation, ${games} games of 24 weeks: ${pct(c.open, games)} still open, ${(c.expeditions / games).toFixed(1)} expeditions, ${(c.deaths / games).toFixed(1)} deaths, renown ${(c.renown / games).toFixed(0)}, ${(c.crowns / games).toFixed(0)} crowns at the end, ${Math.round(c.debtPaid / games)} of the loan repaid, Kiln Engine broken in ${pct(c.bossKills, games)} of games`,
  );
}
