// Content for expeditions: Professions' combat profiles, supplies, monsters,
// sites and zones, goods, scars, habits and Sink changes.
// Numbers that set the balance are in ../tuning.ts.
import type { DamageType, Element, ProfessionId, TagId } from '../../core/types';
import type { ExpGoal, ExpLength, GoodId, MonsterId, SiteId, StoreId, SupplyId, ZoneId } from '../types';

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
  tools: { id: 'tools', name: 'Tools', one: 'set of tools', perSlot: 2, price: 6, text: 'A crowbar and a bag of wedges. They make traps safe and force strongboxes, and they help with rubble.' },
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
  /** a site's boss: named on its own ("the Kiln Engine"), beaten once */
  boss?: boolean;
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
  kiln: M({ id: 'kiln', one: 'Kiln Engine', name: 'the Kiln Engine', plural: 'the Kiln Engine', depth: 3, hp: 100, acc: 74, dodge: 0, prot: 5, dmg: [7, 12], speed: 3, weak: ['frost', 'storm'], resist: ['fire', 'pierce'], special: 'blast', construct: true, boss: true, xp: 14, loot: { good: 'kiln_core', chance: 1 }, text: "The college's great reagent furnace, built to walk the length of the Sink and burn the spill. Nobody told it to stop." }),

  claim_jumper: M({ id: 'claim_jumper', one: 'claim-jumper', name: 'Claim-jumper', plural: 'claim-jumpers', depth: 1, hp: 16, acc: 72, dodge: 10, prot: 2, dmg: [4, 7], speed: 5, weak: [], resist: [], special: 'thief', xp: 2, coin: 8, people: true, voice: 'people', text: 'Miners working galleries that belong to somebody else. They would rather fight than be written down.' }),
  cave_crab: M({ id: 'cave_crab', one: 'cave crab', name: 'Cave crab', plural: 'cave crabs', depth: 1, hp: 22, acc: 70, dodge: 4, prot: 5, dmg: [4, 8], speed: 4, weak: ['blunt', 'storm'], resist: ['slash', 'pierce'], xp: 3, voice: 'beast', text: 'Pale crabs that came up the flooded galleries and liked it. Blades skid off them.' }),
  salt_cutter: M({ id: 'salt_cutter', one: 'salt-cutter', name: 'Salt-cutter', plural: 'salt-cutters', depth: 1, hp: 15, acc: 74, dodge: 12, prot: 1, dmg: [4, 8], speed: 6, weak: [], resist: [], xp: 2, coin: 4, people: true, voice: 'people', text: 'Cutters who stayed out on the pans too long. The fever took their manners first.' }),
  marsh_hog: M({ id: 'marsh_hog', one: 'marsh hog', name: 'Marsh hog', plural: 'marsh hogs', depth: 1, hp: 28, acc: 68, dodge: 4, prot: 2, dmg: [5, 10], speed: 5, weak: ['pierce'], resist: [], special: 'charge', xp: 3, loot: { good: 'leather', chance: 0.5 }, voice: 'beast', text: 'A bristled black hog that lives in the reeds and charges anything that moves in them.' }),
  road_agent: M({ id: 'road_agent', one: 'road agent', name: 'Road agent', plural: 'road agents', depth: 1, hp: 15, acc: 74, dodge: 12, prot: 2, dmg: [4, 7], speed: 6, ranged: true, weak: [], resist: [], xp: 2, coin: 8, people: true, voice: 'people', text: 'A highwayman with a crossbow and a speech about tolls.' }),
  deserter: M({ id: 'deserter', one: 'deserter', name: 'Deserter', plural: 'deserters', depth: 1, hp: 20, acc: 76, dodge: 8, prot: 4, dmg: [5, 8], speed: 5, weak: [], resist: [], xp: 3, coin: 6, people: true, voice: 'people', text: 'A soldier of the Ninth who walked away with his mail and his spear and kept walking.' }),
  wolf: M({ id: 'wolf', one: 'wolf', name: 'Hill wolf', plural: 'hill wolves', depth: 1, hp: 14, acc: 76, dodge: 18, prot: 0, dmg: [3, 7], speed: 8, weak: ['pierce', 'fire'], resist: [], xp: 2, loot: { good: 'leather', chance: 0.4 }, voice: 'beast', text: 'Grey hill wolves, thin from a bad winter and bolder than they should be.' }),
  pike: M({ id: 'pike', one: 'pike', name: 'Mere pike', plural: 'mere pike', depth: 1, hp: 20, acc: 76, dodge: 14, prot: 1, dmg: [5, 9], speed: 7, weak: ['storm', 'frost'], resist: [], special: 'ambush', xp: 3, voice: 'beast', text: 'A pike as long as a man that lies in the shallows and takes ankles.' }),
  smuggler: M({ id: 'smuggler', one: 'smuggler', name: 'Smuggler', plural: 'smugglers', depth: 1, hp: 15, acc: 72, dodge: 12, prot: 1, dmg: [4, 7], speed: 6, weak: [], resist: [], special: 'thief', xp: 2, coin: 10, people: true, voice: 'people', text: 'Lake people who move cargo at night and do not want to be counted.' }),
  // ---- Varrow: the Quays and the Rookeries ----
  footpad: M({ id: 'footpad', one: 'footpad', name: 'Footpad', plural: 'footpads', depth: 2, hp: 14, acc: 74, dodge: 16, prot: 1, dmg: [4, 7], speed: 7, weak: [], resist: [], special: 'thief', xp: 2, coin: 6, people: true, voice: 'people', text: 'A quick hand with a short knife, who knows every alley and would rather you never saw their face.' }),
  lighterman: M({ id: 'lighterman', one: 'lighterman', name: 'Lighterman', plural: 'lightermen', depth: 2, hp: 20, acc: 72, dodge: 8, prot: 2, dmg: [5, 9], speed: 5, weak: [], resist: [], xp: 3, coin: 5, people: true, voice: 'people', text: 'A boatman who unloads ships onto the quays by night, with a boat hook and strong opinions about who walks on their quay.' }),
  watch_sergeant: M({ id: 'watch_sergeant', one: 'watch sergeant', name: 'Watch sergeant', plural: 'watch sergeants', depth: 2, hp: 24, acc: 76, dodge: 6, prot: 4, dmg: [5, 9], speed: 5, weak: [], resist: [], xp: 3, coin: 4, people: true, voice: 'people', text: 'A sergeant of the watch with a brass badge and a pension to think about. Somebody other than the city is paying them tonight.' }),
  yard_dog: M({ id: 'yard_dog', one: 'yard dog', name: 'Yard dog', plural: 'yard dogs', depth: 2, hp: 16, acc: 76, dodge: 14, prot: 0, dmg: [4, 8], speed: 8, weak: ['pierce'], resist: [], xp: 2, voice: 'beast', text: 'A warehouse mastiff, kept hungry so it stays interested.' }),
  rudd: M({ id: 'rudd', one: 'Lew Rudd', name: 'Lew Rudd', plural: 'Lew Rudd', depth: 3, hp: 100, acc: 78, dodge: 6, prot: 4, dmg: [7, 12], speed: 4, weak: [], resist: [], boss: true, xp: 12, coin: 30, people: true, voice: 'people', loot: { good: 'rudd_book', chance: 1 }, text: 'Lew Rudd rents out muscle by the day from a yard in the Rookeries. Half the thugs in the Lower Town have worked for him, and the other half owe him money.' }),

  // ---- Kell Mines: the Sump and the Trevick level ----
  powder_man: M({ id: 'powder_man', one: 'powder man', name: 'Powder man', plural: 'powder men', depth: 2, hp: 15, acc: 72, dodge: 8, prot: 1, dmg: [5, 9], speed: 4, ranged: true, weak: ['fire'], resist: [], xp: 3, coin: 6, people: true, voice: 'people', text: 'A claim-jumper who handles the blasting powder, and throws it at people when there is no rock handy. Most of them are short of eyebrows.' }),
  pit_pony: M({ id: 'pit_pony', one: 'pit pony', name: 'Pit pony', plural: 'pit ponies', depth: 2, hp: 26, acc: 70, dodge: 6, prot: 1, dmg: [5, 9], speed: 5, weak: ['pierce'], resist: [], special: 'charge', xp: 3, voice: 'beast', text: 'The ponies were left below when the mine closed. They found their own way to live, and they bite.' }),
  moyle: M({ id: 'moyle', one: 'Gaffer Moyle', name: 'Gaffer Moyle', plural: 'Gaffer Moyle', depth: 3, hp: 78, acc: 74, dodge: 4, prot: 4, dmg: [6, 10], speed: 4, weak: ['fire'], resist: [], special: 'blast', boss: true, xp: 12, coin: 30, people: true, voice: 'people', loot: { good: 'moyle_takings', chance: 1 }, text: 'The claim-jumpers\' captain. Moyle has held the Trevick level for six years without paying anybody for it, and keeps a keg of powder within reach of his chair.' }),

  // ---- the Saltfens: the Pans and the Withies ----
  leeches: M({ id: 'leeches', one: 'knot of leeches', name: 'Fen leeches', plural: 'fen leeches', depth: 2, hp: 8, acc: 76, dodge: 12, prot: 0, dmg: [2, 4], speed: 6, weak: ['fire'], resist: ['blunt'], special: 'swarm', xp: 1, voice: 'beast', text: 'Leeches as long as a hand, which come up out of the channels in a knot when anything warm steps in.' }),
  fowler: M({ id: 'fowler', one: 'fowler', name: 'Fowler', plural: 'fowlers', depth: 2, hp: 14, acc: 74, dodge: 10, prot: 1, dmg: [5, 9], speed: 4, ranged: true, weak: [], resist: [], xp: 2, coin: 4, people: true, voice: 'people', text: 'A wildfowler with a punt gun, who shoots duck for the Varrow markets and anything else that comes through the withies uninvited.' }),
  dean: M({ id: 'dean', one: 'the Dean', name: 'the Dean', plural: 'the Dean', depth: 3, hp: 110, acc: 70, dodge: 4, prot: 3, dmg: [7, 12], speed: 5, weak: ['pierce'], resist: [], special: 'charge', boss: true, xp: 12, voice: 'beast', loot: { good: 'tusks', chance: 1 }, text: 'The oldest marsh boar in the fens, the size of a cart, with tusks like hay hooks. The cutters named it after the college\'s dean, and say the likeness is fair.' }),

  // ---- Drover's Road: Brannock Moor and Skell Gap ----
  reiver: M({ id: 'reiver', one: 'reiver', name: 'Reiver', plural: 'reivers', depth: 2, hp: 17, acc: 74, dodge: 12, prot: 2, dmg: [4, 8], speed: 7, weak: [], resist: [], special: 'thief', xp: 2, coin: 7, people: true, voice: 'people', text: 'A cattle thief from the moor farms, who lifts other people\'s herds in the autumn and calls it a family trade.' }),
  moor_bull: M({ id: 'moor_bull', one: 'moor bull', name: 'Moor bull', plural: 'moor bulls', depth: 2, hp: 40, acc: 66, dodge: 2, prot: 3, dmg: [7, 11], speed: 4, weak: ['pierce'], resist: [], special: 'charge', xp: 4, loot: { good: 'leather', chance: 0.6 }, voice: 'beast', text: 'A shaggy red bull that got away from a drove years ago and has run the moor since. It does not like the look of anybody.' }),
  crewe: M({ id: 'crewe', one: 'Sergeant Crewe', name: 'Sergeant Crewe', plural: 'Sergeant Crewe', depth: 3, hp: 80, acc: 78, dodge: 8, prot: 4, dmg: [6, 10], speed: 5, weak: [], resist: [], boss: true, xp: 12, coin: 25, people: true, voice: 'people', loot: { good: 'colours', chance: 1 }, text: 'Sergeant Abner Crewe walked out of the Ninth with twenty men and the regiment\'s colours. He holds the old toll house at Skell Gap, and charges a toll.' }),

  // ---- Harrowmere: the bridge houses and the Holms ----
  night_boatman: M({ id: 'night_boatman', one: 'night boatman', name: 'Night boatman', plural: 'night boatmen', depth: 2, hp: 16, acc: 72, dodge: 10, prot: 1, dmg: [4, 8], speed: 6, weak: [], resist: [], xp: 2, coin: 8, people: true, voice: 'people', text: 'A smuggler\'s oarsman, with muffled oars and a cudgel under the thwart.' }),
  crayfish: M({ id: 'crayfish', one: 'crayfish', name: 'Crayfish', plural: 'crayfish', depth: 2, hp: 12, acc: 70, dodge: 6, prot: 4, dmg: [3, 6], speed: 4, weak: ['blunt', 'storm'], resist: ['slash', 'pierce'], xp: 2, voice: 'beast', text: 'Lake crayfish the size of a cat, which live under the bridge piers and pinch anything that wades.' }),
  bailiff: M({ id: 'bailiff', one: 'the Bailiff', name: 'the Bailiff', plural: 'the Bailiff', depth: 3, hp: 80, acc: 76, dodge: 12, prot: 2, dmg: [6, 10], speed: 7, weak: ['storm', 'frost'], resist: [], special: 'ambush', boss: true, xp: 12, voice: 'beast', loot: { good: 'rings', chance: 1 }, text: 'The biggest pike in the mere, longer than a boat. The fishermen call it the Bailiff, because it takes its share of every catch.' }),

  // ---- Port Anselm: the Burrows and the Strand ----
  wrecker: M({ id: 'wrecker', one: 'wrecker', name: 'Wrecker', plural: 'wreckers', depth: 2, hp: 17, acc: 72, dodge: 10, prot: 1, dmg: [4, 8], speed: 6, weak: [], resist: [], special: 'thief', xp: 2, coin: 8, people: true, voice: 'people', text: 'Dune people who hang lanterns where ships will mistake them for the harbour, and are first down the beach in the morning.' }),
  tidewaiter: M({ id: 'tidewaiter', one: 'tidewaiter', name: 'Tidewaiter', plural: 'tidewaiters', depth: 3, hp: 22, acc: 76, dodge: 6, prot: 4, dmg: [5, 9], speed: 5, weak: [], resist: [], xp: 3, coin: 6, people: true, voice: 'people', text: 'A customs man on Ostrander\'s books, who guards the sheds on the Strand and does not care whose papers you have.' }),
  gulls: M({ id: 'gulls', one: 'flock of gulls', name: 'Herring gulls', plural: 'herring gulls', depth: 2, hp: 6, acc: 74, dodge: 28, prot: 0, dmg: [1, 3], speed: 9, ranged: true, weak: ['storm'], resist: ['blunt'], special: 'thief', xp: 1, voice: 'beast', text: 'Big grey gulls that have learned what a pack looks like. They will have whatever is in it.' }),
  tull: M({ id: 'tull', one: 'Mags Tull', name: 'Mags Tull', plural: 'Mags Tull', depth: 3, hp: 95, acc: 78, dodge: 10, prot: 3, dmg: [7, 11], speed: 6, weak: [], resist: [], special: 'thief', boss: true, xp: 12, coin: 30, people: true, voice: 'people', loot: { good: 'salvage', chance: 1 }, text: 'Mags Tull runs the wreckers of the Burrows from a cove at the end of the Strand. She has lit the false lantern on more nights than the harbour master has lit the real one.' }),

  thug: M({ id: 'thug', one: 'thug', name: 'Hired thug', plural: 'thugs', depth: 1, hp: 15, acc: 70, dodge: 8, prot: 1, dmg: [4, 7], speed: 5, weak: [], resist: [], xp: 2, coin: 5, people: true, voice: 'people', text: 'Muscle hired by the day. They are brave in a crowd and keen on being paid.' }),
  soldier: M({ id: 'soldier', one: 'soldier', name: 'Sell-sword', plural: 'sell-swords', depth: 1, hp: 22, acc: 78, dodge: 8, prot: 4, dmg: [5, 9], speed: 5, weak: [], resist: [], xp: 3, coin: 6, people: true, voice: 'people', text: 'Soldiers in armor who have been drilled, and are paid to stand still while you try to move them.' }),
  guard: M({ id: 'guard', one: 'guard', name: 'Guard', plural: 'guards', depth: 1, hp: 18, acc: 76, dodge: 8, prot: 3, dmg: [4, 8], speed: 5, weak: [], resist: [], xp: 2, coin: 3, people: true, voice: 'people', text: 'A watchman with a cudgel and a lantern, who will shout for his friends first.' }),
  hedge_wizard: M({ id: 'hedge_wizard', one: 'hedge-wizard', name: 'Hedge-wizard', plural: 'hedge-wizards', depth: 1, hp: 14, acc: 76, dodge: 10, prot: 4, dmg: [5, 8], speed: 6, ranged: true, weak: ['storm'], resist: ['pierce'], xp: 3, coin: 6, people: true, voice: 'people', text: 'A wizard for hire with no license, hiding behind protective workings the college would never pass.' }),
  troll: M({ id: 'troll', one: 'troll', name: 'Troll', plural: 'trolls', depth: 1, hp: 55, acc: 70, dodge: 2, prot: 3, dmg: [7, 12], speed: 3, weak: ['fire'], resist: ['frost'], special: 'regen', xp: 8, voice: 'beast', text: 'A big grey troll that is in no hurry about anything. It heals while you watch, unless you burn it.' }),
  salamander: M({ id: 'salamander', one: 'salamander', name: 'Salamander', plural: 'salamanders', depth: 1, hp: 24, acc: 74, dodge: 12, prot: 2, dmg: [5, 9], speed: 6, weak: ['frost'], resist: ['fire'], xp: 4, loot: { good: 'reagents', chance: 0.5 }, voice: 'beast', text: 'A lizard the length of a cart, living where the rock is warm. It burns what it bites.' }),
  rioter: M({ id: 'rioter', one: 'rioter', name: 'Rioter', plural: 'rioters', depth: 1, hp: 10, acc: 66, dodge: 6, prot: 0, dmg: [2, 5], speed: 5, weak: [], resist: [], xp: 1, people: true, voice: 'people', text: 'Somebody with a grievance and a cobblestone. Hurting them costs the guild its name.' }),
};

