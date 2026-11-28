import { it, expect } from 'vitest';
import { buildSetup, generateContract, newGame, runExpedition, SITE_IDS, suggestPlan, type Mission } from '../src/engine';
import { CONTRACT_TEMPLATES } from '../src/engine/data/contracts';
const deepFreeze = (o: any): any => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); for (const k of Object.keys(o)) deepFreeze(o[k]); } return o; };
it('runExpedition never mutates its setup', () => {
  let n = 0;
  for (const tpl of CONTRACT_TEMPLATES) {
    if (!tpl.expedition) continue;
    for (let seed = 0; seed < 6; seed++) {
      const s = newGame(1000 + seed);
      const c = generateContract(s, tpl);
      for (const length of ['short','medium','long'] as const) {
        c.expedition = { ...c.expedition, length };
        const ms = { contract: c, plan: suggestPlan(s, c), plannedWeeks: 3, setup: { seed: 77 + seed } } as unknown as Mission;
        const setup = buildSetup(s, ms);
        if (!setup.squad.length) continue;
        const before = JSON.stringify(setup);
        deepFreeze(setup);
        for (let k = 0; k < 4; k++) { runExpedition({ ...setup, seed: 31 * k + seed + 1 }, { quiet: true }); runExpedition({ ...setup, seed: 31 * k + seed + 1 }); n++; }
        expect(JSON.stringify(setup)).toBe(before);
      }
    }
  }
  console.log('runs', n);
});
