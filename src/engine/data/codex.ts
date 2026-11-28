// The Codex: what the guild knows about the world. "Common knowledge" is known
// from the start (any Varrow guildmaster would know it). Everything else is
// learned through play: places visited, enemies faced, people met, members'
// own pasts, and talk in the streets. Each entry says how it was learned.
import type { GameState, TagId } from '../core/types';
import { hasStart } from './starts';
import { loanStillDue } from '../core/util';

export type CodexCategory = 'Common knowledge' | 'History' | 'Places' | 'People' | 'Foes' | 'Powers & trades';

export interface CodexEntry {
  id: string;
  title: string;
  category: CodexCategory;
  text: string;
  source: (s: GameState) => string; // how the guild learned this
  unlock: (s: GameState) => boolean;
}

const reports = (s: GameState) => [...s.history, ...s.missions].filter((m) => m.report);
const visited = (s: GameState, region: string) => reports(s).some((m) => m.contract.region === region);
const faced = (s: GameState, tag: TagId) =>
  reports(s).some((m) => m.report?.tier !== 'Withdrawn' && [...m.contract.tags, ...m.contract.hidden.map((h) => h.trueTag), ...(m.extraTags ?? [])].includes(tag));
const fired = (s: GameState, id: string) => s.eventWeeks[id] !== undefined;
const someone = (s: GameState, pred: (m: GameState['members'][number]) => boolean) => s.members.find(pred);
const crier = (s: GameState, id: string) => (s.crierSeen ?? []).includes(id);

