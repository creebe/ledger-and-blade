// Content for the expeditions trial: Professions' combat profiles, gear,
// supplies, monsters, the site, goods, scars, habits and sponsors.
// Numbers that set the balance are in ../tuning.ts.
import type { Attributes, DamageType, Element, FactionId } from '../../core/types';
import type { DelverProf, ExpLength, GearDef, GoodId, MonsterId, SponsorGoal, SupplyId, ZoneId } from '../types';

// ---------------------------------------------------------------------------
// Professions
// ---------------------------------------------------------------------------

export interface DelverProfDef {
  id: DelverProf;
  name: string;
  blurb: string;
  base: Attributes;
  wage: number;
  gear: string[];
  /** ranks this Profession works best from, front (1) to back (4) */
  ranks: number[];
  skills: { name: string; text: string }[];
  /** the attribute that rises on a level */
  main: keyof Attributes;
}

export const DELVER_PROFS: Record<DelverProf, DelverProfDef> = {
  vanguard: {
    id: 'vanguard',
    name: 'Vanguard',
    blurb: 'Stands in front in heavy armor and takes what is meant for the others.',
    base: { might: 7, finesse: 4, wits: 3, resolve: 6 },
    wage: 9,
    gear: ['arming_sword', 'mail_hauberk'],
    ranks: [1, 2],
    main: 'might',
    skills: [
      { name: 'Cover', text: 'Steps in front of a badly hurt friend and takes the hits meant for them.' },
      { name: 'Shield bash', text: 'A lighter blow that can stun.' },
      { name: 'Cut', text: 'A plain, heavy swing at the front rank.' },
    ],
  },
  skirmisher: {
    id: 'skirmisher',
    name: 'Skirmisher',
    blurb: 'Fights quick and close, with two light cuts where a Vanguard makes one heavy one.',
    base: { might: 5, finesse: 7, wits: 4, resolve: 4 },
    wage: 8,
    gear: ['spear', 'gambeson'],
    ranks: [1, 2],
    main: 'finesse',
    skills: [
      { name: 'Two cuts', text: 'Two quick strikes at the front rank.' },
      { name: 'Hamstring', text: 'Opens a wound that bleeds for two rounds.' },
    ],
  },
  marksman: {
    id: 'marksman',
    name: 'Marksman',
    blurb: 'Shoots from the back, and can reach whatever is hiding behind the front rank.',
    base: { might: 4, finesse: 7, wits: 5, resolve: 4 },
    wage: 9,
    gear: ['hunting_bow', 'leather_jack'],
    ranks: [2, 3, 4],
    main: 'finesse',
    skills: [
      { name: 'Aimed shot', text: 'Reaches any rank and finds the weak places more often.' },
      { name: 'Pinning shot', text: 'Spoils the aim of the most dangerous enemy for two rounds.' },
    ],
  },
  arcanist: {
    id: 'arcanist',
    name: 'Arcanist',
    blurb: "Turns reagents into the element of their focus. Without reagents, they pay in their own blood.",
    base: { might: 2, finesse: 4, wits: 8, resolve: 5 },
    wage: 12,
    gear: ['focus_rod', 'padded_robes'],
    ranks: [2, 3, 4],
    main: 'wits',
    skills: [
      { name: 'Bolt', text: "One dose of reagents, one target, in the focus's element." },
      { name: 'Burst', text: 'Two doses, every enemy at once, for less each.' },
    ],
  },
  chaplain: {
    id: 'chaplain',
    name: 'Chaplain',
    blurb: "A field physician from Saint Oda's. Keeps people breathing and talks them through the dark.",
    base: { might: 4, finesse: 3, wits: 6, resolve: 7 },
    wage: 10,
    gear: ['mace', 'gambeson'],
    ranks: [1, 2, 3, 4],
    main: 'resolve',
    skills: [
      { name: 'Dress wounds', text: 'Heals a hurt friend in the middle of a fight. Bandages go twice as far in a Chaplain\'s hands.' },
      { name: 'Second wind', text: 'Gets the most worn-out member back on their feet: rubs their legs, makes them drink, tells them to stop sulking.' },
      { name: 'Censer', text: 'With a censer and a dose of reagents, burns radiant light into the enemy.' },
    ],
  },
  scout: {
    id: 'scout',
    name: 'Scout',
    blurb: 'Sees the tripwire before anyone steps on it, and finds the loose brick with the money behind it.',
    base: { might: 4, finesse: 6, wits: 6, resolve: 4 },
    wage: 8,
    gear: ['dagger', 'leather_jack'],
    ranks: [1, 2, 3, 4],
    main: 'wits',
    skills: [
      { name: 'Eyes open', text: 'Better odds of spotting traps and ambushes, and of finding hidden caches.' },
      { name: 'Knife in the gap', text: 'From the front, a knife that slips past armor. From the back, a thrown one.' },
    ],
  },
};

