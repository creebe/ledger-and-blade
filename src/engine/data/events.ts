import type { EventChoice, GameState, Member, NpcId } from '../types';

type Txt = string | ((s: GameState, m?: Member) => string);
type Choices = EventChoice[] | ((s: GameState, m?: Member) => EventChoice[]);

export interface EventNodeDef {
  text: Txt;
  speaker?: string;
  choices: Choices;
}

export interface EventDef {
  id: string;
  title: string;
  text: Txt;
  speaker?: string;
  story?: boolean;
  // story beats fire somewhere inside this window of weeks (forced on the last week)
  window?: [number, number];
  // story beats that must have fired first (keeps the narrative in order)
  after?: string[];
  chance?: number; // per-week chance inside the window (default 0.45)
  condition?: (s: GameState) => boolean;
  weight?: number; // random event weight
  cooldown?: number; // weeks before it can recur
  // member-focused events pick one eligible member
  member?: (s: GameState, m: Member) => boolean;
  // named characters who appear; the event won't fire unless they're all alive
  npcs?: NpcId[];
  choices: Choices;
  nodes?: Record<string, EventNodeDef>;
}

const living = (s: GameState) => s.members.filter((m) => m.status !== 'dead' && m.status !== 'left');
const first = (m?: Member) => (m ? m.name.split(' ')[0] : 'They');

// ---------------------------------------------------------------------------
// Act I: The First Collection
// ---------------------------------------------------------------------------

const vornQuestions = (s: GameState): EventChoice[] =>
  [
    !s.flags.vorn_q_people && {
      label: 'What happens to the people you collect from?',
      detail: 'Lower Town +2 (the porter outside hears you ask)',
      effects: { flag: 'vorn_q_people', standing: { lowertown: 2 } },
      next: 'people',
      resultText: '',
    },
    !s.flags.vorn_q_hobbs && {
      label: 'Why not hire Hobb & Daughters? They do this already.',
      detail: '+1 Intel on your rival',
      effects: { flag: 'vorn_q_hobbs', intel: 1 },
      next: 'hobbs',
      resultText: '',
    },
    !s.flags.vorn_q_want &&
      !s.flags.vorn_slip && {
      label: 'What does the bank really want from Varrow?',
      detail: 'Guile check: read between her lines',
      check: { approach: 'guile', difficulty: 14 },
      effects: { flag: 'vorn_slip' },
      failEffects: { flag: 'vorn_q_want' },
      next: 'want',
      failNext: 'want_fail',
      resultText: '',
    },
    { label: "Let's talk terms.", effects: {}, next: 'terms', resultText: '' },
  ].filter(Boolean) as EventChoice[];

