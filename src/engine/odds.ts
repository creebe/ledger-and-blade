// Odds model: how a squad's members, gear and approach compare with a phase's
// difficulty. The same functions drive the planner preview and the actual
// resolution, so the odds the player sees are the odds that get rolled.
import { ITEMS } from './data/items';
import { PROFESSIONS } from './data/professions';
import { TAGS } from './data/tags';
import { TRAITS } from './data/traits';
import { seasonOf } from './data/events';
import type { Approach, Contract, Element, GameState, ItemDef, Member, PhaseDef, TagId } from './types';

export interface Part {
  label: string;
  value: number;
}

export interface ScoreResult {
  score: number;
  parts: Part[];
}

export function itemDef(state: GameState, uid: string | undefined): ItemDef | undefined {
  if (!uid) return undefined;
  const inst = state.items.find((i) => i.uid === uid);
  return inst ? ITEMS[inst.defId] : undefined;
}

export function memberItems(state: GameState, m: Member): ItemDef[] {
  const out: ItemDef[] = [];
  for (const uid of [m.loadout.weapon, m.loadout.armor, m.loadout.trinket, ...m.loadout.consumables]) {
    const d = itemDef(state, uid);
    if (d) out.push(d);
  }
  return out;
}

export interface SquadContext {
  tags: TagId[]; // effective (true or assumed) tags
  countered: Set<TagId>;
  members: Member[];
}

export function counteredTags(state: GameState, members: Member[], tags: TagId[]): Set<TagId> {
  const out = new Set<TagId>();
  const carried = new Set<string>();
  for (const m of members) for (const it of memberItems(state, m)) carried.add(it.id);
  for (const t of tags) {
    const def = TAGS[t];
    if (!def) continue;
    if (def.counteredBy?.some((id) => carried.has(id))) out.add(t);
    if (def.counterProfession && members.some((m) => m.profession === def.counterProfession)) out.add(t);
  }
  return out;
}

function weaponElement(state: GameState, m: Member): Element | undefined {
  const w = itemDef(state, m.loadout.weapon);
  for (const c of m.loadout.consumables) {
    const d = itemDef(state, c);
    if (d?.grantsElement) return d.grantsElement;
  }
  return w?.element;
}

export function damageMultiplier(tags: TagId[], countered: Set<TagId>, key: string | undefined): number {
  if (!key) return 1;
  let mult = 1;
  for (const t of tags) {
    const def = TAGS[t];
    if (!def?.damage) continue;
    // a countered "warded" removes its physical protection
    if (countered.has(t) && def.counteredApproaches?.includes('arcana') && (def.damage as Record<string, number>)[key] < 1) continue;
    const v = (def.damage as Record<string, number>)[key];
    if (v) mult *= v;
  }
  return mult;
}

export function memberScore(state: GameState, m: Member, approach: Approach, ctx: SquadContext): ScoreResult {
  const prof = PROFESSIONS[m.profession];
  const a = m.attrs;
  const parts: Part[] = [];
  const add = (label: string, value: number) => {
    if (Math.abs(value) >= 0.05) parts.push({ label, value });
  };
  const items = memberItems(state, m);
  const armor = itemDef(state, m.loadout.armor);
  const weight = armor?.weight;

  switch (approach) {
    case 'assault': {
      add('Might', a.might);
      add('Finesse ×½', a.finesse * 0.5);
      const w = itemDef(state, m.loadout.weapon);
      if (w?.power) {
        const el = weaponElement(state, m);
        const phys = damageMultiplier(ctx.tags, ctx.countered, w.damage);
        const elem = el ? damageMultiplier(ctx.tags, ctx.countered, el) : 1;
        const power = (w.power + (el ? 1 : 0)) * 1.5;
        add(`${w.name}${el ? ` (${el})` : ''}`, power * phys * elem);
      } else add('Unarmed', -2);
      break;
    }
    case 'stealth': {
      add('Finesse', a.finesse * 1.2);
      add('Wits', a.wits * 0.4);
      if (weight === 'medium') add('Medium armor', -3);
      if (weight === 'heavy') add('Heavy armor', -7);
      break;
    }
    case 'guile': {
      add('Wits', a.wits * 1.2);
      add('Resolve', a.resolve * 0.4);
      break;
    }
    case 'endurance': {
      add('Resolve', a.resolve * 0.8);
      add('Might', a.might * 0.6);
      if (weight === 'medium') add('Medium armor', -1);
      if (weight === 'heavy') add('Heavy armor', -3);
      break;
    }
    case 'arcana': {
      if (prof.arcane) {
        add('Wits', a.wits * 1.2);
        add('Resolve', a.resolve * 0.4);
        const w = itemDef(state, m.loadout.weapon);
        const el = weaponElement(state, m);
        if (w?.bonus?.arcana) {
          const elem = el ? damageMultiplier(ctx.tags, ctx.countered, el) : 1;
          const base = el ? 3 : 0;
          if (base) add(`${el} spellwork`, base * elem);
        }
      } else {
        add('Untrained (Wits ×¼)', a.wits * 0.25);
      }
      break;
    }
  }

  const apt = prof.aptitude[approach];
  if (apt) add(prof.name, apt);

  for (const it of items) {
    const b = it.bonus?.[approach];
    if (b) add(it.name, approach === 'arcana' && !prof.arcane ? b * 0.5 : b);
  }
  for (const t of m.traits) {
    const b = TRAITS[t]?.bonus?.[approach];
    if (b) add(TRAITS[t].name, b);
  }

  // armor drag in swamps
  for (const t of ctx.tags) {
    const def = TAGS[t];
    if (def?.heavyArmorPenalty && (weight === 'medium' || weight === 'heavy') && (approach === 'endurance' || approach === 'stealth')) {
      add(`${weight === 'heavy' ? 'Heavy' : 'Medium'} armor in ${def.name}`, -def.heavyArmorPenalty * (weight === 'heavy' ? 1.5 : 1));
    }
  }

  // condition
  if (m.fatigue > 0) add('Fatigue', -m.fatigue / (approach === 'endurance' ? 15 : 30));
  if (m.health < 60) add('Wounds', -(60 - m.health) / 15);
  if (m.morale !== 50) add('Morale', (m.morale - 50) / 20);

  const score = Math.max(0, parts.reduce((s, p) => s + p.value, 0));
  return { score, parts };
}

