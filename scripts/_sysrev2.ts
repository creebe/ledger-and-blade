import { buildSetup, generateContract, newGame, runExpedition, suggestPlan, planWarnings, type Mission } from '../src/engine';
import { CONTRACT_TEMPLATES } from '../src/engine/data/contracts';
const s0 = newGame(1);
console.log('start crowns', s0.crowns, 'levels', s0.members.map((m) => m.level), 'board', s0.board.map((c) => `${c.templateId}:${c.threat}:${c.reward}:${c.expedition.length}`));
const ids = CONTRACT_TEMPLATES.filter((x) => (x.expedition?.site && x.expedition.site !== 'pellam') || ['wolf_cull'].includes(x.id)).map((t) => t);
for (const t of ids) {
  let met = 0, deaths = 0, lost = 0, reward = 0, warned = 0; const N = 60;
  for (let i = 0; i < N; i++) {
    const s = newGame(3000 + i);
    const c = generateContract(s, t); c.tags = []; c.hidden = [];
    reward += c.reward;
    const plan = suggestPlan(s, c);
    if (planWarnings(s, c, plan).some((w) => w.includes('green'))) warned++;
    const ms = { contract: c, plan, plannedWeeks: 5, setup: { seed: 9000 + i * 13 } } as unknown as Mission;
    const r = runExpedition(buildSetup(s, ms));
    if (r.goalMet) met++; if (r.outcome === 'lost') lost++; deaths += r.members.filter((m) => m.died).length;
  }
  console.log(`wk1 ${t.id.padEnd(18)} ${String(t.expedition?.length ?? '-').padEnd(6)} reward ${(reward / N).toFixed(0)} goal ${(met / N * 100).toFixed(0)}% lost ${(lost / N * 100).toFixed(0)}% deaths ${(deaths / N).toFixed(2)} greenWarn ${warned}/${N}`);
}
// classic postings at week 1
let tot = 0, n = 0;
for (let i = 0; i < 200; i++) { const s = newGame(4000 + i); for (const c of s.board) if (!c.story && !c.expedition.goal || c.expedition.goal.kind === 'complete') { tot += c.reward; n++; } }
console.log('avg classic week-1 reward', (tot / n).toFixed(0));
