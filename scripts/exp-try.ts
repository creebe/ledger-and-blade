import { newExpGame, suggestPlan, launchExpedition } from '../src/engine';
const g = newExpGame(Number(process.argv[2] ?? 7));
const plan = suggestPlan(g, (process.argv[3] as any) ?? 'medium');
console.log(JSON.stringify(plan));
const err = launchExpedition(g, plan);
if (err) console.log('ERR', err);
const r = g.last!;
for (const l of r.log) console.log(`${l.big ? '**' : '  '}${l.text}${l.note ? `  [${l.note}]` : ''}   | ${l.squad.hp.join('/')} g${l.squad.grit.join('/')} ${l.squad.state.join(',')}`);
console.log(r.outcome, r.lootValue, r.crownsFound, r.deeds, r.used, r.members.map(m=>[m.died,m.scars,m.habits,m.xp]));
