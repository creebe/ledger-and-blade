import type { Approach, Attributes, ProfessionId } from '../types';

export interface ProfessionDef {
  id: ProfessionId;
  name: string;
  blurb: string;
  base: Attributes;
  // flat bonus to approach scores
  aptitude: Partial<Record<Approach, number>>;
  // can perform arcana at full strength
  arcane?: boolean;
  wage: number;
  startingGear: string[];
}

export const PROFESSIONS: Record<ProfessionId, ProfessionDef> = {
  vanguard: {
    id: 'vanguard',
    name: 'Vanguard',
    blurb: 'Front-line fighter. Holds the line and carries heavy armor without complaint.',
    base: { might: 7, finesse: 4, wits: 3, resolve: 6 },
    aptitude: { assault: 4, endurance: 3 },
    wage: 9,
    startingGear: ['arming_sword', 'mail_hauberk'],
  },
  skirmisher: {
    id: 'skirmisher',
    name: 'Skirmisher',
    blurb: 'Fast, mobile fighter. Strikes from the flanks and fights well in rough country.',
    base: { might: 5, finesse: 7, wits: 4, resolve: 4 },
    aptitude: { assault: 2, stealth: 2, endurance: 1 },
    wage: 8,
    startingGear: ['spear', 'gambeson'],
  },
  marksman: {
    id: 'marksman',
    name: 'Marksman',
    blurb: 'Bow or crossbow specialist. Deadly against beasts and anything that can be seen first.',
    base: { might: 4, finesse: 7, wits: 5, resolve: 4 },
    aptitude: { assault: 3, stealth: 1 },
    wage: 9,
    startingGear: ['hunting_bow', 'leather_jack'],
  },
  arcanist: {
    id: 'arcanist',
    name: 'Arcanist',
    blurb: 'College-trained spellworker. Turns reagents into fire, frost and lightning, at a price.',
    base: { might: 2, finesse: 4, wits: 8, resolve: 5 },
    aptitude: { arcana: 5, guile: 1 },
    arcane: true,
    wage: 13,
    startingGear: ['focus_rod', 'padded_robes'],
  },
  chaplain: {
    id: 'chaplain',
    name: 'Chaplain',
    blurb: 'Field physician and wardwright of Saint Oda\'s. Keeps the squad alive and steady.',
    base: { might: 4, finesse: 3, wits: 6, resolve: 7 },
    aptitude: { endurance: 2, arcana: 2, guile: 1 },
    arcane: true,
    wage: 10,
    startingGear: ['mace', 'gambeson'],
  },
  scout: {
    id: 'scout',
    name: 'Scout',
    blurb: 'Pathfinder and tracker. Sees trouble before it sees you.',
    base: { might: 4, finesse: 6, wits: 6, resolve: 4 },
    aptitude: { stealth: 3, endurance: 2 },
    wage: 8,
    startingGear: ['hunting_bow', 'leather_jack'],
  },
  envoy: {
    id: 'envoy',
    name: 'Envoy',
    blurb: 'Negotiator, liar, charmer. Wins fights that never happen.',
    base: { might: 3, finesse: 4, wits: 7, resolve: 6 },
    aptitude: { guile: 3, endurance: 1 },
    wage: 11,
    startingGear: ['dagger', 'fine_doublet'],
  },
  infiltrator: {
    id: 'infiltrator',
    name: 'Infiltrator',
    blurb: 'Locks, rooftops and knives. Goes where the squad cannot.',
    base: { might: 4, finesse: 8, wits: 5, resolve: 3 },
    aptitude: { stealth: 4, guile: 2 },
    wage: 10,
    startingGear: ['dagger', 'leather_jack'],
  },
};

export const APPROACH_INFO: Record<Approach, { name: string; icon: string; blurb: string }> = {
  assault: { name: 'Assault', icon: '⚔', blurb: 'Brute force. Every member fights, so numbers and good weapons matter.' },
  stealth: { name: 'Stealth', icon: '☾', blurb: 'Quiet and unseen. The clumsiest member drags everyone down, and heavy armor makes noise.' },
  guile: { name: 'Guile', icon: '✒', blurb: 'Talk, bribe, deceive. The best talker leads and the rest support.' },
  endurance: { name: 'Endurance', icon: '⛰', blurb: 'Hard roads, cold and hunger. Everyone must keep up, and fatigue hurts.' },
  arcana: { name: 'Arcana', icon: '✶', blurb: 'Spellwork. Only trained Arcanists and Chaplains contribute fully.' },
};
