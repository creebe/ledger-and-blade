import { EVENT_DEFS, STORY_IDS } from '../data/registry';
import { RANDOM_EVENTS, STORY_EVENTS, type EventDef } from '../data/events';
import { raiseFeud } from '../rivals/war';
import { ARRIVAL, FIELD_EVENTS, needsArrivalReport, replanned, squadOf } from '../data/field';
import { withdrawMission } from '../missions/missions';
import { TRAITS } from '../data/traits';
import { chanceFrom, counteredTags, squadScore } from '../missions/odds';
import { chance, nextFloat, pick, uid, weighted } from '../core/rng';
import type { EventChoice, EventEffect, GameEvent, GameState, Member } from '../core/types';
import { addDispatch, clamp, living } from '../core/util';
import { addItem } from '../economy/items';
import { addStoryContract } from '../economy/board';
import { applyContractEffect, earn, spend } from '../core/effects';
import { createMember } from '../people/members';

function memberOf(state: GameState, ev: { memberId?: string }): Member | undefined {
  return ev.memberId ? state.members.find((m) => m.id === ev.memberId) : undefined;
}

/** Fill the event's visible text, speaker and choices from its current node. */
function enterNode(state: GameState, ev: GameEvent, nodeId?: string) {
  const def = EVENT_DEFS[ev.defId];
  const m = memberOf(state, ev);
  const node = nodeId ? def.nodes?.[nodeId] : undefined;
  const src = node ?? def;
  ev.node = nodeId;
  ev.text = typeof src.text === 'function' ? src.text(state, m) : src.text;
  ev.speaker = src.speaker;
  const choices = typeof src.choices === 'function' ? src.choices(state, m) : src.choices;
  ev.choices = choices.filter((c) => (!c.ifFlag || state.flags[c.ifFlag]) && (!c.ifNotFlag || !state.flags[c.ifNotFlag]));
}

function instantiate(state: GameState, def: EventDef, member?: Member, missionId?: string): GameEvent {
  const ev: GameEvent = { uid: uid(state, 'e'), defId: def.id, title: def.title, text: '', choices: [], week: state.week, transcript: [], memberId: member?.id, missionId };
  enterNode(state, ev);
  return ev;
}

/** Decisions for squads in the field: road encounters and arrival reports. */
function triggerFieldEvents(state: GameState) {
  for (const ms of state.missions) {
    if (ms.report || ms.contract.travelWeeks === 0) continue;
    if (state.week <= ms.dispatchedWeek || state.week > ms.arriveWeek) continue;
    if (ms.fieldWeeks?.includes(state.week)) continue;
    const squad = squadOf(state, ms);
    if (!squad.length) continue;
    const who = pick(state, squad);
    let def: EventDef | undefined;
    if (state.week === ms.arriveWeek && needsArrivalReport(state, ms)) def = ARRIVAL;
    else if (chance(state, state.week === ms.arriveWeek ? 0.3 : 0.55)) {
      const eligible = FIELD_EVENTS.filter((d) => {
        const last = state.eventWeeks[d.id];
        if (last !== undefined && state.week - last < (d.cooldown ?? 3)) return false;
        return (!d.member || d.member(state, who)) && (!d.condition || d.condition(state));
      });
      if (eligible.length) def = weighted(state, eligible.map((d) => ({ item: d, weight: d.weight ?? 1 })));
    }
    if (!def) continue;
    ms.fieldWeeks = [...(ms.fieldWeeks ?? []), state.week];
    state.eventWeeks[def.id] = state.week;
    const ev = instantiate(state, def, who, ms.id);
    ev.title = def.id === 'field_arrival' ? `Field report: ${ms.contract.title}` : `On the road: ${def.title}`;
    state.pendingEvents.push(ev);
  }
}

