// Turns mission mechanics into a readable expedition journal. Every line is
// grounded in what actually happened: who led, which gear mattered, which tags
// helped or hurt, so the journal doubles as feedback for the next plan.
import { ITEMS } from './data/items';
import { TAGS } from './data/tags';
import { damageMultiplier, itemDef, memberItems } from './odds';
import { nextFloat, pick } from './rng';
import { seasonOf } from './data/events';
import type { Approach, Contract, Element, GameState, JournalSection, Member, OutcomeTier, PhaseResult, TagId } from './types';

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
    { t: 'Yellow eyes in the bracken: a pack, bigger than anyone had said.', not: ['urban', 'dark'] },
    { t: 'Spoor everywhere, and the stink of wet fur on the wind.', not: ['urban'] },
    { t: 'Something large circled them in the dark, patient as a debt-collector.' },
  ],
  armored: [{ t: 'The defenders wore good mail, better than anyone in Varrow could afford these days.' }, { t: 'Steel glinted behind the barricade: armored men, and plenty of them.' }],
  swarm: [{ t: 'The walls moved: carrion-beetles, thousands of them, clicking in the lamplight.' }, { t: 'Rats poured from the drains like grey water.' }],
  thugs: [{ t: 'Hired knives in patched coats, more bored than dangerous.' }, { t: 'A dozen dockside bruisers, paid by the day, and not paid enough.', only: ['urban'] }, { t: 'A dozen roadside bruisers, paid by the day, and not paid enough.', not: ['urban'] }],
  soldiers: [
    { t: 'Sell-swords in matched colors, moving like men who had done this before.' },
    { t: 'Crossbows on the ridge, held by drilled hands.', not: ['urban', 'dark'] },
    { t: 'Crossbows at the windows, held by drilled hands.', only: ['urban'] },
  ],
  guards: [{ t: 'Sentries walked their rounds in pairs, lanterns swinging.' }, { t: 'The guards were awake, alert, and counting heads.' }],
  warded: [{ t: 'Pale sigils shimmered on every door. Someone had paid a hedge-wizard well.' }, { t: 'The air tasted of copper and thunder: wards, and fresh ones.' }],
  trolls: [{ t: 'The troll rose out of the gloom like a hill deciding to stand.' }, { t: 'It was twice the height of a man, and the wounds from the last guild to try were already closed.' }],
  fireborn: [{ t: "Heat rolled out of the dark, and something with a salamander's grin rolled with it." }, { t: 'Drakelings glowing like coals nested in the old galleries.', only: ['dark'] }],
  crowd: [{ t: 'The crowd pressed close, angry and hungry, with stones in their fists.' }, { t: 'Hundreds of faces, every one of them watching your people.' }],
};

function fits(l: Line, tags: TagId[]) {
  return !(l.not ?? []).some((t) => tags.includes(t)) && (!l.only || l.only.some((t) => tags.includes(t)));
}

const ENV_SETUP: Record<string, string[]> = {
  cold: ['Frost rimed every buckle, and breath smoked.', 'The wind off the hills cut through wool like a blade.'],
  swamp: ['Black water to the knee, and every step a negotiation with the mud.', 'Fever-mist lay on the fens like a wet sheet.'],
  dark: ['Beyond the lantern-light, the dark was absolute.', 'They went down into the dark, counting steps.'],
  night: ['A moonless night, which was either a blessing or a curse.', 'They moved after midnight, when honest folk were abed.'],
  urban: ['Varrow\'s alleys, narrow and crooked and full of windows.', 'Washing lines, gutters and a hundred pairs of eyes.'],
  rough: ['Scree and broken ground, with a sheer drop to one side.', 'The path was more of a rumor than a road.'],
  open_road: ['Open country with no cover for a mile in any direction.', 'The road ran straight and bare under a wide sky.'],
  plague: ['Chalk crosses on the doors. Fever in the village.', 'People coughed behind shutters as they passed.'],
};

const ACTION: Record<Approach, { ok: string[]; bad: string[] }> = {
  assault: {
    ok: [
      '{lead} led the charge{weapon}, with {ally} at their shoulder.',
      '{lead} struck first{weapon}, and the rest followed in a wedge of steel.',
      'It was short and ugly. {lead} broke the first rush{weapon}, and the second never came.',
    ],
    bad: ['{lead} went in hard{weapon}, but the line buckled.', 'The fight turned against them. {ally} was dragged down and had to be hauled back by the collar.', 'They fought, and they bled for every yard.'],
  },
  stealth: {
    ok: ['{lead} found the gap, a drainage cut and a blind corner, and led them through single file.', 'Not a stone turned. {lead} counted the patrols, and they slipped between them like smoke.'],
    bad: ["{clumsy}'s {armor} rang on stone like a church bell.", '{lead} misjudged the ground, and something heard them.', '{clumsy} stepped on something that crunched. Every head turned.'],
  },
  guile: {
    ok: ['{lead} did the talking, all charm and borrowed authority, and the door opened.', '{lead} told a lie so good that the listener repeated it to the next man.', '{lead} found the right price for the right person.'],
    bad: ["{lead}'s story had a hole in it, and someone found it.", 'The bribe was taken, and the favor was not given.', '{lead} talked too long, and the listener grew suspicious.'],
  },
  endurance: {
    ok: ['They marched hard and kept together. {lead} set the pace, and nobody fell behind.', '{lead} kept them moving when the others wanted to stop.'],
    bad: ['{weakest} fell behind, and the others had to wait.', 'Blisters, cramps and short tempers. They arrived late and spent.'],
  },
  arcana: {
    ok: ['{lead} drew a sigil in the air{element}, and the problem simply… stopped.', "{lead}'s spellwork{element} did what blades could not."],
    bad: ["{lead}'s spell guttered like a damp match.", 'The reagents were wrong, or the wards were stronger. The working failed.'],
  },
};

