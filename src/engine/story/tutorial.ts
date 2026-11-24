// Guildmaster's Notes: completion checks and rewards.
import { FINAL_REWARD, OBJECTIVES, type Objective } from '../data/tutorial';
import type { GameState } from '../core/types';
import { addDispatch } from '../core/util';
import { earn } from '../core/effects';

export function freshTutorial(enabled = true): GameState['tutorial'] {
  return { enabled, done: [], claimed: [], counters: {} };
}

function reward(s: GameState, r: Objective['reward']) {
  if (r.crowns) earn(s, 'Guildmaster’s Notes', r.crowns);
  if (r.intel) s.intel += r.intel;
  if (r.influence) s.influence += r.influence;
}

export function rewardText(r: Objective['reward']) {
  return [r.crowns && `+${r.crowns}◉`, r.intel && `+${r.intel} Intel`, r.influence && `+${r.influence} Influence`].filter(Boolean).join(' · ');
}

/** Notes that are done but whose reward hasn't been collected yet. */
export function claimable(s: GameState): Objective[] {
  const t = s.tutorial;
  if (!t) return [];
  return OBJECTIVES.filter((o) => t.done.includes(o.id) && !(t.claimed ?? []).includes(o.id));
}

/**
 * Mark objectives whose conditions are now met as done. Rewards wait until
 * the player collects them (claimNote). Hiding the notes only hides the card.
 */
export function checkTutorial(s: GameState): Objective[] {
  const t = s.tutorial;
  if (!t || t.finished) return [];
  const fresh: Objective[] = [];
  for (const o of OBJECTIVES) {
    if (t.done.includes(o.id)) continue;
    if (o.done(s)) {
      t.done.push(o.id);
      fresh.push(o);
    }
  }
  return fresh;
}

export function claimNote(s: GameState, id: string): string | undefined {
  const t = s.tutorial;
  const o = OBJECTIVES.find((x) => x.id === id);
  if (!o || !t) return 'No such note';
  if (!t.done.includes(id)) return 'Not done yet';
  t.claimed = t.claimed ?? [];
  if (t.claimed.includes(id)) return 'Already collected';
  t.claimed.push(id);
  reward(s, o.reward);
  if (t.claimed.length >= OBJECTIVES.length && !t.finished) {
    t.finished = true;
    reward(s, FINAL_REWARD);
    addDispatch(s, 'story', 'Every note complete', [
      "You've run contracts, read the odds, kitted out and ordered your people, dealt with the city and the Council, and started building.",
      `The Weighhouse sends a small purse for a guild that looks like it might last. +${FINAL_REWARD.crowns} crowns.`,
    ]);
  }
  return undefined;
}

export interface GuideView {
  ready: Objective[]; // done, reward waiting to be collected
  active: Objective[]; // up to three, in order
  waiting: { o: Objective; reason: string }[];
  done: number;
  total: number;
}

export function guideView(s: GameState, limit = 3): GuideView {
  const t = s.tutorial;
  const active: Objective[] = [];
  const waiting: { o: Objective; reason: string }[] = [];
  const ready = claimable(s);
  for (const o of OBJECTIVES) {
    if (t?.done.includes(o.id)) continue;
    const a = o.available ? o.available(s) : true;
    if (a !== true) waiting.push({ o, reason: a });
    else if (active.length < limit) active.push(o);
  }
  return { ready, active, waiting, done: t?.done.length ?? 0, total: OBJECTIVES.length };
}

export { OBJECTIVES };
