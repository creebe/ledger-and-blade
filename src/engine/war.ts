// Guild wars. Each rival has a feud level (0-100) with your guild. It rises when
// either side hurts the other and cools slowly when nobody does. Three stages:
//   Competition (0-24): spying and smears.
//   Feud (25-59): intercepting jobs, poaching people, theft, bribes, ambushes.
//   Open war (60+): raids, arson, murder and assassination of named people.
// Defenses: hall guards, the Spymaster's Den, scouts and bigger squads on the
// road, loyal members, and diplomacy (truces, tribute, pacts).
// Open war in the streets draws Heat: the Exchequer blames everyone.
import { level, rosterCap } from './buildings';
import { NPCS } from './data/facts';
import { RIVALS } from './data/factions';
import { TEMPLATE_BY_ID } from './data/contracts';
import { mournLegend } from './legends';
import { chanceFrom, counteredTags, squadScore } from './odds';
import { chance, pick, randInt } from './rng';
import type { Approach, Contract, GameState, NpcId, ProfessionId, RivalId } from './types';
import { addDispatch, clamp, living } from './util';
import { applyStanding, createMember, generateContract, spend } from './world';

export const STAGES = ['Competition', 'Feud', 'Open war'] as const;

export function feudStage(state: GameState, id: RivalId): 0 | 1 | 2 {
  const f = state.rivals[id].feud ?? 0;
  return f >= 60 ? 2 : f >= 25 ? 1 : 0;
}

export const inTruce = (state: GameState, id: RivalId) => (state.rivals[id].truceUntil ?? 0) >= state.week;

export function raiseFeud(state: GameState, id: RivalId, amount: number) {
  const r = state.rivals[id];
  if (!r?.active) return;
  const before = feudStage(state, id);
  r.feud = clamp((r.feud ?? 0) + amount, 0, 100);
  const after = feudStage(state, id);
  if (after !== before) {
    const name = RIVALS[id].name;
    addDispatch(
      state,
      'rival',
      after > before ? `${name}: ${STAGES[after].toLowerCase()}` : `${name}: things have cooled`,
      [
        after === 2
          ? `It is open war with ${name}. Expect raids, fire and knives, and expect the Exchequer to blame you for all of it.`
          : after === 1
            ? `What was business with ${name} has become personal. They will start going after your jobs, your stores and your people.`
            : `${name} have stopped treating you as an enemy, for now.`,
      ],
    );
  }
}

// ---------------------------------------------------------------------------
// Defenses
// ---------------------------------------------------------------------------

export const guards = (state: GameState) => living(state).filter((m) => m.status === 'idle' && m.assignment === 'guard');

/** Chance that the hall's defenses stop a raid on it (theft, arson, murder). */
export function hallDefense(state: GameState): number {
  return Math.min(0.85, guards(state).length * 0.25 + level(state, 'den') * 0.1);
}

/** Chance a hidden rival spy is caught this week. */
function spyCatch(state: GameState): number {
  return Math.min(0.6, level(state, 'den') * 0.12 + guards(state).length * 0.06);
}

// ---------------------------------------------------------------------------
// Checks made by whoever is at home
// ---------------------------------------------------------------------------

export function homeChance(state: GameState, approach: Approach, difficulty: number): { chance: number; who?: string } {
  const home = living(state).filter((m) => m.status !== 'mission');
  let best = 0;
  let who: string | undefined;
  for (const m of home) {
    const s = squadScore(state, approach, { tags: ['urban'], countered: counteredTags(state, [m], []), members: [m] }).score;
    if (s > best) {
      best = s;
      who = m.name;
    }
  }
  return { chance: home.length ? chanceFrom(best, difficulty) : 0.03, who };
}

// ---------------------------------------------------------------------------
// Operations against a rival
// ---------------------------------------------------------------------------

export type OpKind = 'spy' | 'smear' | 'poach' | 'intercept' | 'raid' | 'kill' | 'truce' | 'tribute' | 'pact';

export interface OpOption {
  kind: OpKind;
  label: string;
  detail: string;
  cost: { crowns?: number; intel?: number; influence?: number };
  blocked?: string;
  target?: NpcId;
}

const LEADERS: Record<RivalId, NpcId[]> = { hobbs: ['marta', 'isbet'], ninth: ['mayne'], assay: ['plaice'] };

