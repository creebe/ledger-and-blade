// Core game types. The engine is pure TypeScript with no UI dependencies.
import type { FactId, NpcId, NpcStatus } from './data/facts';
import type { FacilityId } from './data/facilities';
export type { FactId, NpcId, NpcStatus, FacilityId };

export type Attribute = 'might' | 'finesse' | 'wits' | 'resolve';
export type Approach = 'assault' | 'stealth' | 'guile' | 'endurance' | 'arcana';
export type DamageType = 'slash' | 'pierce' | 'blunt';
export type Element = 'fire' | 'frost' | 'storm' | 'radiant' | 'shadow';
export type ArmorWeight = 'light' | 'medium' | 'heavy';
export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export type ProfessionId =
  | 'vanguard'
  | 'skirmisher'
  | 'marksman'
  | 'arcanist'
  | 'chaplain'
  | 'scout'
  | 'envoy'
  | 'infiltrator';

export type FactionId = 'exchequer' | 'weighhouse' | 'ostranders' | 'lowertown';
export type RivalId = 'hobbs';
export type MaterialId = 'iron' | 'leather' | 'timber' | 'reagents';

export type TagId = string;

export interface Attributes {
  might: number;
  finesse: number;
  wits: number;
  resolve: number;
}

export type ItemSlot = 'weapon' | 'armor' | 'trinket' | 'consumable';
export type Quality = 'crude' | 'standard' | 'fine' | 'masterwork';

export interface ItemDef {
  id: string;
  name: string;
  slot: ItemSlot;
  price: number;
  description: string;
  // weapon
  damage?: DamageType;
  power?: number;
  element?: Element;
  ranged?: boolean;
  // armor
  weight?: ArmorWeight;
  protection?: number;
  // generic approach bonuses (+points to an approach score)
  bonus?: Partial<Record<Approach, number>>;
  // consumable: grants weapon element for the mission
  grantsElement?: Element;
  // consumable/trinket: counters these tag ids (removes their penalty)
  counters?: TagId[];
  // healing consumable reduces wounds taken
  mending?: number;
}

export interface ItemInstance {
  uid: string;
  defId: string;
}

export interface Loadout {
  weapon?: string; // item uid
  armor?: string;
  trinket?: string;
  consumables: string[]; // up to 2
}

export type MemberStatus = 'idle' | 'mission' | 'recovering' | 'dead' | 'left';
export type Assignment = 'rest' | 'train' | 'rumors' | 'labor' | 'scout' | 'build';

export interface Member {
  id: string;
  name: string;
  profession: ProfessionId;
  attrs: Attributes;
  level: number;
  xp: number;
  health: number; // 0-100, below 100 = wounded
  fatigue: number; // 0-100
  morale: number; // 0-100
  loyalty: number; // 0-100
  wage: number; // crowns per week
  traits: string[];
  loadout: Loadout;
  status: MemberStatus;
  missionId?: string;
  assignment: Assignment;
  trainAttr?: Attribute;
  trainProgress: number;
  scoutTarget?: string; // contract id
  weeksUnpaid: number;
  joinedWeek: number;
  missions: number;
  record: string[]; // service record: notable deeds
  diedWeek?: number;
  causeOfDeath?: string;
}

export interface Recruit {
  member: Member;
  signOn: number;
  expiresWeek: number;
  gear: string[]; // item def ids granted on hire
}

export interface PhaseDef {
  name: string;
  approaches: Approach[];
  // relative difficulty multiplier for this phase
  weight: number;
  // physical danger multiplier: how many wounds a failure causes
  danger: number;
  text: string;
}

export interface ContractEffect {
  standing?: Partial<Record<FactionId, number>>;
  clocks?: Partial<Record<ClockId, number>>;
  heat?: number;
  renown?: number;
  influence?: number;
}

export interface HiddenTag {
  candidates: TagId[]; // rumored possibilities, one of which is the true tag
  trueTag: TagId;
  revealed: boolean;
}

