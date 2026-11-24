// The Council of Varrow: a seasonal vote on two decrees. The guild declares a
// position and spends Influence, Intel or crowns to move factions' seats.
import { DECREE_BY_ID, DECREES, SEATS } from '../data/decrees';
import { FACTIONS } from '../data/factions';
import { chance, pick, weighted } from '../core/rng';
import type { AgendaItem, CouncilState, CouncilFaction, GameState, Stance } from '../core/types';
import { addDispatch, clamp } from '../core/util';
import { applyClock, applyStanding, factionName, spend, track } from '../core/effects';

const FACTION_IDS = Object.keys(SEATS) as CouncilFaction[];
export const ANNOUNCE_WEEK = 7; // week of the season the agenda is posted
export const VOTE_WEEK = 12; // the vote happens at the end of this week

export function freshCouncil(): CouncilState {
  return { agenda: [], active: [], lobbied: {}, history: [] };
}

const seasonWeek = (week: number) => ((week - 1) % 12) + 1;

export function tally(item: AgendaItem) {
  let votesFor = 0;
  let votesAgainst = 0;
  let undecided = 0;
  for (const f of FACTION_IDS) {
    const p = item.positions[f];
    if (p > 0) votesFor += SEATS[f];
    else if (p < 0) votesAgainst += SEATS[f];
    else undecided += SEATS[f];
  }
  return { votesFor, votesAgainst, undecided, passes: votesFor > votesAgainst };
}

export function lobbyCost(s: GameState, f: CouncilFaction) {
  const st = s.factions[f].standing;
  const influence = Math.max(1, 2 + (st < 0 ? 1 : 0) + (st <= -30 ? 1 : 0) - (st >= 30 ? 1 : 0));
  return { influence, intel: 3, crowns: 50 };
}

export type LobbyMethod = 'influence' | 'intel' | 'crowns';

export function canLobby(s: GameState, item: AgendaItem, f: CouncilFaction): string | undefined {
  if (!item.player) return 'Declare the guild’s position first';
  if (item.positions[f] === item.player) return 'Already on your side';
  if (s.council.lobbied[f] === s.week) return `${FACTIONS[f].short} has already been lobbied this week`;
  return undefined;
}

export function setPosition(s: GameState, decreeId: string, stance: Stance): string | undefined {
  const item = s.council.agenda.find((a) => a.id === decreeId);
  if (!item) return 'Not on the agenda';
  if (s.council.voteWeek === s.week && stance !== item.player) return 'Stances are locked in the week of the vote.';
  item.player = stance;
  if (stance) track(s, 'stance');
  return undefined;
}

export function lobby(s: GameState, decreeId: string, f: CouncilFaction, method: LobbyMethod): string | undefined {
  const item = s.council.agenda.find((a) => a.id === decreeId);
  if (!item) return 'Not on the agenda';
  const err = canLobby(s, item, f);
  if (err) return err;
  const cost = lobbyCost(s, f);
  if (method === 'influence') {
    if (s.influence < cost.influence) return `Need ${cost.influence} Influence`;
    s.influence -= cost.influence;
  } else if (method === 'intel') {
    if (s.intel < cost.intel) return `Need ${cost.intel} Intel`;
    s.intel -= cost.intel;
    applyStanding(s, f, -4); // nobody likes being blackmailed
  } else {
    if (s.crowns < cost.crowns) return `Need ${cost.crowns} crowns`;
    spend(s, 'Bribes', cost.crowns);
    s.heat = clamp(s.heat + 3, 0, 100);
  }
  item.positions[f] = clamp(item.positions[f] + item.player, -1, 1) as Stance;
  s.council.lobbied[f] = s.week;
  track(s, 'lobby');
  return undefined;
}

