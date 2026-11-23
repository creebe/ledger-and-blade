// Hobb & Daughters: a simple rival AI that competes for contracts, smears your
// name and tries to poach disloyal members. Its plan for the week can be
// revealed with Intel and sometimes countered.
import { chance, pick } from './rng';
import { level } from './buildings';
import type { GameState, RivalPlan } from './types';
import { addDispatch, applyStanding, clamp, living } from './world';

export function planRival(state: GameState) {
  const r = state.rivals.hobbs;
  const contested = state.board.filter((c) => c.contestedBy === 'hobbs' && !c.story);
  const disloyal = living(state).filter((m) => m.loyalty < 45 && m.status !== 'mission');
  let plan: RivalPlan = { kind: 'none', revealed: false, countered: false };
  if (contested.length && chance(state, 0.45 + r.aggression * 0.4)) {
    const best = contested.reduce((a, b) => (b.reward > a.reward ? b : a));
    plan = { kind: 'contract', target: best.id, revealed: false, countered: false };
  } else if (disloyal.length && chance(state, 0.3 + r.aggression * 0.3)) {
    plan = { kind: 'poach', target: pick(state, disloyal).id, revealed: false, countered: false };
  } else if (state.week > 3 && chance(state, r.aggression * 0.35)) {
    plan = { kind: 'smear', revealed: false, countered: false };
  }
  // a well-run Spymaster's Den knows their plans every week
  if (level(state, 'den') >= 3) plan.revealed = true;
  r.plan = plan;
}

export function describePlan(state: GameState, plan: RivalPlan | undefined): string {
  if (!plan || plan.kind === 'none') return 'Hobb & Daughters have nothing special planned this week.';
  if (plan.kind === 'contract') {
    const c = state.board.find((x) => x.id === plan.target);
    return c ? `They intend to take the contract "${c.title}" at the end of this week.` : 'They had a contract in mind, but it is gone.';
  }
  if (plan.kind === 'poach') {
    const m = state.members.find((x) => x.id === plan.target);
    return `They are courting ${m?.name ?? 'one of your people'} with a better offer.`;
  }
  return 'They are spreading stories about your guild in the taverns and counting-houses.';
}

export function executeRival(state: GameState) {
  const r = state.rivals.hobbs;
  r.crowns += 40;
  r.renown += 0.25;
  const plan = r.plan;
  if (plan && !plan.countered) {
    if (plan.kind === 'contract') {
      const c = state.board.find((x) => x.id === plan.target);
      if (c) {
        state.board = state.board.filter((x) => x.id !== c.id);
        r.renown += 2;
        r.crowns += c.reward;
        r.contractsWon += 1;
        addDispatch(state, 'rival', `Hobb & Daughters took "${c.title}"`, ['The contract is no longer available.']);
      }
    } else if (plan.kind === 'poach') {
      const m = state.members.find((x) => x.id === plan.target);
      if (m && m.status === 'idle' && m.loyalty < 50) {
        m.status = 'left';
        m.causeOfDeath = 'Left to join Hobb & Daughters';
        // equipment stays with the guild
        m.loadout = { consumables: [] };
        r.strength += 1;
        addDispatch(state, 'rival', `${m.name} has left for Hobb & Daughters`, ['They took a better offer. Their gear stays in your armory.']);
      } else if (m) {
        addDispatch(state, 'rival', `Hobb & Daughters tried to poach ${m.name}`, ['They refused the offer.']);
      }
    } else if (plan.kind === 'smear') {
      state.renown = Math.max(0, state.renown - 2);
      applyStanding(state, pick(state, ['exchequer', 'weighhouse', 'lowertown'] as const), -3);
      addDispatch(state, 'rival', 'Rumors in the counting-houses', ['Hobb & Daughters are telling everyone your guild is a bad risk. Renown −2.']);
    }
  } else if (plan?.countered) {
    addDispatch(state, 'rival', 'You outmaneuvered Hobb & Daughters', ['Their plan for the week came to nothing.']);
  }
  // opportunistic: contested contracts about to expire are taken
  for (const c of [...state.board]) {
    if (c.contestedBy === 'hobbs' && c.expiresWeek <= state.week && chance(state, 0.5)) {
      state.board = state.board.filter((x) => x.id !== c.id);
      r.renown += 1;
      r.contractsWon += 1;
      addDispatch(state, 'rival', `Hobb & Daughters took "${c.title}"`, ['You let it sit too long.']);
    }
  }
  r.aggression = clamp(r.aggression + (state.renown > r.renown ? 0.02 : -0.01), 0.1, 1);
}
