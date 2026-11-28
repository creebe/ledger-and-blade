// Expedition odds on screen: a hook that works the estimate out a slice at a
// time (so a tap never stalls the phone), the pill, and the "Why?" breakdown.
import { useEffect, useMemo, useRef, useState } from 'react';
import { TAGS, oddsRunner, type Contract, type ExpOdds, type ExpPlan, type GameState, type OddsRunner, type OutcomeTier } from '../../engine';
import { chanceText } from './format';
import { OddsPill } from './visual';

/** Work per slice, in milliseconds: short enough that scrolling and taps stay smooth. */
const SLICE_MS = 10;
/** Wait this long after a change before starting, so a run of taps only works out the last plan. */
const SETTLE_MS = 150;

/**
 * The odds of a plan, worked out in the background. While a changed plan is
 * being worked out, `odds` holds the last plan's figures and `updating` is true.
 */
export function useExpOdds(g: GameState, c: Contract | undefined, plan: ExpPlan | undefined, delay = SETTLE_MS) {
  const held = useRef<OddsRunner | undefined>(undefined);
  const runner = useMemo(() => {
    const r = c && plan && plan.squad.length ? oddsRunner(g, c, plan) : undefined;
    // the same plan in a new state (an unrelated change elsewhere): carry on with the one already running
    return r && held.current && held.current.key === r.key && !r.done ? held.current : r;
  }, [g, c, plan]);
  held.current = runner;
  const [last, setLast] = useState<ExpOdds | undefined>(undefined);
  const key = runner?.key;
  useEffect(() => {
    if (!runner) return;
    if (runner.done) {
      setLast(runner.result());
      return;
    }
    let handle: ReturnType<typeof setTimeout>;
    let stopped = false;
    const tick = () => {
      if (stopped) return;
      const t0 = performance.now();
      while (!runner.step(4) && performance.now() - t0 < SLICE_MS);
      if (runner.done) setLast(runner.result());
      else handle = setTimeout(tick, 0);
    };
    handle = setTimeout(tick, delay);
    return () => {
      stopped = true;
      clearTimeout(handle);
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const ready = runner?.done ? runner.result() : undefined;
  return { odds: runner ? (ready ?? last) : undefined, updating: !!runner && !runner.done };
}

/** The chance of a death as a percentage: "12%", "8–15%" across unconfirmed dangers, or "under 1%". */
export function deathPct(min: number, max: number): string {
  if (max < 0.005) return 'under 1%';
  return chanceText(min, max);
}

/**
 * Odds as shown: never quite certain either way. The walks leave out door
 * scenes and road ambushes, and a sure thing on paper comes home about 96 times in 100.
 */
export const SHOWN_MIN = 0.03;
export const SHOWN_MAX = 0.97;
const shown = (p: number) => Math.min(SHOWN_MAX, Math.max(SHOWN_MIN, p));

export const deathTone = (p: number) => (p >= 0.25 ? 'bad' : p >= 0.1 ? 'warn' : 'muted');

/** The job-done pill. `label` is the small word in front of it. */
export function ExpOddsPill({ odds, label, updating }: { odds?: ExpOdds; label?: string; updating?: boolean }) {
  if (!odds) return <span className={`odds-pill x-odds-wait ${updating ? 'x-odds-updating' : ''}`}>{label && <small>{label}</small>}…</span>;
  return (
    <span className={`x-odds-pill-wrap ${updating ? 'x-odds-updating' : ''}`} aria-busy={updating}>
      <OddsPill min={shown(odds.goal.min)} max={shown(odds.goal.max)} label={label} />
    </span>
  );
}

const tagNames = (ids: string[]) => ids.map((t) => TAGS[t as keyof typeof TAGS]?.name ?? t);

function caseLabel(names: string[]): string {
  if (names.length === 1) return `If the “?” is ${names[0]}`;
  return `If the “?”s are ${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** "all of them", "none of them", or "80–90% of them". */
function doneOn(min: number, max: number): string {
  if (min >= 0.995) return 'all of them';
  if (max < 0.005) return 'none of them';
  return `${chanceText(min, max)} of them`;
}

const TIER_ORDER: OutcomeTier[] = ['Triumph', 'Success', 'Costly Success', 'Failure', 'Disaster'];
const TIER_TONE: Record<string, string> = { Triumph: 'good', Success: 'good', 'Costly Success': 'warn', Failure: 'warn', Disaster: 'bad' };

/** The breakdown under "Why?": how the walks went, and who was most at risk. */
export function OddsWhy({ odds, names }: { odds: ExpOdds; names: Record<string, string> }) {
  const pc = (p: number) => `${Math.round(p * 100)}%`;
  const atRisk = Object.entries(odds.memberDeath)
    .filter(([, p]) => p >= 0.01)
    .sort((a, b) => b[1] - a[1]);
  const death = (odds.death.min + odds.death.max) / 2;
  const f = odds.failed;
  return (
    <div className="x-odds-why">
      <p className="small">
        The guild walked this trip {odds.runs} times on paper with exactly this plan, down to who walks where. The job got done on {doneOn(odds.goal.min, odds.goal.max)}.
      </p>
      {odds.cases.length > 1 && (
        <ul className="x-odds-cases">
          {odds.cases.map((k, i) => (
            <li key={i} className="small">
              <span>{caseLabel(tagNames(k.assumed))}</span>
              <OddsPill min={shown(k.goal)} max={shown(k.goal)} />
            </li>
          ))}
        </ul>
      )}
      <div className="x-odds-tiers" role="img" aria-label={TIER_ORDER.map((t) => `${t} ${pc(odds.tiers[t])}`).join(', ')}>
        {TIER_ORDER.filter((t) => odds.tiers[t] > 0).map((t) => (
          <span key={t} className={`x-odds-tier ${TIER_TONE[t]}`} style={{ flexGrow: odds.tiers[t] }} />
        ))}
      </div>
      <ul className="x-odds-tier-key">
        {TIER_ORDER.filter((t) => odds.tiers[t] >= 0.005).map((t) => (
          <li key={t} className="tiny">
            <i className={`x-odds-dot ${TIER_TONE[t]}`} aria-hidden /> {t} {pc(odds.tiers[t])}
          </li>
        ))}
      </ul>
      {f.turnedBack + f.lost + f.shortOfGoal >= 0.01 && (
        <p className="small">
          {[
            f.turnedBack >= 0.01 && `The squad turned back on ${pc(f.turnedBack)} of the walks.`,
            f.lost >= 0.01 && `Nobody came home on ${pc(f.lost)}.`,
            f.shortOfGoal >= 0.01 && `On ${pc(f.shortOfGoal)} it came home without what the job asked for.`,
          ]
            .filter(Boolean)
            .join(' ')}
        </p>
      )}
      <p className={`small x-odds-death ${deathTone(death)}`}>
        The chance of a death is {deathPct(odds.death.min, odds.death.max)}.
        {atRisk.length > 0 && ` ${atRisk.slice(0, 2).map(([id, p], i) => `${names[id] ?? (i ? 'one of the others' : 'One of them')} (${pc(p)})`).join(' and ')} ${atRisk.length > 1 ? 'were' : 'was'} most at risk.`}
      </p>
      <p className="tiny muted">
        This is an estimate, so the odds shown never go above 97% or below 3%. A scene at the door or an ambush on the road can still change things. Any danger nobody has confirmed is tried each way it could turn out.
      </p>
    </div>
  );
}
