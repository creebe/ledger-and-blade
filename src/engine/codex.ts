// Codex discovery and the weekly street talk.
import { CODEX, CRIER, JORY } from './data/codex';
import { chance, weighted } from './rng';
import type { GameState } from './types';
import { addDispatch } from './world';
import { legendTalk } from './legends';

export function freshCodex(s?: GameState): GameState['codex'] {
  return { unlocked: CODEX.filter((e) => e.category === 'Common knowledge' || (s ? e.unlock(s) : false)).map((e) => e.id), fresh: [] };
}

/** Unlock any entries whose conditions are now met. Returns their titles. */
export function discoverLore(s: GameState): string[] {
  if (!s.codex) return [];
  const found: string[] = [];
  for (const e of CODEX) {
    if (s.codex.unlocked.includes(e.id)) continue;
    if (e.unlock(s)) {
      s.codex.unlocked.push(e.id);
      s.codex.fresh.push(e.id);
      found.push(e.title);
    }
  }
  if (found.length) addDispatch(s, 'lore', `New in the Codex: ${found.join(', ')}`, ['Open the Journal to read it.']);
  return found;
}

/** One line of street talk a week, reflecting the state of the city. */
/** About one week in four, Jory has something to say. */
export function weeklyJory(s: GameState) {
  if (s.npcs.jory?.status !== 'alive' || !chance(s, 0.25)) return;
  const recent = (s.crierRecent ??= []);
  const pool = JORY.filter((c) => !recent.includes(c.id) && (!c.when || c.when(s)));
  if (!pool.length) return;
  const line = weighted(s, pool.map((c) => ({ item: c, weight: c.weight ?? 1 })));
  recent.push(line.id);
  if (recent.length > 10) recent.shift();
  addDispatch(s, 'info', 'In the hall', [line.text]);
}

export function weeklyCrier(s: GameState) {
  const legend = chance(s, 0.3) ? legendTalk(s) : undefined;
  if (legend) {
    addDispatch(s, 'crier', 'Heard in Varrow', [legend]);
    return;
  }
  const seen = (s.crierSeen ??= []);
  const recent = (s.crierRecent ??= []);
  const pool = CRIER.filter((c) => !(c.once && seen.includes(c.id)) && !recent.includes(c.id) && (!c.when || c.when(s)));
  if (!pool.length) return;
  const line = weighted(s, pool.map((c) => ({ item: c, weight: c.weight ?? 1 })));
  if (!seen.includes(line.id)) seen.push(line.id);
  recent.push(line.id);
  if (recent.length > 6) recent.shift();
  addDispatch(s, 'crier', 'Heard in Varrow', [line.text]);
}