export function leaderOf(state: GameState, id: RivalId): NpcId | undefined {
  return LEADERS[id].find((n) => state.npcs[n]?.status === 'alive');
}

const SHIPMENT: Record<RivalId, string> = {
  hobbs: "Hobb & Daughters' collection cart",
  ninth: "the Ninth's pay chest",
  assay: "the Assay Office's reagent wagon",
};

function opOnBoard(state: GameState, id: RivalId, kind: OpKind) {
  return state.board.some((c) => c.op?.rival === id && c.op.kind === kind) || state.missions.some((m) => !m.report && m.contract.op?.rival === id && m.contract.op.kind === kind);
}

export function operationOptions(state: GameState, id: RivalId): OpOption[] {
  const r = state.rivals[id];
  const stage = feudStage(state, id);
  const name = RIVALS[id].name;
  const truce = inTruce(state, id);
  const needStage = (n: number) => (stage < n ? `Only once things with ${name} reach ${STAGES[n].toLowerCase()}.` : truce ? `You agreed a truce with ${name} until week ${r.truceUntil}.` : undefined);
  const leader = leaderOf(state, id);
  const others = (Object.keys(state.rivals) as RivalId[]).filter((o) => o !== id && state.rivals[o].active && feudStage(state, o) >= 1);
  const opts: OpOption[] = [
    {
      kind: 'spy',
      label: 'Plant a spy',
      detail: 'Guile check. Success: their plans are known every week and the spy sends 1 Intel a week. Failure: Heat +3. Feud +5 either way.',
      cost: { intel: 4, crowns: 30 },
      blocked: r.ourSpy ? 'You already have someone inside.' : truce ? `You agreed a truce with ${name} until week ${r.truceUntil}.` : undefined,
    },
    {
      kind: 'smear',
      label: 'Spread stories about them',
      detail: `Their renown −4. Feud +8.`,
      cost: { influence: 3 },
      blocked: truce ? `You agreed a truce with ${name} until week ${r.truceUntil}.` : undefined,
    },
    {
      kind: 'poach',
      label: 'Hire away one of their people',
      detail: 'A seasoned member joins you at a high wage, with loyalty to earn. Their strength −1. Feud +10.',
      cost: { crowns: 70 },
      blocked: needStage(1) ?? (living(state).length >= rosterCap(state) ? 'Your hall is full.' : undefined),
    },
    {
      kind: 'intercept',
      label: 'Hit one of their jobs',
      detail: 'Adds an operation to your contract board: get there first and take the pay. Feud +15, Heat +5 on success.',
      cost: {},
      blocked: needStage(1) ?? (opOnBoard(state, id, 'intercept') ? 'You already have one planned.' : undefined),
    },
    {
      kind: 'raid',
      label: `Raid ${SHIPMENT[id]}`,
      detail: 'Adds an operation to your contract board. Rich pickings, Heat +10, Feud +20.',
      cost: {},
      blocked: needStage(2) ?? (opOnBoard(state, id, 'raid') ? 'You already have one planned.' : undefined),
    },
    {
      kind: 'kill',
      label: leader ? `Have ${NPCS[leader].name} killed` : 'Nobody left to kill',
      detail: 'Adds a dangerous operation to your contract board. Success changes the rival for good. Heat +25, Exchequer −15.',
      cost: {},
      target: leader,
      blocked: !leader ? 'Their leaders are already dead.' : needStage(2) ?? (opOnBoard(state, id, 'kill') ? 'You already have one planned.' : undefined),
    },
    {
      kind: 'truce',
      label: 'Offer a truce',
      detail: 'Guile check. Success: Feud −30 and no hostile moves by either side for 8 weeks. Failure: Feud +5.',
      cost: { influence: 3 },
      blocked: stage < 1 ? 'There is nothing to make peace about yet.' : truce ? 'You already have a truce.' : undefined,
    },
    {
      kind: 'tribute',
      label: 'Pay them off',
      detail: 'Feud −25. It works, and everyone hears that it works.',
      cost: { crowns: 60 + Math.round(r.feud ?? 0) },
      blocked: stage < 1 ? 'There is nothing to pay for yet.' : undefined,
    },
    {
      kind: 'pact',
      label: others.length ? `Make a pact against ${RIVALS[others[0]].name}` : 'Make a pact',
      detail: others.length ? `A 16-week truce with ${name}, and they share what they know about ${RIVALS[others[0]].name}: that rival's plans are known every week.` : 'Needs another rival you are feuding with.',
      cost: { influence: 4 },
      blocked: !others.length ? 'You need another rival you are feuding with.' : stage >= 1 ? `You are feuding with ${name} yourself.` : truce ? 'You already have an arrangement.' : undefined,
    },
  ];
  return opts;
}

