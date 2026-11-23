import type { ClockId, FactionId, RivalId } from '../types';

export interface FactionDef {
  id: FactionId;
  name: string;
  short: string;
  color: string;
  sigil: string;
  who: string;
  stance: string;
  perks: string;
}

export const FACTIONS: Record<FactionId, FactionDef> = {
  exchequer: {
    id: 'exchequer',
    name: 'The Exchequer',
    short: 'Exchequer',
    color: '#7a2e2e',
    sigil: '♛',
    who: "The Crown's treasury and officers, effectively the government of the realm.",
    stance: 'It is desperate to keep paying the bank without losing the realm, and it will squeeze anyone to manage it.',
    perks: 'Holds your charter. At −60 or below, the charter is at risk. Heat falls faster when standing is high.',
  },
  weighhouse: {
    id: 'weighhouse',
    name: 'The Weighhouse',
    short: 'Weighhouse',
    color: '#8a6a1f',
    sigil: '⚖',
    who: "Merchants who control the city's official scales and measures. They hold your guild's loan.",
    stance: "Divided. Some members act as Ostrander's local agents and profit from it.",
    perks: 'Better standing lowers market prices (up to 10%). Your loan is owed to them.',
  },
  ostranders: {
    id: 'ostranders',
    name: "Ostrander's",
    short: "Ostrander's",
    color: '#2e4a6b',
    sigil: '⛁',
    who: 'The foreign bank the realm owes. It has offices in Varrow and agents everywhere.',
    stance: 'It is the Debt.',
    perks: 'Pays the best for collection work. High standing makes the Lower Town hate you.',
  },
  lowertown: {
    id: 'lowertown',
    name: 'The Lower Town',
    short: 'Lower Town',
    color: '#4f6b3a',
    sigil: '⚒',
    who: "Varrow's laborers, porters and small trades, crowded below the walls.",
    stance: 'They pay the taxes that service the debt, and they are close to riot.',
    perks: 'Better standing means cheaper and better recruits. The Unrest clock rises when they are angry.',
  },
};

export const RIVALS: Record<RivalId, { name: string; who: string; color: string; sigil: string }> = {
  hobbs: {
    name: 'Hobb & Daughters',
    who: "A family firm of debt collectors on retainer to Ostrander's. Old Marta Hobb runs it with her three daughters, and the bank pays them very well.",
    color: '#5b3b5e',
    sigil: '⚔',
  },
};

export const CLOCKS: Record<ClockId, { name: string; description: string; bad: 'high' | 'low' }> = {
  arrears: { name: 'Arrears', description: 'How far behind the Crown is on its payments to the bank.', bad: 'high' },
  leverage: { name: 'Leverage', description: "How much of the realm Ostrander's owns: offices, tolls, castles.", bad: 'high' },
  unrest: { name: 'Unrest', description: 'How close the Lower Town is to open revolt.', bad: 'high' },
  cointrust: { name: 'Coin Trust', description: 'Whether people still trust the Crown Penny. When it falls, prices rise.', bad: 'low' },
};

export const REGIONS: Record<string, { name: string; travel: number; description: string }> = {
  varrow: { name: 'Varrow', travel: 0, description: 'The capital.' },
  drovers: { name: "Drover's Road", travel: 1, description: 'Cattle road through the hills east of the city.' },
  harrowmere: { name: 'Harrowmere', travel: 1, description: 'A lake town with an old bridge.' },
  kell: { name: 'Kell Mines', travel: 1, description: 'Silver workings in the northern hills, half of them flooded.' },
  saltfens: { name: 'The Saltfens', travel: 2, description: 'Marshes along the estuary, rich in reagents and fever.' },
  anselm: { name: 'Port Anselm', travel: 2, description: "The coast port where Ostrander's ships take on the Crown's silver." },
};
