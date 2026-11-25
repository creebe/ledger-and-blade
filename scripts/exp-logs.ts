// Sample expedition logs for the owner: `npm run exp:logs`.
// Writes docs/playthroughs/expeditions/: a well-prepared squad, a poorly
// prepared one, and one where somebody dies.
import { mkdirSync, writeFileSync } from 'node:fs';
import { DELVER_PROFS, GOODS, LENGTHS, SUPPLIES, botPlan, gearLookup, launchExpedition, newExpGame, type ExpGame, type ExpLength, type ExpPlan, type GoodId, type SupplyId } from '../src/engine';

const DIR = 'docs/playthroughs/expeditions';
mkdirSync(DIR, { recursive: true });

function play(seed: number, length: ExpLength, prep: 'good' | 'poor'): { g: ExpGame; plan: ExpPlan; before: ExpGame } {
  const g = newExpGame(seed);
  const before = JSON.parse(JSON.stringify(g)) as ExpGame;
  const plan = botPlan(g, length, prep);
  launchExpedition(g, plan);
  return { g, plan, before };
}

function write(file: string, title: string, intro: string, run: { g: ExpGame; plan: ExpPlan; before: ExpGame }) {
  const { g, plan, before } = run;
  const r = g.last!;
  const gear = gearLookup(before);
  const lines: string[] = [`# ${title}`, '', intro, '', `Seed ${before.seed}. ${LENGTHS[plan.length].name} expedition: ${LENGTHS[plan.length].goal}.`, '', '## The preparation', ''];
  plan.squad.forEach((id, i) => {
    const d = before.members.find((m) => m.id === id)!;
    lines.push(`${i + 1}. **${d.name}**, ${DELVER_PROFS[d.prof].name}: ${[d.weapon, d.armor, d.trinket].map((u) => gear(u)?.name).filter(Boolean).join(', ')}`);
  });
  lines.push('', `**Pack:** ${(Object.keys(plan.pack) as SupplyId[]).filter((k) => plan.pack[k]).map((k) => `${plan.pack[k]} ${SUPPLIES[k].name.toLowerCase()}`).join(', ') || 'nothing'}.`);
  const o = plan.orders;
  lines.push('', `**Orders:** turn back: ${o.retreat}; heal first: ${o.healFirst}; wandering monsters: ${o.wanderers}; camp: ${o.camp === 'sites' ? 'at camp sites' : 'when hurt'}; supplies: ${o.consumables}.`, '', '## The log', '');
  const names = plan.squad.map((id) => before.members.find((m) => m.id === id)!.name.split(' ')[0]);
  let lastSnap = '';
  for (const l of r.log) {
    const t = `${l.text}${l.note ? ` *(${l.note})*` : ''}`;
    lines.push(l.kind === 'zone' ? `### ${l.text}` : l.big ? `**${t}**` : t, '');
    const snap = names.map((n, i) => `${n} ${l.squad.state[i] === 'ok' ? `${l.squad.hp[i]}/${l.squad.maxHp[i]} hp, fatigue ${l.squad.fatigue[i]}${l.squad.exposure[i] ? `, exposure ${l.squad.exposure[i]}` : ''}` : l.squad.state[i]}`).join(' · ');
    if ((l.kind === 'win' && /over|down|quiet|end|win|believe|dead/i.test(l.text)) || l.kind === 'camp' || l.kind === 'death') {
      if (snap !== lastSnap) lines.push(`> ${snap}`, '');
      lastSnap = snap;
    }
  }
  lines.push('## What came home', '');
  lines.push(`Outcome: **${r.outcome}**, ${r.roomsCleared} of ${r.roomsPlanned} rooms.`);
  const loot = (Object.keys(r.loot) as GoodId[]).filter((k) => (r.loot[k] ?? 0) > 0);
  lines.push(`Loot: ${loot.map((k) => `${r.loot[k]} ${GOODS[k].name.toLowerCase()}`).join(', ') || 'nothing'}, worth ${r.lootValue} crowns, plus ${r.crownsFound} in coin.`);
  if (r.deeds.length) lines.push(`Renown: ${r.deeds.join('; ')}.`);
  lines.push('');
  for (const m of r.members) {
    const d = g.members.find((x) => x.id === m.id)!;
    lines.push(`- **${d.name}**: ${m.died ? `died (${m.died})` : `${m.hp} HP, fatigue ${m.fatigue}, exposure ${m.exposure}, +${m.xp} experience`}${m.scars.length ? `; new scar: ${m.scars.join(', ')}` : ''}${m.habits.length ? `; new habit: ${m.habits.join(', ')}` : ''}${m.changes.length ? `; Sink change: ${m.changes.join(', ')}` : ''}${m.fever ? `; came home with the Sink fever (will become ${m.fever})` : ''}.`);
  }
  writeFileSync(`${DIR}/${file}`, lines.join('\n') + '\n');
  console.log(`${DIR}/${file}: ${r.outcome}, ${r.log.length} lines, ${r.members.filter((m) => m.died).length} dead`);
}

const find = (test: (r: ReturnType<typeof play>) => boolean, length: ExpLength, prep: 'good' | 'poor', from: number) => {
  for (let s = from; s < from + 400; s++) {
    const run = play(s, length, prep);
    if (test(run)) return run;
  }
  throw new Error(`no seed found for ${length} ${prep}`);
};

write(
  '1-well-prepared.md',
  'A well-prepared squad',
  'A sensible squad in sensible ranks, with a full pack for the route and steady orders. Medium length, down to the Buried Streets.',
  find((r) => r.g.last!.outcome === 'complete' && r.g.last!.log.some((l) => l.kind === 'trap') && r.g.last!.log.some((l) => l.kind === 'camp'), 'medium', 'good', 2101),
);
write(
  '2-poorly-prepared.md',
  'A poorly prepared squad',
  'Whoever was nearest, in whatever order they stood. One meal, two bandages, no lamp oil, no tools, no reagents. Stubborn orders, fight everything, hoard supplies. The same medium route.',
  find((r) => r.g.last!.members.some((m) => m.died) && r.g.last!.outcome !== 'complete' && r.g.last!.log.length > 60, 'medium', 'poor', 2101),
);
write(
  '3-somebody-dies.md',
  'Somebody dies',
  'A good squad with a full pack goes all the way down to the College Sink and the Kiln Engine. They are not quite good enough yet.',
  find((r) => r.g.last!.members.filter((m) => m.died).length === 1 && r.g.last!.outcome !== 'lost', 'long', 'good', 3001),
);