export interface Contract {
  id: string;
  templateId: string;
  title: string;
  patron: FactionId;
  type: string;
  description: string;
  region: string;
  travelWeeks: number;
  threat: number; // 1-10
  tags: TagId[]; // known tags
  hidden: HiddenTag[];
  phases: PhaseDef[];
  reward: number;
  materials: Partial<Record<MaterialId, number>>;
  onSuccess: ContractEffect;
  onFailure: ContractEffect;
  postedWeek: number;
  expiresWeek: number;
  contestedBy?: RivalId;
  story?: boolean;
  minSquad: number;
  maxSquad: number;
}

export type PhaseResult = 'strong' | 'success' | 'fail' | 'severe';
export type OutcomeTier = 'Triumph' | 'Success' | 'Costly Success' | 'Failure' | 'Disaster' | 'Withdrawn';

export interface PhaseLog {
  phase: string;
  approach: Approach;
  chance: number;
  result: PhaseResult;
  lines: string[];
  story?: string[]; // narrative of how the phase played out
  lead?: string; // member id who led the phase
}

export interface JournalSection {
  title: string;
  lines: string[];
}

export interface MissionReport {
  tier: OutcomeTier;
  phases: PhaseLog[];
  casualties: string[]; // member ids who died
  wounded: { id: string; amount: number }[];
  reward: number;
  materials: Partial<Record<MaterialId, number>>;
  summary: string[];
  outbound?: JournalSection; // the road there
  homeward?: JournalSection; // the road back
}

export interface Mission {
  id: string;
  contract: Contract;
  memberIds: string[];
  approaches: Approach[]; // chosen approach per phase
  retreatOnCritical: boolean;
  supplies: number;
  dispatchedWeek: number;
  arriveWeek: number;
  returnWeek: number;
  report?: MissionReport;
  // changes made by decisions on the road
  extraTags?: TagId[];
  chainStart?: number; // difficulty multiplier for the first phase
  difficultyMult?: number; // multiplier for every phase
  bonusReward?: number;
  fieldLog?: string[]; // what happened on the road, for the journal
  fieldWeeks?: number[]; // weeks a field decision already happened
  // equipment consumed snapshot not needed: consumables are removed on dispatch
}

export interface Faction {
  id: FactionId;
  standing: number; // -100..100
}

export interface Rival {
  id: RivalId;
  name: string;
  crowns: number;
  renown: number;
  strength: number; // abstract roster power
  aggression: number; // 0-1
  contractsWon: number;
  plan?: RivalPlan;
}

export interface RivalPlan {
  kind: 'contract' | 'smear' | 'poach' | 'none';
  target?: string; // contract id or member id
  revealed: boolean;
  countered: boolean;
}

export type ClockId = 'arrears' | 'leverage' | 'unrest' | 'cointrust';

export interface Loan {
  lender: FactionId;
  principal: number;
  weeklyRate: number;
  paymentDue: number; // amount due at next due week
  dueWeek: number;
  missed: number;
}

export interface EventChoice {
  label: string;
  detail?: string; // shown cost summary
  // requirements to choose
  requires?: { crowns?: number; supplies?: number; influence?: number; intel?: number };
  // optional skill check: best member at this approach
  check?: { approach: Approach; difficulty: number };
  effects: EventEffect;
  failEffects?: EventEffect;
  resultText: string;
  failText?: string;
  // continue the conversation at this node instead of closing the event
  next?: string;
  failNext?: string;
  // only show this choice if a fact is set / not set
  ifFlag?: FactId;
  ifNotFlag?: FactId;
}

export interface EventNode {
  text: string;
  choices: EventChoice[];
  speaker?: string;
}

export interface EventEffect extends ContractEffect {
  crowns?: number;
  supplies?: number;
  intel?: number;
  morale?: number; // all members
  loyalty?: number;
  unlockContract?: string; // template id, added to the board
  flag?: FactId;
  npc?: { id: NpcId; attitude?: number; status?: NpcStatus };
  rivalRenown?: number;
  rivalAggression?: number;
  grantItem?: string;
  freeRecruit?: boolean;
  wounds?: number; // wounds dealt to a random member
  revealContract?: string; // template id: reveal one hidden tag on that board contract
  member?: { morale?: number; loyalty?: number; health?: number; fatigue?: number; leaves?: boolean; wage?: number; xp?: number; trait?: string; removeTrait?: string };
  mission?: MissionEffect;
  log?: string; // line added to the squad's journal
}

