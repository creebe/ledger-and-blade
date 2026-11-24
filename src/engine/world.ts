import { CONTRACT_TEMPLATES, TEMPLATE_BY_ID, type ContractTemplate } from './data/contracts';
import { seasonOf } from './data/events';
import { REGIONS, factionKnown } from './data/factions';
import { activeMods, modProduct } from './data/decrees';
import { ITEMS, MARKET_POOL, STAPLES } from './data/items';
import { PROFESSIONS } from './data/professions';
import { TRAITS, FIRST_NAMES, LAST_NAMES } from './data/traits';
import { chance, nextFloat, pick, randInt, shuffle, uid, weighted } from './rng';
import type {
  Attribute,
  ClockId,
  Contract,
  ContractEffect,
  Dispatch,
  DispatchKind,
  FactionId,
  GameState,
  MaterialId,
  Member,
  ProfessionId,
  Recruit,
  RivalId,
} from './types';

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const ATTRS: Attribute[] = ['might', 'finesse', 'wits', 'resolve'];

export const MATERIAL_INFO: Record<MaterialId, { name: string; base: number }> = {
  iron: { name: 'Iron', base: 6 },
  leather: { name: 'Leather', base: 5 },
  timber: { name: 'Timber', base: 3 },
  reagents: { name: 'Reagents', base: 12 },
};
export const SUPPLY_BASE = 3;
export const HALL_UPKEEP = 15;
export const REWARD_SCALE = 1.5;

export function season(state: GameState) {
  return seasonOf(state.week);
}

export function dateLabel(week: number): string {
  const year = Math.floor((week - 1) / 48) + 1;
  const wInSeason = ((week - 1) % 12) + 1;
  return `${seasonOf(week)} · Week ${wInSeason} · Year ${year}`;
}

export function addDispatch(state: GameState, kind: DispatchKind, title: string, body: string[] = [], missionId?: string): Dispatch {
  const d: Dispatch = { id: uid(state, 'd'), week: state.week, kind, title, body, missionId };
  state.dispatches.push(d);
  // keep the log bounded
  if (state.dispatches.length > 200) state.dispatches.splice(0, state.dispatches.length - 200);
  return d;
}

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

export function living(state: GameState): Member[] {
  return state.members.filter((m) => m.status !== 'dead' && m.status !== 'left');
}

export function addItem(state: GameState, defId: string): string {
  const id = uid(state, 'i');
  state.items.push({ uid: id, defId });
  return id;
}

export function removeItem(state: GameState, itemUid: string) {
  state.items = state.items.filter((i) => i.uid !== itemUid);
  for (const m of state.members) {
    if (m.loadout.weapon === itemUid) m.loadout.weapon = undefined;
    if (m.loadout.armor === itemUid) m.loadout.armor = undefined;
    if (m.loadout.trinket === itemUid) m.loadout.trinket = undefined;
    m.loadout.consumables = m.loadout.consumables.filter((c) => c !== itemUid);
  }
}

export function equippedBy(state: GameState, itemUid: string): Member | undefined {
  return state.members.find(
    (m) =>
      m.status !== 'dead' &&
      m.status !== 'left' &&
      (m.loadout.weapon === itemUid || m.loadout.armor === itemUid || m.loadout.trinket === itemUid || m.loadout.consumables.includes(itemUid)),
  );
}

// ---------------- Members ----------------

/** First names stay unique among the guild and the hiring hall, so journals read clearly. */
function uniqueName(state: GameState): string {
  const taken = new Set([...living(state), ...state.recruits.map((r) => r.member)].map((m) => m.name.split(' ')[0]));
  let firstName = pick(state, FIRST_NAMES);
  for (let i = 0; i < 20 && taken.has(firstName); i++) firstName = pick(state, FIRST_NAMES);
  return `${firstName} ${pick(state, LAST_NAMES)}`;
}

