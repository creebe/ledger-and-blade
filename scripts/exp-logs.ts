// Sample expedition logs, one file per site: a medium trip and a long trip to
// the boss, walked by a seasoned squad of four, so the owner can read the
// sites without playing. Writes docs/playthroughs/sites/<site>.md.
//   npm run exp:logs
import { mkdirSync, writeFileSync } from 'node:fs';
import { buildSetup, generateContract, newGame, runExpedition, suggestPlan, SITES, SITE_IDS, goalText, type Mission } from '../src/engine';
import { CONTRACT_TEMPLATES } from '../src/engine/data/contracts';
import { ZONES } from '../src/engine/expeditions/data/content';

const OUT = 'docs/playthroughs/sites';
mkdirSync(OUT, { recursive: true });

function trip(site: (typeof SITE_IDS)[number], kind: 'medium' | 'long', seed: number) {
  const s = newGame(seed);
  for (const m of s.members) {
    m.level = 3;
    m.health = 100;
    m.fatigue = 0;
  }
  const mine = CONTRACT_TEMPLATES.filter((t) => t.expedition?.site === site);
  const tpl = kind === 'long' ? mine.find((t) => t.expedition?.length === 'long') : mine.find((t) => t.expedition?.length === 'medium');
  const c = generateContract(s, tpl ?? CONTRACT_TEMPLATES.find((t) => t.regions[0] === site && !t.story)!);
  c.tags = [];
  c.hidden = [];
  const ms = { contract: c, plan: suggestPlan(s, c), plannedWeeks: 5, setup: { seed: seed * 31 } } as unknown as Mission;
  const r = runExpedition(buildSetup(s, ms));
  const L = [`## ${c.title}: ${goalText(c)}`, '', `_${kind === 'long' ? 'Long' : 'Medium'} route. Outcome: ${r.outcome}, ${r.roomsCleared} of ${r.roomsPlanned} rooms, job ${r.goalMet ? 'done' : 'not done'}._`, ''];
  let week = 0;
  let zone = '';
  for (const l of r.log) {
    if (l.week !== week) {
      week = l.week;
      L.push('', `**Week ${week}**`, '');
    }
    if (l.zone && l.zone !== zone) zone = l.zone;
    L.push(`- ${l.big ? `**${l.text}**` : l.text}${l.note ? ` _(${l.note})_` : ''}`);
  }
  const dead = r.members.map((m, i) => (m.died ? `${r.names[i]} (${m.died})` : '')).filter(Boolean);
  L.push('', `_Home: ${dead.length ? `lost ${dead.join(', ')}` : 'nobody lost'}. Deeds: ${r.deeds.length ? r.deeds.join('; ') : 'none'}._`, '');
  return L.join('\n');
}

for (const site of SITE_IDS) {
  if (site === 'pellam') continue;
  const def = SITES[site];
  const L = [`# ${def.name}: sample expeditions`, '', `${def.text}`, '', `Zones: ${def.zones.map((z) => ZONES[z].name).join(', ')}. Boss: ${def.boss ? def.boss.goalText.replace(/^./, (x) => x.toLowerCase()) : 'none'}.`, '', 'Written by `npm run exp:logs`: a seasoned squad of four (level 3, rested) on a medium trip and on the long trip to the boss. Log lines as the player reads them; bold lines are the ones the game bolds.', ''];
  L.push(trip(site, 'medium', 41 + site.length));
  L.push(trip(site, 'long', 59 + site.length));
  writeFileSync(`${OUT}/${site}.md`, L.join('\n'));
  console.log(`${OUT}/${site}.md`);
}
