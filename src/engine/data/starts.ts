// How each campaign begins: who paid for the charter, and the state of Varrow
// on the day it was sealed. Rolled from the campaign seed, so a seed always
// gives the same start. The story stays the same; scenes react to the start.
import type { FactionId, GameState, ProfessionId } from '../core/types';

export type BackerId = 'veterans' | 'merchant' | 'coop' | 'college';

export interface Backer {
  id: BackerId;
  name: string;
  text: string;
  roster: { profession: ProfessionId; trait?: string }[];
  crowns: number;
  loan: number;
  supplies?: number;
  reagents?: number;
  standing?: Partial<Record<FactionId, number>>;
}

export const BACKERS: Record<BackerId, Backer> = {
  veterans: {
    id: 'veterans',
    name: 'Old soldiers',
    text: 'Four veterans of the lost war pooled their back pay to buy the charter. They can fight, but the Weighhouse lent them less than it lends most people, and they spent half of it on a sign.',
    roster: [{ profession: 'vanguard', trait: 'veteran' }, { profession: 'skirmisher' }, { profession: 'marksman', trait: 'veteran' }, { profession: 'scout' }],
    crowns: 200,
    loan: 650,
    standing: { exchequer: 5 },
  },
  merchant: {
    id: 'merchant',
    name: 'A Weighhouse merchant',
    text: 'A wool merchant on the Weighhouse put up the money, on easy terms and a large note. He expects his wagons to come first, and the Lower Town has noticed whose name is on your charter.',
    roster: [{ profession: 'vanguard' }, { profession: 'skirmisher' }, { profession: 'scout' }, { profession: 'envoy' }],
    crowns: 420,
    loan: 1000,
    standing: { weighhouse: 12, lowertown: -5 },
  },
  coop: {
    id: 'coop',
    name: 'A Lower Town co-op',
    text: 'The porters and small trades of the Lower Town clubbed together for the charter. They expect the guild to remember who paid for it, and the Exchequer expects trouble.',
    roster: [{ profession: 'vanguard', trait: 'lower_born' }, { profession: 'skirmisher', trait: 'lower_born' }, { profession: 'envoy' }, { profession: 'scout' }],
    crowns: 240,
    loan: 750,
    supplies: 55,
    standing: { lowertown: 15, exchequer: -8 },
  },
  college: {
    id: 'college',
    name: 'Disgraced Arcanists',
    text: 'Two Arcanists thrown out of the college over a fire nobody likes to discuss bought the charter with what they had left. The Assay Office remembers the fire.',
    roster: [{ profession: 'arcanist' }, { profession: 'chaplain' }, { profession: 'vanguard' }, { profession: 'scout' }],
    crowns: 300,
    loan: 800,
    reagents: 6,
  },
};

export type CircumstanceGroup = 'debt' | 'market' | 'politics' | 'rivals';

export interface Circumstance {
  id: string;
  group: CircumstanceGroup;
  title: string;
  text: string;
  apply: (s: GameState) => void;
}

const decree = (s: GameState, id: string) => s.council.active.push({ id, untilWeek: 12 });