export const STORY_EVENTS: EventDef[] = [
  {
    id: 'charter',
    story: true,
    window: [1, 1],
    title: 'A Charter and a Debt',
    text:
      "The Exchequer's seal is still warm on your charter. As of this morning, Ledger & Blade may take paid work anywhere in the realm. It is also 800 crowns in debt to the Weighhouse, which paid for the hall, the first wages and the sign over the door.\n\n" +
      "The clerk who brought it glances at the empty weapon racks. \"Quarter-day's in a few weeks,\" he says, as everyone in Varrow does lately. \"Good luck.\"\n\n" +
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
    npcs: ['vorn'],
    window: [2, 3],
    chance: 0.6,
    title: "A Visitor from Ostrander's",
    text:
      "A woman in a sober grey coat waits in your hall, gloves folded on her knee. She introduces herself as Factor Maelis Vorn of Ostrander's, Varrow office.\n\n" +
      "Through the window, a Lower Town porter spits as he passes the bank's carriage.",
    choices: [
      { label: 'Hear her out', effects: {}, next: 'pitch', resultText: '' },
      {
        label: 'Show her the door',
        detail: "Ostrander's −10, Lower Town +6",
        effects: { standing: { ostranders: -10, lowertown: 6 }, npc: { id: 'vorn', attitude: -15 } },
        resultText: 'She leaves without argument. By evening the Lower Town taverns are toasting your name. The bank will remember too.',
      },
    ],
    nodes: {
      pitch: {
        speaker: 'Factor Vorn',
        text:
          '"The bank holds three hundred and twelve debts in Varrow alone: merchants, millers, two counts and a bishop. We have more paper than hands to collect on it."\n\n' +
          '"We pay on delivery, in coin of honest weight, about a third above what the Crown pays. That is more than the Crown can say. We ask only for reliable work, and no questions of the wrong sort."',
        choices: vornQuestions,
      },
      people: {
        speaker: 'Factor Vorn',
        text:
          '"They keep their lives. They lose their looms, their warehouses, their second houses." She doesn\'t blink. "Collection is cleaner than the alternative. If the Crown defaults, the treaty lets us close the river. Ask the Lower Town how they\'d like that winter."',
        choices: vornQuestions,
      },
      hobbs: {
        speaker: 'Factor Vorn',
        text:
          '"We do. Marta Hobb charges like a duchess and treats our clients like cattle, and then the clients riot, and then the bank is blamed. The bank prefers… a diversity of suppliers."\n\n' +
          'She pauses. "She will not thank you for competing. I mention it as a courtesy."',
        choices: (s) => [...vornQuestions(s)],
      },
      want: {
        speaker: 'Factor Vorn',
        text:
          'You let the silence stretch, and she fills it, a little too carefully. "Repayment, of course. And security for repayment: the Anselm port tolls, the Kell silver warrants…" She stops, then decides it costs her nothing. "And, should the Crown ever fail, the right to draft the next treaty."\n\n' +
          'You note that "should" sounded a great deal like "when".',
        choices: vornQuestions,
      },
      want_fail: {
        speaker: 'Factor Vorn',
        text: '"Repayment," she says pleasantly. "What else would a bank want?" Whatever she thinks of your question, it doesn\'t show.',
        choices: vornQuestions,
      },
      terms: {
        speaker: 'Factor Vorn',
        text: '"So. Will Ledger & Blade work for the bank?"',
        choices: [
          {
            label: "We'll work for the bank.",
            detail: "Ostrander's +10, Lower Town −5. Unlocks bank contracts.",
            effects: { standing: { ostranders: 10, lowertown: -5 }, flag: 'ostranders_open', npc: { id: 'vorn', attitude: 15 } },
            resultText: 'Vorn smiles thinly. "We will send work." The porter outside saw her leave your door smiling, and so will everyone he talks to.',
          },
          {
            label: "We'll take your jobs case by case.",
            detail: "Ostrander's +3. Unlocks bank contracts.",
            effects: { standing: { ostranders: 3 }, flag: 'ostranders_open', npc: { id: 'vorn', attitude: 5 } },
            resultText: '"Prudent," says Vorn. "The bank respects prudence. Up to a point."',
          },
          {
            label: 'Not today.',
            detail: "Ostrander's −2. You can court the bank later from the Realm screen.",
            effects: { standing: { ostranders: -2 }, npc: { id: 'vorn', attitude: -5 } },
            resultText: '"The offer stands," she says, pulling on her gloves. "Send word when your ledger changes your mind."',
          },
        ],
      },
    },
  },
  {
    id: 'hobbs_arrive',
    story: true,
    after: ['ostrander_agent'],
    npcs: ['marta', 'isbet'],
    window: [4, 6],
    chance: 0.5,
    title: 'Hobb & Daughters',
    text: (s) =>
      "Old Marta Hobb arrives with two of her daughters and an umbrella she uses as a walking stick. Hobb & Daughters have collected debts in Varrow for thirty years.\n\n" +
      (s.factions.ostranders.standing >= 8
        ? '"I hear you\'ve been taking the bank\'s coin," she says pleasantly. "That coin used to come to me. So let\'s be friends before we have to be anything else."\n\n'
        : '"New guilds come and go," she says pleasantly. "Most go."\n\n') +
      '"I\'d like to buy a share in yours: a quarter of your contract income, paid to me. In return, my girls stay off your patch."',
    speaker: 'Marta Hobb',
    choices: [
      { label: "What's in it for me, exactly?", effects: {}, next: 'details', resultText: '' },
      { label: 'Refuse politely', detail: 'Hobbs become more aggressive.', effects: { rivalAggression: 0.15, npc: { id: 'marta', attitude: -5 } }, resultText: '"Pity," she says, and means something else entirely.' },
    ],
    nodes: {
      details: {
        speaker: 'Marta Hobb',
        text:
          '"Peace, dear. My girls stop bidding against you. And I have friends at the Weighhouse, who are less fond of you than they might be. A word from me, and your loan officer smiles."\n\n' +
          'Her eldest daughter, Isbet, studies your sword-rack like she\'s pricing it.',
        choices: [
          {
            label: 'Sell her the share',
            detail: '+150 crowns now, Weighhouse +6. She takes 25% of all contract pay. Renown −3. Hobbs stop competing.',
            effects: { crowns: 150, renown: -3, rivalRenown: 5, rivalAggression: -0.35, flag: 'hobbs_share', standing: { weighhouse: 6 }, npc: { id: 'marta', attitude: 15 } },
            resultText: 'Marta counts out the coin herself. "A pleasure doing business." Your people don\'t meet your eye that evening.',
          },
          {
            label: 'Refuse politely',
            detail: 'Hobbs become more aggressive.',
            effects: { rivalAggression: 0.15, npc: { id: 'marta', attitude: -5 } },
            resultText: '"Pity," she says, and means something else entirely.',
          },
          {
            label: 'Humiliate her in front of her daughters',
            detail: 'Guile check. Success: Renown +4. Failure: Renown −2. Either way, Hobbs grow much more aggressive.',
            check: { approach: 'guile', difficulty: 13 },
            effects: { renown: 4, rivalAggression: 0.2, npc: { id: 'marta', attitude: -25 } },
            failEffects: { renown: -2, rivalAggression: 0.35, npc: { id: 'marta', attitude: -10 } },
            resultText: 'Your answer is quoted in every tavern by nightfall. Marta Hobb leaves without her smile, and Isbet looks back from the door.',
            failText: 'Marta laughs at you, kindly, which is worse. The story spreads, and you are the joke.',
          },
        ],
      },
    },
  },
  {
    id: 'bread_riot',
    story: true,
    npcs: ['dagny'],
    window: [5, 7],
    chance: 0.45,
    condition: (s) => s.clocks.unrest >= 31 || s.week >= 7,
    title: 'Bread and Stones',
    text:
      "The debt levy on grain took effect at dawn. By noon the Lower Town has overturned two bakers' carts and is stoning the Weighhouse windows. A delegation of porters is at your door, and so is an Exchequer clerk with a purse.",
    choices: [
      {
        label: 'Feed them from the guild stores',
        detail: 'Give 8 Supplies. Lower Town +10, Unrest −5.',
        requires: { supplies: 8 },
        effects: { supplies: -8, standing: { lowertown: 10 }, clocks: { unrest: -5 }, renown: 1 },
        next: 'dagny',
        resultText: 'Your people hand out bread from the guild stores. The crowd thins.',
      },
      {
        label: 'Pay the bakers to open their ovens',
        detail: '−35 crowns. Lower Town +8, Unrest −4.',
        requires: { crowns: 35 },
        effects: { crowns: -35, standing: { lowertown: 8 }, clocks: { unrest: -4 } },
        next: 'dagny',
        resultText: 'You buy out three bakeries for the afternoon. The smell of bread does what no cudgel could.',
      },
      {
        label: 'Take the Exchequer\'s purse and clear the square',
        detail: '+60 crowns, Exchequer +5, Lower Town −5. What happens next is up to you.',
        effects: { crowns: 60, standing: { exchequer: 5, lowertown: -5 } },
        next: 'square',
        resultText: 'Your people take up cudgels and shields and march on the bread market.',
      },
      {
        label: 'Bar the doors',
        detail: 'Unrest +4.',
        effects: { clocks: { unrest: 4 } },
        resultText: 'You wait it out. The riot burns itself out by nightfall, leaving your people restless and the city angrier.',
      },
    ],
    nodes: {
      dagny: {
        speaker: 'Dagny Fell, Porters\' Fraternity',
        text:
          'A broad woman with a porter\'s hook on her belt stays behind when the others leave.\n\n' +
          '"Dagny Fell. I carry for the Fraternity. Nobody\'s fed us in a long time without wanting something." She weighs you up. "So what do you want?"',
        choices: [
          {
            label: '"Your ears on the docks."',
            detail: '+2 Intel now. Dagny becomes a contact.',
            effects: { intel: 2, flag: 'dagny_contact', npc: { id: 'dagny', attitude: 10 } },
            resultText: '"Done. The docks hear everything, eventually. You\'ll hear it sooner."',
          },
          {
            label: '"Nothing. Eat."',
            detail: 'Lower Town +4',
            effects: { standing: { lowertown: 4 }, flag: 'dagny_friend', npc: { id: 'dagny', attitude: 25 } },
            resultText: 'She stares at you for a long moment, then laughs. "Mad. All right." She tells the story in every tavern on the river.',
          },
        ],
      },
      square: {
        text: 'The bread market is packed. Someone throws a stone that cracks off a shield. The crowd surges, waiting to see what you\'ll do.',
        choices: [
          {
            label: 'Hold the line. No blood.',
            detail: 'Endurance check. Success: Unrest −2, Exchequer +3. Failure: someone is hurt, Unrest +2.',
            check: { approach: 'endurance', difficulty: 9 },
            effects: { clocks: { unrest: -2 }, standing: { exchequer: 3 } },
            failEffects: { wounds: 20, clocks: { unrest: 2 } },
            resultText: 'Your people stand like a wall until the crowd tires. Not one cudgel swings. Even the porters grudgingly respect it.',
            failText: 'The line breaks under the press. Someone goes down under the boots before you restore order.',
          },
          {
            label: 'Break them.',
            detail: 'Exchequer +5, Lower Town −6, Unrest +3, Heat +3',
            effects: { standing: { exchequer: 5, lowertown: -6 }, clocks: { unrest: 3 }, heat: 3 },
            resultText: 'It is over in minutes. The Exchequer clerk is delighted. The Lower Town will remember whose cudgels they were.',
          },
        ],
      },
    },
  },
  {
    id: 'silver_summons',
    story: true,
    after: ['ostrander_agent'],
    npcs: ['fenn'],
    window: [7, 9],
    chance: 0.5,
    title: 'Summoned to the Exchequer',
    speaker: 'Lord Treasurer Aubrey Fenn',
    text:
      'Lord Treasurer Aubrey Fenn receives you in a cold office stripped of its tapestries. They were sold last month.\n\n' +
      '"The quarter payment is due. We have the silver: three wagons, the last of the Crown plate. It must reach Port Anselm and the bank\'s ships. My own guard can\'t be trusted. Half of them are owed back pay by the people who want it stolen."',
    choices: (s) => summonsChoices(s),
    nodes: {
      route: {
        speaker: 'Lord Treasurer Fenn',
        text:
          '"Who knows the route? My clerks. The guard captain. And the bank\'s factor, Vorn, because the bank insists on knowing everything." He rubs his eyes. "If I were robbing it, I\'d hit the ford at Wenmouth. It\'s the only place the road can\'t be seen from either side."',
        choices: (s) => summonsChoices(s),
      },
      stakes: {
        speaker: 'Lord Treasurer Fenn',
        text:
          'You repeat what Vorn let slip about the bank drafting the next treaty. Fenn goes very still.\n\n' +
          '"So that\'s it. They don\'t want the silver. They want us to miss the payment." He looks at you differently now. "You\'ve done the Crown a service already. I\'ll remember it."',
        choices: (s) => summonsChoices(s),
      },
      pay: {
        speaker: 'Lord Treasurer Fenn',
        text: '"Two hundred and twenty crowns, paid from what\'s left of the treasury after the payment. Which is very little."',
        choices: (s) => summonsChoices(s),
      },
      pay_ok: {
        speaker: 'Lord Treasurer Fenn',
        text: '"…Fine. Two hundred and eighty. Don\'t tell the guard captain." He writes it down himself.',
        choices: (s) => summonsChoices(s),
      },
      pay_fail: {
        speaker: 'Lord Treasurer Fenn',
        text: '"The realm is bleeding and you\'re haggling over bandages." He doesn\'t raise the fee.',
        choices: (s) => summonsChoices(s),
      },
    },
  },
  {
    id: 'quarter_day',
    story: true,
    after: ['silver_summons'],
    // fires soon after the silver's fate is known, however long the convoy took
    window: [9, 18],
    chance: 0.7,
    condition: (s) => !!(s.flags.silver_delivered || s.flags.silver_lost || s.flags.silver_declined),
    title: 'Quarter Day',
    text: (s) =>
      s.flags.silver_delivered
        ? 'The bells ring at noon: the Crown\'s payment has been received at Port Anselm. For one more quarter, the realm is solvent.\n\nA royal courier arrives at your hall with a letter in Fenn\'s own hand, and a choice.'
        : s.flags.silver_lost
          ? 'The bells do not ring. For the first time in twenty-two years, the Crown has missed a payment to Ostrander\'s.\n\nBy evening, bank factors are walking the city with lists. Factor Vorn sends a note asking to see you.'
          : 'The bells ring at noon: the Crown\'s payment arrived at Port Anselm, delivered by Hobb & Daughters. The criers praise Marta Hobb\'s name.\n\nDagny Fell, or someone like her, slips you a note: the wagons arrived lighter than they left.',
    choices: (s) =>
      s.flags.silver_delivered
        ? [
            { label: 'Accept a purse from the Crown', detail: '+100 crowns', effects: { crowns: 100 }, resultText: 'Fenn has scraped it from somewhere. You suspect his own pocket.' },
            { label: 'Accept a Crown writ of good conduct', detail: 'Heat −20, Exchequer +6', effects: { heat: -20, standing: { exchequer: 6 } }, resultText: 'The writ hangs over your door. Watchmen nod to your people now.' },
            { label: 'Ask for a seat at the Exchequer\'s table', detail: 'Influence +4', effects: { influence: 4, flag: 'fenn_ally' }, resultText: '"Done," says Fenn. "You\'ll find the table is mostly debt."' },
          ]
        : s.flags.silver_lost
          ? [
              {
                label: 'Offer the bank your services',
                detail: "Ostrander's +8, Lower Town −6. Unlocks bank contracts.",
                effects: { standing: { ostranders: 8, lowertown: -6 }, flag: 'ostranders_open' },
                resultText: 'Vorn is unsurprised. "The ledger always wins, in the end."',
              },
              {
                label: 'Swear to the Lower Town',
                detail: "Lower Town +8, Ostrander's −8",
                effects: { standing: { lowertown: 8, ostranders: -8 } },
                resultText: 'You send Vorn\'s note back unopened, with a loaf of bread. The Lower Town hears of it within the hour.',
              },
              { label: 'Stay out of it', effects: {}, resultText: 'The city holds its breath. So do you.' },
            ]
          : [
              {
                label: 'Prove that Hobb skimmed the silver',
                detail: 'Spend 3 Intel. Exchequer +10, Hobb & Daughters lose renown.',
                requires: { intel: 3 },
                effects: { intel: -3, standing: { exchequer: 10 }, rivalRenown: -6 },
                resultText: 'Your evidence reaches Fenn. Marta Hobb pays back every coin, with interest. She will not forget you.',
              },
              { label: 'Let it go', effects: {}, resultText: 'Some fights are not worth the coin.' },
            ],
  },
  {
    id: 'act1_slice_end',
    story: true,
    after: ['quarter_day'],
    window: [12, 20],
    chance: 0.6,
    title: 'End of the Season',
    text: (s) =>
      `The first season of your guild is over. ${
        s.flags.silver_delivered
          ? "The Crown's silver reached Port Anselm, and the realm has a few more months of grace. In the Exchequer, people now know your guild's name."
          : s.flags.silver_lost
            ? "The Crown's silver never reached the coast. The realm has defaulted for the first time, and Ostrander's factors are walking the city with lists."
            : "The Crown's silver went to the coast without you."
      }\n\nThis is the end of the current prototype's scripted story. The world keeps turning: contracts, rivals, the debt and the market all continue, so keep building your guild.`,
    choices: [{ label: 'Continue', effects: {}, resultText: 'The ledger never closes.' }],
  },
];

