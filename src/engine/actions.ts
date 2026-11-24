// Player actions. Each mutates a draft GameState and returns an error string
// (shown to the player) or undefined on success.
import { ITEMS } from './data/items';
import { describePlan } from './rivals/rival';
import { counteredTags, knownTags, suppliesNeeded } from './missions/odds';
import { revealCost, rosterCap, tripWeeks } from './economy/buildings';
import { uid } from './core/rng';
import type { Member, Approach, Assignment, Attribute, FactionId, GameState, ItemSlot, MaterialId, RivalId } from './core/types';
import { RIVALS } from './data/factions';
import { addDispatch, clamp, living } from './core/util';
import { addItem, equippedBy, removeItem } from './economy/items';
import { applyStanding, spend, earn, track } from './core/effects';
import { itemPrice, materialPrice, supplyPrice } from './economy/market';
import { HEAT_COST, INTEL_RIVAL_COST, MATERIAL_SELL_RATE, PETITION_COST, SELL_RATE } from './core/tuning';

const findMember = (s: GameState, id: string) => s.members.find((m) => m.id === id);

export function hireRecruit(s: GameState, index: number): string | undefined {
  const r = s.recruits[index];
  if (!r) return 'Recruit is gone';
  if (s.crowns < r.signOn) return `Need ${r.signOn} crowns to sign them`;
  if (living(s).length >= rosterCap(s)) return `The hall is full (${rosterCap(s)} members). Expand the Great Hall.`;
  spend(s, 'Recruitment', r.signOn);
  const m = r.member;
  m.joinedWeek = s.week;
  for (const g of r.gear) {
    const id = addItem(s, g);
    const slot = ITEMS[g].slot;
    if (slot === 'weapon') m.loadout.weapon = id;
    else if (slot === 'armor') m.loadout.armor = id;
    else if (slot === 'trinket') m.loadout.trinket = id;
  }
  s.members.push(m);
  s.recruits.splice(index, 1);
  track(s, 'hire');
  addDispatch(s, 'roster', `${m.name} joins the guild`, [`Signed for ${r.signOn} crowns, at ${m.wage}/week.`]);
  return undefined;
}

export function dismissMember(s: GameState, id: string): string | undefined {
  const m = findMember(s, id);
  if (!m || m.status === 'dead' || m.status === 'left') return 'No such member';
  if (m.status === 'mission') return awayReason(s, m) ?? 'Cancel their dispatch first';
  m.status = 'left';
  m.causeOfDeath = 'Dismissed';
  m.loadout = { consumables: [] };
  for (const o of living(s)) o.morale = clamp(o.morale - 3, 0, 100);
  addDispatch(s, 'roster', `${m.name} was dismissed`, ['The others notice.']);
  return undefined;
}

export function setAssignment(s: GameState, id: string, a: Assignment, extra?: { attr?: Attribute; contractId?: string }) {
  const m = findMember(s, id);
  if (!m) return 'No such member';
  if (m.status === 'mission') return awayReason(s, m) ?? `${m.name.split(' ')[0]} is heading out this week. Cancel the dispatch to give other orders.`;
  m.assignment = a;
  if (a !== 'rest') track(s, 'assign');
  if (a === 'train') m.trainAttr = extra?.attr ?? m.trainAttr ?? 'might';
  if (a === 'build' && !s.construction) return 'Nothing is being built';
  if (a === 'scout') {
    if (!extra?.contractId) return 'Choose a contract to scout';
    m.scoutTarget = extra.contractId;
  }
  return undefined;
}

