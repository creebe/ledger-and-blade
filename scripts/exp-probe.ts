import { newExpGame, launchExpedition, botPlan, type ExpLength } from '../src/engine';
const len = (process.argv[2] ?? 'long') as ExpLength;
const prep = (process.argv[3] ?? 'good') as any;
const where: Record<string, number> = {};
let minHp = 0, n = 0, downs = 0, shaken = 0, used: Record<string, number> = {};
for (let i = 0; i < 200; i++) {
  const g = newExpGame(1000 + i * 7919); g.crowns = 1000;
  launchExpedition(g, botPlan(g, len, prep));
  const r = g.last!;
  const key = `${r.outcome}@${r.roomsCleared}/${r.roomsPlanned}`;
  where[key] = (where[key] ?? 0) + 1;
  const lowest = r.log.reduce((m, l) => Math.min(m, ...l.squad.hp.map((h, k) => h / l.squad.maxHp[k])), 1);
  minHp += lowest; n++;
  downs += r.log.filter((l) => l.kind === 'down').length;
  shaken += r.log.filter((l) => l.kind === 'grit' && /enough|sits down|laughing|calmly/.test(l.text)).length;
  for (const [k, v] of Object.entries(r.used)) used[k] = (used[k] ?? 0) + (v as number);
}
console.log(where);
console.log('avg lowest hp share', (minHp / n).toFixed(2), 'downs/exp', (downs / n).toFixed(2), 'shaken/exp', (shaken / n).toFixed(2));
console.log('used/exp', Object.fromEntries(Object.entries(used).map(([k, v]) => [k, (v / n).toFixed(1)])));
