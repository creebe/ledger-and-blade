// The wider cast of Act I: a face for every faction and rival, and follow-ups
// that react to what the guild did earlier. See docs/STORY.md, sections 4 and 5.
import type { EventChoice, GameState, Member } from '../core/types';
import type { EventDef } from './events';
import { epithetOptions, signatureOptions, SIGNATURES } from '../people/legends';

const first = (m?: Member) => (m ? m.name.split(' ')[0] : 'They');
const fired = (s: GameState, id: string) => s.eventWeeks[id] !== undefined;
const FIGHTERS = ['vanguard', 'skirmisher', 'marksman'];

// ---------------------------------------------------------------------------
// Story beats
// ---------------------------------------------------------------------------

const costerChoices: EventChoice[] = [
  {
    label: 'Take the job',
    detail: 'Adds the story contract "Short Weight at Hesketh\'s". Success: Weighhouse +6, Lower Town +4, loan −40.',
    effects: { unlockContract: 'false_weights', flag: 'coster_job', npc: { id: 'coster', attitude: 10 } },
    resultText: '"Good. Keep the receipt. Hesketh will say you bought the sack somewhere else."',
  },
  {
    label: 'Ask for something now as well',
    detail: 'Guile check. Success: loan −20 today, and the job. Failure: Coster −5, and the job.',
    check: { approach: 'guile', difficulty: 13 },
    effects: { unlockContract: 'false_weights', flag: 'coster_terms', flags: ['coster_job'], loan: -20, npc: { id: 'coster', attitude: 5 } },
    failEffects: { unlockContract: 'false_weights', flag: 'coster_job', npc: { id: 'coster', attitude: -5 } },
    resultText: 'He sighs, does a sum on the back of his hand, and agrees to take twenty off the note today.',
    failText: '"No," he says. It turns out that is all he has to say about it. The job is still yours if you want it.',
  },
  {
    label: 'Decline',
    detail: 'Coster −10, Weighhouse −2',
    effects: { standing: { weighhouse: -2 }, npc: { id: 'coster', attitude: -10 } },
    resultText: '"As you like." He writes something on a card and puts it in his waistcoat pocket.',
  },
];

function paskChoices(): EventChoice[] {
  return [
    {
      label: "We'll buy through you.",
      detail: "Mudlarks +22 (supplies cost 10% less at 20 or more). Heat +4, Ostrander's −3.",
      effects: { flags: ['met_mudlarks', 'pask_deal'], standing: { mudlarks: 22, ostranders: -3 }, heat: 4, npc: { id: 'pask', attitude: 15 } },
      resultText: '"Good." She spits in her palm and holds it out, and waits to see whether you\'ll shake it. You do. She seems a little disappointed.',
    },
    {
      label: 'Just this once. Sell us a cartload.',
      detail: '−25 crowns, +15 supplies, Mudlarks +6',
      requires: { crowns: 25 },
      effects: { flag: 'met_mudlarks', crowns: -25, supplies: 15, standing: { mudlarks: 6 } },
      resultText: 'Two boys bring the sacks up the river steps after dark. Nobody asks for a receipt.',
    },
    {
      label: 'Report her to the toll-men',
      detail: "Ostrander's +6, Mudlarks −30. At −25 or worse, things go missing from your stores.",
      effects: { flags: ['met_mudlarks', 'pask_reported'], standing: { ostranders: 6, mudlarks: -30 }, npc: { id: 'pask', attitude: -40 } },
      resultText: "The toll-men raid the flats the next morning and find a warm brazier and nothing else. A week later Pask's people start taking an interest in your back door.",
    },
    {
      label: 'Not for us',
      detail: 'Mudlarks −2',
      effects: { flag: 'met_mudlarks', standing: { mudlarks: -2 } },
      resultText: '"Suit yourself." She goes back to haggling over the bell.',
    },
  ];
}

function bruneChoices(s: GameState): EventChoice[] {
  const c: (EventChoice | false)[] = [
    {
      label: "We'll fetch the salts.",
      detail: 'Adds the story contract "Salts for Saint Oda\'s". It pays little. Success: Saint Oda\'s +12, Lower Town +4.',
      effects: { unlockContract: 'fever_salts', flags: ['met_oda', 'salts_accepted'], npc: { id: 'brune', attitude: 10 } },
      resultText: '"Thank you. Bring dry sacks. The salt is no good once it\'s wet, and neither are the people carrying it."',
    },
    !s.flags.brune_q_bank && {
      label: 'Ask how the almshouse pays for its firewood',
      effects: { flag: 'brune_q_bank' },
      next: 'bank',
      resultText: '',
    },
    {
      label: 'Give her the money instead',
      detail: "−40 crowns, Saint Oda's +8",
      requires: { crowns: 40 },
      effects: { flag: 'met_oda', crowns: -40, standing: { oda: 8 }, npc: { id: 'brune', attitude: 5 } },
      resultText: 'She counts it, says a short prayer over it that is mostly about the apothecaries, and goes.',
    },
    {
      label: "We can't spare anyone.",
      detail: "Saint Oda's −4",
      effects: { flag: 'met_oda', standing: { oda: -4 }, npc: { id: 'brune', attitude: -5 } },
      resultText: '"No. Nobody can, this year." She puts your chairs back before she leaves.',
    },
  ];
  return c.filter(Boolean) as EventChoice[];
}