export function equip(s: GameState, memberId: string, slot: ItemSlot, itemUid: string | undefined, consumableIndex = 0): string | undefined {
  const m = findMember(s, memberId);
  if (!m) return 'No such member';
  const away = awayReason(s, m);
  if (away) return away;
  if (itemUid) {
    const inst = s.items.find((i) => i.uid === itemUid);
    if (!inst) return 'No such item';
    if (ITEMS[inst.defId].slot !== slot) return 'Wrong slot';
    const holder = equippedBy(s, itemUid);
    const holderAway = holder && awayReason(s, holder);
    if (holderAway) return `${holder!.name.split(' ')[0]} has it, and ${holderAway.charAt(0).toLowerCase()}${holderAway.slice(1)}`;
    if (holder) {
      // take it from whoever has it
      if (holder.loadout.weapon === itemUid) holder.loadout.weapon = undefined;
      if (holder.loadout.armor === itemUid) holder.loadout.armor = undefined;
      if (holder.loadout.trinket === itemUid) holder.loadout.trinket = undefined;
      holder.loadout.consumables = holder.loadout.consumables.filter((c) => c !== itemUid);
    }
  }
  if (itemUid) track(s, 'equip');
  if (slot === 'consumable') {
    const cons = [...m.loadout.consumables];
    if (itemUid) cons[consumableIndex] = itemUid;
    else cons.splice(consumableIndex, 1);
    m.loadout.consumables = cons.filter(Boolean).slice(0, 2);
  } else {
    m.loadout[slot] = itemUid;
  }
  return undefined;
}

/**
 * A squad dispatched this week is still in the yard until the week ends:
 * its gear can be changed and the dispatch can be called off.
 */
export function isPreparing(s: GameState, m: { status: string; missionId?: string }): boolean {
  if (m.status !== 'mission') return false;
  const ms = s.missions.find((x) => x.id === m.missionId);
  return !!ms && !ms.report && ms.dispatchedWeek === s.week;
}

/** Why a member's gear can't be touched right now, if it can't. */
export function awayReason(s: GameState, m: { name: string; status: string; missionId?: string }): string | undefined {
  if (m.status !== 'mission' || isPreparing(s, m)) return undefined;
  const ms = s.missions.find((x) => x.id === m.missionId);
  return ms ? `${m.name.split(' ')[0]} is away on "${ms.contract.title}" until the end of week ${ms.returnWeek}. Gear can't be changed in the field.` : 'They are away';
}

/** Call off a squad that hasn't left yet: supplies come back and the contract returns to the board. */
export function cancelDispatch(s: GameState, missionId: string): string | undefined {
  const ms = s.missions.find((x) => x.id === missionId);
  if (!ms) return 'No such mission';
  if (ms.dispatchedWeek !== s.week || ms.report) return 'They have already left';
  s.supplies += ms.supplies;
  for (const id of ms.memberIds) {
    const m = findMember(s, id);
    if (m) {
      m.status = 'idle';
      m.missionId = undefined;
    }
  }
  s.missions = s.missions.filter((x) => x !== ms);
  if (ms.contract.expiresWeek >= s.week) s.board.unshift(ms.contract);
  return undefined;
}

export function buyItem(s: GameState, defId: string): string | undefined {
  if (!s.stock.includes(defId)) return 'Not in stock';
  const price = itemPrice(s, defId);
  if (s.crowns < price) return `Need ${price} crowns`;
  spend(s, 'Market', price);
  addItem(s, defId);
  track(s, 'buy');
  return undefined;
}

export function sellItem(s: GameState, itemUid: string): string | undefined {
  const inst = s.items.find((i) => i.uid === itemUid);
  if (!inst) return 'No such item';
  const holder = equippedBy(s, itemUid);
  if (holder?.status === 'mission') return 'It is out on a mission';
  earn(s, 'Market', Math.round(ITEMS[inst.defId].price * SELL_RATE));
  removeItem(s, itemUid);
  return undefined;
}

/** Bulk buying is cheaper: 5% off from 10, 10% off from 20, 15% off from 40. */
export function supplyDiscount(n: number): number {
  return n >= 40 ? 0.15 : n >= 20 ? 0.1 : n >= 10 ? 0.05 : 0;
}

