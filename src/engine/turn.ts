// The weekly simulation: everything the player set in motion resolves at once.
import { TRAITS } from './data/traits';
import { activeMods, modProduct, modSum } from './data/decrees';
import { councilNewWeek, freshCouncil, weeklyCouncil } from './council';
import { denIntel, freshFacilities, healBonus, level, trainCost, trainWeeks, upkeep, weeklyWorkshop } from './buildings';
import { triggerEvents } from './events';
import { resolveMission } from './missions';
import { executeRival, planRival } from './rival';
import { chance, randInt } from './rng';
import type { GameState } from './types';
import {
  addDispatch,
  applyClock,
  applyStanding,
  clamp,
  createMember,
  dateLabel,
  generateRecruit,
  living,
  refreshBoard,
  refreshMarket,
  spend,
  earn,
  supplyPrice,
} from './world';

export const SAVE_VERSION = 5;

export function freshNpcs(): GameState['npcs'] {
  return {
    vorn: { status: 'alive', attitude: 0 },
    fenn: { status: 'alive', attitude: 0 },
    marta: { status: 'alive', attitude: 0 },
    isbet: { status: 'alive', attitude: 0 },
    dagny: { status: 'alive', attitude: 0 },
  };
}

/** Upgrade older saves in place. Returns null if the save can't be used. */
export function migrateSave(g: GameState): GameState | null {
  if (!g || typeof g.week !== 'number') return null;
  if (g.version === 1) {
    for (const m of g.members) m.record = m.record ?? [];
    for (const r of g.recruits) r.member.record = r.member.record ?? [];
    for (const e of g.pendingEvents) e.transcript = e.transcript ?? [];
    g.version = 2;
  }
  if (g.version === 2) {
    g.npcs = freshNpcs();
    g.version = 3;
  }
  if (g.version === 3) {
    g.facilities = freshFacilities();
    g.craftQueue = [];
    g.version = 4;
  }
  if (g.version === 4) {
    g.council = freshCouncil();
    g.version = 5;
  }
  return g.version === SAVE_VERSION ? g : null;
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
    factions: {
      exchequer: { id: 'exchequer', standing: 10 },
      weighhouse: { id: 'weighhouse', standing: 5 },
      ostranders: { id: 'ostranders', standing: 0 },
      lowertown: { id: 'lowertown', standing: 0 },
    },
    rivals: {
      hobbs: { id: 'hobbs', name: 'Hobb & Daughters', crowns: 2000, renown: 20, strength: 10, aggression: 0.4, contractsWon: 0 },
    },
    clocks: { arrears: 30, leverage: 25, unrest: 30, cointrust: 60 },
    loans: [{ lender: 'weighhouse', principal: 800, weeklyRate: 0.01, paymentDue: 48, dueWeek: 6, missed: 0 }],
    market: { supplies: 1, iron: 1, leather: 1, timber: 1, reagents: 1 },
    stock: [],
    pendingEvents: [],
    dispatches: [],
    ledger: [],
    flags: {},
    npcs: freshNpcs(),
    facilities: freshFacilities(),
    craftQueue: [],
    council: freshCouncil(),
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
  for (const p of ['vanguard', 'skirmisher', 'scout', 'envoy'] as const) {
    const m = createMember(s, p);
    m.loyalty = 70;
    s.members.push(m);
  }
  s.recruits = [generateRecruit(s), generateRecruit(s)];
  refreshMarket(s);
  refreshBoard(s);
  addDispatch(s, 'story', 'The guild is founded', [
    `${dateLabel(1)}. Four people, a drafty hall on Tallow Street, and a debt.`,
    'Read the contract board, choose your squads carefully, and watch the ledger.',
  ]);
  planRival(s);
  triggerEvents(s);
  return s;
}

export interface Projection {
  week: number;
  wages: number;
  upkeep: number;
  supplies: number; // supply units consumed
  loan: number;
  expectedIncome: number;
  balance: number;
}

export function weeklyWages(s: GameState): number {
  return living(s).reduce((sum, m) => sum + m.wage, 0);
}

