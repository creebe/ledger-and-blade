// Decisions while a squad is in the field. They fire at the start of a week
// for squads on the road, and when a squad arrives at the job. Text and choice
// functions receive one squad member; missionOf() finds their mission.
import { bestApproaches, chanceFrom, counteredTags, knownTags, previewMission, squadScore, trueTags } from '../odds';
import type { Approach, Contract, EventChoice, GameState, Member, Mission } from '../types';
import { TAGS } from './tags';
import type { EventDef } from './events';
import { APPROACH_INFO } from './professions';
import { seasonOf } from './events';

export function missionOf(s: GameState, m?: Member): Mission | undefined {
  return m ? s.missions.find((x) => x.id === m.missionId) : undefined;
}
export function squadOf(s: GameState, ms?: Mission): Member[] {
  return ms ? ms.memberIds.map((id) => s.members.find((x) => x.id === id)!).filter((x) => x && x.status === 'mission') : [];
}
const first = (m?: Member) => (m ? m.name.split(' ')[0] : 'The squad');
const pct = (p: number) => `${Math.round(p * 100)}%`;

/** The job as it really is: hidden tags revealed, plus anything the road added. */
function revealedContract(ms: Mission): Contract {
  return { ...ms.contract, tags: [...trueTags(ms.contract), ...(ms.extraTags ?? [])], hidden: [] };
}

function objectiveOdds(s: GameState, ms: Mission, approaches = ms.approaches) {
  const squad = squadOf(s, ms);
  const pv = previewMission(s, revealedContract(ms), squad, approaches);
  return { weakest: Math.min(...pv.phases.map((p) => p.min)), objective: pv.phases[pv.phases.length - 1]?.min ?? 0 };
}

/** Best single squad member's chance at a field check (for detail text). */
export function squadCheck(s: GameState, ms: Mission | undefined, approach: Approach, difficulty: number) {
  const squad = squadOf(s, ms);
  let best = 0;
  if (!ms) return 0;
  for (const m of squad) best = Math.max(best, squadScore(s, approach, { tags: knownTags(ms.contract), countered: counteredTags(s, [m], []), members: [m] }).score);
  return chanceFrom(best, difficulty);
}

/** Worth a report on arrival: something is still unknown, or the plan looks shaky. */
export function needsArrivalReport(s: GameState, ms: Mission): boolean {
  return ms.contract.hidden.some((h) => !h.revealed) || objectiveOdds(s, ms).objective < 0.55;
}

export function replanned(s: GameState, ms: Mission) {
  return bestApproaches(s, revealedContract(ms), squadOf(s, ms));
}

export const ARRIVAL: EventDef = {
  id: 'field_arrival',
  title: 'Field report',
  text: (s, m) => {
    const ms = missionOf(s, m)!;
    const real = revealedContract(ms);
    const unknown = ms.contract.hidden.filter((h) => !h.revealed).map((h) => TAGS[h.trueTag]?.name);
    const o = objectiveOdds(s, ms);
    return (
      `${first(m)} sends word from ${ms.contract.region}: the squad has reached "${ms.contract.title}" and looked the place over.\n\n` +
      (unknown.length ? `What you didn't know: ${unknown.join(' and ')}. ` : 'It is much as you expected. ') +
      `They face ${real.tags.map((t) => TAGS[t]?.name ?? t).join(', ')}.\n\n` +
      `With your plan (${ms.approaches.map((a) => APPROACH_INFO[a].name).join(' → ')}), the objective succeeds ${pct(o.objective)} of the time, and the hardest phase is ${pct(o.weakest)}.`
    );
  },
  choices: (s, m) => {
    const ms = missionOf(s, m)!;
    const squad = squadOf(s, ms);
    const best = bestApproaches(s, revealedContract(ms), squad);
    const now = objectiveOdds(s, ms);
    const alt = objectiveOdds(s, ms, best);
    const changed = best.some((a, i) => a !== ms.approaches[i]) && alt.objective > now.objective + 0.03;
    const out: EventChoice[] = [{ label: 'Proceed as planned', detail: `Objective ${pct(now.objective)}`, effects: { mission: { reveal: true } }, resultText: 'Your orders stand.' }];
    if (changed)
      out.push({
        label: `Change the plan: ${best.map((a) => APPROACH_INFO[a].name).join(' → ')}`,
        detail: `Objective ${pct(alt.objective)}, hardest phase ${pct(alt.weakest)}`,
        effects: { mission: { reveal: true, approaches: 'best' }, log: 'New orders reached them before the job: they changed their approach.' },
        resultText: 'A rider carries the new orders. They will arrive in time.',
      });
    out.push({
      label: 'Withdraw and come home',
      detail: `Nobody gets hurt. The contract fails and ${ms.contract.patron === 'ostranders' ? "Ostrander's" : 'the patron'} is annoyed (−3).`,
      effects: { mission: { withdraw: true } },
      resultText: 'You call them home. Better a bruised reputation than a funeral.',
    });
    return out;
  },
};

