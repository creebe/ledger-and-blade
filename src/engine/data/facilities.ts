import type { MaterialId } from '../core/types';

export type FacilityId = 'hall' | 'forge' | 'stillroom' | 'infirmary' | 'yard' | 'den' | 'stables' | 'muster';

export interface FacilityLevel {
  crowns: number;
  materials: Partial<Record<MaterialId, number>>;
  weeks: number;
  upkeep: number; // added weekly cost at this level
  effect: string; // what this level gives
}

export interface FacilityDef {
  id: FacilityId;
  name: string;
  icon: string;
  blurb: string;
  start: number; // level at the start of the game
  levels: FacilityLevel[]; // index 0 = level 1
}

export const FACILITIES: Record<FacilityId, FacilityDef> = {
  hall: {
    id: 'hall',
    name: 'Great Hall',
    icon: 'hall',
    blurb: 'Bunks, benches and a long table. Room for more members.',
    start: 1,
    levels: [
      { crowns: 0, materials: {}, weeks: 0, upkeep: 0, effect: 'Room for 7 members.' },
      { crowns: 250, materials: { timber: 15, iron: 5 }, weeks: 4, upkeep: 4, effect: 'Room for 10 members. +5 morale on completion.' },
      { crowns: 500, materials: { timber: 25, iron: 10 }, weeks: 6, upkeep: 8, effect: 'Room for 13 members. Renown +3 on completion.' },
    ],
  },
  forge: {
    id: 'forge',
    name: 'Forge',
    icon: 'anvil',
    blurb: 'Make weapons and armor from iron, timber and leather.',
    start: 0,
    levels: [
      { crowns: 150, materials: { timber: 6, iron: 8 }, weeks: 3, upkeep: 3, effect: 'Craft standard weapons, light and mail armor, lanterns and kits. 1 item a week.' },
      { crowns: 300, materials: { iron: 15, timber: 8 }, weeks: 4, upkeep: 5, effect: 'Craft longswords, warhammers, arbalests and brigandines. 2 items a week.' },
      { crowns: 600, materials: { iron: 25, leather: 6 }, weeks: 6, upkeep: 8, effect: 'Craft plate harness. 3 items a week.' },
    ],
  },
  stillroom: {
    id: 'stillroom',
    name: 'Stillroom',
    icon: 'flask',
    blurb: 'Distill reagents into oils, salts, draughts and, in time, keyed foci.',
    start: 0,
    levels: [
      { crowns: 120, materials: { timber: 5, reagents: 4 }, weeks: 2, upkeep: 3, effect: 'Brew fire oil, frost salts, draughts, remedies and smoke. 2 a week.' },
      { crowns: 260, materials: { reagents: 10, timber: 6 }, weeks: 3, upkeep: 4, effect: 'Brew storm flasks and radiant chalk; make wardstones and assay lenses. 4 a week.' },
      { crowns: 500, materials: { reagents: 18, iron: 4 }, weeks: 5, upkeep: 6, effect: 'Key ember, rime and storm foci. 6 a week.' },
    ],
  },
  infirmary: {
    id: 'infirmary',
    name: 'Infirmary',
    icon: 'heart',
    blurb: 'Clean beds and a physician on call. Wounded members recover faster.',
    start: 0,
    levels: [
      { crowns: 140, materials: { timber: 8, leather: 4 }, weeks: 3, upkeep: 3, effect: '+5 health a week for members at home.' },
      { crowns: 280, materials: { timber: 10, reagents: 6 }, weeks: 4, upkeep: 5, effect: '+9 health a week.' },
      { crowns: 520, materials: { reagents: 12, timber: 10 }, weeks: 5, upkeep: 7, effect: '+13 health a week, and fatigue falls faster.' },
    ],
  },
  yard: {
    id: 'yard',
    name: 'Training Yard',
    icon: 'train',
    blurb: 'Pells, butts and a sand ring. Training is faster and cheaper.',
    start: 0,
    levels: [
      { crowns: 100, materials: { timber: 10 }, weeks: 2, upkeep: 2, effect: 'Training takes 3 weeks per point (instead of 4).' },
      { crowns: 220, materials: { timber: 12, iron: 6 }, weeks: 3, upkeep: 4, effect: 'Training takes 2 weeks per point and costs 6 crowns a week.' },
      { crowns: 420, materials: { timber: 15, iron: 10 }, weeks: 4, upkeep: 6, effect: 'Training costs 4 crowns a week. Trainees also gain experience.' },
    ],
  },
  den: {
    id: 'den',
    name: "Spymaster's Den",
    icon: 'eye',
    blurb: 'A back room, paid ears and a ledger of secrets.',
    start: 0,
    levels: [
      { crowns: 160, materials: { timber: 6 }, weeks: 3, upkeep: 4, effect: '+1 Intel a week.' },
      { crowns: 320, materials: { timber: 8, iron: 2 }, weeks: 4, upkeep: 6, effect: '+2 Intel a week. Revealing a hidden tag costs 1 Intel.' },
      { crowns: 560, materials: { timber: 10, reagents: 4 }, weeks: 5, upkeep: 9, effect: "Hobb & Daughters' plans are known every week." },
    ],
  },
  stables: {
    id: 'stables',
    name: 'Stables',
    icon: 'road',
    blurb: 'Horses and a wagon. Squads travel faster, and spend less on the road.',
    start: 0,
    levels: [
      { crowns: 200, materials: { timber: 12, leather: 6 }, weeks: 3, upkeep: 5, effect: 'Return trips are 1 week shorter.' },
      { crowns: 400, materials: { timber: 15, leather: 10 }, weeks: 4, upkeep: 8, effect: 'Trips of 2 weeks each way are also 1 week shorter going out.' },
    ],
  },
  muster: {
    id: 'muster',
    name: 'Muster room',
    icon: 'people',
    blurb: 'A back room with a long table, pegs for packs and a map of everywhere the guild sends people.',
    start: 0,
    levels: [{ crowns: 220, materials: { timber: 10, iron: 4 }, weeks: 3, upkeep: 4, effect: 'A third squad can be out at once.' }],
  },
};