export function triggerEvents(state: GameState) {
  triggerFieldEvents(state);
  // a new Legend is named the week after they earn it
  for (const id of state.pendingLegends ?? []) {
    const m = state.members.find((x) => x.id === id && x.status !== 'dead' && x.status !== 'left');
    if (m) state.pendingEvents.push(instantiate(state, EVENT_DEFS.legend_named, m));
  }
  state.pendingLegends = [];
  // story beats: each fires once, somewhere inside its window
  for (const def of STORY_EVENTS) {
    if (state.eventWeeks[def.id] !== undefined) continue;
    const [from, to] = def.window ?? [1, 1];
    if (state.week < from) continue;
    if (def.condition && !def.condition(state)) continue;
    if (!npcsAvailable(state, def)) continue;
    if ((def.after ?? []).some((id) => state.eventWeeks[id] === undefined || state.eventWeeks[id] === state.week)) continue;
    const focus = def.member ? living(state).filter((m) => def.member!(state, m)).sort((a, b) => b.level - a.level || b.xp - a.xp)[0] : undefined;
    if (def.member && !focus) continue;
    const forced = state.week >= to;
    if (!forced && !chance(state, def.chance ?? 0.45)) continue;
    state.eventWeeks[def.id] = state.week;
    state.pendingEvents.push(instantiate(state, def, focus));
    return; // at most one story beat per week
  }
  if (state.week <= 2) return;
  if (!chance(state, 0.4)) return;
  const eligible: { def: EventDef; members: Member[] }[] = [];
  for (const d of RANDOM_EVENTS) {
    const last = state.eventWeeks[d.id];
    if (last !== undefined && state.week - last < (d.cooldown ?? 6)) continue;
    if (d.condition && !d.condition(state)) continue;
    if (!npcsAvailable(state, d)) continue;
    const members = d.member ? living(state).filter((m) => d.member!(state, m)) : [];
    if (d.member && !members.length) continue;
    eligible.push({ def: d, members });
  }
  if (!eligible.length) return;
  const choice = weighted(state, eligible.map((e) => ({ item: e, weight: e.def.weight ?? 1 })));
  state.eventWeeks[choice.def.id] = state.week;
  state.pendingEvents.push(instantiate(state, choice.def, choice.members.length ? pick(state, choice.members) : undefined));
}

export function npcsAvailable(state: GameState, def: EventDef): boolean {
  return (def.npcs ?? []).every((id) => state.npcs[id]?.status === 'alive');
}

/** Members at home who can handle an event check. */
function homeMembers(state: GameState): Member[] {
  return living(state).filter((m) => m.status !== 'mission');
}

export function eventCheckChance(state: GameState, choice: EventChoice, ev?: GameEvent): number | undefined {
  return checkDetail(state, choice, ev)?.chance;
}

/** Checks are made by the best member present: the squad for field events, otherwise whoever is at home. */
export function checkDetail(state: GameState, choice: EventChoice, ev?: GameEvent): { chance: number; who?: string } | undefined {
  if (!choice.check) return undefined;
  const ms = ev?.missionId ? state.missions.find((m) => m.id === ev.missionId) : undefined;
  const members = ms ? squadOf(state, ms) : homeMembers(state);
  if (!members.length) return { chance: 0.03 };
  let best = 0;
  let who: string | undefined;
  for (const m of members) {
    const s = squadScore(state, choice.check.approach, { tags: ['urban'], countered: counteredTags(state, [m], []), members: [m] }).score;
    if (s > best) {
      best = s;
      who = m.name;
    }
  }
  return { chance: chanceFrom(best, choice.check.difficulty), who };
}

export function canChoose(state: GameState, choice: EventChoice): string | undefined {
  const r = choice.requires;
  if (!r) return undefined;
  if (r.crowns && state.crowns < r.crowns) return `Needs ${r.crowns} crowns`;
  if (r.supplies && state.supplies < r.supplies) return `Needs ${r.supplies} supplies`;
  if (r.influence && state.influence < r.influence) return `Needs ${r.influence} influence`;
  if (r.intel && state.intel < r.intel) return `Needs ${r.intel} intel`;
  return undefined;
}

export function resolveEvent(state: GameState, eventUid: string, choiceIndex: number): string | undefined {
  const ev = state.pendingEvents.find((e) => e.uid === eventUid);
  if (!ev) return 'No such event';
  const choice = ev.choices[choiceIndex];
  if (!choice) return 'No such choice';
  const blocked = canChoose(state, choice);
  if (blocked) return blocked;
  let effects = choice.effects;
  let text = choice.resultText;
  let next = choice.next;
  let checkNote = '';
  if (choice.check) {
    const p = eventCheckChance(state, choice, ev) ?? 0;
    const ok = nextFloat(state) < p;
    if (!ok) {
      effects = choice.failEffects ?? {};
      text = choice.failText ?? '';
      next = choice.failNext ?? choice.next;
    }
    checkNote = `${ok ? 'Success' : 'Failure'} at ${Math.round(p * 100)}%`;
  }
  const lines: string[] = [];
  applyEventEffect(state, effects, ev, lines);
  ev.transcript = [...(ev.transcript ?? []), { choice: choice.label, reply: [checkNote && `(${checkNote})`, text, ...lines].filter(Boolean).join(' ') }];

  if (next && EVENT_DEFS[ev.defId]?.nodes?.[next]) {
    enterNode(state, ev, next);
    return undefined;
  }
  state.pendingEvents = state.pendingEvents.filter((e) => e.uid !== eventUid);
  const summary = (ev.transcript ?? []).map((t) => `▸ ${t.choice}${t.reply ? `: ${t.reply}` : ''}`);
  addDispatch(state, STORY_IDS[ev.defId] ? 'story' : ev.missionId ? 'mission' : 'info', ev.title, summary);
  return undefined;
}

