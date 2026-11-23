// The story's "facts": every flag the narrative can set or read, with a note on
// what it means. Using an unregistered fact is a compile error, and the story
// checker (tests/story.test.ts) verifies each one is both set and used.

export const FACTS = {
  // Act I: setup
  start_arms: 'Chose to arm the guild at founding (grants gear).',
  ostranders_open: "The bank sends work: Ostrander's contracts can appear.",
  vorn_q_people: 'Asked Vorn what happens to the people the bank collects from.',
  vorn_q_hobbs: 'Asked Vorn why the bank does not just use Hobb & Daughters.',
  vorn_q_want: 'Asked Vorn what the bank really wants, and learned nothing.',
  vorn_slip: 'Vorn let slip that the bank wants to draft the next treaty.',
  hobbs_share: 'Sold Marta Hobb a quarter share of contract income.',
  dagny_contact: 'Dagny Fell feeds the guild dock gossip.',
  dagny_friend: 'Dagny Fell respects the guild for feeding the Lower Town for nothing.',
  // Act I: the Crown's silver
  fenn_route: 'Asked Fenn who knows the convoy route (reveals a danger on accepting).',
  fenn_stakes: "Told Fenn the bank's real aim; Fenn now trusts the guild.",
  fenn_pay: 'Asked Fenn what the commission pays.',
  fenn_haggled: 'Haggled with Fenn and failed.',
  silver_bonus: 'Haggled with Fenn and won +60 crowns on the convoy.',
  silver_accepted: "Accepted the commission for the Crown's silver.",
  silver_declined: 'Declined the commission; Hobb & Daughters carried the silver.',
  silver_delivered: "The guild delivered the Crown's silver: the payment was made.",
  silver_lost: "The Crown's silver was lost or never sent: the Crown defaulted.",
  silver_abandoned: 'Accepted the commission but never sent the convoy.',
  fenn_ally: 'Took a seat at the Exchequer table after the payment.',
  // Economy
  bank_paid_loan: "Let Ostrander's buy part of the guild's Weighhouse note.",
} as const;

export type FactId = keyof typeof FACTS;

/** Facts that can never be true together. The story checker enforces these. */
export const EXCLUSIVE_FACTS: FactId[][] = [
  ['silver_delivered', 'silver_lost'],
  ['silver_delivered', 'silver_declined'],
  ['silver_accepted', 'silver_declined'],
  ['silver_bonus', 'fenn_haggled'],
  ['vorn_slip', 'vorn_q_want'],
  ['dagny_contact', 'dagny_friend'],
];

export type NpcId = 'vorn' | 'fenn' | 'marta' | 'isbet' | 'dagny';
export type NpcStatus = 'alive' | 'dead' | 'gone';

export const NPCS: Record<NpcId, { name: string; role: string; faction: string }> = {
  vorn: { name: 'Factor Maelis Vorn', role: "Ostrander's chief factor in Varrow. Cool, precise and honest in her way.", faction: 'ostranders' },
  fenn: { name: 'Lord Treasurer Aubrey Fenn', role: 'Head of the Exchequer. Exhausted, decent, out of options.', faction: 'exchequer' },
  marta: { name: 'Marta Hobb', role: 'Matriarch of Hobb & Daughters. Pleasant, patient, ruthless.', faction: 'hobbs' },
  isbet: { name: 'Isbet Hobb', role: "Marta's eldest daughter and heir. Watches everything and prices it.", faction: 'hobbs' },
  dagny: { name: 'Dagny Fell', role: "A carrier in the Porters' Fraternity with ears on every dock.", faction: 'lowertown' },
};
