import { APPROACH_INFO, PROFESSIONS } from './data/professions';
import { TAGS } from './data/tags';
import { chanceFrom, counteredTags, itemDef, phaseDifficulty, squadScore, trueTags, type SquadContext } from './odds';
import { nextFloat, pick } from './rng';
import type { GameState, MaterialId, Member, Mission, MissionReport, OutcomeTier, PhaseLog, PhaseResult } from './types';
import { addRecord, homewardJournal, outboundJournal, phaseStory } from './narrative';
import { addDispatch, applyContractEffect, earn, clamp, factionName, MATERIAL_INFO, removeItem, xpToLevel, ATTRS } from './world';

const RESULT_TEXT: Record<PhaseResult, string> = {
  strong: 'Decisive success',
  success: 'Success',
  fail: 'Failure',
  severe: 'Disaster',
};

const CHAIN: Record<PhaseResult, number> = { strong: 0.85, success: 0.95, fail: 1.1, severe: 1.25 };

export function rollPhase(p: number, r: number): PhaseResult {
  if (r < p * 0.35) return 'strong';
  if (r < p) return 'success';
  if (r < p + (1 - p) * 0.55) return 'fail';
  return 'severe';
}

export function resolveMission(state: GameState, mission: Mission): MissionReport {
  const c = mission.contract;
  const squad = mission.memberIds.map((id) => state.members.find((m) => m.id === id)!).filter(Boolean);
  const tags = trueTags(c);
  const tagDanger = Math.max(1, ...tags.map((t) => TAGS[t]?.danger ?? 1));
  const logs: PhaseLog[] = [];
  const casualties: string[] = [];
  const woundMap = new Map<string, number>();
  const usedDraught = new Set<string>();
  let chain = 1;
  let retreated = false;

  const alive = () => squad.filter((m) => !casualties.includes(m.id));
  const outbound = outboundJournal(state, c, squad);
  const leads = new Map<string, string[]>(); // member id -> phases led
  const introduced = new Set<string>();

  for (let i = 0; i < c.phases.length; i++) {
    const phase = c.phases[i];
    const approach = mission.approaches[i] ?? phase.approaches[0];
    const members = alive();
    if (members.length === 0) break;
    const ctx: SquadContext = { tags, countered: counteredTags(state, members, tags), members };
    const score = squadScore(state, approach, ctx);
    const diff = phaseDifficulty(state, c, phase, approach, ctx).value * chain;
    const p = chanceFrom(score.score, diff);
    const result = rollPhase(p, nextFloat(state));
    chain = CHAIN[result];
    const lines: string[] = [];
    lines.push(`${APPROACH_INFO[approach].name} at ${Math.round(p * 100)}%: ${RESULT_TEXT[result]}.`);

    // wounds
    const base = (10 + c.threat * 4) * phase.danger * tagDanger;
    let mult = 0;
    let hits = 0;
    if (result === 'severe') {
      mult = 2.1;
      hits = members.length >= 4 ? 3 : 2;
    } else if (result === 'fail') {
      mult = 1;
      hits = members.length >= 4 ? 2 : 1;
    } else if (result === 'success' && approach === 'assault') {
      mult = 0.3;
      hits = 1;
    }
    const pool = [...members];
    for (let h = 0; h < hits && pool.length; h++) {
      const idx = Math.floor(nextFloat(state) * pool.length);
      const victim = pool.splice(idx, 1)[0];
      const prot = itemDef(state, victim.loadout.armor)?.protection ?? 0;
      const wound = Math.round(base * mult * (0.6 + nextFloat(state) * 0.8) * Math.max(0.4, 1 - prot * 0.07));
      if (wound <= 0) continue;
      victim.health -= wound;
      woundMap.set(victim.id, (woundMap.get(victim.id) ?? 0) + wound);
      if (victim.health <= 0) {
        const draught = victim.loadout.consumables.find((uid) => itemDef(state, uid)?.mending && !usedDraught.has(uid));
        const chaplain = members.find((m) => m.id !== victim.id && m.profession === 'chaplain' && !casualties.includes(m.id));
        if (draught) {
          usedDraught.add(draught);
          victim.health = 8;
          lines.push(`${victim.name} fell, but a healing draught kept them breathing.`);
        } else if (chaplain && nextFloat(state) < 0.5) {
          victim.health = 5;
          lines.push(`${victim.name} was struck down. ${chaplain.name} pulled them back from the edge.`);
        } else {
          victim.health = 0;
          casualties.push(victim.id);
          lines.push(`${victim.name} was killed.`);
        }
      } else if (wound >= 25) {
        lines.push(`${victim.name} was badly wounded (−${wound}).`);
      } else {
        lines.push(`${victim.name} was hurt (−${wound}).`);
      }
    }
    for (const m of members) {
      m.fatigue = clamp(m.fatigue + 6, 0, 100);
      m.xp += result === 'strong' || result === 'success' ? 2 : 1;
    }
    const leadEntry = [...score.members].sort((a, b) => b.score - a.score)[0];
    const lead = members.find((m) => m.id === leadEntry?.id) ?? members[0];
    const story = phaseStory(state, {
      contract: c,
      phaseIndex: i,
      approach,
      result,
      squad: members,
      lead,
      tags,
      countered: ctx.countered,
      scores: score.members.map((x) => ({ id: x.id, score: x.score })),
      introduced,
    });
    if (result === 'strong' || result === 'success') leads.set(lead.id, [...(leads.get(lead.id) ?? []), phase.name]);
    logs.push({ phase: phase.name, approach, chance: p, result, lines, story, lead: lead.id });

    const isLast = i === c.phases.length - 1;
    if (!isLast && mission.retreatOnCritical && alive().some((m) => m.health <= 25)) {
      retreated = true;
      logs[logs.length - 1].lines.push('A member is critically wounded. Following your orders, the squad withdraws.');
      break;
    }
  }

  // ---- outcome ----
  const last = logs[logs.length - 1];
  const objectiveOk = !retreated && logs.length === c.phases.length && (last?.result === 'strong' || last?.result === 'success');
  const fails = logs.filter((l) => l.result === 'fail' || l.result === 'severe').length;
  const severes = logs.filter((l) => l.result === 'severe').length;
  const strongs = logs.filter((l) => l.result === 'strong').length;
  let tier: OutcomeTier;
  if (objectiveOk) {
    if (fails === 0 && strongs >= 1) tier = 'Triumph';
    else if (fails <= 1) tier = 'Success';
    else tier = 'Costly Success';
    if (casualties.length > 0 && tier !== 'Costly Success') tier = 'Costly Success';
  } else {
    tier = severes >= 2 || casualties.length > 0 ? 'Disaster' : 'Failure';
  }

  const summary: string[] = [];
  const rewardMult = tier === 'Triumph' ? 1.25 : tier === 'Success' ? 1 : tier === 'Costly Success' ? 0.8 : 0;
  let reward = Math.round(c.reward * rewardMult);
  const materials: Partial<Record<MaterialId, number>> = {};
  if (rewardMult > 0) {
    for (const [k, v] of Object.entries(c.materials)) {
      const amt = tier === 'Costly Success' ? Math.floor(v! / 2) : tier === 'Triumph' ? v! + 1 : v!;
      if (amt > 0) {
        materials[k as MaterialId] = amt;
        state.materials[k as MaterialId] += amt;
      }
    }
    if (state.flags.hobbs_share && reward > 0) {
      const cut = Math.round(reward * 0.25);
      reward -= cut;
      state.rivals.hobbs.crowns += cut;
      summary.push(`Hobb & Daughters took their quarter share: ${cut} crowns.`);
    }
    earn(state, 'Contracts', reward);
    summary.push(`Paid ${reward} crowns.`);
    const mats = Object.entries(materials).map(([k, v]) => `${v} ${MATERIAL_INFO[k as MaterialId].name}`);
    if (mats.length) summary.push(`Recovered ${mats.join(', ')}.`);
    applyContractEffect(state, c.onSuccess, summary);
    if (tier === 'Triumph') {
      state.renown += 2;
      summary.push('Renown +2 for a flawless job');
    }
  } else {
    applyContractEffect(state, c.onFailure, summary);
    if (tier === 'Disaster') {
      state.factions[c.patron].standing = clamp(state.factions[c.patron].standing - 3, -100, 100);
      state.renown = Math.max(0, state.renown - 2);
      summary.push(`${factionName(c.patron)} is furious. Renown −2`);
    }
  }

  if (c.templateId === 'silver_convoy') {
    state.flags[rewardMult > 0 ? 'silver_delivered' : 'silver_lost'] = true;
  }

  // morale, casualties, consumables
  const moraleDelta = tier === 'Triumph' ? 10 : tier === 'Success' ? 6 : tier === 'Costly Success' ? 0 : tier === 'Failure' ? -8 : -15;
  for (const m of squad) {
    if (casualties.includes(m.id)) {
      m.status = 'dead';
      m.diedWeek = state.week;
      m.causeOfDeath = `Killed on "${c.title}"`;
      addRecord(m, `Week ${state.week} · Fell on "${c.title}".`);
      for (const uid of [m.loadout.weapon, m.loadout.armor, m.loadout.trinket]) if (uid && nextFloat(state) < 0.5) removeItem(state, uid);
      continue;
    }
    m.morale = clamp(m.morale + moraleDelta - casualties.length * 10, 0, 100);
    m.missions += 1;
    {
      const led = leads.get(m.id);
      const hurt = woundMap.get(m.id);
      const bits = [led?.length ? `led ${led.join(' and ')}` : '', hurt && hurt >= 25 ? 'badly wounded' : '', usedDraught.size && m.loadout.consumables.some((u) => usedDraught.has(u)) ? 'saved by a draught' : '']
        .filter(Boolean)
        .join('; ');
      addRecord(m, `Week ${state.week} · "${c.title}": ${tier}${bits ? ` (${bits})` : ''}.`);
    }
    for (const uid of [...m.loadout.consumables]) {
      const d = itemDef(state, uid);
      // healing draughts only vanish if used
      if (d?.mending && !usedDraught.has(uid)) continue;
      removeItem(state, uid);
    }
    levelUp(state, m);
  }
  if (casualties.length) {
    for (const m of state.members) if (m.status !== 'dead' && m.status !== 'left' && !squad.includes(m)) m.morale = clamp(m.morale - 5 * casualties.length, 0, 100);
  }

  const report: MissionReport = {
    tier,
    phases: logs,
    casualties,
    wounded: [...woundMap.entries()].map(([id, amount]) => ({ id, amount })),
    reward,
    materials,
    summary,
    outbound,
    homeward: homewardJournal(
      state,
      c,
      squad,
      squad.filter((m) => casualties.includes(m.id)),
      tier,
    ),
  };
  mission.report = report;

  const deadNames = casualties.map((id) => state.members.find((m) => m.id === id)!.name);
  addDispatch(
    state,
    'mission',
    `${tier}: ${c.title}`,
    [
      `A rider brings word from ${c.region}.`,
      ...(deadNames.length ? [`Fallen: ${deadNames.join(', ')}.`] : []),
      ...summary,
      mission.returnWeek > state.week ? `The squad will be home in ${mission.returnWeek - state.week} week(s).` : 'The squad is home.',
    ],
    mission.id,
  );
  return report;
}

export function levelUp(state: GameState, m: Member) {
  while (m.xp >= xpToLevel(m.level)) {
    m.xp -= xpToLevel(m.level);
    m.level += 1;
    m.wage += 1;
    const prof = PROFESSIONS[m.profession];
    // favor the profession's strongest base attributes
    const weightedAttrs = ATTRS.flatMap((a) => Array(prof.base[a]).fill(a) as string[]);
    let attr = pick(state, weightedAttrs) as keyof Member['attrs'];
    if (m.attrs[attr] >= 10) attr = ATTRS.find((a) => m.attrs[a] < 10) ?? attr;
    m.attrs[attr] = clamp(m.attrs[attr] + 1, 1, 10);
    addDispatch(state, 'roster', `${m.name} reached level ${m.level}`, [`${attr[0].toUpperCase()}${attr.slice(1)} +1. Wage is now ${m.wage}/week.`]);
  }
}
