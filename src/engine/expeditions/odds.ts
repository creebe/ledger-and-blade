// The odds of an expedition, worked out by walking the plan many times.
//
// The trip itself is a pure function of its setup (`runExpedition`), so the
// estimate simply runs it over a fixed run of seeds and counts. That way it
// follows the real rules without a second model to keep in step.
//
// Two things keep it honest:
// - It never reads `state.rng` or the trip's real seed, so looking at the
//   odds can't change the game or give away how this trip will go.
// - It only uses the dangers the player knows. Each danger nobody has
//   confirmed is tried as every one of its candidates, and the odds are given
//   as a range across them, so a hidden danger can't leak through the numbers.
import type { Contract, GameState, Member, OutcomeTier, TagId } from '../core/types';
import { runExpedition } from './dive';
import { delverOf } from './gear';
import { roadWeeks } from './prep';
import { bossBeaten } from './bosses';
import { tierOf } from './run';
import type { DiveSetup, ExpPlan } from './types';

/** Trips walked for each way the hidden dangers might turn out. */
export const ODDS_RUNS = 120;
/** At most this many trips in all: with several unknown dangers, each case gets fewer. */
export const ODDS_BUDGET = 480;
/** Each case gets at least this many, whatever the budget. */
const MIN_RUNS = 40;

const TIERS: OutcomeTier[] = ['Triumph', 'Success', 'Costly Success', 'Failure', 'Disaster'];

/** One way the unconfirmed dangers might turn out, and how the plan does against it. */
export interface OddsCase {
  /** what each unconfirmed danger is taken to be, in the order of `contract.hidden` (only the unrevealed ones) */
  assumed: TagId[];
  goal: number;
  death: number;
}

export interface ExpOdds {
  /** chance the job gets done: lowest and highest across what the unconfirmed dangers might be */
  goal: { min: number; max: number };
  /** chance at least one of the squad dies, the same way */
  death: { min: number; max: number };
  /** share of trips ending in each verdict, averaged over the cases */
  tiers: Record<OutcomeTier, number>;
  /** how the trips that failed went wrong, as shares of all trips, averaged over the cases */
  failed: { turnedBack: number; lost: number; shortOfGoal: number };
  /** each member's chance of dying, by id, averaged over the cases */
  memberDeath: Record<string, number>;
  /** one entry per way the unconfirmed dangers might turn out (a single entry when nothing is unconfirmed) */
  cases: OddsCase[];
  /** trips walked in all */
  runs: number;
}

/** Every way the unconfirmed dangers might turn out, as the tags the trip would face. */
function knownCases(c: Contract): { tags: TagId[]; assumed: TagId[] }[] {
  let combos: { tags: TagId[]; assumed: TagId[] }[] = [{ tags: [...c.tags], assumed: [] }];
  for (const h of c.hidden) {
    const next: typeof combos = [];
    for (const x of combos) {
      if (h.revealed) next.push({ tags: [...x.tags, h.trueTag], assumed: x.assumed });
      else for (const o of h.candidates) next.push({ tags: [...x.tags, o], assumed: [...x.assumed, o] });
    }
    combos = next;
  }
  return combos.map((x) => ({ ...x, tags: [...new Set(x.tags)] }));
}

// a fixed run of seeds, the same every time: odds for the same plan never wobble
const seedAt = (i: number) => {
  let h = Math.imul(i + 1, 0x9e3779b1) ^ 0x5bd1e995;
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  return (h ^ (h >>> 13)) | 0 || 1;
};

/** The setup for one estimated trip: the world as the player sees it, the squad as it is now. */
function oddsSetup(s: GameState, c: Contract, squad: Member[], plan: ExpPlan, tags: TagId[], seed: number): DiveSetup {
  const road = roadWeeks(s, c);
  return {
    seed,
    site: c.expedition.site,
    length: c.expedition.length,
    goal: c.expedition.goal,
    tags,
    threat: c.threat,
    roadOut: road.out,
    roadBack: road.back,
    // the board shows a rival wants the job, so the estimate may know it too
    rivalAhead: c.contestedBy && s.rivals[c.contestedBy]?.active ? c.contestedBy : undefined,
    bossBeaten: bossBeaten(s, c.expedition.site) || undefined,
    foeScale: 1,
    fieldLog: [],
    plan,
    squad: squad.map((m) => delverOf(s, m)),
  };
}

/** A worked-out estimate, kept by what went into it: the same plan and squad never walk twice. */
const CACHE = new Map<string, ExpOdds>();
const CACHE_MAX = 60;

