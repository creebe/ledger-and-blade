import { describe, expect, it } from 'vitest';
import {
  EXP_SAVE_VERSION,
  EXP_TUNING,
  dismissDelver,
  restWeek,
  storedGear,
  treatExposure,
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

describe('expeditions: fatigue and exposure', () => {
  it('builds fatigue on an expedition and clears it with rest at home', () => {
    const g = newExpGame(21);
    g.crowns = 1000;
    const plan = suggestPlan(g, 'medium');
    launchExpedition(g, plan);
    const back = plan.squad.map((id) => g.members.find((m) => m.id === id)!).filter((d) => d.status !== 'dead');
    const before = back.map((d) => d.fatigue);
    expect(Math.max(...before)).toBeGreaterThan(20);
    restWeek(g);
    back.forEach((d, i) => expect(d.fatigue).toBeLessThan(Math.max(1, before[i])));
  });

  it('exposes a squad in the Sink, less with masks, and Saint Oda can treat it', () => {
    let runs = 0;
    const run = (masks: number) => {
      const g = newExpGame(77 + runs);
      g.crowns = 1000;
      const plan = suggestPlan(g, 'long');
      plan.pack = { food: 5, oil: 12, bandages: 6, reagents: 3, draughts: 1, masks };
      expect(launchExpedition(g, plan)).toBeUndefined();
      return g.last!.members.filter((m) => !m.died).reduce((s, m) => s + m.exposure, 0) / Math.max(1, g.last!.members.filter((m) => !m.died).length);
    };
    let bare = 0;
    let masked = 0;
    void 0;
    for (let i = 0; i < 6; i++) {
      const seed = runs;
      bare += run(0);
      runs = seed;
      masked += run(4);
      runs = seed + 1;
    }
    expect(masked).toBeLessThan(bare);
    const g = newExpGame(3);
    const d = g.members[0];
    d.exposure = 50;
    expect(treatExposure(g, d.id)).toBeUndefined();
    expect(d.exposure).toBe(50 - EXP_TUNING.exposure.treat);
  });
});

describe('expeditions: the guild keeps its promises', () => {
  it('pays a Weighhouse installment that falls due mid-trip from what the squad brings home', () => {
    let checked = 0;
    for (let i = 0; i < 30; i++) {
      const g = newExpGame(300 + i);
      g.week = g.debt.dueWeek - 1;
      g.debt.missed = 1;
      g.crowns = 130;
      const plan = suggestPlan(g, 'medium');
      plan.pack = { food: 3, oil: 4 };
      launchExpedition(g, plan);
      if (g.last!.outcome === 'lost' || g.last!.lootValue + g.last!.crownsFound < 200) continue;
      checked++;
      expect(g.gameOver).toBeUndefined();
      expect(g.debt.missed).toBe(0);
    }
    expect(checked).toBeGreaterThan(5);
  });

  it('lets a broke guild set out on supplies it already has', () => {
    const g = newExpGame(9);
    g.crowns = -20;
    const plan = suggestPlan(g, 'short');
    plan.pack = { food: 2, bandages: 2 };
    expect(planBlocked(g, plan)).toBeUndefined();
  });

  it('keeps a sponsor deal agreed at the door, even if the offer lapses during the trip', () => {
    let paid = 0;
    for (let i = 0; i < 40 && !paid; i++) {
      const g = newExpGame(600 + i);
      g.crowns = 1000;
      const s = g.sponsors.find((x) => x.goal.kind === 'reach' || (x.goal.kind === 'kill' && x.goal.monster === 'rats'));
      if (!s) continue;
      s.expiresWeek = g.week + 1;
      const plan = { ...suggestPlan(g, 'medium'), sponsorId: s.id };
      launchExpedition(g, plan);
      if (g.last!.sponsorMet) paid++;
    }
    expect(paid).toBeGreaterThan(0);
  });

  it('lets a dismissed member leave with the gear they wear', () => {
    const g = newExpGame(4);
    const d = g.members[0];
    const before = g.gear.length;
    expect(dismissDelver(g, d.id)).toBeUndefined();
    expect(g.gear.length).toBe(before - 2);
    expect(storedGear(g).length).toBe(0);
  });

  it('breaks the Kiln Engine only once', () => {
    const g = newExpGame(8);
    g.kilnBroken = true;
    for (let i = 0; i < 6; i++) {
      g.crowns = 1000;
      for (const d of g.members) {
        d.hp = 999;
        d.fatigue = 0;
      }
      launchExpedition(g, suggestPlan(g, 'long'));
      expect(g.last!.kills.kiln ?? 0).toBe(0);
    }
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

  it('upgrades a v1 save: grit becomes fatigue, charms become masks', () => {
    const g = JSON.parse(JSON.stringify(newExpGame(6))) as Record<string, any>;
    g.version = 1;
    for (const m of g.members) {
      delete m.fatigue;
      delete m.exposure;
      delete m.conditions;
      m.grit = 40;
    }
    g.stores.charms = 3;
    delete g.stores.masks;
    const up = migrateExpSave(g as unknown as ExpGame)!;
    expect(up.version).toBe(2);
    expect(up.members[0].fatigue).toBe(30);
    expect(up.members[0].exposure).toBe(0);
    expect(up.stores.masks).toBe(3);
    expect((up.members[0] as unknown as { grit?: number }).grit).toBeUndefined();
  });
});
