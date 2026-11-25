// Content for expeditions: Professions' combat profiles, supplies, monsters,
// sites and zones, goods, scars, habits and Sink changes.
// Numbers that set the balance are in ../tuning.ts.
import type { DamageType, Element, ProfessionId, TagId } from '../../core/types';
import type { ExpLength, GoodId, MonsterId, SiteId, StoreId, SupplyId, ZoneId } from '../types';

// ---------------------------------------------------------------------------
// Professions in a fight
// ---------------------------------------------------------------------------

export interface DelverProfDef {
  id: ProfessionId;
  /** ranks this Profession works best from, front (1) to back (4) */
  ranks: number[];
  skills: { name: string; text: string }[];
  /** the attribute that rises with each level in the dive's own sums */
  main: 'might' | 'finesse' | 'wits' | 'resolve';
}

export const DELVER_PROFS: Record<ProfessionId, DelverProfDef> = {
  vanguard: {
    id: 'vanguard',
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
    ranks: [1, 2],
    main: 'finesse',
    skills: [
      { name: 'Two cuts', text: 'Two quick strikes at the front rank.' },
      { name: 'Hamstring', text: 'Opens a wound that bleeds for two rounds.' },
    ],
  },
  marksman: {
    id: 'marksman',
    ranks: [2, 3, 4],
    main: 'finesse',
    skills: [
      { name: 'Aimed shot', text: 'Reaches any rank and finds the weak places more often.' },
      { name: 'Pinning shot', text: 'Spoils the aim of the most dangerous enemy for two rounds.' },
    ],
  },
  arcanist: {
    id: 'arcanist',
    ranks: [2, 3, 4],
    main: 'wits',
    skills: [
      { name: 'Bolt', text: "One dose of reagents, one target, in the focus's element." },
      { name: 'Burst', text: 'Two doses, every enemy at once, for less each.' },
    ],
  },
  chaplain: {
    id: 'chaplain',
    ranks: [1, 2, 3, 4],
    main: 'resolve',
    skills: [
      { name: 'Dress wounds', text: "Heals a hurt friend in the middle of a fight. Bandages go twice as far in a Chaplain's hands." },
      { name: 'Second wind', text: 'Gets the most worn-out member back on their feet.' },
      { name: 'Censer', text: 'With a censer and a dose of reagents, burns radiant light into the enemy.' },
    ],
  },
  scout: {
    id: 'scout',
    ranks: [1, 2, 3, 4],
    main: 'wits',
    skills: [
      { name: 'Eyes open', text: 'Better odds of spotting traps and ambushes, and of finding hidden caches.' },
      { name: 'Knife in the gap', text: 'From the front, a knife that slips past armor. From the back, a shot or a thrown knife.' },
    ],
  },
  envoy: {
    id: 'envoy',
    ranks: [2, 3, 4],
    main: 'wits',
    skills: [
      { name: 'Parley', text: 'Before a fight with people, tries to talk them out of it, or buys them off with what the squad has found.' },
      { name: 'Hard words', text: 'In a fight, tells one of the other side something that makes them stop and think. They lose their next turn.' },
    ],
  },
  infiltrator: {
    id: 'infiltrator',
    ranks: [1, 2],
    main: 'finesse',
    skills: [
      { name: 'Locks', text: 'Opens strongboxes and makes traps safe without using up tools.' },
      { name: 'Sentries', text: 'Gets the squad past wanderers and sentries more often.' },
      { name: 'From behind', text: 'A knife that goes past armor and finds the weak places.' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Supplies: what goes in the pack
// ---------------------------------------------------------------------------

export interface SupplyDef {
  id: SupplyId;
  name: string;
  one: string;
  perSlot: number;
  /** crowns each, bought from the chandler. Food uses the market's supply price instead */
  price: number;
  text: string;
}

export const SUPPLIES: Record<SupplyId, SupplyDef> = {
  food: { id: 'food', name: 'Food', one: 'meal', perSlot: 3, price: 3, text: "One feeds the squad once. They eat every few rooms and at every camp. It comes out of the guild's supplies." },
  bandages: { id: 'bandages', name: 'Bandages', one: 'bandage', perSlot: 3, price: 4, text: 'Heal between rooms. Twice as good with a Chaplain standing.' },
  oil: { id: 'oil', name: 'Lamp oil', one: 'flask of oil', perSlot: 4, price: 2, text: 'Dark places need light. One flask lights a room.' },
  tools: { id: 'tools', name: 'Tools', one: 'set of tools', perSlot: 2, price: 6, text: 'Crowbar, rope and wedges. Disarm traps, force strongboxes, clear rubble.' },
  masks: { id: 'masks', name: 'Wet masks', one: 'wet mask', perSlot: 2, price: 5, text: 'Linen and charcoal, soaked before use. One keeps a member breathing cleaner in the College Sink: half the Exposure.' },
  reagents: { id: 'reagents', name: 'Reagents', one: 'dose', perSlot: 3, price: 6, text: "Doses for the Arcanist's spells and the Chaplain's censer." },
  draughts: { id: 'draughts', name: 'Draughts', one: 'draught', perSlot: 1, price: 20, text: 'Brings a member who goes down straight back up. No roll for their life.' },
};

export const SUPPLY_IDS = Object.keys(SUPPLIES) as SupplyId[];
export const STORE_IDS = SUPPLY_IDS.filter((x) => x !== 'food') as StoreId[];

// ---------------------------------------------------------------------------
// Monsters
// ---------------------------------------------------------------------------

export interface MonsterDef {
  id: MonsterId;
  /** one of them in a sentence: "the {one}" */
  one: string;
  name: string;
  plural: string;
  /** the zone depth it belongs to: deeper places make it tougher */
  depth: number;
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
  special?: 'oil' | 'poison' | 'charge' | 'ambush' | 'blast' | 'thief' | 'swarm' | 'regen';
  xp: number;
  loot?: { good: GoodId; chance: number };
  coin?: number;
  construct?: boolean;
  /** people: an Envoy can talk to them */
  people?: boolean;
  /** whose generic lines it uses when it has none of its own */
  voice?: 'people' | 'beast';
  text: string;
}

const M = (d: MonsterDef) => d;

export const MONSTERS: Record<MonsterId, MonsterDef> = {
  rats: M({ id: 'rats', one: 'knot of rats', name: 'Culvert rats', plural: 'culvert rats', depth: 1, hp: 9, acc: 72, dodge: 16, prot: 0, dmg: [2, 5], speed: 8, weak: ['fire', 'blunt'], resist: [], special: 'swarm', xp: 1, text: 'A knot of rats the size of cats, fed on everything that comes down the drains.' }),
  moths: M({ id: 'moths', one: 'cloud of moths', name: 'Tallow moths', plural: 'tallow moths', depth: 1, hp: 6, acc: 74, dodge: 30, prot: 0, dmg: [1, 3], speed: 9, ranged: true, weak: ['fire', 'radiant'], resist: ['blunt'], special: 'oil', xp: 1, text: 'Pale moths as wide as a hand. They drink lamp oil, and they will drink it out of the lamp.' }),
  grubber: M({ id: 'grubber', one: 'grubber', name: 'Grubber', plural: 'grubbers', depth: 1, hp: 15, acc: 72, dodge: 10, prot: 1, dmg: [4, 7], speed: 5, weak: [], resist: [], special: 'thief', xp: 2, coin: 6, people: true, text: 'People who live down here and dig for what Pellam left behind. They do not like company.' }),
  eel: M({ id: 'eel', one: 'eel', name: 'Sink eel', plural: 'sink eels', depth: 2, hp: 22, acc: 76, dodge: 18, prot: 1, dmg: [5, 9], speed: 7, weak: ['storm', 'frost'], resist: [], special: 'ambush', xp: 3, loot: { good: 'eel_oil', chance: 0.7 }, text: 'A grey eel as long as a cart, living in the flooded cellars. It strikes from the water first.' }),
  spider: M({ id: 'spider', one: 'spider', name: 'Cellar spider', plural: 'cellar spiders', depth: 2, hp: 15, acc: 78, dodge: 22, prot: 0, dmg: [3, 7], speed: 8, weak: ['fire'], resist: [], special: 'poison', xp: 3, text: 'A long-legged spider the color of wet plaster. Its bite keeps working after it lets go.' }),
  hog: M({ id: 'hog', one: 'hog', name: 'Pale hog', plural: 'pale hogs', depth: 2, hp: 32, acc: 68, dodge: 4, prot: 2, dmg: [6, 11], speed: 5, weak: ['pierce'], resist: [], special: 'charge', xp: 4, text: 'Pigs got down here a century ago and kept breeding. They are white and blind, and as big as ponies.' }),
  crab: M({ id: 'crab', one: 'crab', name: 'Sink crab', plural: 'sink crabs', depth: 2, hp: 24, acc: 70, dodge: 4, prot: 5, dmg: [4, 8], speed: 4, weak: ['blunt', 'storm'], resist: ['slash', 'pierce'], xp: 4, loot: { good: 'glass', chance: 0.4 }, text: 'River crabs grown huge on reagent runoff. Blades skid off them.' }),
  seep: M({ id: 'seep', one: 'seep', name: 'Seep', plural: 'seeps', depth: 3, hp: 24, acc: 72, dodge: 0, prot: 0, dmg: [4, 8], speed: 3, weak: ['radiant', 'frost'], resist: ['slash', 'pierce'], xp: 5, loot: { good: 'salts', chance: 0.8 }, text: 'A spill of spent reagents that never stopped reacting. It moves toward warmth and it burns what it touches.' }),
  engine: M({ id: 'engine', one: 'engine', name: 'Assay engine', plural: 'Assay engines', depth: 3, hp: 42, acc: 72, dodge: 0, prot: 6, dmg: [6, 11], speed: 2, weak: ['storm', 'blunt'], resist: ['pierce', 'fire'], construct: true, xp: 7, loot: { good: 'seal', chance: 0.9 }, text: 'An iron testing engine the Assay Office left running when it moved upstairs. It still tests anything it finds, very hard.' }),
  kiln: M({ id: 'kiln', one: 'Kiln Engine', name: 'the Kiln Engine', plural: 'the Kiln Engine', depth: 3, hp: 100, acc: 74, dodge: 0, prot: 5, dmg: [7, 12], speed: 3, weak: ['frost', 'storm'], resist: ['fire', 'pierce'], special: 'blast', construct: true, xp: 14, loot: { good: 'kiln_core', chance: 1 }, text: "The college's great reagent furnace, built to walk the length of the Sink and burn the spill. Nobody told it to stop." }),

  claim_jumper: M({ id: 'claim_jumper', one: 'claim-jumper', name: 'Claim-jumper', plural: 'claim-jumpers', depth: 1, hp: 16, acc: 72, dodge: 10, prot: 2, dmg: [4, 7], speed: 5, weak: [], resist: [], special: 'thief', xp: 2, coin: 8, people: true, voice: 'people', text: 'Miners working galleries that belong to somebody else. They would rather fight than be written down.' }),
  cave_crab: M({ id: 'cave_crab', one: 'cave crab', name: 'Cave crab', plural: 'cave crabs', depth: 1, hp: 22, acc: 70, dodge: 4, prot: 5, dmg: [4, 8], speed: 4, weak: ['blunt', 'storm'], resist: ['slash', 'pierce'], xp: 3, voice: 'beast', text: 'Pale crabs that came up the flooded galleries and liked it. Blades skid off them.' }),
  salt_cutter: M({ id: 'salt_cutter', one: 'salt-cutter', name: 'Salt-cutter', plural: 'salt-cutters', depth: 1, hp: 15, acc: 74, dodge: 12, prot: 1, dmg: [4, 8], speed: 6, weak: [], resist: [], xp: 2, coin: 4, people: true, voice: 'people', text: 'Cutters who stayed out on the pans too long. The fever took their manners first.' }),
  marsh_hog: M({ id: 'marsh_hog', one: 'marsh hog', name: 'Marsh hog', plural: 'marsh hogs', depth: 1, hp: 28, acc: 68, dodge: 4, prot: 2, dmg: [5, 10], speed: 5, weak: ['pierce'], resist: [], special: 'charge', xp: 3, loot: { good: 'leather', chance: 0.5 }, voice: 'beast', text: 'A bristled black hog that lives in the reeds and charges anything that moves in them.' }),
  road_agent: M({ id: 'road_agent', one: 'road agent', name: 'Road agent', plural: 'road agents', depth: 1, hp: 15, acc: 74, dodge: 12, prot: 2, dmg: [4, 7], speed: 6, ranged: true, weak: [], resist: [], xp: 2, coin: 8, people: true, voice: 'people', text: 'A highwayman with a crossbow and a speech about tolls.' }),
  deserter: M({ id: 'deserter', one: 'deserter', name: 'Deserter', plural: 'deserters', depth: 1, hp: 20, acc: 76, dodge: 8, prot: 4, dmg: [5, 8], speed: 5, weak: [], resist: [], xp: 3, coin: 6, people: true, voice: 'people', text: 'A soldier of the Ninth who walked away with his mail and his spear and kept walking.' }),
  wolf: M({ id: 'wolf', one: 'wolf', name: 'Hill wolf', plural: 'hill wolves', depth: 1, hp: 14, acc: 76, dodge: 18, prot: 0, dmg: [3, 7], speed: 8, weak: ['pierce', 'fire'], resist: [], xp: 2, loot: { good: 'leather', chance: 0.4 }, voice: 'beast', text: 'Grey hill wolves, thin from a bad winter and bolder than they should be.' }),
  pike: M({ id: 'pike', one: 'pike', name: 'Mere pike', plural: 'mere pike', depth: 1, hp: 20, acc: 76, dodge: 14, prot: 1, dmg: [5, 9], speed: 7, weak: ['storm', 'frost'], resist: [], special: 'ambush', xp: 3, voice: 'beast', text: 'A pike as long as a man that lies in the shallows and takes ankles.' }),
  smuggler: M({ id: 'smuggler', one: 'smuggler', name: 'Smuggler', plural: 'smugglers', depth: 1, hp: 15, acc: 72, dodge: 12, prot: 1, dmg: [4, 7], speed: 6, weak: [], resist: [], special: 'thief', xp: 2, coin: 10, people: true, voice: 'people', text: 'Lake people who move cargo at night and do not want to be counted.' }),
  thug: M({ id: 'thug', one: 'thug', name: 'Hired thug', plural: 'thugs', depth: 1, hp: 15, acc: 70, dodge: 8, prot: 1, dmg: [4, 7], speed: 5, weak: [], resist: [], xp: 2, coin: 5, people: true, voice: 'people', text: 'Muscle by the day. Brave in a crowd and keen on being paid.' }),
  soldier: M({ id: 'soldier', one: 'soldier', name: 'Sell-sword', plural: 'sell-swords', depth: 1, hp: 22, acc: 78, dodge: 8, prot: 4, dmg: [5, 9], speed: 5, weak: [], resist: [], xp: 3, coin: 6, people: true, voice: 'people', text: 'Drilled, armored and paid to stand still while you try to move them.' }),
  guard: M({ id: 'guard', one: 'guard', name: 'Guard', plural: 'guards', depth: 1, hp: 18, acc: 76, dodge: 8, prot: 3, dmg: [4, 8], speed: 5, weak: [], resist: [], xp: 2, coin: 3, people: true, voice: 'people', text: 'A watchman with a cudgel and a lantern, who will shout for his friends first.' }),
  hedge_wizard: M({ id: 'hedge_wizard', one: 'hedge-wizard', name: 'Hedge-wizard', plural: 'hedge-wizards', depth: 1, hp: 14, acc: 76, dodge: 10, prot: 4, dmg: [5, 8], speed: 6, ranged: true, weak: ['storm'], resist: ['pierce'], xp: 3, coin: 6, people: true, voice: 'people', text: 'Unlicensed spellwork for hire, behind wards the college would not pass.' }),
  troll: M({ id: 'troll', one: 'troll', name: 'Troll', plural: 'trolls', depth: 1, hp: 55, acc: 70, dodge: 2, prot: 3, dmg: [7, 12], speed: 3, weak: ['fire'], resist: ['frost'], special: 'regen', xp: 8, voice: 'beast', text: 'Huge, grey and patient. It heals while you watch, unless you burn it.' }),
  salamander: M({ id: 'salamander', one: 'salamander', name: 'Salamander', plural: 'salamanders', depth: 1, hp: 24, acc: 74, dodge: 12, prot: 2, dmg: [5, 9], speed: 6, weak: ['frost'], resist: ['fire'], xp: 4, loot: { good: 'reagents', chance: 0.5 }, voice: 'beast', text: 'A lizard the length of a cart, living where the rock is warm. It burns what it bites.' }),
  rioter: M({ id: 'rioter', one: 'rioter', name: 'Rioter', plural: 'rioters', depth: 1, hp: 10, acc: 66, dodge: 6, prot: 0, dmg: [2, 5], speed: 5, weak: [], resist: [], xp: 1, people: true, voice: 'people', text: 'Somebody with a grievance and a cobblestone. Hurting them costs the guild its name.' }),
};

export const MONSTER_IDS = Object.keys(MONSTERS) as MonsterId[];

// ---------------------------------------------------------------------------
// Sites and zones
// ---------------------------------------------------------------------------

export type CurioKind = 'shrine' | 'strongbox' | 'grubber_cache' | 'cart' | 'still';
export type TrapKind = 'tripwire' | 'grate' | 'floor' | 'gas' | 'collapse' | 'bog' | 'snare';

export interface ZoneDef {
  id: ZoneId;
  site: SiteId;
  name: string;
  depth: number;
  dark: boolean;
  text: string;
  /** room weights */
  rooms: { passage: number; fight: number; trap: number; find: number; curio: number };
  fights: MonsterId[][];
  finds: { good: GoodId; min: number; max: number; weight: number }[];
  curios: CurioKind[];
  traps: TrapKind[];
  /** Exposure each room (reagent runoff, fen fever) */
  exposure?: number;
  /** what a scout's lucky find in a passage is */
  scoutFind: GoodId;
}

export const ZONES: Record<ZoneId, ZoneDef> = {
  culverts: {
    id: 'culverts',
    site: 'pellam',
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
    traps: ['tripwire', 'grate'],
    scoutFind: 'coin',
  },
  streets: {
    id: 'streets',
    site: 'pellam',
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
    traps: ['floor', 'tripwire', 'gas'],
    exposure: 1,
    scoutFind: 'silver',
  },
  sink: {
    id: 'sink',
    site: 'pellam',
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
    traps: ['gas', 'floor'],
    scoutFind: 'salts',
  },
  lowertown: {
    id: 'lowertown',
    site: 'varrow',
    name: 'the Lower Town',
    depth: 1,
    dark: false,
    text: "Varrow's streets below the hill: yards, warehouses, back stairs and people who saw nothing.",
    rooms: { passage: 2.4, fight: 2.6, trap: 1, find: 2, curio: 1 },
    fights: [['thug', 'thug'], ['guard', 'guard'], ['thug', 'thug', 'thug'], ['guard', 'thug']],
    finds: [{ good: 'coin', min: 1, max: 3, weight: 1 }],
    curios: ['strongbox', 'shrine'],
    traps: ['snare'],
    scoutFind: 'coin',
  },
  workings: {
    id: 'workings',
    site: 'kell',
    name: 'the upper workings',
    depth: 1,
    dark: true,
    text: 'Galleries cut into the hill a century ago, propped with timber that has seen better centuries.',
    rooms: { passage: 2, fight: 3, trap: 1.6, find: 2.2, curio: 0.8 },
    fights: [['claim_jumper', 'claim_jumper'], ['cave_crab'], ['cave_crab', 'cave_crab'], ['claim_jumper', 'claim_jumper', 'claim_jumper'], ['rats', 'rats', 'claim_jumper']],
    finds: [
      { good: 'iron', min: 2, max: 4, weight: 4 },
      { good: 'coin', min: 1, max: 3, weight: 2 },
    ],
    curios: ['strongbox', 'shrine'],
    traps: ['collapse', 'gas'],
    scoutFind: 'iron',
  },
  reeds: {
    id: 'reeds',
    site: 'saltfens',
    name: 'the reed paths',
    depth: 1,
    dark: false,
    text: 'Plank paths through reeds higher than a man, over water nobody should drink.',
    rooms: { passage: 2.4, fight: 2.8, trap: 1.4, find: 2.2, curio: 0.6 },
    fights: [['marsh_hog'], ['salt_cutter', 'salt_cutter'], ['marsh_hog', 'salt_cutter'], ['salt_cutter', 'salt_cutter', 'salt_cutter']],
    finds: [
      { good: 'reagents', min: 1, max: 3, weight: 4 },
      { good: 'coin', min: 1, max: 2, weight: 1 },
    ],
    curios: ['shrine'],
    traps: ['bog'],
    exposure: 1,
    scoutFind: 'reagents',
  },
  hillroad: {
    id: 'hillroad',
    site: 'drovers',
    name: 'the hill road',
    depth: 1,
    dark: false,
    text: "The Drover's Road climbing into the hills: stone walls, sheep, and long views of nobody coming to help.",
    rooms: { passage: 2.8, fight: 2.8, trap: 1, find: 1.8, curio: 0.6 },
    fights: [['road_agent', 'road_agent'], ['wolf', 'wolf', 'wolf'], ['deserter', 'deserter'], ['road_agent', 'deserter']],
    finds: [
      { good: 'leather', min: 1, max: 3, weight: 3 },
      { good: 'coin', min: 1, max: 3, weight: 2 },
    ],
    curios: ['shrine', 'strongbox'],
    traps: ['snare'],
    scoutFind: 'coin',
  },
  shore: {
    id: 'shore',
    site: 'harrowmere',
    name: 'the lake shore',
    depth: 1,
    dark: false,
    text: 'Shingle, boathouses and cold water, with the old bridge standing out over the mere.',
    rooms: { passage: 2.6, fight: 2.8, trap: 1, find: 2, curio: 0.6 },
    fights: [['pike'], ['smuggler', 'smuggler'], ['smuggler', 'smuggler', 'pike'], ['smuggler', 'smuggler', 'smuggler']],
    finds: [
      { good: 'timber', min: 2, max: 4, weight: 3 },
      { good: 'coin', min: 1, max: 3, weight: 2 },
    ],
    curios: ['shrine', 'strongbox'],
    traps: ['snare'],
    scoutFind: 'coin',
  },
  wenmouth: {
    id: 'wenmouth',
    site: 'anselm',
    name: 'the Wenmouth road',
    depth: 1,
    dark: false,
    text: 'The coast road to Port Anselm: salt marsh on one side, dunes on the other, and a ford at every river mouth.',
    rooms: { passage: 2.8, fight: 2.8, trap: 1, find: 1.6, curio: 0.6 },
    fights: [['road_agent', 'road_agent'], ['deserter', 'deserter'], ['road_agent', 'road_agent', 'road_agent']],
    finds: [{ good: 'coin', min: 1, max: 3, weight: 1 }],
    curios: ['shrine', 'strongbox'],
    traps: ['snare'],
    scoutFind: 'coin',
  },
};

export const ZONE_ORDER: ZoneId[] = ['culverts', 'streets', 'sink', 'lowertown', 'workings', 'reeds', 'hillroad', 'shore', 'wenmouth'];

export type SiteGroup = 'under' | 'town' | 'overland';

export interface SiteDef {
  id: SiteId;
  name: string;
  /** the classic region it lies in: travel weeks and the region name come from it */
  region: string;
  zones: ZoneId[];
  group: SiteGroup;
  text: string;
}

export const SITES: Record<SiteId, SiteDef> = {
  pellam: { id: 'pellam', name: 'Old Pellam', region: 'varrow', zones: ['culverts', 'streets', 'sink'], group: 'under', text: "The first town on the river, under Varrow's Lower Town. Its cellars and streets are still down there, and so is the drain where the college poured its spent reagents for a century." },
  varrow: { id: 'varrow', name: 'Varrow', region: 'varrow', zones: ['lowertown'], group: 'town', text: 'Work in the city: guarded doors, back stairs and crowds.' },
  kell: { id: 'kell', name: 'Kell Mines', region: 'kell', zones: ['workings'], group: 'overland', text: 'Silver workings in the northern hills, half of them flooded.' },
  saltfens: { id: 'saltfens', name: 'The Saltfens', region: 'saltfens', zones: ['reeds'], group: 'overland', text: 'Marshes along the estuary, rich in reagents and fever.' },
  drovers: { id: 'drovers', name: "Drover's Road", region: 'drovers', zones: ['hillroad'], group: 'overland', text: 'The cattle road through the hills east of the city.' },
  harrowmere: { id: 'harrowmere', name: 'Harrowmere', region: 'harrowmere', zones: ['shore'], group: 'overland', text: 'A lake town with an old bridge.' },
  anselm: { id: 'anselm', name: 'Port Anselm', region: 'anselm', zones: ['wenmouth'], group: 'overland', text: "The coast road to the port where Ostrander's ships take on the Crown's silver." },
};

export const SITE_IDS = Object.keys(SITES) as SiteId[];

export interface LengthDef {
  id: ExpLength;
  name: string;
  /** weeks inside the site, not counting the road */
  weeks: number;
  xp: number;
  renown: number;
}

export const LENGTHS: Record<ExpLength, LengthDef> = {
  short: { id: 'short', name: 'Short', weeks: 1, xp: 3, renown: 1 },
  medium: { id: 'medium', name: 'Medium', weeks: 2, xp: 5, renown: 2 },
  long: { id: 'long', name: 'Long', weeks: 3, xp: 8, renown: 4 },
};

export type RouteStep = ZoneId | 'camp' | 'boss';

/** Old Pellam's routes, as in the trial. */
const PELLAM_ROUTES: Record<ExpLength, RouteStep[]> = {
  short: ['culverts', 'culverts', 'culverts', 'culverts', 'culverts'],
  medium: ['culverts', 'culverts', 'culverts', 'culverts', 'camp', 'streets', 'streets', 'streets', 'streets'],
  long: ['culverts', 'culverts', 'culverts', 'streets', 'streets', 'streets', 'streets', 'camp', 'sink', 'sink', 'sink', 'sink', 'camp', 'boss'],
};

/** The rooms of a route, in order: a zone, a fixed camp site or the boss. */
export function routeOf(site: SiteId, length: ExpLength): RouteStep[] {
  if (site === 'pellam') return PELLAM_ROUTES[length];
  const z = SITES[site].zones[0];
  const leg = [z, z, z, z];
  if (length === 'short') return [z, z, z, z, z];
  if (length === 'medium') return [...leg, 'camp', ...leg];
  return [...leg, 'camp', ...leg, 'camp', ...leg];
}

/** Old Pellam's goal rooms. */
export const PELLAM_GOALS: Record<ExpLength, string> = {
  short: 'Through the Culverts to the old pump house',
  medium: 'Down to the Buried Streets and the old counting house',
  long: 'To the bottom of the College Sink, where the Kiln Engine walks',
};

// ---------------------------------------------------------------------------
// What a contract's dangers (tags) do down there
// ---------------------------------------------------------------------------

export interface TagDive {
  /** extra fight groups: they join the zone's own, weighted up */
  groups?: MonsterId[][];
  /** extra fatigue each room */
  fatigue?: number;
  /** the whole route is dark */
  dark?: boolean;
  /** extra armor on every enemy */
  foeProt?: number;
  /** change to the odds of slipping past wanderers */
  avoid?: number;
  /** Exposure each room (fever) */
  exposure?: number;
  /** a Profession that cancels it */
  counterProf?: ProfessionId;
  /** heavy armor tires twice as fast */
  bogs?: boolean;
}

export const TAG_DIVE: Record<TagId, TagDive> = {
  thugs: { groups: [['thug', 'thug'], ['thug', 'thug', 'thug']] },
  soldiers: { groups: [['soldier', 'soldier'], ['soldier', 'deserter']] },
  guards: { groups: [['guard', 'guard'], ['guard', 'guard', 'guard']] },
  beasts: { groups: [['wolf', 'wolf'], ['wolf', 'wolf', 'wolf']] },
  swarm: { groups: [['rats', 'rats', 'rats'], ['rats', 'rats']] },
  warded: { groups: [['hedge_wizard', 'guard'], ['hedge_wizard', 'thug', 'thug']] },
  trolls: { groups: [['troll'], ['troll', 'wolf']] },
  fireborn: { groups: [['salamander', 'salamander'], ['salamander']] },
  crowd: { groups: [['rioter', 'rioter', 'rioter'], ['rioter', 'rioter', 'thug']] },
  armored: { foeProt: 2 },
  cold: { fatigue: 2 },
  swamp: { fatigue: 1, bogs: true },
  dark: { dark: true },
  night: { dark: true, avoid: 0.1 },
  rough: { fatigue: 1.5 },
  open_road: { avoid: -0.15 },
  plague: { exposure: 1, counterProf: 'chaplain' },
  urban: {},
};

// ---------------------------------------------------------------------------
// Goods: what comes back to be sold
// ---------------------------------------------------------------------------

export interface GoodDef {
  id: GoodId;
  name: string;
  one: string;
  many: string;
  value: number;
  /** goes into the guild's materials, not its goods */
  material?: boolean;
  text: string;
}

export const GOODS: Record<GoodId, GoodDef> = {
  coin: { id: 'coin', many: 'purses of old coin', name: 'Old coin', one: 'a purse of old coin', value: 9, text: 'Old coin from before the river moved, or from somebody who will not miss it. Collectors pay for it by the purse.' },
  glass: { id: 'glass', many: 'pieces of college glass', name: 'College glass', one: 'a piece of college glass', value: 16, text: 'Retorts and lenses the college threw away. The glassblowers on Anvil Row buy them back.' },
  eel_oil: { id: 'eel_oil', many: 'jars of eel oil', name: 'Eel oil', one: 'a jar of eel oil', value: 18, text: 'Rendered from sink eels. The Mudlarks use it to waterproof everything.' },
  silver: { id: 'silver', many: 'pieces of Pellam silver', name: 'Pellam silver', one: 'a piece of Pellam silver', value: 30, text: 'Plate and candlesticks from houses that were rich two hundred years ago.' },
  salts: { id: 'salts', many: 'jars of reagent salts', name: 'Reagent salts', one: 'a jar of reagent salts', value: 22, text: 'Crystals scraped from the Sink. Apothecaries ask no questions.' },
  seal: { id: 'seal', many: 'Assay seals', name: 'Assay seals', one: 'an Assay seal', value: 34, text: "Brass seals from the Assay Office's old engines. The Office pays to get them back." },
  kiln_core: { id: 'kiln_core', many: 'Kiln cores', name: 'Kiln core', one: "the Kiln Engine's core", value: 240, text: 'The furnace heart of the Kiln Engine. The college would like it back, and will pay.' },
  iron: { id: 'iron', many: 'loads of iron', name: 'Iron', one: 'a load of iron', value: 6, material: true, text: 'Ore and old iron. The Forge uses it.' },
  leather: { id: 'leather', many: 'hides', name: 'Leather', one: 'a hide', value: 5, material: true, text: 'Hides for the Forge and the market.' },
  timber: { id: 'timber', many: 'lengths of timber', name: 'Timber', one: 'a length of timber', value: 3, material: true, text: 'Seasoned wood for building and the Forge.' },
  reagents: { id: 'reagents', many: 'bundles of reagents', name: 'Reagents', one: 'a bundle of reagents', value: 12, material: true, text: 'Fen plants and salts for the Stillroom.' },
};

export const GOOD_IDS = Object.keys(GOODS) as GoodId[];

// ---------------------------------------------------------------------------
// Scars, habits and Sink changes
// ---------------------------------------------------------------------------

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
  // Sink changes
  tier?: 1 | 2 | 3; // amusing, useful, powerful
  prot?: number; // extra armor
  foeAccVs?: { monster: MonsterId; acc: number }; // that monster's aim against them
  stillSafe?: boolean; // college stills never hurt them
  hungerHalf?: boolean; // a missed meal tires them half as much
  shortPoison?: boolean; // venom and bleeding stop after one round
  bandageBonus?: number; // bandages heal them this much more
  exposureRate?: number; // multiplier on Exposure they take
  freeCast?: boolean; // their first spell or censer each fight costs no dose
  fireBlows?: boolean; // their weapon blows carry fire
  openingStrike?: number; // a free storm strike at the front enemy when a fight starts
  avoid?: number; // better odds of slipping past wanderers
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

/**
 * Sink changes: what Exposure does to a body, given time. Chemistry, not curses.
 * Crossing an Exposure threshold starts one. A worn-out body (high fatigue) takes it at once;
 * a rested one fights it and runs the Sink fever first, and gains the change only if it sees the fever out.
 * Deeper thresholds draw from better tiers.
 */
export const CHANGES: Record<string, MarkDef> = {
  // tier 1: amusing, with a small use
  violet_skin: { id: 'violet_skin', tier: 1, good: true, name: 'Violet skin', text: 'Seeps and the Kiln Engine do 2 less damage to them. The colour is lovely and does not wash off.', burnGuard: 2 },
  copper_tongue: { id: 'copper_tongue', tier: 1, good: true, name: 'A copper tongue', text: 'They can taste what a college still holds, so stills never hurt them. Everything else tastes of pennies.', stillSafe: true },
  rat_smell: { id: 'rat_smell', tier: 1, good: true, name: 'Smells wrong to rats', text: 'Rats aim 12 worse at them. Dogs are not keen either.', foeAccVs: { monster: 'rats', acc: -12 } },
  slow_stomach: { id: 'slow_stomach', tier: 1, good: true, name: 'A slow stomach', text: 'A missed meal tires them half as much. They eat once a day at home and nobody likes watching.', hungerHalf: true },
  // tier 2: useful
  pale_eyes: { id: 'pale_eyes', tier: 2, good: true, name: 'Pale eyes', text: 'No aim penalty in the dark, and a worse one with their mother.', nightEyes: true },
  thick_hide: { id: 'thick_hide', tier: 2, good: true, name: 'A thick hide', text: 'Armor +1. Their skin has gone tough as boiled leather.', prot: 1 },
  quick_blood: { id: 'quick_blood', tier: 2, good: true, name: 'Quick blood', text: 'Venom and bleeding stop after one round, and bandages heal them 4 more.', shortPoison: true, bandageBonus: 4 },
  deep_lungs: { id: 'deep_lungs', tier: 2, good: true, name: 'Deep lungs', text: 'They take half the Exposure, and tire 1 slower each room.', exposureRate: 0.5, roomFatigue: -1 },
  // tier 3: powerful
  reagent_blood: { id: 'reagent_blood', tier: 3, good: true, name: 'Reagent blood', text: 'Their first spell or censer in every fight costs no dose, and their weapon blows burn.', freeCast: true, fireBlows: true },
  iron_bones: { id: 'iron_bones', tier: 3, good: true, name: 'Iron bones', text: 'Max HP +6, and their life is much safer when they go down.', maxHp: 6, deathRoll: -0.1 },
  storm_fingers: { id: 'storm_fingers', tier: 3, good: true, name: 'Storm in the fingers', text: 'When a fight starts, a crack of storm jumps from their hands to the nearest enemy.', openingStrike: 9 },
  sink_sense: { id: 'sink_sense', tier: 3, good: true, name: 'Sink sense', text: 'They feel the Sink move before it does: much better at spotting traps and slipping past wanderers.', spot: 0.15, avoid: 0.15 },
};

export const BAD_HABITS = Object.values(HABITS).filter((h) => !h.good).map((h) => h.id);
export const GOOD_HABITS = Object.values(HABITS).filter((h) => h.good).map((h) => h.id);

