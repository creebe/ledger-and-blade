// Weeks, seasons and years. A year is 48 weeks: four seasons of 12.
import type { GameState } from './types';

export function seasonOf(week: number): 'Spring' | 'Summer' | 'Autumn' | 'Winter' {
  const w = (week - 1) % 48;
  return (['Spring', 'Summer', 'Autumn', 'Winter'] as const)[Math.floor(w / 12)];
}

export function season(state: GameState) {
  return seasonOf(state.week);
}

export function dateLabel(week: number): string {
  const year = Math.floor((week - 1) / 48) + 1;
  const wInSeason = ((week - 1) % 12) + 1;
  return `${seasonOf(week)} · Week ${wInSeason} · Year ${year}`;
}
