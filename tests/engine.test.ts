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

  it('a careful bot usually survives the first season', () => {
    const r = runSim(12, 12, 0.6);
    expect(r.survivalRate).toBeGreaterThanOrEqual(0.75);
  });
});