function summonsChoices(s: GameState): EventChoice[] {
  const c: (EventChoice | false)[] = [
    !s.flags.fenn_route && { label: '"Who knows the route?"', effects: { flag: 'fenn_route' }, next: 'route', resultText: '' },
    !!s.flags.vorn_slip &&
      !s.flags.fenn_stakes && {
        label: 'Tell him what Vorn let slip about the next treaty',
        detail: 'Exchequer +4, Influence +2',
        effects: { flag: 'fenn_stakes', standing: { exchequer: 4 }, influence: 2, npc: { id: 'fenn', attitude: 15 } },
        next: 'stakes',
        resultText: '',
      },
    !s.flags.fenn_pay && { label: '"What does it pay?"', effects: { flag: 'fenn_pay' }, next: 'pay', resultText: '' },
    !!s.flags.fenn_pay &&
      !s.flags.fenn_haggled &&
      !s.flags.silver_bonus && {
        label: 'Haggle',
        detail: 'Guile check. Success: +60 crowns on the contract.',
        check: { approach: 'guile', difficulty: 14 },
        effects: { flag: 'silver_bonus' },
        failEffects: { flag: 'fenn_haggled', standing: { exchequer: -2 }, npc: { id: 'fenn', attitude: -5 } },
        next: 'pay_ok',
        failNext: 'pay_fail',
        resultText: '',
      },
    {
      label: 'Accept the commission',
      detail: s.flags.fenn_route
        ? "Adds \"The Crown's Last Silver\". Fenn's tip reveals one of its dangers."
        : "Adds the story contract \"The Crown's Last Silver\".",
      effects: { unlockContract: 'silver_convoy', standing: { exchequer: 3 }, flag: 'silver_accepted', ...(s.flags.fenn_route ? { revealContract: 'silver_convoy' } : {}) },
      resultText: '"Good," says Fenn, and for a moment looks very tired. "Choose your people carefully."',
    },
    {
      label: 'Decline',
      detail: 'Exchequer −12. The Crown will find someone else, probably Hobb & Daughters.',
      effects: { standing: { exchequer: -12 }, rivalRenown: 4, flag: 'silver_declined', clocks: { arrears: 4 }, npc: { id: 'fenn', attitude: -15 } },
      resultText: 'Fenn nods once. "I see." The commission goes to Hobb & Daughters by evening.',
    },
  ];
  return c.filter(Boolean) as EventChoice[];
}