/** Projected cash for the next weeks, counting known costs and rewards of missions in the field. */
export function projectLedger(s: GameState, weeks = 4): Projection[] {
  const out: Projection[] = [];
  let bal = s.crowns;
  let supplies = s.supplies;
  for (let i = 0; i < weeks; i++) {
    const week = s.week + i;
    const wages = weeklyWages(s);
    const homeCount = living(s).filter((m) => m.status !== 'mission').length;
    const loan = s.loans.reduce((sum, l) => sum + (l.dueWeek === week ? l.paymentDue : 0), 0);
    // missions resolving this week pay roughly their listed reward
    const expectedIncome = s.missions.filter((m) => !m.report && m.arriveWeek === week).reduce((sum, m) => sum + m.contract.reward, 0);
    supplies -= homeCount;
    const shortfall = supplies < 0 ? Math.ceil(-supplies * supplyPrice(s)) : 0;
    if (supplies < 0) supplies = 0;
    bal += expectedIncome - wages - upkeep(s) - loan - shortfall;
    out.push({ week, wages, upkeep: upkeep(s), supplies: homeCount, loan, expectedIncome, balance: Math.round(bal) });
  }
  return out;
}

export function endWeekWarnings(s: GameState): string[] {
  const w: string[] = [];
  const idle = living(s).filter((m) => m.status === 'idle' && m.health >= 40 && m.assignment === 'rest' && m.fatigue < 10);
  if (idle.length) w.push(`${idle.length} rested member(s) are doing nothing.`);
  const home = living(s).filter((m) => m.status !== 'mission').length;
  if (s.supplies < home) w.push(`Supplies will run short: ${s.supplies} for ${home} mouths.`);
  const due = s.loans.find((l) => l.dueWeek === s.week);
  if (due && s.crowns - weeklyWages(s) - upkeep(s) < due.paymentDue) w.push(`You can't cover this week's loan payment of ${due.paymentDue} crowns.`);
  if (s.crowns - weeklyWages(s) - upkeep(s) < 0) w.push('Wages and upkeep will put you in the red.');
  const expiring = s.board.filter((c) => c.expiresWeek === s.week);
  if (expiring.length) w.push(`${expiring.length} contract(s) expire this week.`);
  return w;
}

