// Guild buildings and crafting: costs, effects and the weekly progress.
import { FACILITIES, FACILITY_IDS, RECIPE_BY_ID, RECIPES, type FacilityId, type Recipe } from './data/facilities';
import { ITEMS } from './data/items';
import { modSum } from './data/decrees';
import type { GameState, MaterialId } from './types';
import { addDispatch, addItem, clamp, earn, living, MATERIAL_INFO, materialPrice, spend } from './world';

export const BASE_UPKEEP = 15;

export const level = (s: GameState, id: FacilityId) => s.facilities?.[id] ?? FACILITIES[id].start;

export function freshFacilities(): Record<FacilityId, number> {
  return Object.fromEntries(FACILITY_IDS.map((id) => [id, FACILITIES[id].start])) as Record<FacilityId, number>;
}

/** Weekly upkeep of the hall and every building. */
export function upkeep(s: GameState): number {
  let total = BASE_UPKEEP + modSum(s, 'upkeep');
  for (const id of FACILITY_IDS) {
    const lv = level(s, id);
    for (let i = 0; i < lv; i++) total += FACILITIES[id].levels[i].upkeep;
  }
  return total;
}

// ---- effects read by the rest of the engine ----
export const rosterCap = (s: GameState) => [7, 7, 10, 13][level(s, 'hall')];
export const healBonus = (s: GameState) => [0, 5, 9, 13][level(s, 'infirmary')];
export const trainWeeks = (s: GameState) => [4, 3, 2, 2][level(s, 'yard')];
export const trainCost = (s: GameState) => [8, 8, 6, 4][level(s, 'yard')];
export const denIntel = (s: GameState) => [0, 1, 2, 2][level(s, 'den')];
export const revealCost = (s: GameState) => (level(s, 'den') >= 2 ? 1 : 2);
export const craftCapacity = (s: GameState, f: 'forge' | 'stillroom') => (f === 'forge' ? level(s, 'forge') : level(s, 'stillroom') * 2);

/** Weeks out and back for a trip, after stables. */
export function tripWeeks(s: GameState, travel: number): { out: number; back: number } {
  const st = level(s, 'stables');
  return { out: travel - (st >= 2 && travel >= 2 ? 1 : 0), back: Math.max(0, travel - (st >= 1 && travel >= 1 ? 1 : 0)) };
}

// ---- costs ----
export function hasMaterials(s: GameState, m: Partial<Record<MaterialId, number>>): MaterialId | undefined {
  return (Object.keys(m) as MaterialId[]).find((k) => s.materials[k] < (m[k] ?? 0));
}

function payMaterials(s: GameState, m: Partial<Record<MaterialId, number>>) {
  for (const k of Object.keys(m) as MaterialId[]) s.materials[k] -= m[k] ?? 0;
}

export function nextLevel(s: GameState, id: FacilityId) {
  return FACILITIES[id].levels[level(s, id)]; // index = current level → the next one
}

export function canBuild(s: GameState, id: FacilityId): string | undefined {
  const next = nextLevel(s, id);
  if (!next) return 'Fully built';
  if (s.construction) return `Already building the ${FACILITIES[s.construction.id].name}`;
  if (s.crowns < next.crowns) return `Need ${next.crowns} crowns`;
  const short = hasMaterials(s, next.materials);
  if (short) return `Need ${next.materials[short]} ${MATERIAL_INFO[short].name} (have ${s.materials[short]})`;
  return undefined;
}

export function startBuild(s: GameState, id: FacilityId): string | undefined {
  const err = canBuild(s, id);
  if (err) return err;
  const next = nextLevel(s, id);
  spend(s, 'Construction', next.crowns);
  payMaterials(s, next.materials);
  s.construction = { id, toLevel: level(s, id) + 1, progress: 0, weeks: next.weeks };
  addDispatch(s, 'economy', `Work begins on the ${FACILITIES[id].name}`, [`Level ${level(s, id) + 1} will take about ${next.weeks} weeks. Members assigned to Build speed it up.`]);
  return undefined;
}