function pay(state: GameState, cost: OpOption['cost']): string | undefined {
  if (cost.crowns && state.crowns < cost.crowns) return `Needs ${cost.crowns} crowns`;
  if (cost.intel && state.intel < cost.intel) return `Needs ${cost.intel} Intel`;
  if (cost.influence && state.influence < cost.influence) return `Needs ${cost.influence} Influence`;
  if (cost.crowns) spend(state, 'Operations', cost.crowns);
  if (cost.intel) state.intel -= cost.intel;
  if (cost.influence) state.influence -= cost.influence;
  return undefined;
}

const POACH_PROFS: Record<RivalId, ProfessionId[]> = { hobbs: ['envoy', 'vanguard', 'infiltrator'], ninth: ['vanguard', 'marksman', 'skirmisher'], assay: ['arcanist', 'scout'] };

export function runOperation(state: GameState, id: RivalId, kind: OpKind): string | undefined {
  const opt = operationOptions(state, id).find((o) => o.kind === kind);
  if (!opt) return 'No such operation';
  if (opt.blocked) return opt.blocked;
  const err = pay(state, opt.cost);
  if (err) return err;
  const r = state.rivals[id];
  const name = RIVALS[id].name;
  switch (kind) {
    case 'spy': {
      const c = homeChance(state, 'guile', 13);
      if (chance(state, c.chance)) {
        r.ourSpy = true;
        addDispatch(state, 'rival', `A spy inside ${name}`, [`${c.who ?? 'Your agent'} found someone on the inside who can be paid. Their plans will reach you every week.`]);
      } else {
        state.heat = clamp(state.heat + 3, 0, 100);
        addDispatch(state, 'rival', `Your spy was turned away`, [`The clerk you approached went straight to ${name}. Heat +3.`]);
      }
      raiseFeud(state, id, 5);
      break;
    }
    case 'smear':
      r.renown = Math.max(0, r.renown - 4);
      raiseFeud(state, id, 8);
      addDispatch(state, 'rival', `Stories about ${name}`, ['Your people spend a week buying drinks and telling stories. Their renown −4.']);
      break;
    case 'poach': {
      const m = createMember(state, pick(state, POACH_PROFS[id]), 2);
      m.level = 3;
      m.xp = 0;
      m.loyalty = 45;
      m.wage += 4;
      for (const a of ['might', 'finesse', 'wits', 'resolve'] as const) m.attrs[a] = Math.min(10, m.attrs[a] + 1);
      state.members.push(m);
      r.strength = Math.max(0, r.strength - 1);
      raiseFeud(state, id, 10);
      addDispatch(state, 'roster', `${m.name} leaves ${name} for you`, [`They are good, they know it, and they will want to be paid like it. Loyalty has to be earned.`]);
      break;
    }
    case 'intercept':
    case 'raid':
    case 'kill': {
      const c = operationContract(state, id, kind, opt.target);
      state.board.unshift(c);
      addDispatch(state, 'rival', `Operation planned: ${c.title}`, ['It is on your contract board. Choose the squad carefully.']);
      break;
    }
    case 'truce': {
      const c = homeChance(state, 'guile', 12 + Math.round((r.feud ?? 0) / 10));
      if (chance(state, c.chance)) {
        r.feud = Math.max(0, (r.feud ?? 0) - 30);
        r.truceUntil = state.week + 8;
        if (r.plan && r.plan.kind !== 'contract') r.plan = { kind: 'none', revealed: true, countered: false };
        addDispatch(state, 'rival', `A truce with ${name}`, [`${c.who ?? 'Your envoy'} and their people shook hands in the back of the Copper Kettle. Neither side moves against the other until week ${r.truceUntil}.`]);
      } else {
        raiseFeud(state, id, 5);
        addDispatch(state, 'rival', `${name} refuse a truce`, ['They listened, laughed, and sent your envoy home.']);
      }
      break;
    }
    case 'tribute':
      r.crowns += opt.cost.crowns ?? 0;
      r.feud = Math.max(0, (r.feud ?? 0) - 25);
      addDispatch(state, 'rival', `You paid off ${name}`, ['The money changes hands in a back room. The pressure eases, and half the city hears the price.']);
      break;
    case 'pact': {
      const other = (Object.keys(state.rivals) as RivalId[]).find((o) => o !== id && state.rivals[o].active && feudStage(state, o) >= 1)!;
      r.truceUntil = state.week + 16;
      r.pactAgainst = other;
      addDispatch(state, 'rival', `A pact with ${name}`, [`For the next sixteen weeks, ${name} leave you alone and tell you what ${RIVALS[other].name} are planning.`]);
      break;
    }
  }
  return undefined;
}

