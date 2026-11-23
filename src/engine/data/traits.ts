import type { Approach } from '../types';

export interface TraitDef {
  id: string;
  name: string;
  description: string;
  bonus?: Partial<Record<Approach, number>>;
  wage?: number;
  chance?: number; // flat bonus to phase success chance when this member is the lead
  negative?: boolean;
}

const list: TraitDef[] = [
  { id: 'brave', name: 'Brave', description: 'Assault +1. Morale falls less after losses.', bonus: { assault: 1 } },
  { id: 'cautious', name: 'Cautious', description: 'Stealth +1, Assault -1.', bonus: { stealth: 1, assault: -1 } },
  { id: 'greedy', name: 'Greedy', description: 'Wage +2. Loyalty falls twice as fast when unpaid.', wage: 2, negative: true },
  { id: 'hotheaded', name: 'Hotheaded', description: 'Assault +1, Guile -2. Prone to brawls.', bonus: { assault: 1, guile: -2 }, negative: true },
  { id: 'steady', name: 'Steady', description: 'Endurance +1.', bonus: { endurance: 1 } },
  { id: 'silver_tongue', name: 'Silver Tongue', description: 'Guile +2.', bonus: { guile: 2 } },
  { id: 'veteran', name: 'Veteran of the Lost War', description: 'Assault and Endurance +1. Wage +2.', bonus: { assault: 1, endurance: 1 }, wage: 2 },
  { id: 'drunkard', name: 'Drunkard', description: 'Endurance -1. Cheerful, though.', bonus: { endurance: -1 }, negative: true },
  { id: 'frail', name: 'Frail', description: 'Endurance -1. Recovers slowly.', bonus: { endurance: -1 }, negative: true },
  { id: 'lower_born', name: 'Lower Town Born', description: 'Guile +1 in Varrow. Loyal to the Lower Town.', bonus: { guile: 1 } },
  { id: 'bookish', name: 'Bookish', description: 'Arcana +1, Assault -1.', bonus: { arcana: 1, assault: -1 } },
  { id: 'nimble', name: 'Nimble', description: 'Stealth +1, Endurance +1.', bonus: { stealth: 1, endurance: 1 } },
];

export const TRAITS: Record<string, TraitDef> = Object.fromEntries(list.map((t) => [t.id, t]));

export const FIRST_NAMES = [
  'Aldo', 'Brenna', 'Cass', 'Dunstan', 'Edda', 'Fenn', 'Garrick', 'Hild', 'Isolde', 'Jory', 'Kit', 'Lise', 'Marten',
  'Nell', 'Osric', 'Petra', 'Quentin', 'Rosamund', 'Sabine', 'Tam', 'Ulla', 'Wat', 'Yvette', 'Agnes', 'Bram', 'Colm',
  'Dace', 'Elric', 'Freya', 'Godwin', 'Hesper', 'Idris', 'Joan', 'Leofric', 'Maud', 'Nils', 'Orla', 'Piers', 'Ros',
  'Simeon', 'Tilde', 'Ursel', 'Wenna', 'Ash', 'Bertil', 'Cora', 'Ewan', 'Greta', 'Hob', 'Ivo', 'Kester', 'Lowri',
];
export const LAST_NAMES = [
  'Ashby', 'Brack', 'Coppard', 'Dunmore', 'Fletch', 'Greave', 'Holloway', 'Ketter', 'Lusk', 'Marrow', 'Penhale',
  'Quarry', 'Rusk', 'Sallow', 'Thorne', 'Vane', 'Whitlock', 'Abernoy', 'Birch', 'Callow', 'Dray', 'Eskett', 'Fallow',
  'Gant', 'Harl', 'Ingram', 'Joss', 'Kemp', 'Ludd', 'Mercer', 'Nettle', 'Orrin', 'Pike', 'Reeve', 'Stroud', 'Tanner',
  'Wick', 'Yarrow', 'Cobb', 'Dunning',
];