export function advanceWeek(s: GameState): string | undefined {
  if (s.gameOver) return 'The game is over';
  if (s.pendingEvents.length) return 'Answer the waiting dispatches first';

  // ---- 1. home assignments ----
  for (const m of living(s)) {
    if (m.status === 'mission') {
      m.fatigue = clamp(m.fatigue + 3, 0, 100);
      continue;
    }
    const frail = m.traits.includes('frail');
    m.health = clamp(m.health + (frail ? 5 : 9) + healBonus(s), 0, 100);
    if (level(s, 'infirmary') >= 3) m.fatigue = clamp(m.fatigue - 5, 0, 100);
    m.fatigue = clamp(m.fatigue - 10, 0, 100);
    if (m.status === 'recovering' || m.health < 40) {
      m.status = m.health >= 40 ? 'idle' : 'recovering';
      m.fatigue = clamp(m.fatigue - 10, 0, 100);
      continue;
    }
    switch (m.assignment) {
      case 'rest':
        m.fatigue = clamp(m.fatigue - 20, 0, 100);
        m.health = clamp(m.health + 5, 0, 100);
        m.morale = clamp(m.morale + 2, 0, 100);
        break;
      case 'train': {
        if (s.crowns >= trainCost(s)) {
          spend(s, 'Training', trainCost(s));
          if (level(s, 'yard') >= 3) m.xp += 1;
          m.trainProgress += 1;
          m.fatigue = clamp(m.fatigue + 12, 0, 100);
          const attr = m.trainAttr ?? 'might';
          if (m.trainProgress >= trainWeeks(s)) {
            m.trainProgress = 0;
            if (m.attrs[attr] < 10) {
              m.attrs[attr] += 1;
              addDispatch(s, 'roster', `${m.name} completed training`, [`${attr[0].toUpperCase()}${attr.slice(1)} is now ${m.attrs[attr]}.`]);
            }
          }
        }
        break;
      }
      case 'rumors': {
        const gain = ['envoy', 'infiltrator', 'scout'].includes(m.profession) ? 2 : 1;
        s.intel += gain;
        m.fatigue = clamp(m.fatigue + 5, 0, 100);
        break;
      }
      case 'labor': {
        earn(s, 'Dock labor', 4 + Math.round(m.attrs.might * 0.8));
        m.fatigue = clamp(m.fatigue + 15, 0, 100);
        m.morale = clamp(m.morale - 3, 0, 100);
        break;
      }
      case 'scout': {
        const c = s.board.find((x) => x.id === m.scoutTarget);
        m.fatigue = clamp(m.fatigue + 10, 0, 100);
        if (c) {
          const all = ['scout', 'skirmisher', 'infiltrator'].includes(m.profession);
          const hidden = c.hidden.filter((h) => !h.revealed);
          for (const h of all ? hidden : hidden.slice(0, 1)) h.revealed = true;
          addDispatch(s, 'info', `${m.name} scouted "${c.title}"`, [
            hidden.length ? `Revealed: ${(all ? hidden : hidden.slice(0, 1)).map((h) => h.trueTag).join(', ')}.` : 'Nothing new was learned.',
          ]);
        }
        m.assignment = 'rest';
        m.scoutTarget = undefined;
        break;
      }
    }
  }

  // ---- 2. missions ----
  for (const mission of s.missions) {
    if (!mission.report && mission.arriveWeek <= s.week) resolveMission(s, mission);
  }
  for (const mission of [...s.missions]) {
    if (mission.report && mission.returnWeek <= s.week) {
      for (const id of mission.memberIds) {
        const m = s.members.find((x) => x.id === id);
        if (m && m.status === 'mission') {
          m.status = m.health < 40 ? 'recovering' : 'idle';
          m.missionId = undefined;
          m.assignment = 'rest';
        }
      }
      s.missions = s.missions.filter((x) => x !== mission);
      s.history.push(mission);
      if (s.history.length > 30) s.history.shift();
    }
  }

  // ---- 3. rival ----
  executeRival(s);
  weeklyCouncil(s);

  // ---- 4. economy ----
  const crew = living(s);
  const wages = weeklyWages(s);
  spend(s, 'Wages', wages);
  spend(s, 'Hall & buildings upkeep', upkeep(s));
  if (denIntel(s)) s.intel += denIntel(s);
  weeklyWorkshop(s);
  const mouths = crew.filter((m) => m.status !== 'mission').length;
  if (s.supplies >= mouths) s.supplies -= mouths;
  else {
    const hungry = mouths - s.supplies;
    s.supplies = 0;
    for (const m of crew.filter((x) => x.status !== 'mission').slice(0, hungry)) {
      m.morale = clamp(m.morale - 10, 0, 100);
      m.fatigue = clamp(m.fatigue + 10, 0, 100);
    }
    addDispatch(s, 'warning', 'Short of supplies', [`${hungry} member(s) went hungry this week. Morale suffers.`]);
  }
  for (const loan of s.loans) {
    loan.principal *= 1 + loan.weeklyRate * modProduct(s, 'loanRate');
    if (loan.dueWeek === s.week) {
      const due = Math.min(loan.paymentDue, Math.ceil(loan.principal));
      if (s.crowns >= due) {
        spend(s, 'Loan payment', due);
        loan.principal -= due;
        addDispatch(s, 'economy', 'Loan payment made', [`Paid ${due} crowns to the Weighhouse. ${Math.ceil(loan.principal)} still owed.`]);
      } else {
        loan.missed += 1;
        loan.principal += 20;
        applyStanding(s, loan.lender, -8);
        addDispatch(s, 'warning', 'Missed loan payment!', [
          `You could not pay the ${due} crowns due. A 20-crown penalty was added, and the Weighhouse is displeased.`,
          `Missed payments: ${loan.missed} of 3. At 3, your assets will be seized.`,
        ]);
      }
      loan.dueWeek += 4;
      loan.paymentDue = Math.max(25, Math.round(loan.principal * 0.06));
    }
  }
  s.loans = s.loans.filter((l) => l.principal > 0.5);

  // pay or fail to pay
  if (s.crowns < 0) {
    s.insolventWeeks += 1;
    for (const m of crew) {
      m.weeksUnpaid += 1;
      m.loyalty = clamp(m.loyalty - (m.traits.includes('greedy') ? 20 : 10), 0, 100);
    }
    addDispatch(s, 'warning', 'The guild is in the red', [
      `Your coffers are empty and wages went unpaid. Loyalty is falling. Weeks in the red: ${s.insolventWeeks} of 4.`,
    ]);
  } else {
    s.insolventWeeks = 0;
    for (const m of crew) m.weeksUnpaid = 0;
  }

  // ---- 5. members: loyalty & morale drift, desertion ----
  for (const m of crew) {
    if (m.morale < 30) m.loyalty = clamp(m.loyalty - 2, 0, 100);
    else if (m.morale > 65 && m.weeksUnpaid === 0) m.loyalty = clamp(m.loyalty + 1, 0, 100);
    m.morale = clamp(m.morale + (50 - m.morale) * 0.05, 0, 100);
    if (m.status === 'idle' && m.loyalty < 15 && chance(s, 0.35)) {
      m.status = 'left';
      m.causeOfDeath = 'Deserted';
      m.loadout = { consumables: [] };
      addDispatch(s, 'roster', `${m.name} has deserted`, ['They left in the night.']);
    }
  }

  // ---- 6. heat & politics ----
  s.heat = clamp(s.heat - (s.factions.exchequer.standing >= 30 ? 3 : 2) - modSum(s, 'heatDecay'), 0, 100);
  if (s.heat >= 80) applyStanding(s, 'exchequer', -3);
  const charterDanger = s.factions.exchequer.standing <= -60 || s.heat >= 100;
  s.charterWeeks = charterDanger ? s.charterWeeks + 1 : 0;
  if (charterDanger) {
    addDispatch(s, 'warning', 'Your charter is in danger', [
      `The Exchequer is preparing to revoke your charter. Weeks remaining: ${6 - s.charterWeeks}. Raise Exchequer standing above −60 and keep Heat below 100.`,
    ]);
  }

  // ---- 7. world clocks ----
  for (const m of activeMods(s)) for (const [c, v] of Object.entries(m.clocks ?? {})) applyClock(s, c as never, v!);
  applyClock(s, 'arrears', 0.6 + (s.flags.silver_lost ? 1.2 : 0));
  applyClock(s, 'leverage', 0.3 + s.clocks.arrears / 200);
  applyClock(s, 'unrest', 0.2 + (s.clocks.arrears > 50 ? 0.4 : 0) - (s.factions.lowertown.standing > 30 ? 0.3 : 0));
  applyClock(s, 'cointrust', -0.15 - (s.clocks.arrears > 60 ? 0.3 : 0));

  // ---- ledger ----
  s.ledger.push({ week: s.week, income: s.weekBook.income, expenses: s.weekBook.expenses, balance: s.crowns });
  if (s.ledger.length > 52) s.ledger.shift();
  s.weekBook = { income: {}, expenses: {} };

  // ---- fail states ----
  const loan = s.loans[0];
  if (s.insolventWeeks >= 4 || (loan && loan.missed >= 3)) {
    s.gameOver = {
      reason: 'bankrupt',
      week: s.week,
      text: 'The Weighhouse bailiffs arrive at dawn with a writ. The hall, the armory and the sign over the door are seized. Ledger & Blade is finished.',
    };
    return undefined;
  }
  if (s.charterWeeks >= 6) {
    s.gameOver = {
      reason: 'charter',
      week: s.week,
      text: 'A herald nails the Exchequer\'s writ to your door: your charter is revoked. Without it, every contract is a crime. The guild disbands.',
    };
    return undefined;
  }
  if (living(s).length === 0 && s.crowns < 40) {
    s.gameOver = { reason: 'collapse', week: s.week, text: 'No one is left to answer the door. The guild is a name on an old ledger.' };
    return undefined;
  }

  // ---- 8. new week ----
  s.week += 1;
  s.petitioned = [];
  councilNewWeek(s);
  s.recruits = s.recruits.filter((r) => r.expiresWeek >= s.week);
  while (s.recruits.length < 3) s.recruits.push(generateRecruit(s));
  refreshMarket(s);
  refreshBoard(s);
  planRival(s);
  triggerEvents(s);
  return undefined;
}

// re-exported helpers so the UI can use one import
export { TRAITS };
