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
import { claimNote, buySupplies, supplyCost, buyMaterial, cancelDispatch, discoverLore, checkTutorial, guideView, OBJECTIVES, level, lobby, setPosition, supplyPrice, tally, migrateSave, queueCraft, setAssignment, startBuild, tripWeeks, upkeep } from '../src/engine';

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
    s.crowns = 5000;
    clearEvents(s);
    let ev = s.pendingEvents[0];
    for (let i = 0; i < 4 && !(ev && ev.defId === 'ostrander_agent'); i++) {
      advanceWeek(s);
      ev = s.pendingEvents.find((e) => e.defId === 'ostrander_agent')!;
      if (!ev) clearEvents(s);
    }
    expect(ev.defId).toBe('ostrander_agent');
    resolveEvent(s, ev.uid, 0); // hear her out
    expect(s.pendingEvents.find((e) => e.uid === ev.uid)?.node).toBe('pitch');
    const terms = s.pendingEvents.find((e) => e.uid === ev.uid)!.choices.findIndex((c) => c.next === 'terms');
    resolveEvent(s, ev.uid, terms);
    resolveEvent(s, ev.uid, 1); // case by case
    expect(s.pendingEvents.some((e) => e.uid === ev.uid)).toBe(false);
    expect(s.flags.ostranders_open).toBe(true);
    const d = s.dispatches.filter((x) => x.title === "A Visitor from Ostrander's").pop()!;
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
    expect(g.version).toBe(8);
    expect(g.facilities.hall).toBe(1);
    expect(g.craftQueue).toEqual([]);
  });

  it('the Council posts an agenda, can be lobbied, and votes at the end of the season', () => {
    const s = newGame(31);
    s.crowns = 5000; // keep the guild solvent while it does nothing but politics
    while (s.week < 7) {
      clearEvents(s);
      advanceWeek(s);
    }
    expect(s.council.agenda.length).toBe(2);
    const item = s.council.agenda[0];
    // work for the side the bank opposes or that is undecided-heavy: support it
    expect(lobby(s, item.id, 'lowertown', 'influence')).toMatch(/position/);
    setPosition(s, item.id, 1);
    s.influence = 50;
    const target = (['exchequer', 'weighhouse', 'ostranders', 'lowertown'] as const).find((f) => item.positions[f] < 1)!;
    const before = item.positions[target];
    expect(lobby(s, item.id, target, 'influence')).toBeUndefined();
    expect(item.positions[target]).toBe(before + 1);
    expect(lobby(s, item.id, target, 'influence')).toMatch(/already/i);
    // push everyone over so it passes
    for (let w = 0; w < 6 && s.council.agenda.length; w++) {
      for (const f of ['exchequer', 'weighhouse', 'ostranders', 'lowertown'] as const) if (s.council.agenda[0]?.positions[f] !== 1) lobby(s, item.id, f, 'influence');
      clearEvents(s);
      advanceWeek(s);
    }
    expect(s.council.agenda.length).toBe(0);
    const record = s.council.history.find((h) => h.id === item.id)!;
    expect(record.passed).toBe(true);
    expect(s.council.active.some((a) => a.id === item.id)).toBe(true);
  });

  it('decrees in force change the economy', () => {
    const s = newGame(32);
    const base = supplyPrice(s);
    s.council.active.push({ id: 'grain_levy', untilWeek: s.week + 12 });
    expect(supplyPrice(s)).toBeGreaterThan(base);
    expect(tally({ id: 'x', base: {} as never, positions: { exchequer: 1, weighhouse: -1, ostranders: -1, lowertown: 0 }, player: 0 }).passes).toBe(false); // 3 vs 4
  });

  it("Guildmaster's Notes complete from real actions and pay out once", () => {
    const s = newGame(41);
    clearEvents(s);
    expect(guideView(s).active[0].id).toBe('first_contract');
    const c = [...s.board].sort((a, b) => a.travelWeeks - b.travelWeeks)[0];
    const team = living(s).slice(0, c.minSquad);
    const crowns = s.crowns;
    dispatchMission(s, c.id, team.map((m) => m.id), bestApproaches(s, c, team), true);
    const done = checkTutorial(s).map((o) => o.id);
    expect(done).toContain('first_contract');
    expect(s.crowns).toBe(crowns); // nothing paid until collected
    expect(claimNote(s, 'first_contract')).toBeUndefined();
    expect(s.crowns).toBe(crowns + 20);
    expect(claimNote(s, 'first_contract')).toMatch(/Already/); // no double rewards
    expect(checkTutorial(s)).toEqual([]);
    const idle = living(s).find((m) => m.status === 'idle')!;
    setAssignment(s, idle.id, 'rumors');
    expect(checkTutorial(s).map((o) => o.id)).toContain('orders');
  });

  it("every note can be completed, and finishing them all pays the final reward", () => {
    const s = newGame(42);
    clearEvents(s);
    s.influence = 10;
    s.facilities.forge = 1;
    s.council.agenda = [{ id: 'grain_levy', base: { exchequer: 1, weighhouse: 0, ostranders: 1, lowertown: -1 }, positions: { exchequer: 1, weighhouse: 0, ostranders: 1, lowertown: -1 }, player: 0 }];
    s.history.push({ id: 'x' } as never);
    s.week = 2;
    for (const k of ['dispatch', 'why', 'assign', 'equip', 'journal', 'reveal', 'countered', 'supplies', 'petition', 'spy', 'stance', 'hire', 'build', 'craft', 'repay']) s.tutorial.counters[k] = 1;
    const before = s.crowns;
    const done = checkTutorial(s);
    expect(done.length).toBe(OBJECTIVES.length);
    for (const o of OBJECTIVES) claimNote(s, o.id);
    expect(s.tutorial.finished).toBe(true);
    const rewards = OBJECTIVES.reduce((t, o) => t + (o.reward.crowns ?? 0), 0);
    expect(s.crowns).toBe(before + rewards + 50);
  });

  it('a squad can be re-geared or called off until the week ends, but not once it has left', () => {
    const s = newGame(51);
    clearEvents(s);
    const c = s.board.find((x) => x.travelWeeks > 0) ?? s.board[0];
    const team = living(s).slice(0, c.minSquad);
    const supplies = s.supplies;
    dispatchMission(s, c.id, team.map((m) => m.id), bestApproaches(s, c, team), true);
    const spare = s.items.find((i) => !living(s).some((m) => m.loadout.weapon === i.uid || m.loadout.armor === i.uid));
    expect(equip(s, team[0].id, 'consumable', undefined, 0)).toBeUndefined(); // allowed while preparing
    expect(cancelDispatch(s, s.missions[0].id)).toBeUndefined();
    expect(s.supplies).toBe(supplies);
    expect(s.board.some((x) => x.id === c.id)).toBe(true);
    expect(team.every((m) => m.status === 'idle')).toBe(true);
    // send again, end the week: now they're gone
    dispatchMission(s, c.id, team.map((m) => m.id), bestApproaches(s, c, team), true);
    advanceWeek(s);
    clearEvents(s);
    if (s.missions[0] && !s.missions[0].report) {
      expect(equip(s, team[0].id, 'weapon', undefined)).toMatch(/away on/);
      expect(cancelDispatch(s, s.missions[0].id)).toMatch(/already left/);
    }
    void spare;
  });

  it('hiding the notes keeps progress and rewards', () => {
    const s = newGame(52);
    clearEvents(s);
    s.tutorial.enabled = false;
    const c = s.board[0];
    const team = living(s).slice(0, c.minSquad);
    const crowns = s.crowns;
    dispatchMission(s, c.id, team.map((m) => m.id), bestApproaches(s, c, team), true);
    expect(checkTutorial(s).map((o) => o.id)).toContain('first_contract');
    claimNote(s, 'first_contract');
    expect(s.crowns).toBe(crowns + 20);
  });

  it('the Codex starts with common knowledge and grows with play', () => {
    const s = newGame(53);
    expect(s.codex.unlocked).toEqual(expect.arrayContaining(['varrow', 'the_debt', 'charters']));
    expect(s.codex.unlocked).not.toContain('vorn');
    s.eventWeeks.ostrander_agent = 2;
    expect(discoverLore(s)).toContain('Factor Maelis Vorn');
    expect(s.codex.fresh).toContain('vorn');
    // street talk appears in the week's dispatches
    clearEvents(s);
    advanceWeek(s);
    expect(s.dispatches.some((x) => x.kind === 'crier')).toBe(true);
  });

  it('buying supplies in bulk is cheaper per unit', () => {
    const s = newGame(61);
    expect(supplyCost(s, 40) / 40).toBeLessThan(supplyCost(s, 20) / 20);
    expect(supplyCost(s, 20) / 20).toBeLessThan(supplyCost(s, 5) / 5);
    const before = s.crowns;
    const quoted = supplyCost(s, 20);
    buySupplies(s, 20);
    expect(before - s.crowns).toBe(quoted);
  });

  it('a careful bot usually survives the first season', () => {
    const r = runSim(12, 12, 0.6);
    expect(r.survivalRate).toBeGreaterThanOrEqual(0.75);
  });
});
