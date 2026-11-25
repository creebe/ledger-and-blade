import { freshCouncil } from '../politics/council';
import { freshTutorial } from '../story/tutorial';
import { freshCodex } from '../story/codex';
import { freshFacilities } from '../economy/buildings';
import type { GameState } from './types';
import { freshNpcs } from '../data/facts';
import { freshFactions } from '../politics/factions';
import { freshRivals } from '../rivals/rival';
import { freshDates, scheduleDates } from '../story/dates';
import { migrateToExpeditions } from '../expeditions/migrate';

export const SAVE_VERSION = 14;

/** Upgrade older saves in place. Returns null if the save can't be used. */
export function migrateSave(g: GameState): GameState | null {
  if (!g || typeof g.week !== 'number') return null;
  if (g.version === 1) {
    for (const m of g.members) m.record = m.record ?? [];
    for (const r of g.recruits) r.member.record = r.member.record ?? [];
    for (const e of g.pendingEvents) e.transcript = e.transcript ?? [];
    g.version = 2;
  }
  if (g.version === 2) {
    g.npcs = freshNpcs();
    g.version = 3;
  }
  if (g.version === 3) {
    g.facilities = freshFacilities();
    g.craftQueue = [];
    g.version = 4;
  }
  if (g.version === 4) {
    g.council = freshCouncil();
    g.version = 5;
  }
  if (g.version === 5) {
    g.tutorial = freshTutorial();
    g.version = 6;
  }
  if (g.version === 6) {
    g.codex = freshCodex(g);
    g.crierSeen = [];
    g.crierRecent = [];
    g.version = 7;
  }
  if (g.version === 7) {
    // rewards were paid automatically before: everything done counts as collected
    g.tutorial.claimed = [...g.tutorial.done];
    g.version = 8;
  }
  if (g.version === 8) {
    // the wider cast: new characters, factions met in the story, more rivals
    g.npcs = { ...freshNpcs(), ...g.npcs };
    g.factions = { ...freshFactions(), ...g.factions };
    const fresh = freshRivals();
    g.rivals = { ...fresh, ...g.rivals, hobbs: { ...g.rivals.hobbs, active: true } };
    g.version = 9;
  }
  if (g.version === 9) {
    // campaigns before varied starts began like a merchant-backed guild
    g.start = { backer: 'merchant', circumstances: [] };
    g.version = 10;
  }
  if (g.version === 10) {
    for (const r of Object.values(g.rivals)) r.feud = r.feud ?? 0;
    g.version = 11;
  }
  if (g.version === 11) {
    // Dates: older campaigns get their first one from the current week
    g.dates = freshDates();
    scheduleDates(g);
    g.version = 12;
  }
  if (g.version === 12) {
    // expeditions: contracts are walked as trips to real sites (docs/EXPEDITIONS-API.md)
    migrateToExpeditions(g);
    g.version = 13;
  }
  if (g.version === 13) {
    // bosses on every site: "the Kiln Engine is broken" becomes a list of sites whose boss is beaten
    const d = g.delve as typeof g.delve & { kilnBroken?: boolean };
    d.bossesBeaten = d.kilnBroken ? ['pellam'] : [];
    delete d.kilnBroken;
    // trips already sealed walked one zone outside Old Pellam: keep their logs matching their stored outcomes
    for (const ms of [...g.missions, ...g.history]) if (ms.setup && ms.setup.site !== 'pellam') ms.setup.oneZone = true;
    g.version = 14;
  }
  return g.version === SAVE_VERSION ? g : null;
}
