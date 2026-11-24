import type { Approach, Attributes, ProfessionId } from '../core/types';

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
    blurb: 'A front-line fighter who can carry heavy armor all day without complaining.',
    base: { might: 7, finesse: 4, wits: 3, resolve: 6 },
    aptitude: { assault: 4, endurance: 3 },
    wage: 9,
    startingGear: ['arming_sword', 'mail_hauberk'],
  },
  skirmisher: {
    id: 'skirmisher',
    name: 'Skirmisher',
    blurb: 'A quick fighter who works the flanks and is at home in rough country.',
    base: { might: 5, finesse: 7, wits: 4, resolve: 4 },
    aptitude: { assault: 2, stealth: 2, endurance: 1 },
    wage: 8,
    startingGear: ['spear', 'gambeson'],
  },
  marksman: {
    id: 'marksman',
    name: 'Marksman',
    blurb: 'A bow or crossbow specialist, at their best against anything they can see coming.',
    base: { might: 4, finesse: 7, wits: 5, resolve: 4 },
    aptitude: { assault: 3, stealth: 1 },
    wage: 9,
    startingGear: ['hunting_bow', 'leather_jack'],
  },
  arcanist: {
    id: 'arcanist',
    name: 'Arcanist',
    blurb: 'Trained at the college to turn reagents into fire or frost on demand, and paid accordingly.',
    base: { might: 2, finesse: 4, wits: 8, resolve: 5 },
    aptitude: { arcana: 5, guile: 1 },
    arcane: true,
    wage: 13,
    startingGear: ['focus_rod', 'padded_robes'],
  },
  chaplain: {
    id: 'chaplain',
    name: 'Chaplain',
    blurb: 'Trained as a field physician at Saint Oda\'s. Keeps people alive, and keeps them calm while doing it.',
    base: { might: 4, finesse: 3, wits: 6, resolve: 7 },
    aptitude: { endurance: 2, arcana: 2, guile: 1 },
    arcane: true,
    wage: 10,
    startingGear: ['mace', 'gambeson'],
  },
  scout: {
    id: 'scout',
    name: 'Scout',
    blurb: 'A tracker and pathfinder, good at noticing things before they turn into problems.',
    base: { might: 4, finesse: 6, wits: 6, resolve: 4 },
    aptitude: { stealth: 3, endurance: 2 },
    wage: 8,
    startingGear: ['hunting_bow', 'leather_jack'],
  },
  envoy: {
    id: 'envoy',
    name: 'Envoy',
    blurb: 'Talks the squad out of trouble, usually for less than a fight would have cost.',
    base: { might: 3, finesse: 4, wits: 7, resolve: 6 },
    aptitude: { guile: 3, endurance: 1 },
    wage: 11,
    startingGear: ['dagger', 'fine_doublet'],
  },
  infiltrator: {
    id: 'infiltrator',
    name: 'Infiltrator',
    blurb: 'Good with locks and rooftops, and with a knife when it comes to that.',
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
