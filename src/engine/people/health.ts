// Who is laid up at the hall, and for how long. Kept apart from core/turn so the
// expedition prep can ask without importing the whole turn (and closing a cycle).
import type { GameState, Member } from '../core/types';
import { healBonus } from '../economy/buildings';
import { odaHeal } from '../politics/factions';

/** Health a member needs before they can take orders or go out again. */
export const FIT_HEALTH = 40;

/** What a laid-up member heals in a week at home. */
export const homeHeal = (s: GameState, m: Member) => (m.traits.includes('frail') ? 5 : 9) + healBonus(s) + odaHeal(s);

/**
 * Why a member at the hall can't take orders or go out this week, if they can't,
 * and how many End Weeks until they can. The home phase skips their orders while
 * this holds.
 */
export function laidUp(s: GameState, m: Member): { why: 'wounded' | 'fever'; weeks: number } | undefined {
  if (m.status === 'mission' || m.status === 'dead' || m.status === 'left') return undefined;
  if (m.fever) return { why: 'fever', weeks: Math.max(1, m.fever.weeks) };
  if (m.status === 'recovering' || m.health < FIT_HEALTH) return { why: 'wounded', weeks: Math.max(1, Math.ceil((FIT_HEALTH - m.health) / homeHeal(s, m))) };
  return undefined;
}
