// A balance bot for the expeditions trial. It prepares a squad well or badly
// and plays expeditions or whole campaigns, so `npm run exp:sim` can report
// how much preparation matters. Used by scripts and tests, not by the UI.
import { shuffle } from '../core/rng';
import { LENGTHS, SUPPLIES, SUPPLY_IDS } from './data/content';
import { delverMaxHp } from './dive';
import { DEFAULT_ORDERS, launchExpedition, livingDelvers, newExpGame, packSlots, restWeek, sellGoods, suggestPlan, hireDelver, payDebt } from './guild';
import { EXP_TUNING as T } from './tuning';
import type { ExpGame, ExpLength, ExpPlan } from './types';

export type Prep = 'good' | 'poor';

/** A poor plan: whoever is first in the roster in any order, little packed, reckless orders. */
export function poorPlan(g: ExpGame, length: ExpLength): ExpPlan {
  const crew = livingDelvers(g).filter((d) => d.hp >= 1);
  const r = { rng: g.seed ^ 0x5bd1e995 };
  const squad = shuffle(r, [...crew]).slice(0, 4).map((d) => d.id);
  return {
    length,
    squad,
    pack: { food: 1, bandages: 2 },
    orders: { retreat: 'stubborn', healFirst: 'front', wanderers: 'fight', camp: 'sites', consumables: 'hoard' },
  };
}

export function botPlan(g: ExpGame, length: ExpLength, prep: Prep): ExpPlan {
  if (prep === 'poor') return poorPlan(g, length);
  const plan = suggestPlan(g, length, DEFAULT_ORDERS);
  // a careful bot only packs what it can afford
  let guard = 0;
  while (guard++ < 40) {
    const need = SUPPLY_IDS.reduce((s, k) => s + Math.max(0, (plan.pack[k] ?? 0) - g.stores[k]) * SUPPLIES[k].price, 0);
    if (need <= g.crowns) break;
    const k = (['draughts', 'masks', 'tools', 'reagents', 'bandages', 'oil', 'food'] as const).find((x) => (plan.pack[x] ?? 0) > g.stores[x]);
    if (!k) break;
    plan.pack[k] = (plan.pack[k] ?? 0) - 1;
  }
  void packSlots;
  return plan;
}

export interface DiveStats {
  runs: number;
  complete: number;
  retreated: number;
  lost: number;
  /** all four came home */
  squadIntact: number;
  deaths: number;
  loot: number;
  renown: number;
}

/** Play one expedition from a fresh guild per seed. */
export function sampleDives(length: ExpLength, prep: Prep, runs: number, seed0 = 1000): DiveStats {
  const s: DiveStats = { runs, complete: 0, retreated: 0, lost: 0, squadIntact: 0, deaths: 0, loot: 0, renown: 0 };
  for (let i = 0; i < runs; i++) {
    const g = newExpGame(seed0 + i * 7919);
    g.crowns = 1000; // money is not the question here
    const plan = botPlan(g, length, prep);
    launchExpedition(g, plan);
    const r = g.last!;
    s[r.outcome === 'complete' ? 'complete' : r.outcome === 'retreated' ? 'retreated' : 'lost'] += 1;
    const dead = r.members.filter((m) => m.died).length;
    s.deaths += dead;
    if (!dead) s.squadIntact += 1;
    s.loot += r.lootValue + r.crownsFound;
    s.renown += r.renown;
  }
  return s;
}

export interface CampaignStats {
  games: number;
  /** guilds still open at the end */
  open: number;
  expeditions: number;
  deaths: number;
  renown: number;
  crowns: number;
  bossKills: number;
  debtPaid: number;
}

/** A careful player over a number of weeks: rest the hurt, pick a length the squad can manage. */
export function sampleCampaigns(games: number, weeks: number, prep: Prep, seed0 = 5000): CampaignStats {
  const s: CampaignStats = { games, open: 0, expeditions: 0, deaths: 0, renown: 0, crowns: 0, bossKills: 0, debtPaid: 0 };
  for (let i = 0; i < games; i++) {
    const g = newExpGame(seed0 + i * 104729);
    let guard = 0;
    let broke = false;
    while (g.week <= weeks && !g.gameOver && guard++ < 200) {
      sellGoods(g);
      // keep the roster at six
      while (livingDelvers(g).length < 6 && g.recruits.length) {
        const k = g.recruits.findIndex((r) => r.signOn <= g.crowns - 80);
        if (k < 0) break;
        hireDelver(g, k);
      }
      if (g.debt.principal > 0 && g.crowns > 400) payDebt(g, 70);
      const fit = livingDelvers(g).filter((d) => d.hp >= delverMaxHp(d) * 0.7 && d.fatigue <= 30 && d.exposure < 50);
      if (fit.length < 4 && prep === 'good') {
        restWeek(g);
        continue;
      }
      if (livingDelvers(g).filter((d) => d.hp >= 1).length < 4) {
        restWeek(g);
        continue;
      }
      const lvl = fit.reduce((a, d) => a + d.level, 0) / Math.max(1, fit.length);
      const length: ExpLength = prep === 'poor' ? 'medium' : lvl >= 3 && g.renown >= 10 ? 'long' : lvl >= 1.8 || g.expeditions >= 2 ? 'medium' : 'short';
      const plan = botPlan(g, length, prep);
      if (g.sponsors.length) plan.sponsorId = g.sponsors[0].id;
      const err = launchExpedition(g, plan);
      if (err) restWeek(g);
      else {
        s.expeditions += 1;
        s.deaths += g.last!.members.filter((m) => m.died).length;
        if ((g.last!.kills.kiln ?? 0) > 0) broke = true;
      }
    }
    if (broke) s.bossKills += 1;
    if (!g.gameOver) s.open += 1;
    s.renown += g.renown;
    s.crowns += g.crowns;
    s.debtPaid += T.debt.principal - g.debt.principal;
  }
  return s;
}

export const lengthWeeks = (l: ExpLength) => LENGTHS[l].weeks;
