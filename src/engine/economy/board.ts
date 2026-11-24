import { CONTRACT_TEMPLATES, TEMPLATE_BY_ID, type ContractTemplate } from '../data/contracts';
import { REGIONS, factionKnown } from '../data/factions';
import { activeMods, modProduct } from '../data/decrees';
import { chance, nextFloat, pick, randInt, shuffle, uid, weighted } from '../core/rng';
import type { Contract, FactionId, GameState, MaterialId, RivalId } from '../core/types';
import { addDispatch, clamp } from '../core/util';
import { REWARD_SCALE } from '../core/tuning';
import { season } from '../core/calendar';
import { applyContractEffect } from '../core/effects';

function eligibleTemplates(state: GameState): ContractTemplate[] {
  return CONTRACT_TEMPLATES.filter((t) => {
    if (t.story || t.weight <= 0) return false;
    if (t.requiresFlag && !state.flags[t.requiresFlag]) return false;
    // patrons who hate you stop offering work
    if (t.patrons.every((p) => state.factions[p].standing <= -30 || !factionKnown(state, p))) return false;
    return true;
  });
}

export function generateContract(state: GameState, template?: ContractTemplate): Contract {
  const t =
    template ??
    weighted(
      state,
      eligibleTemplates(state).map((tp) => {
        let w = tp.weight;
        // world state nudges what's on offer
        if (tp.patrons.includes('ostranders')) w *= 1 + state.clocks.leverage / 60;
        if (tp.patrons.includes('lowertown')) w *= 1 + state.clocks.unrest / 80;
        // keep the board varied
        if (state.board.some((c) => c.templateId === tp.id)) w *= 0.2;
        return { item: tp, weight: w };
      }),
    );
  const patrons = t.patrons.filter((p) => state.factions[p].standing > -30 && factionKnown(state, p));
  const patron: FactionId = pick(state, patrons.length ? patrons : t.patrons);
  const regionId = pick(state, t.regions);
  const region = REGIONS[regionId];
  // threat creeps up as the guild's renown grows
  const cap = threatCap(state);
  const threat = t.story ? t.threat[0] : clamp(randInt(state, Math.min(t.threat[0], cap), Math.min(t.threat[1], cap)), 1, 10);
  const s = season(state);
  const tags = [...t.tags];
  for (const o of t.optionalTags ?? []) {
    if (o.seasons && !o.seasons.includes(s)) continue;
    if (chance(state, o.chance) && !tags.includes(o.tag)) tags.push(o.tag);
  }
  const hidden = (t.hidden ?? []).map((cands) => {
    const pool = cands.filter((c) => !tags.includes(c));
    const candidates = shuffle(state, [...(pool.length ? pool : cands)]);
    return { candidates, trueTag: pick(state, candidates), revealed: false };
  });
  const standing = state.factions[patron].standing;
  const favor = standing >= 25 ? 1.15 : standing <= -15 ? 0.85 : 1;
  // pay covers time on the road: longer trips pay more
  const travelBonus = region.travel * 45;
  // decrees in force change what some work pays
  const decreeMult = (activeMods(state).reduce((p, m) => p * (m.rewardPatron?.[patron] ?? 1), 1)) * (t.shady ? modProduct(state, 'shadyReward') : 1);
  const reward = Math.round(((t.baseReward + t.perThreat * threat) * REWARD_SCALE + travelBonus) * favor * decreeMult * (0.9 + nextFloat(state) * 0.2) / 5) * 5;
  const onSuccess = JSON.parse(JSON.stringify(t.onSuccess));
  if (t.shady && onSuccess.heat) onSuccess.heat = Math.round(onSuccess.heat * modProduct(state, 'shadyHeat'));
  const materials: Partial<Record<MaterialId, number>> = {};
  for (const mt of t.materials ?? []) materials[mt.id] = randInt(state, mt.min, mt.max) + Math.floor(threat / 3);
  const contestedBy = !t.story && chance(state, t.contestChance) ? pickContester(state, t) : undefined;
  return {
    id: uid(state, 'c'),
    templateId: t.id,
    title: pick(state, t.titles),
    patron,
    type: t.type,
    description: t.description,
    region: region.name,
    travelWeeks: region.travel,
    threat,
    tags,
    hidden,
    phases: t.phases.map((p) => ({ ...p, approaches: [...p.approaches] })),
    reward,
    materials,
    onSuccess,
    onFailure: JSON.parse(JSON.stringify(t.onFailure)),
    postedWeek: state.week,
    expiresWeek: state.week + (t.story ? 6 : randInt(state, 2, 4)),
    contestedBy,
    story: t.story,
    minSquad: t.minSquad,
    maxSquad: t.maxSquad,
  };
}

/** Which active rival wants this job: each has its own taste in work. */
function pickContester(state: GameState, t: ContractTemplate): RivalId | undefined {
  const approaches = new Set(t.phases.flatMap((p) => p.approaches));
  const taste: Record<RivalId, number> = {
    // Isbet's private arrangement keeps her firm off the river work
    hobbs: (t.type === 'Collection' || t.type === 'Escort' || t.patrons.includes('ostranders') ? 3 : 1) * (state.flags.isbet_pact ? 0.35 : 1),
    ninth: approaches.has('assault') ? (t.type === 'Hunt' || t.type === 'Escort' ? 3 : 1.5) : 0.3,
    assay: approaches.has('arcana') || t.materials?.some((m) => m.id === 'reagents') ? 2.5 : 0,
  };
  const pool = (Object.keys(taste) as RivalId[]).filter((r) => state.rivals[r]?.active && taste[r] > 0);
  if (!pool.length) return undefined;
  return weighted(state, pool.map((r) => ({ item: r, weight: taste[r] })));
}

/** Contracts grow more dangerous as time passes and the guild's renown grows. */
export function threatCap(state: GameState): number {
  return clamp(2 + Math.floor((state.week - 1) / 8) + Math.floor(state.renown / 12), 2, 10);
}

export function addStoryContract(state: GameState, templateId: string) {
  const t = TEMPLATE_BY_ID[templateId];
  if (!t) return;
  const c = generateContract(state, t);
  state.board.unshift(c);
}

export function refreshBoard(state: GameState) {
  // a story contract that expires unattended still has consequences
  for (const c of state.board.filter((x) => x.story && x.expiresWeek < state.week)) {
    const lines: string[] = [];
    applyContractEffect(state, c.onFailure, lines);
    const t = TEMPLATE_BY_ID[c.templateId];
    for (const f of t?.expireFlags ?? []) state.flags[f] = true;
    if (t?.expire) addDispatch(state, 'story', t.expire.title, [t.expire.text, ...lines]);
    else addDispatch(state, 'story', `"${c.title}" was left undone`, lines);
  }
  state.board = state.board.filter((c) => c.expiresWeek >= state.week);
  const target = 4 + (state.renown >= 15 ? 1 : 0);
  let guard = 0;
  while (state.board.filter((c) => !c.story && !c.op).length < target && guard++ < 10) {
    state.board.push(generateContract(state));
  }
}

// ---------------- Effects ----------------