function announce(s: GameState) {
  const activeIds = new Set(s.council.active.filter((a) => a.untilWeek >= s.week).map((a) => a.id));
  const pool = DECREES.filter((d) => !activeIds.has(d.id));
  const agenda: AgendaItem[] = [];
  for (let i = 0; i < 2 && pool.length; i++) {
    const d = weighted(s, pool.map((x) => ({ item: x, weight: x.weight(s) })));
    pool.splice(pool.indexOf(d), 1);
    agenda.push({ id: d.id, base: { ...d.positions }, positions: { ...d.positions }, player: 0 });
  }
  s.council.agenda = agenda;
  s.council.voteWeek = s.week + (VOTE_WEEK - ANNOUNCE_WEEK);
  addDispatch(s, 'politics', 'The Council posts its agenda', [
    `The Council of Varrow will vote at the end of week ${VOTE_WEEK} of the season, in ${VOTE_WEEK - ANNOUNCE_WEEK + 1} weeks.`,
    ...agenda.map((a) => `${DECREE_BY_ID[a.id].title}: ${DECREE_BY_ID[a.id].text}`),
    'Declare your position and work on the factions from the Realm screen.',
  ]);
}

/** Hobb & Daughters lobby on the bank's behalf, one faction a week. */
function rivalLobbying(s: GameState) {
  const r = s.rivals.hobbs;
  for (const item of s.council.agenda) {
    const bank = item.base.ostranders;
    if (!bank || !chance(s, 0.25 + r.aggression * 0.35)) continue;
    const targets = FACTION_IDS.filter((f) => f !== 'ostranders' && item.positions[f] !== bank && s.council.lobbied[f] !== s.week);
    if (!targets.length) continue;
    const f = pick(s, targets);
    item.positions[f] = clamp(item.positions[f] + bank, -1, 1) as Stance;
    addDispatch(s, 'rival', 'Hobb & Daughters work the Council', [
      `Marta Hobb was seen dining with ${factionName(f)}. They now lean ${item.positions[f] > 0 ? 'toward' : item.positions[f] < 0 ? 'against' : 'to neither side of'} ${DECREE_BY_ID[item.id].title}.`,
    ]);
    return; // one move a week
  }
}

function resolve(s: GameState) {
  const lines: string[] = [];
  for (const item of s.council.agenda) {
    const d = DECREE_BY_ID[item.id];
    const t = tally(item);
    s.council.history.push({ week: s.week, id: item.id, passed: t.passes, votesFor: t.votesFor, votesAgainst: t.votesAgainst, player: item.player });
    lines.push(`${d.title}: ${t.passes ? 'PASSED' : 'FAILED'} (${t.votesFor} for, ${t.votesAgainst} against).`);
    if (t.passes) {
      s.council.active.push({ id: d.id, untilWeek: s.week + 12 });
      for (const [c, v] of Object.entries(d.once ?? {})) applyClock(s, c as never, v!);
      lines.push(`  In force for the next season: ${d.effects.join(' ')}`);
    }
    // the guild's stance has consequences
    if (item.player) {
      const won = (item.player > 0) === t.passes;
      if (won) {
        s.influence += 1;
        s.renown += 1;
      }
      for (const f of FACTION_IDS) {
        const original = item.base[f];
        if (!original) continue;
        if (original === item.player) applyStanding(s, f, won ? 2 : 1);
        else if (won) applyStanding(s, f, -3); // you beat them
      }
      lines.push(`  You ${won ? 'won' : 'lost'} this one${won ? ' (Influence +1, Renown +1)' : ''}. Factions on your side remember it, and so do the ones you beat.`);
    }
  }
  s.council.agenda = [];
  s.council.voteWeek = undefined;
  addDispatch(s, 'politics', 'The Council has voted', lines);
}

/** Called once per week at the end of the turn. */
export function weeklyCouncil(s: GameState) {
  s.council.active = s.council.active.filter((a) => a.untilWeek > s.week);
  if (s.council.agenda.length) {
    if (seasonWeek(s.week) === VOTE_WEEK || (s.council.voteWeek !== undefined && s.week >= s.council.voteWeek)) resolve(s);
    else rivalLobbying(s);
  }
}

/** Called when a new week begins. */
export function councilNewWeek(s: GameState) {
  if (seasonWeek(s.week) === ANNOUNCE_WEEK && !s.council.agenda.length) announce(s);
}
