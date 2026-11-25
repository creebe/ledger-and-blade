## Guildmaster's Notes (tutorial objectives)

_how_ is the instruction; _why_ is the reason given; _available_ is the message shown while it is locked.

### First steps

| ID | title | how | why | available |
|---|---|---|---|---|
| `tutorial:first_contract` | Take your first contract | Open Contracts, tap a job, select a few members and press Dispatch. | Contracts are how the guild earns. Every week costs wages and upkeep. |  |
| `tutorial:read_odds` | Ask “Why?” about the odds | Open a contract, select at least one member, then tap “Why?” next to a phase’s odds bar. | Every percentage is built from your squad’s score against the job’s difficulty. Knowing why tells you how to improve it. |  |
| `tutorial:look_ahead` | Look at the next Date | Tap the Date under the week in the top bar to see what it asks for and what it pays. | A Date is a few weeks off. Meeting its targets pays, and missing one costs. |  |
| `tutorial:end_week` | End the week | Press End Week to see what's about to happen, then hold the button at the bottom to confirm. Everything you set in motion resolves at once. | The game moves a week at a time. Squads travel, wages are paid, the world changes. |  |

### Your people

| ID | title | how | why | available |
|---|---|---|---|---|
| `tutorial:orders` | Give an idle member orders | Roster → tap a member → under “This week”, choose Gather rumors, Train or Dock labor. | Members at home can earn Intel, crowns or skill instead of just resting. |  |
| `tutorial:gear` | Change someone’s gear | Roster → tap a member → tap a gear slot and pick an item. Buy more in the Armory. | The right weapon or kit for the job can swing the odds a long way. |  |
| `tutorial:journal` | Read a mission journal | When a squad’s job is done, tap “Read the mission report” in the week report or the Hall. | The journal shows who led, what worked, and what gear would have done better. | [IF history.length + missions.filter((m) => m.report).length > 0] {true} [ELSE] Finish a mission first [END] |

### Knowing what you face

| ID | title | how | why | available |
|---|---|---|---|---|
| `tutorial:reveal` | Uncover a hidden danger | Tap a dashed “?” tag on a contract to spend Intel, or set a member to Scout a contract. | Unknown tags turn your odds into a range. Knowing tells you what to bring. |  |
| `tutorial:counter` | Send a squad prepared for a tag | Give a squad member a counter for one of the job’s tags (a lantern for Dark, fur cloak for Cold, remedies for Swamp) before dispatching. | Countering a tag removes its penalty. The planner shows “Prepared for” when it works. |  |
| `tutorial:supplies` | Buy supplies | Armory → Shop → buy supplies (bigger orders are cheaper). Everyone eats one a week, and squads carry their own. | Hungry members lose morale. Running out mid-crisis is how guilds fail. |  |

### The city

| ID | title | how | why | available |
|---|---|---|---|---|
| `tutorial:court` | Court a faction | Realm → Powers of Varrow → “Court them” on any faction. | Standing changes what work you’re offered, what things cost, and whether you keep your charter. | [IF influence >= 3] {true} [ELSE] Needs 3 Influence (from contracts and events) [END] |
| `tutorial:spy` | Learn your rival’s plans | Realm → Rivals → “Learn their plans”. | Hobb & Daughters take contracts, poach members and spread rumors. Some of it can be stopped. |  |
| `tutorial:council` | Take a stance at the Council | Realm → The Council of Varrow → choose Support or Oppose on a decree. | Decrees change prices, pay and the debt for a whole season. You can move votes. | [IF council.agenda.length] {true} [ELSE] The Council posts its agenda in week 7 of each season [END] |

### Building the guild

| ID | title | how | why | available |
|---|---|---|---|---|
| `tutorial:hire` | Hire a recruit | Roster → Hiring Hall → Hire. Watch your weekly costs. | More people means more jobs at once, and the right Profession for each job. |  |
| `tutorial:build` | Start a building | Hall → Buildings → tap one and Build. Members on “Build” speed it up. | Buildings heal, train, spy, shorten trips and let you craft, at a weekly upkeep. |  |
| `tutorial:craft` | Craft something | Armory → Workshop. You need a Forge or Stillroom, and materials from missions or the market. | Crafting turns loot into gear for far less than market prices. | [IF (facilities.forge ?? 0) + (facilities.stillroom ?? 0) > 0] {true} [ELSE] Build a Forge or Stillroom first [END] |
| `tutorial:repay` | Pay down the loan early | Hall → The Loan → Repay. Early payments cut the interest that piles up every week. | Three missed payments and the Weighhouse seizes everything. |  |
