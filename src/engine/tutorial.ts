// Guildmaster's Notes: completion checks and rewards.
import { FINAL_REWARD, OBJECTIVES, type Objective } from './data/tutorial';
import type { GameState } from './types';
import { addDispatch, earn } from './world';

export function freshTutorial(enabled = true): GameState['tutorial'] {
  return { enabled, done: [], counters: {} };
}

function reward(s: GameState, r: Objective['reward'], label: string) {
  if (r.crowns) earn(s, 'Guildmaster’s Notes', r.crowns);
  if (r.intel) s.intel += r.intel;
  if (r.influence) s.influence += r.influence;
  return [r.crowns && `+${r.crowns} crowns`, r.intel && `+${r.intel} Intel`, r.influence && `+${r.influence} Influence`].filter(Boolean).join(', ') || label;
}

export function rewardText(r: Objective['reward']) {
  return [r.crowns && `+${r.crowns}◉`, r.intel && `+${r.intel} Intel`, r.influence && `+${r.influence} Influence`].filter(Boolean).join(' · ');
}

/** Complete any objectives whose conditions are now met. Returns newly completed ones. */
export function checkTutorial(s: GameState): Objective[] {
  const t = s.tutorial;
  // hiding the notes only hides them: progress and rewards continue
  if (!t || t.finished) return [];
  const fresh: Objective[] = [];
  for (const o of OBJECTIVES) {
    if (t.done.includes(o.id)) continue;
    if (o.done(s)) {
      t.done.push(o.id);
      reward(s, o.reward, '');
      fresh.push(o);
    }
  }
  if (t.done.length >= OBJECTIVES.length && !t.finished) {
    t.finished = true;
    reward(s, FINAL_REWARD, '');
    addDispatch(s, 'story', 'You know the ropes', [
      "Your notes are full. You've run contracts, read the odds, equipped and ordered your people, dealt with the city and its Council, and started building the guild.",
      `A small purse from the Weighhouse, for a guild that might last: +${FINAL_REWARD.crowns} crowns.`,
    ]);
  }
  return fresh;
}

export interface GuideView {
  active: Objective[]; // up to three, in order
  waiting: { o: Objective; reason: string }[];
  done: number;
  total: number;
}

export function guideView(s: GameState, limit = 3): GuideView {
  const t = s.tutorial;
  const active: Objective[] = [];
  const waiting: { o: Objective; reason: string }[] = [];
  for (const o of OBJECTIVES) {
    if (t?.done.includes(o.id)) continue;
    const a = o.available ? o.available(s) : true;
    if (a !== true) waiting.push({ o, reason: a });
    else if (active.length < limit) active.push(o);
  }
  return { active, waiting, done: t?.done.length ?? 0, total: OBJECTIVES.length };
}

export { OBJECTIVES };
