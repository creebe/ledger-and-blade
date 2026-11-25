// Dates: one dated checkpoint is always current, a few weeks ahead, and the
// next one is already in view. A Date resolves at the end of its week: every
// target met pays its reward, anything less costs something. The story can
// call a Date off before it arrives. Content lives in data/dates.ts.
import { DATE_BY_ID, DATES, type DateDef } from '../data/dates';
import { FACTIONS, RIVALS } from '../data/factions';
import { randInt, weighted } from '../core/rng';
import type { ActiveDate, DateStakes, DateTarget, DatesState, GameState } from '../core/types';
import { addDispatch, clamp, living } from '../core/util';
import { applyStanding, earn, spend } from '../core/effects';
import { tally } from '../politics/council';
import { upkeep } from '../economy/buildings';

const SUCCESS = ['Triumph', 'Success', 'Costly Success'];
const MIN_LEAD = 2; // a Date is never set less than this many weeks ahead

export function freshDates(): DatesState {
  return { past: [] };
}

const npcsAlive = (s: GameState, d: DateDef) => (d.npcs ?? []).every((id) => s.npcs[id]?.status === 'alive');

function lastSet(s: GameState, id: string) {
  const runs = s.dates.past.filter((p) => p.id === id);
  return runs.length ? runs[runs.length - 1].week : undefined;
}

/**
 * Whether a Date could be set in week `from` (this week by default; the week
 * after the current Date when choosing the one to show next).
 */
function eligible(s: GameState, d: DateDef, from = s.week): boolean {
  if (!d.available(s) || !npcsAlive(s, d) || d.cancel?.when(s)) return false;
  const last = lastSet(s, d.id);
  if (last !== undefined && (d.once || from - last < (d.cooldown ?? 24))) return false;
  if (d.due) {
    const due = d.due(s);
    if (due === undefined || due - from < MIN_LEAD) return false;
  }
  return true;
}

function pickDate(s: GameState, exclude?: string, from = s.week): DateDef | undefined {
  const pool = DATES.filter((d) => d.id !== exclude && eligible(s, d, from));
  if (!pool.length) return undefined;
  const ordered = pool.filter((d) => d.order !== undefined).sort((a, b) => a.order! - b.order!);
  if (ordered.length) return ordered[0];
  return weighted(s, pool.map((d) => ({ item: d, weight: d.weight ?? 1 })));
}

function setDate(s: GameState, d: DateDef): ActiveDate {
  const lead = d.lead ?? [4, 6];
  const dueWeek = d.due?.(s) ?? s.week + randInt(s, lead[0], lead[1]);
  const loan = s.loans[0];
  return {
    id: d.id,
    dueWeek,
    setWeek: s.week,
    targets: d.targets(s),
    base: { renown: s.renown, principal: loan?.principal ?? 0, missed: loan?.missed ?? 0 },
  };
}

/** Make sure a Date is current and the next one is in view. Called at the start of each week. */
export function scheduleDates(s: GameState) {
  if (!s.dates) s.dates = freshDates();
  if (!s.dates.current) {
    const queued = s.dates.next ? DATE_BY_ID[s.dates.next] : undefined;
    const d = queued && eligible(s, queued) ? queued : pickDate(s);
    s.dates.current = d ? setDate(s, d) : undefined;
    s.dates.next = undefined;
  }
  // the Date shown next must still be possible once the current one is over; check it every week
  const from = (s.dates.current?.dueWeek ?? s.week) + 1;
  const queued = s.dates.next ? DATE_BY_ID[s.dates.next] : undefined;
  if (!queued || queued.id === s.dates.current?.id || !eligible(s, queued, from)) s.dates.next = pickDate(s, s.dates.current?.id, from)?.id;
}

