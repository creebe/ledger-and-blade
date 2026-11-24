// Story explorer: plays many games making random story choices and checks that
// the narrative stays coherent. Used by tests/story.test.ts and by
// `npm run story` (which writes docs/reports/story-coverage.md).
import { EXCLUSIVE_FACTS, FACTS, type FactId } from '../src/engine/data/facts';
import { RANDOM_EVENTS, STORY_EVENTS, type EventDef } from '../src/engine/data/events';
import { ARRIVAL, FIELD_EVENTS } from '../src/engine/data/field';
import { CODEX, CODEX_BY_ID } from '../src/engine/data/codex';
import { advanceWeek, bestApproaches, canChoose, dispatchMission, living, newGame, previewMission, type GameState } from '../src/engine';
import { botTurn } from './sim';

const DEFS: Record<string, EventDef> = Object.fromEntries([...STORY_EVENTS, ...RANDOM_EVENTS, ARRIVAL, ...FIELD_EVENTS].map((d) => [d.id, d]));
const BAD_TEXT = /undefined|NaN|\[object |\{\w+\}|\$\{|null\b/;

export interface Violation {
  seed: number;
  week: number;
  kind: string;
  detail: string;
}

export interface StoryReport {
  runs: number;
  weeks: number;
  violations: Violation[];
  beats: Record<string, { fired: number; weeks: number[]; late: number; eligible: number }>;
  randomFired: Record<string, number>;
  nodesVisited: Record<string, Set<string>>; // event id -> nodes seen ('root' included)
  choicesTaken: Record<string, Record<string, number>>; // event/node -> label -> count
  factsSet: Record<string, number>; // runs in which each fact was set
  factsRead: Set<string>;
  readNeverSet: string[];
  neverSet: string[];
  unreachedNodes: string[];
  endings: Record<string, number>; // summary of how the silver arc resolved
  codexUnlocked: Record<string, number>; // runs in which each entry was learned
  neverLearned: string[];
  reached: number[]; // reached[w]: games still running at the start of week w
}

/** Games still running when a beat's window closed (or at the horizon): the fair denominator for how often it fires. */
export function beatRate(r: StoryReport, id: string): number {
  const b = r.beats[id];
  return b.eligible ? b.fired / b.eligible : 0;
}

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function exploreStory(runs: number, weeks: number): StoryReport {
  const report: StoryReport = {
    runs,
    weeks,
    violations: [],
    beats: Object.fromEntries(STORY_EVENTS.map((e) => [e.id, { fired: 0, weeks: [], late: 0, eligible: 0 }])),
    randomFired: {},
    nodesVisited: {},
    choicesTaken: {},
    factsSet: {},
    factsRead: new Set(),
    readNeverSet: [],
    neverSet: [],
    unreachedNodes: [],
    endings: {},
    codexUnlocked: {},
    neverLearned: [],
    reached: [],
  };
  const setAnywhere = new Set<string>();

  for (let run = 0; run < runs; run++) {
    const seed = 5000 + run * 104729;
    const s = newGame(seed);
    const rand = rng(seed ^ 0x9e3779b9);
    const setThisRun = new Set<string>();
    const violate = (kind: string, detail: string) => report.violations.push({ seed, week: s.week, kind, detail });

    // watch every fact read and write
    const watch = (flags: GameState['flags']) =>
      new Proxy(flags, {
        get(t, k) {
          if (typeof k === 'string' && k in FACTS) report.factsRead.add(k);
          return Reflect.get(t, k);
        },
        set(t, k, v) {
          if (typeof k === 'string') {
            if (!(k in FACTS)) violate('unknown-fact', `Set unregistered fact "${k}"`);
            setThisRun.add(k);
            setAnywhere.add(k);
          }
          return Reflect.set(t, k, v);
        },
      });
    s.flags = watch(s.flags);
    let seenDispatches = 0;

    const checkText = (where: string, text: string | undefined) => {
      if (text && BAD_TEXT.test(text)) violate('broken-text', `${where}: "${text.slice(0, 120)}"`);
    };

    const chooser = (st: GameState, ev: GameState['pendingEvents'][number]) => {
      const def = DEFS[ev.defId];
      const node = ev.node ?? 'root';
      (report.nodesVisited[ev.defId] ??= new Set()).add(node);
      checkText(`${ev.defId}/${node} text`, ev.text);
      for (const c of ev.choices) {
        checkText(`${ev.defId}/${node} choice`, `${c.label} ${c.detail ?? ''}`);
        for (const target of [c.next, c.failNext]) if (target && !def?.nodes?.[target]) violate('dead-branch', `${ev.defId}/${node} → "${target}" does not exist`);
      }
      if (!ev.choices.length) violate('no-choices', `${ev.defId}/${node} has no available choices`);
      const ok = ev.choices.map((c, i) => ({ c, i })).filter(({ c }) => !canChoose(st, c));
      if (!ok.length) {
        violate('stuck', `${ev.defId}/${node}: every choice is unaffordable`);
        return 0;
      }
      const pick = ok[Math.floor(rand() * ok.length)];
      const key = `${ev.defId}/${node}`;
      (report.choicesTaken[key] ??= {})[pick.c.label] = ((report.choicesTaken[key] ?? {})[pick.c.label] ?? 0) + 1;
      return pick.i;
    };

    for (let w = 0; w < weeks && !s.gameOver; w++) {
      const before = new Set(s.pendingEvents.map((e) => e.uid));
      botTurn(s, { minChance: 0.45, chooser });
      // explore story contracts too: usually attempt them with the best squad available
      for (const c of s.board.filter((x) => x.story)) {
        if (rand() > 0.75) continue;
        const idle = living(s).filter((m) => m.status === 'idle' && m.health >= 40);
        if (idle.length < c.minSquad) continue;
        const ranked = [...idle].sort((a, b) => {
          const sa = previewMission(s, c, [a], bestApproaches(s, c, [a])).phases.reduce((t, p) => t + p.chance, 0);
          const sb = previewMission(s, c, [b], bestApproaches(s, c, [b])).phases.reduce((t, p) => t + p.chance, 0);
          return sb - sa;
        });
        const team = ranked.slice(0, Math.min(c.maxSquad, idle.length));
        if (s.supplies < team.length * (c.travelWeeks * 2 + 1) + 4) s.supplies += 20; // explorer only: never blocked on supplies
        dispatchMission(s, c.id, team.map((m) => m.id), bestApproaches(s, c, team), rand() < 0.5);
      }
      void before;
      if (s.pendingEvents.length) violate('stuck', `Events left unresolved: ${s.pendingEvents.map((e) => e.defId).join(', ')}`);
      advanceWeek(s);

      // newly fired events
      for (const ev of s.pendingEvents) {
        const def = DEFS[ev.defId];
        if (!def) {
          violate('unknown-event', ev.defId);
          continue;
        }
        for (const n of def.npcs ?? []) if (s.npcs[n].status !== 'alive') violate('dead-npc', `${ev.defId} features ${n}, who is ${s.npcs[n].status}`);
        if (def.story) {
          const b = report.beats[def.id];
          b.fired++;
          b.weeks.push(s.week);
          const [from, to] = def.window ?? [1, 1];
          for (const pre of def.after ?? []) if (s.eventWeeks[pre] === undefined || s.eventWeeks[pre] >= s.week) violate('out-of-order', `${def.id} fired before ${pre}`);
          if (s.week < from) violate('early-beat', `${def.id} fired in week ${s.week}, before its window ${from}–${to}`);
          if (s.week > to) b.late++;
        } else report.randomFired[def.id] = (report.randomFired[def.id] ?? 0) + 1;
      }
      // dispatch text
      for (const d of s.dispatches.slice(seenDispatches)) {
        checkText(`dispatch "${d.title}"`, d.title);
        for (const line of d.body) checkText(`dispatch "${d.title}"`, line);
      }
      seenDispatches = s.dispatches.length;
      // contradictions
      for (const group of EXCLUSIVE_FACTS) {
        const on = group.filter((f) => s.flags[f]);
        if (on.length > 1) violate('contradiction', `Both ${on.join(' and ')} are true`);
      }
      // mission journals
      for (const m of s.history.slice(-3)) for (const p of m.report?.phases ?? []) for (const l of p.story ?? []) checkText(`journal ${m.contract.title}`, l);
    }
    for (const f of setThisRun) report.factsSet[f] = (report.factsSet[f] ?? 0) + 1;
    for (const id of s.codex.unlocked) {
      report.codexUnlocked[id] = (report.codexUnlocked[id] ?? 0) + 1;
      const e = CODEX_BY_ID[id];
      if (e) checkText(`codex ${id}`, `${e.text} ${e.source(s)}`);
    }
    // story beats charter (week 1) fires inside newGame, count it
    if (s.eventWeeks.charter === 1 && !report.beats.charter.weeks.includes(-run - 1)) {
      report.beats.charter.fired++;
      report.beats.charter.weeks.push(1);
    }
    const lastWeek = s.gameOver ? s.gameOver.week : s.week;
    for (let w = 1; w <= lastWeek; w++) report.reached[w] = (report.reached[w] ?? 0) + 1;
    for (const def of STORY_EVENTS) {
      const end = Math.min(def.window?.[1] ?? 1, weeks);
      if (s.eventWeeks[def.id] !== undefined || lastWeek > end) report.beats[def.id].eligible++;
    }
    const end = s.gameOver ? `guild fell first (${s.gameOver.reason})` : s.flags.silver_delivered ? 'delivered' : s.flags.silver_abandoned ? 'abandoned' : s.flags.silver_lost ? 'lost' : s.flags.silver_declined ? 'declined (Hobbs carried it)' : 'unresolved';
    report.endings[end] = (report.endings[end] ?? 0) + 1;
  }

  report.neverLearned = CODEX.map((e) => e.id).filter((id) => !report.codexUnlocked[id]);
  report.readNeverSet = [...report.factsRead].filter((f) => !setAnywhere.has(f));
  report.neverSet = Object.keys(FACTS).filter((f) => !setAnywhere.has(f as FactId));
  for (const def of STORY_EVENTS) {
    for (const n of ['root', ...Object.keys(def.nodes ?? {})]) if (!report.nodesVisited[def.id]?.has(n)) report.unreachedNodes.push(`${def.id}/${n}`);
  }
  return report;
}

const median = (xs: number[]) => (xs.length ? [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)] : NaN);

export function reportMarkdown(r: StoryReport): string {
  const L: string[] = [];
  L.push('# Story coverage report', '');
  L.push(`Generated by \`npm run story\`: ${r.runs} games × ${r.weeks} weeks, random story choices, careful management bot.`, '');
  L.push(`## Problems: ${r.violations.length}`, '');
  if (!r.violations.length) L.push('None found.', '');
  const byKind: Record<string, Violation[]> = {};
  for (const v of r.violations) (byKind[v.kind] ??= []).push(v);
  for (const [k, vs] of Object.entries(byKind)) {
    L.push(`- **${k}** ×${vs.length}: ${[...new Set(vs.map((v) => v.detail))].slice(0, 5).join('; ')} (e.g. seed ${vs[0].seed}, week ${vs[0].week})`);
  }
  L.push('', '## Story beats', '', '| Beat | Window | Fired in (of games still running) | Week (min / median / max) | After window |', '|---|---|---|---|---|');
  for (const def of STORY_EVENTS) {
    const b = r.beats[def.id];
    const w = def.window ?? [1, 1];
    L.push(`| ${def.id} | ${w[0]}–${w[1]} | ${Math.round(beatRate(r, def.id) * 100)}% | ${b.weeks.length ? `${Math.min(...b.weeks)} / ${median(b.weeks)} / ${Math.max(...b.weeks)}` : '—'} | ${b.late} |`);
  }
  L.push('', "## The Crown's silver: how it resolved", '');
  for (const [k, v] of Object.entries(r.endings)) L.push(`- ${k}: ${Math.round((v / r.runs) * 100)}%`);
  L.push('', '## Branch coverage', '');
  L.push(r.unreachedNodes.length ? `Never reached: ${r.unreachedNodes.join(', ')}` : 'Every conversation node in every story beat was reached.', '');
  for (const [key, choices] of Object.entries(r.choicesTaken).filter(([k]) => STORY_EVENTS.some((e) => k.startsWith(e.id + '/')))) {
    L.push(`- **${key}**: ${Object.entries(choices).map(([l, n]) => `${l} (${n})`).join(' · ')}`);
  }
  L.push('', '## Facts', '', '| Fact | Set in % of games | Meaning |', '|---|---|---|');
  for (const [f, desc] of Object.entries(FACTS)) L.push(`| ${f} | ${Math.round(((r.factsSet[f] ?? 0) / r.runs) * 100)}% | ${desc} |`);
  if (r.readNeverSet.length) L.push('', `**Read but never set:** ${r.readNeverSet.join(', ')}`);
  if (r.neverSet.length) L.push('', `**Registered but never set:** ${r.neverSet.join(', ')}`);
  L.push('', '## Codex', '', '| Entry | Learned in % of games |', '|---|---|');
  for (const e of CODEX) L.push(`| ${e.title} (${e.category}) | ${Math.round(((r.codexUnlocked[e.id] ?? 0) / r.runs) * 100)}% |`);
  L.push('', '## Random events fired', '');
  for (const [k, v] of Object.entries(r.randomFired).sort((a, b) => b[1] - a[1])) L.push(`- ${k}: ${v}`);
  return L.join('\n') + '\n';
}