export function supplyCost(s: GameState, n: number): number {
  return Math.ceil(supplyPrice(s) * n * (1 - supplyDiscount(n)));
}

export function buySupplies(s: GameState, n: number): string | undefined {
  const cost = supplyCost(s, n);
  if (s.crowns < cost) return `Need ${cost} crowns`;
  spend(s, 'Supplies', cost);
  s.supplies += n;
  track(s, 'supplies');
  s.market.supplies = clamp((s.market.supplies ?? 1) + n * 0.004, 0.6, 1.8);
  return undefined;
}

export function sellMaterial(s: GameState, m: MaterialId, n: number): string | undefined {
  if (s.materials[m] < n) return 'Not enough';
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += materialPrice(s, m) * MATERIAL_SELL_RATE;
    // flooding the market drops the price
    s.market[m] = clamp((s.market[m] ?? 1) - 0.02, 0.6, 1.8);
  }
  s.materials[m] -= n;
  earn(s, 'Market', Math.round(total));
  return undefined;
}

export function revealTag(s: GameState, contractId: string, hiddenIndex: number): string | undefined {
  const c = s.board.find((x) => x.id === contractId);
  if (!c) return 'No such contract';
  const h = c.hidden[hiddenIndex];
  if (!h || h.revealed) return 'Already known';
  const cost = revealCost(s);
  if (s.intel < cost) return `Need ${cost} intel`;
  s.intel -= cost;
  h.revealed = true;
  track(s, 'reveal');
  return undefined;
}

export function dispatchMission(
  s: GameState,
  contractId: string,
  memberIds: string[],
  approaches: Approach[],
  retreatOnCritical: boolean,
): string | undefined {
  const c = s.board.find((x) => x.id === contractId);
  if (!c) return 'Contract is gone';
  if (memberIds.length < c.minSquad) return `Needs at least ${c.minSquad} members`;
  if (memberIds.length > c.maxSquad) return `At most ${c.maxSquad} members`;
  const members = memberIds.map((id) => findMember(s, id));
  for (const m of members) {
    if (!m || m.status !== 'idle') return `${m?.name ?? 'A member'} is not available`;
    if (m.health < 40) return `${m.name} is too badly wounded`;
  }
  const need = suppliesNeeded(c, memberIds.length, s);
  const trip = tripWeeks(s, c.travelWeeks);
  if (s.supplies < need) return `Needs ${need} supplies (you have ${s.supplies})`;
  s.supplies -= need;
  track(s, 'dispatch');
  if (counteredTags(s, members as Member[], knownTags(c)).size > 0) track(s, 'countered');
  for (const m of members) {
    m!.status = 'mission';
    m!.missionId = undefined;
  }
  const id = uid(s, 'x');
  for (const m of members) m!.missionId = id;
  s.missions.push({
    id,
    contract: c,
    memberIds,
    approaches: c.phases.map((p, i) => (p.approaches.includes(approaches[i]) ? approaches[i] : p.approaches[0])),
    retreatOnCritical,
    supplies: need,
    dispatchedWeek: s.week,
    arriveWeek: s.week + trip.out,
    returnWeek: s.week + trip.out + trip.back,
  });
  s.board = s.board.filter((x) => x.id !== c.id);
  // members scouting this contract can stop
  for (const m of s.members) if (m.assignment === 'scout' && m.scoutTarget === c.id) m.assignment = 'rest';
  return undefined;
}

export function repayLoan(s: GameState, amount: number): string | undefined {
  const loan = s.loans[0];
  if (!loan) return 'No loan';
  const amt = Math.min(amount, Math.ceil(loan.principal));
  if (s.crowns < amt) return `Need ${amt} crowns`;
  spend(s, 'Loan repayment', amt);
  track(s, 'repay');
  loan.principal -= amt;
  if (loan.principal <= 0.5) {
    s.loans = [];
    addDispatch(s, 'economy', 'Loan repaid in full', ['The Weighhouse returns your note. The guild owes nothing.']);
    applyStanding(s, loan.lender, 5);
  }
  return undefined;
}