export const CODEX: CodexEntry[] = [
  // ---- Common knowledge: known from day one ----
  {
    id: 'varrow',
    title: 'Varrow',
    category: 'Common knowledge',
    text: 'The capital: a river port behind old walls, with the Lower Town crowded below them along the docks. The river chain across the water once paid the Crown a fortune in tolls. Now it pays Ostrander\'s.',
    source: () => 'You live here.',
    unlock: () => true,
  },
  {
    id: 'the_debt',
    title: 'The Debt',
    category: 'Common knowledge',
    text: "Everyone in Varrow can tell you the number: four million crowns, owed to Ostrander's bank since the war, paid in quarterly installments. Fewer can tell you where the money went, and nobody can tell you when it ends.",
    source: () => 'Common talk in every tavern.',
    unlock: () => true,
  },
  {
    id: 'charters',
    title: 'Guild charters',
    category: 'Common knowledge',
    text: 'A charter from the Exchequer lets a guild take paid work anywhere in the realm, armed. The Exchequer can revoke it, and does, for guilds that become an embarrassment: too much Heat, or too little standing with the Crown.',
    source: () => 'It hangs on your wall.',
    unlock: () => true,
  },
  // ---- History ----
  {
    id: 'cassel_ford',
    title: 'Cassel Ford',
    category: 'History',
    text: "Twenty-two years ago the old king's army tried to cross the Cassel in spring flood, against advice. The enemy held the far bank with crossbows hired on credit from a foreign bank. The men who came back don't call it a defeat. They just say 'the ford', and then talk about something else.",
    source: (s) => {
      const v = someone(s, (m) => m.traits.includes('veteran'));
      return v ? `Told by ${v.name}, who was there.` : 'A veteran singing for coppers outside the Copper Kettle.';
    },
    unlock: (s) => !!someone(s, (m) => m.traits.includes('veteran')) || crier(s, 'veteran_song'),
  },
  {
    id: 'the_treaty',
    title: 'The Treaty of Cassel',
    category: 'History',
    text: "The peace that ended the war made the realm repay what the victors had borrowed from Ostrander's. Its sharpest clause: if the Crown ever misses an installment, the bank may collect however it sees fit. Tolls, mills, castles: everything is collateral.",
    source: (s) => (s.flags.vorn_slip || s.flags.vorn_q_people ? 'Factor Vorn, over a cup of your own tea.' : 'Learned the hard way, when the Crown missed a payment.'),
    unlock: (s) => !!(s.flags.vorn_slip || s.flags.vorn_q_people || s.flags.silver_lost),
  },
  {
    id: 'crown_plate',
    title: 'The Crown plate',
    category: 'History',
    text: "The royal silver: cups, chargers and candlesticks from four reigns. Most of it has already been melted down for the debt. What's left is the last thing standing between the Crown and default.",
    source: () => 'Lord Treasurer Fenn, in his stripped office.',
    unlock: (s) => fired(s, 'silver_summons'),
  },
  // ---- Places ----
  {
    id: 'lower_town',
    title: 'The Lower Town',
    category: 'Places',
    text: 'Below the walls: docks, warehouses, tanneries and the porters who carry everything. They pay the levies that service the debt, and they remember who stood with them.',
    source: () => 'Your people have worked its streets.',
    unlock: (s) => reports(s).some((m) => m.contract.patron === 'lowertown') || fired(s, 'bread_riot'),
  },
  {
    id: 'drovers',
    title: "Drover's Road",
    category: 'Places',
    text: "The cattle road east into the hills. Wolves follow the herds, and since the war-pensions stopped, so do men who used to be soldiers.",
    source: () => 'Your squads have walked it.',
    unlock: (s) => visited(s, "Drover's Road"),
  },
  {
    id: 'harrowmere',
    title: 'Harrowmere',
    category: 'Places',
    text: 'A lake town of wool merchants and boatwrights, and a bridge older than the kingdom. Whoever controls the bridge controls the wool road.',
    source: () => 'Your squads have been there.',
    unlock: (s) => visited(s, 'Harrowmere'),
  },
  {
    id: 'kell',
    title: 'Kell Mines',
    category: 'Places',
    text: "Silver workings in the northern hills. The deep galleries flooded the year after the war. The Crown's silver warrants were sold to the bank, and the bank wants them worked again.",
    source: () => 'Your squads have been underground there.',
    unlock: (s) => visited(s, 'Kell Mines'),
  },
  {
    id: 'saltfens',
    title: 'The Saltfens',
    category: 'Places',
    text: 'Estuary marsh, two weeks from Varrow: fen-lily, bog-amber and every reagent the colleges need, along with fever, leeches and things that live in black water.',
    source: () => 'Your squads came back muddy, and some came back sick.',
    unlock: (s) => visited(s, 'The Saltfens'),
  },
  {
    id: 'anselm',
    title: 'Port Anselm',
    category: 'Places',
    text: "The coast port where Ostrander's ships take on the Crown's payments. The harbor-master is a Crown officer, and the harbor is the bank's in all but name.",
    source: () => 'Your squads have seen the bank’s ships at anchor.',
    unlock: (s) => visited(s, 'Port Anselm'),
  },
  // ---- People ----
  {
    id: 'vorn',
    title: 'Factor Maelis Vorn',
    category: 'People',
    text: "Runs Ostrander's office on Quay Street. She doesn't waste words or lose her temper. Ask her what the bank plans to do to you and she'll tell you, straight out. Corrects other people's spelling.",
    source: () => 'She came to your hall.',
    unlock: (s) => fired(s, 'ostrander_agent'),
  },
  {
    id: 'marta',
    title: 'Marta Hobb',
    category: 'People',
    text: 'Marta has collected debts in Varrow for thirty years, and nobody has seen her without her umbrella. She calls everyone "dear" and remembers their mothers. Her eldest daughter Isbet prices everything she looks at, including people.',
    source: () => 'She visited, with her daughters.',
    unlock: (s) => fired(s, 'hobbs_arrive'),
  },
  {
    id: 'dagny',
    title: 'Dagny Fell',
    category: 'People',
    text: "A carrier in the Porters' Fraternity with a hook on her belt and no patience for charity. If the docks hear something, Dagny hears it next.",
    source: () => 'You met her during the bread riot.',
    unlock: (s) => !!(s.flags.dagny_contact || s.flags.dagny_friend),
  },
  {
    id: 'fenn',
    title: 'Lord Treasurer Aubrey Fenn',
    category: 'People',
    text: "Head of the Exchequer, in an office with nothing left on the walls. He is a decent man and a tired one, and he ran out of options some time ago. He has kept the payments going for six years on willpower and the Crown's silverware.",
    source: () => 'He summoned you.',
    unlock: (s) => fired(s, 'silver_summons'),
  },
  {
    id: 'jory',
    title: 'Jory Abbot',
    category: 'People',
    text: "The hall's clerk. He came with the building and has kept its books through three guildmasters. He doesn't give advice unless you ask for it, and then only in the form of a remark about the weather.",
    source: () => 'He came with the hall.',
    unlock: () => true,
  },
  {
    id: 'coster',
    title: 'Alderman Piet Coster',
    category: 'People',
    text: 'Master of the city scales and the man who holds your loan. He carries a brass balance in a velvet box and weighs coins before he accepts them. He believes in honest weights, and in coming out of the Debt richer than he went in, and he does not see why those should conflict.',
    source: () => 'He came about your loan.',
    unlock: (s) => fired(s, 'coster_interest'),
  },
  {
    id: 'brune',
    title: 'Sister Agathe Brune',
    category: 'People',
    text: "Almoner of Saint Oda's. She counts the almshouse beds every night and the firewood every morning. She preaches against usury on Sundays and takes the bank's donations on Mondays, and she will tell you so if you ask.",
    source: () => 'She came to ask for fever salts.',
    unlock: (s) => !!s.flags.met_oda,
  },
  {
    id: 'pask',
    title: 'Wenna Pask',
    category: 'People',
    text: 'She runs the low-tide market on the river flats below Fish Quay, where things that fell off barges are sold. She is quick and funny, and you have never heard her answer a question directly.',
    source: () => 'She invited you onto the flats at low tide.',
    unlock: (s) => !!s.flags.met_mudlarks,
  },
  {
    id: 'mayne',
    title: 'Captain Rufus Mayne',
    category: 'People',
    text: 'Commands the Ninth, a royal regiment disbanded under article nine of the treaty and paid off in Crown Pennies. Mayne was a sergeant at Cassel Ford. He is loud and friendly, and he never stops recruiting.',
    source: () => 'He tried to hire one of your people.',
    unlock: (s) => !!s.flags.ninth_active,
  },
  {
    id: 'plaice',
    title: 'Master Assayer Corwin Plaice',
    category: 'People',
    text: 'Runs the Assay Office. He licenses every reagent and enchantment sold in Varrow, and he can quote the clause that covers each of them. He has never been seen in a hurry.',
    source: () => 'He came to inspect the guild.',
    unlock: (s) => !!s.flags.assay_active,
  },
  {
    id: 'aske',
    title: 'Lady Honora Aske',
    category: 'People',
    text: "Head of one of the Fourteen. Her castle at Aske is pledged to the bank, and she has only recently had to learn what things cost. She is charming and generous, and she usually forgets to say how much she's paying until afterwards.",
    source: () => 'She asked you to move her family silver.',
    unlock: (s) => !!s.flags.met_fourteen,
  },
  // ---- Foes ----
  {
    id: 'foe_trolls',
    title: 'Hill trolls',
    category: 'Foes',
    text: "Trolls are huge, slow to anger and very hard to kill, because their wounds close while you watch. Fire stops the healing. That's why the old bridge-keepers always kept a brazier lit.",
    source: () => 'Your people fought one.',
    unlock: (s) => faced(s, 'trolls'),
  },
  {
    id: 'foe_fireborn',
    title: 'Fireborn',
    category: 'Foes',
    text: 'Salamanders and drakelings that nest where the earth runs hot: flooded forges, old mine galleries. They shrug off fire and dread cold. Frost salts are worth their weight in silver against them.',
    source: () => 'Your people met them underground.',
    unlock: (s) => faced(s, 'fireborn'),
  },
  {
    id: 'foe_warded',
    title: 'Hedge-wards',
    category: 'Foes',
    text: "Unlicensed spellwork scratched onto doors and armor. It turns blades aside, but storm-keyed weapons and wardstones cut straight through. The Assay Office would very much like to know who's selling it.",
    source: () => 'Your people ran into it.',
    unlock: (s) => faced(s, 'warded'),
  },
  {
    id: 'foe_swarm',
    title: 'Swarms',
    category: 'Foes',
    text: 'Rats, carrion-beetles and worse, in numbers nobody wants to count. Blades and arrows are mostly wasted on them. Hammers and fire work, and so does a good lantern.',
    source: () => 'Your people have the bites to prove it.',
    unlock: (s) => faced(s, 'swarm'),
  },
  {
    id: 'foe_soldiers',
    title: 'Sell-swords',
    category: 'Foes',
    text: 'Since the war-pensions stopped, half the veterans in the realm work for whoever pays. They fight like soldiers, because they were.',
    source: () => 'Your people faced them.',
    unlock: (s) => faced(s, 'soldiers'),
  },
  // ---- Powers & trades ----
  {
    id: 'assay_office',
    title: 'The Assay Office',
    category: 'Powers & trades',
    text: 'It licenses every reagent, focus and enchantment sold in Varrow, and tests the silver in the Crown Penny. Spellwork is a trade like any other here, and the Assay Office is its guild, its watchman and its tax collector.',
    source: (s) => (someone(s, (m) => m.profession === 'arcanist') ? 'Your Arcanist complains about their fees.' : 'Heard in the market.'),
    unlock: (s) => !!someone(s, (m) => m.profession === 'arcanist' && m.status !== 'left') || crier(s, 'assay_fees'),
  },
  {
    id: 'saint_oda',
    title: "Saint Oda's",
    category: 'Powers & trades',
    text: 'A hospital church that runs the almshouses and trains field physicians. It preaches that lending at interest is a sin, which makes it unpopular at the bank and popular everywhere else.',
    source: (s) => (someone(s, (m) => m.profession === 'chaplain') ? 'Your Chaplain trained there.' : 'Heard in the streets.'),
    unlock: (s) => !!someone(s, (m) => m.profession === 'chaplain' && m.status !== 'left') || crier(s, 'almshouse') || fired(s, 'festival'),
  },
  {
    id: 'mudlarks',
    title: 'The Mudlarks',
    category: 'Powers & trades',
    text: "Children and grown thieves who work the riverbank at low tide. They know the tides and the toll-men, and which barges cross the chain after dark, and they'll sell any of it to whoever pays first.",
    source: () => 'One of them sold you information.',
    unlock: (s) => fired(s, 'informant') || crier(s, 'strongbox'),
  },
  {
    id: 'council',
    title: 'The Council of Varrow',
    category: 'Powers & trades',
    text: "Nine seats: three for the Crown's officers, two for the merchant aldermen, two for the Lower Town's trades, and two that Ostrander's bought outright when a debtor alderman couldn't pay. It meets every season, and it can be persuaded.",
    source: () => 'The Council posted its agenda.',
    unlock: (s) => s.council.agenda.length > 0 || s.council.history.length > 0,
  },
];