// Operation contracts reuse the mission system: the squad, odds and journal all work as usual.
const OP_TEMPLATE: Record<'intercept' | 'raid' | 'kill', string> = { intercept: 'op_intercept', raid: 'op_raid', kill: 'op_kill' };

function operationContract(state: GameState, id: RivalId, kind: 'intercept' | 'raid' | 'kill', target?: NpcId): Contract {
  const c = generateContract(state, TEMPLATE_BY_ID[OP_TEMPLATE[kind]]);
  const r = state.rivals[id];
  const name = RIVALS[id].name;
  c.op = { rival: id, kind, target };
  c.contestedBy = undefined;
  c.expiresWeek = state.week + 4;
  c.threat = clamp(Math.round(2 + r.strength / 4 + (kind === 'kill' ? 3 : kind === 'raid' ? 1 : 0)), 2, 9);
  if (kind === 'intercept') {
    c.title = `Beat ${name} to a job`;
    c.description = `${name} have a collection lined up on the Drover's Road. Get there first, do the job yourselves, and send them home empty-handed.`;
    c.reward = 70 + Math.round(r.renown * 3);
  } else if (kind === 'raid') {
    c.title = `Raid ${SHIPMENT[id]}`;
    c.description = `${SHIPMENT[id][0].toUpperCase()}${SHIPMENT[id].slice(1)} moves through the city this month. Take it.`;
    c.reward = id === 'hobbs' ? 220 : id === 'ninth' ? 160 : 90;
    c.materials = id === 'assay' ? { reagents: 8 } : id === 'ninth' ? { iron: 5 } : {};
  } else {
    const who = target ? NPCS[target].name : name;
    c.title = `The death of ${who}`;
    c.description = `${who} has to die, somewhere quiet, in a way nobody can prove. If it goes wrong, everyone will know who sent you.`;
    c.reward = 0;
  }
  return c;
}

/** Results of an operation once the squad has done it. */
export function resolveOperation(state: GameState, c: Contract, won: boolean, summary: string[]) {
  const op = c.op!;
  const r = state.rivals[op.rival];
  const name = RIVALS[op.rival].name;
  if (op.kind === 'intercept') {
    raiseFeud(state, op.rival, won ? 15 : 8);
    state.heat = clamp(state.heat + (won ? 5 : 3), 0, 100);
    if (won) {
      r.crowns = Math.max(0, r.crowns - c.reward);
      r.renown = Math.max(0, r.renown - 3);
      summary.push(`${name} lost the job, and renown with it. Heat +5`);
    } else summary.push(`${name} know who tried. Heat +3`);
  } else if (op.kind === 'raid') {
    raiseFeud(state, op.rival, 20);
    state.heat = clamp(state.heat + (won ? 10 : 6), 0, 100);
    if (won) {
      r.crowns = Math.max(0, r.crowns - c.reward);
      r.strength = Math.max(0, r.strength - 1);
      summary.push(`${name} are poorer and angrier. Heat +10`);
    } else summary.push(`The raid failed, and ${name} know exactly who to blame. Heat +6`);
  } else if (op.kind === 'kill') {
    if (won && op.target && state.npcs[op.target].status === 'alive') {
      state.npcs[op.target].status = 'dead';
      state.heat = clamp(state.heat + 25, 0, 100);
      applyStanding(state, 'exchequer', -15);
      r.feud = 100;
      summary.push(`${NPCS[op.target].name} is dead. Heat +25, Exchequer −15.`);
      afterLeaderDies(state, op.rival, op.target);
    } else {
      raiseFeud(state, op.rival, 20);
      r.aggression = clamp(r.aggression + 0.3, 0, 1);
      state.heat = clamp(state.heat + 10, 0, 100);
      summary.push(`The attempt failed. ${op.target ? NPCS[op.target].name : name} survived, and will not forget. Heat +10`);
    }
  }
}