export const DELVER_PROF_IDS = Object.keys(DELVER_PROFS) as DelverProf[];

// ---------------------------------------------------------------------------
// Gear
// ---------------------------------------------------------------------------

const gearList: GearDef[] = [
  // weapons
  { id: 'dagger', name: 'Dagger', slot: 'weapon', price: 12, damage: 'pierce', power: 4, description: 'Short and quick. Finds the gaps in armor.' },
  { id: 'arming_sword', name: 'Arming Sword', slot: 'weapon', price: 30, damage: 'slash', power: 6, description: 'A reliable one-handed blade.' },
  { id: 'spear', name: 'Spear', slot: 'weapon', price: 22, damage: 'pierce', power: 5, description: 'A sharp point on a stout shaft. Good against hogs.' },
  { id: 'mace', name: 'Flanged Mace', slot: 'weapon', price: 26, damage: 'blunt', power: 5, description: 'Cracks shells and dents engines.' },
  { id: 'hunting_bow', name: 'Hunting Bow', slot: 'weapon', price: 28, damage: 'pierce', power: 5, ranged: true, description: 'Shoots from the back rank.' },
  { id: 'focus_rod', name: 'Plain Focus Rod', slot: 'weapon', price: 25, damage: 'blunt', power: 5, focus: true, description: 'College issue. Its spells carry no element.' },
  { id: 'longsword', name: 'Longsword', slot: 'weapon', price: 70, damage: 'slash', power: 8, minRenown: 6, description: 'Long reach and a keen edge.' },
  { id: 'warhammer', name: 'Warhammer', slot: 'weapon', price: 75, damage: 'blunt', power: 8, minRenown: 6, description: 'Made for opening armor and shells.' },
  { id: 'crossbow', name: 'Arbalest', slot: 'weapon', price: 80, damage: 'pierce', power: 9, ranged: true, minRenown: 10, description: 'Slow to wind, and it goes through mail.' },
  { id: 'ember_focus', name: 'Ember Focus', slot: 'weapon', price: 70, damage: 'blunt', power: 6, focus: true, element: 'fire', minRenown: 4, description: 'Fire-keyed. Spiders and moths hate it.' },
  { id: 'rime_focus', name: 'Rime Focus', slot: 'weapon', price: 70, damage: 'blunt', power: 6, focus: true, element: 'frost', minRenown: 4, description: 'Frost-keyed. Slows eels and quenches the Kiln.' },
  { id: 'storm_focus', name: 'Storm Focus', slot: 'weapon', price: 95, damage: 'blunt', power: 7, focus: true, element: 'storm', minRenown: 12, description: 'Storm-keyed. Cracks shells and stops engines.' },
  { id: 'dawn_censer', name: 'Dawn Censer', slot: 'weapon', price: 60, damage: 'blunt', power: 5, focus: true, element: 'radiant', minRenown: 4, description: "Saint Oda's censer. A Chaplain can burn radiant light with it." },
  // armor
  { id: 'padded_robes', name: 'Padded Robes', slot: 'armor', price: 10, protection: 1, bulk: 0, description: 'Barely armor at all.' },
  { id: 'gambeson', name: 'Gambeson', slot: 'armor', price: 18, protection: 2, bulk: 0, description: 'Quilted linen. Light and quiet.' },
  { id: 'leather_jack', name: 'Leather Jack', slot: 'armor', price: 20, protection: 2, bulk: 0, description: 'Boiled leather. It bends where you need it to and does not creak.' },
  { id: 'mail_hauberk', name: 'Mail Hauberk', slot: 'armor', price: 55, protection: 4, bulk: 6, description: 'Riveted mail. It jingles.' },
  { id: 'brigandine', name: 'Brigandine', slot: 'armor', price: 85, protection: 5, bulk: 3, minRenown: 6, description: 'Plates riveted inside cloth. Quieter than mail.' },
  { id: 'plate_harness', name: 'Plate Harness', slot: 'armor', price: 150, protection: 7, bulk: 12, minRenown: 14, description: 'Near-proof against teeth. Nobody sneaks anywhere in it.' },
  // trinkets
  { id: 'oda_medal', name: "Saint Oda's Medal", slot: 'trinket', price: 30, ease: 2, description: 'A pilgrim token for long walks. Fatigue builds a little slower for the wearer.' },
  { id: 'soft_boots', name: 'Soft Boots', slot: 'trinket', price: 30, dodge: 6, description: 'Felt soles. Dodge +6, and quieter past wanderers.' },
  { id: 'assay_lens', name: 'Assay Lens', slot: 'trinket', price: 45, finds: 0.2, minRenown: 4, description: 'Tells good silver from bad. Finds are worth a fifth more.' },
  { id: 'surgeon_roll', name: "Surgeon's Roll", slot: 'trinket', price: 40, heal: 4, description: 'Needles and gut. The wearer heals 4 more with each dressing or bandage.' },
  { id: 'thumb_ring', name: 'Thumb Ring', slot: 'trinket', price: 35, acc: 6, description: 'Horn, worn smooth. Aim +6.' },
];

