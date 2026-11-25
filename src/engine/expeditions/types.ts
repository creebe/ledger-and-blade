// Shapes for the expeditions trial (docs/EXPEDITIONS.md). The trial keeps its
// own state, separate from GameState, so it never touches a real save.
import type { Attributes, DamageType, Element, FactionId, RivalId } from '../core/types';

export type DelverProf = 'vanguard' | 'skirmisher' | 'marksman' | 'arcanist' | 'chaplain' | 'scout';
export type SupplyId = 'food' | 'bandages' | 'oil' | 'tools' | 'masks' | 'reagents' | 'draughts';
export type ExpLength = 'short' | 'medium' | 'long';
export type ZoneId = 'culverts' | 'streets' | 'sink';
export type MonsterId =
  | 'rats'
  | 'moths'
  | 'grubber'
  | 'eel'
  | 'spider'
  | 'hog'
  | 'crab'
  | 'seep'
  | 'engine'
  | 'kiln';
export type GoodId = 'coin' | 'glass' | 'eel_oil' | 'seal' | 'salts' | 'silver' | 'kiln_core';

export interface GearDef {
  id: string;
  name: string;
  slot: 'weapon' | 'armor' | 'trinket';
  price: number;
  description: string;
  minRenown?: number;
  // weapon
  damage?: DamageType;
  power?: number;
  element?: Element;
  ranged?: boolean;
  /** a focus: spells use its element and power */
  focus?: boolean;
  // armor
  protection?: number;
  /** lost dodge */
  bulk?: number;
  // trinket
  dodge?: number;
  acc?: number;
  ease?: number; // fatigue builds this much slower (halved per room)
  finds?: number; // extra share of loot found
  heal?: number; // extra healing given
}

export interface GearItem {
  uid: string;
  defId: string;
}

export interface Delver {
  id: string;
  name: string;
  prof: DelverProf;
  attrs: Attributes;
  level: number;
  xp: number;
  hp: number;
  /** physical wear, 0-100. Builds on expeditions, clears with rest weeks at home */
  fatigue: number;
  /** reagent runoff in the body, 0-100. Builds in the deep; Saint Oda's can treat it */
  exposure: number;
  /** lasting conditions left by Exposure */
  conditions: string[];
  wage: number;
  weapon?: string; // gear uid
  armor?: string;
  trinket?: string;
  scars: string[];
  habits: string[];
  status: 'ready' | 'dead';
  /** what they do at the guild while the squad is away or the guild rests */
  task: 'rest' | 'train';
  joinedWeek: number;
  dives: number;
  kills: number;
  fame: number;
  deeds: string[];
  epithet?: string;
  diedWeek?: number;
  causeOfDeath?: string;
}

export interface DelverRecruit {
  delver: Delver;
  signOn: number;
  gear: string[]; // gear def ids
}

export interface StandingOrders {
  retreat: 'cautious' | 'steady' | 'stubborn';
  healFirst: 'worst' | 'front' | 'back';
  wanderers: 'fight' | 'avoid';
  camp: 'sites' | 'hurt';
  consumables: 'freely' | 'sparingly' | 'hoard';
}

export interface ExpPlan {
  length: ExpLength;
  squad: string[]; // delver ids, rank 1 first (exactly 4)
  pack: Partial<Record<SupplyId, number>>;
  orders: StandingOrders;
  sponsorId?: string;
}

export type SponsorGoal =
  | { kind: 'reach'; zone: ZoneId }
  | { kind: 'bring'; good: GoodId; count: number }
  | { kind: 'kill'; monster: MonsterId; count: number };

export interface Sponsor {
  id: string;
  faction: FactionId;
  title: string;
  text: string;
  goal: SponsorGoal;
  reward: number;
  renown: number;
  expiresWeek: number;
}

/** What the squad strip shows after a line. */
export interface SquadSnap {
  hp: number[];
  maxHp: number[];
  fatigue: number[];
  exposure: number[];
  state: ('ok' | 'spent' | 'out' | 'down' | 'dead')[];
}

export interface EnemySnap {
  monster: MonsterId;
  name: string;
  hp: number;
  maxHp: number;
}

export type LogKind =
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
  /** a line that matters: shown in bold in the log */
  big?: boolean;
  /** a short number or cost shown after the line: damage, healing, supplies used */
  note?: string;
}

export interface DelverOutcome {
  id: string;
  hp: number;
  fatigue: number;
  exposure: number;
  conditions: string[]; // new conditions from Exposure
  xp: number;
  died?: string; // cause of death
  scars: string[]; // new scars
  habits: string[]; // new habits
  kills: number;
  deeds: string[];
  fame: number;
}

export interface ExpeditionResult {
  seed: number;
  plan: ExpPlan;
  outcome: 'complete' | 'retreated' | 'lost';
  deepest: ZoneId;
  roomsCleared: number;
  roomsPlanned: number;
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
  sponsorMet?: boolean;
}

export interface ExpHistoryEntry {
  n: number;
  week: number;
  length: ExpLength;
  outcome: ExpeditionResult['outcome'];
  deepest: ZoneId;
  lootValue: number;
  dead: string[]; // names
  renown: number;
}

export interface ExpDebt {
  lender: 'weighhouse';
  principal: number;
  installment: number;
  dueWeek: number;
  missed: number;
}

export interface ExpGame {
  version: number;
  seed: number;
  rng: number;
  week: number;
  crowns: number;
  renown: number;
  nextId: number;
  members: Delver[];
  recruits: DelverRecruit[];
  gear: GearItem[]; // owned gear, equipped or in store
  stock: string[]; // gear def ids for sale this week
  stores: Record<SupplyId, number>; // supplies at home
  goods: Partial<Record<GoodId, number>>;
  hall: { infirmary: number; taproom: number };
  debt: ExpDebt;
  sponsors: Sponsor[];
  rivalAhead?: { rival: RivalId; week: number };
  zonesReached: ZoneId[];
  /** the Kiln Engine has been broken: later long expeditions find its yard instead */
  kilnBroken?: boolean;
  expeditions: number;
  history: ExpHistoryEntry[];
  last?: ExpeditionResult;
  /** the plan used last, so preparation starts from it */
  lastPlan?: ExpPlan;
  news: { week: number; text: string; tone?: 'good' | 'bad' | 'warn' }[];
  gameOver?: { week: number; text: string };
}
