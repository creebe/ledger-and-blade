// Legends: members who survive and do enough become known in Varrow. Fame comes
// from deeds, not experience: leading phases well, flawless jobs, story work,
// dangerous foes and coming home from disasters. Three tiers: Known, Renowned,
// Legendary. A Legend gets a name from the street and a signature ability.
import { TAGS } from '../data/tags';
import { pick } from '../core/rng';
import type { Approach, Contract, GameState, Member, OutcomeTier, PhaseResult } from '../core/types';
import { addDispatch, clamp, living } from '../core/util';
import { FAME_KNOWN, FAME_LEGENDARY, FAME_RENOWNED, LEGEND_NEEDS } from '../core/tuning';

export interface Feat {
  week: number;
  kind: 'story' | 'foe' | 'disaster' | 'lead';
  text: string; // "how Maud faced the trolls at Harrowmere"
  region: string;
  approach?: Approach;
}

export const FAME_TIERS = [
  { name: '', min: 0 },
  { name: 'Known', min: FAME_KNOWN },
  { name: 'Renowned', min: FAME_RENOWNED },
  { name: 'Legendary', min: FAME_LEGENDARY },
] as const;

export function fameTier(m: Member): number {
  const f = m.fame ?? 0;
  if (f >= FAME_TIERS[3].min && m.level >= LEGEND_NEEDS.level && m.missions >= LEGEND_NEEDS.missions) return 3;
  if (f >= FAME_TIERS[2].min) return 2;
  if (f >= FAME_TIERS[1].min) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Signature abilities
// ---------------------------------------------------------------------------

export interface Signature {
  id: string;
  name: string;
  text: string;
  approach?: Approach; // squad-wide bonus to this approach while the Legend is in the squad
  bonus?: number;
}

export const SIGNATURES: Record<string, Signature> = {
  front_rank: { id: 'front_rank', name: 'Front rank', text: 'Everyone in the squad fights better with them along: aim +4 each.', approach: 'assault', bonus: 1.5 },
  quiet_feet: { id: 'quiet_feet', name: 'Quiet feet', text: 'They teach the squad where to step, so it slips past wanderers more often.', approach: 'stealth', bonus: 1.5 },
  known_face: { id: 'known_face', name: 'A known face', text: 'People open doors for them: an Envoy in the same squad talks people round more often.', approach: 'guile', bonus: 1.5 },
  keeps_walking: { id: 'keeps_walking', name: 'Keeps them walking', text: 'Nobody wants to be the one who stopped first, so the whole squad tires a little slower.', approach: 'endurance', bonus: 1.5 },
  steady_hands: { id: 'steady_hands', name: 'Steady hands', text: 'Their calm spreads to the spellwork: an Arcanist in the same squad hits harder.', approach: 'arcana', bonus: 1.5 },
  nobody_dies: { id: 'nobody_dies', name: 'Nobody dies today', text: 'They watch everyone\'s back: anyone in the squad who goes down is likelier to live.' },
  worth_the_fee: { id: 'worth_the_fee', name: 'Worth the fee', text: 'Patrons pay more to have them: +10% pay on any job they go on.' },
  draws_a_crowd: { id: 'draws_a_crowd', name: 'Draws a crowd', text: 'Every job they finish is talked about: Renown +1 on any success.' },
};

const APPROACH_SIGNATURE: Record<Approach, string> = {
  assault: 'front_rank',
  stealth: 'quiet_feet',
  guile: 'known_face',
  endurance: 'keeps_walking',
  arcana: 'steady_hands',
};

/** Signature bonus a member gets for an approach from a Legend in the same squad. */
export function legendAura(squad: Member[], approach: Approach): { from: Member; sig: Signature } | undefined {
  for (const m of squad) {
    const sig = m.signature ? SIGNATURES[m.signature] : undefined;
    if (sig?.approach === approach) return { from: m, sig };
  }
  return undefined;
}

export const squadHas = (squad: Member[], sig: string) => squad.some((m) => m.signature === sig);

// ---------------------------------------------------------------------------
// Names from the street
// ---------------------------------------------------------------------------

const FOLK: Record<Approach, string> = { assault: 'Hard', stealth: 'Quiet', guile: 'Honest', endurance: 'Steady', arcana: 'Sparks' };

/** The approach a member has led most often. */
export function favoriteApproach(m: Member): Approach {
  const counts: Partial<Record<Approach, number>> = {};
  for (const f of m.feats ?? []) if (f.approach) counts[f.approach] = (counts[f.approach] ?? 0) + 1;
  const best = (Object.entries(counts) as [Approach, number][]).sort((a, b) => b[1] - a[1])[0];
  return best?.[0] ?? 'endurance';
}

/** Two names the street might give them: a nickname, and one from the place of their best deed. */
export function epithetOptions(m: Member): string[] {
  const first = m.name.split(' ')[0];
  const lucky = (m.feats ?? []).filter((f) => f.kind === 'disaster').length >= 2;
  const ap = favoriteApproach(m);
  const folk = lucky ? `Lucky ${first}` : ap === 'arcana' ? `${first} Sparks` : `${FOLK[ap]} ${first}`;
  const away = [...(m.feats ?? [])].reverse().find((f) => f.region && f.region !== 'Varrow' && (f.kind === 'story' || f.kind === 'foe'));
  const anyAway = [...(m.feats ?? [])].reverse().find((f) => f.region && f.region !== 'Varrow');
  const place = (away ?? anyAway)?.region;
  const placeName = place ? `${first} of ${place.replace(/^The /, 'the ')}` : `${first} of Tallow Street`;
  return [folk, placeName];
}

export function signatureOptions(m: Member): string[] {
  const main = APPROACH_SIGNATURE[favoriteApproach(m)];
  const general = ['nobody_dies', 'worth_the_fee', 'draws_a_crowd'];
  return [main, general[(m.missions + m.level) % general.length]];
}

// ---------------------------------------------------------------------------
// Earning fame
// ---------------------------------------------------------------------------

const FOES = ['trolls', 'fireborn', 'warded', 'soldiers', 'armored', 'beasts', 'swarm'];
const VERB: Record<Approach, string> = {
  assault: 'fought their way through',
  stealth: 'got everyone past unseen',
  guile: 'talked their way through',
  endurance: 'kept everyone walking',
  arcana: 'worked the spell that carried',
};

function addFeat(m: Member, f: Feat) {
  m.feats = [...(m.feats ?? []), f].slice(-12);
}

export interface FameInput {
  contract: Contract;
  tier: OutcomeTier;
  tags: string[];
  led: { approach: Approach; result: PhaseResult; danger: number }[];
}

/** Called for each surviving squad member after a mission. Returns fame gained. */
export function earnFame(state: GameState, m: Member, x: FameInput): number {
  const first = m.name.split(' ')[0];
  const c = x.contract;
  const won = x.tier === 'Triumph' || x.tier === 'Success' || x.tier === 'Costly Success';
  let gain = x.tier === 'Triumph' ? 1 : 0;
  for (const l of x.led) {
    if (l.result === 'strong') gain += 2;
    else if (l.result === 'success') gain += 1;
  }
  const bestLead = x.led.find((l) => l.result === 'strong' && (l.danger >= 1 || c.threat >= 4)) ?? x.led.find((l) => l.result === 'strong');
  if (bestLead && c.threat >= 3) {
    addFeat(m, { week: state.week, kind: 'lead', text: `how ${first} ${VERB[bestLead.approach]} on "${c.title}"`, region: c.region, approach: bestLead.approach });
  } else if (x.led.length) {
    // remember what they lead with, quietly
    addFeat(m, { week: state.week, kind: 'lead', text: '', region: c.region, approach: x.led[0].approach });
  }
  if (won && c.story) {
    gain += 4;
    addFeat(m, { week: state.week, kind: 'story', text: `how ${first} saw "${c.title}" through`, region: c.region });
  }
  const foe = x.tags.find((t) => FOES.includes(t) && (t !== 'beasts' && t !== 'swarm' ? c.threat >= 3 : c.threat >= 5));
  if (won && foe) {
    gain += 3;
    addFeat(m, { week: state.week, kind: 'foe', text: `how ${first} faced the ${TAGS[foe].name.toLowerCase()} at ${c.region}`, region: c.region });
  }
  if (x.tier === 'Disaster') {
    gain += 3;
    addFeat(m, { week: state.week, kind: 'disaster', text: `how ${first} walked home from the disaster at ${c.region}`, region: c.region });
  }
  if (!gain) return 0;
  const before = fameTier(m);
  m.fame = (m.fame ?? 0) + gain;
  const after = fameTier(m);
  if (after > before) reachTier(state, m, after);
  return gain;
}

/** Fame from what a member did on an expedition: deeds the street talks about. */
export function earnDeedFame(state: GameState, m: Member, gain: number, deed?: string, region = '') {
  if (gain <= 0) return;
  if (deed) addFeat(m, { week: state.week, kind: 'foe', text: `how ${m.name.split(' ')[0]} ${deed}`, region });
  const before = fameTier(m);
  m.fame = (m.fame ?? 0) + gain;
  const after = fameTier(m);
  if (after > before) reachTier(state, m, after);
}

/** What happens when a member's fame crosses into a new tier. */
function reachTier(state: GameState, m: Member, tier: number) {
  const first = m.name.split(' ')[0];
  if (tier === 1) {
    state.renown += 1;
    addDispatch(state, 'roster', `${m.name} is getting known`, [
      `People in the taverns have started asking for ${first} by name. Renown +1.`,
    ]);
  } else if (tier === 2) {
    state.renown += 2;
    m.wage += 2;
    m.loyalty = clamp(m.loyalty + 5, 0, 100);
    addDispatch(state, 'roster', `${m.name} is renowned`, [
      `Half of Varrow has heard of ${first}, and the other half has heard a version of it. Renown +2.`,
      `Fame has a price: ${first}'s wage rises by 2 a week. Rival guilds will start making offers.`,
    ]);
  } else if (tier === 3) {
    state.renown += 4;
    m.wage += 3;
    addDispatch(state, 'roster', `${m.name} has become a legend`, [
      `Children in the Lower Town play at being ${first}. Renown +4, and ${first}'s wage rises by 3 a week.`,
      'The street is deciding what to call them.',
    ]);
    state.pendingLegends = [...(state.pendingLegends ?? []), m.id];
  }
}

/** A Legend's death is felt by the whole guild. */
export function mournLegend(state: GameState, m: Member) {
  if (fameTier(m) < 2) return;
  const first = m.name.split(' ')[0];
  const legend = fameTier(m) === 3;
  for (const x of living(state)) x.morale = clamp(x.morale - (legend ? 15 : 8), 0, 100);
  state.renown += legend ? 2 : 1;
  addDispatch(state, 'roster', `Varrow mourns ${m.epithet ?? m.name}`, [
    legend
      ? `${first} is dead. The Copper Kettle has hung black crepe over the door, and strangers stop your people in the street to say they are sorry. Everyone: morale −15.`
      : `${first} is dead, and people you have never met are asking how it happened. Everyone: morale −8.`,
  ]);
}

/** A line of street talk about one of the guild's famous members, if there is one. */
export function legendTalk(state: GameState): string | undefined {
  const famous = living(state).filter((m) => fameTier(m) >= 2 && (m.feats ?? []).some((f) => f.text));
  if (!famous.length) return undefined;
  const m = pick(state, famous);
  const feat = pick(state, (m.feats ?? []).filter((f) => f.text));
  const who = m.epithet ?? m.name;
  const frames = [
    `In the Copper Kettle they are still telling the story of ${feat.text}.`,
    `A ballad-seller on the river steps has a new song about ${who}. It gets the facts wrong, but it sells.`,
    `Somebody asked a porter on Fish Quay whether ${who} is real. The porter said yes, and told them ${feat.text}.`,
  ];
  return pick(state, frames);
}