export const CODEX_BY_ID: Record<string, CodexEntry> = Object.fromEntries(CODEX.map((e) => [e.id, e]));

// ---- Street talk: one line a week in the week report ----
export interface CrierLine {
  id: string;
  text: string;
  when?: (s: GameState) => boolean;
  weight?: number;
  once?: boolean;
}

const decree = (s: GameState, id: string) => s.council.active.some((a) => a.id === id && a.untilWeek >= s.week);

export const CRIER: CrierLine[] = [
  // lines that reflect how this campaign began
  { id: 'start_iron', text: 'The armorers on Anvil Row have started taking old horseshoes in part payment.', when: (s) => hasStart(s, 'iron_short'), weight: 2 },
  { id: 'start_reagents', text: 'Apothecaries on Still Lane are selling fen salts by the bucket, and complaining about it.', when: (s) => hasStart(s, 'reagent_glut'), weight: 2 },
  { id: 'start_timber', text: "Barges of fresh-cut oak go past the chain every morning, every log stamped with Ostrander's mark.", when: (s) => hasStart(s, 'timber_cheap'), weight: 2 },
  { id: 'start_bread', text: 'A baker on Fish Quay has started selling half-loaves, and charging three quarters for them.', when: (s) => hasStart(s, 'grain_dear'), weight: 2 },
  { id: 'start_coop', text: 'Porters on the river steps point out your hall to strangers and tell them who paid for your charter.', when: (s) => s.start?.backer === 'coop', once: true },
  { id: 'start_college', text: 'Students at the college have a song about the fire. Your founders have asked them not to sing it near the hall.', when: (s) => s.start?.backer === 'college', once: true },
  { id: 'start_veterans', text: 'Old soldiers drink to your guild at the Copper Kettle, mostly because your founders are buying.', when: (s) => s.start?.backer === 'veterans', once: true },
  { id: 'veteran_song', text: 'A one-legged veteran outside the Copper Kettle sings about Cassel Ford for coppers. Nobody joins in on the chorus.', once: true, weight: 3 },
  { id: 'assay_fees', text: 'The Assay Office has raised its fees on reagent warrants again. Arcanists are grumbling in the college yards.', once: true },
  { id: 'almshouse', text: "Saint Oda's almshouse turned people away at the gate this week, for the first time anyone can remember.", once: true },
  { id: 'strongbox', text: 'Mudlarks pulled a strongbox out of the river mud at low tide. It was empty, which surprised nobody.', once: true },
  { id: 'arrears', text: "A crier reads the Crown's arrears aloud in the market square. The crowd jeers at the total.", when: (s) => s.clocks.arrears > 45, weight: 2 },
  { id: 'coin', text: 'Moneychangers at the Weighhouse are biting every penny now, and weighing the ones that pass.', when: (s) => s.clocks.cointrust < 45, weight: 2 },
  { id: 'chalk', text: 'Someone chalked BREAD NOT BANKS across the Weighhouse doors overnight. It took three porters to scrub it off, and none of them hurried.', when: (s) => s.clocks.unrest > 45, weight: 2 },
  { id: 'mill', text: "Ostrander's has bought another mill on the river. People say the old miller has taken to drinking.", when: (s) => s.clocks.leverage > 30, weight: 2 },
  { id: 'loaves', text: 'Bakers have shortened their loaves by a finger to cover the grain levy. Customers have noticed.', when: (s) => decree(s, 'grain_levy'), weight: 3 },
  { id: 'searches', text: 'Soldiers at the river chain are searching every barge twice. The queue of barges reaches back past the bend.', when: (s) => decree(s, 'martial_law'), weight: 3 },
  { id: 'dole', text: 'The bread dole queue in the Lower Town starts before dawn. It is the quietest the streets have been in a year.', when: (s) => decree(s, 'bread_dole'), weight: 3 },
  { id: 'isbet', text: 'Isbet Hobb was seen in the Exchequer gallery again, taking notes.', when: (s) => s.eventWeeks.hobbs_arrive !== undefined && s.npcs.isbet?.status === 'alive' },
  { id: 'ship', text: "A ship from Ostrander's home port is overdue. The bank's factors are short-tempered this week." },
  { id: 'pensions', text: "Old soldiers' pensions are three quarters late. The Crown says next quarter. It said that last quarter." },
  { id: 'ice', text: 'Ice has formed on the river chain. The toll-men are chipping it off with axes and swearing at the cold.', when: (s) => ((s.week - 1) % 48) >= 36 },
  { id: 'fair', text: "The summer wool fair at Harrowmere is smaller than last year. The buyers from the coast didn't come.", when: (s) => ((s.week - 1) % 48) >= 12 && ((s.week - 1) % 48) < 24 },
  { id: 'default_talk', text: 'Since the missed payment, every tavern argument ends the same way: who will the bank take first?', when: (s) => !!s.flags.silver_lost, weight: 3 },
  { id: 'paid_talk', text: "People are still talking about the silver reaching the coast. Somebody wrote a song about it. It isn't good, but it's popular.", when: (s) => !!s.flags.silver_delivered, weight: 3, once: true },
];

