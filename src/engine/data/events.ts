import type { EventChoice, GameState } from '../types';

export interface EventDef {
  id: string;
  title: string;
  text: string | ((s: GameState) => string);
  story?: boolean;
  // story events fire on/after this week once, if condition passes
  week?: number;
  condition?: (s: GameState) => boolean;
  weight?: number; // random event weight
  cooldown?: number; // weeks before it can recur
  choices: EventChoice[] | ((s: GameState) => EventChoice[]);
}

const living = (s: GameState) => s.members.filter((m) => m.status !== 'dead' && m.status !== 'left');

export const STORY_EVENTS: EventDef[] = [
  {
    id: 'charter',
    story: true,
    week: 1,
    title: 'A Charter and a Debt',
    text:
      "The Exchequer's seal is still warm on your charter. Your guild may now take contracts across the realm. It is also, as of this morning, 800 crowns in debt to the Weighhouse, which financed the hall, the first wages, and the sign.\n\n" +
      "Outside, criers announce that the Crown's quarter-day payment to Ostrander's is due in six weeks. Nobody in the Lower Town believes it will be paid.\n\n" +
      'You have a little coin left over. How do you start?',
    choices: [
      {
        label: 'Arm the guild',
        detail: 'Gain a Mail Hauberk and 2 Fire Oils',
        effects: { flag: 'start_arms' },
        resultText: 'You visit the armorers on Anvil Row. Your people will at least look the part.',
      },
      {
        label: 'Hire an Arcanist',
        detail: 'A college-trained Arcanist joins for free',
        effects: { freeRecruit: true },
        resultText: 'A young Arcanist from the college, short of fees, signs on for the work and the wage.',
      },
      {
        label: 'Keep the coin',
        detail: '+80 crowns',
        effects: { crowns: 80 },
        resultText: 'You lock the coin away. The ledger is the only weapon that never dulls.',
      },
    ],
  },
  {
    id: 'ostrander_agent',
    story: true,
    week: 2,
    title: "A Visitor from Ostrander's",
    text:
      "A woman in a sober grey coat waits in your hall. She introduces herself as Factor Maelis Vorn of Ostrander's, Varrow office.\n\n" +
      '"The bank has more debts to collect than it has hands to collect them," she says. "We pay promptly, which is more than the Crown can say. I hear you have your own note to service."\n\n' +
      'Through the window, a Lower Town porter spits as he passes the bank\'s carriage.',
    choices: [
      {
        label: 'Welcome her',
        detail: "Ostrander's +10, Lower Town −5. Unlocks bank contracts.",
        effects: { standing: { ostranders: 10, lowertown: -5 }, flag: 'ostranders_open' },
        resultText: 'Vorn smiles thinly. "We will send work." The porter outside saw her leave your door smiling.',
      },
      {
        label: 'Hear her out, promise nothing',
        detail: "Ostrander's +3. Unlocks bank contracts.",
        effects: { standing: { ostranders: 3 }, flag: 'ostranders_open' },
        resultText: '"Prudent," says Vorn. "The bank respects prudence. Up to a point."',
      },
      {
        label: 'Show her the door',
        detail: "Ostrander's −10, Lower Town +6",
        effects: { standing: { ostranders: -10, lowertown: 6 } },
        resultText: 'She leaves without argument. By evening the Lower Town taverns are toasting your name. The bank will remember too.',
      },
    ],
  },
  {
    id: 'hobbs_arrive',
    story: true,
    week: 4,
    title: 'Hobb & Daughters',
    text:
      "Old Marta Hobb arrives with two of her daughters and an umbrella she uses as a walking stick. Hobb & Daughters have collected debts in Varrow for thirty years.\n\n" +
      '"New guilds come and go," she says pleasantly. "I\'d like to buy a share in yours: a quarter of your contract income, paid to me. In return, my girls stay off your patch. A kindness, really."',
    choices: [
      {
        label: 'Sell her the share',
        detail: '+150 crowns now. Renown −3. Hobbs grow stronger and less aggressive.',
        effects: { crowns: 150, renown: -3, rivalRenown: 5, rivalAggression: -0.25, flag: 'hobbs_share' },
        resultText: 'Marta counts out the coin herself. "A pleasure doing business." Your people don\'t meet your eye that evening.',
      },
      {
        label: 'Refuse politely',
        detail: 'Hobbs become more aggressive.',
        effects: { rivalAggression: 0.15 },
        resultText: '"Pity," she says, and means something else entirely.',
      },
      {
        label: 'Humiliate her in front of her daughters',
        detail: 'Guile check. Success: Renown +4. Failure: Renown −2, Hobbs much more aggressive.',
        check: { approach: 'guile', difficulty: 13 },
        effects: { renown: 4, rivalAggression: 0.2 },
        failEffects: { renown: -2, rivalAggression: 0.35 },
        resultText: 'Your answer is quoted in every tavern by nightfall. Marta Hobb leaves without her smile.',
        failText: 'Marta laughs at you, kindly, which is worse. The story spreads, and you are the joke.',
      },
    ],
  },
  {
    id: 'bread_riot',
    story: true,
    week: 5,
    title: 'Bread and Stones',
    text:
      "The debt levy on grain took effect at dawn. By noon, the Lower Town has overturned two bakers' carts and is stoning the Weighhouse windows. A delegation of porters is at your door, and so is an Exchequer clerk.",
    choices: (s) => [
      {
        label: 'Feed them',
        detail: 'Give 12 Supplies. Lower Town +10, Unrest −5.',
        requires: { supplies: 12 },
        effects: { supplies: -12, standing: { lowertown: 10 }, clocks: { unrest: -5 }, renown: 1 },
        resultText: 'Your people hand out bread from the guild stores. The crowd thins. For now, they think of you as theirs.',
      },
      {
        label: 'Offer your swords to the Exchequer',
        detail: 'Exchequer +8, Lower Town −8, +60 crowns. A member may be hurt.',
        effects: { crowns: 60, standing: { exchequer: 8, lowertown: -8 }, clocks: { unrest: 3 }, wounds: 18 },
        resultText: 'Your guild helps clear the square. The Exchequer pays promptly, and the Lower Town will remember who held the cudgels.',
      },
      {
        label: 'Bar the doors',
        detail: 'Unrest +4.',
        effects: { clocks: { unrest: 4 } },
        resultText: `You wait it out. The riot burns itself out by nightfall, leaving ${living(s).length > 4 ? 'your people' : 'your few people'} restless and the city angrier.`,
      },
    ],
  },
  {
    id: 'silver_summons',
    story: true,
    week: 7,
    title: 'Summoned to the Exchequer',
    text:
      'Lord Treasurer Aubrey Fenn receives you in a cold office stripped of its tapestries. They were sold last month.\n\n' +
      '"The quarter payment is late. We have the silver: three wagons, the last of the Crown plate. It must reach Port Anselm and the bank\'s ships. My own guard can\'t be trusted. Half of them are owed back pay by the people who want it stolen."\n\n' +
      '"Take the commission. The realm will remember it."',
    choices: [
      {
        label: 'Accept the commission',
        detail: "Adds the story contract \"The Crown's Last Silver\".",
        effects: { unlockContract: 'silver_convoy', standing: { exchequer: 3 }, flag: 'silver_accepted' },
        resultText: '"Good," says Fenn, and for a moment looks very tired. "Choose your people carefully. Someone knows the route."',
      },
      {
        label: 'Decline',
        detail: 'Exchequer −12. The Crown will find someone else, perhaps Hobb & Daughters.',
        effects: { standing: { exchequer: -12 }, rivalRenown: 4, flag: 'silver_declined', clocks: { arrears: 6 } },
        resultText: 'Fenn nods once. "I see." The commission goes to Hobb & Daughters by evening.',
      },
    ],
  },
  {
    id: 'act1_slice_end',
    story: true,
    week: 12,
    title: 'End of the Season',
    text: (s) =>
      `The first season of your guild is over. ${
        s.flags.silver_delivered
          ? 'The Crown\'s silver reached Port Anselm, and the realm has a few more months of grace. People in the Exchequer now say your guild\'s name.'
          : s.flags.silver_lost
            ? 'The Crown\'s silver never reached the coast. The realm has defaulted on a payment for the first time, and Ostrander\'s factors are walking the city with lists.'
            : 'The Crown\'s silver went to the coast without you.'
      }\n\nThis is the end of the current prototype's scripted story. The world keeps turning: contracts, rivals, the debt and the market all continue, so keep building your guild.`,
    choices: [{ label: 'Continue', effects: {}, resultText: 'The ledger never closes.' }],
  },
];

