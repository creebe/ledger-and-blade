// Decisions at the door of an expedition: they fire as a squad sets out on
// the road to a distant site, before the trip is sealed. Text and choice
// functions receive one squad member; missionOf() finds their expedition.
import { chanceFrom, counteredTags, knownTags, squadScore } from '../missions/odds';
import type { Approach, GameState, Member, Mission } from '../core/types';
import type { EventDef } from './events';
import { seasonOf } from '../core/calendar';

export function missionOf(s: GameState, m?: Member): Mission | undefined {
  return m ? s.missions.find((x) => x.id === m.missionId) : undefined;
}
export function squadOf(s: GameState, ms?: Mission): Member[] {
  return ms ? ms.memberIds.map((id) => s.members.find((x) => x.id === id)!).filter((x) => x && x.status === 'mission') : [];
}
const first = (m?: Member) => (m ? m.name.split(' ')[0] : 'The squad');
const pct = (p: number) => `${Math.round(p * 100)}%`;

/** Best single squad member's chance at a field check (for detail text). */
export function squadCheck(s: GameState, ms: Mission | undefined, approach: Approach, difficulty: number) {
  const squad = squadOf(s, ms);
  let best = 0;
  if (!ms) return 0;
  for (const m of squad) best = Math.max(best, squadScore(s, approach, { tags: knownTags(ms.contract), countered: counteredTags(s, [m], []), members: [m] }).score);
  return chanceFrom(best, difficulty);
}

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
    text: (s, m) => `${first(m)} sends a rider back. The river is up, and the bridge on the road to ${missionOf(s, m)?.contract.region} has gone. The squad is waiting for your word.`,
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
          resultText: 'They rope themselves together and get across, soaked to the chest.',
          failText: 'The current takes someone off their feet, and it takes the rest of them to drag the poor soul out.',
        },
      ];
    },
  },
  {
    id: 'field_deserter',
    title: 'A Deserter on the Road',
    weight: 2,
    member: (s, m) => onRoad(s, m) && !!missionOf(s, m)?.contract.hidden.some((h) => !h.revealed),
    text: (s, m) => `A nervous man flags the squad down near ${missionOf(s, m)?.contract.region}. He says he ran from the people they're on their way to deal with, and he'll tell them what he knows if they make it worth his while.`,
    choices: (s, m) => {
      const ms = missionOf(s, m);
      const p = squadCheck(s, ms, 'guile', 11);
      return [
        { label: 'Pay him', detail: '−20 crowns. Reveals what the squad will face.', requires: { crowns: 20 }, effects: { crowns: -20, mission: { reveal: true }, log: 'A deserter sold them the truth about what lay ahead.' }, resultText: 'He talks fast and keeps looking back down the road.' },
        {
          label: 'Talk it out of him',
          detail: `Guile check (${pct(p)}). Success reveals everything for free.`,
          check: { approach: 'guile', difficulty: 11 },
          effects: { mission: { reveal: true }, log: `${first(m)} talked a deserter into telling them what lay ahead.` },
          failEffects: { heat: 2 },
          resultText: 'A couple of drinks later, he tells them everything he knows and a good deal he doesn\'t.',
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
    text: (_s, m) => `${first(m)} reports that a pair of riders have kept pace with the squad for two days, staying just out of bowshot. Somebody wants to know when they arrive.`,
    choices: (s, m) => {
      const ms = missionOf(s, m);
      const t = ms?.contract.threat ?? 3;
      const pa = squadCheck(s, ms, 'assault', 14 + t * 1.5);
      const ps = squadCheck(s, ms, 'stealth', 9 + t);
      return [
        {
          label: 'Ambush the riders',
          detail: `Assault check (${pct(pa)}). Success makes the fights there easier. Failure: someone is hurt.`,
          check: { approach: 'assault', difficulty: 14 + t * 1.5 },
          effects: { mission: { chain: 0.85 }, log: 'They ambushed the riders who had been shadowing them. Nobody went ahead to warn the enemy.' },
          failEffects: { mission: { wounds: 16 }, log: 'They tried to ambush their shadows and came off worse.' },
          resultText: 'The riders never report back to whoever sent them.',
          failText: 'The riders were ready for it.',
        },
        {
          label: 'Lose them in the hills',
          detail: `Stealth check (${pct(ps)}). Success: the fights there are a little easier. Failure: the enemy is warned (the fights there will be harder).`,
          check: { approach: 'stealth', difficulty: 9 + t },
          effects: { mission: { chain: 0.9 }, log: 'They shook off the riders following them.' },
          failEffects: { mission: { chain: 1.15 }, log: 'They tried to shake their shadows and failed. The enemy knew they were coming.' },
          resultText: 'By the next morning the riders are gone.',
          failText: 'The riders stay with them all the way.',
        },
        { label: 'Ignore them', detail: 'The enemy will be expecting them (the fights there will be harder).', effects: { mission: { chain: 1.1 }, log: 'Riders shadowed them all the way. The enemy was expecting them.' }, resultText: 'The squad presses on, watched.' },
      ];
    },
  },
  {
    id: 'field_guide',
    title: 'A Local Guide',
    weight: 1.5,
    member: onRoad,
    text: (s, m) => `An old drover offers to take the squad to ${missionOf(s, m)?.contract.region} by the sheep tracks, which he swears are quicker and drier than the road.`,
    choices: [
      { label: 'Hire the guide', detail: '−25 crowns. The squad arrives fresher and better placed (the fights a little easier).', requires: { crowns: 25 }, effects: { crowns: -25, mission: { difficulty: 0.94, fatigue: -15 }, log: 'An old drover guided them by the back ways.' }, resultText: 'The drover knows every sheep-track in the hills.' },
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
      { label: 'Leave him', effects: {}, resultText: 'Somebody else will be along, probably.' },
    ],
  },
  {
    id: 'field_rivals',
    title: 'Hobb\'s People on the Road',
    weight: 3,
    member: (s, m) => onRoad(s, m) && missionOf(s, m)?.contract.contestedBy === 'hobbs' && s.npcs.isbet?.status === 'alive',
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
          resultText: 'Your people get there first, and the patron notices.',
          failText: 'They lose the race and arrive with blistered feet anyway.',
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
        { label: 'Let them go ahead', detail: 'They will have stirred things up (the fights there will be harder).', effects: { mission: { chain: 1.1 } }, resultText: 'The Hobbs ride on ahead.' },
      ];
    },
  },
  {
    id: 'field_weather',
    title: 'The Weather Turns',
    weight: 2,
    member: (s, m) => onRoad(s, m) && ['Autumn', 'Winter'].includes(seasonOf(s.week)),
    text: (s, m) => `${seasonOf(s.week) === 'Winter' ? 'Snow' : 'Freezing rain'} has set in on the road. ${first(m)} wants to know whether to push on or find somewhere dry.`,
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
      { label: 'Follow the tracks', detail: 'Reveals what the squad will face, and the fights there are a little easier. Fatigue +10.', effects: { mission: { reveal: true, chain: 0.9, fatigue: 10 }, log: 'They followed fresh tracks and learned what they were walking into.' }, resultText: 'By nightfall they know exactly what is waiting.' },
      { label: 'Stay on schedule', effects: {}, resultText: 'They keep to the plan.' },
    ],
  },
];
