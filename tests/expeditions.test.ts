import { describe, expect, it } from 'vitest';
import {
  advanceWeek,
  buildSetup,
  cancelDispatch,
  dispatchExpedition,
  expeditionLog,
  feedForWeek,
  generateContract,
  living,
  migrateSave,
  newGame,
  planBlocked,
  resolveEvent,
  revealedWeeks,
  runExpedition,
  SAVE_VERSION,
  SITE_IDS,
  squadLimit,
  suggestPlan,
  visibleLog,
  weekSummary,
  type Contract,
  type GameState,
  type Mission,
} from '../src/engine';
import { CONTRACT_TEMPLATES, TEMPLATE_BY_ID } from '../src/engine/data/contracts';

const clearEvents = (s: GameState) => {
  while (s.pendingEvents.length) resolveEvent(s, s.pendingEvents[0].uid, 0);
};

/** A posting from a template, put on the board. */
function post(s: GameState, templateId: string): Contract {
  const c = generateContract(s, TEMPLATE_BY_ID[templateId]);
  s.board.push(c);
  return c;
}

/** Run every End Week until this squad is home. */
function untilHome(s: GameState, id: string) {
  for (let i = 0; i < 12 && s.missions.some((m) => m.id === id); i++) {
    clearEvents(s);
    advanceWeek(s);
  }
  return s.history.find((m) => m.id === id)!;
}

