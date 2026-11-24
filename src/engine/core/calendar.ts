import { seasonOf } from '../data/events';
import type { GameState } from './types';

export function season(state: GameState) {
  return seasonOf(state.week);
}

export function dateLabel(week: number): string {
  const year = Math.floor((week - 1) / 48) + 1;
  const wInSeason = ((week - 1) % 12) + 1;
  return `${seasonOf(week)} · Week ${wInSeason} · Year ${year}`;
}