export function applyEventEffect(state: GameState, e: EventEffect, ev: GameEvent, lines: string[]) {
  const sourceId = ev.defId;
  if (e.crowns) {
    if (e.crowns > 0) earn(state, 'Events', e.crowns);
    else spend(state, 'Events', -e.crowns);
    lines.push(`${e.crowns > 0 ? '+' : ''}${e.crowns} crowns.`);
  }
  if (e.supplies) {
    state.supplies = Math.max(0, state.supplies + e.supplies);
    lines.push(`${e.supplies > 0 ? '+' : ''}${e.supplies} supplies.`);
  }
  if (e.intel) {
    state.intel = Math.max(0, state.intel + e.intel);
    lines.push(`${e.intel > 0 ? '+' : ''}${e.intel} intel.`);
  }
  const cl: string[] = [];
  applyContractEffect(state, e, cl);
  lines.push(...cl.map((l) => `${l}.`));
  if (e.morale) for (const m of living(state)) m.morale = clamp(m.morale + e.morale, 0, 100);
  if (e.loyalty) for (const m of living(state)) m.loyalty = clamp(m.loyalty + e.loyalty, 0, 100);
  const rival = state.rivals[e.rival ?? 'hobbs'];
  if (e.rivalRenown) rival.renown = Math.max(0, rival.renown + e.rivalRenown);
  if (e.rivalAggression) rival.aggression = clamp(rival.aggression + e.rivalAggression, 0, 1);
  if (e.feud) raiseFeud(state, e.rival ?? 'hobbs', e.feud);
  if (e.unflag) delete state.flags[e.unflag];
  for (const f of e.flags ?? []) {
    state.flags[f] = true;
    if (f === 'ninth_active') state.rivals.ninth.active = true;
    if (f === 'assay_active') state.rivals.assay.active = true;
  }
  if (e.addTag) {
    const { template, tag } = e.addTag;
    const c = state.board.find((x) => x.templateId === template);
    const ms = state.missions.find((x) => x.contract.templateId === template && !x.report);
    if (c && !c.tags.includes(tag)) c.tags.push(tag);
    else if (ms && !ms.contract.tags.includes(tag) && !(ms.extraTags ?? []).includes(tag)) ms.extraTags = [...(ms.extraTags ?? []), tag];
  }
  if (e.grantItem) {
    addItem(state, e.grantItem);
    lines.push('Item added to the armory.');
  }
  if (e.unlockContract) {
    addStoryContract(state, e.unlockContract);
    if (e.unlockContract === 'silver_convoy' && state.flags.silver_bonus) {
      const c = state.board.find((x) => x.templateId === 'silver_convoy');
      if (c) c.reward += 60;
    }
    lines.push('New contract on the board.');
  }
  if (e.revealContract) {
    const c = state.board.find((x) => (e.revealContract === 'any' || x.templateId === e.revealContract) && x.hidden.some((h) => !h.revealed));
    const h = c?.hidden.find((x) => !x.revealed);
    if (c && h) {
      h.revealed = true;
      lines.push(`Revealed on "${c.title}": ${h.trueTag}.`);
    }
  }
  if (e.freeRecruit) {
    const m = createMember(state, sourceId === 'charter' ? 'arcanist' : pick(state, ['skirmisher', 'scout', 'vanguard', 'marksman'] as const));
    if (sourceId !== 'charter') {
      m.wage = Math.max(4, m.wage - 3);
      m.loyalty = 75;
    }
    state.members.push(m);
    lines.push(`${m.name} joins the guild.`);
  }
  if (e.wounds) {
    const pool = homeMembers(state);
    if (pool.length) {
      const v = pick(state, pool);
      v.health = Math.max(10, v.health - e.wounds);
      lines.push(`${v.name} was hurt.`);
    }
  }
  if (e.member) {
    const m = memberOf(state, ev);
    if (m) {
      const x = e.member;
      if (x.morale) m.morale = clamp(m.morale + x.morale, 0, 100);
      if (x.loyalty) m.loyalty = clamp(m.loyalty + x.loyalty, 0, 100);
      if (x.health) m.health = clamp(m.health + x.health, 5, 100);
      if (x.fatigue) m.fatigue = clamp(m.fatigue + x.fatigue, 0, 100);
      if (x.wage) m.wage += x.wage;
      if (x.xp) m.xp += x.xp;
      // traits from events are a coin flip, never guaranteed
      if (x.trait && !m.traits.includes(x.trait) && chance(state, 0.4)) {
        m.traits.push(x.trait);
        lines.push(`${m.name.split(' ')[0]} is now ${TRAITS[x.trait]?.name ?? x.trait}.`);
      }
      if (x.removeTrait) m.traits = m.traits.filter((t) => t !== x.removeTrait);
      if (x.epithet) m.epithet = x.epithet;
      if (x.signature) m.signature = x.signature;
      if (x.leaves && m.status !== 'mission') {
        m.status = 'left';
        m.causeOfDeath = 'Left the guild';
        m.loadout = { consumables: [] };
        lines.push(`${m.name} leaves the guild. Their gear stays in the armory.`);
      }
    }
  }
  if (e.mission || e.log) {
    const ms = ev.missionId ? state.missions.find((m) => m.id === ev.missionId) : undefined;
    if (ms) applyMissionEffect(state, ms, e, lines);
  }
  for (const x of [e.npc, ...(e.npcs ?? [])]) {
    if (!x) continue;
    const n = state.npcs[x.id];
    if (x.attitude) n.attitude = clamp(n.attitude + x.attitude, -100, 100);
    if (x.status) n.status = x.status;
  }
  if (e.flag) {
    state.flags[e.flag] = true;
    if (e.flag === 'start_arms') {
      addItem(state, 'mail_hauberk');
      addItem(state, 'fire_oil');
      addItem(state, 'fire_oil');
      lines.push('A Mail Hauberk and 2 Fire Oils are added to the armory.');
    }
    if (e.flag === 'ninth_active') state.rivals.ninth.active = true;
    if (e.flag === 'assay_active') state.rivals.assay.active = true;
    if (e.flag === 'bank_paid_loan' && state.loans[0]) {
      state.loans[0].principal = Math.max(0, state.loans[0].principal - 200);
      lines.push('Your loan is reduced by 200 crowns.');
    }
  }
}

