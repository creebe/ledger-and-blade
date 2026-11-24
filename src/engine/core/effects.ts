import type { ClockId, ContractEffect, FactionId, GameState } from './types';
import { clamp } from './util';

export function earn(state: GameState, category: string, amount: number) {
  if (amount === 0) return;
  state.crowns += amount;
  state.weekBook.income[category] = (state.weekBook.income[category] ?? 0) + amount;
}

export function spend(state: GameState, category: string, amount: number) {
  if (amount === 0) return;
  state.crowns -= amount;
  state.weekBook.expenses[category] = (state.weekBook.expenses[category] ?? 0) + amount;
}

/** Record that the player did something (drives Guildmaster's Notes). */
export function track(state: GameState, key: string) {
  if (!state.tutorial) return;
  state.tutorial.counters[key] = (state.tutorial.counters[key] ?? 0) + 1;
}

export function applyStanding(state: GameState, f: FactionId, delta: number) {
  state.factions[f].standing = clamp(Math.round(state.factions[f].standing + delta), -100, 100);
}

export function applyClock(state: GameState, c: ClockId, delta: number) {
  state.clocks[c] = clamp(state.clocks[c] + delta, 0, 100);
}

export function applyContractEffect(state: GameState, e: ContractEffect, lines?: string[]) {
  for (const [f, v] of Object.entries(e.standing ?? {})) {
    applyStanding(state, f as FactionId, v!);
    lines?.push(`${v! > 0 ? '+' : ''}${v} standing with ${factionName(f as FactionId)}`);
  }
  for (const [c, v] of Object.entries(e.clocks ?? {})) applyClock(state, c as ClockId, v!);
  if (e.heat) {
    state.heat = clamp(state.heat + e.heat, 0, 100);
    lines?.push(`Heat ${e.heat > 0 ? '+' : ''}${e.heat}`);
  }
  if (e.renown) {
    state.renown = Math.max(0, state.renown + e.renown);
    lines?.push(`Renown ${e.renown > 0 ? '+' : ''}${e.renown}`);
  }
  if (e.influence) {
    state.influence = Math.max(0, state.influence + e.influence);
    lines?.push(`Influence ${e.influence > 0 ? '+' : ''}${e.influence}`);
  }
  if (e.loan && state.loans[0]) {
    state.loans[0].principal = Math.max(0, state.loans[0].principal + e.loan);
    lines?.push(`Loan ${e.loan > 0 ? '+' : '−'}${Math.abs(e.loan)} crowns`);
  }
}

const FACTION_NAMES: Record<FactionId, string> = {
  exchequer: 'the Exchequer',
  weighhouse: 'the Weighhouse',
  ostranders: "Ostrander's",
  lowertown: 'the Lower Town',
  oda: "Saint Oda's",
  fourteen: 'the Fourteen',
  mudlarks: 'the Mudlarks',
};

export const factionName = (f: FactionId) => FACTION_NAMES[f];