export interface SquadScore {
  score: number;
  members: { id: string; name: string; score: number; parts: Part[] }[];
  method: string;
}

export function squadScore(state: GameState, approach: Approach, ctx: SquadContext): SquadScore {
  const ms = ctx.members.map((m) => {
    const r = memberScore(state, m, approach, ctx);
    return { id: m.id, name: m.name, score: r.score, parts: r.parts };
  });
  if (ms.length === 0) return { score: 0, members: [], method: '' };
  const scores = ms.map((m) => m.score);
  const sorted = [...scores].sort((a, b) => b - a);
  const mean = scores.reduce((s, v) => s + v, 0) / scores.length;
  const min = sorted[sorted.length - 1];
  let score = 0;
  let method = '';
  switch (approach) {
    case 'assault':
      score = scores.reduce((s, v) => s + v, 0);
      method = 'Sum of all members';
      break;
    case 'stealth':
      score = (mean + min) / 2;
      method = 'Average of the squad mean and the weakest member';
      break;
    case 'guile':
      score = sorted[0] + sorted.slice(1).reduce((s, v) => s + v, 0) * 0.15;
      method = 'Best talker + 15% of the rest';
      break;
    case 'endurance':
      score = mean * 0.6 + min * 0.4;
      method = '60% squad mean + 40% weakest member';
      break;
    case 'arcana':
      score = sorted[0] + (sorted[1] ?? 0) * 0.5;
      method = 'Best spellworker + half of the second best';
      break;
  }
  return { score, members: ms, method };
}

export interface Difficulty {
  value: number;
  parts: Part[];
}

export function phaseDifficulty(
  state: GameState,
  contract: Contract,
  phase: PhaseDef,
  approach: Approach,
  ctx: SquadContext,
): Difficulty {
  const t = contract.threat;
  const parts: Part[] = [];
  let base: number;
  if (approach === 'assault') base = 25 + t * 7;
  else if (approach === 'endurance') base = 4 + t * 1.5;
  else base = 9 + t * 2.2;
  base *= phase.weight;
  parts.push({ label: `Threat ${t}${phase.weight !== 1 ? ` × phase ${phase.weight}` : ''}`, value: base });

  let mod = 0;
  for (const tag of ctx.tags) {
    const def = TAGS[tag];
    const v = def?.approach?.[approach];
    if (!v) continue;
    if (v > 0 && ctx.countered.has(tag) && def.counteredApproaches?.includes(approach)) {
      parts.push({ label: `${def.name} (countered)`, value: 0 });
      continue;
    }
    mod += v;
    parts.push({ label: def.name, value: base * v });
  }
  if (approach === 'endurance' && seasonOf(state.week) === 'Winter' && !ctx.tags.includes('cold')) {
    mod += 0.1;
    parts.push({ label: 'Winter', value: base * 0.1 });
  }
  let value = base * (1 + mod);
  if (approach === 'stealth' && ctx.members.length > 2) {
    const extra = (ctx.members.length - 2) * 0.9;
    parts.push({ label: `Squad of ${ctx.members.length}`, value: extra });
    value += extra;
  }
  return { value: Math.max(1, value), parts };
}

export function chanceFrom(score: number, difficulty: number): number {
  const scale = Math.max(1, difficulty * 0.25);
  const p = 1 / (1 + Math.exp(-(score - difficulty) / scale));
  return Math.min(0.97, Math.max(0.03, p));
}

export interface PhasePreview {
  phase: PhaseDef;
  approach: Approach;
  chance: number; // with true tags if all revealed, else with known + most likely (midpoint)
  min: number;
  max: number;
  certain: boolean;
  score: SquadScore;
  difficulty: Difficulty;
}