export const GEAR: Record<string, GearDef> = Object.fromEntries(gearList.map((g) => [g.id, g]));
export const GEAR_IDS = gearList.map((g) => g.id);

// ---------------------------------------------------------------------------
// Supplies: what goes in the pack
// ---------------------------------------------------------------------------

export interface SupplyDef {
  id: SupplyId;
  name: string;
  one: string;
  perSlot: number;
  price: number;
  text: string;
}

export const SUPPLIES: Record<SupplyId, SupplyDef> = {
  food: { id: 'food', name: 'Food', one: 'meal', perSlot: 3, price: 4, text: 'One feeds the squad once. They eat every few rooms and at every camp.' },
  bandages: { id: 'bandages', name: 'Bandages', one: 'bandage', perSlot: 3, price: 4, text: 'Heal between rooms. Twice as good with a Chaplain standing.' },
  oil: { id: 'oil', name: 'Lamp oil', one: 'flask of oil', perSlot: 4, price: 2, text: 'The Buried Streets and the Sink are dark. One flask lights a room.' },
  tools: { id: 'tools', name: 'Tools', one: 'set of tools', perSlot: 2, price: 6, text: 'Crowbar, rope and wedges. Disarm traps, force strongboxes, clear rubble.' },
  masks: { id: 'masks', name: 'Wet masks', one: 'wet mask', perSlot: 2, price: 5, text: 'Linen and charcoal, soaked before use. One keeps a member breathing cleaner in the College Sink: half the Exposure.' },
  reagents: { id: 'reagents', name: 'Reagents', one: 'dose', perSlot: 3, price: 6, text: "Doses for the Arcanist's spells and the Chaplain's censer." },
  draughts: { id: 'draughts', name: 'Draughts', one: 'draught', perSlot: 1, price: 20, text: 'Brings a member who goes down straight back up. No roll for their life.' },
};

export const SUPPLY_IDS = Object.keys(SUPPLIES) as SupplyId[];