/** At the end of the week: a twist may call the Date off; on its week it resolves. */
export function datesPhase(s: GameState) {
  const a = s.dates?.current;
  if (!a) return;
  const d = DATE_BY_ID[a.id];
  if (!d) {
    s.dates.current = undefined;
    return;
  }
  // a twist, or a character it names is gone: the Date is called off
  const gone = (d.npcs ?? []).some((id) => s.npcs[id]?.status !== 'alive');
  if (d.cancel?.when(s) || gone) {
    const text = d.cancel?.when(s) ? d.cancel.text : (d.gone ?? `${d.who} will not be coming after all.`);
    addDispatch(s, 'date', `${d.title}: called off`, [typeof text === 'function' ? text(s) : text]);
    s.dates.past.push({ id: a.id, week: s.week, outcome: 'cancelled' });
    s.dates.current = undefined;
    return;
  }
  if (s.week < a.dueWeek) return;
  const views = dateTargets(s, a);
  const failed = a.targets.map((t, i) => (targetMet(s, a, t, true) ? undefined : views[i])).filter(Boolean) as DateTargetView[];
  const met = failed.length === 0;
  const stakes = met ? d.reward : d.cost;
  applyStakes(s, stakes);
  addDispatch(
    s,
    'date',
    `${d.title}: ${met ? 'met' : 'missed'}`,
    [met ? d.met : d.missed, ...failed.map((v) => `Not met: ${v.label} (${v.now}).`), stakesLines(stakes).join(' · ')].filter(Boolean),
  );
  s.dates.past.push({ id: a.id, week: s.week, outcome: met ? 'met' : 'missed' });
  s.dates.current = undefined;
}

/** Crowns the guild itself has paid the Weighhouse since a week: payments due and early repayments, not story cuts. */
function paidSince(s: GameState, week: number) {
  const loanSpend = (e: Record<string, number>) => (e['Loan payment'] ?? 0) + (e['Loan repayment'] ?? 0);
  return s.ledger.filter((l) => l.week >= week).reduce((n, l) => n + loanSpend(l.expenses), 0) + loanSpend(s.weekBook.expenses);
}

const weeklyCosts = (s: GameState) => living(s).reduce((n, m) => n + m.wage, 0) + upkeep(s);
/** What the end of this week will take from the treasury: wages, upkeep and any loan payment due. */
const billsThisWeek = (s: GameState) => weeklyCosts(s) + s.loans.reduce((n, l) => n + (l.dueWeek === s.week ? l.paymentDue : 0), 0);

/** Targets of the current Date not met yet, for the end-week warnings on the day it arrives. */
export function dateWarning(s: GameState): string | undefined {
  const a = s.dates?.current;
  if (!a || a.dueWeek !== s.week) return undefined;
  const d = DATE_BY_ID[a.id];
  const short = a.targets.filter((t) => !targetMet(s, a, t, false)).length;
  if (!d || !short) return undefined;
  return `${d.title} arrives at the end of this week, and ${short === 1 ? 'one target is' : `${short} targets are`} not met yet.`;
}

function contractsSince(s: GameState, week: number) {
  // operations against rivals are not the kind of work the Crown lists
  return s.history.filter((m) => m.returnWeek >= week && !m.contract.op && m.report && SUCCESS.includes(m.report.tier)).length;
}

/**
 * Whether a target is met. `final` is the check made when the Date arrives;
 * otherwise it's the forecast shown while the player prepares.
 */