export const CIRCUMSTANCES: Circumstance[] = [
  // ---- the Debt ----
  {
    id: 'coin_crisis',
    group: 'debt',
    title: 'A coin nobody trusts',
    text: 'The Crown Penny has been clipped so often that the market weighs it instead of counting it. Prices are high.',
    apply: (s) => void (s.clocks.cointrust = 40),
  },
  {
    id: 'near_riot',
    group: 'debt',
    title: 'A city on edge',
    text: 'The Lower Town is close to rioting before your guild has even opened its doors.',
    apply: (s) => void (s.clocks.unrest = 46),
  },
  {
    id: 'bank_grip',
    group: 'debt',
    title: "The bank's grip",
    text: "Ostrander's already holds the river tolls and half the Crown's warrants, and the Crown is behind on its payments.",
    apply: (s) => {
      s.clocks.leverage = 40;
      s.clocks.arrears = 40;
    },
  },
  {
    id: 'quiet_spring',
    group: 'debt',
    title: 'A quiet spring',
    text: "For once the Crown is nearly up to date and the streets are calm. It won't last, but it's a start.",
    apply: (s) => {
      s.clocks.arrears = 22;
      s.clocks.unrest = 24;
    },
  },
  // ---- the market ----
  {
    id: 'iron_short',
    group: 'market',
    title: 'Iron is scarce',
    text: 'The Kell foundries are idle, and iron costs half as much again as it should.',
    apply: (s) => void (s.marketBias = { ...s.marketBias, iron: 1.5 }),
  },
  {
    id: 'reagent_glut',
    group: 'market',
    title: 'Reagents are cheap',
    text: 'A good harvest in the Saltfens has flooded the apothecaries with reagents.',
    apply: (s) => void (s.marketBias = { ...s.marketBias, reagents: 0.7 }),
  },
  {
    id: 'grain_dear',
    group: 'market',
    title: 'Bread is dear',
    text: 'The harvest was poor, and supplies cost more than usual all year.',
    apply: (s) => void (s.marketBias = { ...s.marketBias, supplies: 1.25 }),
  },
  {
    id: 'timber_cheap',
    group: 'market',
    title: 'Timber is cheap',
    text: 'The crown forests were sold to the bank, and the bank is cutting them down as fast as it can.',
    apply: (s) => void (s.marketBias = { ...s.marketBias, timber: 0.65 }),
  },
  // ---- politics ----
  {
    id: 'levy_in_force',
    group: 'politics',
    title: 'The grain levy is in force',
    text: 'The Council passed a levy on grain last season, and it runs until the summer.',
    apply: (s) => decree(s, 'grain_levy'),
  },
  {
    id: 'soldiers_on_docks',
    group: 'politics',
    title: 'Soldiers on the docks',
    text: 'Martial law on the docks was declared after the last riot, and it has not been lifted yet.',
    apply: (s) => decree(s, 'martial_law'),
  },
  {
    id: 'exchequer_doubts',
    group: 'politics',
    title: 'The Exchequer has doubts',
    text: 'The clerk who sealed your charter argued against it, and the Exchequer has not forgotten.',
    apply: (s) => void (s.factions.exchequer.standing -= 10),
  },
  {
    id: 'bank_courting',
    group: 'politics',
    title: 'The bank is courting guilds',
    text: "Ostrander's needs more collectors than it has, and its factors are friendly to anyone with a charter.",
    apply: (s) => void (s.factions.ostranders.standing += 10),
  },
  {
    id: 'friends_below',
    group: 'politics',
    title: 'Friends below the walls',
    text: 'One of your founders grew up on the docks, and the Lower Town is inclined to like you.',
    apply: (s) => void (s.factions.lowertown.standing += 10),
  },
  // ---- the rivals ----
  {
    id: 'hobbs_hungry',
    group: 'rivals',
    title: 'The Hobbs are hungry',
    text: 'Hobb & Daughters lost a big client last year, and they are taking every job they can find.',
    apply: (s) => {
      s.rivals.hobbs.aggression = 0.6;
      s.rivals.hobbs.renown = 24;
    },
  },
  {
    id: 'hobbs_busy',
    group: 'rivals',
    title: 'The Hobbs are busy elsewhere',
    text: 'Hobb & Daughters have a large contract on the coast, and they are not paying much attention to Varrow.',
    apply: (s) => void (s.rivals.hobbs.aggression = 0.25),
  },
  {
    id: 'hobbs_usual',
    group: 'rivals',
    title: 'Business as usual',
    text: 'Hobb & Daughters are doing what they always do, which is quite enough.',
    apply: () => undefined,
  },
];

export const CIRCUMSTANCE_BY_ID: Record<string, Circumstance> = Object.fromEntries(CIRCUMSTANCES.map((c) => [c.id, c]));
export const CIRCUMSTANCE_GROUPS: CircumstanceGroup[] = ['debt', 'market', 'politics', 'rivals'];

export const hasStart = (s: GameState, id: string) => !!s.start?.circumstances.includes(id);