// ---------------------------------------------------------------------------
// Monsters
// ---------------------------------------------------------------------------

export interface MonsterDef {
  id: MonsterId;
  /** one of them in a sentence: "the {one}" */
  one: string;
  name: string;
  plural: string;
  zone: ZoneId;
  hp: number;
  acc: number;
  dodge: number;
  prot: number;
  dmg: [number, number];
  speed: number;
  /** attacks any rank (fliers, slings from the back, the Kiln's blast) */
  ranged?: boolean;
  weak: (DamageType | Element)[];
  resist: (DamageType | Element)[];
  special?: 'oil' | 'poison' | 'charge' | 'ambush' | 'blast' | 'thief' | 'swarm';
  /** "it" or "they" for one of them */
  xp: number;
  loot?: { good: GoodId; chance: number };
  coin?: number;
  construct?: boolean;
  text: string;
}

export const MONSTERS: Record<MonsterId, MonsterDef> = {
  rats: { id: 'rats', one: 'knot of rats', name: 'Culvert rats', plural: 'culvert rats', zone: 'culverts', hp: 9, acc: 72, dodge: 16, prot: 0, dmg: [2, 5], speed: 8, weak: ['fire', 'blunt'], resist: [], special: 'swarm', xp: 1, text: 'A knot of rats the size of cats, fed on everything that comes down the drains.' },
  moths: { id: 'moths', one: 'cloud of moths', name: 'Tallow moths', plural: 'tallow moths', zone: 'culverts', hp: 6, acc: 74, dodge: 30, prot: 0, dmg: [1, 3], speed: 9, ranged: true, weak: ['fire', 'radiant'], resist: ['blunt'], special: 'oil', xp: 1, text: 'Pale moths as wide as a hand. They drink lamp oil, and they will drink it out of the lamp.' },
  grubber: { id: 'grubber', one: 'grubber', name: 'Grubber', plural: 'grubbers', zone: 'culverts', hp: 15, acc: 72, dodge: 10, prot: 1, dmg: [4, 7], speed: 5, weak: [], resist: [], special: 'thief', xp: 2, coin: 6, text: 'People who live down here and dig for what Pellam left behind. They do not like company.' },
  eel: { id: 'eel', one: 'eel', name: 'Sink eel', plural: 'sink eels', zone: 'streets', hp: 22, acc: 76, dodge: 18, prot: 1, dmg: [5, 9], speed: 7, weak: ['storm', 'frost'], resist: [], special: 'ambush', xp: 3, loot: { good: 'eel_oil', chance: 0.7 }, text: 'A grey eel as long as a cart, living in the flooded cellars. It strikes from the water first.' },
  spider: { id: 'spider', one: 'spider', name: 'Cellar spider', plural: 'cellar spiders', zone: 'streets', hp: 15, acc: 78, dodge: 22, prot: 0, dmg: [3, 7], speed: 8, weak: ['fire'], resist: [], special: 'poison', xp: 3, text: 'A long-legged spider the color of wet plaster. Its bite keeps working after it lets go.' },
  hog: { id: 'hog', one: 'hog', name: 'Pale hog', plural: 'pale hogs', zone: 'streets', hp: 32, acc: 68, dodge: 4, prot: 2, dmg: [6, 11], speed: 5, weak: ['pierce'], resist: [], special: 'charge', xp: 4, text: 'Pigs got down here a century ago and kept breeding. They are white and blind, and as big as ponies.' },
  crab: { id: 'crab', one: 'crab', name: 'Sink crab', plural: 'sink crabs', zone: 'streets', hp: 24, acc: 70, dodge: 4, prot: 5, dmg: [4, 8], speed: 4, weak: ['blunt', 'storm'], resist: ['slash', 'pierce'], xp: 4, loot: { good: 'glass', chance: 0.4 }, text: 'River crabs grown huge on reagent runoff. Blades skid off them.' },
  seep: { id: 'seep', one: 'seep', name: 'Seep', plural: 'seeps', zone: 'sink', hp: 24, acc: 72, dodge: 0, prot: 0, dmg: [4, 8], speed: 3, weak: ['radiant', 'frost'], resist: ['slash', 'pierce'], xp: 5, loot: { good: 'salts', chance: 0.8 }, text: 'A spill of spent reagents that never stopped reacting. It moves toward warmth and it burns what it touches.' },
  engine: { id: 'engine', one: 'engine', name: 'Assay engine', plural: 'Assay engines', zone: 'sink', hp: 42, acc: 72, dodge: 0, prot: 6, dmg: [6, 11], speed: 2, weak: ['storm', 'blunt'], resist: ['pierce', 'fire'], construct: true, xp: 7, loot: { good: 'seal', chance: 0.9 }, text: "An iron testing engine the Assay Office left running when it moved upstairs. It still tests anything it finds, very hard." },
  kiln: { id: 'kiln', one: 'Kiln Engine', name: 'the Kiln Engine', plural: 'the Kiln Engine', zone: 'sink', hp: 100, acc: 74, dodge: 0, prot: 5, dmg: [7, 12], speed: 3, weak: ['frost', 'storm'], resist: ['fire', 'pierce'], special: 'blast', construct: true, xp: 14, loot: { good: 'kiln_core', chance: 1 }, text: "The college's great reagent furnace, built to walk the length of the Sink and burn the spill. Nobody told it to stop." },
};