export function petition(s: GameState, f: FactionId): string | undefined {
  if (s.petitioned.includes(f)) return 'Already petitioned this week';
  if (s.influence < PETITION_COST) return `Need ${PETITION_COST} influence`;
  s.influence -= PETITION_COST;
  s.petitioned.push(f);
  track(s, 'petition');
  applyStanding(s, f, 6);
  if (f === 'ostranders' && !s.flags.ostranders_open) {
    s.flags.ostranders_open = true;
    addDispatch(s, 'politics', "Ostrander's will send work", ['Factor Vorn accepts your overture. Bank contracts will now appear on the board.']);
  }
  return undefined;
}

export function coolHeat(s: GameState): string | undefined {
  if (s.influence < HEAT_COST) return `Need ${HEAT_COST} influence`;
  if (s.heat <= 0) return 'No heat to cool';
  s.influence -= HEAT_COST;
  s.heat = Math.max(0, s.heat - 12);
  return undefined;
}

export function revealRivalPlan(s: GameState, id: RivalId = 'hobbs'): string | undefined {
  const plan = s.rivals[id].plan;
  if (!plan || plan.revealed) return 'Already known';
  if (s.intel < INTEL_RIVAL_COST) return `Need ${INTEL_RIVAL_COST} intel`;
  s.intel -= INTEL_RIVAL_COST;
  plan.revealed = true;
  track(s, 'spy');
  addDispatch(s, 'rival', `Your informants report on ${RIVALS[id].name}`, [describePlan(s, plan, id)]);
  return undefined;
}

export function counterCost(s: GameState, id: RivalId = 'hobbs'): { label: string; crowns?: number; influence?: number; intel?: number } | undefined {
  const plan = s.rivals[id].plan;
  if (!plan || !plan.revealed || plan.countered) return undefined;
  if (plan.kind === 'smear') return { label: 'Call in favors to quash the rumors', influence: 2 };
  if (plan.kind === 'poach') return id === 'ninth' ? { label: 'Match the Ninth\'s offer (35 crowns)', crowns: 35 } : { label: 'Pay a loyalty bonus (25 crowns)', crowns: 25 };
  if (plan.kind === 'inspect') return { label: 'Have an Exchequer friend delay the visit', influence: 2 };
  if (plan.kind === 'ambush') return { label: 'Send a rider to warn the squad (2 Intel)', influence: undefined, intel: 2 };
  if (plan.kind === 'theft' || plan.kind === 'arson' || plan.kind === 'murder') return { label: 'Hire extra watchmen this week (30 crowns)', crowns: 30 };
  if (plan.kind === 'bribe') return { label: 'Pay a loyalty bonus (25 crowns)', crowns: 25 };
  if (plan.kind === 'plant') return { label: 'Have the new hires vetted', influence: 2 };
  return undefined;
}

export function counterRivalPlan(s: GameState, id: RivalId = 'hobbs'): string | undefined {
  const cost = counterCost(s, id);
  const plan = s.rivals[id].plan;
  if (!cost || !plan) return 'Nothing to counter';
  if (cost.crowns && s.crowns < cost.crowns) return `Need ${cost.crowns} crowns`;
  if (cost.influence && s.influence < cost.influence) return `Need ${cost.influence} influence`;
  if (cost.intel && s.intel < cost.intel) return `Need ${cost.intel} intel`;
  if (cost.intel) s.intel -= cost.intel;
  if (cost.crowns) spend(s, 'Bonuses', cost.crowns);
  if (cost.influence) s.influence -= cost.influence;
  if (plan.kind === 'poach' || plan.kind === 'bribe') {
    const m = findMember(s, plan.target!);
    if (m) m.loyalty = clamp(m.loyalty + 25, 0, 100);
  }
  plan.countered = true;
  return undefined;
}
