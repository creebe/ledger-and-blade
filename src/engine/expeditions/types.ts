// Shapes for expeditions: contracts are walked as trips to real sites, room by
// room. See docs/EXPEDITIONS.md (design) and docs/EXPEDITIONS-API.md (the API
// the UI builds on). Kept free of data imports, like core/types.ts.
import type { Attributes, FactionId, MaterialId, ProfessionId, RivalId, TagId } from '../core/types';

export type SiteId = 'pellam' | 'varrow' | 'kell' | 'saltfens' | 'drovers' | 'harrowmere' | 'anselm';
export type ZoneId =
  | 'culverts'
  | 'streets'
  | 'sink'
  // thin sites, one zone each until their own workstream fills them
  | 'lowertown'
  | 'workings'
  | 'reeds'
  | 'hillroad'
  | 'shore'
  | 'wenmouth';
export type ExpLength = 'short' | 'medium' | 'long';
/** What goes in the pack. Food comes from the guild's supplies; the rest from `GameState.stores`. */
export type SupplyId = 'food' | 'bandages' | 'oil' | 'tools' | 'masks' | 'reagents' | 'draughts';
export type StoreId = Exclude<SupplyId, 'food'>;
export type MonsterId =
  // Old Pellam
  | 'rats'
  | 'moths'
  | 'grubber'
  | 'eel'
  | 'spider'
  | 'hog'
  | 'crab'
  | 'seep'
  | 'engine'
  | 'kiln'
  // the other sites
  | 'claim_jumper'
  | 'cave_crab'
  | 'salt_cutter'
  | 'marsh_hog'
  | 'road_agent'
  | 'deserter'
  | 'wolf'
  | 'pike'
  | 'smuggler'
  // brought in by a contract's dangers (tags), anywhere
  | 'thug'
  | 'soldier'
  | 'guard'
  | 'hedge_wizard'
  | 'troll'
  | 'salamander'
  | 'rioter';
/** Loot. The four materials go into `GameState.materials`; the rest are goods sold at the market. */
export type GoodId = 'coin' | 'glass' | 'eel_oil' | 'silver' | 'salts' | 'seal' | 'kiln_core' | MaterialId;

export interface StandingOrders {
  /** when to turn back: cautious (anyone badly hurt or worn out, or a death), steady (two, or a death), stubborn (falling apart) */
  retreat: 'cautious' | 'steady' | 'stubborn';
  healFirst: 'worst' | 'front' | 'back';
  wanderers: 'fight' | 'avoid';
  camp: 'sites' | 'hurt';
  consumables: 'freely' | 'sparingly' | 'hoard';
}

/** What the player decides before a squad leaves. The site, route length and goal come with the contract. */
export interface ExpPlan {
  /** member ids, rank 1 (front) first. 2 to 4 of them, within the contract's squad size */
  squad: string[];
  pack: Partial<Record<SupplyId, number>>;
  orders: StandingOrders;
}

/** What counts as the job done. */
export type ExpGoal =
  | { kind: 'complete' } // walk the whole route
  | { kind: 'reach'; zone: ZoneId }
  | { kind: 'bring'; good: GoodId; count: number }
  | { kind: 'kill'; monster: MonsterId; count: number };

/** The expedition side of a contract: where, how far, and what for. */
export interface ContractExpedition {
  site: SiteId;
  length: ExpLength;
  goal: ExpGoal;
}

// ---------------------------------------------------------------------------
// The log
// ---------------------------------------------------------------------------

/** What the squad strip shows after a line. Arrays follow the plan's rank order (`ExpeditionResult.squad`). */
export interface SquadSnap {
  hp: number[];
  maxHp: number[];
  fatigue: number[];
  exposure: number[];
  fever?: boolean[];
  state: ('ok' | 'spent' | 'out' | 'down' | 'dead')[];
}

export interface EnemySnap {
  monster: MonsterId;
  name: string;
  hp: number;
  maxHp: number;
}

export type LogKind =
  | 'road'
  | 'zone'
  | 'room'
  | 'fight'
  | 'hit'
  | 'miss'
  | 'enemy'
  | 'heal'
  | 'trap'
  | 'find'
  | 'camp'
  | 'fatigue'
  | 'exposure'
  | 'down'
  | 'death'
  | 'win'
  | 'retreat'
  | 'supply'
  | 'deed'
  | 'end';

export interface LogLine {
  kind: LogKind;
  text: string;
  squad: SquadSnap;
  enemies?: EnemySnap[];
  /** a line that matters: bold in the log. Watch together pauses the other squads on these */
  big?: boolean;
  /** a short number or cost shown after the line: damage, healing, supplies used */
  note?: string;
  /** the week of the trip this line belongs to, 1-based. Revealed at the End Week of that week */
  week: number;
  /** where in its week the line falls, 0 to 1: interleave several squads' lines by this */
  t: number;
  /** the room the squad is in (0-based), or undefined on the road */
  room?: number;
  zone?: ZoneId;
}

