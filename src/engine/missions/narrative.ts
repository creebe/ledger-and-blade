// Turns mission mechanics into a readable expedition journal. Every line is
// grounded in what actually happened: who led, which gear mattered, which tags
// helped or hurt, so the journal doubles as feedback for the next plan.
import { ITEMS } from '../data/items';
import { TAGS } from '../data/tags';
import { damageMultiplier, itemDef, memberItems } from './odds';
import { nextFloat, pick } from '../core/rng';
import { seasonOf } from '../data/events';
import type { Approach, Contract, Element, GameState, JournalSection, Member, OutcomeTier, PhaseResult, TagId } from '../core/types';

const first = (m?: Member) => (m ? m.name.split(' ')[0] : 'someone');

function fill(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

// Scene-setting lines. `not`/`only` keep a line out of places it doesn't fit.
interface Line {
  t: string;
  not?: string[];
  only?: string[];
}
const ENEMY_SETUP: Record<string, Line[]> = {
  beasts: [
    { t: 'There were more wolves than the drovers had said, and they had stopped being afraid of people some time ago.', not: ['urban', 'dark'] },
    { t: 'The tracks were everywhere, and the smell reached them a good while before the animals did.', not: ['urban'] },
    { t: 'Something big kept pace with them in the dark, and it was in no hurry.' },
  ],
  armored: [
    { t: 'The men waiting for them wore good mail, better than anyone in Varrow can afford these days.' },
    { t: 'There was steel behind the barricade, and a lot of it.' },
  ],
  swarm: [
    { t: 'The walls were covered in carrion-beetles, and the noise they made was worse than the sight of them.' },
    { t: 'Rats came out of the drains faster than anyone could count them.' },
  ],
  thugs: [
    { t: 'The opposition turned out to be hired knives in patched coats, who looked more bored than dangerous.' },
    { t: 'Somebody had hired a dozen dockside bruisers by the day, and hadn\'t paid them enough to care.', only: ['urban'] },
    { t: 'Somebody had hired a dozen bruisers off the road by the day, and hadn\'t paid them enough to care.', not: ['urban'] },
  ],
  soldiers: [
    { t: 'The sell-swords waiting for them wore matching colors and kept proper intervals, which was a bad sign.' },
    { t: 'There were crossbowmen on the ridge, and they knew how to use them.', not: ['urban', 'dark'] },
    { t: 'There were crossbowmen at the upstairs windows, and they knew how to use them.', only: ['urban'] },
  ],
  guards: [
    { t: 'The sentries walked their rounds in pairs and actually looked around while they did it.' },
    { t: 'The guards were awake and sober, which nobody had planned for.' },
  ],
  warded: [
    { t: 'Every door had pale marks scratched into it. Somebody had paid a hedge-wizard well.' },
    { t: 'The air near the doors tasted of copper. The wards were fresh.' },
  ],
  trolls: [
    { t: 'The troll stood up from under the bridge, and kept standing up for longer than seemed reasonable.' },
    { t: 'It was twice the height of a man, and the scars from the last guild that tried had already healed over.' },
  ],
  fireborn: [
    { t: 'The heat hit them before they saw anything, and then they saw the salamanders.' },
    { t: 'Drakelings had nested in the old galleries, and the rock around them was warm to the touch.', only: ['dark'] },
  ],
  crowd: [
    { t: 'The crowd pressed in close. Most of them were hungry and some of them had stones.' },
    { t: 'There were hundreds of people in the street, and all of them were watching your squad.' },
  ],
};

function fits(l: Line, tags: TagId[]) {
  return !(l.not ?? []).some((t) => tags.includes(t)) && (!l.only || l.only.some((t) => tags.includes(t)));
}

const ENV_SETUP: Record<string, string[]> = {
  cold: ['It was cold enough that the buckles froze, and everyone could see their breath.', 'The wind came off the hills and went straight through wool.'],
  swamp: ['The water was black and knee-deep, and the mud tried to keep their boots.', 'There was a fever-mist over the fens that never quite lifted.'],
  dark: ['Past the lanterns there was nothing to see at all.', 'They went down into the dark, counting the steps so they could find their way back.'],
  night: ['There was no moon, which helped and hurt in about equal measure.', 'They went after midnight, when anyone sensible was asleep.'],
  urban: ["Varrow's back alleys are narrow and crooked, and every one of them has windows.", 'The streets were full of washing lines and people with nothing better to do than watch.'],
  rough: ['The path was loose scree with a long drop on one side.', 'The road on the map turned out to be more of a suggestion.'],
  open_road: ['It was open country, with nowhere to hide for a mile in any direction.', 'The road ran straight across bare ground under a wide sky.'],
  plague: ['There were chalk crosses on half the doors, and the village was quiet.', 'People were coughing behind their shutters as the squad went by.'],
};

const ACTION: Record<Approach, { ok: string[]; bad: string[] }> = {
  assault: {
    ok: [
      '{lead} went in first{weapon}, with {ally} right behind.',
      '{lead} hit them before they were ready{weapon}, and the others followed.',
      'It was short and ugly. {lead} broke the first rush{weapon}, and there wasn\'t a second.',
    ],
    bad: [
      '{lead} went in hard{weapon}, but the others couldn\'t keep the line.',
      'It went badly. {ally} was pulled down and had to be dragged back by the collar.',
      'They won ground and lost it again, and it cost them each time.',
    ],
  },
  stealth: {
    ok: ['{lead} found a way through, along a drainage cut and round a blind corner, and brought the others after one at a time.', '{lead} counted the patrols and timed it, and they got through without anyone looking up.'],
    bad: ["{clumsy}'s {armor} scraped the wall, and in that quiet it was very loud.", '{lead} misjudged the ground, and somebody heard them.', '{clumsy} stepped on something that crunched, and every head turned.'],
  },
  guile: {
    ok: ['{lead} did the talking, with enough borrowed authority that nobody thought to ask for papers.', "{lead} told a lie good enough that the man repeated it to his own sergeant.", '{lead} worked out who could be paid, and how much.'],
    bad: ["{lead}'s story had a hole in it, and somebody found it.", 'They took the bribe and then did nothing they\'d been paid for.', '{lead} talked for too long, and the man started asking questions back.'],
  },
  endurance: {
    ok: ['They kept a hard pace, and {lead} made sure nobody fell behind.', '{lead} kept them walking at the point where the others wanted to stop.'],
    bad: ['{weakest} fell behind, and the rest had to wait.', 'By the time they arrived they had blisters, cramp and very short tempers.'],
  },
  arcana: {
    ok: ['{lead} drew a sign in the air{element}, and the problem went away.', "{lead}'s spellwork{element} did what the blades couldn't."],
    bad: ["{lead}'s spell fizzled out halfway.", 'Either the reagents were bad or the wards were better. The working failed.'],
  },
};

const STRONG = [' It was about as clean as these things get.', ' The others talked about it for days afterwards.', ' Nobody could have done it much better.'];
const SEVERE = [' After that, everything went wrong at once.', ' It turned into a disaster.', ' Nobody wanted to talk about it afterwards.'];

const ELEMENT_WORD: Record<Element, string> = { fire: 'fire', frost: 'frost', storm: 'lightning', radiant: 'radiance', shadow: 'shadow' };

const ADVICE: Record<string, string> = {
  armored: 'a hammer or a storm-keyed weapon would crack that mail',
  swarm: 'fire and blunt force work far better than points on a swarm',
  fireborn: 'frost salts would have made short work of them',
  trolls: 'only fire stops a troll healing',
  warded: 'a wardstone or storm-keyed weapon would cut through those wards',
  beasts: 'arrows, spears and fire serve best against beasts',
};

function weaponElement(state: GameState, m: Member): Element | undefined {
  for (const c of m.loadout.consumables) {
    const d = itemDef(state, c);
    if (d?.grantsElement) return d.grantsElement;
  }
  return itemDef(state, m.loadout.weapon)?.element;
}

export interface PhaseStoryInput {
  contract: Contract;
  phaseIndex: number;
  approach: Approach;
  result: PhaseResult;
  squad: Member[];
  lead: Member;
  tags: TagId[];
  countered: Set<TagId>;
  scores: { id: string; score: number }[];
  introduced: Set<TagId>; // enemies already described
}

export function phaseStory(state: GameState, p: PhaseStoryInput): string[] {
  const out: string[] = [];
  const enemies = p.tags.filter((t) => TAGS[t]?.kind === 'enemy');
  const envs = p.tags.filter((t) => TAGS[t]?.kind === 'env');

  // Scene-setting on the first phase, and when the fighting starts
  if (p.phaseIndex === 0 && envs.length) out.push(pick(state, ENV_SETUP[pick(state, envs)] ?? ['They arrived.']));
  // introduce each enemy once, at the real encounter: the most dangerous phase
  // (or earlier, if the squad chose to fight before then)
  const dangers = p.contract.phases.map((x) => x.danger);
  const encounter = dangers.indexOf(Math.max(...dangers));
  const fighting = p.approach === 'assault' || p.approach === 'arcana';
  const fresh = enemies.filter((t) => !p.introduced.has(t));
  if (fresh.length && (p.phaseIndex === encounter || (fighting && p.phaseIndex < encounter))) {
    const t = fresh[0];
    p.introduced.add(t);
    const pool = (ENEMY_SETUP[t] ?? []).filter((l) => fits(l, p.tags));
    if (pool.length) out.push(pick(state, pool).t);
  }

  const ok = p.result === 'strong' || p.result === 'success';
  const others = p.squad.filter((m) => m.id !== p.lead.id);
  const ranked = [...p.scores].sort((a, b) => a.score - b.score);
  const weakest = p.squad.find((m) => m.id === ranked[0]?.id) ?? p.lead;
  const wpn = itemDef(state, p.lead.loadout.weapon);
  const el = weaponElement(state, p.lead);
  const armor = itemDef(state, weakest.loadout.armor);
  const vars = {
    lead: first(p.lead),
    ally: first(others.length ? pick(state, others) : p.lead),
    clumsy: first(weakest),
    weakest: first(weakest),
    armor: armor ? armor.name.toLowerCase() : 'boots',
    weapon: wpn ? (el ? ` with ${ELEMENT_WORD[el]}-touched ${wpn.name.toLowerCase()}` : ` with their ${wpn.name.toLowerCase()}`) : ' bare-handed',
    element: el ? ` of ${ELEMENT_WORD[el]}` : '',
  };
  let line = fill(pick(state, ok ? ACTION[p.approach].ok : ACTION[p.approach].bad), vars);
  if (p.result === 'strong') line += pick(state, STRONG);
  if (p.result === 'severe') line += pick(state, SEVERE);
  out.push(line);

  // Gear matchups: praise the right tool, and say what would have worked better
  if (p.approach === 'assault' && enemies.length) {
    const tag = enemies[0];
    const mults = p.squad.map((m) => {
      const w = itemDef(state, m.loadout.weapon);
      const e = weaponElement(state, m);
      return { m, w, mult: damageMultiplier(p.tags, p.countered, w?.damage) * (e ? damageMultiplier(p.tags, p.countered, e) : 1), e };
    });
    const best = mults.reduce((a, b) => (b.mult > a.mult ? b : a));
    const worst = mults.reduce((a, b) => (b.mult < a.mult ? b : a));
    if (best.mult >= 1.2 && best.w) out.push(`${first(best.m)}'s ${best.e ? `${ELEMENT_WORD[best.e]}-keyed ` : ''}${best.w.name.toLowerCase()} was exactly the right tool against the ${TAGS[tag].name.toLowerCase()}.`);
    else if (worst.mult <= 0.8 && worst.w && ADVICE[tag]) out.push(`${first(worst.m)}'s ${worst.w.name.toLowerCase()} did little against the ${TAGS[tag].name.toLowerCase()}. Next time, ${ADVICE[tag]}.`);
  }
  if (p.approach === 'arcana' && enemies.length && el) {
    const mult = damageMultiplier(p.tags, p.countered, el);
    if (mult >= 1.3) out.push(`The ${ELEMENT_WORD[el]} did real damage to the ${TAGS[enemies[0]].name.toLowerCase()}.`);
    else if (mult <= 0.6 && ADVICE[enemies[0]]) out.push(`The ${ELEMENT_WORD[el]} barely bothered them. Next time, ${ADVICE[enemies[0]]}.`);
  }

  // Preparation: counters that paid off, and penalties nobody prepared for
  for (const t of p.tags) {
    const def = TAGS[t];
    if (!def?.counteredApproaches?.includes(p.approach)) continue;
    if (p.countered.has(t)) {
      const carrier = p.squad.find((m) => memberItems(state, m).some((it) => def.counteredBy?.includes(it.id)));
      const item = carrier && memberItems(state, carrier).find((it) => def.counteredBy?.includes(it.id));
      if (carrier && item) out.push(`${first(carrier)} had packed ${item.name.toLowerCase().startsWith('fen') ? '' : 'a '}${item.name.toLowerCase()}, and it turned out to matter.`);
      else if (def.counterProfession) out.push(`Having a ${def.counterProfession} along meant the ${def.name.toLowerCase()} never got a grip on them.`);
    } else if ((def.approach?.[p.approach] ?? 0) > 0 && !ok) {
      const fix = def.counteredBy?.map((id) => ITEMS[id]?.name).filter(Boolean)[0];
      if (fix) out.push(`Nobody had thought to pack ${fix.toLowerCase()}s, and the ${def.name.toLowerCase()} wore them down.`);
    }
  }
  return out;
}

const ROAD = [
  "{a} and {b} argued over the map until {c} found the drovers' track.",
  'It rained for two days, and {a} kept the fire going with wet wood out of pure stubbornness.',
  "They passed a burned-out toll-house with Ostrander's mark still painted on the door.",
  '{a} shot a hare, {b} burned it, and everyone ate it anyway.',
  'A farmer sold them eggs and then told them about the war for an hour.',
  '{a} sang marching songs until {b} threatened to throw them in a ditch.',
  'A Crown courier galloped past without stopping, and {a} spent the next mile guessing what the news was.',
  'They slept one night in a barn that had seen better years.',
];

const TRAIT_ROAD: Record<string, string> = {
  drunkard: '{x} found a wayside inn and had to be fetched out of it.',
  bookish: "{x} read by firelight and corrected everyone's pronunciation of Harrowmere.",
  hotheaded: '{x} got into an argument with a carter about who had right of way.',
  veteran: '{x} went quiet when they passed the old battlefield, and nobody pushed.',
  greedy: '{x} spent an evening working out what their share would come to.',
  brave: '{x} took the night watch that nobody wanted.',
  frail: '{x} had a cough by the second day.',
};

const SEASON_ROAD: Record<string, string> = {
  Winter: 'There was snow on the high road, and they walked in each other\'s footprints.',
  Summer: 'It was dusty and full of flies, and the evenings stayed light until late.',
  Autumn: 'The leaves were wet, the mornings were cold, and every village smelled of woodsmoke.',
  Spring: 'The mud came up to their ankles, and the hedges were just starting to turn green.',
};

function roadLines(state: GameState, squad: Member[], days: number, season = true): string[] {
  const out: string[] = [];
  const names = () => {
    const a = pick(state, squad);
    const rest = squad.filter((m) => m !== a);
    const b = rest.length ? pick(state, rest) : a;
    const rest2 = rest.filter((m) => m !== b);
    const c = rest2.length ? pick(state, rest2) : b;
    return { a: first(a), b: first(b), c: first(c) };
  };
  if (season && nextFloat(state) < 0.5) out.push(SEASON_ROAD[seasonOf(state.week)]);
  const traitHolders = squad.flatMap((m) => m.traits.filter((t) => TRAIT_ROAD[t]).map((t) => ({ m, t })));
  if (traitHolders.length && nextFloat(state) < 0.6) {
    const th = pick(state, traitHolders);
    out.push(TRAIT_ROAD[th.t].replace('{x}', first(th.m)));
  }
  for (let i = 0; i < days; i++) out.push(fill(pick(state, ROAD), names()));
  return out;
}

export function outboundJournal(state: GameState, c: Contract, squad: Member[]): JournalSection {
  if (c.travelWeeks === 0) {
    return { title: 'Across Varrow', lines: [`${squad.map(first).join(', ').replace(/, ([^,]*)$/, ' and $1')} left the hall at dusk and walked across the city to the job.`] };
  }
  return { title: `The road to ${c.region}`, lines: roadLines(state, squad, c.travelWeeks) };
}

export function homewardJournal(state: GameState, c: Contract, squad: Member[], dead: Member[], tier: OutcomeTier): JournalSection {
  const lines: string[] = [];
  if (dead.length) {
    lines.push(
      c.travelWeeks > 0
        ? `They buried ${dead.map(first).join(' and ')} by the road and marked the place.`
        : `They carried ${dead.map(first).join(' and ')} home wrapped in a cloak.`,
    );
  }
  const alive = squad.filter((m) => !dead.includes(m));
  if (alive.length && c.travelWeeks > 0) lines.push(...roadLines(state, alive, 1, false).slice(-1));
  lines.push(
    tier === 'Triumph'
      ? 'They came home loud, with heavy purses and a story they would tell for weeks.'
      : tier === 'Success'
        ? 'They came home tired, and paid.'
        : tier === 'Costly Success'
          ? 'The job was done, but nobody felt like celebrating.'
          : tier === 'Failure'
            ? 'Nobody said much on the way home.'
            : 'It was a long walk home, and a quiet one.',
  );
  return { title: c.travelWeeks > 0 ? 'The road home' : 'Home', lines };
}

export function addRecord(m: Member, entry: string) {
  m.record = [...(m.record ?? []), entry].slice(-15);
}