function mayneChoices(s: GameState, m?: Member): EventChoice[] {
  const loyal = (m?.loyalty ?? 0) >= 50;
  const c: (EventChoice | false)[] = [
    !s.flags.mayne_q_ford && {
      label: 'Ask what happened to the Ninth after the war',
      effects: { flag: 'mayne_q_ford' },
      next: 'ford',
      resultText: '',
    },
    {
      label: 'Match his offer',
      detail: `${first(m)}: wage +2, loyalty +15. The Ninth will remember being outbid.`,
      effects: { flag: 'ninth_active', member: { wage: 2, loyalty: 15 }, rival: 'ninth', rivalAggression: 0.1, npc: { id: 'mayne', attitude: -5 } },
      resultText: 'Mayne laughs and raises his cup to you. "Fair. I\'d have done the same." He is already looking round the room for someone else.',
    },
    {
      label: `Let ${first(m)} decide`,
      detail: `If ${first(m)}'s loyalty is under 50 (it is ${Math.round(m?.loyalty ?? 0)}), they go with Mayne.`,
      effects: loyal
        ? { flag: 'ninth_active', member: { loyalty: 10 }, npc: { id: 'mayne', attitude: 5 } }
        : { flag: 'ninth_active', member: { leaves: true }, rival: 'ninth', rivalRenown: 2, npc: { id: 'mayne', attitude: 10 } },
      resultText: loyal
        ? `${first(m)} thinks about it for a while, then thanks Mayne for the drink and says no. Mayne takes it well. He has had a lot of practice.`
        : `${first(m)} glances at Mayne and says they'll go. They come back for their things the next morning and can't quite look anyone in the eye.`,
    },
    {
      label: 'Remind them they are under contract',
      detail: `${first(m)}: loyalty −15. Mayne −10.`,
      effects: { flag: 'ninth_active', member: { loyalty: -15 }, npc: { id: 'mayne', attitude: -10 } },
      resultText: `${first(m)} goes quiet and finishes the drink. Mayne doesn't argue, but he writes your guild's name on the inside of his cuff.`,
    },
  ];
  return c.filter(Boolean) as EventChoice[];
}

function isbetChoices(): EventChoice[] {
  return [
    {
      label: 'Agreed',
      detail: 'Hobb & Daughters contest far fewer of your contracts. Marta must not find out.',
      effects: { flag: 'isbet_pact', rivalAggression: -0.1, npc: { id: 'isbet', attitude: 20 } },
      resultText: 'She writes the split on a beer mat, tears it in half and gives you one half. Then she pays for the beer.',
    },
    {
      label: 'Tell Marta about this',
      detail: 'Marta +20, Isbet −30. The Hobbs ease off a little.',
      effects: { flag: 'isbet_betrayed', rivalAggression: -0.1, npc: { id: 'marta', attitude: 20 }, npcs: [{ id: 'isbet', attitude: -30 }] },
      resultText: 'You send Marta a short note. She replies with a cake and a card that says "Thank you, dear." Isbet stops drinking at the Copper Kettle.',
    },
    {
      label: 'No arrangement',
      detail: 'Isbet −5',
      effects: { npc: { id: 'isbet', attitude: -5 } },
      resultText: '"All right." She finishes her cup. "It was a good offer. You\'ll work that out in about a year."',
    },
  ];
}

function askeChoices(): EventChoice[] {
  return [
    {
      label: "We'll do it.",
      detail: 'Adds the story contract "The Aske Silver". It is illegal and well paid. Success: Fourteen +14, Ostrander\'s −6, Heat +6.',
      effects: { unlockContract: 'aske_plate', flag: 'met_fourteen', npc: { id: 'aske', attitude: 15 } },
      resultText: 'She shakes your hand with both of hers and forgets to mention how much she is paying. It turns out to be a lot.',
    },
    {
      label: "Tell the bank's assessors",
      detail: "Ostrander's +8, Fourteen −20",
      effects: { flags: ['met_fourteen', 'aske_betrayed'], standing: { ostranders: 8, fourteen: -20 }, npc: { id: 'aske', attitude: -40 }, npcs: [{ id: 'vorn', attitude: 5 }] },
      resultText: 'The assessors reach Aske two days early and list every spoon. Lady Aske signs the inventory herself and sends you a copy, with your name underlined.',
    },
    {
      label: 'Not our business',
      detail: 'Fourteen −3',
      effects: { flag: 'met_fourteen', standing: { fourteen: -3 } },
      resultText: '"No, I suppose it isn\'t." She climbs back into the carriage, and it takes the driver three tries to get the horse moving.',
    },
  ];
}

