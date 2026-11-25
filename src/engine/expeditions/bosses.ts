// Site bosses are beaten once. Kept apart from run.ts so the board can ask
// without importing the whole trip machinery.
import type { GameState } from '../core/types';
import type { SiteId } from './types';
import { routeOf } from './data/content';

/** Whether a site's boss has already been beaten. */
export function bossBeaten(s: GameState, site: SiteId): boolean {
  return !!s.delve?.bossesBeaten?.includes(site);
}

export function markBossBeaten(s: GameState, site: SiteId) {
  if (!s.delve.bossesBeaten.includes(site)) s.delve.bossesBeaten.push(site);
}

/** A squad not yet home whose route ends at this site's boss: the boss can only be fought by one squad at a time. */
export function bossBusy(s: GameState, site: SiteId): boolean {
  return s.missions.some((m) => !m.report && m.contract.expedition.site === site && routeOf(site, m.contract.expedition.length, m.contract.expedition.goal).includes('boss'));
}
