// The Council of Varrow: decrees, who backs them, and what they change.
// activeMods() is pure (types and data only) so world/turn code can read it
// without import cycles.
import type { ClockId, CouncilFaction, FactionId, GameState, Stance } from '../types';
export type { Stance };

export const SEATS: Record<CouncilFaction, number> = { exchequer: 3, weighhouse: 2, ostranders: 2, lowertown: 2 };
export const SEAT_NOTE: Record<CouncilFaction, string> = {
  exchequer: 'Crown officers',
  weighhouse: 'Merchant aldermen',
  ostranders: 'Seats bought with debt',
  lowertown: 'Porters and trades',
};

export interface DecreeMods {
  supplyPrice?: number; // multiplier
  prices?: number; // multiplier on all market prices
  loanRate?: number; // multiplier on the guild's loan interest
  clocks?: Partial<Record<ClockId, number>>; // weekly drift while active
  heatDecay?: number; // extra heat lost per week
  upkeep?: number; // extra weekly cost for the guild
  rewardPatron?: Partial<Record<FactionId, number>>; // contract pay multiplier by patron
  shadyReward?: number; // multiplier on smuggling/heist pay
  shadyHeat?: number; // multiplier on heat from shady work
}

export interface DecreeDef {
  id: string;
  title: string;
  sponsor: CouncilFaction;
  text: string;
  effects: string[]; // what happens if it passes (player-facing)
  positions: Record<CouncilFaction, Stance>;
  weight: (s: GameState) => number; // how likely it is to reach the agenda
  mods?: DecreeMods;
  once?: Partial<Record<ClockId, number>>; // immediate clock change on passing
  onceHeat?: number;
}

export const DECREES: DecreeDef[] = [
  {
    id: 'grain_levy',
    title: 'The Grain Levy',
    sponsor: 'exchequer',
    text: 'A tax on every sack of grain entering Varrow, paid straight to the debt.',
    effects: ['Supplies cost 30% more.', 'Arrears fall every week.', 'Unrest rises every week.'],
    positions: { exchequer: 1, weighhouse: 0, ostranders: 1, lowertown: -1 },
    weight: (s) => 1 + s.clocks.arrears / 40,
    mods: { supplyPrice: 1.3, clocks: { arrears: -1, unrest: 0.6 } },
  },
  {
    id: 'debasement',
    title: 'Debasement of the Crown Penny',
    sponsor: 'exchequer',
    text: 'Melt the coinage down and strike it lighter. The Crown pays its debts in thinner silver.',
    effects: ['Arrears −10 at once.', 'Coin Trust −15 at once, so market prices rise.'],
    positions: { exchequer: 1, weighhouse: -1, ostranders: -1, lowertown: 0 },
    weight: (s) => (s.clocks.arrears > 40 ? 1.5 : 0.6),
    once: { arrears: -10, cointrust: -15 },
  },
  {
    id: 'collectors_license',
    title: "Collectors' Licenses",
    sponsor: 'ostranders',
    text: 'Licensed collectors may enter homes and workshops to seize pledged goods, with the watch standing by.',
    effects: ["Ostrander's contracts pay 25% more.", 'Leverage rises every week.', 'The Lower Town hates it.'],
    positions: { exchequer: 0, weighhouse: 1, ostranders: 1, lowertown: -1 },
    weight: (s) => 0.8 + s.clocks.leverage / 50,
    mods: { rewardPatron: { ostranders: 1.25 }, clocks: { leverage: 0.5, unrest: 0.3 } },
  },
  {
    id: 'usury_cap',
    title: 'The Usury Cap',
    sponsor: 'lowertown',
    text: 'No lender in Varrow may charge more than a crown in twenty a year.',
    effects: ["Your loan's interest is halved.", "Leverage grows more slowly; Ostrander's will remember who voted for it."],
    positions: { exchequer: 0, weighhouse: -1, ostranders: -1, lowertown: 1 },
    weight: (s) => 0.6 + s.clocks.unrest / 60,
    mods: { loanRate: 0.5, clocks: { leverage: -0.3 } },
  },
  {
    id: 'martial_law',
    title: 'Martial Law on the Docks',
    sponsor: 'exchequer',
    text: 'Curfew below the walls, soldiers at the river chain, and searches without warrant.',
    effects: ['Heat falls 2 faster each week.', 'Smuggling and heists pay 30% more, but draw twice the Heat.', 'Unrest +5 at once.'],
    positions: { exchequer: 1, weighhouse: 1, ostranders: 0, lowertown: -1 },
    weight: (s) => (s.clocks.unrest > 40 ? 1.6 : 0.5),
    mods: { heatDecay: 2, shadyReward: 1.3, shadyHeat: 2 },
    once: { unrest: 5 },
  },
  {
    id: 'guild_tax',
    title: 'The Chartered Guilds Tax',
    sponsor: 'exchequer',
    text: 'Every chartered guild pays a weekly due toward the debt. Including yours.',
    effects: ['Your guild pays 10 crowns a week.', 'Arrears fall a little every week.'],
    positions: { exchequer: 1, weighhouse: -1, ostranders: 1, lowertown: 0 },
    weight: (s) => 0.7 + s.clocks.arrears / 80,
    mods: { upkeep: 10, clocks: { arrears: -0.5 } },
  },
  {
    id: 'bread_dole',
    title: 'The Bread Dole',
    sponsor: 'lowertown',
    text: 'The Crown buys grain and hands out a loaf a day in the Lower Town.',
    effects: ['Supplies cost 15% less.', 'Unrest falls every week.', 'Arrears rise every week.'],
    positions: { exchequer: -1, weighhouse: -1, ostranders: -1, lowertown: 1 },
    weight: (s) => 0.5 + s.clocks.unrest / 40,
    mods: { supplyPrice: 0.85, clocks: { unrest: -1, arrears: 0.5 } },
  },
  {
    id: 'toll_relief',
    title: 'Toll Relief on the River',
    sponsor: 'weighhouse',
    text: "Buy back the river tolls from Ostrander's, with Crown land as payment.",
    effects: ['Market prices fall 10%.', 'Leverage falls every week, while Arrears rise.'],
    positions: { exchequer: 0, weighhouse: 1, ostranders: -1, lowertown: 1 },
    weight: () => 0.8,
    mods: { prices: 0.9, clocks: { leverage: -0.6, arrears: 0.4 } },
  },
];

export const DECREE_BY_ID: Record<string, DecreeDef> = Object.fromEntries(DECREES.map((d) => [d.id, d]));

/** All modifiers from decrees currently in force. */
export function activeMods(s: GameState): DecreeMods[] {
  return (s.council?.active ?? []).filter((a) => a.untilWeek >= s.week).map((a) => DECREE_BY_ID[a.id]?.mods ?? {});
}

export function modProduct(s: GameState, key: 'supplyPrice' | 'prices' | 'loanRate' | 'shadyReward' | 'shadyHeat'): number {
  return activeMods(s).reduce((p, m) => p * (m[key] ?? 1), 1);
}

export function modSum(s: GameState, key: 'heatDecay' | 'upkeep'): number {
  return activeMods(s).reduce((t, m) => t + (m[key] ?? 0), 0);
}
