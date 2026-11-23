import { describe, expect, it } from 'vitest';
import {
  advanceWeek,
  bestApproaches,
  buyItem,
  chanceFrom,
  dispatchMission,
  equip,
  living,
  newGame,
  previewMission,
  resolveEvent,
  revealTag,
  type GameState,
} from '../src/engine';
import { runSim } from '../scripts/sim';
import { buyMaterial, level, migrateSave, queueCraft, setAssignment, startBuild, tripWeeks, upkeep } from '../src/engine';

const clearEvents = (s: GameState) => {
  while (s.pendingEvents.length) resolveEvent(s, s.pendingEvents[0].uid, 0);
};

describe('engine', () => {
  it('is deterministic for a given seed', () => {
    const a = newGame(42);
    const b = newGame(42);
    for (let i = 0; i < 6; i++) {
      for (const s of [a, b]) {
        clearEvents(s);
        advanceWeek(s);
      }
    }
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
  });

  it('chance rises with score and falls with difficulty', () => {
    expect(chanceFrom(20, 10)).toBeGreaterThan(chanceFrom(10, 10));
    expect(chanceFrom(10, 20)).toBeLessThan(chanceFrom(10, 10));
    expect(chanceFrom(10, 10)).toBeCloseTo(0.5, 2);
    expect(chanceFrom(1000, 1)).toBeLessThanOrEqual(0.97);
  });

  it('shows a range for hidden tags that narrows when revealed', () => {
    const s = newGame(7);
    s.intel = 20;
    const c = s.board.find((x) => x.hidden.length > 0)!;
    const team = living(s);
    const before = previewMission(s, c, team, bestApproaches(s, c, team));
    for (let i = 0; i < c.hidden.length; i++) revealTag(s, c.id, i);
    const after = previewMission(s, c, team, bestApproaches(s, c, team));
    for (let i = 0; i < after.phases.length; i++) {
      expect(after.phases[i].certain).toBe(true);
      expect(after.phases[i].max - after.phases[i].min).toBeLessThanOrEqual(before.phases[i].max - before.phases[i].min + 1e-9);
    }
  });

  it('elemental matchups change odds (frost vs fireborn)', () => {
    const s = newGame(9);
    const c = s.board[0];
    c.tags = ['fireborn'];
    c.hidden = [];
    c.phases = [{ name: 'Fight', approaches: ['assault'], weight: 1, danger: 1, text: '' }];
    const team = living(s);
    const base = previewMission(s, c, team, ['assault']).phases[0].chance;
    s.crowns = 1000;
    s.stock.push('frost_salts', 'fire_oil');
    buyItem(s, 'frost_salts');
    const frost = s.items[s.items.length - 1].uid;
    equip(s, team[0].id, 'consumable', frost, 0);
    const withFrost = previewMission(s, c, team, ['assault']).phases[0].chance;
    expect(withFrost).toBeGreaterThan(base);
    buyItem(s, 'fire_oil');
    const fire = s.items[s.items.length - 1].uid;
    equip(s, team[0].id, 'consumable', fire, 0);
    const withFire = previewMission(s, c, team, ['assault']).phases[0].chance;
    expect(withFire).toBeLessThan(withFrost);
  });

  it('runs a mission from dispatch to return', () => {
    const s = newGame(11);
    clearEvents(s);
    const c = [...s.board].sort((a, b) => a.travelWeeks - b.travelWeeks)[0];
    const team = living(s).slice(0, c.minSquad);
    const err = dispatchMission(s, c.id, team.map((m) => m.id), bestApproaches(s, c, team), true);
    expect(err).toBeUndefined();
    expect(team.every((m) => m.status === 'mission')).toBe(true);
    for (let i = 0; i <= c.travelWeeks * 2 + 1; i++) {
      clearEvents(s);
      advanceWeek(s);
    }
    expect(s.history.length).toBe(1);
    expect(s.history[0].report).toBeDefined();
    expect(team.every((m) => m.status !== 'mission')).toBe(true);
  });

  it('story events are multi-step conversations', () => {
    const s = newGame(5);
    const ev = s.pendingEvents[0];
    expect(ev.defId).toBe('charter');
    // ask about the debt, then continue: the event stays open across nodes
    resolveEvent(s, ev.uid, 0);
    expect(s.pendingEvents[0]?.node).toBe('debt');
    resolveEvent(s, ev.uid, 0);
    expect(s.pendingEvents[0]?.node).toBe('start');
    resolveEvent(s, ev.uid, 2); // keep the coin
    expect(s.pendingEvents.length).toBe(0);
    const d = s.dispatches[s.dispatches.length - 1];
    expect(d.body.length).toBe(3); // the whole conversation is recorded
  });

  it('missions produce a journal and a service record', () => {
    const s = newGame(13);
    clearEvents(s);
    const c = [...s.board].sort((a, b) => a.travelWeeks - b.travelWeeks)[0];
    const team = living(s).slice(0, c.maxSquad);
    dispatchMission(s, c.id, team.map((m) => m.id), bestApproaches(s, c, team), false);
    for (let i = 0; i <= c.travelWeeks * 2 + 1; i++) {
      clearEvents(s);
      advanceWeek(s);
    }
    const r = s.history[0].report!;
    expect(r.outbound?.lines.length).toBeGreaterThan(0);
    expect(r.homeward?.lines.length).toBeGreaterThan(0);
    expect(r.phases.every((p) => (p.story ?? []).length > 0)).toBe(true);
    expect(team.some((m) => m.record.length > 0)).toBe(true);
  });

  it('squads on the road can be reported on and withdrawn', () => {
    for (let seed = 1; seed < 60; seed++) {
      const s = newGame(seed);
      clearEvents(s);
      const c = s.board.find((x) => x.travelWeeks > 0 && x.hidden.length > 0);
      if (!c) continue;
      const team = living(s).slice(0, Math.max(c.minSquad, 3));
      if (dispatchMission(s, c.id, team.map((m) => m.id), bestApproaches(s, c, team), true)) continue;
      // advance to the arrival week, answering anything else that comes up
      while (s.week < s.missions[0].arriveWeek) {
        clearEvents(s);
        advanceWeek(s);
      }
      const report = s.pendingEvents.find((e) => e.defId === 'field_arrival');
      expect(report?.missionId).toBe(s.missions[0].id);
      const withdraw = report!.choices.findIndex((ch) => ch.effects.mission?.withdraw);
      resolveEvent(s, report!.uid, withdraw);
      expect(s.missions[0].report?.tier).toBe('Withdrawn');
      expect(c.hidden.every((h) => h.revealed)).toBe(false);
      for (let i = 0; i < 4 && s.missions.length; i++) {
        clearEvents(s);
        advanceWeek(s);
      }
      expect(team.every((m) => m.status !== 'mission')).toBe(true);
      expect(team.every((m) => m.status !== 'dead')).toBe(true);
      return;
    }
    throw new Error('no suitable seed found');
  });

  it('buildings take time, cost upkeep, and builders speed them up', () => {
    const s = newGame(21);
    clearEvents(s);
    s.crowns = 2000;
    s.materials = { iron: 50, leather: 50, timber: 50, reagents: 50 };
    const before = upkeep(s);
    expect(startBuild(s, 'forge')).toBeUndefined();
    expect(startBuild(s, 'stillroom')).toMatch(/Already building/);
    for (const m of living(s).slice(0, 2)) setAssignment(s, m.id, 'build');
    advanceWeek(s); // 1 + 2 × 0.5 = 2 weeks of progress
    clearEvents(s);
    expect(level(s, 'forge')).toBe(0);
    advanceWeek(s);
    clearEvents(s);
    expect(level(s, 'forge')).toBe(1);
    expect(upkeep(s)).toBe(before + 3);
    expect(living(s).every((m) => m.assignment !== 'build')).toBe(true);
  });

  it('crafting turns materials into items at the end of the week, within capacity', () => {
    const s = newGame(22);
    clearEvents(s);
    s.crowns = 2000;
    s.facilities.forge = 1;
    s.materials = { iron: 0, leather: 0, timber: 0, reagents: 0 };
    expect(queueCraft(s, 'arming_sword')).toMatch(/Need 3 Iron/);
    buyMaterial(s, 'iron', 10);
    expect(queueCraft(s, 'arming_sword')).toBeUndefined();
    expect(queueCraft(s, 'mace')).toBeUndefined();
    expect(queueCraft(s, 'fire_oil')).toMatch(/Stillroom/);
    const swords = () => s.items.filter((i) => i.defId === 'arming_sword').length;
    const n = swords();
    advanceWeek(s);
    clearEvents(s);
    expect(swords()).toBe(n + 1); // forge level 1 makes one item a week
    expect(s.craftQueue).toEqual(['mace']);
  });

  it('stables shorten trips', () => {
    const s = newGame(23);
    expect(tripWeeks(s, 2)).toEqual({ out: 2, back: 2 });
    s.facilities.stables = 1;
    expect(tripWeeks(s, 2)).toEqual({ out: 2, back: 1 });
    s.facilities.stables = 2;
    expect(tripWeeks(s, 2)).toEqual({ out: 1, back: 1 });
    expect(tripWeeks(s, 1)).toEqual({ out: 1, back: 0 });
  });

  it('old saves are upgraded', () => {
    const s = newGame(24) as unknown as Record<string, unknown>;
    delete s.facilities;
    delete s.craftQueue;
    s.version = 3;
    const g = migrateSave(s as never)!;
    expect(g.version).toBe(4);
    expect(g.facilities.hall).toBe(1);
    expect(g.craftQueue).toEqual([]);
  });

  it('a careful bot usually survives the first season', () => {
    const r = runSim(12, 12, 0.6);
    expect(r.survivalRate).toBeGreaterThanOrEqual(0.75);
  });
});