export const MONSTER_IDS = Object.keys(MONSTERS) as MonsterId[];

// ---------------------------------------------------------------------------
// The site: Old Pellam
// ---------------------------------------------------------------------------

export interface ZoneDef {
  id: ZoneId;
  name: string;
  depth: number;
  dark: boolean;
  text: string;
  /** room weights */
  rooms: { passage: number; fight: number; trap: number; find: number; curio: number };
  fights: MonsterId[][];
  finds: { good: GoodId; min: number; max: number; weight: number }[];
  curios: string[];
}

export const ZONES: Record<ZoneId, ZoneDef> = {
  culverts: {
    id: 'culverts',
    name: 'the Culverts',
    depth: 1,
    dark: false,
    text: 'Brick drains and cellars under the Lower Town. Grates let a little daylight down.',
    rooms: { passage: 2.5, fight: 3, trap: 1.4, find: 2, curio: 1 },
    fights: [['rats', 'rats', 'rats'], ['rats', 'rats', 'grubber'], ['grubber', 'grubber'], ['grubber', 'grubber', 'grubber'], ['moths', 'moths', 'rats'], ['grubber', 'rats', 'rats']],
    finds: [
      { good: 'coin', min: 1, max: 3, weight: 4 },
      { good: 'glass', min: 1, max: 2, weight: 2 },
      { good: 'silver', min: 1, max: 1, weight: 1 },
    ],
    curios: ['shrine', 'strongbox', 'grubber_cache'],
  },
  streets: {
    id: 'streets',
    name: 'the Buried Streets',
    depth: 2,
    dark: true,
    text: "Pellam's old streets, roofed over by Varrow's foundations. The houses are full of silt.",
    rooms: { passage: 2, fight: 3.2, trap: 1.5, find: 2, curio: 1.2 },
    fights: [['spider', 'spider'], ['hog'], ['hog', 'rats', 'rats'], ['eel'], ['crab', 'crab'], ['grubber', 'grubber', 'spider'], ['moths', 'moths', 'spider'], ['eel', 'crab']],
    finds: [
      { good: 'silver', min: 1, max: 2, weight: 3 },
      { good: 'glass', min: 1, max: 3, weight: 2 },
      { good: 'coin', min: 2, max: 4, weight: 2 },
      { good: 'seal', min: 1, max: 1, weight: 1 },
    ],
    curios: ['shrine', 'strongbox', 'cart', 'still'],
  },
  sink: {
    id: 'sink',
    name: 'the College Sink',
    depth: 3,
    dark: true,
    text: 'Where the college poured its spent reagents for a hundred years. The walls sweat colors.',
    rooms: { passage: 1.6, fight: 3.4, trap: 1.6, find: 2.2, curio: 1 },
    fights: [['seep', 'seep'], ['engine'], ['seep', 'crab'], ['engine', 'seep'], ['crab', 'crab', 'seep'], ['seep', 'spider', 'spider']],
    finds: [
      { good: 'salts', min: 1, max: 3, weight: 3 },
      { good: 'seal', min: 1, max: 2, weight: 3 },
      { good: 'silver', min: 2, max: 3, weight: 2 },
      { good: 'glass', min: 2, max: 3, weight: 1 },
    ],
    curios: ['still', 'strongbox', 'shrine'],
  },
};

