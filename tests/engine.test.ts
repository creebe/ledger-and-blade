import { describe, expect, it } from 'vitest';
import {
  advanceWeek,
  bestApproaches,
  buyItem,
  chanceFrom,
  dispatchExpedition,
  suggestPlan,
  expeditionLog,
  equip,
  living,
  newGame,
  previewMission,
  resolveEvent,
  revealTag,
  type GameState,
} from '../src/engine';
import { runSim } from '../scripts/sim';
import { FIELD_EVENTS } from '../src/engine/data/field';
import { STORY_EVENTS } from '../src/engine/data/events';
import { currentDate, datesPhase, dateTargets, nextDate, scheduleDates, DATE_BY_ID } from '../src/engine';
import { afterLeaderDies, executeHostile, feudStage, hallDefense, operationOptions, raiseFeud, resolveOperation, runOperation, earnFame, fameTier, triggerEvents, SAVE_VERSION, BACKERS, CIRCUMSTANCE_BY_ID, claimNote, buySupplies, supplyCost, buyMaterial, cancelDispatch, discoverLore, checkTutorial, guideView, OBJECTIVES, level, lobby, setPosition, supplyPrice, tally, migrateSave, queueCraft, setAssignment, startBuild, tripWeeks, upkeep } from '../src/engine';