const onRoad = (s: GameState, m: Member) => {
  const ms = missionOf(s, m);
  return !!ms && !ms.report && ms.contract.travelWeeks > 0;
};

export const FIELD_EVENTS: EventDef[] = [
  {
    id: 'field_bridge',
    title: 'The Bridge Is Out',
    weight: 2,
    member: onRoad,
    text: (s, m) => `${first(m)} sends a rider: the spring floods took the bridge on the road to ${missionOf(s, m)?.contract.region}. The squad waits for your word.`,
    choices: (s, m) => {
      const ms = missionOf(s, m);
      const p = squadCheck(s, ms, 'endurance', 8 + (ms?.contract.threat ?? 3));
      return [
        { label: 'Take the marsh road', detail: 'No delay, but the squad will face Swamp as well.', effects: { mission: { tag: 'swamp' }, log: 'The bridge was out, so they took the marsh road.' }, resultText: 'They turn off into the reeds.' },
        { label: 'Wait for the ferry', detail: `One week's delay. Costs ${squadOf(s, ms).length} supplies, bought locally.`, effects: { mission: { delay: 1, supplies: -squadOf(s, ms).length }, log: 'They waited a week for the ferry.' }, resultText: 'They make camp and wait.' },
        {
          label: 'Ford the river',
          detail: `Endurance check (${pct(p)}). Failure: someone is swept off their feet and everyone arrives exhausted.`,
          check: { approach: 'endurance', difficulty: 8 + (ms?.contract.threat ?? 3) },
          effects: { log: 'They forded the flooded river, roped together.' },
          failEffects: { mission: { wounds: 14, fatigue: 15 }, log: 'Fording the river nearly drowned one of them.' },
          resultText: 'Roped together, they make it across.',
          failText: 'The current takes someone off their feet. They are dragged out, half-drowned.',
        },
      ];
    },
  },
  {
    id: 'field_deserter',
    title: 'A Deserter on the Road',
    weight: 2,
    member: (s, m) => onRoad(s, m) && !!missionOf(s, m)?.contract.hidden.some((h) => !h.revealed),
    text: (s, m) => `A frightened man flags down the squad near ${missionOf(s, m)?.contract.region}. He says he ran from the very people they're going to face, and he'll talk, for a price.`,
    choices: (s, m) => {
      const ms = missionOf(s, m);
      const p = squadCheck(s, ms, 'guile', 11);
      return [
        { label: 'Pay him', detail: '−20 crowns. Reveals what the squad will face.', requires: { crowns: 20 }, effects: { crowns: -20, mission: { reveal: true }, log: 'A deserter sold them the truth about what lay ahead.' }, resultText: 'He talks, fast and frightened.' },
        {
          label: 'Talk it out of him',
          detail: `Guile check (${pct(p)}). Success reveals everything for free.`,
          check: { approach: 'guile', difficulty: 11 },
          effects: { mission: { reveal: true }, log: `${first(m)} talked a deserter into telling them what lay ahead.` },
          failEffects: { heat: 2 },
          resultText: 'A little kindness and a lot of ale, and he tells them everything.',
          failText: 'He takes fright and bolts into the trees.',
        },
        { label: 'Send him on his way', effects: {}, resultText: 'The squad moves on.' },
      ];
    },
  },
  {
    id: 'field_shadowed',
    title: 'Followed',
    weight: 2,
    member: onRoad,
    text: (_s, m) => `${first(m)} reports that riders have shadowed the squad for two days, always just out of reach. Someone wants to know they're coming.`,
    choices: (s, m) => {
      const ms = missionOf(s, m);
      const t = ms?.contract.threat ?? 3;
      const pa = squadCheck(s, ms, 'assault', 14 + t * 1.5);
      const ps = squadCheck(s, ms, 'stealth', 9 + t);
      return [
        {
          label: 'Ambush the riders',
          detail: `Assault check (${pct(pa)}). Success makes the first phase easier. Failure: someone is hurt.`,
          check: { approach: 'assault', difficulty: 14 + t * 1.5 },
          effects: { mission: { chain: 0.85 }, log: 'They ambushed the riders who had been shadowing them. Nobody went ahead to warn the enemy.' },
          failEffects: { mission: { wounds: 16 }, log: 'They tried to ambush their shadows and came off worse.' },
          resultText: 'The riders never report back to whoever sent them.',
          failText: 'The riders were ready for it.',
        },
        {
          label: 'Lose them in the hills',
          detail: `Stealth check (${pct(ps)}). Success: first phase a little easier. Failure: the enemy is warned (first phase harder).`,
          check: { approach: 'stealth', difficulty: 9 + t },
          effects: { mission: { chain: 0.9 }, log: 'They shook off the riders following them.' },
          failEffects: { mission: { chain: 1.15 }, log: 'They tried to shake their shadows and failed. The enemy knew they were coming.' },
          resultText: 'By the next morning the riders are gone.',
          failText: 'The riders stay with them all the way.',
        },
        { label: 'Ignore them', detail: 'The enemy will be expecting them (first phase harder).', effects: { mission: { chain: 1.1 }, log: 'Riders shadowed them all the way. The enemy was expecting them.' }, resultText: 'The squad presses on, watched.' },
      ];
    },
  },
  {
    id: 'field_guide',
    title: 'A Local Guide',
    weight: 1.5,
    member: onRoad,
    text: (s, m) => `An old drover offers to guide the squad to ${missionOf(s, m)?.contract.region} by the back ways: faster, drier, and out of sight.`,
    choices: [
      { label: 'Hire the guide', detail: '−25 crowns. The squad arrives fresher and better placed (every phase a little easier).', requires: { crowns: 25 }, effects: { crowns: -25, mission: { difficulty: 0.94, fatigue: -15 }, log: 'An old drover guided them by the back ways.' }, resultText: 'The drover knows every sheep-track in the hills.' },
      { label: 'Decline', effects: {}, resultText: 'They keep to the road.' },
    ],
  },
  {
    id: 'field_traveler',
    title: 'A Wounded Carter',
    weight: 1.5,
    member: onRoad,
    text: (_s, m) => `${first(m)}'s squad finds a carter by the road with a broken leg and an overturned wagon. Bandits, he says, two days ago.`,
    choices: [
      { label: 'Help him', detail: '−3 supplies. Renown +1, the squad feels good about it (morale).', requires: { supplies: 3 }, effects: { supplies: -3, renown: 1, mission: { fatigue: 5 }, log: 'They stopped to splint a carter\'s leg and right his wagon.' }, resultText: 'He promises to tell everyone in the next town.' },
      { label: 'Leave him', effects: {}, resultText: 'Someone else will come along. Probably.' },
    ],
  },
  {
    id: 'field_rivals',
    title: 'Hobb\'s People on the Road',
    weight: 3,
    member: (s, m) => onRoad(s, m) && !!missionOf(s, m)?.contract.contestedBy,
    text: (s, m) => `${first(m)} spots a Hobb & Daughters squad on the same road, heading for the same job: "${missionOf(s, m)?.contract.title}". Isbet Hobb is leading them.`,
    choices: (s, m) => {
      const ms = missionOf(s, m);
      const t = ms?.contract.threat ?? 3;
      const pe = squadCheck(s, ms, 'endurance', 8 + t);
      const ps = squadCheck(s, ms, 'stealth', 10 + t);
      const bonus = Math.round((ms?.contract.reward ?? 100) * 0.2);
      return [
        {
          label: 'Race them there',
          detail: `Endurance check (${pct(pe)}). Success: the patron pays a bonus (+${bonus}). Failure: the squad arrives exhausted.`,
          check: { approach: 'endurance', difficulty: 8 + t },
          effects: { mission: { reward: bonus }, log: 'They raced Hobb & Daughters to the job, and won.' },
          failEffects: { mission: { fatigue: 20 }, log: 'They raced Hobb & Daughters and wore themselves out.' },
          resultText: 'Your people get there first. The patron is impressed.',
          failText: 'Your people arrive blown and footsore.',
        },
        {
          label: 'Slip into their camp at night',
          detail: `Stealth check (${pct(ps)}). Success: Hobb & Daughters lose face (rival renown −3), Heat +2. Failure: Heat +5 and a fight.`,
          check: { approach: 'stealth', difficulty: 10 + t },
          effects: { heat: 2, rivalRenown: -3, npc: { id: 'isbet', attitude: -10 }, log: "They cut the girths on Hobb & Daughters' saddles in the night." },
          failEffects: { heat: 5, mission: { wounds: 14 }, npc: { id: 'isbet', attitude: -15 }, log: "They were caught creeping into the Hobbs' camp." },
          resultText: "Isbet Hobb's squad wakes up to cut girths and scattered horses.",
          failText: 'Isbet was waiting for them.',
        },
        { label: 'Let them go ahead', detail: 'They will have stirred things up (first phase harder).', effects: { mission: { chain: 1.1 } }, resultText: 'The Hobbs ride on ahead.' },
      ];
    },
  },
  {
    id: 'field_weather',
    title: 'The Weather Turns',
    weight: 2,
    member: (s, m) => onRoad(s, m) && ['Autumn', 'Winter'].includes(seasonOf(s.week)),
    text: (s, m) => `${seasonOf(s.week) === 'Winter' ? 'Snow' : 'Freezing rain'} closes in on the road. ${first(m)} asks whether to push on or take shelter.`,
    choices: (s, m) => [
      { label: 'Push on', detail: 'Everyone arrives tired (fatigue +15).', effects: { mission: { fatigue: 15 }, log: 'They marched through the storm.' }, resultText: 'Heads down, they keep walking.' },
      { label: 'Shelter and wait', detail: `One week's delay. Costs ${squadOf(s, missionOf(s, m)).length} supplies.`, effects: { mission: { delay: 1, supplies: -squadOf(s, missionOf(s, m)).length }, log: 'They sat out the storm in a shepherd\'s hut.' }, resultText: 'They find a shepherd\'s hut and wait it out.' },
    ],
  },
  {
    id: 'field_tracks',
    title: 'Fresh Tracks',
    weight: 2.5,
    member: (s, m) => onRoad(s, m) && squadOf(s, missionOf(s, m)).some((x) => x.profession === 'scout' || x.profession === 'skirmisher') && !!missionOf(s, m)?.contract.hidden.some((h) => !h.revealed),
    text: (s, m) => {
      const sc = squadOf(s, missionOf(s, m)).find((x) => x.profession === 'scout' || x.profession === 'skirmisher');
      return `${first(sc)} found fresh tracks a mile from the job and wants to follow them for a day.`;
    },
    choices: [
      { label: 'Follow the tracks', detail: 'Reveals what the squad will face, and the first phase is easier. Fatigue +10.', effects: { mission: { reveal: true, chain: 0.9, fatigue: 10 }, log: 'They followed fresh tracks and learned what they were walking into.' }, resultText: 'By nightfall they know exactly what is waiting.' },
      { label: 'Stay on schedule', effects: {}, resultText: 'They keep to the plan.' },
    ],
  },
];
