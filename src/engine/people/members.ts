import { ITEMS } from '../data/items';
import { PROFESSIONS } from '../data/professions';
import { FIRST_NAMES, LAST_NAMES, TRAITS } from '../data/traits';
import { chance, pick, randInt, uid } from '../core/rng';
import type { Attribute, GameState, Member, ProfessionId, Recruit } from '../core/types';
import { clamp, living } from '../core/util';
import { addItem } from '../economy/items';

export const ATTRS: Attribute[] = ['might', 'finesse', 'wits', 'resolve'];

/** First names stay unique among the guild and the hiring hall, so journals read clearly. */
function uniqueName(state: GameState): string {
  const taken = new Set([...living(state), ...state.recruits.map((r) => r.member)].map((m) => m.name.split(' ')[0]));
  let firstName = pick(state, FIRST_NAMES);
  for (let i = 0; i < 20 && taken.has(firstName); i++) firstName = pick(state, FIRST_NAMES);
  return `${firstName} ${pick(state, LAST_NAMES)}`;
}

export function createMember(state: GameState, profession: ProfessionId, quality = 0): Member {
  const prof = PROFESSIONS[profession];
  const attrs = { ...prof.base };
  for (const a of ATTRS) attrs[a] = clamp(attrs[a] + randInt(state, -1, 1) + (chance(state, 0.15 + quality * 0.1) ? 1 : 0), 1, 10);
  const traitIds = Object.keys(TRAITS);
  const traits: string[] = [];
  const nTraits = chance(state, 0.6) ? 2 : 1;
  while (traits.length < nTraits) {
    const t = pick(state, traitIds);
    if (!traits.includes(t)) traits.push(t);
  }
  const wage = prof.wage + traits.reduce((s, t) => s + (TRAITS[t].wage ?? 0), 0);
  const m: Member = {
    id: uid(state, 'm'),
    name: uniqueName(state),
    profession,
    attrs,
    level: 1,
    xp: 0,
    health: 100,
    fatigue: 0,
    morale: 55 + randInt(state, -5, 10),
    loyalty: 60 + randInt(state, -5, 10),
    wage,
    traits,
    loadout: { consumables: [] },
    status: 'idle',
    assignment: 'rest',
    trainProgress: 0,
    weeksUnpaid: 0,
    joinedWeek: state.week,
    missions: 0,
    record: [],
    exposure: 0,
    changes: [],
    scars: [],
    habits: [],
  };
  for (const g of prof.startingGear) {
    const id = addItem(state, g);
    const def = ITEMS[g];
    if (def.slot === 'weapon') m.loadout.weapon = id;
    else if (def.slot === 'armor') m.loadout.armor = id;
    else if (def.slot === 'trinket') m.loadout.trinket = id;
  }
  return m;
}

/** Recruits carry their gear as a promise: items are only created on hire. */
export function generateRecruit(state: GameState): Recruit {
  const lt = state.factions.lowertown.standing;
  const quality = lt >= 30 ? 2 : lt >= 10 ? 1 : 0;
  const profs = Object.keys(PROFESSIONS) as ProfessionId[];
  const profession = pick(state, profs);
  // build a member without registering gear
  const before = state.items.length;
  const m = createMember(state, profession, quality);
  const gear = state.items.splice(before);
  m.loadout = { consumables: [] };
  const discount = lt >= 20 ? 0.75 : lt <= -20 ? 1.5 : 1;
  return { member: m, signOn: Math.round(m.wage * 4 * discount), expiresWeek: state.week + 2, gear: gear.map((g) => g.defId) };
}

export function xpToLevel(level: number) {
  return 8 + level * 4;
}