/** What becomes of a rival when one of its leaders is killed. */
export function afterLeaderDies(state: GameState, id: RivalId, who: NpcId) {
  const r = state.rivals[id];
  if (id === 'hobbs') {
    const heir = (['marta', 'isbet'] as NpcId[]).find((n) => n !== who && state.npcs[n].status === 'alive');
    if (heir === 'isbet') {
      r.aggression = 0.75;
      r.renown = Math.max(0, r.renown - 5);
      addDispatch(state, 'rival', 'Isbet Hobb runs the firm now', [
        'Marta Hobb was buried at Saint Oda\'s with her umbrella. Isbet stood at the graveside and looked at your people the whole time. The firm is hers now, and she has no interest in being friends.',
      ]);
    } else if (heir === 'marta') {
      r.aggression = 1;
      addDispatch(state, 'rival', 'Marta Hobb buries her daughter', ['Marta does not send a cake this time. Her other daughters have been seen buying crossbows.']);
    } else {
      r.active = false;
      delete state.flags.hobbs_share;
      addDispatch(state, 'rival', 'Hobb & Daughters closes its doors', ['With Marta and Isbet both dead, the younger daughters sell the firm\'s debts to the bank and leave for the coast. Nobody collects for the Hobbs any more.']);
    }
  } else if (id === 'ninth') {
    r.active = false;
    for (const m of living(state)) if (m.traits.includes('veteran')) m.loyalty = clamp(m.loyalty - 12, 0, 100);
    addDispatch(state, 'rival', 'The Ninth break up', ['Without Mayne the company falls apart within a week. The veterans in your guild are quiet at supper, and some of them look at you differently.']);
  } else {
    r.active = false;
    r.dormantUntil = state.week + 12;
    applyStanding(state, 'exchequer', -10);
    addDispatch(state, 'rival', 'The Assay Office is in disarray', ['Master Assayer Plaice was found in the river. The Exchequer has opened an inquiry, and the Office will take a season to appoint his successor. Exchequer −10.']);
  }
}

// ---------------------------------------------------------------------------
// What rivals do to you
// ---------------------------------------------------------------------------

export type HostileKind = 'plant' | 'ambush' | 'theft' | 'bribe' | 'arson' | 'murder';

/** A hostile plan for this week, if the rival is in the mood. */
export function hostilePlan(state: GameState, id: RivalId): { kind: HostileKind; target?: string } | undefined {
  if (inTruce(state, id)) return undefined;
  const r = state.rivals[id];
  const stage = feudStage(state, id);
  const a = r.aggression;
  const spyBoost = r.theirSpy ? 0.1 : 0;
  if (stage === 2) {
    const marks = living(state).filter((m) => m.status === 'idle');
    if (marks.length && chance(state, 0.06 + a * 0.08)) {
      const famous = marks.filter((m) => (m.fame ?? 0) >= 75);
      return { kind: 'murder', target: pick(state, famous.length ? famous : marks).id };
    }
    if (chance(state, 0.08 + a * 0.08)) return { kind: 'arson' };
  }
  if (stage >= 1) {
    const away = state.missions.filter((m) => !m.report && m.contract.travelWeeks > 0 && m.arriveWeek > state.week);
    if (away.length && chance(state, 0.15 + a * 0.15 + spyBoost)) return { kind: 'ambush', target: pick(state, away).id };
    const bribable = living(state).filter((m) => m.status === 'idle' && m.loyalty < 35);
    if (bribable.length && chance(state, 0.12 + a * 0.1)) return { kind: 'bribe', target: pick(state, bribable).id };
    if (chance(state, 0.1 + a * 0.12 + spyBoost)) return { kind: 'theft' };
  }
  if ((r.feud ?? 0) >= 10 && !r.theirSpy && chance(state, 0.04 + a * 0.06)) return { kind: 'plant' };
  return undefined;
}

const AMBUSH_TAG: Record<RivalId, string> = { hobbs: 'thugs', ninth: 'soldiers', assay: 'warded' };

