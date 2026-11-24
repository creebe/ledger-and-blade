// Guildmaster's Notes: a guided sequence of objectives that walks a new player
// through every system. Objectives complete from game state or from counters
// recorded when the player takes an action (track()).
import type { GameState } from '../core/types';

export type GuideTab = 'hall' | 'contracts' | 'roster' | 'armory' | 'realm';

export interface Objective {
  id: string;
  chapter: string;
  title: string;
  how: string; // what to do, concretely
  why: string; // why it matters
  tab: GuideTab;
  guide?: string; // data-guide target to highlight
  done: (s: GameState) => boolean;
  available?: (s: GameState) => true | string; // string = why it is not available yet
  reward: { crowns?: number; intel?: number; influence?: number };
}

const n = (s: GameState, key: string) => s.tutorial?.counters[key] ?? 0;

export const OBJECTIVES: Objective[] = [
  // 1. First steps
  {
    id: 'first_contract',
    chapter: 'First steps',
    title: 'Take your first contract',
    how: 'Open Contracts, tap a job, select a few members and press Dispatch.',
    why: 'Contracts are how the guild earns. Every week costs wages and upkeep.',
    tab: 'contracts',
    guide: 'board',
    done: (s) => n(s, 'dispatch') > 0,
    reward: { crowns: 20 },
  },
  {
    id: 'read_odds',
    chapter: 'First steps',
    title: 'Ask “Why?” about the odds',
    how: 'Open a contract, select at least one member, then tap “Why?” next to a phase’s odds bar.',
    why: 'Every percentage is built from your squad’s score against the job’s difficulty. Knowing why tells you how to improve it.',
    tab: 'contracts',
    guide: 'board',
    done: (s) => n(s, 'why') > 0,
    reward: { intel: 1 },
  },
  {
    id: 'end_week',
    chapter: 'First steps',
    title: 'End the week',
    how: 'Press End Week. Everything you set in motion resolves at once.',
    why: 'The game moves a week at a time. Squads travel, wages are paid, the world changes.',
    tab: 'hall',
    guide: 'endweek',
    done: (s) => s.week >= 2,
    reward: { crowns: 10 },
  },
  // 2. Your people
  {
    id: 'orders',
    chapter: 'Your people',
    title: 'Give an idle member orders',
    how: 'Roster → tap a member → under “This week”, choose Gather rumors, Train or Dock labor.',
    why: 'Members at home can earn Intel, crowns or skill instead of just resting.',
    tab: 'roster',
    guide: 'roster',
    done: (s) => n(s, 'assign') > 0,
    reward: { intel: 1 },
  },
  {
    id: 'gear',
    chapter: 'Your people',
    title: 'Change someone’s gear',
    how: 'Roster → tap a member → tap a gear slot and pick an item. Buy more in the Armory.',
    why: 'The right weapon or kit for the job can swing the odds a long way.',
    tab: 'roster',
    guide: 'roster',
    done: (s) => n(s, 'equip') > 0,
    reward: { crowns: 15 },
  },
  {
    id: 'journal',
    chapter: 'Your people',
    title: 'Read a mission journal',
    how: 'When a squad’s job is done, tap “Read the mission report” in the week report or the Hall.',
    why: 'The journal shows who led, what worked, and what gear would have done better.',
    tab: 'hall',
    guide: 'dispatches',
    done: (s) => n(s, 'journal') > 0,
    available: (s) => (s.history.length + s.missions.filter((m) => m.report).length > 0 ? true : 'Finish a mission first'),
    reward: { intel: 1 },
  },
  // 3. Information
  {
    id: 'reveal',
    chapter: 'Knowing what you face',
    title: 'Uncover a hidden danger',
    how: 'Tap a dashed “?” tag on a contract to spend Intel, or set a member to Scout a contract.',
    why: 'Unknown tags turn your odds into a range. Knowing tells you what to bring.',
    tab: 'contracts',
    guide: 'board',
    done: (s) => n(s, 'reveal') > 0,
    reward: { intel: 2 },
  },
  {
    id: 'counter',
    chapter: 'Knowing what you face',
    title: 'Send a squad prepared for a tag',
    how: 'Give a squad member a counter for one of the job’s tags (a lantern for Dark, fur cloak for Cold, remedies for Swamp) before dispatching.',
    why: 'Countering a tag removes its penalty. The planner shows “Prepared for” when it works.',
    tab: 'armory',
    guide: 'market',
    done: (s) => n(s, 'countered') > 0,
    reward: { crowns: 20 },
  },
  {
    id: 'supplies',
    chapter: 'Knowing what you face',
    title: 'Buy supplies',
    how: 'Armory → Shop → buy supplies (bigger orders are cheaper). Everyone eats one a week, and squads carry their own.',
    why: 'Hungry members lose morale. Running out mid-crisis is how guilds fail.',
    tab: 'armory',
    guide: 'market',
    done: (s) => n(s, 'supplies') > 0,
    reward: { crowns: 10 },
  },
  // 4. The city
  {
    id: 'court',
    chapter: 'The city',
    title: 'Court a faction',
    how: 'Realm → Powers of Varrow → “Court them” on any faction.',
    why: 'Standing changes what work you’re offered, what things cost, and whether you keep your charter.',
    tab: 'realm',
    guide: 'factions',
    done: (s) => n(s, 'petition') > 0,
    available: (s) => (s.influence >= 3 ? true : 'Needs 3 Influence (from contracts and events)'),
    reward: { influence: 2 },
  },
  {
    id: 'spy',
    chapter: 'The city',
    title: 'Learn your rival’s plans',
    how: 'Realm → Rivals → “Learn their plans”.',
    why: 'Hobb & Daughters take contracts, poach members and spread rumors. Some of it can be stopped.',
    tab: 'realm',
    guide: 'rivals',
    done: (s) => n(s, 'spy') > 0,
    reward: { intel: 2 },
  },
  {
    id: 'council',
    chapter: 'The city',
    title: 'Take a stance at the Council',
    how: 'Realm → The Council of Varrow → choose Support or Oppose on a decree.',
    why: 'Decrees change prices, pay and the debt for a whole season. You can move votes.',
    tab: 'realm',
    guide: 'council',
    done: (s) => n(s, 'stance') > 0,
    available: (s) => (s.council.agenda.length ? true : 'The Council posts its agenda in week 7 of each season'),
    reward: { influence: 2 },
  },
  // 5. Building the guild
  {
    id: 'hire',
    chapter: 'Building the guild',
    title: 'Hire a recruit',
    how: 'Roster → Hiring Hall → Hire. Watch your weekly costs.',
    why: 'More people means more jobs at once, and the right Profession for each job.',
    tab: 'roster',
    guide: 'hiring',
    done: (s) => n(s, 'hire') > 0,
    reward: { crowns: 20 },
  },
  {
    id: 'build',
    chapter: 'Building the guild',
    title: 'Start a building',
    how: 'Hall → Buildings → tap one and Build. Members on “Build” speed it up.',
    why: 'Buildings heal, train, spy, shorten trips and let you craft, at a weekly upkeep.',
    tab: 'hall',
    guide: 'buildings',
    done: (s) => n(s, 'build') > 0,
    reward: { crowns: 30 },
  },
  {
    id: 'craft',
    chapter: 'Building the guild',
    title: 'Craft something',
    how: 'Armory → Workshop. You need a Forge or Stillroom, and materials from missions or the market.',
    why: 'Crafting turns loot into gear for far less than market prices.',
    tab: 'armory',
    guide: 'market',
    done: (s) => n(s, 'craft') > 0,
    available: (s) => ((s.facilities?.forge ?? 0) + (s.facilities?.stillroom ?? 0) > 0 ? true : 'Build a Forge or Stillroom first'),
    reward: { crowns: 20 },
  },
  {
    id: 'repay',
    chapter: 'Building the guild',
    title: 'Pay down the loan early',
    how: 'Hall → Debt → Repay. Early payments cut the interest that piles up every week.',
    why: 'Three missed payments and the Weighhouse seizes everything.',
    tab: 'hall',
    guide: 'debt',
    done: (s) => n(s, 'repay') > 0 || s.loans.length === 0,
    reward: { influence: 1 },
  },
];

export const FINAL_REWARD = { crowns: 50 };