describe('expeditions', () => {
  it('the same setup always gives the same log', () => {
    const s = newGame(101);
    const c = post(s, 'pellam_plate');
    const ms = { contract: c, plan: suggestPlan(s, c), plannedWeeks: 2 } as unknown as Mission;
    const a = runExpedition(buildSetup(s, ms));
    const b = runExpedition(buildSetup(s, ms));
    expect(a.log.map((l) => l.text)).toEqual(b.log.map((l) => l.text));
    expect(a.members).toEqual(b.members);
  });

  it('every site can be walked, and no line is a missing key', () => {
    for (const site of SITE_IDS) {
      const tpl = CONTRACT_TEMPLATES.find((t) => (t.expedition?.site ?? t.regions[0]) === site && !t.story);
      for (let seed = 0; seed < 25; seed++) {
        const s = newGame(200 + seed);
        const c = generateContract(s, tpl ?? CONTRACT_TEMPLATES[0]);
        c.expedition = { ...c.expedition, site, length: (['short', 'medium', 'long'] as const)[seed % 3] };
        c.tags = [...c.tags, ...(['thugs', 'beasts', 'trolls', 'night', 'warded', 'crowd'] as const)[seed % 6] ? [(['thugs', 'beasts', 'trolls', 'night', 'warded', 'crowd'] as const)[seed % 6]] : []];
        const ms = { contract: c, plan: suggestPlan(s, c), plannedWeeks: 3, setup: { seed: 7000 + seed * 13 } } as unknown as Mission;
        const r = runExpedition(buildSetup(s, ms));
        expect(r.log.length).toBeGreaterThan(5);
        for (const l of r.log) {
          // a missing line shows up as its bare key, which has no spaces
          expect(l.text, `${site}: ${l.text}`).toMatch(/\s/);
          expect(l.text).not.toMatch(/\{\w+\}/);
        }
        // weeks never go backwards, and each line knows where it falls in its week
        for (let i = 1; i < r.log.length; i++) expect(r.log[i].week).toBeGreaterThanOrEqual(r.log[i - 1].week);
        expect(r.log.every((l) => l.t > 0 && l.t < 1)).toBe(true);
        expect(r.weeks).toBe(r.log[r.log.length - 1].week);
      }
    }
  });

  it('a trip is sealed when it leaves, revealed one week at a time, and settled when it is home', () => {
    const s = newGame(102);
    clearEvents(s);
    s.factions.exchequer.standing = 10;
    const c = post(s, 'pellam_streets');
    const plan = suggestPlan(s, c);
    expect(dispatchExpedition(s, c.id, plan)).toBeUndefined();
    const ms = s.missions[0];
    expect(ms.sealed).toBe(false);
    expect(revealedWeeks(s, ms)).toBe(0);
    expect(visibleLog(s, ms)).toEqual([]);
    clearEvents(s);
    advanceWeek(s);
    expect(ms.sealed || s.missions[0].sealed).toBe(true);
    const out = s.missions.find((m) => m.id === ms.id) ?? s.history.find((m) => m.id === ms.id)!;
    const seen = visibleLog(s, out);
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.every((l) => l.week === 1)).toBe(true);
    expect(weekSummary(out, 1).text.length).toBeGreaterThan(0);
    expect(feedForWeek(s, s.week - 1).some((f) => f.missionId === ms.id)).toBe(true);
    const home = untilHome(s, ms.id);
    expect(home.report).toBeDefined();
    expect(visibleLog(s, home).length).toBe(expeditionLog(home).length);
    for (const id of home.memberIds) {
      const m = s.members.find((x) => x.id === id)!;
      expect(m.status === 'dead' || m.status === 'idle' || m.status === 'recovering').toBe(true);
    }
  });

  it('two squads can be out at once, and a Muster room allows a third', () => {
    const s = newGame(103);
    clearEvents(s);
    // plenty of people and money
    s.crowns = 5000;
    for (let i = 0; i < 6; i++) s.members.push({ ...structuredClone(s.members[i % 4]), id: `extra${i}`, name: `Extra${i} Person`, status: 'idle', missionId: undefined });
    const send = (id: string) => {
      const c = post(s, id);
      const plan = suggestPlan(s, c);
      return dispatchExpedition(s, c.id, plan);
    };
    expect(squadLimit(s)).toBe(2);
    expect(send('pellam_rats')).toBeUndefined();
    expect(send('pellam_plate')).toBeUndefined();
    expect(send('pellam_streets')).toMatch(/Muster room/);
    s.facilities.muster = 1;
    expect(squadLimit(s)).toBe(3);
    expect(send('pellam_streets')).toBeUndefined();
    expect(new Set(s.missions.map((m) => m.number))).toEqual(new Set([1, 2, 3]));
  });

  it('a squad in the yard can be called off and nothing is lost', () => {
    const s = newGame(104);
    clearEvents(s);
    const c = post(s, 'pellam_rats');
    const before = { supplies: s.supplies, stores: { ...s.stores } };
    const plan = suggestPlan(s, c);
    dispatchExpedition(s, c.id, plan);
    expect(s.supplies).toBeLessThan(before.supplies);
    expect(cancelDispatch(s, s.missions[0].id)).toBeUndefined();
    expect(s.supplies).toBe(before.supplies);
    expect(s.stores).toEqual(before.stores);
    expect(living(s).every((m) => m.status !== 'mission')).toBe(true);
  });

  it('plans say why they cannot go', () => {
    const s = newGame(105);
    const c = post(s, 'pellam_rats');
    const plan = suggestPlan(s, c);
    expect(planBlocked(s, c, { ...plan, squad: plan.squad.slice(0, 1) })).toMatch(/at least/);
    expect(planBlocked(s, c, { ...plan, pack: { food: 40 } })).toMatch(/pack holds/);
    s.members.find((m) => m.id === plan.squad[0])!.health = 20;
    expect(planBlocked(s, c, plan)).toMatch(/badly hurt/);
  });

  it('good preparation beats poor preparation', () => {
    let goodDead = 0;
    let poorDead = 0;
    for (let g = 0; g < 40; g++) {
      const s = newGame(300 + g);
      const c = post(s, 'pellam_eels');
      const plan = suggestPlan(s, c);
      const run = (p: typeof plan) => runExpedition(buildSetup(s, { contract: c, plan: p, plannedWeeks: 2, setup: { seed: 99 + g } } as unknown as Mission));
      goodDead += run(plan).members.filter((m) => m.died).length;
      poorDead += run({ ...plan, squad: [...plan.squad].reverse(), pack: { food: 1 }, orders: { ...plan.orders, retreat: 'stubborn' } }).members.filter((m) => m.died).length;
    }
    expect(goodDead).toBeLessThan(poorDead);
  });

  it('a classic (version 12) save with a squad out is brought across', () => {
    const s = newGame(106);
    clearEvents(s);
    const c = s.board[0];
    dispatchExpedition(s, c.id, { ...suggestPlan(s, c), pack: { food: 2 } });
    clearEvents(s);
    // make it look like a version 12 save
    const raw = JSON.parse(JSON.stringify(s));
    raw.version = 12;
    delete raw.stores;
    delete raw.goods;
    delete raw.delve;
    delete raw.facilities.muster;
    for (const m of raw.members) for (const k of ['exposure', 'changes', 'scars', 'habits']) delete m[k];
    for (const b of raw.board) delete b.expedition;
    const ms = raw.missions[0];
    for (const k of ['plan', 'number', 'plannedWeeks', 'sealed', 'setup', 'result']) delete ms[k];
    delete ms.contract.expedition;
    Object.assign(ms, { approaches: ['assault'], retreatOnCritical: true, supplies: 4, arriveWeek: s.week + 1, returnWeek: s.week + 1 });
    const g = migrateSave(raw)!;
    expect(g.version).toBe(SAVE_VERSION);
    expect(g.stores).toBeDefined();
    expect(g.board.every((b) => !!b.expedition)).toBe(true);
    expect(g.members.every((m) => Array.isArray(m.scars) && m.exposure === 0)).toBe(true);
    const id = g.missions[0].id;
    expect(expeditionLog(g.missions[0])[0].text).toBe('The road was quiet.');
    const home = untilHome(g, id);
    expect(home.report?.tier).toBe('Success');
    expect(g.members.filter((m) => home.memberIds.includes(m.id)).every((m) => m.status !== 'mission')).toBe(true);
  });
});