export function describeHostile(state: GameState, _id: RivalId, kind: HostileKind, target?: string): string {
  const m = target ? state.members.find((x) => x.id === target) : undefined;
  const ms = target ? state.missions.find((x) => x.id === target) : undefined;
  switch (kind) {
    case 'plant':
      return 'They are trying to get someone inside your guild.';
    case 'ambush':
      return `They mean to ambush your squad on "${ms?.contract.title ?? 'the road'}".`;
    case 'theft':
      return 'They are planning to rob your stores.';
    case 'bribe':
      return `They have been talking to ${m?.name ?? 'one of your people'} about money.`;
    case 'arson':
      return 'They are planning to set fire to your workshops.';
    case 'murder':
      return `They have hired a knife for ${m?.name ?? 'one of your people'}.`;
  }
}

/** Carry out a rival's hostile plan. Returns true if something happened. */
export function executeHostile(state: GameState, id: RivalId, kind: HostileKind, target?: string) {
  const name = RIVALS[id].name;
  const defense = hallDefense(state);
  raiseFeud(state, id, 3);
  switch (kind) {
    case 'plant':
      state.rivals[id].theirSpy = true; // you only find out if you catch them
      return;
    case 'ambush': {
      const ms = state.missions.find((x) => x.id === target && !x.report);
      if (!ms) return;
      const squad = ms.memberIds.map((i) => state.members.find((m) => m.id === i)!).filter(Boolean);
      const spotted = squad.some((m) => m.profession === 'scout') && chance(state, 0.4 + (squad.length >= 4 ? 0.2 : 0));
      if (spotted) {
        ms.fieldLog = [...(ms.fieldLog ?? []), `A scout spotted ${name}'s people waiting by the road, and the squad went round them.`];
        addDispatch(state, 'rival', `An ambush avoided`, [`Your squad on "${ms.contract.title}" spotted ${name}'s people in time and went round.`]);
        return;
      }
      const tag = AMBUSH_TAG[id];
      if (!ms.contract.tags.includes(tag)) ms.extraTags = [...new Set([...(ms.extraTags ?? []), tag])];
      ms.difficultyMult = (ms.difficultyMult ?? 1) * (squad.length >= 4 ? 1.08 : 1.15);
      ms.fieldLog = [...(ms.fieldLog ?? []), `${name}'s people were waiting on the road, and the squad had to fight its way through before the job had even started.`];
      addDispatch(state, 'rival', `${name} ambushed your squad`, [`Your people on "${ms.contract.title}" were attacked on the road. The job just got harder.`]);
      return;
    }
    case 'theft': {
      if (chance(state, defense)) {
        addDispatch(state, 'rival', 'Thieves driven off', [`Your guards caught ${name}'s people at the back door of the stores and sent them off with bruises.`]);
        return;
      }
      const supplies = Math.min(state.supplies, randInt(state, 5, 12));
      const crowns = Math.min(Math.max(0, state.crowns), randInt(state, 25, 60));
      state.supplies -= supplies;
      if (crowns) spend(state, 'Theft', crowns);
      addDispatch(state, 'rival', 'Your stores were robbed', [`Somebody got into the stores in the night and took ${supplies} supplies and ${crowns} crowns from the strongbox. Jory found ${name}'s mark chalked on the door.`]);
      return;
    }
    case 'bribe': {
      const m = state.members.find((x) => x.id === target);
      if (!m || m.status !== 'idle' || m.loyalty >= 35) return;
      m.status = 'left';
      m.causeOfDeath = `Took money from ${name}`;
      m.loadout = { consumables: [] };
      const spare = state.items.find((i) => !living(state).some((x) => [x.loadout.weapon, x.loadout.armor, x.loadout.trinket, ...x.loadout.consumables].includes(i.uid)));
      if (spare) state.items = state.items.filter((i) => i !== spare);
      addDispatch(state, 'rival', `${m.name} sold you out`, [`${m.name} took ${name}'s money and left in the night${spare ? ', with something from the armory' : ''}.`]);
      return;
    }
    case 'arson': {
      if (chance(state, defense)) {
        addDispatch(state, 'rival', 'A fire put out', [`Your guards caught a man with a lamp and a jar of oil by the workshop door. He works for ${name}, and he says so quite quickly.`]);
        return;
      }
      for (const k of Object.keys(state.materials) as (keyof GameState['materials'])[]) state.materials[k] = Math.floor(state.materials[k] / 2);
      state.craftQueue = [];
      if (state.construction) state.construction.progress = 0;
      spend(state, 'Repairs', 50);
      addDispatch(state, 'rival', 'Fire in the workshops', [`The workshops burned for an hour before the bucket line got it out. Half your materials are gone, the work in progress is lost, and the repairs cost 50 crowns. Nobody doubts who set it.`]);
      return;
    }
    case 'murder': {
      const m = state.members.find((x) => x.id === target);
      if (!m || m.status === 'dead' || m.status === 'left' || m.status === 'mission') return;
      if (chance(state, defense)) {
        const g = guards(state)[0];
        if (g) g.health = clamp(g.health - 15, 5, 100);
        addDispatch(state, 'rival', 'A knife in the night', [`Someone came for ${m.name} in the night. ${g ? `${g.name} was on watch and fought them off, and took a cut doing it.` : 'The hall was ready for them, and they ran.'}`]);
        return;
      }
      m.health -= 60;
      if (m.health <= 0) {
        m.status = 'dead';
        m.health = 0;
        m.diedWeek = state.week;
        m.causeOfDeath = `Murdered by agents of ${name}`;
        mournLegend(state, m);
        addDispatch(state, 'rival', `${m.name} was murdered`, [`${m.name} was found in the alley behind the Copper Kettle. Everyone knows who paid for it.`]);
      } else {
        m.status = 'recovering';
        addDispatch(state, 'rival', `${m.name} was attacked`, [`${m.name} was stabbed on the way home and barely made it back to the hall.`]);
      }
      return;
    }
  }
}

