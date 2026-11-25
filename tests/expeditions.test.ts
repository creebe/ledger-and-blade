import { describe, expect, it } from 'vitest';
import {
  EXP_SAVE_VERSION,
  EXP_TUNING,
  botPlan,
  gearLookup,
  launchExpedition,
  livingDelvers,
  migrateExpSave,
  newExpGame,
  planBlocked,
  poorPlan,
  runExpedition,
  sampleDives,
  suggestPlan,
  type ExpGame,
  type ExpLength,
} from '../src/engine';

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

describe('expeditions: the dive', () => {
  it('gives the same log for the same seed and preparation', () => {
    const g = newExpGame(42);
    const plan = suggestPlan(g, 'long');
    const squad = plan.squad.map((id) => g.members.find((m) => m.id === id)!);
    const a = runExpedition(clone(squad), plan, { seed: 99, gear: gearLookup(g) });
    const b = runExpedition(clone(squad), plan, { seed: 99, gear: gearLookup(g) });
    expect(a.log.map((l) => l.text)).toEqual(b.log.map((l) => l.text));
    expect(a.members).toEqual(b.members);
  });

  it('changes when the preparation changes', () => {
    const g = newExpGame(42);
    const plan = suggestPlan(g, 'medium');
    const squad = plan.squad.map((id) => g.members.find((m) => m.id === id)!);
    const a = runExpedition(clone(squad), plan, { seed: 7, gear: gearLookup(g) });
    const b = runExpedition(clone(squad), { ...plan, pack: { food: 0 }, orders: { ...plan.orders, wanderers: 'fight' } }, { seed: 7, gear: gearLookup(g) });
    expect(a.log.map((l) => l.text).join('\n')).not.toEqual(b.log.map((l) => l.text).join('\n'));
  });

  it('never leaves a placeholder or a missing line in the log', () => {
    for (let i = 0; i < 120; i++) {
      const g = newExpGame(500 + i);
      g.crowns = 1000;
      const length = (['short', 'medium', 'long'] as ExpLength[])[i % 3];
      launchExpedition(g, botPlan(g, length, i % 2 ? 'poor' : 'good'));
      for (const l of g.last!.log) {
        expect(l.text, l.text).not.toMatch(/\{\w+\}|undefined|NaN|^[a-z_]+$/);
        expect(l.text[0], l.text).toBe(l.text[0].toUpperCase());
        expect(l.squad.hp.length).toBe(4);
      }
    }
  });

  it('rewards good preparation over poor, clearly', () => {
    const good = sampleDives('medium', 'good', 80);
    const poor = sampleDives('medium', 'poor', 80);
    expect(good.deaths).toBeLessThan(poor.deaths);
    expect(good.squadIntact).toBeGreaterThan(poor.squadIntact + 15);
    expect(good.loot).toBeGreaterThan(poor.loot);
  });
});

describe('expeditions: the guild', () => {
  it('blocks a plan that does not fit the pack or lacks a full squad', () => {
    const g = newExpGame(3);
    const plan = suggestPlan(g, 'short');
    expect(planBlocked(g, plan)).toBeUndefined();
    expect(planBlocked(g, { ...plan, squad: plan.squad.slice(0, 3) })).toMatch(/four/);
    expect(planBlocked(g, { ...plan, pack: { food: EXP_TUNING.packSlots * 3 + 3 } })).toMatch(/slots/);
  });

  it('passes the weeks, pays wages and brings the squad home', () => {
    const g = newExpGame(11);
    const before = g.crowns;
    const plan = suggestPlan(g, 'medium');
    expect(launchExpedition(g, plan)).toBeUndefined();
    expect(g.week).toBe(3);
    expect(g.expeditions).toBe(1);
    expect(g.last).toBeTruthy();
    const wages = g.members.reduce((s, m) => s + m.wage, 0) * 2;
    expect(g.crowns).toBeLessThan(before - wages + g.last!.crownsFound + 400);
    for (const o of g.last!.members) {
      const d = g.members.find((m) => m.id === o.id)!;
      if (o.died) expect(d.status).toBe('dead');
      else expect(d.hp).toBeGreaterThan(0);
    }
  });

  it('can kill members for good', () => {
    let deaths = 0;
    for (let i = 0; i < 40 && !deaths; i++) {
      const g = newExpGame(900 + i);
      launchExpedition(g, poorPlan(g, 'long'));
      deaths = g.members.filter((m) => m.status === 'dead').length;
      if (deaths) expect(livingDelvers(g).length).toBe(6 - deaths);
    }
    expect(deaths).toBeGreaterThan(0);
  });
});

describe('expeditions: saves', () => {
  it('round-trips a trial save and refuses anything else', () => {
    const g = newExpGame(5);
    launchExpedition(g, suggestPlan(g, 'short'));
    const back = migrateExpSave(JSON.parse(JSON.stringify(g)) as ExpGame);
    expect(back?.version).toBe(EXP_SAVE_VERSION);
    expect(back?.week).toBe(g.week);
    expect(migrateExpSave(null)).toBeNull();
    expect(migrateExpSave({ ...g, version: 999 })).toBeNull();
    expect(migrateExpSave({ week: 1 } as unknown as ExpGame)).toBeNull();
  });
});
