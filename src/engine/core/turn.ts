import { activeMods, modProduct, modSum } from '../data/decrees';
import { councilNewWeek, weeklyCouncil } from '../politics/council';
import { discoverLore, weeklyCrier, weeklyJory } from '../story/codex';
import { denIntel, healBonus, level, trainCost, trainWeeks, upkeep, weeklyWorkshop } from '../economy/buildings';
import { triggerEvents } from '../story/scenes';
import { dateWarning, datesPhase, scheduleDates } from '../story/dates';
import { sealExpedition, settleExpedition, sellGoods } from '../expeditions/run';
import { CHANGES } from '../expeditions/data/content';
import { EXP_TUNING } from '../expeditions/tuning';
import { executeRival, planRival } from '../rivals/rival';
import { weeklyWar } from '../rivals/war';
import { chance } from './rng';
import type { GameState } from './types';
import { addDispatch, clamp, living } from './util';
import { applyClock, applyStanding, earn, spend, track } from './effects';
import { generateRecruit } from '../people/members';
import { refreshBoard } from '../economy/board';
import { refreshMarket, supplyPrice } from '../economy/market';
import { factionPerks, odaHeal } from '../politics/factions';

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
    // squads due home this week pay roughly their listed reward (the real outcome stays hidden until then)
    const expectedIncome = s.missions.filter((m) => !m.report && m.dispatchedWeek + m.plannedWeeks - 1 === week).reduce((sum, m) => sum + m.contract.reward, 0);
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
  if (idle.length) w.push(idle.length === 1 ? '1 rested member is doing nothing.' : `${idle.length} rested members are doing nothing.`);
  const home = living(s).filter((m) => m.status !== 'mission').length;
  if (s.supplies < home) w.push(`Supplies will run short: ${s.supplies} for ${home} mouths.`);
  const due = s.loans.find((l) => l.dueWeek === s.week);
  if (due && s.crowns - weeklyWages(s) - upkeep(s) < due.paymentDue) w.push(`You can't cover this week's loan payment of ${due.paymentDue} crowns.`);
  if (s.crowns - weeklyWages(s) - upkeep(s) < 0) w.push('Wages and upkeep will put you in the red.');
  const expiring = s.board.filter((c) => c.expiresWeek === s.week);
  const dw = dateWarning(s);
  if (dw) w.push(dw);
  if (expiring.length) w.push(expiring.length === 1 ? '1 contract expires this week.' : `${expiring.length} contracts expire this week.`);
  return w;
}

export function advanceWeek(s: GameState): string | undefined {
  if (s.gameOver) return 'The game is over';
  if (s.pendingEvents.length) return 'Answer the waiting dispatches first';
  homePhase(s);
  missionPhase(s);
  worldPhase(s);
  economyPhase(s);
  memberPhase(s);
  politicsPhase(s);
  datesPhase(s);
  clocksPhase(s);
  closeLedger(s);
  if (checkGameOver(s)) return undefined;
  startNewWeek(s);
  return undefined;
}

