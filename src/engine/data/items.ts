import type { ItemDef } from '../types';

const list: ItemDef[] = [
  // ---- Weapons ----
  { id: 'dagger', name: 'Dagger', slot: 'weapon', price: 12, damage: 'pierce', power: 2, bonus: { stealth: 1 }, description: 'Quiet and easily hidden.' },
  { id: 'arming_sword', name: 'Arming Sword', slot: 'weapon', price: 30, damage: 'slash', power: 4, description: 'A reliable one-handed blade.' },
  { id: 'spear', name: 'Spear', slot: 'weapon', price: 22, damage: 'pierce', power: 4, description: 'Reach and a sharp point. Good against beasts.' },
  { id: 'mace', name: 'Flanged Mace', slot: 'weapon', price: 26, damage: 'blunt', power: 4, description: 'Dents armor and breaks shells.' },
  { id: 'hunting_bow', name: 'Hunting Bow', slot: 'weapon', price: 28, damage: 'pierce', power: 4, ranged: true, description: 'Strikes first from cover.' },
  { id: 'focus_rod', name: 'Plain Focus Rod', slot: 'weapon', price: 25, damage: 'blunt', power: 1, bonus: { arcana: 2 }, description: 'A college-issue rod. It channels spells well enough, but has no element.' },
  { id: 'longsword', name: 'Longsword', slot: 'weapon', price: 70, damage: 'slash', power: 6, description: 'Long reach and a keen edge.' },
  { id: 'warhammer', name: 'Warhammer', slot: 'weapon', price: 75, damage: 'blunt', power: 6, description: 'Made for opening armor like a tin of fish.' },
  { id: 'crossbow', name: 'Arbalest', slot: 'weapon', price: 80, damage: 'pierce', power: 6, ranged: true, bonus: { stealth: -1 }, description: 'Slow and loud, but it punches through mail.' },
  { id: 'ember_focus', name: 'Ember Focus', slot: 'weapon', price: 90, damage: 'blunt', power: 2, element: 'fire', bonus: { arcana: 3 }, description: 'A fire-keyed focus licensed by the Assay Office.' },
  { id: 'rime_focus', name: 'Rime Focus', slot: 'weapon', price: 90, damage: 'blunt', power: 2, element: 'frost', bonus: { arcana: 3 }, description: 'A frost-keyed focus. Slows anything warm-blooded.' },
  { id: 'storm_focus', name: 'Storm Focus', slot: 'weapon', price: 100, damage: 'blunt', power: 2, element: 'storm', bonus: { arcana: 3 }, description: 'Storm-keyed. Cracks wards and armor alike.' },
  { id: 'dawn_censer', name: 'Dawn Censer', slot: 'weapon', price: 85, damage: 'blunt', power: 3, element: 'radiant', bonus: { arcana: 2, endurance: 1 }, description: "Saint Oda's radiant censer, for burning out rot and fear." },

  // ---- Armor ----
  { id: 'padded_robes', name: 'Padded Robes', slot: 'armor', price: 10, weight: 'light', protection: 1, description: 'Barely armor at all.' },
  { id: 'gambeson', name: 'Gambeson', slot: 'armor', price: 18, weight: 'light', protection: 2, description: 'Quilted linen. Light and quiet.' },
  { id: 'leather_jack', name: 'Leather Jack', slot: 'armor', price: 20, weight: 'light', protection: 2, description: 'Boiled leather. Flexible and silent.' },
  { id: 'fine_doublet', name: 'Fine Doublet', slot: 'armor', price: 40, weight: 'light', protection: 1, bonus: { guile: 2 }, description: 'Opens doors that armor would close.' },
  { id: 'mail_hauberk', name: 'Mail Hauberk', slot: 'armor', price: 55, weight: 'medium', protection: 4, description: 'Riveted mail. It jingles when you move.' },
  { id: 'brigandine', name: 'Brigandine', slot: 'armor', price: 85, weight: 'medium', protection: 5, description: 'Plates riveted inside cloth. Quieter than mail.' },
  { id: 'plate_harness', name: 'Plate Harness', slot: 'armor', price: 160, weight: 'heavy', protection: 8, description: 'Near-proof against blades. Hard to sneak or march in.' },

  // ---- Trinkets ----
  { id: 'oda_medal', name: "Saint Oda's Medal", slot: 'trinket', price: 30, bonus: { endurance: 2 }, description: 'A pilgrim token said to steady the spirit.' },
  { id: 'signet', name: 'Borrowed Signet', slot: 'trinket', price: 45, bonus: { guile: 3 }, description: 'A merchant house signet. Not quite forged.' },
  { id: 'assay_lens', name: 'Assay Lens', slot: 'trinket', price: 50, bonus: { arcana: 2, guile: 1 }, description: 'Reveals the true nature of reagents and coin.' },
  { id: 'soft_boots', name: 'Soft Boots', slot: 'trinket', price: 35, bonus: { stealth: 2 }, description: 'Felt-soled. Silent on stone.' },
  { id: 'fur_cloak', name: 'Fur-lined Cloak', slot: 'trinket', price: 25, counters: ['cold'], bonus: { endurance: 1 }, description: 'Keeps the squad moving in the cold. Negates Cold.' },
  { id: 'wardstone', name: 'Wardstone', slot: 'trinket', price: 60, counters: ['warded'], description: "Unpicks enemy wards. Negates Warded's protection." },

  // ---- Consumables (used up on the mission) ----
  { id: 'fire_oil', name: 'Fire Oil', slot: 'consumable', price: 18, grantsElement: 'fire', description: "Coats the carrier's weapon in fire for one mission." },
  { id: 'frost_salts', name: 'Frost Salts', slot: 'consumable', price: 18, grantsElement: 'frost', description: "Frost-keys the carrier's weapon for one mission." },
  { id: 'storm_flask', name: 'Storm Flask', slot: 'consumable', price: 22, grantsElement: 'storm', description: "Storm-keys the carrier's weapon for one mission." },
  { id: 'radiant_chalk', name: 'Radiant Chalk', slot: 'consumable', price: 20, grantsElement: 'radiant', description: "Radiant sigils for the carrier's weapon, for one mission." },
  { id: 'draught', name: 'Healing Draught', slot: 'consumable', price: 20, mending: 25, description: 'Reduces the next serious wound to the carrier. Can prevent a death.' },
  { id: 'smoke', name: 'Smoke Pellets', slot: 'consumable', price: 15, bonus: { stealth: 3 }, description: 'Stealth +3 for the carrier.' },
  { id: 'purse', name: 'Bribe Purse', slot: 'consumable', price: 30, bonus: { guile: 4 }, description: 'Guile +4 for the carrier. Silver speaks.' },
  { id: 'lantern', name: 'Hooded Lantern', slot: 'consumable', price: 10, counters: ['dark', 'night'], description: 'Negates the Assault penalty of Dark and Night for the squad.' },
  { id: 'remedies', name: 'Fen Remedies', slot: 'consumable', price: 14, counters: ['swamp', 'plague'], description: 'Negates the Endurance penalty of Swamp and Plague for the squad.' },
  { id: 'climbing_kit', name: 'Climbing Kit', slot: 'consumable', price: 16, counters: ['rough'], description: 'Negates the Endurance penalty of Rough Country for the squad.' },
];

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(list.map((i) => [i.id, i]));

// Items that can appear in the market, by renown tier.
export const MARKET_POOL: { id: string; minRenown: number }[] = [
  ...['dagger', 'arming_sword', 'spear', 'mace', 'hunting_bow', 'focus_rod', 'gambeson', 'leather_jack', 'mail_hauberk'].map((id) => ({ id, minRenown: 0 })),
  ...['fire_oil', 'frost_salts', 'storm_flask', 'radiant_chalk', 'draught', 'smoke', 'purse', 'lantern', 'remedies', 'climbing_kit', 'fur_cloak', 'oda_medal', 'soft_boots'].map((id) => ({ id, minRenown: 0 })),
  ...['longsword', 'warhammer', 'crossbow', 'brigandine', 'fine_doublet', 'signet', 'assay_lens', 'wardstone', 'ember_focus', 'rime_focus', 'dawn_censer'].map((id) => ({ id, minRenown: 8 })),
  ...['plate_harness', 'storm_focus'].map((id) => ({ id, minRenown: 18 })),
];

// Consumables are always stocked (the apothecary and chandler never close).
export const STAPLES = ['fire_oil', 'draught', 'lantern', 'remedies', 'smoke'];