// ---------------------------------------------------------------------------
// In the hall: Jory Abbot's occasional remarks in the week report
// ---------------------------------------------------------------------------

export interface HallLine {
  id: string;
  text: string;
  when?: (s: GameState) => boolean;
  weight?: number;
}

const home = (s: GameState) => s.members.filter((m) => m.status !== 'dead' && m.status !== 'left' && m.status !== 'mission');
const crew = (s: GameState) => s.members.filter((m) => m.status !== 'dead' && m.status !== 'left');

export const JORY: HallLine[] = [
  { id: 'j_candles', text: 'Jory has started weighing the candles before he lights them.', when: (s) => s.crowns < 60, weight: 3 },
  { id: 'j_loan', text: 'Jory reminds you that the Weighhouse payment is due this week, and that he reminded you last week too.', when: (s) => s.loans.some((l) => l.dueWeek - s.week <= 1 && loanStillDue(l) > 0), weight: 2 },
  { id: 'j_watch', text: "Jory says a man from the watch has walked past the hall four times today, and he's starting to recognize the hat.", when: (s) => s.heat >= 40, weight: 3 },
  { id: 'j_renown', text: "Jory says people have started spelling the guild's name right in their letters. He thinks this is a good sign.", when: (s) => s.renown >= 15 },
  { id: 'j_candle', text: "Jory has left a candle burning in the hall. He doesn't say who it's for.", when: (s) => s.members.some((m) => m.status === 'dead' && (m.diedWeek ?? -99) >= s.week - 1), weight: 4 },
  { id: 'j_pegs', text: 'Jory says the hall has run out of pegs for coats, and asks whether he should buy more pegs or hire fewer people.', when: (s) => crew(s).length >= 8 },
  { id: 'j_stores', text: 'Jory says the stores are low, and that the rats noticed before you did.', when: (s) => s.supplies < home(s).length * 2, weight: 2 },
  { id: 'j_quiet', text: 'Jory says supper was very quiet tonight, and asks whether somebody has died or is about to.', when: (s) => crew(s).length > 0 && crew(s).reduce((a, m) => a + m.morale, 0) / crew(s).length < 35, weight: 2 },
  { id: 'j_still', text: "Jory says the stillroom smells like a burned shoe, and wants to know whether that's normal.", when: (s) => (s.facilities.stillroom ?? 0) >= 1 },
  { id: 'j_letter', text: "Jory has pinned Fenn's letter to the wall above his desk, next to a recipe for eel pie.", when: (s) => s.eventWeeks.fenn_letter !== undefined },
  { id: 'j_tapestry', text: 'Jory dusts the tapestry every morning with a goose feather. He says it was like that when he found it.', when: (s) => !!s.flags.tapestry_bought },
  { id: 'j_back_door', text: 'Jory has put a second bolt on the back door of the stores, and a bell on the first one.', when: (s) => (s.factions.mudlarks?.standing ?? 0) <= -25, weight: 2 },
  { id: 'j_lines', text: 'Jory spent the morning re-ruling the ledger. He says the old lines were crooked, and that he drew them himself when he was young.' },
  { id: 'j_stove', text: 'Jory says this is the coldest the hall has been since the second guildmaster, who sold the stove.', when: (s) => (s.week - 1) % 48 >= 36 },
  { id: 'j_hobbs', text: "Jory says one of the Hobb girls has been sitting in the window of the Copper Kettle all week, and that she's very good at not looking at the hall.", when: (s) => s.rivals.hobbs.active && s.rivals.hobbs.aggression >= 0.6 },
  { id: 'j_mayne', text: 'Jory says Captain Mayne bought him a drink, and that he has never been recruited so pleasantly in his life.', when: (s) => !!s.flags.ninth_active && s.npcs.mayne?.status === 'alive' },
];