export const FACILITY_IDS = Object.keys(FACILITIES) as FacilityId[];

export interface Recipe {
  id: string; // item def id produced
  facility: 'forge' | 'stillroom';
  level: number;
  materials: Partial<Record<MaterialId, number>>;
  crowns: number;
  count?: number; // items produced (consumables come in pairs)
}

export const RECIPES: Recipe[] = [
  // Forge I
  { id: 'arming_sword', facility: 'forge', level: 1, materials: { iron: 3 }, crowns: 8 },
  { id: 'spear', facility: 'forge', level: 1, materials: { iron: 1, timber: 2 }, crowns: 6 },
  { id: 'mace', facility: 'forge', level: 1, materials: { iron: 3 }, crowns: 6 },
  { id: 'hunting_bow', facility: 'forge', level: 1, materials: { timber: 3, leather: 1 }, crowns: 8 },
  { id: 'leather_jack', facility: 'forge', level: 1, materials: { leather: 3 }, crowns: 5 },
  { id: 'mail_hauberk', facility: 'forge', level: 1, materials: { iron: 6 }, crowns: 14 },
  { id: 'lantern', facility: 'forge', level: 1, materials: { iron: 1 }, crowns: 2, count: 2 },
  { id: 'climbing_kit', facility: 'forge', level: 1, materials: { leather: 1, iron: 1 }, crowns: 3, count: 2 },
  { id: 'fur_cloak', facility: 'forge', level: 1, materials: { leather: 3 }, crowns: 4 },
  // Forge II
  { id: 'longsword', facility: 'forge', level: 2, materials: { iron: 6 }, crowns: 20 },
  { id: 'warhammer', facility: 'forge', level: 2, materials: { iron: 6, timber: 1 }, crowns: 20 },
  { id: 'crossbow', facility: 'forge', level: 2, materials: { iron: 3, timber: 3 }, crowns: 22 },
  { id: 'brigandine', facility: 'forge', level: 2, materials: { iron: 5, leather: 3 }, crowns: 22 },
  // Forge III
  { id: 'plate_harness', facility: 'forge', level: 3, materials: { iron: 12, leather: 2 }, crowns: 40 },
  // Stillroom I
  { id: 'fire_oil', facility: 'stillroom', level: 1, materials: { reagents: 1 }, crowns: 3, count: 2 },
  { id: 'frost_salts', facility: 'stillroom', level: 1, materials: { reagents: 1 }, crowns: 3, count: 2 },
  { id: 'remedies', facility: 'stillroom', level: 1, materials: { reagents: 1 }, crowns: 2, count: 2 },
  { id: 'smoke', facility: 'stillroom', level: 1, materials: { reagents: 1 }, crowns: 2, count: 2 },
  { id: 'draught', facility: 'stillroom', level: 1, materials: { reagents: 2 }, crowns: 4 },
  // Stillroom II
  { id: 'storm_flask', facility: 'stillroom', level: 2, materials: { reagents: 2 }, crowns: 4, count: 2 },
  { id: 'radiant_chalk', facility: 'stillroom', level: 2, materials: { reagents: 2 }, crowns: 4, count: 2 },
  { id: 'wardstone', facility: 'stillroom', level: 2, materials: { reagents: 3, iron: 1 }, crowns: 12 },
  { id: 'assay_lens', facility: 'stillroom', level: 2, materials: { reagents: 2, iron: 1 }, crowns: 10 },
  // Stillroom III
  { id: 'ember_focus', facility: 'stillroom', level: 3, materials: { reagents: 5, iron: 2 }, crowns: 20 },
  { id: 'rime_focus', facility: 'stillroom', level: 3, materials: { reagents: 5, iron: 2 }, crowns: 20 },
  { id: 'storm_focus', facility: 'stillroom', level: 3, materials: { reagents: 6, iron: 2 }, crowns: 24 },
];

export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