export const ZONE_ORDER: ZoneId[] = ['culverts', 'streets', 'sink'];

export interface LengthDef {
  id: ExpLength;
  name: string;
  weeks: number;
  /** rooms in order: a zone, a fixed camp site or the boss */
  route: (ZoneId | 'camp' | 'boss')[];
  goal: string;
  xp: number;
  renown: number;
}

export const LENGTHS: Record<ExpLength, LengthDef> = {
  short: { id: 'short', name: 'Short', weeks: 1, route: ['culverts', 'culverts', 'culverts', 'culverts', 'culverts'], goal: 'Through the Culverts to the old pump house', xp: 3, renown: 1 },
  medium: {
    id: 'medium',
    name: 'Medium',
    weeks: 2,
    route: ['culverts', 'culverts', 'culverts', 'culverts', 'camp', 'streets', 'streets', 'streets', 'streets'],
    goal: 'Down to the Buried Streets and the old counting house',
    xp: 5,
    renown: 3,
  },
  long: {
    id: 'long',
    name: 'Long',
    weeks: 3,
    route: ['culverts', 'culverts', 'culverts', 'streets', 'streets', 'streets', 'streets', 'camp', 'sink', 'sink', 'sink', 'sink', 'camp', 'boss'],
    goal: 'To the bottom of the College Sink, where the Kiln Engine walks',
    xp: 8,
    renown: 6,
  },
};

// ---------------------------------------------------------------------------
// Goods: what comes back up to be sold
// ---------------------------------------------------------------------------

export const GOODS: Record<GoodId, { id: GoodId; name: string; one: string; many: string; value: number; text: string }> = {
  coin: { id: 'coin', many: 'purses of Pellam coin', name: 'Pellam coin', one: 'a purse of Pellam coin', value: 9, text: 'Old coin from before the river moved. Collectors pay for it by the purse.' },
  glass: { id: 'glass', many: 'pieces of college glass', name: 'College glass', one: 'a piece of college glass', value: 16, text: 'Retorts and lenses the college threw away. The glassblowers on Anvil Row buy them back.' },
  eel_oil: { id: 'eel_oil', many: 'jars of eel oil', name: 'Eel oil', one: 'a jar of eel oil', value: 18, text: 'Rendered from sink eels. The Mudlarks use it to waterproof everything.' },
  silver: { id: 'silver', many: 'pieces of Pellam silver', name: 'Pellam silver', one: 'a piece of Pellam silver', value: 30, text: 'Plate and candlesticks from houses that were rich two hundred years ago.' },
  salts: { id: 'salts', many: 'jars of reagent salts', name: 'Reagent salts', one: 'a jar of reagent salts', value: 22, text: 'Crystals scraped from the Sink. Apothecaries ask no questions.' },
  seal: { id: 'seal', many: 'Assay seals', name: 'Assay seals', one: 'an Assay seal', value: 34, text: "Brass seals from the Assay Office's old engines. The Office pays to get them back." },
  kiln_core: { id: 'kiln_core', many: 'Kiln cores', name: 'Kiln core', one: "the Kiln Engine's core", value: 240, text: "The furnace heart of the Kiln Engine. The college would like it back, and will pay." },
};