export interface MissionEffect {
  tag?: TagId; // the squad will face this too
  chain?: number; // first phase difficulty multiplier
  difficulty?: number; // all phases difficulty multiplier
  delay?: number; // weeks added to the trip
  reward?: number; // extra crowns on success
  reveal?: boolean; // reveal all hidden tags
  fatigue?: number; // to every squad member
  wounds?: number; // to one squad member
  withdraw?: boolean; // abandon the job and come home
  approaches?: 'best'; // re-plan with what is now known
  supplies?: number; // change to guild supplies (bought or found on the road)
}

export interface GameEvent {
  uid: string;
  defId: string;
  title: string;
  text: string;
  choices: EventChoice[];
  week: number;
  speaker?: string;
  // branching conversation state
  nodes?: Record<string, EventNode>;
  node?: string;
  transcript?: { choice: string; reply: string }[];
  memberId?: string; // member this event is about
  missionId?: string; // squad in the field this event is about
}

export type DispatchKind = 'story' | 'mission' | 'economy' | 'politics' | 'roster' | 'rival' | 'warning' | 'info' | 'lore' | 'crier';

export interface Dispatch {
  id: string;
  week: number;
  kind: DispatchKind;
  title: string;
  body: string[];
  missionId?: string;
}

export interface LedgerEntry {
  week: number;
  income: Record<string, number>;
  expenses: Record<string, number>;
  balance: number;
}

export type GameOverReason = 'bankrupt' | 'charter' | 'collapse';

export interface GameState {
  version: number;
  seed: number;
  rng: number; // rng state
  week: number; // 1-based
  crowns: number;
  supplies: number;
  intel: number;
  influence: number;
  renown: number;
  heat: number;
  materials: Record<MaterialId, number>;
  members: Member[];
  recruits: Recruit[];
  items: ItemInstance[]; // owned item instances (equipped or in store)
  board: Contract[];
  missions: Mission[];
  factions: Record<FactionId, Faction>;
  rivals: Record<RivalId, Rival>;
  clocks: Record<ClockId, number>; // 0-100
  loans: Loan[];
  market: Record<string, number>; // price multipliers for supplies/materials/items
  stock: string[]; // item def ids for sale this week
  pendingEvents: GameEvent[];
  dispatches: Dispatch[];
  ledger: LedgerEntry[];
  flags: Partial<Record<FactId, boolean>>;
  npcs: Record<NpcId, { status: NpcStatus; attitude: number }>;
  facilities: Record<FacilityId, number>; // current level of each building
  construction?: { id: FacilityId; toLevel: number; progress: number; weeks: number };
  craftQueue: string[]; // recipe ids waiting to be made
  council: CouncilState;
  codex: { unlocked: string[]; fresh: string[] };
  crierSeen: string[];
  crierRecent: string[];
  tutorial: { enabled: boolean; done: string[]; counters: Record<string, number>; finished?: boolean };
  insolventWeeks: number;
  charterWeeks: number; // consecutive weeks with the charter in danger
  eventWeeks: Record<string, number>; // last week each event fired
  weekBook: { income: Record<string, number>; expenses: Record<string, number> };
  history: Mission[]; // completed missions (most recent last)
  petitioned: string[]; // faction ids petitioned this week
  gameOver?: { reason: GameOverReason; week: number; text: string };
  nextId: number;
  difficulty: 'standard';
}

export type Stance = -1 | 0 | 1; // against, undecided, for

export interface AgendaItem {
  id: string; // decree id
  base: Record<FactionId, Stance>; // where each faction started
  positions: Record<FactionId, Stance>; // where they stand now
  player: Stance; // the guild's declared position
}

export interface CouncilState {
  agenda: AgendaItem[];
  voteWeek?: number;
  active: { id: string; untilWeek: number }[];
  lobbied: Partial<Record<FactionId, number>>; // week each faction was last lobbied
  history: { week: number; id: string; passed: boolean; votesFor: number; votesAgainst: number; player: Stance }[];
}