const STRONG = [' A textbook piece of work.', ' The others would be talking about it for weeks.', ' It could hardly have gone better.'];
const SEVERE = [' Then everything went wrong at once.', ' It turned into a disaster.', ' Nobody would talk about it afterward.'];

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
    else if (worst.mult <= 0.8 && worst.w && ADVICE[tag]) out.push(`${first(worst.m)}'s ${worst.w.name.toLowerCase()} did little against the ${TAGS[tag].name.toLowerCase()}. In hindsight, ${ADVICE[tag]}.`);
  }
  if (p.approach === 'arcana' && enemies.length && el) {
    const mult = damageMultiplier(p.tags, p.countered, el);
    if (mult >= 1.3) out.push(`The ${ELEMENT_WORD[el]} found the weakness in the ${TAGS[enemies[0]].name.toLowerCase()}.`);
    else if (mult <= 0.6 && ADVICE[enemies[0]]) out.push(`The ${ELEMENT_WORD[el]} barely troubled them. In hindsight, ${ADVICE[enemies[0]]}.`);
  }

  // Preparation: counters that paid off, and penalties nobody prepared for
  for (const t of p.tags) {
    const def = TAGS[t];
    if (!def?.counteredApproaches?.includes(p.approach)) continue;
    if (p.countered.has(t)) {
      const carrier = p.squad.find((m) => memberItems(state, m).some((it) => def.counteredBy?.includes(it.id)));
      const item = carrier && memberItems(state, carrier).find((it) => def.counteredBy?.includes(it.id));
      if (carrier && item) out.push(`The ${item.name.toLowerCase()} ${first(carrier)} packed made all the difference.`);
      else if (def.counterProfession) out.push(`Having a ${def.counterProfession} along kept the ${def.name.toLowerCase()} at bay.`);
    } else if ((def.approach?.[p.approach] ?? 0) > 0 && !ok) {
      const fix = def.counteredBy?.map((id) => ITEMS[id]?.name).filter(Boolean)[0];
      if (fix) out.push(`Nobody had packed ${fix.toLowerCase()}s, and the ${def.name.toLowerCase()} told.`);
    }
  }
  return out;
}

const ROAD = [
  '{a} and {b} argued over the map until {c} found the drover\'s track.',
  'Rain for two days. {a} kept the fire going with wet wood and stubbornness.',
  "They passed a burned toll-house with Ostrander's mark still on the door.",
  '{a} shot a hare, {b} burned it, and everyone ate it anyway.',
  'A farmer sold them eggs and told them about the war, at length.',
  '{a} sang marching songs until {b} threatened violence.',
  'A Crown courier galloped past without stopping. {a} wondered aloud what the news was.',
  'They slept in a barn that smelled of better years.',
];

const TRAIT_ROAD: Record<string, string> = {
  drunkard: '{x} found a wayside inn and had to be fetched out of it.',
  bookish: '{x} read by firelight and corrected everyone\'s pronunciation of Harrowmere.',
  hotheaded: '{x} picked a fight with a carter over the right of way.',
  veteran: '{x} went quiet when they passed the old battlefield.',
  greedy: '{x} spent the evening working out their share.',
  brave: '{x} took the night watch nobody wanted.',
  frail: '{x} was coughing by the second day.',
};

const SEASON_ROAD: Record<string, string> = {
  Winter: 'Snow on the high road. They walked in each other\'s footprints.',
  Summer: 'Dust, flies and long light evenings.',
  Autumn: 'Wet leaves, cold mornings and the smell of woodsmoke.',
  Spring: 'Mud to the ankle and the first green in the hedges.',
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
    return { title: 'Across Varrow', lines: [`They left the hall at dusk and crossed the city to ${c.region === 'Varrow' ? 'the job' : c.region}, ${squad.map(first).join(', ')}.`] };
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
      ? 'They came home loud, with heavier purses and a story to tell.'
      : tier === 'Success'
        ? 'They came home tired and paid.'
        : tier === 'Costly Success'
          ? 'The job was done, but nobody felt much like celebrating.'
          : tier === 'Failure'
            ? 'Nobody talked much on the way home.'
            : 'It was a long, silent walk home.',
  );
  return { title: c.travelWeeks > 0 ? 'The road home' : 'Home', lines };
}

export function addRecord(m: Member, entry: string) {
  m.record = [...(m.record ?? []), entry].slice(-15);
}
