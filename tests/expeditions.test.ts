import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  advanceWeek,
  buildSetup,
  cancelDispatch,
  dispatchExpedition,
  expeditionLog,
  feedForWeek,
  generateContract,
  generateRecruit,
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
  tripWeekOf,
  triggerEvents,
  withdrawAtDoor,
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

  it("every site's postings, bosses and beaten bosses walk with no missing line", () => {
    const sitePostings = CONTRACT_TEMPLATES.filter((t) => t.expedition?.site && t.expedition.site !== 'pellam');
    for (const site of SITE_IDS.filter((x) => x !== 'pellam')) {
      const mine = sitePostings.filter((t) => t.expedition!.site === site);
      expect(mine.some((t) => t.expedition!.goal?.kind === 'kill' && t.expedition!.length === 'long'), `${site} has a boss posting`).toBe(true);
      for (const tpl of mine) {
        for (let seed = 0; seed < 12; seed++) {
          const s = newGame(300 + seed);
          for (const m of s.members) m.level = 4;
          const c = generateContract(s, tpl);
          const ms = { contract: c, plan: suggestPlan(s, c), plannedWeeks: 5, setup: { seed: 8000 + seed * 7 } } as unknown as Mission;
          const setup = { ...buildSetup(s, ms), bossBeaten: seed % 3 === 0 || undefined };
          const r = runExpedition(setup);
          for (const l of r.log) {
            expect(l.text, `${tpl.id}: ${l.text}`).toMatch(/\s/);
            expect(l.text, `${tpl.id}: ${l.text}`).not.toMatch(/\{\w+\}|undefined|  /);
          }
        }
      }
    }
  });

  it("a site's boss is beaten once: its postings come off the board and its room holds a lesser fight", () => {
    const s = newGame(111);
    clearEvents(s);
    const c = post(s, 'kell_moyle');
    const won = { ...c.expedition };
    expect(won.length).toBe('long');
    // fake a trip home with Moyle killed
    let found = false;
    for (let seed = 0; seed < 60 && !found; seed++) {
      const ms = { contract: c, plan: suggestPlan(s, c), plannedWeeks: 5, setup: { seed: 4000 + seed } } as unknown as Mission;
      for (const m of s.members) m.level = 5;
      const r = runExpedition(buildSetup(s, ms));
      if ((r.kills.moyle ?? 0) > 0) found = true;
    }
    expect(found).toBe(true);
    s.delve.bossesBeaten.push('kell');
    for (let i = 0; i < 200; i++) expect(generateContract(s).expedition.goal).not.toEqual({ kind: 'kill', monster: 'moyle', count: 1 });
    const ms = { contract: c, plan: suggestPlan(s, c), plannedWeeks: 5, setup: { seed: 4242 } } as unknown as Mission;
    const setup = buildSetup(s, ms);
    expect(setup.bossBeaten).toBe(true);
    const r = runExpedition(setup);
    expect(r.kills.moyle ?? 0).toBe(0);
    // the work in Moyle's room afterwards is posted now, and its trip ends there
    expect(Array.from({ length: 400 }, () => generateContract(s).templateId)).toContain('kell_level_after');
    const after = post(s, 'kell_level_after');
    let sawRoom = false;
    for (let seed = 0; seed < 40 && !sawRoom; seed++) {
      const ams = { contract: after, plan: suggestPlan(s, after), plannedWeeks: 5, setup: { seed: 4343 + seed } } as unknown as Mission;
      const ar = runExpedition(buildSetup(s, ams));
      expect(ar.kills.moyle ?? 0).toBe(0);
      sawRoom = ar.log.some((l) => /Moyle's (chair|working)/.test(l.text));
    }
    expect(sawRoom).toBe(true);
    const fresh = newGame(115);
    for (let i = 0; i < 300; i++) expect(generateContract(fresh).templateId).not.toBe('kell_level_after');
  });

  it('only one squad at a time goes after a boss, and boss postings wait until the second zone is reached', () => {
    const s = newGame(113);
    clearEvents(s);
    for (let i = 0; i < 4; i++) s.members.push(generateRecruit(s).member);
    for (const m of s.members) m.level = 4;
    s.delve.zonesReached.push('sump');
    const a = post(s, 'kell_moyle');
    const b = post(s, 'kell_moyle');
    const planA = suggestPlan(s, a);
    expect(dispatchExpedition(s, a.id, planA)).toBeUndefined();
    const planB = suggestPlan(s, b);
    expect(planBlocked(s, b, planB)).toMatch(/already on its way to Gaffer Moyle/);
    for (let i = 0; i < 300; i++) expect(generateContract(s).templateId).not.toBe('kell_moyle');
    const fresh = newGame(114);
    for (let i = 0; i < 300; i++) expect(generateContract(fresh).templateId).not.toBe('kell_moyle');
  });

  it('a squad beaten with nobody dead is not told it came home short of people', () => {
    let found = 0;
    for (const site of ['pellam', 'varrow', 'kell', 'drovers'] as const) {
      for (let seed = 0; seed < 150 && found < 12; seed++) {
        const s = newGame(900 + seed);
        const tpl = CONTRACT_TEMPLATES.find((t) => (t.expedition?.site ?? t.regions[0]) === site && !t.story)!;
        const c = generateContract(s, tpl);
        c.expedition = { site, length: 'long', goal: { kind: 'complete' } };
        const ms = { contract: c, plan: { ...suggestPlan(s, c), squad: suggestPlan(s, c).squad.slice(0, 2) }, plannedWeeks: 5, setup: { seed: 5000 + seed } } as unknown as Mission;
        const r = runExpedition(buildSetup(s, ms));
        if (r.outcome !== 'lost' || r.members.some((m) => m.died)) continue;
        found++;
        const tail = r.log.filter((l) => l.kind === 'end').map((l) => l.text).join(' ');
        expect(tail, `${site} ${seed}`).not.toMatch(/short of people|Fewer of them|What is left|the survivors|than went/i);
      }
    }
    expect(found).toBeGreaterThan(0);
  });

  it("the Ninth's colours bring Captain Mayne to the hall once, and every answer takes them off the market", () => {
    for (let choice = 0; choice < 3; choice++) {
      const s = newGame(116);
      clearEvents(s);
      s.flags.ninth_active = true;
      s.goods.colours = 1;
      triggerEvents(s);
      const ev = s.pendingEvents.find((e) => e.defId === 'ninth_colours')!;
      expect(ev).toBeDefined();
      const crowns = s.crowns;
      resolveEvent(s, ev.uid, choice);
      expect(s.goods.colours ?? 0).toBe(0);
      if (choice === 1) expect(s.crowns).toBe(crowns + 200);
      s.goods.colours = 1;
      triggerEvents(s);
      expect(s.pendingEvents.some((e) => e.defId === 'ninth_colours')).toBe(false);
    }
    // not before Mayne has come to Varrow
    const s = newGame(117);
    clearEvents(s);
    s.goods.colours = 1;
    triggerEvents(s);
    expect(s.pendingEvents.some((e) => e.defId === 'ninth_colours')).toBe(false);
  });

  it('a plain job on a long route walks the last zone and stops short of the boss', () => {
    const s = newGame(112);
    const tpl = CONTRACT_TEMPLATES.find((t) => t.regions[0] === 'drovers' && !t.story && !t.expedition)!;
    const c = generateContract(s, tpl);
    c.expedition = { site: 'drovers', length: 'long', goal: { kind: 'complete' } };
    const ms = { contract: c, plan: suggestPlan(s, c), plannedWeeks: 5, setup: { seed: 77 } } as unknown as Mission;
    const r = runExpedition(buildSetup(s, ms));
    expect(r.kills.crewe ?? 0).toBe(0);
    expect(r.log.some((l) => l.zone === 'skell')).toBe(r.roomsCleared > 7);
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

  it('a squad called back at the door shows nothing in the feed', () => {
    const s = newGame(107);
    clearEvents(s);
    const c = post(s, 'pellam_plate');
    dispatchExpedition(s, c.id, suggestPlan(s, c));
    const ms = s.missions[0];
    withdrawAtDoor(s, ms);
    clearEvents(s);
    advanceWeek(s);
    const gone = s.history.find((m) => m.id === ms.id)!;
    expect(gone.report?.tier).toBe('Withdrawn');
    expect(tripWeekOf(gone, s.week - 1)).toBe(0);
    expect(feedForWeek(s, s.week - 1).some((f) => f.missionId === ms.id)).toBe(false);
  });

  it('calling a squad off and sending it again does not reroll the trip', () => {
    const s = newGame(108);
    clearEvents(s);
    const c = post(s, 'pellam_plate');
    const plan = suggestPlan(s, c);
    dispatchExpedition(s, c.id, plan);
    const first = s.missions[0].result;
    const planned = s.missions[0].dispatchedWeek + s.missions[0].plannedWeeks - 1;
    expect(s.missions[0].returnWeek).toBe(planned);
    cancelDispatch(s, s.missions[0].id);
    dispatchExpedition(s, c.id, plan);
    expect(s.missions[0].result).toEqual(first);
  });

  it('a version 12 squad that already had its report still comes home', () => {
    const s = newGame(109);
    clearEvents(s);
    const c = s.board[0];
    dispatchExpedition(s, c.id, { ...suggestPlan(s, c), pack: { food: 2 } });
    clearEvents(s);
    const raw = JSON.parse(JSON.stringify(s));
    raw.version = 12;
    for (const k of ['stores', 'goods', 'delve']) delete raw[k];
    for (const m of raw.members) for (const k of ['exposure', 'changes', 'scars', 'habits']) delete m[k];
    for (const b of raw.board) delete b.expedition;
    const ms = raw.missions[0];
    for (const k of ['plan', 'number', 'plannedWeeks', 'sealed', 'setup', 'result']) delete ms[k];
    delete ms.contract.expedition;
    Object.assign(ms, { approaches: ['assault'], arriveWeek: s.week - 1, returnWeek: s.week + 2, report: { tier: 'Success', phases: [], casualties: [], wounded: [], reward: 50, materials: {}, summary: ['Paid 50 crowns.'] } });
    const g = migrateSave(raw)!;
    const ids: string[] = g.missions[0].memberIds;
    for (let i = 0; i < 4; i++) {
      clearEvents(g);
      advanceWeek(g);
    }
    expect(g.members.filter((m) => ids.includes(m.id)).every((m) => m.status !== 'mission')).toBe(true);
  });

  it("every Guildmaster's Note counter is recorded somewhere", () => {
    const keys = [...readFileSync('src/engine/data/tutorial.ts', 'utf8').matchAll(/n\(s, '(\w+)'\)/g)].map((m) => m[1]);
    const files: string[] = [];
    const walk = (d: string) => readdirSync(d).forEach((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : files.push(join(d, f))));
    walk('src');
    const src = files.filter((f) => /\.tsx?$/.test(f)).map((f) => readFileSync(f, 'utf8')).join('\n');
    for (const k of new Set(keys)) expect(src, k).toMatch(new RegExp(`track\\([a-z]+, '${k}'\\)`));
  });

  it('the Weighhouse waits for a squad that is away, then keeps its schedule', () => {
    const s = newGame(110);
    clearEvents(s);
    const c = post(s, 'pellam_plate');
    dispatchExpedition(s, c.id, suggestPlan(s, c));
    clearEvents(s);
    const loan = s.loans[0];
    loan.dueWeek = s.week;
    s.crowns = 0;
    s.goods = {};
    advanceWeek(s);
    expect(loan.waited).toBe(1);
    expect(loan.missed).toBe(0);
    expect(loan.dueWeek).toBe(s.week);
  });

  it('a group talked off or slipped past is not met again straight away', () => {
    let checked = 0;
    for (let seed = 0; seed < 150; seed++) {
      const s = newGame(400 + seed);
      const c = post(s, seed % 2 ? 'pellam_rats' : 'pellam_streets');
      const plan = suggestPlan(s, c);
      const r = runExpedition(buildSetup(s, { contract: c, plan, plannedWeeks: 2, setup: { seed: 50 + seed } } as unknown as Mission));
      // encounters: runs of lines that show enemies. One with no blows struck was talked off.
      const enc: { start: number; end: number; monsters: string[]; fought: boolean }[] = [];
      r.log.forEach((l, i) => {
        if (!l.enemies) return;
        const prev = enc[enc.length - 1];
        if (prev && prev.end === i - 1) prev.end = i;
        else enc.push({ start: i, end: i, monsters: l.enemies.map((e) => e.monster), fought: false });
        if (['hit', 'miss', 'enemy'].includes(l.kind)) enc[enc.length - 1].fought = true;
      });
      for (let k = 1; k < enc.length; k++) {
        const a = enc[k - 1];
        const b = enc[k];
        const ra = r.log[a.start].room;
        const rb = r.log[b.start].room;
        if (a.fought || ra === undefined || rb === undefined || rb - ra > 1) continue;
        checked++;
        expect(a.monsters, `seed ${seed}: ${r.log[b.start].text}`).not.toContain(b.monsters[0]);
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('recruits ask more after the guild has buried people', () => {
    const s = newGame(111);
    const before = generateRecruit(s);
    const ask = (r: typeof before) => r.signOn / r.member.wage;
    s.members[0].status = 'dead';
    s.members[0].diedWeek = s.week;
    s.members[1].status = 'dead';
    s.members[1].diedWeek = s.week;
    expect(ask(generateRecruit(s))).toBeGreaterThan(ask(before));
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

  it('a version 13 save keeps a broken Kiln Engine as a beaten boss, and its sealed trips replay the same', () => {
    const s = newGame(107);
    clearEvents(s);
    const c = s.board[0];
    dispatchExpedition(s, c.id, suggestPlan(s, c));
    clearEvents(s);
    const setup = buildSetup(s, s.missions[0]);
    const raw = JSON.parse(JSON.stringify(s));
    raw.version = 13;
    delete raw.delve.bossesBeaten;
    raw.delve.kilnBroken = true;
    const g = migrateSave(raw)!;
    expect(g.version).toBe(SAVE_VERSION);
    expect(g.delve.bossesBeaten).toEqual(['pellam']);
    expect('kilnBroken' in g.delve).toBe(false);
    // a trip sealed before the change still reads the old flag the way it did
    const old = { ...setup, site: 'pellam' as const, length: 'long' as const, bossBeaten: undefined, kilnBroken: true };
    const now = { ...old, kilnBroken: undefined, bossBeaten: true };
    expect(runExpedition(old).log.map((l) => l.text)).toEqual(runExpedition(now).log.map((l) => l.text));
    const fresh = migrateSave({ ...JSON.parse(JSON.stringify(s)), version: 13, delve: { zonesReached: [], count: 0 } })!;
    expect(fresh.delve.bossesBeaten).toEqual([]);
    // a trip sealed on another site walked that site's one zone then, and still does
    const away = JSON.parse(JSON.stringify(s));
    away.version = 13;
    away.missions[0].setup = { ...setup, site: 'kell', length: 'long', goal: { kind: 'complete' } };
    const h = migrateSave(away)!;
    expect(h.missions[0].setup.oneZone).toBe(true);
    const zones = new Set(runExpedition(h.missions[0].setup).log.map((l) => l.zone).filter(Boolean));
    expect([...zones]).toEqual(['workings']);
  });
});