/** Members at home rest, train, gather rumors, labor or scout. */
function homePhase(s: GameState) {
  for (const m of living(s)) {
    // squads away carry their own wear: the trip's log settles it when they're home
    if (m.status === 'mission') continue;
    m.exposure = Math.max(0, (m.exposure ?? 0) - EXP_TUNING.exposure.homeDrop);
    if (m.fever) {
      m.fever.weeks -= 1;
      m.health = clamp(m.health + 4, 0, 100);
      if (m.fever.weeks > 0) continue;
      const c = m.fever.change;
      m.fever = undefined;
      if (!m.changes.includes(c)) m.changes.push(c);
      addDispatch(s, 'roster', `${m.name} is over the fever`, [`The Sink fever breaks, and ${m.name.split(' ')[0]} is back on their feet with something new: ${CHANGES[c].name.toLowerCase()}. ${CHANGES[c].text}`]);
      continue;
    }
    const frail = m.traits.includes('frail');
    m.health = clamp(m.health + (frail ? 5 : 9) + healBonus(s) + odaHeal(s), 0, 100);
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
      case 'guard':
        // watching the doors: tiring, but the hall is safer (see war.ts)
        m.fatigue = clamp(m.fatigue + 4, 0, 100);
        break;
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
          if (hidden.length) track(s, 'reveal');
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
}

/** Squads leave the yard (their trips are sealed), and squads whose trips are over come home. */
function missionPhase(s: GameState) {
  for (const ms of s.missions) {
    if (ms.sealed || ms.report) continue;
    // simulated again with the squad as it leaves: gear changed in the yard or a scene at the door counts
    sealExpedition(s, ms);
    ms.sealed = true;
  }
  for (const ms of [...s.missions]) {
    if (!ms.report && ms.returnWeek <= s.week) settleExpedition(s, ms);
    if (ms.report && ms.returnWeek <= s.week) {
      s.missions = s.missions.filter((x) => x !== ms);
      s.history.push(ms);
      if (s.history.length > 30) s.history.shift();
    }
  }
}

/** Rivals act, feuds move, the Council sits, and the city talks. */
function worldPhase(s: GameState) {
  executeRival(s);
  weeklyWar(s);
  weeklyCouncil(s);
  weeklyCrier(s);
  weeklyJory(s);
  discoverLore(s);
}

/** Wages, upkeep, workshops, supplies and the loan. */
function economyPhase(s: GameState) {
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
    addDispatch(s, 'warning', 'Short of supplies', [hungry === 1 ? '1 member went hungry this week. Morale suffers.' : `${hungry} members went hungry this week. Morale suffers.`]);
  }
  for (const loan of s.loans) {
    loan.principal *= 1 + loan.weeklyRate * modProduct(s, 'loanRate');
    if (loan.dueWeek === s.week) {
      const due = Math.min(loan.paymentDue, Math.ceil(loan.principal));
      // short of coin: sell what the squads brought back, and if a squad is still away, the Weighhouse waits for it
      if (s.crowns < due && Object.values(s.goods ?? {}).some((n) => (n ?? 0) > 0)) {
        const got = sellGoods(s);
        addDispatch(s, 'economy', 'Goods sold for the Weighhouse', [`The coin at home fell short, so the guild sold its goods for ${got} crowns to make the payment.`]);
      }
      if (s.crowns < due && s.missions.some((m) => !m.report && m.returnWeek > s.week) && (loan.waited ?? 0) < 3) {
        loan.waited = (loan.waited ?? 0) + 1;
        loan.dueWeek += 1;
        addDispatch(s, 'economy', 'The Weighhouse waits', [`The payment of ${due} crowns is due, and a squad is still away. The Weighhouse agrees to wait a week for them, and writes to say so.`]);
        continue;
      }
      loan.waited = 0;
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
}

/** Loyalty and morale drift; the unhappy may desert. */
function memberPhase(s: GameState) {
  const crew = living(s);
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
}

/** Faction perks, Heat, and the charter. */
function politicsPhase(s: GameState) {
  factionPerks(s);
  s.heat = clamp(s.heat - (s.factions.exchequer.standing >= 30 ? 3 : 2) - modSum(s, 'heatDecay'), 0, 100);
  if (s.heat >= 80) applyStanding(s, 'exchequer', -3);
  const charterDanger = s.factions.exchequer.standing <= -60 || s.heat >= 100;
  s.charterWeeks = charterDanger ? s.charterWeeks + 1 : 0;
  if (charterDanger) {
    addDispatch(s, 'warning', 'Your charter is in danger', [
      `The Exchequer is preparing to revoke your charter. Weeks remaining: ${6 - s.charterWeeks}. Raise Exchequer standing above −60 and keep Heat below 100.`,
    ]);
  }
}

/** Decrees and the Debt move the world clocks. */
function clocksPhase(s: GameState) {
  for (const m of activeMods(s)) for (const [c, v] of Object.entries(m.clocks ?? {})) applyClock(s, c as never, v!);
  applyClock(s, 'arrears', 0.6 + (s.flags.silver_lost ? 1.2 : 0));
  applyClock(s, 'leverage', 0.3 + s.clocks.arrears / 200);
  applyClock(s, 'unrest', 0.2 + (s.clocks.arrears > 50 ? 0.4 : 0) - (s.factions.lowertown.standing > 30 ? 0.3 : 0));
  applyClock(s, 'cointrust', -0.15 - (s.clocks.arrears > 60 ? 0.3 : 0));
}

/** Write the week into the ledger. */
function closeLedger(s: GameState) {
  s.ledger.push({ week: s.week, income: s.weekBook.income, expenses: s.weekBook.expenses, balance: s.crowns });
  if (s.ledger.length > 52) s.ledger.shift();
  s.weekBook = { income: {}, expenses: {} };
}

/** Ends the game if the guild is bankrupt, has lost its charter, or has nobody left. Returns true if it did. */
function checkGameOver(s: GameState): boolean {
  const loan = s.loans[0];
  if (s.insolventWeeks >= 4 || (loan && loan.missed >= 3)) {
    s.gameOver = {
      reason: 'bankrupt',
      week: s.week,
      text: 'The Weighhouse bailiffs arrive at dawn with a writ. The hall, the armory and the sign over the door are seized. Ledger & Blade is finished.',
    };
    return true;
  }
  if (s.charterWeeks >= 6) {
    s.gameOver = {
      reason: 'charter',
      week: s.week,
      text: 'A herald nails the Exchequer\'s writ to your door: your charter is revoked. Without it, every contract is a crime. The guild disbands.',
    };
    return true;
  }
  if (living(s).length === 0 && s.crowns < 40) {
    s.gameOver = { reason: 'collapse', week: s.week, text: 'No one is left to answer the door. The guild is a name on an old ledger.' };
    return true;
  }
  return false;
}

/** Turn the page: new recruits, market, board, rival plans and events. */
function startNewWeek(s: GameState) {
  s.week += 1;
  s.petitioned = [];
  councilNewWeek(s);
  s.recruits = s.recruits.filter((r) => r.expiresWeek >= s.week);
  while (s.recruits.length < 3) s.recruits.push(generateRecruit(s));
  refreshMarket(s);
  refreshBoard(s);
  planRival(s);
  triggerEvents(s);
  discoverLore(s);
  scheduleDates(s);
}

