import { seasonOf } from '../core/calendar';
import type { EventChoice, GameState, Member, NpcId } from '../core/types';
import { PROFESSIONS } from './professions';
import { CAST_RANDOM, CAST_STORY } from './cast';

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

/** One line in the charter scene about who put up the money. */
// who paid for the charter; the Weighhouse loan paid for everything else (the scene says so just before)
const BACKER_LINE: Record<string, string> = {
  veterans: 'Four old soldiers paid for the charter out of their back pay. Two of them have already argued about where the weapon racks should go.',
  merchant: 'A wool merchant on the Weighhouse paid for the charter. He has already sent a list of his wagons and the dates they leave.',
  coop: "The porters and small trades of the Lower Town paid for the charter, in coins so small that the Exchequer's clerk spent a morning counting them.",
  college: 'Two Arcanists who were thrown out of the college after the fire paid for the charter with what they had left. One of them still smells faintly of smoke.',
};

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

const CORE_STORY: EventDef[] = [
  {
    id: 'charter',
    story: true,
    window: [1, 1],
    title: 'A Charter and a Debt',
    text: (s) =>
      `The Exchequer's seal is still warm on your charter. As of this morning, Ledger & Blade may take paid work anywhere in the realm. It is also ${s.loans[0]?.principal ?? 800} crowns in debt to the Weighhouse, which paid for the hall, the first wages and the sign over the door.\n\n` +
      `${BACKER_LINE[s.start?.backer ?? 'merchant']}\n\n` +
      "The Exchequer man who brought the charter glances at the empty weapon racks. \"Quarter-day's in a few weeks,\" he says, as everyone in Varrow does lately. \"Good luck.\"\n\n" +
      'The hall came with a clerk, Jory Abbot, who has kept its books through three guildmasters and has already found the leak in the roof. He offers to show you round.',
    choices: [
      { label: 'Let Jory show you round', effects: {}, next: 'people', resultText: '' },
      { label: 'Skip the tour', detail: 'Go straight to spending the last of the coin', effects: {}, next: 'start', resultText: '' },
    ],
    nodes: {
      people: {
        speaker: 'Jory Abbot',
        text: (s) => {
          const crew = living(s);
          const names = crew.map((m) => `${first(m)} the ${PROFESSIONS[m.profession].name}`);
          const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] ?? 'nobody yet';
          return (
            `Jory starts in the common room, since the people cost the most. Your people are there, and have clearly been waiting: ${list}.\n\n` +
            `"${crew.reduce((n, m) => n + m.wage, 0)} crowns a week in wages, whether there's work or not," Jory says. "I'd find them work."\n\n` +
            'Each week, anyone at the hall can be given an order: rest, train, gather rumors, work the docks. Anyone badly hurt rests whatever you tell them.'
          );
        },
        choices: [
          { label: 'On to the strongbox', detail: 'Your people and their weekly orders are on the Roster', effects: {}, next: 'loan', resultText: '' },
          { label: "That's enough for now", effects: {}, next: 'start', resultText: '' },
        ],
      },
      loan: {
        speaker: 'Jory Abbot',
        text: (s) => {
          const l = s.loans[0];
          return (
            `The strongbox is under the stairs, and the ledger sits on top of it, open to a page that is mostly one number. "${l?.principal ?? 800} to the Weighhouse," Jory says. "The first payment is ${l?.paymentDue ?? 48} crowns, in week ${l?.dueWeek ?? 6}, then one every four weeks after that."\n\n` +
            'He turns the page back. "Miss three and they take the hall. I\'ve seen it done. They took the chairs first."\n\n' +
            'Paying early cuts the interest, and the Weighhouse counts it toward the next payment.'
          );
        },
        choices: [
          { label: 'On to the notice board', detail: 'The treasury and the loan are on the Hall', effects: {}, next: 'board', resultText: '' },
          { label: "That's enough for now", effects: {}, next: 'start', resultText: '' },
        ],
      },
      board: {
        speaker: 'Jory Abbot',
        text:
          'By the door there is a notice board with nothing on it but a nail. "Work gets pinned there," Jory says. "Debts to chase and wagons to guard, mostly. Now and then something in the tunnels under the Lower Town that wants clearing out."\n\n' +
          'You pick a job and the people for it, and they bring the pay home. Squads on the road can be followed week by week until they are back.\n\n' +
          'Jory looks at the nail. "Most of them come home."',
        choices: [{ label: "That's the hall, then", detail: 'Jobs are on Contracts, and squads that are out are on the Field', effects: {}, next: 'start', resultText: '' }],
      },
      start: {
        speaker: 'Jory Abbot',
        text: '"There\'s a little left over from the Weighhouse money," Jory says. "I\'d spend it before the roof does."\n\nHow do you start?',
        choices: (s) => [
          {
            label: 'Arm the guild',
            detail: 'Gain a Mail Hauberk and 2 Fire Oils',
            effects: { flag: 'start_arms' },
            resultText: 'You visit the armorers on Anvil Row. Your people will at least look the part.',
          },
          // the college backers already brought one Arcanist, so theirs is a second
          s.start?.backer === 'college'
            ? {
                label: 'Hire a second Arcanist',
                detail: 'Another college-trained Arcanist joins for free',
                effects: { freeRecruit: true },
                resultText: 'Word gets round the college that one of its own is hiring. A second Arcanist turns up the next morning with a sack of books and no questions about the fire.',
              }
            : {
                label: 'Hire an Arcanist',
                detail: 'A college-trained Arcanist joins for free',
                effects: { freeRecruit: true },
                resultText: 'A young Arcanist from the college, short of fees, signs on for the work and the wage.',
              },
          {
            label: 'Keep the coin',
            detail: '+80 crowns',
            effects: { crowns: 80 },
            resultText: 'You put it in the strongbox under the stairs. Eighty crowns is eighty crowns.',
          },
        ],
      },
    },
  },
  {
    id: 'ostrander_agent',
    story: true,
    npcs: ['vorn'],
    window: [2, 3],
    chance: 0.6,
    title: "A Visitor from Ostrander's",
    text:
      "There's a woman from Ostrander's in your front room. She got there before you were up, and she's been reading the notice board while she waited.\n\n" +
      '"Maelis Vorn. I run the bank\'s office on Quay Street." She nods at the board. "You\'ve spelled \'carriage\' wrong."',
    choices: [
      { label: 'Hear her out', effects: {}, next: 'pitch', resultText: '' },
      {
        label: 'Show her the door',
        detail: "Ostrander's −10, Lower Town +6",
        effects: { standing: { ostranders: -10, lowertown: 6 }, npc: { id: 'vorn', attitude: -15 } },
        resultText: "She goes without arguing. By evening half the Lower Town has heard you threw the bank's woman out, and people you've never met are buying your crew drinks.",
      },
    ],
    nodes: {
      pitch: {
        speaker: 'Factor Vorn',
        text:
          '"We\'re owed money all over this city. Three hundred-odd debts at last count, and I\'ve got four clerks and a dog to chase them." She doesn\'t smile, so it\'s hard to tell if the dog is a joke.\n\n' +
          '"Most of it is knocking on doors and carrying things out. We pay when the job\'s done, and we pay better than the Exchequer. Which, to be fair, isn\'t hard."',
        choices: vornQuestions,
      },
      people: {
        speaker: 'Factor Vorn',
        text:
          '"Nobody gets hurt, if I can help it. They lose whatever they put up against the loan. Sometimes that\'s a loom. Sometimes it\'s the house."\n\n' +
          '"I know how it looks. But if the Crown stops paying, the treaty lets the bank close the river, and then everyone down there loses something. I\'d rather it was looms."',
        choices: vornQuestions,
      },
      hobbs: {
        speaker: 'Factor Vorn',
        text:
          '"We do use them. Marta charges whatever she likes, her girls are rough with people, and when a street riots, it\'s the bank\'s name on the stones." She picks a bit of lint off her sleeve. "I\'d like someone else on the list."\n\n' +
          '"She won\'t be happy about it, by the way. Better you hear that from me."',
        choices: (s) => [...vornQuestions(s)],
      },
      want: {
        speaker: 'Factor Vorn',
        text:
          'You don\'t answer straight away, and she\'s the kind of person who fills a gap. "Getting paid. And something to hold in case we aren\'t: the Anselm tolls, the Kell silver warrants."\n\n' +
          '"And if the Crown does miss a payment, the treaty says we get to write the next one." She says it the way a clerk reads out a date, then moves straight on to rates.',
        choices: vornQuestions,
      },
      want_fail: {
        speaker: 'Factor Vorn',
        text: '"To be repaid," she says. "It\'s a bank." She waits to see if you had a real question.',
        choices: vornQuestions,
      },
      terms: {
        speaker: 'Factor Vorn',
        text: '"So. Do you want the work?"',
        choices: [
          {
            label: "We'll work for the bank.",
            detail: "Ostrander's +10, Lower Town −5. Unlocks bank contracts.",
            effects: { standing: { ostranders: 10, lowertown: -5 }, flag: 'ostranders_open', flags: ['vorn_fixed_board'], npc: { id: 'vorn', attitude: 15 } },
            resultText: '"Good. You\'ll have something by the end of the week." On her way out she stops at the notice board and fixes your spelling with her own pen.',
          },
          {
            label: "We'll take your jobs case by case.",
            detail: "Ostrander's +3. Unlocks bank contracts.",
            effects: { standing: { ostranders: 3 }, flag: 'ostranders_open', npc: { id: 'vorn', attitude: 5 } },
            resultText: '"That\'s what most people say at first." She writes something in a small book and leaves.',
          },
          {
            label: 'Not today.',
            detail: "Ostrander's −2. You can court the bank later from the Realm screen.",
            effects: { standing: { ostranders: -2 }, npc: { id: 'vorn', attitude: -5 } },
            resultText: '"Suit yourself. You know where Quay Street is."',
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
      "Marta Hobb lets herself in, leaning on a black umbrella she doesn't need, with two of her daughters behind her. Hobb & Daughters have been collecting debts in Varrow for thirty years, and Marta has done most of the talking for all of them.\n\n" +
      (s.factions.ostranders.standing >= 8
        ? '"Now, I hear you\'ve been doing little jobs for the bank," she says, settling into your best chair. "Those used to be my little jobs. I thought we should have a chat before anybody gets upset."\n\n'
        : '"I like to call on the new guilds," she says, settling into your best chair. "Most of them don\'t last the year, and I like to have said hello."\n\n') +
      '"So here\'s my offer. You pay me a quarter of what your contracts bring in, and my girls leave your work alone. Everybody stays friends."',
    speaker: 'Marta Hobb',
    choices: [
      { label: "What's in it for me, exactly?", effects: {}, next: 'details', resultText: '' },
      { label: 'Refuse politely', detail: 'Hobbs become more aggressive.', effects: { rivalAggression: 0.15, npc: { id: 'marta', attitude: -5 } }, resultText: '"Suit yourself, dear." She takes her time getting up, and Isbet holds the door for her.' },
    ],
    nodes: {
      details: {
        speaker: 'Marta Hobb',
        text:
          '"Peace and quiet, dear. My girls stop bidding against you. And I play cards with two of the Weighhouse aldermen, who aren\'t very fond of you at the moment. I could fix that."\n\n' +
          'Her eldest, Isbet, has wandered over to your weapon rack and is turning one of your swords over in her hands, checking the edge.',
        choices: [
          {
            label: 'Sell her the share',
            detail: '+150 crowns now, Weighhouse +6. She takes 25% of all contract pay. Renown −3. The Hobbs compete far less.',
            effects: { crowns: 150, renown: -3, rivalRenown: 5, rivalAggression: -0.35, flag: 'hobbs_share', standing: { weighhouse: 6 }, npc: { id: 'marta', attitude: 15 } },
            resultText: 'Marta counts out the coins herself, one at a time, and has Isbet write you a receipt. It\'s quiet at supper that night.',
          },
          {
            label: 'Refuse politely',
            detail: 'Hobbs become more aggressive.',
            effects: { rivalAggression: 0.15, npc: { id: 'marta', attitude: -5 } },
            resultText: '"Suit yourself, dear." She takes her time getting up, and Isbet holds the door for her.',
          },
          {
            label: 'Humiliate her in front of her daughters',
            detail: 'Guile check. Success: Renown +4, and it becomes personal. Failure: Renown −2. Either way, the Hobbs grow much more aggressive.',
            check: { approach: 'guile', difficulty: 13 },
            effects: { renown: 4, rivalAggression: 0.2, feud: 25, npc: { id: 'marta', attitude: -25 } },
            failEffects: { renown: -2, rivalAggression: 0.35, feud: 15, npc: { id: 'marta', attitude: -10 } },
            resultText: 'You say something about the umbrella that makes her youngest daughter snort before she can stop herself. Marta doesn\'t laugh. By evening the line is being repeated in taverns all along the river.',
            failText: 'Marta laughs, leans over and pats your hand. That\'s the part people repeat for the rest of the week.',
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
      "The grain levy came in at dawn. By noon the Lower Town had overturned two bakers' carts and broken most of the Weighhouse windows. Now there are porters at your door asking for help, and an Exchequer clerk behind them holding a purse.",
    choices: [
      {
        label: 'Feed them from the guild stores',
        detail: 'Give 8 Supplies. Lower Town +10, Unrest −5.',
        requires: { supplies: 8 },
        effects: { supplies: -8, standing: { lowertown: 10 }, clocks: { unrest: -5 }, renown: 1, flag: 'riot_fed' },
        next: 'dagny',
        resultText: 'Your people hand out loaves from the stores, and the crowd in the street thins out as word gets round.',
      },
      {
        label: 'Pay the bakers to open their ovens',
        detail: '−35 crowns. Lower Town +8, Unrest −4.',
        requires: { crowns: 35 },
        effects: { crowns: -35, standing: { lowertown: 8 }, clocks: { unrest: -4 }, flag: 'riot_fed' },
        next: 'dagny',
        resultText: 'You pay three bakeries to keep their ovens going all afternoon. It turns out to be hard to throw stones with your mouth full.',
      },
      {
        label: 'Take the Exchequer\'s purse and clear the square',
        detail: '+60 crowns, Exchequer +5, Lower Town −5. What happens next is up to you.',
        effects: { crowns: 60, standing: { exchequer: 5, lowertown: -5 } },
        next: 'square',
        resultText: 'Your people pick up cudgels and shields and head for the bread market.',
      },
      {
        label: 'Bar the doors',
        detail: 'Unrest +4.',
        effects: { clocks: { unrest: 4 } },
        resultText: 'You lock up and wait. It\'s over by nightfall, the city is angrier than before, and your crew spent the day listening to it through the shutters.',
      },
    ],
    nodes: {
      dagny: {
        speaker: 'Dagny Fell, Porters\' Fraternity',
        text:
          'One of the porters stays behind when the rest have gone, a big woman with a cargo hook hanging from her belt.\n\n' +
          '"Dagny Fell. I carry for the Fraternity." She looks round your hall. "Nobody feeds us for free, so what do you want for it?"',
        choices: [
          {
            label: '"Your ears on the docks."',
            detail: '+2 Intel now. Dagny becomes a contact.',
            effects: { intel: 2, flag: 'dagny_contact', npc: { id: 'dagny', attitude: 10 } },
            resultText: '"All right. If something comes off a boat, I\'ll know about it, and then you will too."',
          },
          {
            label: '"Nothing. Eat."',
            detail: 'Lower Town +4',
            effects: { standing: { lowertown: 4 }, flag: 'dagny_friend', npc: { id: 'dagny', attitude: 25 } },
            resultText: 'She looks at you as if you\'ve said something stupid, then laughs. "You\'re mad. All right." By the end of the week she has told the story in every tavern on the river.',
          },
        ],
      },
      square: {
        text: 'The bread market is packed. A stone bounces off somebody\'s shield, and the crowd pushes forward to see what you\'ll do about it.',
        choices: [
          {
            label: 'Hold the line without drawing blood',
            detail: 'Endurance check. Success: Unrest −2, Exchequer +3. Failure: someone is hurt, Unrest +2.',
            check: { approach: 'endurance', difficulty: 9 },
            effects: { clocks: { unrest: -2 }, standing: { exchequer: 3 }, flag: 'riot_held' },
            failEffects: { wounds: 20, clocks: { unrest: 2 }, flag: 'riot_broken' },
            resultText: 'Your people lock shields and stand there taking the shoving until the crowd gets bored and goes home. Nobody swings a cudgel. Even the porters admit it took some nerve.',
            failText: 'The line gives way. One of yours ends up on the ground under a lot of boots before you get things back in hand.',
          },
          {
            label: 'Break them up',
            detail: 'Exchequer +5, Lower Town −6, Unrest +3, Heat +3',
            effects: { standing: { exchequer: 5, lowertown: -6 }, clocks: { unrest: 3 }, heat: 3, flag: 'riot_broken' },
            resultText: 'It\'s over in a few minutes, and the Exchequer clerk is delighted. The Lower Town knows exactly whose cudgels they were.',
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
      'Lord Treasurer Aubrey Fenn sees you in an office with pale squares on the walls where the tapestries used to hang. He apologizes for the cold.\n\n' +
      '"The quarter payment is due, and for once we have it: three wagons of silver, most of what\'s left of the Crown plate. It has to reach Port Anselm and the bank\'s ships. I\'d send my own guard, but half of them are owed back pay by the sort of people who\'d like to see it stolen."',
    choices: (s) => summonsChoices(s),
    nodes: {
      route: {
        speaker: 'Lord Treasurer Fenn',
        text:
          '"My clerks know the route. So does the guard captain, and so does Vorn, because the bank insists on knowing everything." He rubs his eyes. "If I wanted to rob it, I\'d try the ford at Wenmouth. You can\'t see that stretch of road from either side."',
        choices: (s) => summonsChoices(s),
      },
      stakes: {
        speaker: 'Lord Treasurer Fenn',
        text:
          'You tell him what Vorn said about the bank writing the next treaty. Fenn puts his pen down.\n\n' +
          '"So they\'d rather we missed it. That explains a few things." He looks at you properly for the first time. "Thank you. I won\'t forget that."',
        choices: (s) => summonsChoices(s),
      },
      pay: {
        speaker: 'Lord Treasurer Fenn',
        text: '"Two hundred and twenty crowns. It comes out of whatever\'s left after the payment, and I should warn you there isn\'t much left after the payment."',
        choices: (s) => summonsChoices(s),
      },
      pay_ok: {
        speaker: 'Lord Treasurer Fenn',
        text: '"All right, two hundred and eighty. Please don\'t mention it to the guard captain." He writes it down himself.',
        choices: (s) => summonsChoices(s),
      },
      pay_fail: {
        speaker: 'Lord Treasurer Fenn',
        text: '"Everyone is being squeezed this year, including me. Two hundred and twenty."',
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
        ? 'At noon the cathedral bells ring to say the payment has been received at Port Anselm. The realm has paid its way for one more quarter.\n\nA royal courier brings you a letter from Fenn, written in his own hand. He wants to thank you, and he has something to offer.'
        : s.flags.silver_lost
          ? 'Noon comes and the bells stay quiet. For the first time in twenty-two years, the Crown has missed a payment to Ostrander\'s.\n\nBy evening the bank\'s clerks are going door to door with lists, and a note from Vorn asks whether you have a minute.' +
            (s.flags.vorn_honest ? ' At the bottom she has written, "I did tell you which stretch of road to watch."' : '') +
            (s.flags.vorn_told ? ' You remember giving her the date the wagons would leave, and wonder who she gave it to.' : '')
          : 'At noon the bells ring. The payment reached Port Anselm, carried by Hobb & Daughters, and the criers are making a great deal of Marta\'s name.\n\nThat night somebody slips a note under your door. The wagons reached the coast a good deal lighter than they were when they left.',
    choices: (s) =>
      s.flags.silver_delivered
        ? [
            { label: 'Accept a purse from the Crown', detail: '+100 crowns', effects: { crowns: 100 }, resultText: 'Fenn has found it somewhere. You suspect it\'s his own money.' },
            { label: 'Accept a Crown writ of good conduct', detail: 'Heat −20, Exchequer +6', effects: { heat: -20, standing: { exchequer: 6 } }, resultText: 'You hang the writ by the door, and the watch starts nodding to your people in the street.' },
            { label: 'Ask for a seat at the Exchequer\'s table', detail: 'Influence +4', effects: { influence: 4, flag: 'fenn_ally' }, resultText: '"Done," Fenn writes back. "I\'m afraid you\'ll find it\'s mostly arguing about money."' },
          ]
        : s.flags.silver_lost
          ? [
              {
                label: 'Offer the bank your services',
                detail: "Ostrander's +8, Lower Town −6. Unlocks bank contracts.",
                effects: { standing: { ostranders: 8, lowertown: -6 }, flag: 'ostranders_open' },
                resultText: 'Vorn doesn\'t seem surprised to see you. "Good. We\'re about to be very busy."',
              },
              {
                label: 'Swear to the Lower Town',
                detail: "Lower Town +8, Ostrander's −8",
                effects: { standing: { lowertown: 8, ostranders: -8 } },
                resultText: 'You send Vorn\'s note back unopened, with a loaf of bread. The Lower Town hears about it within the hour.',
              },
              { label: 'Stay out of it', effects: {}, resultText: 'You stay in, like most of the city. Nobody sleeps much.' },
            ]
          : [
              {
                label: 'Prove that Hobb skimmed the silver',
                detail: 'Spend 3 Intel. Exchequer +10, Hobb & Daughters lose renown.',
                requires: { intel: 3 },
                effects: { intel: -3, standing: { exchequer: 10 }, rivalRenown: -6 },
                resultText: 'Your evidence goes to Fenn, and Marta Hobb pays back every coin with interest. She also sends you a cake, which nobody eats.',
              },
              { label: 'Let it go', effects: {}, resultText: 'You let it go. There will be other fights.' },
            ],
  },
  {
    id: 'act1_slice_end',
    story: true,
    after: ['quarter_day', 'fenn_tapestry', 'aske_plate'],
    window: [22, 26],
    chance: 0.6,
    title: 'Half a Year',
    text: (s) => {
      const silver = s.flags.silver_delivered
        ? "The Crown's silver reached Port Anselm, and the realm has a few more months of grace. In the Exchequer, people know your guild's name now."
        : s.flags.silver_lost
          ? "The Crown's silver never reached the coast. The realm has defaulted for the first time, and Ostrander's factors are walking the city with lists."
          : "The Crown's silver went to the coast without you.";
      const people = [
        s.flags.ansel_freed && 'Ansel Fell is back on the docks, and Dagny makes sure everyone knows who got him out.',
        s.flags.ansel_lost && 'Ansel Fell is on a galley somewhere off Anselm.',
        s.flags.salts_delivered && "The fever in Saint Oda's almshouse has broken, and the Sisters pray for the guild by name.",
        s.flags.salts_failed && "Saint Oda's buried more people than usual this season.",
        s.flags.salts_accepted && !s.flags.salts_delivered && !s.flags.salts_failed && 'The Sisters of Saint Oda\'s are still waiting for their salts.',
        s.flags.aske_plate_saved && "Two hundred years of Aske silver is sitting under straw in a barn on the Drover's Road.",
        s.flags.aske_betrayed && 'The Fourteen have stopped inviting your guild to anything.',
        s.flags.tapestry_bought && 'The Siege of Carrow hangs in your hall, and visitors stop to look at it.',
        s.flags.isbet_pact && 'Isbet Hobb keeps her half of the beer mat in her purse.',
        s.flags.coster_exposed && 'Alderman Coster has left Varrow.',
        s.flags.coster_job && s.flags.weights_exposed && "Hesketh's bushels are full measure again, and the bakers know who to thank.",
        s.flags.coster_terms && !s.flags.coster_exposed && 'Coster still mentions the twenty crowns he took off your note, usually when he wants something.',
        s.flags.silver_abandoned && "The Crown's wagons waited at Wenmouth ford for an escort that never came.",
        s.flags.fenn_ally && "You sit at the Exchequer's table on Thursdays. Fenn was right about the arguing.",
        s.flags.weights_failed && "Hesketh's bushels are still short, and the bakers have stopped asking you about it.",
        s.flags.isbet_betrayed && s.npcs.isbet?.status === 'alive' && "Isbet Hobb has stopped going to the Copper Kettle on the nights your people are there.",
        s.flags.tapestry_sold && 'The Siege of Carrow hangs in a wool merchant\'s house in Harrowmere, and the Exchequer has a little more to pay the bank with.',
        s.flags.tapestry_lost && "Somewhere between here and Harrowmere, the Siege of Carrow is keeping somebody's hay dry.",
        s.flags.aske_plate_lost && 'Lady Aske tells everyone the assessors took her silver, which is nearly true.',
      ].filter(Boolean);
      return (
        `Half a year has passed since the Exchequer sealed your charter. ${silver}` +
        (people.length ? `\n\n${people.join(' ')}` : '') +
        "\n\nThis is where the prototype's scripted story ends for now. Contracts, rivals, the Council and the Debt all carry on, and so does the guild."
      );
    },
    choices: [{ label: 'Continue', effects: {}, resultText: 'Back to work.' }],
  },
];

/** Every Act I beat. Beats whose window closes first are checked first, since only one fires a week. */
export const STORY_EVENTS: EventDef[] = [...CORE_STORY, ...CAST_STORY].sort((a, b) => (a.window?.[1] ?? 0) - (b.window?.[1] ?? 0));

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
      resultText: '"Thank you." He looks very tired. "Pick your people carefully. Somebody out there knows the route."',
    },
    {
      label: 'Decline',
      detail: 'Exchequer −12. The Crown will find someone else, probably Hobb & Daughters.',
      effects: { standing: { exchequer: -12 }, rivalRenown: 4, flag: 'silver_declined', clocks: { arrears: 4 }, npc: { id: 'fenn', attitude: -15 } },
      resultText: 'Fenn nods. "I understand." By evening the commission has gone to Hobb & Daughters.',
    },
  ];
  return c.filter(Boolean) as EventChoice[];
}

// ---------------------------------------------------------------------------
// Random events (world and people)
// ---------------------------------------------------------------------------

const WORLD_EVENTS: EventDef[] = [
  {
    id: 'brawl',
    title: 'A Tavern Brawl',
    weight: 2,
    cooldown: 6,
    member: (_s, m) => m.status === 'idle',
    text: (_s, m) =>
      `${m?.name} has put a Weighhouse clerk through the front window of the Copper Kettle.${m?.traits.includes('hotheaded') ? ' Nobody who knows them is surprised.' : ''} The clerk wants compensation, and the watch would like a word.`,
    choices: (_s, m) => [
      { label: 'Pay the damages', detail: '−25 crowns', requires: { crowns: 25 }, effects: { crowns: -25 }, resultText: 'You pay the glazier and the clerk, and the watch loses interest.' },
      { label: `Dock ${first(m)}'s wages`, detail: `${first(m)}: loyalty −12. Weighhouse +2`, effects: { member: { loyalty: -12 }, standing: { weighhouse: 2 } }, resultText: 'They take it without arguing, but they don\'t like it.' },
      { label: `Stand by ${first(m)}`, detail: `Weighhouse −4, Heat +3. ${first(m)}: loyalty +10. Everyone: morale +4`, effects: { standing: { weighhouse: -4 }, heat: 3, morale: 4, member: { loyalty: 10 } }, resultText: 'Your crew cheer. The Weighhouse sends a letter.' },
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
      `${m?.name} catches you in the counting-room. "I've bled for this guild${m && m.missions > 0 ? ` on ${m.missions} contract${m.missions > 1 ? 's' : ''}` : ''}, and I hear Hobb's people get two crowns a week more than I do."`,
    choices: (_s, m) => [
      { label: 'Grant the raise', detail: `${first(m)}: wage +2/week, loyalty +15`, effects: { member: { wage: 2, loyalty: 15 } }, resultText: 'They nod and go back to work, looking pleased with themselves.' },
      {
        label: 'Bargain',
        detail: 'Guile check. Success: +1 wage, loyalty +10. Failure: loyalty −10.',
        check: { approach: 'guile', difficulty: 12 },
        effects: { member: { wage: 1, loyalty: 10 } },
        failEffects: { member: { loyalty: -10 } },
        resultText: 'You meet in the middle. Neither of you is entirely happy, which is probably fair.',
        failText: 'You push too hard, and they walk out halfway through your sentence.',
      },
      { label: 'Refuse', detail: `${first(m)}: loyalty −15`, effects: { member: { loyalty: -15 } }, resultText: '"Fine," they say, and leave without closing the door.' },
    ],
  },
  {
    id: 'homesick',
    title: 'A Letter from Home',
    weight: 1.2,
    cooldown: 12,
    member: (_s, m) => m.status === 'idle',
    text: (_s, m) => `A letter comes for ${m?.name}. Their mother is ill in Harrowmere, and the physician wants paying before he'll come out.`,
    choices: (_s, m) => [
      { label: 'Pay the physician', detail: `−20 crowns. ${first(m)}: loyalty +20, morale +10`, requires: { crowns: 20 }, effects: { crowns: -20, member: { loyalty: 20, morale: 10 } }, resultText: `${first(m)} doesn't say much about it, but they work twice as hard that week.` },
      { label: 'Give them time off', detail: `${first(m)}: fully rested, but the worry wears them down (health −20)`, effects: { member: { fatigue: -100, health: -20, morale: 5 } }, resultText: 'They ride for Harrowmere and come back a week later, thin and grateful.' },
      { label: 'The guild needs them here', detail: `${first(m)}: loyalty −8, morale −12`, effects: { member: { loyalty: -8, morale: -12 } }, resultText: 'They stay, but you catch them reading the letter again at supper.' },
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
      return `${m?.name} hasn't slept properly since ${dead?.name ?? 'the funeral'} died. You keep finding them in the hall after midnight, cleaning a blade that's already clean.`;
    },
    choices: (s, m) => [
      ...(living(s).some((x) => x.profession === 'chaplain' && x.id !== m?.id)
        ? [{ label: 'Send the Chaplain to talk with them', detail: `${first(m)}: morale +18`, effects: { member: { morale: 18 } }, resultText: `They talk until it gets light. The next morning ${first(m)} eats breakfast for the first time in a week.` }]
        : []),
      { label: 'Drink with them', detail: `${first(m)}: morale +10. Might pick up a habit.`, effects: { member: { morale: 10, trait: 'drunkard' } }, resultText: 'You drink to the dead until the candles go out, and neither of you is much use the next morning.' },
      { label: 'Tell them to toughen up', detail: `${first(m)}: morale −10, loyalty −5, but they might come out Brave`, effects: { member: { morale: -10, loyalty: -5, trait: 'brave' } }, resultText: "They take it badly. A few days later they're the first one up for drill." },
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
      return `${m?.name} comes back from the taverns smelling of cheap ale. "I heard something about that job, '${c?.title}'. Want me to go back and dig?"`;
    },
    choices: (_s, m) => [
      { label: 'Dig', detail: `Reveals a hidden tag. ${first(m)}: fatigue +15`, effects: { revealContract: 'any', member: { fatigue: 15, xp: 1 } }, resultText: 'They go back out that night and come home with a name and a story.' },
      { label: 'Not now', effects: {}, resultText: 'They shrug and go back to the tavern anyway.' },
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
    text: 'A porter\'s boy brings round a scrap of sacking with a few words chalked on it, and Dagny\'s mark underneath.',
    choices: [{ label: 'Read it', detail: '+2 Intel', effects: { intel: 2 }, resultText: 'It\'s mostly dock gossip, but some of it is useful.' }],
  },
  {
    id: 'informant',
    title: 'A Mudlark Informant',
    weight: 2,
    cooldown: 4,
    text: 'A girl from the river, maybe ten years old and filthy to the knees, says she\'ll tell you what she\'s heard on the docks if you make it worth her while.',
    choices: [
      { label: 'Pay her', detail: '−15 crowns, +3 Intel', requires: { crowns: 15 }, effects: { crowns: -15, intel: 3 }, resultText: 'She talks fast, and she knows things a ten-year-old shouldn\'t.' },
      { label: 'Send her off', effects: {}, resultText: 'She shrugs and goes off to find someone who will pay. Possibly Marta Hobb.' },
    ],
  },
  {
    id: 'petition',
    title: 'A Petition at the Gate',
    weight: 2,
    cooldown: 5,
    text: "A widow from the Lower Town is waiting at your gate. The bank's collectors took her husband's tools last month, and she has three children to feed.",
    choices: [
      { label: 'Give supplies', detail: '−6 Supplies, Lower Town +4, Renown +1', requires: { supplies: 6 }, effects: { supplies: -6, standing: { lowertown: 4 }, renown: 1 }, resultText: 'She thanks you and goes. By the weekend half the street knows about it.' },
      { label: 'Turn her away', detail: 'Lower Town −1', effects: { standing: { lowertown: -1 } }, resultText: 'She goes without arguing. Your gatekeeper watches her all the way down the street.' },
    ],
  },
  {
    id: 'audit',
    title: 'The Exchequer Audits',
    weight: 4,
    cooldown: 6,
    condition: (s) => s.heat >= 30,
    text: 'Two Exchequer clerks turn up with ledgers and a long list of questions about your recent "night work".',
    choices: [
      { label: 'Pay the fine', detail: '−50 crowns, Heat −15', requires: { crowns: 50 }, effects: { crowns: -50, heat: -15 }, resultText: 'The clerks take the money, give you a receipt and leave.' },
      {
        label: 'Talk them round',
        detail: 'Guile check. Success: Heat −10. Failure: Heat +10, Exchequer −6.',
        check: { approach: 'guile', difficulty: 14 },
        effects: { heat: -10 },
        failEffects: { heat: 10, standing: { exchequer: -6 } },
        resultText: 'By the end of the afternoon the clerks are apologizing for wasting your time.',
        failText: 'The clerks write down everything you say and ask to see the stores.',
      },
      { label: 'Stonewall', detail: 'Exchequer −8', effects: { standing: { exchequer: -8 } }, resultText: 'They leave with nothing, and they make a note of that too.' },
    ],
  },
  {
    id: 'peddler',
    title: 'An Assay-Peddler',
    weight: 1.5,
    cooldown: 8,
    text: 'A peddler with an Assay Office license that expired last spring offers you a fire-keyed focus for well under the going price. He doesn\'t say where he got it, and you don\'t ask.',
    choices: [
      { label: 'Buy it', detail: '−55 crowns, gain an Ember Focus, Heat +2', requires: { crowns: 55 }, effects: { crowns: -55, grantItem: 'ember_focus', heat: 2 }, resultText: 'It works perfectly, which somehow makes it more suspicious.' },
      { label: 'Decline', effects: {}, resultText: 'He tries the guild across the street.' },
    ],
  },
  {
    id: 'volunteer',
    title: 'A Volunteer',
    weight: 1.2,
    cooldown: 10,
    condition: (s) => s.factions.lowertown.standing >= 10,
    text: "A kid from the Lower Town, sixteen at most, has heard about your guild and wants in. They'll work for a bed and a small wage.",
    choices: [
      { label: 'Take them in', detail: 'A free recruit joins', effects: { freeRecruit: true, standing: { lowertown: 2 } }, resultText: "They're green, but they turn up early every day." },
      { label: 'Send them home', effects: {}, resultText: 'They leave disappointed, and try Hobb & Daughters next.' },
    ],
  },
  {
    id: 'festival',
    title: "Saint Oda's Feast",
    weight: 3,
    cooldown: 40,
    condition: (s) => seasonOf(s.week) === 'Summer',
    text: "It's Saint Oda's feast, when the guilds of Varrow are expected to be generous in public.",
    choices: [
      { label: 'Host a feast', detail: '−40 crowns, Renown +3, morale +10', requires: { crowns: 40 }, effects: { crowns: -40, renown: 3, morale: 10, standing: { lowertown: 3 } }, resultText: 'The hall is full until dawn, and somebody breaks a bench.' },
      { label: 'Give your people the day off', detail: 'morale +5', effects: { morale: 5 }, resultText: 'Most of them sleep until noon.' },
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
    text: 'Vorn offers to buy part of your Weighhouse loan. The bank would pay off 200 crowns of it. In return, she says, the bank would expect "first refusal" on your time.',
    choices: [
      { label: 'Accept', detail: "Loan −200, Ostrander's +5, Weighhouse −8, Lower Town −4", effects: { flag: 'bank_paid_loan', standing: { ostranders: 5, weighhouse: -8, lowertown: -4 } }, resultText: 'Your debt is lighter, and you now owe some of it to the bank.' },
      { label: 'Decline', detail: "Ostrander's −2", effects: { standing: { ostranders: -2 } }, resultText: '"Fine," says Vorn, and writes something in her small book.' },
    ],
  },
];

export const RANDOM_EVENTS: EventDef[] = [...WORLD_EVENTS, ...CAST_RANDOM];
