import { freshCouncil } from '../politics/council';
import { freshTutorial } from '../story/tutorial';
import { freshCodex } from '../story/codex';
import { freshFacilities } from '../economy/buildings';
import { triggerEvents } from '../story/scenes';
import { planRival } from '../rivals/rival';
import { pick, randInt } from './rng';
import { BACKERS, CIRCUMSTANCES, CIRCUMSTANCE_BY_ID, CIRCUMSTANCE_GROUPS } from '../data/starts';
import type { BackerId, FactionId, GameState } from './types';
import { addDispatch } from './util';
import { createMember, generateRecruit } from '../people/members';
import { dateLabel } from './calendar';
import { refreshBoard } from '../economy/board';
import { refreshMarket } from '../economy/market';
import { SAVE_VERSION } from './save';

export function freshNpcs(): GameState['npcs'] {
  return {
    vorn: { status: 'alive', attitude: 0 },
    fenn: { status: 'alive', attitude: 0 },
    marta: { status: 'alive', attitude: 0 },
    isbet: { status: 'alive', attitude: 0 },
    dagny: { status: 'alive', attitude: 0 },
    coster: { status: 'alive', attitude: 0 },
    brune: { status: 'alive', attitude: 0 },
    aske: { status: 'alive', attitude: 0 },
    pask: { status: 'alive', attitude: 0 },
    mayne: { status: 'alive', attitude: 0 },
    plaice: { status: 'alive', attitude: 0 },
    jory: { status: 'alive', attitude: 0 },
  };
}

export function freshRivals(): GameState['rivals'] {
  return {
    hobbs: { id: 'hobbs', name: 'Hobb & Daughters', crowns: 2000, renown: 20, strength: 10, aggression: 0.4, contractsWon: 0, active: true, feud: 0 },
    ninth: { id: 'ninth', name: 'The Ninth', crowns: 600, renown: 14, strength: 12, aggression: 0.25, contractsWon: 0, active: false, feud: 0 },
    assay: { id: 'assay', name: 'The Assay Office', crowns: 1200, renown: 18, strength: 4, aggression: 0.2, contractsWon: 0, active: false, feud: 0 },
  };
}

export function freshFactions(): GameState['factions'] {
  return {
    exchequer: { id: 'exchequer', standing: 10 },
    weighhouse: { id: 'weighhouse', standing: 5 },
    ostranders: { id: 'ostranders', standing: 0 },
    lowertown: { id: 'lowertown', standing: 0 },
    oda: { id: 'oda', standing: 0 },
    fourteen: { id: 'fourteen', standing: 0 },
    mudlarks: { id: 'mudlarks', standing: 0 },
  };
}

export function newGame(seed = Date.now() % 2147483647): GameState {
  const s: GameState = {
    version: SAVE_VERSION,
    seed,
    rng: seed,
    week: 1,
    crowns: 300,
    supplies: 40,
    intel: 2,
    influence: 3,
    renown: 5,
    heat: 0,
    materials: { iron: 0, leather: 0, timber: 0, reagents: 0 },
    members: [],
    recruits: [],
    items: [],
    board: [],
    missions: [],
    factions: freshFactions(),
    rivals: freshRivals(),
    clocks: { arrears: 30, leverage: 25, unrest: 30, cointrust: 60 },
    loans: [{ lender: 'weighhouse', principal: 800, weeklyRate: 0.01, paymentDue: 48, dueWeek: 6, missed: 0 }],
    market: { supplies: 1, iron: 1, leather: 1, timber: 1, reagents: 1 },
    start: { backer: 'merchant', circumstances: [] },
    stock: [],
    pendingEvents: [],
    dispatches: [],
    ledger: [],
    flags: {},
    npcs: freshNpcs(),
    facilities: freshFacilities(),
    craftQueue: [],
    council: freshCouncil(),
    tutorial: freshTutorial(),
    codex: freshCodex(),
    crierSeen: [],
    crierRecent: [],
    insolventWeeks: 0,
    charterWeeks: 0,
    eventWeeks: {},
    weekBook: { income: {}, expenses: {} },
    history: [],
    petitioned: [],
    nextId: 0,
    difficulty: 'standard',
  };
  // burn a few values so nearby seeds diverge
  for (let i = 0; i < 5; i++) randInt(s, 0, 1);
  rollStart(s);
  const backer = BACKERS[s.start.backer];
  for (const r of backer.roster) {
    const m = createMember(s, r.profession);
    m.loyalty = 70;
    if (r.trait && !m.traits.includes(r.trait)) m.traits = [r.trait, ...m.traits].slice(0, 2);
    s.members.push(m);
  }
  s.recruits = [generateRecruit(s), generateRecruit(s)];
  refreshMarket(s);
  refreshBoard(s);
  addDispatch(s, 'story', 'The guild is founded', [
    `${dateLabel(1)}. Four people, a drafty hall on Tallow Street, and a debt of ${backer.loan} crowns.`,
    `Backed by: ${backer.name}. ${backer.text}`,
    ...s.start.circumstances.map((id) => `${CIRCUMSTANCE_BY_ID[id].title}. ${CIRCUMSTANCE_BY_ID[id].text}`),
  ]);
  planRival(s);
  triggerEvents(s);
  return s;
}

/** Roll who backed the guild and the state of Varrow at the start, from the campaign seed. */
export function rollStart(s: GameState) {
  const backer = pick(s, Object.keys(BACKERS) as BackerId[]);
  const circumstances = CIRCUMSTANCE_GROUPS.map((g) => pick(s, CIRCUMSTANCES.filter((c) => c.group === g)).id);
  s.start = { backer, circumstances };
  const b = BACKERS[backer];
  s.crowns = b.crowns;
  s.supplies = b.supplies ?? s.supplies;
  s.materials.reagents += b.reagents ?? 0;
  s.loans = [{ lender: 'weighhouse', principal: b.loan, weeklyRate: 0.01, paymentDue: Math.round(b.loan * 0.06), dueWeek: 6, missed: 0 }];
  for (const [f, v] of Object.entries(b.standing ?? {})) s.factions[f as FactionId].standing += v!;
  if (backer === 'college') {
    s.rivals.assay.active = true;
    s.flags.assay_active = true;
  }
  for (const id of circumstances) CIRCUMSTANCE_BY_ID[id].apply(s);
  for (const k of Object.keys(s.marketBias ?? {})) s.market[k] = s.marketBias![k];
}
