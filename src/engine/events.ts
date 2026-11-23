import { RANDOM_EVENTS, STORY_EVENTS, type EventDef } from './data/events';
import { chanceFrom, counteredTags, squadScore } from './odds';
import { chance, nextFloat, pick, uid, weighted } from './rng';
import type { EventChoice, EventEffect, GameEvent, GameState, Member } from './types';
import {
  addDispatch,
  addItem,
  addStoryContract,
  applyContractEffect,
  clamp,
  createMember,
  earn,
  living,
  spend,
} from './world';

function instantiate(state: GameState, def: EventDef): GameEvent {
  return {
    uid: uid(state, 'e'),
    defId: def.id,
    title: def.title,
    text: typeof def.text === 'function' ? def.text(state) : def.text,
    choices: typeof def.choices === 'function' ? def.choices(state) : def.choices,
    week: state.week,
  };
}

export function triggerEvents(state: GameState) {
  for (const def of STORY_EVENTS) {
    if (state.eventWeeks[def.id] !== undefined) continue;
    if ((def.week ?? 0) > state.week) continue;
    if (def.condition && !def.condition(state)) continue;
    state.eventWeeks[def.id] = state.week;
    state.pendingEvents.push(instantiate(state, def));
    return; // at most one story beat per week
  }
  if (state.week <= 2) return;
  if (!chance(state, 0.4)) return;
  const eligible = RANDOM_EVENTS.filter((d) => {
    const last = state.eventWeeks[d.id];
    if (last !== undefined && state.week - last < (d.cooldown ?? 6)) return false;
    return !d.condition || d.condition(state);
  });
  if (!eligible.length) return;
  const def = weighted(state, eligible.map((d) => ({ item: d, weight: d.weight ?? 1 })));
  state.eventWeeks[def.id] = state.week;
  state.pendingEvents.push(instantiate(state, def));
}

/** Members at home who can handle an event check. */
function homeMembers(state: GameState): Member[] {
  return living(state).filter((m) => m.status !== 'mission');
}

export function eventCheckChance(state: GameState, choice: EventChoice): number | undefined {
  if (!choice.check) return undefined;
  const members = homeMembers(state);
  if (!members.length) return 0.03;
  // the best single member makes the attempt
  let best = 0;
  for (const m of members) {
    const s = squadScore(state, choice.check.approach, { tags: ['urban'], countered: counteredTags(state, [m], []), members: [m] }).score;
    best = Math.max(best, s);
  }
  return chanceFrom(best, choice.check.difficulty);
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
  if (choice.check) {
    const p = eventCheckChance(state, choice) ?? 0;
    const ok = nextFloat(state) < p;
    if (!ok) {
      effects = choice.failEffects ?? {};
      text = choice.failText ?? 'It did not go well.';
    }
    text = `(${ok ? 'Success' : 'Failure'} at ${Math.round(p * 100)}%) ${text}`;
  }
  const lines: string[] = [];
  applyEventEffect(state, effects, ev.defId, lines);
  state.pendingEvents = state.pendingEvents.filter((e) => e.uid !== eventUid);
  addDispatch(state, ev.defId in storyIds ? 'story' : 'info', `${ev.title}: ${choice.label}`, [text, ...lines]);
  return undefined;
}

const storyIds: Record<string, true> = Object.fromEntries(STORY_EVENTS.map((e) => [e.id, true]));

export function applyEventEffect(state: GameState, e: EventEffect, sourceId: string, lines: string[]) {
  if (e.crowns) {
    if (e.crowns > 0) earn(state, 'Events', e.crowns);
    else spend(state, 'Events', -e.crowns);
    lines.push(`${e.crowns > 0 ? '+' : ''}${e.crowns} crowns`);
  }
  if (e.supplies) {
    state.supplies = Math.max(0, state.supplies + e.supplies);
    lines.push(`${e.supplies > 0 ? '+' : ''}${e.supplies} supplies`);
  }
  if (e.intel) {
    state.intel = Math.max(0, state.intel + e.intel);
    lines.push(`${e.intel > 0 ? '+' : ''}${e.intel} intel`);
  }
  applyContractEffect(state, e, lines);
  if (e.morale) for (const m of living(state)) m.morale = clamp(m.morale + e.morale, 0, 100);
  if (e.loyalty) for (const m of living(state)) m.loyalty = clamp(m.loyalty + e.loyalty, 0, 100);
  if (e.rivalRenown) state.rivals.hobbs.renown += e.rivalRenown;
  if (e.rivalAggression) state.rivals.hobbs.aggression = clamp(state.rivals.hobbs.aggression + e.rivalAggression, 0, 1);
  if (e.grantItem) {
    addItem(state, e.grantItem);
    lines.push('Item added to the armory.');
  }
  if (e.unlockContract) {
    addStoryContract(state, e.unlockContract);
    lines.push('New contract on the board.');
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
  if (e.flag) {
    state.flags[e.flag] = true;
    if (e.flag === 'start_arms') {
      addItem(state, 'mail_hauberk');
      addItem(state, 'fire_oil');
      addItem(state, 'fire_oil');
      lines.push('A Mail Hauberk and 2 Fire Oils are added to the armory.');
    }
    if (e.flag === 'bank_paid_loan' && state.loans[0]) {
      state.loans[0].principal = Math.max(0, state.loans[0].principal - 200);
      lines.push('Your loan is reduced by 200 crowns.');
    }
  }
}
