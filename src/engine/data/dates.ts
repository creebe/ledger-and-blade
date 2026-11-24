// Dates: dated checkpoints a few weeks ahead that the player can prepare for in
// one sitting. One Date is always current, and the next one is already in view.
// The story can cancel a Date before it arrives (see `cancel`). Rules live in
// story/dates.ts; this file is content only.
import type { DateStakes, DateTarget, FactionId, GameState, RivalId } from '../core/types';
import type { NpcId } from './facts';
import { upkeep } from '../economy/buildings';
import { seasonOf } from '../core/calendar';
import { living } from '../core/util';

export interface DateDef {
  id: string;
  title: string;
  /** who is coming, or who is behind it, in a few words */
  who: string;
  /** the faction whose dot is shown with the Date, if any */
  faction?: FactionId;
  rival?: RivalId;
  /** why it matters: one or two sentences */
  text: (s: GameState) => string;
  /** whether this Date can be set now */
  available: (s: GameState) => boolean;
  /** a fixed week it falls due; otherwise it's set `lead` weeks ahead */
  due?: (s: GameState) => number | undefined;
  lead?: [number, number];
  /** the early Dates come in this order while they're available */
  order?: number;
  weight?: number;
  /** weeks before the same Date can be set again; once-only if omitted and `once` */
  cooldown?: number;
  once?: boolean;
  npcs?: NpcId[];
  targets: (s: GameState) => DateTarget[];
  reward: DateStakes;
  cost: DateStakes;
  /** dispatch text when every target is met, and when one isn't */
  met: string;
  missed: string;
  /** a twist: the Date is called off before it arrives */
  cancel?: { when: (s: GameState) => boolean; text: string | ((s: GameState) => string) };
  /** called off this way if a character in `npcs` is no longer alive while it's current */
  gone?: string;
}

const weeklyCosts = (s: GameState) => living(s).reduce((n, m) => n + m.wage, 0) + upkeep(s);
const alive = (s: GameState, id: NpcId) => s.npcs[id]?.status === 'alive';
const seasonWeek = (week: number) => ((week - 1) % 12) + 1;
const round10 = (n: number) => Math.round(n / 10) * 10;

