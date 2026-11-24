import { chance, randInt } from '../core/rng';
import type { GameState } from '../core/types';
import { addDispatch } from '../core/util';

/** Saint Oda's sisters look in on the guild's wounded. */
export function odaHeal(s: GameState): number {
  const st = s.factions.oda?.standing ?? 0;
  return st >= 40 ? 4 : st >= 20 ? 2 : 0;
}

/** Weekly effects of standing with the factions met in the story. */
export function factionPerks(s: GameState) {
  if ((s.factions.fourteen?.standing ?? 0) >= 25 && s.week % 4 === 0) {
    s.influence += 1;
    addDispatch(s, 'politics', 'A word from the Fourteen', ['One of the old families mentioned your guild favorably at court. Influence +1.']);
  }
  if ((s.factions.mudlarks?.standing ?? 0) <= -25 && s.supplies >= 4 && chance(s, 0.25)) {
    const lost = Math.min(s.supplies, randInt(s, 2, 5));
    s.supplies -= lost;
    addDispatch(s, 'warning', 'Something went missing', [`The back door of the stores was found open this morning, and ${lost} supplies have gone. Nobody on the river saw a thing.`]);
  }
}
