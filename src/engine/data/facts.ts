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
  // Act I: the wider cast
  vorn_fixed_board: 'Vorn fixed the spelling on your notice board herself.',
  vorn_told: 'Told Vorn when the silver wagons would leave.',
  vorn_honest: 'Asked Vorn straight out whether the bank wants the silver to fail.',
  riot_fed: 'Fed the bread riot (supplies or bakers).',
  riot_held: 'Held the line in the bread market without drawing blood.',
  riot_broken: 'Broke up the bread riot for the Exchequer.',
  coster_job: "Took Coster's job checking the weights at Hesketh's grain store.",
  coster_terms: 'Haggled better terms on the loan from Coster.',
  weights_exposed: "Proved Hesketh's grain store was using short weights.",
  weights_failed: "Failed to prove the short weights at Hesketh's.",
  coster_ledger: "Bought the page from the river strongbox that ties Coster to an insurance fraud.",
  coster_exposed: 'Handed Coster\'s page to the Weighhouse masters.',
  pask_deal: 'Buys through Wenna Pask\'s low-tide market.',
  pask_reported: 'Reported Wenna Pask to the toll-men.',
  brune_q_bank: "Asked Sister Brune about the bank's donations.",
  salts_accepted: "Agreed to fetch fever salts for Saint Oda's.",
  salts_delivered: "Brought the fever salts back to Saint Oda's.",
  salts_failed: "Failed to bring back the fever salts.",
  mayne_q_ford: 'Asked Mayne what happened to the Ninth after Cassel Ford.',
  isbet_pact: "Agreed to Isbet's private split of the river work.",
  isbet_betrayed: "Told Marta about Isbet's offer.",
  ansel_freed: "Freed Dagny's brother Ansel from the river chain.",
  ansel_lost: "Ansel Fell was sent to the galleys at Anselm.",
  tapestry_sold: "Sold the Exchequer's last tapestry quietly in Harrowmere.",
  tapestry_lost: "Lost the Exchequer's last tapestry on the road.",
  tapestry_bought: "Bought the Exchequer's last tapestry yourself.",
  aske_plate_saved: 'Got the Aske family silver out before the assessors came.',
  aske_plate_lost: 'Lost the Aske family silver on the way out.',
  aske_betrayed: "Told the bank's assessors about the Aske family silver.",
  // Factions and rivals met during the story
  met_oda: "Met Sister Agathe Brune: Saint Oda's is known to the guild.",
  met_fourteen: 'Met Lady Honora Aske: the Fourteen are known to the guild.',
  met_mudlarks: 'Met Wenna Pask: the Mudlarks are known to the guild.',
  ninth_active: 'Captain Mayne has come to Varrow: the Ninth compete for work.',
  assay_licensed: 'Paid for an Assay Office license: the stillroom and foci are no longer fined.',
  assay_active: 'Master Assayer Plaice has taken notice: the Assay Office watches the guild.',
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
  ['riot_fed', 'riot_held'],
  ['riot_fed', 'riot_broken'],
  ['riot_held', 'riot_broken'],
  ['weights_exposed', 'weights_failed'],
  ['pask_deal', 'pask_reported'],
  ['salts_delivered', 'salts_failed'],
  ['isbet_pact', 'isbet_betrayed'],
  ['ansel_freed', 'ansel_lost'],
  ['tapestry_sold', 'tapestry_lost'],
  ['tapestry_sold', 'tapestry_bought'],
  ['tapestry_lost', 'tapestry_bought'],
  ['aske_plate_saved', 'aske_plate_lost'],
  ['aske_plate_saved', 'aske_betrayed'],
  ['aske_plate_lost', 'aske_betrayed'],
];

export type NpcId = 'vorn' | 'fenn' | 'marta' | 'isbet' | 'dagny' | 'coster' | 'brune' | 'aske' | 'pask' | 'mayne' | 'plaice' | 'jory';
export type NpcStatus = 'alive' | 'dead' | 'gone';

export const NPCS: Record<NpcId, { name: string; role: string; faction: string }> = {
  vorn: { name: 'Factor Maelis Vorn', role: "Runs Ostrander's office on Quay Street. She is honest with you, which is not the same as being on your side.", faction: 'ostranders' },
  fenn: { name: 'Lord Treasurer Aubrey Fenn', role: 'Head of the Exchequer. He has run out of good options and is working through the bad ones politely.', faction: 'exchequer' },
  marta: { name: 'Marta Hobb', role: 'Has run Hobb & Daughters for thirty years. She remembers your members\' names and their mothers\' names.', faction: 'hobbs' },
  isbet: { name: 'Isbet Hobb', role: "Marta's eldest daughter and heir. She says very little, and most of it is numbers.", faction: 'hobbs' },
  dagny: { name: 'Dagny Fell', role: "A carrier in the Porters' Fraternity who hears everything that comes off a boat.", faction: 'lowertown' },
  coster: { name: 'Alderman Piet Coster', role: 'Master of the city scales, and the man who holds your loan. He brings his own scales to meetings.', faction: 'weighhouse' },
  brune: { name: 'Sister Agathe Brune', role: "Almoner of Saint Oda's. She counts the almshouse beds every night and the firewood every morning.", faction: 'oda' },
  aske: { name: 'Lady Honora Aske', role: 'Head of one of the Fourteen. Her castle is pledged to the bank, and she has only recently learned to count money.', faction: 'fourteen' },
  pask: { name: 'Wenna Pask', role: 'Runs the low-tide market on the river flats, where things that fell off barges are sold.', faction: 'mudlarks' },
  mayne: { name: 'Captain Rufus Mayne', role: 'Commands the Ninth. He was a sergeant at Cassel Ford and has been recruiting ever since.', faction: 'ninth' },
  plaice: { name: 'Master Assayer Corwin Plaice', role: 'Runs the Assay Office. He reads clauses aloud and has never been in a hurry.', faction: 'assay' },
  jory: { name: 'Jory Abbot', role: 'The hall\'s clerk. He came with the building and has outlasted three guildmasters.', faction: 'guild' },
};

/** Every named character alive, with no opinion of the guild yet. */
export function freshNpcs(): Record<NpcId, { status: NpcStatus; attitude: number }> {
  return Object.fromEntries((Object.keys(NPCS) as NpcId[]).map((id) => [id, { status: 'alive' as NpcStatus, attitude: 0 }])) as Record<NpcId, { status: NpcStatus; attitude: number }>;
}