export function createMember(state: GameState, profession: ProfessionId, quality = 0): Member {
  const prof = PROFESSIONS[profession];
  const attrs = { ...prof.base };
  for (const a of ATTRS) attrs[a] = clamp(attrs[a] + randInt(state, -1, 1) + (chance(state, 0.15 + quality * 0.1) ? 1 : 0), 1, 10);
  const traitIds = Object.keys(TRAITS);
  const traits: string[] = [];
  const nTraits = chance(state, 0.6) ? 2 : 1;
  while (traits.length < nTraits) {
    const t = pick(state, traitIds);
    if (!traits.includes(t)) traits.push(t);
  }
  const wage = prof.wage + traits.reduce((s, t) => s + (TRAITS[t].wage ?? 0), 0);
  const m: Member = {
    id: uid(state, 'm'),
    name: uniqueName(state),
    profession,
    attrs,
    level: 1,
    xp: 0,
    health: 100,
    fatigue: 0,
    morale: 55 + randInt(state, -5, 10),
    loyalty: 60 + randInt(state, -5, 10),
    wage,
    traits,
    loadout: { consumables: [] },
    status: 'idle',
    assignment: 'rest',
    trainProgress: 0,
    weeksUnpaid: 0,
    joinedWeek: state.week,
    missions: 0,
    record: [],
  };
  for (const g of prof.startingGear) {
    const id = addItem(state, g);
    const def = ITEMS[g];
    if (def.slot === 'weapon') m.loadout.weapon = id;
    else if (def.slot === 'armor') m.loadout.armor = id;
    else if (def.slot === 'trinket') m.loadout.trinket = id;
  }
  return m;
}

/** Recruits carry their gear as a promise: items are only created on hire. */
export function generateRecruit(state: GameState): Recruit {
  const lt = state.factions.lowertown.standing;
  const quality = lt >= 30 ? 2 : lt >= 10 ? 1 : 0;
  const profs = Object.keys(PROFESSIONS) as ProfessionId[];
  const profession = pick(state, profs);
  // build a member without registering gear
  const before = state.items.length;
  const m = createMember(state, profession, quality);
  const gear = state.items.splice(before);
  m.loadout = { consumables: [] };
  const discount = lt >= 20 ? 0.75 : lt <= -20 ? 1.5 : 1;
  return { member: m, signOn: Math.round(m.wage * 4 * discount), expiresWeek: state.week + 2, gear: gear.map((g) => g.defId) };
}

export function xpToLevel(level: number) {
  return 8 + level * 4;
}

// ---------------- Contracts ----------------

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
  while (state.board.filter((c) => !c.story).length < target && guard++ < 10) {
    state.board.push(generateContract(state));
  }
}

// ---------------- Effects ----------------

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

// ---------------- Market ----------------

export function priceMultiplier(state: GameState): number {
  // weak coin pushes prices up; Weighhouse friendship pulls them down
  const coin = 1 + (50 - state.clocks.cointrust) / 150;
  const wh = 1 - clamp(state.factions.weighhouse.standing, 0, 50) / 500;
  return coin * wh * modProduct(state, 'prices');
}

export function supplyPrice(state: GameState): number {
  const s = season(state);
  const seasonal = s === 'Winter' ? 1.3 : s === 'Autumn' ? 0.85 : s === 'Spring' ? 1.1 : 1;
  // the river market undercuts the Weighhouse for friends of the Mudlarks
  const river = state.factions.mudlarks?.standing >= 20 ? 0.9 : 1;
  return Math.max(1, Math.round(SUPPLY_BASE * seasonal * (state.market.supplies ?? 1) * priceMultiplier(state) * modProduct(state, 'supplyPrice') * river * 10) / 10);
}

export function materialPrice(state: GameState, m: MaterialId): number {
  return Math.max(1, Math.round(MATERIAL_INFO[m].base * (state.market[m] ?? 1) * priceMultiplier(state)));
}

export function itemPrice(state: GameState, defId: string): number {
  return Math.round(ITEMS[defId].price * priceMultiplier(state));
}

export const SELL_RATE = 0.5;
export const MATERIAL_SELL_RATE = 0.7;

export function refreshMarket(state: GameState) {
  for (const k of ['supplies', 'iron', 'leather', 'timber', 'reagents']) {
    const cur = state.market[k] ?? 1;
    // drift back toward 1 with noise
    state.market[k] = clamp(cur + (1 - cur) * 0.3 + (nextFloat(state) - 0.5) * 0.12, 0.6, 1.8);
  }
  const pool = MARKET_POOL.filter((p) => state.renown >= p.minRenown && !STAPLES.includes(p.id)).map((p) => p.id);
  const stock = new Set<string>(STAPLES);
  shuffle(state, pool);
  for (const id of pool.slice(0, 7)) stock.add(id);
  state.stock = [...stock];
}
