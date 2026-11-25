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
    text: (s, m) => `A coal carter comes into the yard with mud up to his knees. The river is up, he says, and the bridge on the road to ${missionOf(s, m)?.contract.region} has gone. ${first(m)} has the squad packed and wants to know which way to go before they leave.`,
    choices: (s, m) => {
      const ms = missionOf(s, m);
      const p = squadCheck(s, ms, 'endurance', 8 + (ms?.contract.threat ?? 3));
      return [
        { label: 'Send them by the marsh road', detail: 'No delay, but the squad will face Swamp as well.', effects: { mission: { tag: 'swamp' }, log: 'They took the marsh road, as ordered, because the bridge was out.' }, resultText: 'The carter says the reeds are only waist-deep for most of the way, and nobody believes him.' },
        { label: 'Tell them to wait for the ferry', detail: `One week's delay. Costs ${squadOf(s, ms).length} supplies, bought at the crossing.`, effects: { mission: { delay: 1, supplies: -squadOf(s, ms).length }, log: 'They waited a week for the ferry, as ordered.' }, resultText: 'They set out expecting to spend a week in a ferryman\'s barn.' },
        {
          label: 'Tell them to ford the river',
          detail: `Endurance check (${pct(p)}). Failure: someone is swept off their feet and everyone arrives exhausted.`,
          check: { approach: 'endurance', difficulty: 8 + (ms?.contract.threat ?? 3) },
          effects: { log: 'They forded the flooded river, roped together, as ordered.' },
          failEffects: { mission: { wounds: 14, fatigue: 15 }, log: 'Fording the river nearly drowned one of them.' },
          resultText: 'At the river they rope themselves together and get across, soaked to the chest.',
          failText: 'At the river the current takes someone off their feet, and it takes the rest of them to drag the poor soul out.',
        },
      ];
    },
  },
  {
    id: 'field_deserter',
    title: 'A Deserter at the Door',
    weight: 2,
    member: (s, m) => onRoad(s, m) && !!missionOf(s, m)?.contract.hidden.some((h) => !h.revealed),
    text: (s, m) => `A nervous man is waiting at the hall door as the squad gets ready for ${missionOf(s, m)?.contract.region}. He says he ran from the people they're going there to deal with, and he'll tell them what he knows if they make it worth his while.`,
    choices: (s, m) => {
      const ms = missionOf(s, m);
      const p = squadCheck(s, ms, 'guile', 11);
      return [
        { label: 'Pay him', detail: '−20 crowns. Reveals what the squad will face.', requires: { crowns: 20 }, effects: { crowns: -20, mission: { reveal: true }, log: 'Before they left, a deserter sold them the truth about what lay ahead.' }, resultText: 'He talks fast and keeps looking up and down Tallow Street.' },
        {
          label: 'Talk it out of him',
          detail: `Guile check (${pct(p)}). Success reveals everything for free.`,
          check: { approach: 'guile', difficulty: 11 },
          effects: { mission: { reveal: true }, log: `Before they left, ${first(m)} talked a deserter into telling them what lay ahead.` },
          failEffects: { heat: 2 },
          resultText: 'A couple of drinks later, he tells them everything he knows and a good deal he doesn\'t.',
          failText: 'He takes fright and bolts down Tallow Street.',
        },
        { label: 'Send him on his way', effects: {}, resultText: 'He goes off down the street, and the squad sets out the other way.' },
      ];
    },
  },
  {
    id: 'field_shadowed',
    title: 'Watched',
    weight: 2,
    member: onRoad,
    text: (_s, m) => `The stable boy says a pair of riders have been watching the yard for two days from the corner of Tallow Street. They're there now, with their horses saddled. ${first(m)} thinks they mean to follow the squad out, because somebody wants to know when it arrives.`,
    choices: (s, m) => {
      const ms = missionOf(s, m);
      const t = ms?.contract.threat ?? 3;
      const pa = squadCheck(s, ms, 'assault', 14 + t * 1.5);
      const ps = squadCheck(s, ms, 'stealth', 9 + t);
      return [
        {
          label: 'Ambush them on the road',
          detail: `Assault check (${pct(pa)}). Success makes the fights there easier. Failure: someone is hurt.`,
          check: { approach: 'assault', difficulty: 14 + t * 1.5 },
          effects: { mission: { chain: 0.85 }, log: 'They ambushed the riders who followed them out of town. Nobody went ahead to warn the enemy.' },
          failEffects: { mission: { wounds: 16 }, log: 'They tried to ambush the riders who followed them out of town and came off worse.' },
          resultText: 'The riders never report back to whoever sent them.',
          failText: 'The riders were expecting it.',
        },
        {
          label: 'Lose them in the hills',
          detail: `Stealth check (${pct(ps)}). Success: the fights there are a little easier. Failure: the enemy is warned (the fights there will be harder).`,
          check: { approach: 'stealth', difficulty: 9 + t },
          effects: { mission: { chain: 0.9 }, log: 'They lost the riders who followed them out of town somewhere in the hills.' },
          failEffects: { mission: { chain: 1.15 }, log: 'They tried to lose the riders who followed them out of town and failed. The enemy knew they were coming.' },
          resultText: 'By the second morning out, the riders are gone.',
          failText: 'The riders stay with them all the way.',
        },
        { label: 'Let them follow', detail: 'The enemy will be expecting them (the fights there will be harder).', effects: { mission: { chain: 1.1 }, log: 'Riders followed them from the yard all the way there. The enemy was expecting them.' }, resultText: 'The squad rides out, and the two riders fall in behind.' },
      ];
    },
  },
  {
    id: 'field_guide',
    title: 'A Local Guide',
    weight: 1.5,
    member: onRoad,
    text: (s, m) => `An old drover is drinking in the hall after a sale. He hears where the squad is bound and offers to take them to ${missionOf(s, m)?.contract.region} by the sheep tracks, which he swears are quicker and drier than the road.`,
    choices: [
      { label: 'Hire the guide', detail: '−25 crowns. The squad arrives fresher and better placed (the fights a little easier).', requires: { crowns: 25 }, effects: { crowns: -25, mission: { difficulty: 0.94, fatigue: -15 }, log: 'An old drover guided them by the back ways.' }, resultText: 'He finishes his drink and whistles for his dog. He says he knows every sheep track in the hills.' },
      { label: 'Decline', effects: {}, resultText: 'He shrugs and orders another. The squad will keep to the road.' },
    ],
  },
  {
    id: 'field_traveler',
    title: 'A Wounded Carter',
    weight: 1.5,
    member: onRoad,
    text: (_s, m) => `A carter limps into the yard on a broken leg while ${first(m)} is loading up. His wagon is on its side a mile out, on the road the squad is about to take. Bandits, he says, two days ago.`,
    choices: [
      { label: 'Help him', detail: '−3 supplies. Renown +1, the squad feels good about it (morale).', requires: { supplies: 3 }, effects: { supplies: -3, renown: 1, mission: { fatigue: 5 }, log: 'Before they set out, they splinted a carter\'s leg, and they righted his wagon on the way past.' }, resultText: 'He promises to tell everyone at the market.' },
      { label: 'Leave him', effects: {}, resultText: 'Somebody else will see to him, probably.' },
    ],
  },
  {
    id: 'field_rivals',
    title: 'Hobb\'s People Are Packing',
    weight: 3,
    member: (s, m) => onRoad(s, m) && missionOf(s, m)?.contract.contestedBy === 'hobbs' && s.npcs.isbet?.status === 'alive',
    text: (s, m) => `The pot boy from the Copper Kettle runs in to say that Hobb & Daughters are loading packs in their yard for the same job you've given ${first(m)}: "${missionOf(s, m)?.contract.title}". Isbet Hobb is leading them, and they mean to leave today.`,
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
          effects: { mission: { reward: bonus }, log: 'They were ordered to race Hobb & Daughters to the job, and they won.' },
          failEffects: { mission: { fatigue: 20 }, log: 'They were ordered to race Hobb & Daughters, and they wore themselves out doing it.' },
          resultText: 'Your people get there first, and the patron notices.',
          failText: 'They lose the race and arrive with blistered feet anyway.',
        },
        {
          label: 'Raid their camp on the road',
          detail: `Stealth check (${pct(ps)}). Success: Hobb & Daughters lose face (rival renown −3), Heat +2. Failure: Heat +5 and a fight.`,
          check: { approach: 'stealth', difficulty: 10 + t },
          effects: { heat: 2, rivalRenown: -3, npc: { id: 'isbet', attitude: -10 }, log: "On the first night out, they cut the girths on Hobb & Daughters' saddles." },
          failEffects: { heat: 5, mission: { wounds: 14 }, npc: { id: 'isbet', attitude: -15 }, log: "On the first night out, they were caught creeping into the Hobbs' camp." },
          resultText: "Isbet Hobb's squad wakes up on the first morning to cut girths and scattered horses.",
          failText: 'Isbet was waiting for them.',
        },
        { label: 'Let them go first', detail: 'They will have stirred things up (the fights there will be harder).', effects: { mission: { chain: 1.1 } }, resultText: 'The Hobbs are out of town by noon.' },
      ];
    },
  },
  {
    id: 'field_weather',
    title: 'The Weather Turns',
    weight: 2,
    member: (s, m) => onRoad(s, m) && ['Autumn', 'Winter'].includes(seasonOf(s.week)),
    text: (s, m) => `A drover coming in off the ${missionOf(s, m)?.contract.region} road says ${seasonOf(s.week) === 'Winter' ? 'snow' : 'freezing rain'} has set in out there. ${first(m)} wants to know before they go whether to push on through it or find somewhere dry and wait.`,
    choices: (s, m) => [
      { label: 'Tell them to push on', detail: 'Everyone arrives tired (fatigue +15).', effects: { mission: { fatigue: 15 }, log: 'They marched through the storm, as ordered.' }, resultText: 'They tie their hoods down and set off.' },
      { label: 'Tell them to shelter and wait', detail: `One week's delay. Costs ${squadOf(s, missionOf(s, m)).length} supplies.`, effects: { mission: { delay: 1, supplies: -squadOf(s, missionOf(s, m)).length }, log: 'They sat out the storm in a shepherd\'s hut, as ordered.' }, resultText: 'The drover tells them where to find a shepherd\'s hut on the way.' },
    ],
  },
  {
    id: 'field_tracks',
    title: 'Fresh Tracks',
    weight: 2.5,
    member: (s, m) => onRoad(s, m) && squadOf(s, missionOf(s, m)).some((x) => x.profession === 'scout' || x.profession === 'skirmisher') && !!missionOf(s, m)?.contract.hidden.some((h) => !h.revealed),
    text: (s, m) => {
      const sc = squadOf(s, missionOf(s, m)).find((x) => x.profession === 'scout' || x.profession === 'skirmisher');
      return `A tinker who came in from ${missionOf(s, m)?.contract.region} saw fresh tracks a mile from the job. ${first(sc)} wants leave to spend a day following them once the squad gets there.`;
    },
    choices: [
      { label: 'Follow the tracks', detail: 'Reveals what the squad will face, and the fights there are a little easier. Fatigue +10.', effects: { mission: { reveal: true, chain: 0.9, fatigue: 10 }, log: 'They spent a day on the tracks the tinker had seen, and learned what they were walking into.' }, resultText: 'The tinker draws them a map on the back of a bill, which is better than most maps.' },
      { label: 'Stay on schedule', effects: {}, resultText: 'They will go straight to the job.' },
    ],
  },
];