/** Weekly: feuds cool, spies are caught or lost, open war draws Heat. */
export function weeklyWar(state: GameState) {
  let atWar = false;
  for (const id of Object.keys(state.rivals) as RivalId[]) {
    const r = state.rivals[id];
    if (r.dormantUntil && state.week >= r.dormantUntil && !r.active && id === 'assay') {
      r.active = true;
      r.dormantUntil = undefined;
      r.feud = 30;
      addDispatch(state, 'rival', 'A new Master Assayer', ['The Assay Office has a new head, appointed by the Exchequer. She has read the file on Plaice, and she has read the file on you.']);
    }
    if (!r.active) continue;
    // an aggressive rival resents a guild that is catching up with it
    const threat = state.renown >= r.renown - 6 ? r.aggression * 0.7 : 0;
    r.feud = clamp((r.feud ?? 0) + (inTruce(state, id) ? -3 : threat - 0.3), 0, 100);
    if (feudStage(state, id) === 2) atWar = true;
    if (r.theirSpy && chance(state, spyCatch(state))) {
      r.theirSpy = false;
      raiseFeud(state, id, 5);
      addDispatch(state, 'rival', `A spy for ${RIVALS[id].name} caught`, ['A new cook had been reading your ledgers when nobody was looking. Your people put him on a barge downriver.']);
    }
    if (r.theirSpy) state.intel = Math.max(0, state.intel - 1);
    if (r.ourSpy) {
      if (chance(state, 0.04)) {
        r.ourSpy = false;
        raiseFeud(state, id, 8);
        addDispatch(state, 'rival', `Your spy in ${RIVALS[id].name} was found out`, ['They will not be sending any more reports.']);
      } else state.intel += 1;
    }
  }
  if (atWar) {
    state.heat = clamp(state.heat + 1, 0, 100);
    state.clocks.unrest = clamp(state.clocks.unrest + 0.2, 0, 100);
  }
}

/** Sweep the hall for spies (Intel). Finds any planted spy with a good chance. */
export const SWEEP_COST = 3;
export function sweepForSpies(state: GameState): string | undefined {
  if (state.intel < SWEEP_COST) return `Needs ${SWEEP_COST} Intel`;
  state.intel -= SWEEP_COST;
  const found = (Object.keys(state.rivals) as RivalId[]).filter((id) => state.rivals[id].theirSpy && chance(state, 0.6 + level(state, 'den') * 0.1));
  for (const id of found) {
    state.rivals[id].theirSpy = false;
    raiseFeud(state, id, 5);
  }
  addDispatch(state, 'rival', 'The hall is searched', [
    found.length ? `You found ${found.length === 1 ? 'a spy' : 'spies'} working for ${found.map((id) => RIVALS[id].name).join(' and ')}, and sent them packing.` : 'Your people turned the hall upside down and found nobody. That may mean nobody is there.',
  ]);
  return undefined;
}

