// Small helpers shared by the engine. Kept free of data imports so any module can use them.
import { uid } from './rng';
import type { Dispatch, DispatchKind, GameState, Loan, Member } from './types';

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function addDispatch(state: GameState, kind: DispatchKind, title: string, body: string[] = [], missionId?: string): Dispatch {
  const d: Dispatch = { id: uid(state, 'd'), week: state.week, kind, title, body, missionId };
  state.dispatches.push(d);
  // keep the log bounded
  if (state.dispatches.length > 200) state.dispatches.splice(0, state.dispatches.length - 200);
  return d;
}

export function living(state: GameState): Member[] {
  return state.members.filter((m) => m.status !== 'dead' && m.status !== 'left');
}

/** What the next collection will actually take: the payment due, less what was paid ahead of it. */
export function loanStillDue(l: Loan): number {
  return Math.max(0, Math.min(l.paymentDue, Math.ceil(l.principal)) - Math.floor(l.paidAhead ?? 0));
}