function applyMissionEffect(state: GameState, ms: GameState['missions'][number], e: EventEffect, lines: string[]) {
  const x = e.mission ?? {};
  const squad = squadOf(state, ms);
  if (e.log) ms.fieldLog = [...(ms.fieldLog ?? []), e.log];
  if (x.reveal) {
    const hidden = ms.contract.hidden.filter((h) => !h.revealed);
    for (const h of hidden) h.revealed = true;
    if (hidden.length) lines.push(`Now known: ${hidden.map((h) => h.trueTag).join(', ')}.`);
  }
  if (x.tag && !ms.contract.tags.includes(x.tag) && !(ms.extraTags ?? []).includes(x.tag)) {
    ms.extraTags = [...(ms.extraTags ?? []), x.tag];
    lines.push(`The squad will also face: ${x.tag}.`);
  }
  if (x.chain) ms.chainStart = (ms.chainStart ?? 1) * x.chain;
  if (x.difficulty) ms.difficultyMult = (ms.difficultyMult ?? 1) * x.difficulty;
  if (x.reward) ms.bonusReward = (ms.bonusReward ?? 0) + x.reward;
  if (x.delay) {
    ms.arriveWeek += x.delay;
    ms.returnWeek += x.delay;
    lines.push(`Delayed ${x.delay} week.`);
  }
  if (x.supplies) {
    state.supplies = Math.max(0, state.supplies + x.supplies);
    lines.push(`${x.supplies > 0 ? '+' : ''}${x.supplies} supplies.`);
  }
  if (x.fatigue) for (const m of squad) m.fatigue = clamp(m.fatigue + x.fatigue, 0, 100);
  if (x.wounds && squad.length) {
    const v = pick(state, squad);
    v.health = Math.max(10, v.health - x.wounds);
    lines.push(`${v.name} was hurt.`);
  }
  if (x.approaches === 'best') ms.approaches = replanned(state, ms);
  if (x.withdraw) withdrawMission(state, ms);
}
