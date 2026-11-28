import { describe, expect, it } from 'vitest';
import { buildSetup, expeditionOdds, generateContract, newGame, oddsRunner, openingPlan, runExpedition, SITE_IDS, suggestPlan, type Contract, type GameState, type Mission } from '../src/engine';
import { CONTRACT_TEMPLATES, TEMPLATE_BY_ID } from '../src/engine/data/contracts';

function post(s: GameState, templateId: string): Contract {
  const c = generateContract(s, TEMPLATE_BY_ID[templateId]);
  s.board.push(c);
  return c;
}

describe('expedition odds', () => {
  it('a quiet walk has exactly the outcome of a full one', () => {
    for (const site of SITE_IDS) {
      const tpl = CONTRACT_TEMPLATES.find((t) => (t.expedition?.site ?? t.regions[0]) === site && !t.story) ?? CONTRACT_TEMPLATES[0];
      for (let seed = 0; seed < 12; seed++) {
        const s = newGame(400 + seed);
        const c = generateContract(s, tpl);
        c.expedition = { ...c.expedition, site, length: (['short', 'medium', 'long'] as const)[seed % 3] };
        const ms = { contract: c, plan: suggestPlan(s, c), plannedWeeks: 3, setup: { seed: 900 + seed * 31 } } as unknown as Mission;
        const setup = buildSetup(s, ms);
        const { log: _a, ...full } = runExpedition(setup);
        const { log: _b, ...quiet } = runExpedition(setup, { quiet: true });
        expect(quiet).toEqual(full);
      }
    }
  });

  it('works the odds out without touching the game', () => {
    const s = newGame(77);
    const c = post(s, 'pellam_plate');
    const before = JSON.stringify(s);
    const o = expeditionOdds(s, c, openingPlan(s, c));
    expect(JSON.stringify(s)).toBe(before);
    expect(o).toBeDefined();
    expect(o!.goal.min).toBeGreaterThanOrEqual(0);
    expect(o!.goal.max).toBeLessThanOrEqual(1);
    const tiers = Object.values(o!.tiers).reduce((a, b) => a + b, 0);
    expect(tiers).toBeCloseTo(1, 5);
  });

  it('gives the same odds every time for the same plan', () => {
    const s = newGame(78);
    const c = post(s, 'pellam_plate');
    const plan = suggestPlan(s, c);
    const a = oddsRunner(s, c, plan);
    while (!a.step(7));
    // a copy of the state, so the cache can't answer for it
    const t = JSON.parse(JSON.stringify(s)) as GameState;
    const b = expeditionOdds(t, t.board.find((x) => x.id === c.id)!, { ...plan, orders: { ...plan.orders } }, 119);
    expect(b).toBeDefined();
    expect(a.result()!.cases.length).toBe(b!.cases.length);
    expect(Math.abs(a.result()!.goal.min - b!.goal.min)).toBeLessThan(0.1);
  });

  it("doesn't give away what a hidden danger really is", () => {
    for (let g = 0; g < 30; g++) {
      const s = newGame(600 + g);
      const c = s.board.find((x) => x.hidden.some((h) => !h.revealed && h.candidates.length > 1));
      if (!c) continue;
      const h = c.hidden.find((x) => !x.revealed && x.candidates.length > 1)!;
      const plan = openingPlan(s, c);
      if (!plan.squad.length) continue;
      const odds = h.candidates.map((t) => {
        const copy = JSON.parse(JSON.stringify(s)) as GameState;
        const cc = copy.board.find((x) => x.id === c.id)!;
        cc.hidden.find((x) => x.candidates.join() === h.candidates.join() && !x.revealed)!.trueTag = t;
        return JSON.stringify(expeditionOdds(copy, cc, plan));
      });
      expect(new Set(odds).size).toBe(1);
      return;
    }
    throw new Error('no contract with a hidden danger in 30 games');
  });

  it('a better plan gets better odds: a squad of two against a full one', () => {
    const s = newGame(91);
    const c = post(s, 'pellam_plate');
    const plan = suggestPlan(s, c);
    if (plan.squad.length < 4) return;
    const full = expeditionOdds(s, c, plan)!;
    const thin = expeditionOdds(s, c, { ...plan, squad: plan.squad.slice(0, 2) })!;
    expect(full.goal.max).toBeGreaterThanOrEqual(thin.goal.max);
  });
});
