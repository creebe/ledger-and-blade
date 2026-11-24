// Rivals: simple AIs that compete for contracts and make trouble.
// - Hobb & Daughters (from the start): take contracts, smear your name, poach the disloyal.
// - The Ninth (once Captain Mayne arrives): take fighting work and recruit hard.
// - The Assay Office (once Plaice takes notice): takes arcane work and inspects your stillroom.
// Each week's plan can be revealed with Intel and sometimes countered.
import { chance, pick } from './rng';
import { level } from './buildings';
import { RIVALS } from './data/factions';
import type { GameState, Member, RivalId, RivalPlan } from './types';
import { addDispatch, applyStanding, clamp, living, spend } from './world';
import { describeHostile, executeHostile, hostilePlan, inTruce } from './war';

export const RIVAL_IDS: RivalId[] = ['hobbs', 'ninth', 'assay'];

export function activeRivals(state: GameState): RivalId[] {
  return RIVAL_IDS.filter((id) => state.rivals[id]?.active);
}

const FIGHTERS = ['vanguard', 'skirmisher', 'marksman'];

/** How much the Assay Office can fine the guild: it only bothers with a stillroom or keyed foci. */
export function inspectionFine(state: GameState): number {
  const still = level(state, 'stillroom');
  const foci = state.items.filter((i) => i.defId.endsWith('_focus') && i.defId !== 'focus_rod').length;
  if (!still && !foci) return 0;
  if (state.flags.assay_licensed) return 0;
  return 15 + still * 10 + foci * 4;
}

function planFor(state: GameState, id: RivalId): RivalPlan {
  const r = state.rivals[id];
  const none: RivalPlan = { kind: 'none', revealed: false, countered: false };
  const contested = state.board.filter((c) => c.contestedBy === id && !c.story);
  const takeContract = (): RivalPlan | undefined => {
    if (!contested.length) return undefined;
    const best = contested.reduce((a, b) => (b.reward > a.reward ? b : a));
    return { kind: 'contract', target: best.id, revealed: false, countered: false };
  };
  if (id === 'hobbs') {
    const disloyal = living(state).filter((m) => m.loyalty < 45 && m.status !== 'mission');
    if (contested.length && chance(state, 0.45 + r.aggression * 0.4)) return takeContract()!;
    if (disloyal.length && chance(state, 0.3 + r.aggression * 0.3)) {
      // the famous are worth more to a rival than the merely unhappy
      const famous = disloyal.filter((m) => (m.fame ?? 0) >= 75);
      return { kind: 'poach', target: pick(state, famous.length ? famous : disloyal).id, revealed: false, countered: false };
    }
    if (state.week > 3 && chance(state, r.aggression * 0.35)) return { kind: 'smear', revealed: false, countered: false };
    return none;
  }
  if (id === 'ninth') {
    // Mayne recruits: fighters who are merely content are fair game
    const targets = living(state).filter((m) => m.status !== 'mission' && m.loyalty < 55 && (FIGHTERS.includes(m.profession) || m.level >= 3));
    if (contested.length && chance(state, 0.25 + r.aggression * 0.3)) return takeContract()!;
    if (targets.length && chance(state, 0.15 + r.aggression * 0.25)) {
      const best = targets.reduce((a: Member, b: Member) => ((b.fame ?? 0) * 0.2 + b.level > (a.fame ?? 0) * 0.2 + a.level ? b : a));
      return { kind: 'poach', target: best.id, revealed: false, countered: false };
    }
    return none;
  }
  // the Assay Office
  if (inspectionFine(state) > 0 && chance(state, 0.08 + r.aggression * 0.15)) return { kind: 'inspect', revealed: false, countered: false };
  if (contested.length && chance(state, 0.2 + r.aggression * 0.25)) return takeContract()!;
  return none;
}

export function planRival(state: GameState) {
  for (const id of activeRivals(state)) {
    // a feud can make the week's move a hostile one (see war.ts)
    const hostile = hostilePlan(state, id);
    const plan: RivalPlan = hostile ? { kind: hostile.kind, target: hostile.target, revealed: false, countered: false } : planFor(state, id);
    // a well-run Spymaster's Den knows their plans every week, and so does a spy inside or an ally
    const ally = activeRivals(state).some((o) => o !== id && state.rivals[o].pactAgainst === id && inTruce(state, o));
    if (level(state, 'den') >= 3 || state.rivals[id].ourSpy || ally) plan.revealed = true;
    state.rivals[id].plan = plan;
  }
}