export interface MissionPreview {
  phases: PhasePreview[];
  risk: 'Low' | 'Moderate' | 'High' | 'Deadly';
  riskValue: number;
  supplies: number;
  weeks: number;
  countered: TagId[];
  overall: { min: number; max: number };
}

/** All tag combinations consistent with what the player knows. */
export function tagScenarios(contract: Contract, omniscient = false): TagId[][] {
  let combos: TagId[][] = [[...contract.tags]];
  for (const h of contract.hidden) {
    const opts = h.revealed || omniscient ? [h.trueTag] : h.candidates;
    const next: TagId[][] = [];
    for (const c of combos) for (const o of opts) next.push([...c, o]);
    combos = next;
  }
  return combos;
}

export function knownTags(contract: Contract): TagId[] {
  return [...contract.tags, ...contract.hidden.filter((h) => h.revealed).map((h) => h.trueTag)];
}

export function trueTags(contract: Contract): TagId[] {
  return [...contract.tags, ...contract.hidden.map((h) => h.trueTag)];
}

export function suppliesNeeded(contract: Contract, squadSize: number): number {
  return squadSize * (contract.travelWeeks * 2 + 1);
}

export function previewMission(
  state: GameState,
  contract: Contract,
  members: Member[],
  approaches: Approach[],
): MissionPreview {
  const scenarios = tagScenarios(contract);
  const phases: PhasePreview[] = contract.phases.map((phase, i) => {
    const approach = approaches[i] ?? phase.approaches[0];
    let min = 1;
    let max = 0;
    let rep: { chance: number; score: SquadScore; difficulty: Difficulty } | undefined;
    for (const tags of scenarios) {
      const ctx: SquadContext = { tags, countered: counteredTags(state, members, tags), members };
      const score = squadScore(state, approach, ctx);
      const difficulty = phaseDifficulty(state, contract, phase, approach, ctx);
      const chance = chanceFrom(score.score, difficulty.value);
      min = Math.min(min, chance);
      max = Math.max(max, chance);
      if (!rep) rep = { chance, score, difficulty };
    }
    const known = knownTags(contract);
    const kctx: SquadContext = { tags: known, countered: counteredTags(state, members, known), members };
    const score = squadScore(state, approach, kctx);
    const difficulty = phaseDifficulty(state, contract, phase, approach, kctx);
    return {
      phase,
      approach,
      chance: (min + max) / 2,
      min,
      max,
      certain: scenarios.length === 1,
      score: scenarios.length === 1 ? rep!.score : score,
      difficulty: scenarios.length === 1 ? rep!.difficulty : difficulty,
    };
  });

  const avgProt =
    members.length === 0 ? 0 : members.reduce((s, m) => s + (itemDef(state, m.loadout.armor)?.protection ?? 0), 0) / members.length;
  const tagDanger = Math.max(1, ...trueTagsSafe(contract).map((t) => TAGS[t]?.danger ?? 1));
  let riskValue = 0;
  for (const p of phases) {
    const fail = 1 - p.min;
    riskValue += fail * p.phase.danger * tagDanger * (10 + contract.threat * 4) * Math.max(0.4, 1 - avgProt * 0.07);
  }
  if (members.length > 0) riskValue *= Math.min(1.6, 3 / members.length);
  const risk = riskValue < 10 ? 'Low' : riskValue < 20 ? 'Moderate' : riskValue < 32 ? 'High' : 'Deadly';

  const overall = {
    min: phases.reduce((s, p) => s * p.min, 1),
    max: phases.reduce((s, p) => s * p.max, 1),
  };
  const last = phases[phases.length - 1];
  if (last) {
    // the objective (last) phase decides success; earlier phases shift it
    overall.min = last.min;
    overall.max = last.max;
  }

  const allTags = scenarios.flat();
  return {
    phases,
    risk,
    riskValue,
    supplies: suppliesNeeded(contract, members.length),
    weeks: contract.travelWeeks * 2 + 1,
    countered: [...counteredTags(state, members, [...new Set(allTags)])],
    overall,
  };
}

// danger uses known tags only for display, plus the worst candidate of hidden ones
function trueTagsSafe(contract: Contract): TagId[] {
  const out = [...contract.tags];
  for (const h of contract.hidden) {
    if (h.revealed) out.push(h.trueTag);
    else {
      let worst = h.candidates[0];
      for (const c of h.candidates) if ((TAGS[c]?.danger ?? 1) > (TAGS[worst]?.danger ?? 1)) worst = c;
      out.push(worst);
    }
  }
  return out;
}

/** Pick the best approach per phase for the given squad (used for defaults and the rival AI). */
export function bestApproaches(state: GameState, contract: Contract, members: Member[]): Approach[] {
  const known = knownTags(contract);
  const ctx: SquadContext = { tags: known, countered: counteredTags(state, members, known), members };
  return contract.phases.map((phase) => {
    let best = phase.approaches[0];
    let bestP = -1;
    for (const a of phase.approaches) {
      const p = chanceFrom(squadScore(state, a, ctx).score, phaseDifficulty(state, contract, phase, a, ctx).value);
      if (p > bestP) {
        bestP = p;
        best = a;
      }
    }
    return best;
  });
}
