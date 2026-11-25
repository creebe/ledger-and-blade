// Levelling up. Contracts are now walked as expeditions: see ../expeditions/run.ts,
// which settles a squad's trip when it comes home.
import { PROFESSIONS } from '../data/professions';
import { pick } from '../core/rng';
import type { GameState, Member } from '../core/types';
import { addDispatch, clamp } from '../core/util';
import { xpToLevel, ATTRS } from '../people/members';

export function levelUp(state: GameState, m: Member) {
  while (m.xp >= xpToLevel(m.level)) {
    m.xp -= xpToLevel(m.level);
    m.level += 1;
    m.wage += 1;
    const prof = PROFESSIONS[m.profession];
    // favor the profession's strongest base attributes
    const weightedAttrs = ATTRS.flatMap((a) => Array(prof.base[a]).fill(a) as string[]);
    let attr = pick(state, weightedAttrs) as keyof Member['attrs'];
    if (m.attrs[attr] >= 10) attr = ATTRS.find((a) => m.attrs[a] < 10) ?? attr;
    m.attrs[attr] = clamp(m.attrs[attr] + 1, 1, 10);
    addDispatch(state, 'roster', `${m.name} reached level ${m.level}`, [`${attr[0].toUpperCase()}${attr.slice(1)} +1. Wage is now ${m.wage}/week.`]);
  }
}