export const MONSTER_IDS = Object.keys(MONSTERS) as MonsterId[];

// ---------------------------------------------------------------------------
// Sites and zones
// ---------------------------------------------------------------------------

export type CurioKind = 'shrine' | 'strongbox' | 'grubber_cache' | 'cart' | 'still' | 'wreck' | 'cairn' | 'boathouse';
export type TrapKind = 'tripwire' | 'grate' | 'floor' | 'gas' | 'collapse' | 'bog' | 'snare' | 'tide' | 'stampede' | 'brine';

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
  quays: {
    id: 'quays',
    site: 'varrow',
    name: 'the Quays',
    depth: 2,
    dark: true,
    text: 'The river warehouses below the chain, at night, with lighters tied up three deep and men paid to stand in the doorways of the bonded stores.',
    rooms: { passage: 2.2, fight: 3, trap: 1.2, find: 2.2, curio: 1 },
    fights: [['lighterman', 'lighterman'], ['footpad', 'thug'], ['yard_dog', 'yard_dog'], ['watch_sergeant', 'guard'], ['lighterman', 'footpad', 'footpad'], ['yard_dog', 'lighterman']],
    finds: [
      { good: 'brandy', min: 1, max: 2, weight: 3 },
      { good: 'coin', min: 1, max: 3, weight: 2 },
    ],
    curios: ['strongbox', 'boathouse'],
    traps: ['tide', 'snare'],
    scoutFind: 'brandy',
  },
  rookeries: {
    id: 'rookeries',
    site: 'varrow',
    name: 'the Rookeries',
    depth: 3,
    dark: false,
    text: 'Tenement courts behind the tanneries, six storeys of rented rooms leaning on each other, with washing across every gap and a way over the roofs for anyone who knows it.',
    rooms: { passage: 1.8, fight: 3.4, trap: 1.4, find: 2, curio: 1 },
    fights: [['footpad', 'footpad', 'footpad'], ['thug', 'thug', 'watch_sergeant'], ['yard_dog', 'yard_dog', 'thug'], ['footpad', 'footpad', 'lighterman'], ['watch_sergeant', 'watch_sergeant', 'thug']],
    finds: [
      { good: 'coin', min: 2, max: 4, weight: 3 },
      { good: 'brandy', min: 1, max: 3, weight: 2 },
      { good: 'silver', min: 1, max: 1, weight: 1 },
    ],
    curios: ['strongbox', 'shrine'],
    traps: ['floor', 'snare'],
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
  sump: {
    id: 'sump',
    site: 'kell',
    name: 'the Sump',
    depth: 2,
    dark: true,
    text: 'The lower galleries, where the pumps gave out the year after the war. The water stands at the knee and is colder than it has any right to be.',
    rooms: { passage: 2, fight: 3.2, trap: 1.6, find: 2, curio: 0.8 },
    fights: [['cave_crab', 'cave_crab'], ['pit_pony', 'pit_pony'], ['claim_jumper', 'powder_man'], ['rats', 'rats', 'cave_crab'], ['pit_pony', 'claim_jumper']],
    finds: [
      { good: 'ore', min: 1, max: 2, weight: 3 },
      { good: 'iron', min: 2, max: 3, weight: 2 },
      { good: 'coin', min: 1, max: 2, weight: 1 },
    ],
    curios: ['strongbox', 'shrine'],
    traps: ['collapse', 'gas'],
    scoutFind: 'ore',
  },
  trevick: {
    id: 'trevick',
    site: 'kell',
    name: 'the Trevick level',
    depth: 3,
    dark: true,
    text: 'The old silver gallery, cut by a mine captain called Trevick who died rich and was buried with his pick. The vein is still there, and so are the people who found it first.',
    rooms: { passage: 1.6, fight: 3.4, trap: 1.6, find: 2.4, curio: 0.8 },
    fights: [['claim_jumper', 'claim_jumper', 'powder_man'], ['powder_man', 'powder_man'], ['pit_pony', 'claim_jumper', 'claim_jumper'], ['cave_crab', 'cave_crab', 'powder_man']],
    finds: [
      { good: 'ore', min: 2, max: 3, weight: 4 },
      { good: 'coin', min: 1, max: 3, weight: 2 },
    ],
    curios: ['strongbox', 'shrine'],
    traps: ['collapse', 'gas'],
    scoutFind: 'ore',
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
  pans: {
    id: 'pans',
    site: 'saltfens',
    name: 'the Pans',
    depth: 2,
    dark: false,
    text: 'The salt pans and brine flats at the edge of the estuary. Low mud walls cut the white crust into squares, and the only shelter is in the boiling huts.',
    rooms: { passage: 2.2, fight: 3, trap: 1.6, find: 2.2, curio: 0.6 },
    fights: [['salt_cutter', 'salt_cutter', 'salt_cutter'], ['marsh_hog', 'salt_cutter'], ['fowler', 'salt_cutter'], ['leeches', 'leeches', 'salt_cutter'], ['marsh_hog', 'marsh_hog']],
    finds: [
      { good: 'pan_salt', min: 2, max: 3, weight: 4 },
      { good: 'reagents', min: 1, max: 2, weight: 2 },
      { good: 'coin', min: 1, max: 2, weight: 1 },
    ],
    curios: ['shrine', 'boathouse'],
    traps: ['brine', 'bog'],
    exposure: 1,
    scoutFind: 'pan_salt',
  },
  withies: {
    id: 'withies',
    site: 'saltfens',
    name: 'the Withies',
    depth: 3,
    dark: false,
    text: 'Willow beds cut through by deep channels, where the fens run into the river. You can see about as far as the next willow.',
    rooms: { passage: 1.8, fight: 3.4, trap: 1.6, find: 2.2, curio: 0.8 },
    fights: [['leeches', 'leeches', 'leeches'], ['marsh_hog', 'marsh_hog'], ['fowler', 'fowler'], ['leeches', 'leeches', 'marsh_hog'], ['salt_cutter', 'salt_cutter', 'fowler']],
    finds: [
      { good: 'reagents', min: 2, max: 3, weight: 3 },
      { good: 'pan_salt', min: 1, max: 2, weight: 1 },
      { good: 'coin', min: 1, max: 3, weight: 1 },
    ],
    curios: ['shrine', 'boathouse'],
    traps: ['bog', 'snare'],
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
  brannock: {
    id: 'brannock',
    site: 'drovers',
    name: 'Brannock Moor',
    depth: 2,
    dark: false,
    text: 'The high moor the road crosses on its way to the pass: heather, standing water, old cairns and wind from every side at once.',
    rooms: { passage: 2.6, fight: 3, trap: 1.2, find: 1.8, curio: 0.8 },
    fights: [['wolf', 'wolf', 'wolf'], ['reiver', 'reiver'], ['moor_bull'], ['reiver', 'wolf'], ['deserter', 'deserter'], ['reiver', 'reiver', 'reiver']],
    finds: [
      { good: 'fleece', min: 1, max: 3, weight: 3 },
      { good: 'leather', min: 1, max: 2, weight: 2 },
      { good: 'coin', min: 1, max: 2, weight: 1 },
    ],
    curios: ['cairn', 'shrine'],
    traps: ['snare', 'stampede'],
    scoutFind: 'fleece',
  },
  skell: {
    id: 'skell',
    site: 'drovers',
    name: 'Skell Gap',
    depth: 3,
    dark: false,
    text: "The pass at the top of the Drover's Road, between two scree slopes, with the old Crown toll house at the narrowest point.",
    rooms: { passage: 1.8, fight: 3.4, trap: 1.4, find: 2, curio: 0.8 },
    fights: [['deserter', 'road_agent'], ['deserter', 'deserter'], ['reiver', 'reiver', 'deserter'], ['moor_bull', 'reiver'], ['road_agent', 'road_agent', 'deserter']],
    finds: [
      { good: 'coin', min: 2, max: 4, weight: 3 },
      { good: 'fleece', min: 1, max: 2, weight: 1 },
      { good: 'leather', min: 1, max: 3, weight: 1 },
    ],
    curios: ['cairn', 'strongbox'],
    traps: ['collapse', 'snare'],
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
  bridge: {
    id: 'bridge',
    site: 'harrowmere',
    name: 'the bridge houses',
    depth: 2,
    dark: true,
    text: 'The houses built along the old bridge, empty since the middle span went. The floors have gone soft, and the water moves underneath all of it.',
    rooms: { passage: 2, fight: 3.2, trap: 1.5, find: 2.2, curio: 0.8 },
    fights: [['smuggler', 'night_boatman'], ['crayfish', 'crayfish', 'crayfish'], ['night_boatman', 'night_boatman'], ['pike', 'crayfish'], ['smuggler', 'crayfish']],
    finds: [
      { good: 'coin', min: 1, max: 3, weight: 3 },
      { good: 'bog_oak', min: 1, max: 1, weight: 1 },
      { good: 'timber', min: 2, max: 3, weight: 2 },
    ],
    curios: ['strongbox', 'shrine'],
    traps: ['floor', 'snare'],
    scoutFind: 'coin',
  },
  holms: {
    id: 'holms',
    site: 'harrowmere',
    name: 'the Holms',
    depth: 3,
    dark: false,
    text: 'The islands out on the mere, reached by punt and by wading: alder, reed, a ruined chapel or two, and the deepest water anyone has sounded.',
    rooms: { passage: 1.8, fight: 3.4, trap: 1.5, find: 2.4, curio: 0.8 },
    fights: [['pike', 'pike'], ['crayfish', 'crayfish', 'pike'], ['smuggler', 'smuggler', 'night_boatman'], ['night_boatman', 'smuggler'], ['crayfish', 'crayfish']],
    finds: [
      { good: 'bog_oak', min: 1, max: 2, weight: 3 },
      { good: 'coin', min: 1, max: 3, weight: 2 },
      { good: 'timber', min: 2, max: 3, weight: 1 },
    ],
    curios: ['boathouse', 'shrine'],
    traps: ['bog', 'snare'],
    scoutFind: 'bog_oak',
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
  burrows: {
    id: 'burrows',
    site: 'anselm',
    name: 'the Burrows',
    depth: 2,
    dark: false,
    text: 'The dunes between the coast road and the sea, miles of them, full of marram grass and rabbit holes, with the ribs of old ships sticking out of the sand.',
    rooms: { passage: 2.4, fight: 3, trap: 1.3, find: 2, curio: 0.8 },
    fights: [['wrecker', 'wrecker'], ['gulls', 'gulls', 'gulls'], ['road_agent', 'wrecker'], ['deserter', 'deserter'], ['wrecker', 'gulls', 'gulls']],
    finds: [
      { good: 'coin', min: 1, max: 3, weight: 3 },
      { good: 'ambergris', min: 1, max: 1, weight: 1 },
      { good: 'timber', min: 2, max: 3, weight: 1 },
    ],
    curios: ['wreck', 'shrine'],
    traps: ['tide', 'snare'],
    scoutFind: 'coin',
  },
  strand: {
    id: 'strand',
    site: 'anselm',
    name: 'the Strand',
    depth: 3,
    dark: false,
    text: "Port Anselm's waterfront, a mile of customs sheds and Ostrander's warehouses, with the bank's ships riding at anchor beyond the bar.",
    rooms: { passage: 1.8, fight: 3.4, trap: 1.3, find: 2.2, curio: 0.8 },
    fights: [['tidewaiter', 'tidewaiter'], ['tidewaiter', 'tidewaiter', 'guard'], ['gulls', 'gulls', 'wrecker'], ['wrecker', 'wrecker', 'wrecker'], ['tidewaiter', 'tidewaiter', 'tidewaiter']],
    finds: [
      { good: 'coin', min: 2, max: 4, weight: 3 },
      { good: 'ambergris', min: 1, max: 1, weight: 2 },
      { good: 'brandy', min: 1, max: 2, weight: 1 },
    ],
    curios: ['wreck', 'strongbox'],
    traps: ['tide', 'snare'],
    scoutFind: 'coin',
  },
};

export const ZONE_ORDER: ZoneId[] = ['culverts', 'streets', 'sink', 'lowertown', 'quays', 'rookeries', 'workings', 'sump', 'trevick', 'reeds', 'pans', 'withies', 'hillroad', 'brannock', 'skell', 'shore', 'bridge', 'holms', 'wenmouth', 'burrows', 'strand'];

export type SiteGroup = 'under' | 'town' | 'overland';

/** What waits at the bottom of a site's long route. It is beaten once. */
export interface SiteBoss {
  monster: MonsterId;
  /** the boss's room: the boss and whatever stands with it */
  group: MonsterId[];
  /** the zone the boss room belongs to */
  zone: ZoneId;
  /** once it is beaten, long routes end with this fight instead */
  after: MonsterId[];
  /** the line for the boss's room once the boss is gone */
  afterKey: string;
  /** the renown deed and the member's deed when it falls */
  deed: string;
  memberDeed: string;
  /** the report line the first time it falls */
  report: string;
  /** a posting to kill it */
  goalText: string;
}

export interface SiteDef {
  id: SiteId;
  name: string;
  /** the classic region it lies in: travel weeks and the region name come from it */
  region: string;
  zones: ZoneId[];
  group: SiteGroup;
  text: string;
  boss?: SiteBoss;
  /** what each route length is for, in a line on the board */
  goals?: Record<ExpLength, string>;
  /** a plain job's long route, which stops short of the boss */
  deep?: string;
}

export const SITES: Record<SiteId, SiteDef> = {
  pellam: {
    id: 'pellam',
    name: 'Old Pellam',
    region: 'varrow',
    zones: ['culverts', 'streets', 'sink'],
    group: 'under',
    text: "The first town on the river, under Varrow's Lower Town. Its cellars and streets are still down there, and so is the drain where the college poured its spent reagents for a century.",
    goals: {
      short: 'Through the Culverts to the old pump house',
      medium: 'Down to the Buried Streets and the old counting house',
      long: 'To the bottom of the College Sink, where the Kiln Engine walks',
    },
    boss: {
      monster: 'kiln',
      group: ['kiln', 'seep'],
      zone: 'sink',
      after: ['engine', 'engine', 'seep'],
      afterKey: 'kiln_yard',
      deed: 'Broke the Kiln Engine',
      memberDeed: 'broke the Kiln Engine',
      report: "The college sends a cart for the Kiln Engine's core, and a letter that is mostly about who is going to pay for the cart.",
      goalText: 'Break the Kiln Engine',
    },
  },
  varrow: {
    id: 'varrow',
    name: 'Varrow',
    region: 'varrow',
    zones: ['lowertown', 'quays', 'rookeries'],
    group: 'town',
    text: 'Work in the city itself, where the trouble is guarded doors and angry crowds, and further down the hill, people who rent out both.',
    deep: 'To the far side of the Rookeries',
    goals: {
      short: 'Through the Lower Town to the cooper\'s yard',
      medium: 'Down to the Quays and the bonded warehouse',
      long: 'Into the Rookeries, to Rudd\'s yard',
    },
    boss: {
      monster: 'rudd',
      group: ['rudd', 'yard_dog', 'yard_dog'],
      zone: 'rookeries',
      after: ['thug', 'thug', 'yard_dog'],
      afterKey: 'rudd_after',
      deed: 'Put Lew Rudd out of business',
      memberDeed: 'put Lew Rudd out of business',
      report: "The Lower Town hears about Rudd's yard before the squad is back on Tallow Street. Nobody admits to having worked for him, which is a first.",
      goalText: "Put Lew Rudd out of business",
    },
  },
  kell: {
    id: 'kell',
    name: 'Kell Mines',
    region: 'kell',
    zones: ['workings', 'sump', 'trevick'],
    group: 'overland',
    text: 'Silver workings in the northern hills, half of them flooded, and the deepest of them held by people who never paid for it.',
    deep: 'To the end of the Trevick level',
    goals: {
      short: 'Through the upper workings to the old winding shaft',
      medium: 'Down into the Sump, to the drowned pump house',
      long: 'To the end of the Trevick level, where Gaffer Moyle holds the vein',
    },
    boss: {
      monster: 'moyle',
      group: ['moyle', 'powder_man', 'claim_jumper'],
      zone: 'trevick',
      after: ['claim_jumper', 'claim_jumper', 'powder_man'],
      afterKey: 'moyle_after',
      deed: 'Threw Gaffer Moyle off the Trevick level',
      memberDeed: 'threw Gaffer Moyle off the Trevick level',
      report: 'The mine owners write to say they always knew the Trevick level was theirs, and ask whether the guild could also see about the pumps.',
      goalText: 'Throw Gaffer Moyle off the Trevick level',
    },
  },
  saltfens: {
    id: 'saltfens',
    name: 'The Saltfens',
    region: 'saltfens',
    zones: ['reeds', 'pans', 'withies'],
    group: 'overland',
    text: 'The marshes along the estuary, good for reagents and salt and for catching fever.',
    deep: 'Through the Withies to the river',
    goals: {
      short: 'Along the reed paths to the cutters\' landing',
      medium: 'Out to the Pans and the old boiling house',
      long: 'Into the Withies, where the Dean lies up',
    },
    boss: {
      monster: 'dean',
      group: ['dean', 'marsh_hog'],
      zone: 'withies',
      after: ['marsh_hog', 'marsh_hog'],
      afterKey: 'dean_after',
      deed: 'Killed the Dean',
      memberDeed: 'killed the Dean',
      report: 'The salt-cutters send a ham, which is in poor taste, and a jar of pan salt, which is not.',
      goalText: 'Kill the Dean',
    },
  },
  drovers: {
    id: 'drovers',
    name: "Drover's Road",
    region: 'drovers',
    zones: ['hillroad', 'brannock', 'skell'],
    group: 'overland',
    text: 'The cattle road through the hills east of the city, over Brannock Moor to the pass at Skell Gap.',
    deep: 'Up to Skell Gap',
    goals: {
      short: 'Along the hill road to the drovers\' inn',
      medium: 'Across Brannock Moor to the standing cairn',
      long: 'Up to Skell Gap and the old toll house',
    },
    boss: {
      monster: 'crewe',
      group: ['crewe', 'deserter'],
      zone: 'skell',
      after: ['deserter', 'deserter', 'road_agent'],
      afterKey: 'crewe_after',
      deed: 'Took the toll house at Skell Gap',
      memberDeed: 'took the toll house at Skell Gap from Sergeant Crewe',
      report: 'The drovers bring their herds over the Gap without paying anybody for the first time in two years, and drink to the guild at the inn.',
      goalText: 'Take the toll house at Skell Gap from Sergeant Crewe',
    },
  },
  harrowmere: {
    id: 'harrowmere',
    name: 'Harrowmere',
    region: 'harrowmere',
    zones: ['shore', 'bridge', 'holms'],
    group: 'overland',
    text: 'A lake town on a mere that goes deeper than anyone has sounded. Its old bridge is broken, and nobody farms the islands.',
    deep: 'Out to the far Holms',
    goals: {
      short: 'Along the shore to the boathouses',
      medium: 'Out along the bridge houses to the broken span',
      long: 'Out to the Holms, where the Bailiff feeds',
    },
    boss: {
      monster: 'bailiff',
      group: ['bailiff', 'pike'],
      zone: 'holms',
      after: ['pike', 'pike'],
      afterKey: 'bailiff_after',
      deed: 'Landed the Bailiff',
      memberDeed: 'landed the Bailiff',
      report: 'Harrowmere hangs the Bailiff from the bridge for a week, and three different families claim the rings in its belly were their grandmother\'s.',
      goalText: 'Land the Bailiff',
    },
  },
  anselm: {
    id: 'anselm',
    name: 'Port Anselm',
    region: 'anselm',
    zones: ['wenmouth', 'burrows', 'strand'],
    group: 'overland',
    text: "The coast road to the port where Ostrander's ships take on the Crown's silver, past the dunes where the wreckers live.",
    deep: 'To the end of the Strand',
    goals: {
      short: 'Along the Wenmouth road to the ford',
      medium: 'Into the Burrows, to the wreck on the point',
      long: 'Down the Strand to Mags Tull\'s cove',
    },
    boss: {
      monster: 'tull',
      group: ['tull', 'wrecker', 'wrecker'],
      zone: 'strand',
      after: ['wrecker', 'wrecker', 'gulls'],
      afterKey: 'tull_after',
      deed: "Put out Mags Tull's lantern",
      memberDeed: "put out Mags Tull's lantern",
      report: 'The harbour master at Port Anselm writes to thank the guild, and to ask it not to mention the wreckers to the bank.',
      goalText: "Put out Mags Tull's lantern",
    },
  },
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

/** The rooms of a route, in order. A plain job ("see it through") on a long route ends in the last zone, not at the boss. */
export function routeOf(site: SiteId, length: ExpLength, goal?: ExpGoal): RouteStep[] {
  if (site === 'pellam') return PELLAM_ROUTES[length];
  const zs = SITES[site].zones;
  if (zs.length >= 3) {
    // every site is built like Old Pellam: one zone, then two, then all three and the boss
    const [a, b, c] = zs;
    if (length === 'short') return [a, a, a, a, a];
    if (length === 'medium') return [a, a, a, a, 'camp', b, b, b, b];
    if (goal?.kind === 'complete') return [a, a, a, b, b, b, b, 'camp', c, c, c, c, c];
    return [a, a, a, b, b, b, b, 'camp', c, c, c, c, 'camp', 'boss'];
  }
  const z = zs[0];
  const leg = [z, z, z, z];
  if (length === 'short') return [z, z, z, z, z];
  if (length === 'medium') return [...leg, 'camp', ...leg];
  return [...leg, 'camp', ...leg, 'camp', ...leg];
}

/** Old Pellam's goal rooms (kept for the story export; every site now has its own `goals`). */
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
  brandy: { id: 'brandy', many: 'casks of bonded brandy', name: 'Bonded brandy', one: 'a cask of bonded brandy', value: 14, text: 'Brandy that was waiting on the Quays for the duty to be paid. It still is.' },
  rudd_book: { id: 'rudd_book', many: "copies of Rudd's book", name: "Rudd's book", one: "Rudd's book", value: 170, text: "Lew Rudd's ledger of who hired whom, for what and when. The watch would pay for it, and so would several people who would rather the watch never saw it." },
  ore: { id: 'ore', many: 'sacks of silver ore', name: 'Silver ore', one: 'a sack of silver ore', value: 15, text: 'Grey rock with a shine in it, from the Kell veins. The Weighhouse assays it and pays by the sack.' },
  moyle_takings: { id: 'moyle_takings', many: "chests of Moyle's takings", name: "Moyle's takings", one: "Moyle's takings", value: 180, text: 'Six years of silver from a vein Gaffer Moyle never paid for, in a chest he kept under his chair.' },
  pan_salt: { id: 'pan_salt', many: 'cakes of pan salt', name: 'Pan salt', one: 'a cake of pan salt', value: 10, text: 'White salt boiled off the Saltfens pans and pressed into cakes. Every kitchen in Varrow uses it, and Saint Oda\'s uses it on wounds.' },
  tusks: { id: 'tusks', many: "pairs of the Dean's tusks", name: "The Dean's tusks", one: "the Dean's tusks", value: 160, text: 'Two yellow tusks as long as a forearm. The college has asked for them, for reasons it will not put in writing.' },
  fleece: { id: 'fleece', many: 'fleeces', name: 'Fleeces', one: 'a fleece', value: 8, text: 'Moor fleeces, greasy and thick, from sheep that will not miss them for long.' },
  colours: { id: 'colours', many: "sets of the Ninth's colours", name: "The Ninth's colours", one: "the Ninth's colours", value: 170, text: 'The regiment\'s flag, carried at Cassel Ford and carried off by Sergeant Crewe. Somebody in the Ninth will pay a great deal for it, or at least shout a great deal.' },
  bog_oak: { id: 'bog_oak', many: 'lengths of bog oak', name: 'Bog oak', one: 'a length of bog oak', value: 18, text: 'Oak that has lain in the mere for centuries and turned black and hard as iron. The furniture makers on Anvil Row fight over it.' },
  rings: { id: 'rings', many: "handfuls of the Bailiff's rings", name: "The Bailiff's rings", one: "the Bailiff's rings", value: 150, text: "Mostly rings and buckles, with a bishop's seal among them, from the belly of the biggest pike in Harrowmere. Some of the owners are still alive." },
  ambergris: { id: 'ambergris', many: 'lumps of ambergris', name: 'Ambergris', one: 'a lump of ambergris', value: 40, text: 'A grey waxy lump that washes up on the Burrows. It smells odd and the perfumers pay a fortune for it.' },
  salvage: { id: 'salvage', many: "loads of Tull's salvage", name: "Tull's salvage", one: "Tull's salvage", value: 180, text: 'What the wreckers took off a dozen ships: plate and bolts of cloth, and a ship\'s figurehead with the name chiselled off.' },
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
  thick_hide: { id: 'thick_hide', tier: 2, good: true, name: 'A thick hide', text: 'Armor +1. Their skin has gone thick and stiff, and they can\'t feel a pinch.', prot: 1 },
  quick_blood: { id: 'quick_blood', tier: 2, good: true, name: 'Quick blood', text: 'Venom and bleeding stop after one round, and bandages heal them 4 more.', shortPoison: true, bandageBonus: 4 },
  deep_lungs: { id: 'deep_lungs', tier: 2, good: true, name: 'Deep lungs', text: 'They take half the Exposure, and tire 1 slower each room.', exposureRate: 0.5, roomFatigue: -1 },
  // tier 3: powerful
  reagent_blood: { id: 'reagent_blood', tier: 3, good: true, name: 'Reagent blood', text: 'Their first spell or censer in every fight costs no dose, and their weapon blows burn.', freeCast: true, fireBlows: true },
  iron_bones: { id: 'iron_bones', tier: 3, good: true, name: 'Iron bones', text: 'Max HP +6, and their life is much safer when they go down.', maxHp: 6, deathRoll: -0.1 },
  storm_fingers: { id: 'storm_fingers', tier: 3, good: true, name: 'Storm in the fingers', text: 'When a fight starts, a crack of storm jumps from their hands to the nearest enemy.', openingStrike: 9 },
  sink_sense: { id: 'sink_sense', tier: 3, good: true, name: 'Sink sense', text: 'They can tell when something nearby is about to move: much better at spotting traps and slipping past wanderers.', spot: 0.15, avoid: 0.15 },
};

export const BAD_HABITS = Object.values(HABITS).filter((h) => !h.good).map((h) => h.id);
export const GOOD_HABITS = Object.values(HABITS).filter((h) => h.good).map((h) => h.id);