export const GOOD_IDS = Object.keys(GOODS) as GoodId[];

// ---------------------------------------------------------------------------
// Scars and habits
// ---------------------------------------------------------------------------

export interface MarkDef {
  id: string;
  name: string;
  text: string;
  good?: boolean;
  maxHp?: number;
  acc?: number;
  dodge?: number;
  speed?: number;
  roomFatigue?: number; // extra fatigue each room
  darkFatigue?: number; // extra fatigue in each dark room
  deathRoll?: number; // added to the roll for their life when they go down
  burnGuard?: number; // less damage from seeps and the Kiln
  nightEyes?: boolean; // no aim penalty in the dark
  spot?: number; // trap and ambush spotting
  dmgVs?: { monster: MonsterId; dmg: number };
  accVs?: { monster: MonsterId; acc: number };
  finds?: number;
  campHeal?: number; // extra share of max HP healed at camps
  campRest?: number; // multiplier for fatigue cleared at camps
  homeRest?: number; // extra fatigue cleared at the guild each week
  homeHeal?: number; // extra HP restored at the guild each week
}

export const SCARS: Record<string, MarkDef> = {
  bad_knee: { id: 'bad_knee', name: 'Bad knee', text: 'Dodge −4.', dodge: -4 },
  cracked_ribs: { id: 'cracked_ribs', name: 'Cracked ribs', text: 'Max HP −4.', maxHp: -4 },
  burned_hand: { id: 'burned_hand', name: 'Burned hand', text: 'Aim −4.', acc: -4 },
  half_ear: { id: 'half_ear', name: 'Half an ear', text: 'Worse at spotting traps and ambushes.', spot: -0.06 },
  limp: { id: 'limp', name: 'A limp', text: 'Slower in a fight.', speed: -1 },
  stitched_brow: { id: 'stitched_brow', name: 'Stitched brow', text: 'Their life is a little safer when they go down. They have the knack of it now.', deathRoll: -0.03, good: true },
  bite_scar: { id: 'bite_scar', name: 'A bite scar', text: 'Max HP −2. It aches when it rains, and it always rains.', maxHp: -2 },
};

export const HABITS: Record<string, MarkDef> = {
  hates_dark: { id: 'hates_dark', name: 'Hates the dark', text: 'Tires 2 faster in every dark room, from holding the lamp too tight.', darkFatigue: 2 },
  jumpy: { id: 'jumpy', name: 'Jumpy', text: 'Dodge +3, but tires 1 faster each room.', dodge: 3, roomFatigue: 1 },
  drinks: { id: 'drinks', name: 'Drinks', text: 'Shakes off fatigue faster at the guild and heals slower.', homeRest: 10, homeHeal: -6 },
  rat_fear: { id: 'rat_fear', name: "Can't abide rats", text: 'Aim −10 against rats.', accVs: { monster: 'rats', acc: -10 } },
  sleeps_badly: { id: 'sleeps_badly', name: 'Sleeps badly', text: 'Camps clear half as much of their fatigue.', campRest: 0.5 },
  hums: { id: 'hums', name: 'Hums on the march', text: 'Tires 1 slower each room. The others have opinions about the tune.', roomFatigue: -1, good: true },
  steady_hands: { id: 'steady_hands', name: 'Steady hands', text: 'Aim +4.', acc: 4, good: true },
  counts_coin: { id: 'counts_coin', name: 'Counts the coins', text: 'Finds are worth a tenth more with them in the squad.', finds: 0.1, good: true },
  rat_hater: { id: 'rat_hater', name: 'Hates rats', text: 'Deals 3 more damage to rats.', dmgVs: { monster: 'rats', dmg: 3 }, good: true },
  old_hand: { id: 'old_hand', name: 'Old hand at camp', text: 'Camps heal them a little more.', campHeal: 0.06, good: true },
};