export function buildersSpeed(s: GameState) {
  return 1 + living(s).filter((m) => m.status === 'idle' && m.assignment === 'build' && m.health >= 40).length * 0.5;
}

// ---- crafting ----
export function canCraft(s: GameState, r: Recipe): string | undefined {
  if (level(s, r.facility) < r.level) return `Needs ${FACILITIES[r.facility].name} level ${r.level}`;
  if (s.crowns < r.crowns) return `Need ${r.crowns} crowns`;
  const short = hasMaterials(s, r.materials);
  if (short) return `Need ${r.materials[short]} ${MATERIAL_INFO[short].name} (have ${s.materials[short]})`;
  return undefined;
}

export function queueCraft(s: GameState, recipeId: string): string | undefined {
  const r = RECIPE_BY_ID[recipeId];
  if (!r) return 'Unknown recipe';
  const err = canCraft(s, r);
  if (err) return err;
  spend(s, 'Crafting', r.crowns);
  payMaterials(s, r.materials);
  s.craftQueue.push(r.id);
  return undefined;
}

export function cancelCraft(s: GameState, index: number): string | undefined {
  const id = s.craftQueue[index];
  const r = RECIPE_BY_ID[id];
  if (!r) return 'Nothing to cancel';
  s.craftQueue.splice(index, 1);
  earn(s, 'Crafting refund', r.crowns);
  for (const k of Object.keys(r.materials) as MaterialId[]) s.materials[k] += r.materials[k] ?? 0;
  return undefined;
}

export function buyMaterial(s: GameState, m: MaterialId, n: number): string | undefined {
  const cost = materialPrice(s, m) * n;
  if (s.crowns < cost) return `Need ${cost} crowns`;
  spend(s, 'Materials', cost);
  s.materials[m] += n;
  s.market[m] = clamp((s.market[m] ?? 1) + n * 0.015, 0.6, 1.8);
  return undefined;
}

/** End-of-week progress on construction and crafting. */
export function weeklyWorkshop(s: GameState) {
  if (s.construction) {
    const c = s.construction;
    c.progress += buildersSpeed(s);
    for (const m of living(s).filter((x) => x.status === 'idle' && x.assignment === 'build')) m.fatigue = clamp(m.fatigue + 10, 0, 100);
    if (c.progress >= c.weeks) {
      s.facilities[c.id] = c.toLevel;
      s.construction = undefined;
      const lv = FACILITIES[c.id].levels[c.toLevel - 1];
      if (c.id === 'hall' && c.toLevel === 2) for (const m of living(s)) m.morale = clamp(m.morale + 5, 0, 100);
      if (c.id === 'hall' && c.toLevel === 3) s.renown += 3;
      for (const m of living(s)) if (m.assignment === 'build') m.assignment = 'rest';
      addDispatch(s, 'economy', `${FACILITIES[c.id].name} level ${c.toLevel} is finished`, [lv.effect, `Upkeep +${lv.upkeep} crowns a week.`]);
    }
  }
  if (s.craftQueue.length) {
    const made: string[] = [];
    const cap = { forge: craftCapacity(s, 'forge'), stillroom: craftCapacity(s, 'stillroom') };
    const remaining: string[] = [];
    for (const id of s.craftQueue) {
      const r = RECIPE_BY_ID[id];
      if (cap[r.facility] > 0) {
        cap[r.facility]--;
        for (let i = 0; i < (r.count ?? 1); i++) addItem(s, r.id);
        made.push(`${r.count && r.count > 1 ? `${r.count}× ` : ''}${ITEMS[r.id].name}`);
      } else remaining.push(id);
    }
    s.craftQueue = remaining;
    if (made.length) addDispatch(s, 'economy', 'From the workshop', [`Finished: ${made.join(', ')}.`, ...(remaining.length ? [`${remaining.length} more still waiting.`] : [])]);
  }
}

export { RECIPES, FACILITIES, FACILITY_IDS };