function targetMet(s: GameState, a: ActiveDate, t: DateTarget, final: boolean): boolean {
  const loan = s.loans[0];
  switch (t.kind) {
    case 'loanPaid':
      if (!loan) return true;
      // a payment the Weighhouse waited for wasn't paid on the day
      if (final) return loan.missed === a.base.missed && !loan.waited;
      // wages and upkeep are paid before the loan, so count them first
      return loan.missed === a.base.missed && (loan.dueWeek > a.dueWeek || s.crowns - weeklyCosts(s) >= loan.paymentDue);
    case 'crowns':
      // on the day itself, forecast what's left after this week's bills
      return (final || s.week < a.dueWeek ? s.crowns : s.crowns - billsThisWeek(s)) >= t.at;
    case 'supplies':
      return (final || s.week < a.dueWeek ? s.supplies : s.supplies - living(s).filter((m) => m.status !== 'mission').length) >= t.at;
    case 'renownGain':
      return s.renown - a.base.renown >= t.gain;
    case 'renownAbove':
      return s.renown > s.rivals[t.rival].renown;
    case 'heatBelow':
      return s.heat < t.below;
    case 'standing':
      return s.factions[t.faction].standing >= t.at;
    case 'contracts':
      return contractsSince(s, a.setWeek) >= t.count;
    case 'members': {
      const crew = living(s);
      return crew.length >= t.count && crew.filter((m) => m.level >= 3).length >= t.seniors;
    }
    case 'repaid':
      return !loan || paidSince(s, a.setWeek) >= t.amount;
    case 'council':
      if (final) return s.council.history.some((h) => h.week >= a.setWeek && h.player !== 0 && h.passed === h.player > 0);
      return s.council.agenda.some((item) => item.player !== 0 && tally(item).passes === item.player > 0);
  }
}

export interface DateTargetView {
  label: string;
  now: string;
  met: boolean;
  /** 0..1, for a progress bar */
  frac: number;
  /** the resource this target is about, if any, so the top bar can mark it */
  resource?: 'crowns' | 'supplies' | 'renown' | 'heat' | 'influence' | 'intel';
}

/** What each target asks and where the guild stands, for the UI. */
export function dateTargets(s: GameState, a: ActiveDate = s.dates.current!): DateTargetView[] {
  if (!a) return [];
  const loan = s.loans[0];
  return a.targets.map((t): DateTargetView => {
    const met = targetMet(s, a, t, false);
    const f = (now: number, goal: number) => clamp(goal > 0 ? now / goal : 1, 0, 1);
    switch (t.kind) {
      case 'loanPaid':
        return loan
          ? { label: `Pay the Weighhouse ${loan.paymentDue} crowns on the day`, now: `${s.crowns} in the treasury`, met, frac: f(s.crowns, loan.paymentDue), resource: 'crowns' }
          : { label: 'Pay the Weighhouse on the day', now: 'The loan is paid off', met: true, frac: 1 };
      case 'crowns':
        return { label: `Have ${t.at} crowns when the week closes, after the bills`, now: `${s.crowns} now`, met, frac: f(s.crowns, t.at), resource: 'crowns' };
      case 'supplies':
        return { label: `Keep ${t.at} supplies in store`, now: `${s.supplies} now`, met, frac: f(s.supplies, t.at), resource: 'supplies' };
      case 'renownGain': {
        const g = s.renown - a.base.renown;
        return { label: `Gain ${t.gain} Renown`, now: `${Math.max(0, g)} of ${t.gain}`, met, frac: f(g, t.gain), resource: 'renown' };
      }
      case 'renownAbove': {
        const r = Math.round(s.rivals[t.rival].renown);
        return { label: `Be better known than ${RIVALS[t.rival].name}`, now: `${s.renown} against their ${r}`, met, frac: f(s.renown, r + 1), resource: 'renown' };
      }
      case 'heatBelow':
        return { label: `Keep Heat under ${t.below}`, now: `${s.heat} now`, met, frac: met ? 1 : clamp(1 - (s.heat - t.below) / 40, 0, 1), resource: 'heat' };
      case 'standing': {
        const v = s.factions[t.faction].standing;
        // progress over the last 25 points below the target, so a long way off reads as a long way off
        return { label: `Raise ${FACTIONS[t.faction].short} standing to ${t.at}`, now: `${v} now`, met, frac: clamp((v - (t.at - 25)) / 25, 0, 1) };
      }
      case 'contracts': {
        const n = contractsSince(s, a.setWeek);
        return { label: `Bring ${t.count === 1 ? 'a successful contract' : `${t.count} successful contracts`} home`, now: `${n} of ${t.count}`, met, frac: f(n, t.count) };
      }
      case 'members': {
        const crew = living(s);
        const seniors = crew.filter((m) => m.level >= 3).length;
        return {
          label: `Muster ${t.count} members, ${t.seniors} of them at level 3 or higher`,
          now: `${crew.length} members, ${seniors} at level 3+`,
          met,
          frac: (f(crew.length, t.count) + f(seniors, t.seniors)) / 2,
        };
      }
      case 'repaid': {
        const paid = loan ? paidSince(s, a.setWeek) : t.amount;
        return { label: `Pay the Weighhouse ${t.amount} crowns, due payments included`, now: `${paid} of ${t.amount}`, met, frac: f(paid, t.amount), resource: 'crowns' };
      }
      case 'council': {
        const backed = s.council.agenda.filter((i) => i.player !== 0).length;
        return {
          label: 'Back the winning side of at least one decree',
          now: backed ? (met ? 'Your side is winning a vote' : 'Your side is losing every vote') : 'No stance taken yet',
          met,
          frac: met ? 1 : backed ? 0.4 : 0,
        };
      }
    }
  });
}