export interface DelverOutcome {
  id: string;
  /** hit points left, and the most they could have had */
  hp: number;
  maxHp: number;
  fatigue: number;
  exposure: number;
  /** Sink changes gained on this trip */
  changes: string[];
  /** still running the Sink fever when they came home: the change it will leave */
  fever?: string;
  xp: number;
  /** cause of death */
  died?: string;
  scars: string[];
  habits: string[];
  kills: number;
  deeds: string[];
  fame: number;
  wentDown: boolean;
  /** healing draughts from their own kit that were drunk */
  draughtsUsed: number;
}

export interface ExpeditionResult {
  seed: number;
  /** member ids in rank order: the order of every SquadSnap array */
  squad: string[];
  names: string[];
  outcome: 'complete' | 'retreated' | 'lost';
  deepest: ZoneId;
  roomsCleared: number;
  roomsPlanned: number;
  /** weeks the trip actually took, road included. Don't show before it's over: it gives away an early return */
  weeks: number;
  /** the whole log. Empty in a stored result: get it with `expeditionLog()` */
  log: LogLine[];
  loot: Partial<Record<GoodId, number>>;
  lootValue: number;
  crownsFound: number;
  leftover: Partial<Record<SupplyId, number>>;
  used: Partial<Record<SupplyId, number>>;
  members: DelverOutcome[];
  kills: Partial<Record<MonsterId, number>>;
  renown: number;
  deeds: string[];
  goalMet: boolean;
}

// ---------------------------------------------------------------------------
// What the simulation needs: a frozen copy of the squad and the world
// ---------------------------------------------------------------------------

/** Dive stats of one piece of gear, worked out from the classic item. */
export interface DiveGear {
  id: string;
  name: string;
  slot: 'weapon' | 'armor' | 'trinket' | 'consumable';
  damage?: 'slash' | 'pierce' | 'blunt';
  power?: number;
  element?: 'fire' | 'frost' | 'storm' | 'radiant' | 'shadow';
  ranged?: boolean;
  focus?: boolean;
  protection?: number;
  bulk?: number;
  dodge?: number;
  acc?: number;
  /** fatigue builds this much slower (halved per room) */
  ease?: number;
  finds?: number;
  heal?: number;
  spot?: number;
  avoid?: number;
  parley?: number;
  /** consumables */
  grantsElement?: 'fire' | 'frost' | 'storm' | 'radiant' | 'shadow';
  draught?: boolean;
  counters?: TagId[];
}

/** A squad member as they were when the squad left. */
export interface Delver {
  id: string;
  name: string;
  prof: ProfessionId;
  attrs: Attributes;
  level: number;
  /** 0-100, the classic health */
  health: number;
  fatigue: number;
  exposure: number;
  changes: string[];
  scars: string[];
  habits: string[];
  signature?: string;
  gear: { weapon?: DiveGear; armor?: DiveGear; trinket?: DiveGear; consumables: DiveGear[] };
}

/** Everything about the world the trip needs, fixed when the squad leaves. */
export interface DiveSetup {
  seed: number;
  site: SiteId;
  length: ExpLength;
  goal: ExpGoal;
  /** the contract's dangers as they really are, hidden ones included */
  tags: TagId[];
  threat: number;
  /** weeks on the road, there and back */
  roadOut: number;
  roadBack: number;
  /** a rival crew went through first: fewer fights, thinner finds */
  rivalAhead?: RivalId;
  /** the site's boss is already beaten: its room holds a lesser fight */
  bossBeaten?: boolean;
  /** the same, as trips sealed before save version 14 stored it */
  kilnBroken?: boolean;
  /** multiplier on enemy strength (door scenes, ambushes) */
  foeScale: number;
  /** lines from the door scene, told on the road out */
  fieldLog: string[];
  plan: ExpPlan;
  squad: Delver[];
}

// ---------------------------------------------------------------------------
// At the guild
// ---------------------------------------------------------------------------

/** The guild's record of Old Pellam and the other sites. */
export interface DelveState {
  /** zones any squad has reached at least once */
  zonesReached: ZoneId[];
  /** sites whose boss has been beaten: each boss is beaten once */
  bossesBeaten: SiteId[];
  /** expeditions sealed so far: seeds the next one */
  count: number;
  /** the plan used last, so preparation can start from it */
  lastPlan?: ExpPlan;
}

/** A patron's posting as seen on the board: re-exported for the UI. */
export interface PostingInfo {
  site: SiteId;
  siteName: string;
  zones: ZoneId[];
  length: ExpLength;
  weeks: number;
  goal: ExpGoal;
  goalText: string;
  patron: FactionId;
}