export function describePlan(state: GameState, plan: RivalPlan | undefined, id: RivalId = 'hobbs'): string {
  const name = RIVALS[id].name;
  if (!plan || plan.kind === 'none') return `${name} ${id === 'hobbs' ? 'have' : 'has'} nothing special planned this week.`;
  if (plan.kind === 'contract') {
    const c = state.board.find((x) => x.id === plan.target);
    return c ? `They intend to take the contract "${c.title}" at the end of this week.` : 'They had a contract in mind, but it is gone.';
  }
  if (plan.kind === 'poach') {
    const m = state.members.find((x) => x.id === plan.target);
    return id === 'ninth'
      ? `Captain Mayne has been buying ${m?.name ?? 'one of your people'} drinks and talking about the old regiment.`
      : `They are courting ${m?.name ?? 'one of your people'} with a better offer.`;
  }
  if (plan.kind === 'plant' || plan.kind === 'ambush' || plan.kind === 'theft' || plan.kind === 'bribe' || plan.kind === 'arson' || plan.kind === 'murder')
    return describeHostile(state, id, plan.kind, plan.target);
  if (plan.kind === 'inspect') return `Plaice has your stillroom on his list for this week. The fine would be about ${inspectionFine(state)} crowns.`;
  return 'They are spreading stories about your guild in the taverns and counting-houses.';
}

function executeOne(state: GameState, id: RivalId) {
  const r = state.rivals[id];
  const name = RIVALS[id].name;
  r.crowns += id === 'assay' ? 25 : 40;
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
        addDispatch(state, 'rival', `${name} took "${c.title}"`, ['The contract is no longer available.']);
      }
    } else if (plan.kind === 'poach') {
      const m = state.members.find((x) => x.id === plan.target);
      const limit = 50;
      if (m && m.status === 'idle' && m.loyalty < limit) {
        m.status = 'left';
        m.causeOfDeath = `Left to join ${name}`;
        // equipment stays with the guild
        m.loadout = { consumables: [] };
        r.strength += 1;
        addDispatch(state, 'rival', `${m.name} has left for ${name}`, [
          id === 'ninth' ? 'Mayne offered steady pay and a regiment to belong to. Their gear stays in your armory.' : 'They took a better offer. Their gear stays in your armory.',
        ]);
      } else if (m) {
        addDispatch(state, 'rival', `${name} tried to hire ${m.name}`, ['They turned the offer down.']);
      }
    } else if (plan.kind === 'smear') {
      state.renown = Math.max(0, state.renown - 2);
      applyStanding(state, pick(state, ['exchequer', 'weighhouse', 'lowertown'] as const), -3);
      addDispatch(state, 'rival', 'Rumors in the counting-houses', [`${name} are telling everyone your guild is a bad risk. Renown −2.`]);
    } else if (plan.kind === 'plant' || plan.kind === 'ambush' || plan.kind === 'theft' || plan.kind === 'bribe' || plan.kind === 'arson' || plan.kind === 'murder') {
      executeHostile(state, id, plan.kind, plan.target);
    } else if (plan.kind === 'inspect') {
      const fine = inspectionFine(state);
      if (fine > 0) {
        spend(state, 'Fines', fine);
        state.heat = clamp(state.heat + 2, 0, 100);
        r.crowns += fine;
        addDispatch(state, 'rival', 'The Assay Office inspects your stillroom', [
          `Two assayers spent the morning reading your labels and found several of them wanting. Fined ${fine} crowns. Heat +2.`,
        ]);
      }
    }
  } else if (plan?.countered) {
    addDispatch(state, 'rival', `You outmaneuvered ${name}`, ['Their plan for the week came to nothing.']);
  }
  // opportunistic: contested contracts about to expire are taken
  for (const c of [...state.board]) {
    if (c.contestedBy === id && c.expiresWeek <= state.week && chance(state, id === 'hobbs' ? 0.5 : 0.25)) {
      state.board = state.board.filter((x) => x.id !== c.id);
      r.renown += 1;
      r.contractsWon += 1;
      addDispatch(state, 'rival', `${name} took "${c.title}"`, ['You let it sit too long.']);
    }
  }
  r.aggression = clamp(r.aggression + (state.renown > r.renown ? 0.02 : -0.01), 0.1, 1);
}

export function executeRival(state: GameState) {
  for (const id of activeRivals(state)) executeOne(state, id);
}