/** The current Date with its definition and the weeks left (0 = it arrives at the end of this week). */
export function currentDate(s: GameState) {
  const a = s.dates?.current;
  if (!a) return undefined;
  const def = DATE_BY_ID[a.id];
  if (!def) return undefined;
  return { def, active: a, weeksLeft: Math.max(0, a.dueWeek - s.week), targets: dateTargets(s, a) };
}

export function nextDate(s: GameState): DateDef | undefined {
  return s.dates?.next ? DATE_BY_ID[s.dates.next] : undefined;
}

const sign = (n: number) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`);

/** Plain lines for a Date's stakes: "+4 Weighhouse standing", "−15 supplies". */
export function stakesLines(st: DateStakes): string[] {
  const out: string[] = [];
  if (st.crowns) out.push(`${sign(st.crowns)} crowns`);
  if (st.supplies) out.push(`${sign(st.supplies)} supplies`);
  if (st.influence) out.push(`${sign(st.influence)} Influence`);
  if (st.intel) out.push(`${sign(st.intel)} Intel`);
  if (st.renown) out.push(`${sign(st.renown)} Renown`);
  if (st.heat) out.push(`${sign(st.heat)} Heat`);
  for (const [f, v] of Object.entries(st.standing ?? {})) if (v) out.push(`${sign(v)} ${FACTIONS[f as keyof typeof FACTIONS].short} standing`);
  if (st.morale) out.push(`${sign(st.morale)} morale for everyone at home`);
  if (st.loanRate) out.push(st.loanRate < 0 ? 'a lower rate on the loan' : 'a higher rate on the loan');
  return out;
}

function applyStakes(s: GameState, st: DateStakes) {
  if (st.crowns) (st.crowns > 0 ? earn : spend)(s, 'Dates', Math.abs(st.crowns));
  if (st.supplies) s.supplies = Math.max(0, s.supplies + st.supplies);
  if (st.influence) s.influence = Math.max(0, s.influence + st.influence);
  if (st.intel) s.intel = Math.max(0, s.intel + st.intel);
  if (st.renown) s.renown = Math.max(0, s.renown + st.renown);
  if (st.heat) s.heat = clamp(s.heat + st.heat, 0, 100);
  for (const [f, v] of Object.entries(st.standing ?? {})) if (v) applyStanding(s, f as keyof typeof FACTIONS, v);
  // morale changes reach the people at home, not squads on the road
  if (st.morale) for (const m of living(s).filter((x) => x.status !== 'mission')) m.morale = clamp(m.morale + st.morale, 0, 100);
  if (st.loanRate && s.loans[0]) s.loans[0].weeklyRate = clamp(Math.round((s.loans[0].weeklyRate + st.loanRate) * 1000) / 1000, 0.004, 0.03);
}
