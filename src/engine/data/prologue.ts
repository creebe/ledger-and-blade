// The prologue: a few pages read before the first new guild, setting the scene.
// Told by the narrator, not by a character, so it may say what any Varrow
// resident would already know (docs/STORY.md §6b). Shown once per device and
// kept a tap away on the title and start screens.

export interface ProloguePage {
  title: string;
  paragraphs: string[];
}

export const PROLOGUE: ProloguePage[] = [
  {
    title: 'The Debt',
    paragraphs: [
      'Twenty-two years ago, King Aldric lost a war at Cassel Ford. The treaty that ended it binds the realm to repay about four million crowns to Ostrander\'s, the foreign bank that paid for the other side\'s army, one quarter at a time, for as long as it takes.',
      'If the Crown misses a payment, the bank may collect however it likes. To make sure it never misses one, the Crown has sold the royal forests, the river tolls, half the royal plate and most of the Exchequer\'s tapestries. Quarter-day comes round again in a few weeks.',
    ],
  },
  {
    title: 'Varrow',
    paragraphs: [
      'Varrow is the capital, a port on the river with a chain across it. The tolls taken at the chain go to the bank now. Below the walls lies the Lower Town, home to the porters and small trades. They pay the taxes that pay the bank, and they are not in a patient mood.',
      'Everyone in Varrow owes someone. That makes for a great deal of work, and a fair amount of it needs a blade.',
    ],
  },
  {
    title: 'The Guilds',
    paragraphs: [
      'The treaty also cut the Crown\'s regiments down to almost nothing. The work soldiers used to do is let out by the job now, to anyone holding a charter from the Exchequer: chasing debts, guarding the Crown\'s silver on the road, clearing the old town buried under the Lower Town, and whatever else the bank, the Crown, the Weighhouse or the Lower Town will pay for this week.',
      'A chartered guild takes the work, sends its people out in squads and splits the pay. Some guilds last for years, but most fold before their first loan is paid off.',
    ],
  },
  {
    title: 'Your Guild',
    paragraphs: [
      'This morning the Exchequer sealed your charter. You have a drafty hall on Tallow Street and a handful of people who expect to be paid every week. The Weighhouse lent you the money for both, and it will want it back on time.',
      'Your work is to keep the books balanced and as many of your people alive as you can manage. First, though, someone had to back you, and Varrow has its own troubles this season.',
    ],
  },
];
