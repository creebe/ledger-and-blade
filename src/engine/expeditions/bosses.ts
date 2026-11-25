// Site bosses are beaten once. Kept apart from run.ts so the board can ask
// without importing the whole trip machinery.
import type { GameState } from '../core/types';
import type { SiteId } from './types';

/** Whether a site's boss has already been beaten. */
export function bossBeaten(s: GameState, site: SiteId): boolean {
  return !!s.delve?.bossesBeaten?.includes(site);
}

export function markBossBeaten(s: GameState, site: SiteId) {
  if (!s.delve.bossesBeaten.includes(site)) s.delve.bossesBeaten.push(site);
}