export const RANDOM_EVENTS: EventDef[] = [
  {
    id: 'brawl',
    title: 'A Tavern Brawl',
    weight: 2,
    cooldown: 6,
    condition: (s) => living(s).some((m) => m.status === 'idle'),
    text: 'One of your people put a Weighhouse clerk through the window of the Copper Kettle. The clerk is demanding compensation, and the watch is asking questions.',
    choices: [
      { label: 'Pay the damages', detail: '−25 crowns', requires: { crowns: 25 }, effects: { crowns: -25 }, resultText: 'Coin smooths it over.' },
      { label: 'Dock their wages', detail: 'Loyalty −8 (all), Weighhouse +2', effects: { loyalty: -8, standing: { weighhouse: 2 } }, resultText: 'Discipline is maintained, and resented.' },
      { label: 'Stand by your people', detail: 'Weighhouse −4, Heat +3, morale +5', effects: { standing: { weighhouse: -4 }, heat: 3, morale: 5 }, resultText: 'Your people cheer. The Weighhouse does not.' },
    ],
  },
  {
    id: 'informant',
    title: 'A Mudlark Informant',
    weight: 2,
    cooldown: 4,
    text: 'A river-child with sharp eyes offers to sell what she has heard on the docks.',
    choices: [
      { label: 'Pay her', detail: '−15 crowns, +3 Intel', requires: { crowns: 15 }, effects: { crowns: -15, intel: 3 }, resultText: 'She talks fast and knows more than she should.' },
      { label: 'Send her off', effects: {}, resultText: 'She shrugs and goes to find a better buyer, possibly Hobb & Daughters.' },
    ],
  },
  {
    id: 'petition',
    title: 'A Petition at the Gate',
    weight: 2,
    cooldown: 5,
    text: "A widow from the Lower Town asks for help. The bank's collectors took her husband's tools, and her children are hungry.",
    choices: [
      { label: 'Give supplies', detail: '−6 Supplies, Lower Town +4, Renown +1', requires: { supplies: 6 }, effects: { supplies: -6, standing: { lowertown: 4 }, renown: 1 }, resultText: 'Word spreads that your guild remembers where it came from.' },
      { label: 'Turn her away', detail: 'Lower Town −1', effects: { standing: { lowertown: -1 } }, resultText: 'She goes without a word.' },
    ],
  },
  {
    id: 'audit',
    title: 'The Exchequer Audits',
    weight: 4,
    cooldown: 6,
    condition: (s) => s.heat >= 30,
    text: 'Exchequer clerks arrive with ledgers and a list of questions about your recent "night work".',
    choices: [
      { label: 'Pay the fine', detail: '−50 crowns, Heat −15', requires: { crowns: 50 }, effects: { crowns: -50, heat: -15 }, resultText: 'The clerks leave satisfied.' },
      {
        label: 'Talk them round',
        detail: 'Guile check. Success: Heat −10. Failure: Heat +10, Exchequer −6.',
        check: { approach: 'guile', difficulty: 14 },
        effects: { heat: -10 },
        failEffects: { heat: 10, standing: { exchequer: -6 } },
        resultText: 'By the end of the afternoon, the clerks are apologizing for the inconvenience.',
        failText: 'The clerks write everything down, and then write some more.',
      },
      { label: 'Stonewall', detail: 'Exchequer −8', effects: { standing: { exchequer: -8 } }, resultText: 'They leave empty-handed, and angry.' },
    ],
  },
  {
    id: 'peddler',
    title: 'An Assay-Peddler',
    weight: 1.5,
    cooldown: 8,
    text: 'A traveling peddler with an Assay Office license, slightly out of date, offers a fire-keyed focus at a steep discount. It may or may not be stolen.',
    choices: [
      { label: 'Buy it', detail: '−55 crowns, gain an Ember Focus', requires: { crowns: 55 }, effects: { crowns: -55, grantItem: 'ember_focus', heat: 2 }, resultText: 'It works perfectly. Better not to ask where it came from.' },
      { label: 'Decline', effects: {}, resultText: 'The peddler moves on.' },
    ],
  },
  {
    id: 'volunteer',
    title: 'A Volunteer',
    weight: 1.2,
    cooldown: 10,
    condition: (s) => s.factions.lowertown.standing >= 10,
    text: "A Lower Town youth has heard of your guild and wants to join. They'll work for low wages and a roof.",
    choices: [
      { label: 'Take them in', detail: 'A free recruit joins', effects: { freeRecruit: true, standing: { lowertown: 2 } }, resultText: "They're green, but eager." },
      { label: 'Send them home', effects: {}, resultText: 'They leave disappointed.' },
    ],
  },
  {
    id: 'festival',
    title: 'Saint Oda\'s Feast',
    weight: 3,
    cooldown: 40,
    condition: (s) => seasonOf(s.week) === 'Summer',
    text: "The city celebrates Saint Oda's feast. The guilds of Varrow traditionally put on a show of generosity.",
    choices: [
      { label: 'Host a feast', detail: '−40 crowns, Renown +3, morale +10', requires: { crowns: 40 }, effects: { crowns: -40, renown: 3, morale: 10, standing: { lowertown: 3 } }, resultText: 'Your hall is full of song until dawn.' },
      { label: 'Give your people the day off', detail: 'morale +5', effects: { morale: 5 }, resultText: 'A quiet, pleasant day.' },
    ],
  },
  {
    id: 'bank_offer',
    title: 'An Offer from the Bank',
    weight: 1.5,
    cooldown: 12,
    condition: (s) => s.factions.ostranders.standing >= 15 && s.loans.length > 0,
    text: 'Factor Vorn offers to buy your Weighhouse note. The bank would pay off 200 crowns of your debt, and in return expects "first refusal on your services".',
    choices: [
      { label: 'Accept', detail: "Loan −200, Ostrander's +5, Weighhouse −8, Lower Town −4", effects: { flag: 'bank_paid_loan', standing: { ostranders: 5, weighhouse: -8, lowertown: -4 } }, resultText: 'Your debt is lighter, and someone else holds the rest of the leash.' },
      { label: 'Decline', detail: "Ostrander's −2", effects: { standing: { ostranders: -2 } }, resultText: '"As you wish," says Vorn.' },
    ],
  },
];

export function seasonOf(week: number): 'Spring' | 'Summer' | 'Autumn' | 'Winter' {
  const w = (week - 1) % 48;
  return (['Spring', 'Summer', 'Autumn', 'Winter'] as const)[Math.floor(w / 12)];
}