// ---------------------------------------------------------------------------
// Random events (world and people)
// ---------------------------------------------------------------------------

export const RANDOM_EVENTS: EventDef[] = [
  {
    id: 'brawl',
    title: 'A Tavern Brawl',
    weight: 2,
    cooldown: 6,
    member: (_s, m) => m.status === 'idle',
    text: (_s, m) =>
      `${m?.name} put a Weighhouse clerk through the window of the Copper Kettle.${m?.traits.includes('hotheaded') ? ' Nobody who knows them is surprised.' : ''} The clerk is demanding compensation, and the watch is asking questions.`,
    choices: (_s, m) => [
      { label: 'Pay the damages', detail: '−25 crowns', requires: { crowns: 25 }, effects: { crowns: -25 }, resultText: 'Coin smooths it over.' },
      { label: `Dock ${first(m)}'s wages`, detail: `${first(m)}: loyalty −12. Weighhouse +2`, effects: { member: { loyalty: -12 }, standing: { weighhouse: 2 } }, resultText: 'Discipline is maintained, and resented.' },
      { label: `Stand by ${first(m)}`, detail: `Weighhouse −4, Heat +3. ${first(m)}: loyalty +10. Everyone: morale +4`, effects: { standing: { weighhouse: -4 }, heat: 3, morale: 4, member: { loyalty: 10 } }, resultText: 'Your people cheer. The Weighhouse does not.' },
    ],
  },
  {
    id: 'raise',
    title: 'A Matter of Wages',
    weight: 1.5,
    cooldown: 10,
    member: (_s, m) => m.status === 'idle' && (m.traits.includes('greedy') || m.level >= 3),
    speaker: 'Your member',
    text: (_s, m) =>
      `${m?.name} catches you in the counting-room. "I've bled for this guild${m && m.missions > 0 ? ` on ${m.missions} contract${m.missions > 1 ? 's' : ''}` : ''}. Hobb's people get two crowns a week more than I do."`,
    choices: (_s, m) => [
      { label: 'Grant the raise', detail: `${first(m)}: wage +2/week, loyalty +15`, effects: { member: { wage: 2, loyalty: 15 } }, resultText: 'They nod, satisfied, and the matter is closed.' },
      {
        label: 'Bargain',
        detail: 'Guile check. Success: +1 wage, loyalty +10. Failure: loyalty −10.',
        check: { approach: 'guile', difficulty: 12 },
        effects: { member: { wage: 1, loyalty: 10 } },
        failEffects: { member: { loyalty: -10 } },
        resultText: 'You meet in the middle, and both of you feel you won.',
        failText: 'You overplay your hand. They leave without a word.',
      },
      { label: 'Refuse', detail: `${first(m)}: loyalty −15`, effects: { member: { loyalty: -15 } }, resultText: '"Fine," they say. It is clearly not fine.' },
    ],
  },
  {
    id: 'homesick',
    title: 'A Letter from Home',
    weight: 1.2,
    cooldown: 12,
    member: (_s, m) => m.status === 'idle',
    text: (_s, m) => `A letter arrives for ${m?.name}: their mother is sick in Harrowmere, and the physician wants paying in advance.`,
    choices: (_s, m) => [
      { label: 'Pay the physician', detail: `−20 crowns. ${first(m)}: loyalty +20, morale +10`, requires: { crowns: 20 }, effects: { crowns: -20, member: { loyalty: 20, morale: 10 } }, resultText: `${first(m)} doesn't say much, but they don't forget it either.` },
      { label: 'Give them time off', detail: `${first(m)}: fatigue resets, but they are hurt to the bone with worry (health −20)`, effects: { member: { fatigue: -100, health: -20, morale: 5 } }, resultText: 'They ride for Harrowmere and come back hollow-eyed but grateful.' },
      { label: 'The guild needs them here', detail: `${first(m)}: loyalty −8, morale −12`, effects: { member: { loyalty: -8, morale: -12 } }, resultText: 'They stay. Their mind does not.' },
    ],
  },
  {
    id: 'nightmares',
    title: 'Bad Nights',
    weight: 3,
    cooldown: 8,
    condition: (s) => s.members.some((m) => m.status === 'dead' && (m.diedWeek ?? -99) >= s.week - 6),
    member: (s, m) => m.status === 'idle' && m.missions > 0 && s.members.some((d) => d.status === 'dead' && (d.diedWeek ?? -99) >= s.week - 6),
    text: (s, m) => {
      const dead = s.members.filter((d) => d.status === 'dead').sort((a, b) => (b.diedWeek ?? 0) - (a.diedWeek ?? 0))[0];
      return `${m?.name} hasn't slept properly since ${dead?.name ?? 'the funeral'} died. They sit up in the hall at night, cleaning the same blade over and over.`;
    },
    choices: (s, m) => [
      ...(living(s).some((x) => x.profession === 'chaplain' && x.id !== m?.id)
        ? [{ label: 'Send the Chaplain to talk with them', detail: `${first(m)}: morale +18`, effects: { member: { morale: 18 } }, resultText: 'They talk until dawn. Something heavy is set down.' }]
        : []),
      { label: 'Drink with them', detail: `${first(m)}: morale +10. Might pick up a habit.`, effects: { member: { morale: 10, trait: 'drunkard' } }, resultText: 'You drink to the dead until the candles gutter.' },
      { label: 'Tell them to toughen up', detail: `${first(m)}: morale −10, loyalty −5, but they might come out Brave`, effects: { member: { morale: -10, loyalty: -5, trait: 'brave' } }, resultText: 'They take it badly, then take it to heart.' },
    ],
  },
  {
    id: 'lead',
    title: 'A Whisper in the Taverns',
    weight: 2,
    cooldown: 5,
    condition: (s) => s.board.some((c) => c.hidden.some((h) => !h.revealed)),
    member: (_s, m) => m.status === 'idle' && ['envoy', 'infiltrator', 'scout'].includes(m.profession),
    text: (s, m) => {
      const c = s.board.find((x) => x.hidden.some((h) => !h.revealed));
      return `${m?.name} comes back from the taverns smelling of cheap ale. "Heard something about that job, "${c?.title}". Want me to dig?"`;
    },
    choices: (_s, m) => [
      { label: 'Dig', detail: `Reveals a hidden tag. ${first(m)}: fatigue +15`, effects: { revealContract: 'any', member: { fatigue: 15, xp: 1 } }, resultText: 'They dig, and they find it.' },
      { label: 'Not now', effects: {}, resultText: 'They shrug and go back to their ale.' },
    ],
  },
  {
    id: 'dagny_tip',
    npcs: ['dagny'],
    title: 'Word from the Docks',
    weight: 2,
    cooldown: 6,
    condition: (s) => !!s.flags.dagny_contact,
    speaker: 'Dagny Fell',
    text: 'A porter\'s boy brings a scrap of sacking with three words chalked on it, and Dagny\'s mark.',
    choices: [{ label: 'Read it', detail: '+2 Intel', effects: { intel: 2 }, resultText: 'Dock gossip, but useful dock gossip.' }],
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
      { label: 'Buy it', detail: '−55 crowns, gain an Ember Focus, Heat +2', requires: { crowns: 55 }, effects: { crowns: -55, grantItem: 'ember_focus', heat: 2 }, resultText: 'It works perfectly. Better not to ask where it came from.' },
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
    title: "Saint Oda's Feast",
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
    npcs: ['vorn'],
    title: 'An Offer from the Bank',
    weight: 1.5,
    cooldown: 12,
    condition: (s) => s.factions.ostranders.standing >= 15 && s.loans.length > 0,
    speaker: 'Factor Vorn',
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