export const DATES: DateDef[] = [
  {
    id: 'first_payment',
    title: 'The Weighhouse Collects',
    who: "Alderman Coster's clerk",
    faction: 'weighhouse',
    order: 1,
    once: true,
    npcs: ['coster'],
    text: () =>
      "Coster's clerk comes for the first payment on the guild's note. Coster does not expect it to be late, and he has said so in writing.",
    available: (s) => s.week <= 2 && s.loans.length > 0 && s.loans[0].dueWeek - s.week >= 3,
    due: (s) => s.loans[0]?.dueWeek,
    targets: (s) => [{ kind: 'loanPaid' }, { kind: 'crowns', at: round10(weeklyCosts(s)) }],
    reward: { standing: { weighhouse: 4 }, influence: 1 },
    cost: { standing: { weighhouse: -5 }, renown: -1 },
    met: 'The clerk counted the payment twice and initialled the receipt in two places. Coster sends word that the sum was correct to the penny, and that he has noted the date.',
    missed: 'The clerk went back to the Weighhouse with less than he came for. Coster has written the guild into his book in red ink, which he keeps for this.',
    gone: "Coster's clerk did not come. The Weighhouse masters are going through Coster's own books, and the guild's payment goes to them as usual.",
  },
  {
    id: 'exchequer_list',
    title: "The Exchequer's List",
    who: "The Lord Treasurer's office",
    faction: 'exchequer',
    order: 2,
    once: true,
    lead: [4, 5],
    text: () =>
      "Fenn's clerks are drawing up a list of the chartered guilds fit for Crown work. They will judge the guild by what it has done, which so far is not much.",
    available: (s) => s.week <= 9,
    targets: () => [
      { kind: 'contracts', count: 2 },
      { kind: 'renownGain', gain: 4 },
    ],
    reward: { standing: { exchequer: 5 }, influence: 2 },
    cost: { standing: { exchequer: -3 } },
    met: "Ledger & Blade is on the Exchequer's list, just below a firm of rat-catchers. Fenn's clerks have the guild's charter number on file now.",
    missed: 'The list went to the Lord Treasurer without the guild on it. Jory checked, and the rat-catchers made it.',
  },
  {
    id: 'council_vote',
    title: 'The Council Votes',
    who: 'The Council of Varrow',
    weight: 3,
    cooldown: 8,
    text: () =>
      "The nine seats vote at the end of the season. The aldermen remember which guilds backed the winning side, and they keep a list of the charter numbers of the ones that didn't.",
    available: (s) => s.council.agenda.length > 0 && s.council.voteWeek !== undefined && s.council.voteWeek - s.week >= 2,
    due: (s) => s.council.voteWeek,
    targets: () => [{ kind: 'council' }],
    reward: { influence: 3, renown: 2 },
    cost: { renown: -2 },
    met: 'The guild backed a winner, and the aldermen noticed. Two of them now say the guild\'s name correctly.',
    missed: "The votes went the other way, or the guild never said which way it wanted them. Either way, two aldermen have stopped answering the guild's letters.",
  },
  {
    id: 'treasurer_visit',
    title: 'The Lord Treasurer Visits',
    who: 'Lord Treasurer Fenn',
    faction: 'exchequer',
    once: true,
    npcs: ['fenn'],
    lead: [5, 6],
    weight: 3,
    text: () =>
      'Fenn is coming to see the hall for himself. He would like to find a guild the Crown can be seen with, which means good standing with the Exchequer and not much Heat.',
    available: (s) => s.eventWeeks.silver_summons !== undefined && !s.flags.silver_lost,
    targets: () => [
      { kind: 'standing', faction: 'exchequer', at: 10 },
      { kind: 'heatBelow', below: 30 },
    ],
    reward: { influence: 3, standing: { exchequer: 4 } },
    cost: { standing: { exchequer: -4 } },
    met: 'Fenn stayed an hour and drank the bad wine without comment. On his way out he left a letter of introduction, and apologized for it being so short.',
    missed: "Fenn kept his visit short and his coat on. His secretary took notes, and you'd rather not know what they say.",
    cancel: {
      when: (s) => !!s.flags.silver_lost,
      text: "Fenn sent his apologies and put the visit off. The silver didn't reach the coast, and the Lord Treasurer has spent the week on Quay Street.",
    },
  },
  {
    id: 'vorn_books',
    title: "Ostrander's Reads the Books",
    who: 'Factor Vorn',
    faction: 'ostranders',
    once: true,
    npcs: ['vorn'],
    lead: [4, 6],
    weight: 2,
    text: (s) =>
      `Vorn wants to see the guild's books before the bank sends more work. She has asked for them clean, with a balance she can take seriously: at least ${round10(Math.max(300, weeklyCosts(s) * 3))} crowns.`,
    available: (s) => !!s.flags.ostranders_open && s.week >= 8,
    targets: (s) => [
      { kind: 'crowns', at: round10(Math.max(300, weeklyCosts(s) * 3)) },
      { kind: 'heatBelow', below: 40 },
    ],
    reward: { crowns: 80, standing: { ostranders: 5 } },
    cost: { standing: { ostranders: -5 } },
    met: 'Vorn read every page and corrected two sums in your favor. A retainer came the next morning, with a note from her that said "Adequate."',
    missed: "Vorn closed the ledger after the third page and said the bank would be in touch. She didn't take a copy.",
  },
  {
    id: 'oda_fair',
    title: "Saint Oda's Fair",
    who: 'Sister Brune',
    faction: 'oda',
    cooldown: 30,
    npcs: ['brune'],
    lead: [4, 6],
    text: () =>
      "The almshouse holds its fair on the green, and every guild in Varrow is expected to send food and be seen sending it. Sister Brune keeps a list of who gave what, and the Lower Town reads it.",
    available: (s) => !!s.flags.met_oda,
    targets: (s) => [
      { kind: 'supplies', at: 30 },
      { kind: 'standing', faction: 'lowertown', at: Math.max(10, Math.min(40, s.factions.lowertown.standing + 5)) },
    ],
    reward: { supplies: -15, renown: 3, standing: { oda: 5, lowertown: 2 } },
    cost: { standing: { oda: -3 } },
    met: "The guild's carts reached the green before the Weighhouse's did. Sister Brune wrote the guild's name at the top of her list, then crossed it out and wrote it bigger.",
    missed: 'The fair went on without much from the guild. Sister Brune wrote its name near the bottom of her list, just under a baker who sent one loaf.',
  },
  {
    id: 'auditors',
    title: "The Exchequer's Auditors",
    who: 'The Exchequer',
    faction: 'exchequer',
    cooldown: 24,
    lead: [3, 5],
    text: () =>
      'The Exchequer is sending auditors round the chartered guilds, starting with the ones people complain about. The guild came up.',
    available: (s) => s.heat >= 20,
    targets: (s) => [{ kind: 'heatBelow', below: Math.max(10, round10(s.heat) - 10) }],
    reward: { standing: { exchequer: 3 }, influence: 1 },
    cost: { heat: 8, standing: { exchequer: -3 } },
    met: 'The auditors found the guild dull, which was the idea. They left early to audit someone more interesting.',
    missed: 'The auditors found enough to write down and more to ask about. They took two of the ledgers away and gave a receipt for one.',
  },
  {
    id: 'porters_feast',
    title: "The Porters' Feast",
    who: "The Porters' Fraternity",
    faction: 'lowertown',
    cooldown: 30,
    lead: [4, 6],
    text: (s) =>
      `The porters eat together a few times a year, and they only invite people they trust to carry something heavy. ${alive(s, 'dagny') && (s.flags.dagny_friend || s.flags.dagny_contact) ? 'Dagny says the guild might be asked.' : 'The guild has not been asked yet.'}`,
    available: (s) => s.week >= 8 && s.clocks.unrest < 80,
    targets: (s) => [{ kind: 'standing', faction: 'lowertown', at: Math.max(10, Math.min(45, s.factions.lowertown.standing + 6)) }],
    reward: { standing: { lowertown: 3 }, intel: 2, morale: 3 },
    cost: { standing: { lowertown: -3 } },
    met: "The guild was asked, and went. Nobody made a speech. Two porters told your people things about the docks you'd have paid for.",
    missed: 'The feast went ahead without the guild. Word from the docks is that the porters roasted two pigs, and nobody mentioned the guild once.',
    cancel: {
      when: (s) => s.clocks.unrest >= 85,
      text: 'The feast was called off. The Lower Town is too angry this season to sit down together, even to eat.',
    },
  },
  {
    id: 'loan_review',
    title: 'The Weighhouse Reviews the Note',
    who: 'Alderman Coster',
    faction: 'weighhouse',
    cooldown: 24,
    npcs: ['coster'],
    lead: [5, 6],
    text: () =>
      "Coster reviews every note on his books twice a year, with his brass balance on the desk. If the guild has paid the Weighhouse well since the last review, he lowers the rate, and if it hasn't, he raises it and explains why at length.",
    available: (s) => s.week >= 14 && s.loans.length > 0 && s.loans[0].principal >= 200,
    targets: () => [{ kind: 'repaid', amount: 120 }],
    reward: { loanRate: -0.002, standing: { weighhouse: 2 } },
    cost: { loanRate: 0.002 },
    met: 'Coster weighed the payments on his balance and, after a long sigh, lowered the rate on the note.',
    missed: "Coster raised the rate on the note. He was very sorry about it, and he wrote the new figure down before he said so.",
    gone: "The review was called off. The Weighhouse masters are going through Coster's own books this month, and nobody has time for the guild's.",
  },
  {
    id: 'muster',
    title: 'The Muster on the Green',
    who: "The Crown's muster officers",
    faction: 'exchequer',
    cooldown: 30,
    lead: [5, 6],
    text: () =>
      'Every so often the Crown counts the swords for hire in Varrow, on the green, in public. The free companies send their best and stand up straight.',
    available: (s) => s.week >= 10,
    targets: (s) => [{ kind: 'members', count: Math.max(5, Math.min(8, living(s).length + 1)), seniors: 2 }],
    reward: { renown: 3, influence: 1 },
    cost: { renown: -2 },
    met: 'The officers counted the guild and wrote it down near the top. Two children followed your people home, which Jory says is how fame starts.',
    missed: "The guild looked thin on the green next to the free companies. The officers counted it anyway, without much interest.",
  },
  {
    id: 'winter_stores',
    title: 'Before the Snow',
    who: 'Jory Abbot',
    cooldown: 40,
    npcs: ['jory'],
    text: (s) =>
      `Jory has pinned a note to the larder door. Winter closes the roads and drives up the price of bread, and he would like ${Math.max(20, living(s).length * 4)} supplies in store before it does.`,
    available: (s) => seasonOf(s.week) === 'Autumn' && seasonWeek(s.week) <= 8,
    due: (s) => s.week + (12 - seasonWeek(s.week)),
    targets: (s) => [{ kind: 'supplies', at: Math.max(20, living(s).length * 4) }],
    reward: { morale: 4 },
    cost: { morale: -4 },
    met: "The stores are full, and the hall smells of smoked fish. Jory has hung the onions from the rafters, where he says the rats can't reach them.",
    missed: 'Winter came before the stores were full. Jory has started counting the bread out loud at supper.',
  },
  {
    id: 'hobbs_wager',
    title: "Marta Hobb's Wager",
    who: 'Marta Hobb',
    rival: 'hobbs',
    cooldown: 30,
    npcs: ['marta'],
    lead: [4, 5],
    text: () =>
      "Marta Hobb has told half the Copper Kettle that her daughters will be better known than your guild by the end of the month. She has put twenty crowns on it with the landlord.",
    available: (s) => s.week >= 12 && s.rivals.hobbs.active,
    targets: () => [{ kind: 'renownAbove', rival: 'hobbs' }],
    reward: { renown: 3, influence: 1 },
    cost: { renown: -2 },
    met: "Marta paid her bets in full and sent the guild a cake. The cake was very good, and the note with it said she'd win the next one.",
    missed: 'Marta collected on her wager in the Copper Kettle, loudly, while two of your people were drinking there.',
    cancel: {
      when: (s) => !alive(s, 'marta'),
      text: (s) =>
        alive(s, 'isbet')
          ? 'With Marta dead, the wager is off. Isbet paid back all thirty-one bets herself and kept a receipt for each.'
          : "With Marta dead, the wager is off. Her younger daughters paid back the bets on their way to the coast.",
    },
  },
];

export const DATE_BY_ID: Record<string, DateDef> = Object.fromEntries(DATES.map((d) => [d.id, d]));