/** Send a squad with a little food and nothing else, so nothing has to be bought. */
const send = (s: GameState, c: GameState['board'][number], team: { id: string }[]) =>
  dispatchExpedition(s, c.id, { ...suggestPlan(s, c), squad: team.slice(0, Math.min(4, c.maxSquad)).map((m) => m.id), pack: { food: 2 } });

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

  it('runs an expedition from dispatch to return', () => {
    const s = newGame(11);
    clearEvents(s);
    const c = [...s.board].sort((a, b) => a.travelWeeks - b.travelWeeks)[0];
    const team = living(s).slice(0, c.minSquad);
    const err = send(s, c, team);
    expect(err).toBeUndefined();
    expect(team.every((m) => m.status === 'mission')).toBe(true);
    for (let i = 0; i < 12 && !s.history.length; i++) {
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

  it('expeditions write a log and a service record', () => {
    const s = newGame(13);
    clearEvents(s);
    const c = [...s.board].sort((a, b) => a.travelWeeks - b.travelWeeks)[0];
    const team = living(s).slice(0, Math.min(4, c.maxSquad));
    send(s, c, team);
    for (let i = 0; i < 12 && !s.history.length; i++) {
      clearEvents(s);
      advanceWeek(s);
    }
    const ms = s.history[0];
    expect(ms.report!.trip).toBeDefined();
    expect(expeditionLog(ms).length).toBeGreaterThan(5);
    expect(team.some((m) => m.record.length > 0)).toBe(true);
  });

  it('a scene at the door changes the trip before it is sealed', () => {
    for (let seed = 1; seed < 200; seed++) {
      const s = newGame(seed);
      clearEvents(s);
      const c = s.board.find((x) => x.travelWeeks > 0);
      if (!c) continue;
      const team = living(s).slice(0, Math.max(c.minSquad, 3));
      if (send(s, c, team)) continue;
      const ms = s.missions[0];
      const ev = s.pendingEvents.find((e) => e.missionId === ms.id);
      if (!ev) continue;
      const i = ev.choices.findIndex((ch) => ch.effects.log && !ch.check && !ch.requires);
      if (i < 0) continue;
      resolveEvent(s, ev.uid, i);
      expect(ms.fieldLog?.length).toBeGreaterThan(0);
      expect(expeditionLog(ms).some((l) => l.text === ms.fieldLog![0])).toBe(true);
      expect(cancelDispatch(s, ms.id)).toMatch(/last orders/);
      return;
    }
    throw new Error('no suitable seed found');
  });

  it('door scenes pay off Act I outcomes: the Crown wagons, the Exchequer writ, Isbet', () => {
    const ids = ['field_crown_wagons', 'field_writ'];
    const seen = new Set<string>();
    for (let seed = 1; seed < 400 && seen.size < ids.length + 1; seed++) {
      const s = newGame(seed);
      clearEvents(s);
      const c = s.board.find((x) => x.travelWeeks > 0 && !x.story);
      if (!c) continue;
      c.expedition.site = 'anselm';
      c.region = 'Port Anselm';
      c.contestedBy = 'hobbs';
      Object.assign(s.flags, { silver_abandoned: true, silver_lost: true, fenn_ally: true, isbet_betrayed: true });
      // only the scenes under test are eligible: the others are on cooldown
      for (const d of FIELD_EVENTS) if (!ids.includes(d.id) && d.id !== 'field_rivals') s.eventWeeks[d.id] = s.week;
      if (send(s, c, living(s).slice(0, Math.max(c.minSquad, 3)))) continue;
      const ev = s.pendingEvents.find((e) => e.missionId === s.missions[0].id);
      if (!ev) continue;
      if (ev.defId === 'field_rivals') {
        expect(ev.text).toMatch(/her mother's regards/);
        seen.add('isbet');
      } else seen.add(ev.defId);
      expect(ev.text).not.toMatch(/undefined|\{|The Saltfens|road to/);
      const before = { ex: s.factions.exchequer.standing, lt: s.factions.lowertown.standing };
      resolveEvent(s, ev.uid, 0);
      if (ev.defId === 'field_crown_wagons') expect(s.factions.exchequer.standing).toBe(before.ex + 3);
      if (ev.defId === 'field_writ') expect(s.factions.lowertown.standing).toBe(before.lt - 2);
    }
    expect([...seen].sort()).toEqual(['field_crown_wagons', 'field_writ', 'isbet']);
  });

  it('Half a Year mentions the Act I outcomes that had no echo', () => {
    const s = newGame(3);
    Object.assign(s.flags, { silver_abandoned: true, silver_lost: true, fenn_ally: true, weights_failed: true, isbet_betrayed: true, tapestry_sold: true, aske_plate_lost: true });
    const def = STORY_EVENTS.find((d) => d.id === 'act1_slice_end')!;
    const text = typeof def.text === 'function' ? def.text(s) : def.text;
    for (const bit of ['Wenmouth ford', 'Thursdays', "Hesketh's bushels are still short", 'Isbet never brings it', 'wool merchant', 'assessors took her silver']) expect(text).toContain(bit);
    s.flags.tapestry_sold = false;
    s.flags.tapestry_lost = true;
    s.npcs.isbet.status = 'dead';
    const later = typeof def.text === 'function' ? def.text(s) : def.text;
    expect(later).toContain("keeping somebody's hay dry");
    expect(later).not.toContain('Isbet');
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

  it('Dates: one is always set a few weeks ahead, with the next in view', () => {
    const s = newGame(41);
    const c = currentDate(s)!;
    expect(c.def.id).toBe('first_payment');
    expect(c.active.dueWeek).toBe(s.loans[0].dueWeek);
    expect(c.weeksLeft).toBeGreaterThanOrEqual(2);
    expect(nextDate(s)?.id).toBe('exchequer_list');
    expect(dateTargets(s).length).toBe(2);
  });

  it('Dates: meeting every target pays the reward, missing one applies the cost', () => {
    const met = newGame(42);
    const a = met.dates.current!;
    met.week = a.dueWeek;
    met.crowns = 5000;
    const before = met.factions.weighhouse.standing;
    datesPhase(met);
    expect(met.dates.past.at(-1)).toMatchObject({ id: 'first_payment', outcome: 'met' });
    expect(met.factions.weighhouse.standing).toBe(before + 4);
    expect(met.dates.current).toBeUndefined();
    expect(met.dispatches.at(-1)!.kind).toBe('date');

    const missed = newGame(42);
    missed.week = missed.dates.current!.dueWeek;
    missed.crowns = 0;
    const renown = missed.renown;
    datesPhase(missed);
    expect(missed.dates.past.at(-1)!.outcome).toBe('missed');
    expect(missed.renown).toBe(renown - 2);

    // the next week a new Date is set, and it's the one that was in view
    const expected = met.dates.next;
    met.week += 1;
    scheduleDates(met);
    expect(met.dates.current!.id).toBe(expected);
    expect(met.dates.current!.dueWeek - met.week).toBeGreaterThanOrEqual(2);
  });

  it('Dates: the story can call one off before it arrives', () => {
    const s = newGame(43);
    s.dates.current = { id: 'porters_feast', dueWeek: s.week + 5, setWeek: s.week, targets: DATE_BY_ID.porters_feast.targets(s), base: { renown: 0, principal: 0, missed: 0 } };
    s.clocks.unrest = 90;
    datesPhase(s);
    expect(s.dates.past.at(-1)).toMatchObject({ id: 'porters_feast', outcome: 'cancelled' });
    expect(s.dispatches.at(-1)!.title).toContain('called off');
  });

  it('Dates keep coming through a long game, and the same seed gives the same ones', () => {
    const play = (seed: number) => {
      const s = newGame(seed);
      for (let w = 0; w < 40 && !s.gameOver; w++) {
        clearEvents(s);
        advanceWeek(s);
      }
      return s;
    };
    const a = play(77);
    const b = play(77);
    expect(a.dates.past.map((p) => p.id)).toEqual(b.dates.past.map((p) => p.id));
    if (!a.gameOver) {
      expect(a.dates.past.length).toBeGreaterThanOrEqual(4);
      expect(a.dates.current).toBeDefined();
    }
  });

  it('Dates: the first payment is judged after the loan is paid in the same week', () => {
    const run = (crownsOnTheDay: number) => {
      const s = newGame(45);
      s.dates.current!.targets = [{ kind: 'loanPaid' }]; // judge the payment alone
      const due = s.dates.current!.dueWeek;
      while (s.week < due && !s.gameOver) {
        clearEvents(s);
        s.crowns = 5000;
        advanceWeek(s);
      }
      clearEvents(s);
      s.crowns = crownsOnTheDay;
      advanceWeek(s);
      return s.dates.past.find((p) => p.id === 'first_payment');
    };
    expect(run(5000)?.outcome).toBe('met');
    expect(run(0)?.outcome).toBe('missed');
  });

  it('Dates: a loan paid off mid-Date counts as paid', () => {
    const s = newGame(46);
    s.week = s.dates.current!.dueWeek;
    s.loans = [];
    s.crowns = 5000;
    datesPhase(s);
    expect(s.dates.past.at(-1)).toMatchObject({ id: 'first_payment', outcome: 'met' });
  });

  it('Dates: a Council Date is judged on the vote held that same week', () => {
    const s = newGame(47);
    while (!s.council.agenda.length && !s.gameOver) {
      clearEvents(s);
      s.crowns = 5000;
      advanceWeek(s);
    }
    const item = s.council.agenda[0];
    setPosition(s, item.id, 1);
    for (const f of Object.keys(item.positions) as (keyof typeof item.positions)[]) item.positions[f] = 1;
    const voteWeek = s.council.voteWeek!;
    s.dates.current = { id: 'council_vote', dueWeek: voteWeek, setWeek: s.week, targets: [{ kind: 'council' }], base: { renown: 0, principal: 0, missed: 0 } };
    while (s.week < voteWeek && !s.gameOver) {
      clearEvents(s);
      s.crowns = 5000;
      for (const f of Object.keys(item.positions) as (keyof typeof item.positions)[]) item.positions[f] = 1;
      advanceWeek(s);
    }
    clearEvents(s);
    for (const f of Object.keys(item.positions) as (keyof typeof item.positions)[]) item.positions[f] = 1;
    advanceWeek(s);
    expect(s.dates.past.find((p) => p.id === 'council_vote')?.outcome).toBe('met');
  });

  it('version 11 saves from the middle of a campaign gain a Date ahead', () => {
    const s = newGame(48);
    for (let w = 0; w < 20 && !s.gameOver; w++) {
      clearEvents(s);
      s.crowns = 5000;
      advanceWeek(s);
    }
    const raw = s as unknown as Record<string, unknown>;
    delete raw.dates;
    raw.version = 11;
    const g = migrateSave(raw as never)!;
    expect(g.dates.past).toEqual([]);
    expect(g.dates.current).toBeDefined();
    expect(g.dates.current!.dueWeek - g.week).toBeGreaterThanOrEqual(2);
    expect(g.dates.current!.setWeek).toBe(g.week);
  });

  it('version 11 saves gain Dates', () => {
    const s = newGame(44) as unknown as Record<string, unknown>;
    delete s.dates;
    s.version = 11;
    const g = migrateSave(s as never)!;
    expect(g.version).toBe(SAVE_VERSION);
    expect(g.dates.current).toBeDefined();
  });

  it('Dates ask only for what the guild can reach, and say which target failed', () => {
    const s = newGame(45);
    clearEvents(s);
    // the Muster never asks for more members than the hall holds
    const muster = DATE_BY_ID.muster.targets(s)[0] as { count: number };
    expect(muster.count).toBeLessThanOrEqual(7);
    // a Lower Town target is a few points above where the guild stands, however low that is
    s.factions.lowertown.standing = -40;
    const fair = DATE_BY_ID.oda_fair.targets(s)[1] as { at: number };
    expect(fair.at).toBeLessThanOrEqual(-30);
    // a missed Date names the target that failed
    s.week = s.dates.current!.dueWeek;
    s.crowns = 0;
    datesPhase(s);
    expect(s.dispatches.at(-1)!.body.some((l) => l.startsWith('Not met:'))).toBe(true);
  });

  it('Council stances lock in the week of the vote', () => {
    const s = newGame(46);
    s.council.agenda = [{ id: 'grain_levy', base: { exchequer: 1, weighhouse: 0, ostranders: 1, lowertown: -1 }, positions: { exchequer: 1, weighhouse: 0, ostranders: 1, lowertown: -1 }, player: 0 }];
    s.council.voteWeek = s.week + 1;
    expect(setPosition(s, 'grain_levy', 1)).toBeUndefined();
    s.week += 1;
    expect(setPosition(s, 'grain_levy', -1)).toBeTruthy();
    expect(s.council.agenda[0].player).toBe(1);
  });

  it('old saves are upgraded', () => {
    const s = newGame(24) as unknown as Record<string, unknown>;
    delete s.facilities;
    delete s.craftQueue;
    s.version = 3;
    const g = migrateSave(s as never)!;
    expect(g.version).toBe(SAVE_VERSION);
    expect(g.facilities.hall).toBe(1);
    expect(g.craftQueue).toEqual([]);
  });

  it('a member who earns enough fame becomes a Legend, is named by the street and gets a signature', () => {
    const s = newGame(41);
    s.pendingEvents = [];
    const m = s.members[0];
    Object.assign(m, { fame: 118, level: 5, missions: 25 });
    const c = s.board[0];
    earnFame(s, m, { contract: { ...c, threat: 5 }, tier: 'Triumph', tags: c.tags, led: [{ approach: 'guile', result: 'strong', danger: 1 }] });
    expect(fameTier(m)).toBe(3);
    triggerEvents(s);
    const ev = s.pendingEvents.find((e) => e.defId === 'legend_named')!;
    expect(ev).toBeTruthy();
    resolveEvent(s, ev.uid, 0);
    resolveEvent(s, ev.uid, 0);
    expect(m.epithet).toBeTruthy();
    expect(m.signature).toBe('known_face');
  });

  it('guild wars: feuds escalate, operations become jobs, and killing a leader changes the rival', () => {
    const s = newGame(43);
    s.pendingEvents = [];
    s.crowns = 2000;
    s.intel = 20;
    s.influence = 20;
    expect(feudStage(s, 'hobbs')).toBe(0);
    expect(operationOptions(s, 'hobbs').find((o) => o.kind === 'raid')!.blocked).toBeTruthy();
    expect(runOperation(s, 'hobbs', 'smear')).toBeUndefined();
    raiseFeud(s, 'hobbs', 60);
    expect(feudStage(s, 'hobbs')).toBe(2);
    expect(runOperation(s, 'hobbs', 'kill')).toBeUndefined();
    const op = s.board.find((c) => c.op?.kind === 'kill')!;
    expect(op.op!.target).toBe('marta');
    const summary: string[] = [];
    resolveOperation(s, op, true, summary);
    expect(s.npcs.marta.status).toBe('dead');
    expect(s.rivals.hobbs.active).toBe(true); // Isbet takes over
    expect(operationOptions(s, 'hobbs').find((o) => o.kind === 'kill')!.target).toBe('isbet');
    s.npcs.isbet.status = 'dead';
    afterLeaderDies(s, 'hobbs', 'isbet');
    expect(s.rivals.hobbs.active).toBe(false);
  });

  it('guards protect the hall from a rival raid', () => {
    const s = newGame(44);
    s.pendingEvents = [];
    raiseFeud(s, 'hobbs', 40);
    for (const m of s.members) m.assignment = 'guard';
    expect(hallDefense(s)).toBeGreaterThan(0.8);
    const before = s.supplies;
    let robbed = 0;
    for (let i = 0; i < 20; i++) {
      s.supplies = before;
      executeHostile(s, 'hobbs', 'theft');
      if (s.supplies < before) robbed++;
    }
    expect(robbed).toBeLessThan(8);
  });

  it('campaigns start from different circumstances, and a seed always gives the same start', () => {
    const backers = new Set<string>();
    const seen = new Set<string>();
    for (let seed = 1; seed <= 80; seed++) {
      const s = newGame(seed);
      backers.add(s.start.backer);
      for (const c of s.start.circumstances) seen.add(c);
      expect(s.start.circumstances.length).toBe(4);
      expect(s.members.length).toBe(4);
      expect(s.loans[0].principal).toBe(BACKERS[s.start.backer].loan);
    }
    expect(backers.size).toBe(4);
    expect(seen.size).toBe(Object.keys(CIRCUMSTANCE_BY_ID).length);
    expect(newGame(777).start).toEqual(newGame(777).start);
    expect(newGame(777).members.map((m) => m.name)).toEqual(newGame(777).members.map((m) => m.name));
  });

  it('version 8 saves gain the new cast, factions and rivals', () => {
    const s = newGame(25) as unknown as { [k: string]: unknown; npcs: Record<string, unknown>; factions: Record<string, unknown>; rivals: Record<string, { active?: boolean }> };
    for (const k of ['coster', 'brune', 'aske', 'pask', 'mayne', 'plaice', 'jory']) delete s.npcs[k];
    for (const k of ['oda', 'fourteen', 'mudlarks']) delete s.factions[k];
    delete s.rivals.ninth;
    delete s.rivals.assay;
    delete s.rivals.hobbs.active;
    s.version = 8;
    const g = migrateSave(s as never)!;
    expect(g.version).toBe(SAVE_VERSION);
    expect(g.npcs.pask.status).toBe('alive');
    expect(g.factions.oda.standing).toBe(0);
    expect(g.rivals.hobbs.active).toBe(true);
    expect(g.rivals.ninth.active).toBe(false);
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
    send(s, c, team);
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
    for (const k of ['dispatch', 'dates', 'why', 'assign', 'equip', 'journal', 'reveal', 'countered', 'supplies', 'petition', 'spy', 'stance', 'hire', 'build', 'craft', 'repay']) s.tutorial.counters[k] = 1;
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
    const c = s.board.find((x) => x.travelWeeks === 0) ?? s.board[0];
    const team = living(s).slice(0, c.minSquad);
    const supplies = s.supplies;
    send(s, c, team);
    const spare = s.items.find((i) => !living(s).some((m) => m.loadout.weapon === i.uid || m.loadout.armor === i.uid));
    expect(equip(s, team[0].id, 'consumable', undefined, 0)).toBeUndefined(); // allowed while preparing
    expect(cancelDispatch(s, s.missions[0].id)).toBeUndefined();
    expect(s.supplies).toBe(supplies);
    expect(s.board.some((x) => x.id === c.id)).toBe(true);
    expect(team.every((m) => m.status === 'idle')).toBe(true);
    // send again, end the week: now they're gone
    send(s, c, team);
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
    send(s, c, team);
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