export const CAST_STORY: EventDef[] = [
  {
    id: 'coster_interest',
    story: true,
    npcs: ['coster'],
    window: [3, 5],
    chance: 0.5,
    title: 'The Man with the Scales',
    speaker: 'Alderman Piet Coster',
    text: (s) =>
      'Alderman Piet Coster of the Weighhouse arrives with a clerk carrying a small brass balance in a velvet box. He sets it on your table, levels it with a coin and only then sits down.\n\n' +
      `"Your first payment on the note falls due in week six: ${s.loans[0]?.paymentDue ?? 48} crowns. I mention it because most new guilds forget, and then I have to send men, and the men charge me by the hour."\n\n` +
      'He taps the balance. "I also have a small job, if you want it."',
    choices: [
      { label: "What's the job?", effects: {}, next: 'job', resultText: '' },
      {
        label: "You'll have your forty-eight.",
        detail: 'Coster +2',
        effects: { npc: { id: 'coster', attitude: 2 } },
        resultText: '"Good." He packs the balance away himself and checks the clasp twice.',
      },
    ],
    nodes: {
      job: {
        speaker: 'Alderman Coster',
        text:
          '"Hesketh, on Fish Quay. He sells grain by the bushel, and I think his bushel is short by about a fifteenth. I can\'t prove it myself. He\'s Weighhouse and I\'m Weighhouse, and if I\'m seen sniffing round his store there will be a meeting about it. I hate meetings."\n\n' +
          '"Buy a sack and weigh it on honest scales, then get a look at the measure he keeps under the counter. If I\'m right, I\'ll take forty crowns off your note."',
        choices: [{ label: 'Who buys from Hesketh?', detail: '+1 Intel', effects: { intel: 1 }, next: 'who', resultText: '' }, ...costerChoices],
      },
      who: {
        speaker: 'Alderman Coster',
        text: '"Half the bakers in the Lower Town. That\'s why the loaves are small, and why your porters threw stones at my windows last spring." He doesn\'t seem to hold the stones against them.',
        choices: costerChoices,
      },
    },
  },
  {
    id: 'pask_chain',
    story: true,
    npcs: ['pask'],
    window: [6, 10],
    chance: 0.45,
    title: 'Under the Chain',
    text: (s) =>
      (fired(s, 'informant')
        ? 'The mudlark girl who sold you gossip comes back with a message. '
        : 'A girl from the river, filthy to the knees, brings you a message. ') +
      'Somebody wants to meet you on the flats under Fish Quay at low tide, and you are to wear old boots.\n\n' +
      'The somebody is a small woman in an oilskin coat, sitting on an upturned crate in the middle of the mud with a kettle on a brazier beside her. People around her are selling rope, nails, a ship\'s bell and most of a door.\n\n' +
      '"Wenna Pask," she says. "Tea? It\'s river water, but I boil it."',
    choices: [
      { label: 'Take the tea', effects: {}, next: 'pitch', resultText: '' },
      { label: 'Ask why she picked your guild', effects: {}, next: 'why', resultText: '' },
    ],
    nodes: {
      why: {
        speaker: 'Wenna Pask',
        text: (s) =>
          (s.flags.riot_fed
            ? '"You fed the Lower Town when the levy came in, and you didn\'t ask for anything." She shrugs. "Or you did, and Dagny\'s too proud to say. Either way, people down here like you."'
            : s.flags.riot_broken
              ? '"You broke heads in the bread market for the Exchequer, so you aren\'t squeamish. I find that useful in a friend."'
              : '"You\'re new and you\'re short of money. Those are the two things I look for in a friend."') +
          '\n\n"The bank takes a toll on everything that comes under the chain, your supplies included." She points her cup at a gap in the river wall, where the water runs shallow over shingle. "Not everything comes under the chain."',
        choices: paskChoices,
      },
      pitch: {
        speaker: 'Wenna Pask',
        text:
          '"The bank takes a toll on everything that comes under the chain: grain, wool, salt, your supplies." She points her cup at a gap in the river wall, where the water runs shallow over shingle. "Not everything comes under the chain."\n\n' +
          '"Buy through me and you\'ll pay what things are worth instead of what Ostrander\'s says they\'re worth. You\'ll also be breaking the treaty, but I don\'t think the treaty has ever done much for you."',
        choices: paskChoices,
      },
    },
  },
  {
    id: 'brune_salts',
    story: true,
    npcs: ['brune'],
    window: [8, 11],
    chance: 0.45,
    title: 'Fever Salts',
    speaker: 'Sister Agathe Brune',
    text:
      "A Sister from Saint Oda's is in your counting-room with her sleeves rolled up. She has already moved two of your chairs to get at the fire.\n\n" +
      '"I\'m Agathe Brune, the almoner, and you\'ll have to forgive me. It\'s colder in the almshouse than it is out there, and I\'ve forgotten what my hands feel like." She sits. "I\'ll be quick, because I\'ve left Sister Joan with forty people and one pot.\n\n' +
      '"The fen fever has come up the river. I need salts from the Saltfens to treat it, and the apothecaries want two crowns an ounce. God may forgive them for that, but I won\'t."',
    choices: bruneChoices,
    nodes: {
      bank: {
        speaker: 'Sister Brune',
        text:
          '"Some of it is the bank\'s money," she says. "Ostrander\'s gives to the almshouse every quarter. I preach against usury on Sunday, and on Monday I buy firewood with it."\n\n' +
          '"If that bothers you, you could always give me something better to burn."',
        choices: bruneChoices,
      },
    },
  },
  {
    id: 'mayne_offer',
    story: true,
    npcs: ['mayne'],
    window: [10, 14],
    chance: 0.45,
    title: 'An Offer for Your Best',
    speaker: 'Captain Rufus Mayne',
    member: (_s, m) => m.status === 'idle' && (FIGHTERS.includes(m.profession) || m.level >= 2),
    text: (_s, m) =>
      'There is a new company in Varrow. The Ninth have taken the whole upstairs of the Copper Kettle, and their captain has been buying drinks for half the city.\n\n' +
      `At the moment he is buying them for ${m?.name}. You find the two of them at a corner table, and Captain Rufus Mayne gets up to shake your hand before you've said anything.\n\n` +
      `"You'll be the guildmaster. I've been telling ${first(m)} what we pay. I won't lie to you: it's more than you do."` +
      (m?.traits.includes('veteran') ? `\n\n${first(m)} was at Cassel Ford, and so was Mayne. They have been talking about it for two hours.` : ''),
    choices: mayneChoices,
    nodes: {
      ford: {
        speaker: 'Captain Mayne',
        text: (_s, m) =>
          '"Disbanded," Mayne says. "Article nine of the treaty, which I\'ve always thought was a bit much. They paid us off in Crown Pennies, and a year later the Pennies were worth half."\n\n' +
          '"So we kept the name and went freelance. People will always pay soldiers. They just won\'t pay them on time."' +
          (m?.traits.includes('veteran') ? ` ${first(m)} nods. They were paid off the same way.` : ''),
        choices: mayneChoices,
      },
    },
  },
  {
    id: 'vorn_board',
    story: true,
    npcs: ['vorn'],
    after: ['ostrander_agent', 'silver_summons'],
    window: [10, 14],
    chance: 0.5,
    condition: (s) => !!s.flags.silver_accepted && !s.flags.silver_delivered && !s.flags.silver_lost,
    title: 'The Notice Board',
    speaker: 'Factor Vorn',
    text: (s) =>
      'Vorn calls in on her way back from the river, with ink on her fingers and a ledger under her arm.' +
      (s.flags.vorn_fixed_board
        ? ' She looks at your notice board first, sees that her correction has survived, and seems pleased.'
        : " She looks at your notice board first. 'Carriage' is still spelled wrong, so she takes out a pen and fixes it without asking.") +
      '\n\n"I hear you\'ve taken the Crown\'s silver," she says. "I\'d like to know when it leaves. The bank has a factor waiting at Anselm, and he hates waiting."',
    choices: (s) =>
      [
        {
          label: 'Tell her when the wagons leave',
          detail: "Ostrander's +6. The convoy will meet more trouble on the road.",
          effects: { standing: { ostranders: 6 }, flag: 'vorn_told', addTag: { template: 'silver_convoy', tag: 'soldiers' }, npc: { id: 'vorn', attitude: 10 } },
          resultText: 'She writes the date in her small book. "Thank you. That\'s very helpful." It occurs to you later that you have no idea who else reads that book.',
        },
        {
          label: 'Give her the wrong date',
          detail: 'Guile check. Failure: Vorn −10.',
          check: { approach: 'guile', difficulty: 13 },
          effects: {},
          failEffects: { npc: { id: 'vorn', attitude: -10 } },
          resultText: 'You give her a date a week out. She writes it down and thanks you.',
          failText: 'She writes it down, then looks at you over the book. "That isn\'t true, is it?" She doesn\'t seem angry, only interested.',
        },
        !!(s.flags.vorn_slip || s.flags.vorn_q_want) && {
          label: 'Ask her straight out whether the bank wants the silver to fail',
          detail: 'Vorn +5. Reveals a danger on the convoy.',
          effects: { flag: 'vorn_honest', revealContract: 'silver_convoy', npc: { id: 'vorn', attitude: 5 } },
          resultText: '"Some of the partners would prefer it," she says. "I wouldn\'t. A default makes a mess, and I\'m the one who has to clean it up." Before she goes, she tells you which stretch of the road she would worry about.',
        },
        {
          label: "Tell her it's guild business",
          detail: 'Vorn −3',
          effects: { npc: { id: 'vorn', attitude: -3 } },
          resultText: '"Fair enough." She leaves without correcting anything else.',
        },
      ].filter(Boolean) as EventChoice[],
  },
  {
    id: 'dagny_brother',
    story: true,
    npcs: ['dagny'],
    after: ['bread_riot'],
    window: [11, 15],
    chance: 0.5,
    condition: (s) => !!(s.flags.dagny_contact || s.flags.dagny_friend),
    title: 'Dagny Asks',
    speaker: 'Dagny Fell',
    text: (s) =>
      "Dagny comes in without knocking and doesn't sit down.\n\n" +
      '"My brother Ansel got himself caught under the chain with a boat full of wool. The bank\'s toll-men have him in the chain-house, and in ten days he goes on a cart to the galleys at Anselm." She looks at the floor and then at you. "I don\'t ask people for things. I\'m asking."' +
      (s.flags.dagny_friend ? "\n\nShe doesn't mention the bread. She doesn't need to." : ''),
    choices: (s) =>
      [
        {
          label: "We'll get him out.",
          detail: 'Adds the story contract "Ansel Fell at the Chain". Success: Lower Town +10.',
          effects: { unlockContract: 'ansel_chain', npc: { id: 'dagny', attitude: 10 } },
          resultText: '"Right." She nods once and leaves before either of you has to say anything else.',
        },
        !!s.flags.pask_deal && {
          label: 'Get him out, and ask Wenna Pask about the chain-house',
          detail: 'Adds the contract and reveals one of its dangers. Mudlarks +3.',
          effects: { unlockContract: 'ansel_chain', revealContract: 'ansel_chain', standing: { mudlarks: 3 }, npc: { id: 'dagny', attitude: 10 } },
          resultText: 'Pask knows the chain-house well, because two of her cousins have been in it. She draws you a plan on the back of a tide table.',
        },
        {
          label: 'Pay his fine',
          detail: '−90 crowns. Ansel is freed. Lower Town +6.',
          requires: { crowns: 90 },
          effects: { crowns: -90, flag: 'ansel_freed', standing: { lowertown: 6 }, npc: { id: 'dagny', attitude: 15 } },
          resultText: "The toll-captain counts the coins twice and lets Ansel out. He's thinner than Dagny and a lot less polite. She cuffs him round the ear in the street.",
        },
        {
          label: "We can't.",
          detail: 'Dagny −25, Lower Town −3. She stops sending you dock gossip.',
          effects: { unflag: 'dagny_contact', standing: { lowertown: -3 }, npc: { id: 'dagny', attitude: -25 } },
          resultText: '"No. I didn\'t think so." She goes. No more scraps of sacking come to the door after that.',
        },
      ].filter(Boolean) as EventChoice[],
  },
  {
    id: 'isbet_kettle',
    story: true,
    npcs: ['isbet'],
    after: ['hobbs_arrive'],
    window: [12, 16],
    chance: 0.45,
    title: 'The Copper Kettle',
    speaker: 'Isbet Hobb',
    text: (s) =>
      'A note in very small handwriting asks you to the Copper Kettle at the fourth bell. It is signed I. H.\n\n' +
      'Isbet Hobb is at the back with a pot of small beer and two cups. She pours for you before you sit down.\n\n' +
      '"There are about thirty river jobs a season," she says. "Mostly escorts and collections. My mother wants all thirty. I would settle for eighteen, and you would have the other twelve."' +
      (s.flags.hobbs_share ? '\n\n"I know you already pay us a quarter. This is a separate arrangement, between you and me."' : ''),
    choices: () => [{ label: 'Does your mother know you are here?', effects: {}, next: 'mother', resultText: '' }, ...isbetChoices()],
    nodes: {
      mother: {
        speaker: 'Isbet Hobb',
        text: '"She knows I drink here." Isbet turns her cup a quarter turn. "She\'s sixty-eight. In a few years I\'ll be running the firm, and I would rather start with an agreement than a feud. She would rather start with a feud. She always has."',
        choices: isbetChoices,
      },
    },
  },
  {
    id: 'plaice_inspection',
    story: true,
    npcs: ['plaice'],
    window: [12, 18],
    chance: 0.4,
    title: 'Clause Eleven',
    speaker: 'Master Assayer Corwin Plaice',
    text: (s) =>
      (s.facilities.stillroom
        ? 'A thin man with a leather satchel is standing in your stillroom when you come down in the morning. He has already taken the lids off three jars.\n\n"Corwin Plaice, Master Assayer. Your door was open, which under section four of the Reagents Charter counts as an invitation." He holds up a jar. "None of these are labelled to standard."'
        : s.start?.backer === 'college'
          ? 'A thin man with a leather satchel is waiting in your yard, reading the sign over your door.\n\n"Corwin Plaice, Master Assayer. I knew your founders at the college. I wrote the report on the fire." He looks over your hall. "I\'ve kept your guild on my list since the day you were chartered."'
          : 'A thin man with a leather satchel is waiting in your yard, reading the sign over your door.\n\n"Corwin Plaice, Master Assayer. I\'m making a list of the guilds in Varrow that use licensed magic." He looks over your hall. "You aren\'t on it yet. Everyone is, sooner or later."') +
      '\n\n"Under clause eleven, any guild that keeps reagents or keyed foci must hold a license from the Assay Office. The license is sixty crowns a year. The fine for not holding one is assessed at the time of inspection." He seems to enjoy saying "assessed".',
    choices: (s) =>
      [
        {
          label: 'Buy the license',
          detail: '−60 crowns. The Assay Office will not fine you.',
          requires: { crowns: 60 },
          effects: { crowns: -60, flags: ['assay_active', 'assay_licensed'], npc: { id: 'plaice', attitude: 10 } },
          resultText: 'He writes it out in full, reads it back to you, and charges you another crown for the wax.',
        },
        {
          label: 'Slip him something to forget your name',
          detail: '−25 crowns. Guile check. Success: counts as licensed. Failure: the money comes back, with Heat +6, and Plaice takes it personally.',
          requires: { crowns: 25 },
          check: { approach: 'guile', difficulty: 15 },
          effects: { crowns: -25, heat: 2, flags: ['assay_active', 'assay_licensed'] },
          failEffects: { heat: 6, flag: 'assay_active', rival: 'assay', rivalAggression: 0.2, npc: { id: 'plaice', attitude: -20 } },
          resultText: 'He looks at the coins for a long time, then puts them in his satchel and writes "licensed" next to your name in pencil.',
          failText: 'He gives the coins back, writes down exactly how many there were, and thanks you for the evidence.',
        },
        s.influence >= 3 && {
          label: 'Have the Exchequer stay the matter',
          detail: '−3 Influence. No license, so Plaice will be back, and less patient.',
          requires: { influence: 3 },
          effects: { influence: -3, flag: 'assay_active', rival: 'assay', rivalAggression: 0.15, npc: { id: 'plaice', attitude: -15 } },
          resultText: 'A letter from the Exchequer arrives the same afternoon. Plaice reads it twice, folds it into eighths and leaves without a word.',
        },
        {
          label: "We'll take our chances.",
          detail: 'The Assay Office may inspect you and fine you.',
          effects: { flag: 'assay_active' },
          resultText: '"Most people do," he says, and adds your name to the list.',
        },
      ].filter(Boolean) as EventChoice[],
  },
  {
    id: 'fenn_tapestry',
    story: true,
    npcs: ['fenn'],
    after: ['quarter_day'],
    window: [15, 20],
    chance: 0.45,
    title: 'The Last Tapestry',
    speaker: 'Lord Treasurer Fenn',
    text: (s) =>
      'Fenn comes to Tallow Street himself, on foot and without his clerks. He apologizes for that before anything else.\n\n' +
      (s.flags.silver_delivered
        ? '"You did us a great service with the silver. I\'m afraid I\'m here to ask for another, which is poor manners."'
        : s.flags.silver_lost
          ? '"You\'ll know we missed the payment. The bank has frozen the Crown\'s accounts on Quay Street, so I can\'t pay my own clerks."'
          : '"I know I gave the silver to Marta Hobb last time. I\'m told it arrived lighter than it left, which is my own fault for asking her."') +
      '\n\n"There is one tapestry left in the Exchequer. It\'s the Siege of Carrow, and it has hung in the great hall for two hundred years. A wool merchant in Harrowmere will pay four hundred crowns for it, provided nobody learns that the Crown is selling its walls. I need someone to take it there without being noticed."',
    choices: [
      {
        label: "We'll take it.",
        detail: 'Adds the story contract "The Exchequer\'s Last Tapestry". Success: Exchequer +8, Arrears −3.',
        effects: { unlockContract: 'last_tapestry', npc: { id: 'fenn', attitude: 10 } },
        resultText: '"Thank you." He looks at the floor. "Please don\'t let them fold it. It\'s very old."',
      },
      {
        label: 'Lend the Crown the money and keep the tapestry here',
        detail: '−150 crowns. It hangs in your hall. Exchequer +6, Renown +2.',
        requires: { crowns: 150 },
        effects: { crowns: -150, flag: 'tapestry_bought', standing: { exchequer: 6 }, renown: 2, npc: { id: 'fenn', attitude: 15 } },
        resultText: 'It takes four of your people to hang it. Fenn comes to see it the next week and stands in front of it for some time without saying anything.',
      },
      {
        label: "We can't help this time.",
        detail: 'Exchequer −3, Fenn −10',
        effects: { standing: { exchequer: -3 }, npc: { id: 'fenn', attitude: -10 } },
        resultText: '"No, of course." He thanks you for your time anyway, and walks home.',
      },
    ],
  },
  {
    id: 'aske_plate',
    story: true,
    npcs: ['aske'],
    after: ['quarter_day'],
    window: [17, 22],
    chance: 0.45,
    title: 'The Family Silver',
    speaker: 'Lady Honora Aske',
    text: (s) =>
      'A carriage that has seen better decades stops outside the hall. A woman in a very good coat with a very bad hem climbs down without waiting for the step.\n\n' +
      '"Honora Aske. Lady Aske, if you like, though nobody has said it with a straight face since the assessors came.' +
      (s.flags.silver_lost
        ? ' Since the Crown missed its payment, the bank has started listing what it\'s owed. They reach Aske next week."'
        : ' The bank is listing what it will take if the Crown ever misses a payment. They reach Aske next month."') +
      '\n\n"I would like my family\'s silver to be somewhere else when they arrive. There are two hundred years of it, and most of it has our name engraved on it. I\'m told this is illegal. I\'m also told you\'re short of money."',
    choices: () => [{ label: 'Why not sell it and pay the bank?', effects: {}, next: 'why', resultText: '' }, ...askeChoices()],
    nodes: {
      why: {
        speaker: 'Lady Aske',
        text: '"Because then it\'s just silver." She seems to think that is a complete answer, then tries again. "The castle can go. It\'s damp, and the roof costs more than I have. But I would like my grandchildren to eat off the same plates I did, even if they eat in a rented house."',
        choices: askeChoices,
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Follow-ups: fire once, when the world is in the right state
// ---------------------------------------------------------------------------

export const CAST_RANDOM: EventDef[] = [
  {
    id: 'marta_cake',
    npcs: ['marta'],
    title: 'A Cake from Hobb & Daughters',
    weight: 2,
    cooldown: 999,
    condition: (s) => fired(s, 'hobbs_arrive'),
    member: (_s, m) => m.level >= 3 && m.status !== 'mission',
    text: (s, m) => {
      const att = s.npcs.marta.attitude;
      const card =
        att >= 10
          ? `'Congratulations on the promotion, dear. Your mother must be proud. M. H.'`
          : att <= -20
            ? `'I hear ${first(m)} is doing very well. Do tell them to be careful on the roads. M. H.'`
            : `'With compliments on ${first(m)}'s progress. M. H.'`;
      return `A cake arrives from Hobb & Daughters, iced, with ${m?.name}'s name written on top in blue. The card says: ${card}\n\n${first(m)} wants to know how Marta Hobb knew, and so do you.`;
    },
    choices: (s, m) =>
      [
        { label: 'Eat it', detail: 'Everyone: morale +4', effects: { morale: 4 }, resultText: 'It is an excellent cake. Jory tastes it first on principle and says it\'s safe.' },
        {
          label: 'Send it back with a note',
          detail: 'Renown +1, Marta −5',
          effects: { renown: 1, npc: { id: 'marta', attitude: -5 } },
          resultText: `Marta replies by return. She thanks you for your note and asks after ${first(m)}'s mother, by name.`,
        },
        !!s.flags.met_oda && {
          label: 'Give it to the almshouse',
          detail: "Saint Oda's +3",
          effects: { standing: { oda: 3 } },
          resultText: 'Sister Brune cuts it into forty pieces and says a short prayer for Marta Hobb, which seems to satisfy everyone.',
        },
      ].filter(Boolean) as EventChoice[],
  },
  {
    id: 'hobbs_audit',
    npcs: ['isbet'],
    title: 'Isbet Checks the Books',
    speaker: 'Isbet Hobb',
    weight: 2,
    cooldown: 999,
    condition: (s) => !!s.flags.hobbs_share && s.week >= 14,
    text:
      "Isbet Hobb arrives with a ledger and spends the afternoon at your counting-room table, going through every contract you've taken since you sold her mother the share. She doesn't find anything wrong, and seems slightly disappointed.\n\n" +
      'When she has finished, she closes the ledger. "My mother would sell the share back. Two hundred and fifty crowns. She thinks you\'ll say no."',
    choices: [
      {
        label: 'Buy it back',
        detail: '−250 crowns. You keep all your contract pay again, and the Hobbs start competing in earnest.',
        requires: { crowns: 250 },
        effects: { crowns: -250, unflag: 'hobbs_share', rivalAggression: 0.25, npc: { id: 'isbet', attitude: 5 } },
        resultText: 'Isbet counts the money, writes a receipt and tears the old agreement in half in front of you. "She\'ll be annoyed," she says. "I\'m not."',
      },
      { label: 'Keep the arrangement', effects: {}, resultText: '"I\'ll tell her," Isbet says. "She\'ll be pleased. She likes being right."' },
    ],
  },
  {
    id: 'coster_bank',
    npcs: ['coster'],
    title: 'Coster Takes It Personally',
    speaker: 'Alderman Coster',
    weight: 2,
    cooldown: 999,
    condition: (s) => !!s.flags.bank_paid_loan,
    text: (s) =>
      "Alderman Coster comes to the hall with his scales and doesn't take them out of the box.\n\n" +
      '"I hear the bank holds part of your note now," he says. "I lent you that money when nobody else on the Weighhouse would.' +
      (s.flags.coster_terms ? ' I took twenty off it for you without being asked twice.' : s.flags.coster_job ? ' I gave you work.' : '') +
      ' I\'d like to know what I did wrong."',
    choices: [
      {
        label: 'Apologize, and promise the Weighhouse first call on your work',
        detail: 'Weighhouse +6, Coster +10',
        effects: { standing: { weighhouse: 6 }, npc: { id: 'coster', attitude: 10 } },
        resultText: '"Well." He thinks about it. "First call. In writing." You put it in writing, and he takes the scales out after all, to check your coins.',
      },
      {
        label: 'Tell him the bank offered a better rate',
        detail: 'Weighhouse −3, Coster −15',
        effects: { standing: { weighhouse: -3 }, npc: { id: 'coster', attitude: -15 } },
        resultText: '"It always is, at first," he says, and leaves the scales in the box.',
      },
    ],
  },
  {
    id: 'pask_strongbox',
    npcs: ['pask'],
    title: 'What Came Up in the Strongbox',
    speaker: 'Wenna Pask',
    weight: 2,
    cooldown: 999,
    condition: (s) => !!s.flags.met_mudlarks && !s.flags.pask_reported && s.week >= 13,
    text: (s) =>
      ((s.crierSeen ?? []).includes('strongbox') ? 'You heard about the strongbox the mudlarks pulled out of the river, the one that was empty. ' : '') +
      "Wenna Pask sends for you at low tide. She has a wet strongbox open on her crate, and she isn't drinking tea.\n\n" +
      '"It wasn\'t empty," she says. "Not quite. Somebody emptied it, threw it in and claimed the loss from the bank\'s insurers. But they left the lining in." She peels back the leather. Underneath is a folded page from a ledger, with a Weighhouse assay mark on every line and a signature at the bottom.\n\n' +
      '"Piet Coster," she says. "Who\'d have thought it."',
    choices: [
      {
        label: 'Buy the page',
        detail: '−40 crowns. It gives you a hold over Alderman Coster.',
        requires: { crowns: 40 },
        effects: { crowns: -40, flag: 'coster_ledger', standing: { mudlarks: 3 } },
        resultText: 'She folds it into a square of oilcloth for you. "Don\'t get it wet. It\'s the only thing in Varrow I\'d call evidence."',
      },
      {
        label: 'Trade gossip for it',
        detail: '−3 Intel. It gives you a hold over Alderman Coster.',
        requires: { intel: 3 },
        effects: { intel: -3, flag: 'coster_ledger' },
        resultText: 'She takes three pieces of gossip about the Weighhouse in exchange, and says two of them were new to her.',
      },
      {
        label: 'Leave it',
        detail: 'Mudlarks −1',
        effects: { standing: { mudlarks: -1 } },
        resultText: '"Your loss." She sells it to somebody else before the tide comes in, and you never find out who.',
      },
    ],
  },
  {
    id: 'coster_page',
    npcs: ['coster'],
    title: "Coster's Page",
    weight: 2,
    cooldown: 999,
    condition: (s) => !!s.flags.coster_ledger && !s.flags.coster_exposed,
    text: "Coster's page is in your strongbox. He has been very polite to you lately, which suggests that he knows.",
    choices: (s) =>
      [
        {
          label: 'Lean on him',
          detail: 'Loan −150. Weighhouse −3, Heat +3. Coster will never forgive you.',
          effects: { loan: -150, standing: { weighhouse: -3 }, heat: 3, npc: { id: 'coster', attitude: -30 } },
          resultText: 'You show him the page across his own counting table. He goes very still, then takes out a pen and reduces your note by a hundred and fifty crowns. His signature is not as neat as usual.',
        },
        {
          label: 'Hand it to the Weighhouse masters',
          detail: 'Weighhouse +8, Renown +2. Coster is finished in Varrow.',
          effects: { flag: 'coster_exposed', standing: { weighhouse: 8 }, renown: 2, npc: { id: 'coster', status: 'gone' } },
          resultText: 'The masters meet behind closed doors for a day and a half. Coster leaves for the coast the following week, with his scales.',
        },
        !!s.flags.ostranders_open && {
          label: 'Sell it to Vorn',
          detail: "+80 crowns, Ostrander's +6. The bank gains a hold over the Weighhouse (Leverage +3).",
          effects: { crowns: 80, standing: { ostranders: 6 }, clocks: { leverage: 3 }, npc: { id: 'coster', attitude: -20 } },
          resultText: 'Vorn reads it standing up and pays you exactly eighty crowns. "That\'s what it\'s worth to us," she says. "What it\'s worth to him is a different number."',
        },
      ].filter(Boolean) as EventChoice[],
  },
  {
    id: 'brune_donation',
    npcs: ['brune'],
    title: "The Bank's Gift",
    speaker: 'Sister Brune',
    weight: 2,
    cooldown: 999,
    condition: (s) => !!s.flags.met_oda && !!s.flags.ostranders_open && s.week >= 16,
    text: (s) =>
      'Sister Brune catches you outside the bread market with a letter in her hand.\n\n' +
      "\"Ostrander's has offered the almshouse five hundred crowns. That's a year of firewood and a roof that doesn't let the snow in.\" She hands you the letter. The last paragraph asks, very politely, that the Sisters stop preaching about the Debt.\n\n" +
      (s.flags.brune_q_bank ? '"You asked me once how I paid for the firewood. Now you know what it costs." ' : '') +
      '"What would you do?"',
    choices: [
      {
        label: 'Take the money',
        detail: "Saint Oda's +3, Ostrander's +4, Lower Town −4, Leverage +1",
        effects: { standing: { oda: 3, ostranders: 4, lowertown: -4 }, clocks: { leverage: 1 } },
        resultText: 'She takes it. The sermon that Sunday is about the virtue of patience, and nobody in the Lower Town is fooled.',
      },
      {
        label: "Refuse it, and we'll help with the firewood",
        detail: "−50 crowns. Saint Oda's +10, Lower Town +3",
        requires: { crowns: 50 },
        effects: { crowns: -50, standing: { oda: 10, lowertown: 3 }, npc: { id: 'brune', attitude: 15 } },
        resultText: "She sends the letter back with one line written under the bank's signature. Your people spend a cold afternoon carrying wood up the almshouse stairs.",
      },
      {
        label: 'Refuse it',
        detail: "Saint Oda's +4, Lower Town +2, Ostrander's −3",
        effects: { standing: { oda: 4, lowertown: 2, ostranders: -3 } },
        resultText: '"Good," she says. "I needed somebody to say it so I could stop arguing with myself." The almshouse is very cold that winter.',
      },
    ],
  },
  {
    id: 'fenn_letter',
    npcs: ['fenn'],
    title: 'A Letter from Fenn',
    weight: 2,
    cooldown: 999,
    condition: (s) => fired(s, 'bread_riot') && fired(s, 'silver_summons'),
    text: (s) =>
      'A short letter from Lord Treasurer Fenn, in his own hand:\n\n' +
      (s.flags.riot_broken
        ? '"My clerk tells me you cleared the bread market for us. I\'m grateful, and I\'m sorry it had to be your people who did it. The Lower Town has a long memory, and so, I find, do I."'
        : s.flags.riot_held
          ? '"My clerk tells me you held the bread market without drawing blood. I have spent six years telling the Council this was possible. Thank you for the demonstration."'
          : s.flags.riot_fed
            ? '"I hear you fed the Lower Town when the levy came in, at your own expense. Officially, the Exchequer can\'t approve. Unofficially, thank you. I wish we had done it."'
            : '"I hear you kept your doors shut during the bread riot. Very sensible. I wish I had been able to do the same."') +
      '\n\nIt is signed "A. Fenn", with no title.',
    choices: [
      { label: 'Write back', detail: 'Fenn +5', effects: { npc: { id: 'fenn', attitude: 5 } }, resultText: 'You write a short reply. A week later he answers that too, mostly about the weather.' },
      { label: 'File it', effects: {}, resultText: 'Jory files it under F, with the others.' },
    ],
  },
  {
    id: 'jory_page',
    npcs: ['jory'],
    title: 'A Page in the Roll',
    speaker: 'Jory Abbot',
    weight: 2,
    cooldown: 999,
    condition: (s) => s.members.some((m) => m.status === 'dead'),
    text: (s) => {
      const dead = s.members.filter((d) => d.status === 'dead').sort((a, b) => (b.diedWeek ?? 0) - (a.diedWeek ?? 0))[0];
      return (
        `Jory Abbot brings you the guild roll, open at ${dead?.name ?? 'the latest'}'s page. He has already written the date in the margin.\n\n` +
        '"The guildmaster before last used to strike the dead through," he says. "The one after him kept their pages and hung their names in the hall. I\'m only asking which you would like. I\'ll need more ink either way."'
      );
    },
    choices: [
      {
        label: 'Hang their names in the hall',
        detail: '−15 crowns. Everyone: morale +8',
        requires: { crowns: 15 },
        effects: { crowns: -15, morale: 8, npc: { id: 'jory', attitude: 10 } },
        resultText: 'Jory paints the board himself, slowly, in good letters. People stop in front of it on their way out to a job.',
      },
      {
        label: 'Strike them through',
        detail: 'Everyone: morale −3',
        effects: { morale: -3, npc: { id: 'jory', attitude: -10 } },
        resultText: 'He does it with a ruler, so that the line is straight.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Queued by the engine for a particular member, not drawn at random
// ---------------------------------------------------------------------------

export const QUEUED_EVENTS: EventDef[] = [
  {
    id: 'legend_named',
    title: 'A Name in the Streets',
    speaker: 'Jory Abbot',
    text: (_s, m) =>
      `People have started calling ${m?.name} something. Jory has heard two versions in the Copper Kettle, and asks which one should go in the roll.\n\n` +
      '"The other one will stick anyway," he says, "but it helps to have it written down."',
    choices: (_s, m) =>
      m
        ? epithetOptions(m).map((name) => ({ label: `"${name}"`, detail: 'The name the guild will use', effects: { member: { epithet: name } }, next: 'signature', resultText: `Jory writes it in the roll in his best hand: ${name}.` }))
        : [],
    nodes: {
      signature: {
        speaker: 'Jory Abbot',
        text: (_s, m) => `${first(m)} has done this long enough to have a way of doing it. Jory wants to know what the rest of the guild will learn to count on.`,
        choices: (_s, m) =>
          m
            ? signatureOptions(m).map((id) => ({
                label: SIGNATURES[id].name,
                detail: SIGNATURES[id].text,
                effects: { member: { signature: id } },
                resultText: `Within a month, the newer members are copying ${first(m)} without noticing.`,
              }))
            : [],
      },
    },
  },
];