/** Lasting conditions left by Exposure to the Sink's runoff. Chemistry, not curses. */
export const CONDITIONS: Record<string, MarkDef> = {
  tremor: { id: 'tremor', name: 'A tremor', text: 'Aim −5. Their hands shake in the mornings.', acc: -5 },
  burned_lungs: { id: 'burned_lungs', name: 'Burned lungs', text: 'Tires 1 faster each room.', roomFatigue: 1 },
  brittle: { id: 'brittle', name: 'Brittle bones', text: 'Their life is less safe when they go down.', deathRoll: 0.05 },
  stained_skin: { id: 'stained_skin', name: 'Stained skin', text: 'Seeps and the Kiln Engine do 2 less damage to them. The skin is a lovely violet.', burnGuard: 2, good: true },
  pale_eyes: { id: 'pale_eyes', name: 'Pale eyes', text: 'No aim penalty in the dark, and a worse one with their mother.', nightEyes: true, good: true },
};

export const BAD_HABITS = Object.values(HABITS).filter((h) => !h.good).map((h) => h.id);
export const GOOD_HABITS = Object.values(HABITS).filter((h) => h.good).map((h) => h.id);

// ---------------------------------------------------------------------------
// Sponsors: a faction pays for a goal
// ---------------------------------------------------------------------------

export interface SponsorDef {
  id: string;
  faction: FactionId;
  title: string;
  text: string;
  goal: SponsorGoal;
  reward: number;
  renown: number;
  minRenown: number;
}

export const SPONSORS: SponsorDef[] = [
  { id: 'oda_salts', faction: 'oda', title: "Salts for Saint Oda's", text: 'Sister Brune needs reagent salts for the fever beds and would rather not buy them from an apothecary who asks no questions.', goal: { kind: 'bring', good: 'salts', count: 2 }, reward: 90, renown: 2, minRenown: 0 },
  { id: 'assay_seals', faction: 'exchequer', title: 'The Assay seals', text: "The Exchequer wants the Assay Office's lost seals found before the Office finds them and claims it never lost them.", goal: { kind: 'bring', good: 'seal', count: 2 }, reward: 110, renown: 2, minRenown: 0 },
  { id: 'mudlark_eels', faction: 'mudlarks', title: 'Eel oil for the flats', text: "Wenna Pask's people need eel oil for their boats, and she says the eels are easy if you don't mind eels.", goal: { kind: 'kill', monster: 'eel', count: 1 }, reward: 70, renown: 1, minRenown: 0 },
  { id: 'weigh_silver', faction: 'weighhouse', title: 'Pellam plate', text: 'Alderman Coster will weigh any Pellam silver you bring back, and pay for it by weight, which he says is the only honest way to pay for anything.', goal: { kind: 'bring', good: 'silver', count: 3 }, reward: 100, renown: 1, minRenown: 0 },
  { id: 'lt_rats', faction: 'lowertown', title: 'The cellar rats', text: 'The Porters\' Fraternity will pay to have fewer rats coming up through the Tallow Street cellars.', goal: { kind: 'kill', monster: 'rats', count: 5 }, reward: 50, renown: 2, minRenown: 0 },
  { id: 'ex_streets', faction: 'exchequer', title: 'A survey of the Streets', text: 'The Exchequer has a map of Pellam from two hundred years ago and would like to know how wrong it is.', goal: { kind: 'reach', zone: 'streets' }, reward: 80, renown: 2, minRenown: 2 },
  { id: 'ost_sink', faction: 'ostranders', title: 'How deep it goes', text: "Factor Vorn wants a reliable account of the College Sink. The bank holds a note on the college and likes to know what it owns.", goal: { kind: 'reach', zone: 'sink' }, reward: 160, renown: 3, minRenown: 6 },
  { id: 'college_kiln', faction: 'exchequer', title: 'Put out the Kiln', text: 'The college has asked the Crown, which has asked you, to stop the Kiln Engine before it walks into the river and boils it.', goal: { kind: 'kill', monster: 'kiln', count: 1 }, reward: 320, renown: 8, minRenown: 10 },
];