/**
 * An estimate worked out a slice at a time, so a screen can spread it over
 * several frames and stay responsive. Call `step` until it returns true, then
 * read `result`. A plan already worked out is done at once.
 */
export interface OddsRunner {
  /** what went into the estimate: equal keys give equal odds */
  key: string;
  done: boolean;
  /** walk up to this many more trips; true once the estimate is complete */
  step(trips: number): boolean;
  result(): ExpOdds | undefined;
}

/**
 * The odds of a plan on a contract, from many walks of the trip. Doesn't
 * change the state. Door scenes and road ambushes aren't counted: nobody knows
 * about them until the squad is at the door.
 */
export function oddsRunner(s: GameState, c: Contract, plan: ExpPlan, runs = ODDS_RUNS): OddsRunner {
  const squad = plan.squad.map((id) => s.members.find((m) => m.id === id)).filter((m): m is Member => !!m && m.status !== 'dead' && m.status !== 'left');
  const cases = knownCases(c);
  const per = Math.max(Math.min(runs, MIN_RUNS), Math.min(runs, Math.floor(ODDS_BUDGET / cases.length)));
  // the frozen squad doesn't depend on the seed: build each case's setup once,
  // on a copy of the plan so a caller changing theirs mid-estimate can't mix two plans
  const frozen = JSON.parse(JSON.stringify(plan)) as ExpPlan;
  const bases = squad.length ? cases.map((k) => oddsSetup(s, c, squad, frozen, k.tags, 1)) : [];
  // the assumed tags go in too: two contracts can face the same tags while labelling the cases differently
  const key = JSON.stringify([per, cases.map((k) => k.assumed), bases]);
  const cached = CACHE.get(key);
  if (!squad.length || cached) return { key, done: true, step: () => true, result: () => cached };

  const tiers = Object.fromEntries(TIERS.map((t) => [t, 0])) as Record<OutcomeTier, number>;
  tiers.Withdrawn = 0;
  const failed = { turnedBack: 0, lost: 0, shortOfGoal: 0 };
  const memberDeath: Record<string, number> = Object.fromEntries(squad.map((m) => [m.id, 0]));
  const goals = cases.map(() => 0);
  const deaths = cases.map(() => 0);
  const total = per * cases.length;
  let next = 0;
  let odds: ExpOdds | undefined;

  const finish = () => {
    const out: OddsCase[] = cases.map((k, j) => ({ assumed: k.assumed, goal: goals[j] / per, death: deaths[j] / per }));
    for (const t of Object.keys(tiers) as OutcomeTier[]) tiers[t] /= total;
    failed.turnedBack /= total;
    failed.lost /= total;
    failed.shortOfGoal /= total;
    for (const id of Object.keys(memberDeath)) memberDeath[id] /= total;
    const span = (f: (x: OddsCase) => number) => ({ min: Math.min(...out.map(f)), max: Math.max(...out.map(f)) });
    odds = { goal: span((x) => x.goal), death: span((x) => x.death), tiers, failed, memberDeath, cases: out, runs: total };
    if (CACHE.size >= CACHE_MAX) CACHE.delete(CACHE.keys().next().value as string);
    CACHE.set(key, Object.freeze(odds));
  };

  const runner: OddsRunner = {
    key,
    done: false,
    step(trips: number) {
      if (runner.done) return true;
      const stop = Math.min(total, next + Math.max(1, trips));
      for (; next < stop; next++) {
        const j = Math.floor(next / per);
        const res = runExpedition({ ...bases[j], seed: seedAt(next % per) }, { quiet: true });
        if (res.goalMet) goals[j]++;
        else if (res.outcome === 'lost') failed.lost++;
        else if (res.outcome === 'retreated') failed.turnedBack++;
        else failed.shortOfGoal++;
        if (res.members.some((o) => o.died)) deaths[j]++;
        for (const o of res.members) if (o.died) memberDeath[o.id] = (memberDeath[o.id] ?? 0) + 1;
        tiers[tierOf(res)]++;
      }
      if (next >= total) {
        finish();
        runner.done = true;
      }
      return runner.done;
    },
    result: () => odds,
  };
  return runner;
}

/** The whole estimate at once. See `oddsRunner`. */
export function expeditionOdds(s: GameState, c: Contract, plan: ExpPlan, runs = ODDS_RUNS): ExpOdds | undefined {
  const r = oddsRunner(s, c, plan, runs);
  while (!r.step(ODDS_BUDGET));
  return r.result();
}
