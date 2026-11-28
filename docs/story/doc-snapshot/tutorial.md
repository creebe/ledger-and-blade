## Guildmaster's Notes (tutorial objectives)

_how_ is the instruction; _why_ is the reason given; _available_ is the message shown while it is locked.

### First steps

| ID | title | how | why | available |
|---|---|---|---|---|
| `tutorial:first_contract` | Take your first contract | Open Contracts, tap a job, select a few members and press Dispatch. | Contracts are how the guild earns. Every week costs wages and upkeep. |  |
| `tutorial:read_odds` | Plan an expedition | Open a contract on the board and look over its plan. Then put someone else in the squad and watch the odds move. | Nobody can send orders once a squad has left. Everything that happens down there follows from the plan. |  |
| `tutorial:look_ahead` | Look at the next Date | Tap the Date under the week in the top bar to see what it asks for and what it pays. | A Date is a few weeks off. Meeting its targets pays, and missing one costs. |  |
| `tutorial:end_week` | End the week | Press End Week to see what's about to happen, then hold the button at the bottom to confirm. Everything you set in motion resolves at once. | The game moves a week at a time. Squads travel, wages are paid, the world changes. |  |

### Your people

| ID | title | how | why | available |
|---|---|---|---|---|
| `tutorial:orders` | Give an idle member orders | Roster → tap a member → under “This week”, choose Gather rumors, Train or Dock labor. | Members at home can earn Intel, crowns or skill instead of just resting. |  |
| `tutorial:gear` | Change someone’s gear | Roster → tap a member → tap a gear slot and pick an item. Buy more in the Armory. | The right weapon or kit for the job can swing the odds a long way. |  |
| `tutorial:journal` | Read an expedition log | When a squad is home, tap Watch in the week report, or its card on the Contracts tab. | The log shows the line where the trap went off because nobody packed tools, and the meal that didn’t happen. | [IF history.length + missions.filter((m) => m.report).length > 0] {true} [ELSE] Finish a mission first [END] |

### Knowing what you face

| ID | title | how | why | available |
|---|---|---|---|---|
| `tutorial:reveal` | Uncover a hidden danger | Tap a dashed “?” tag on a contract to spend Intel, or set a member to Scout a contract. | Knowing what you face tells you what to pack and who to send. |  |
| `tutorial:counter` | Send a squad prepared for a tag | Give a squad member a counter for one of the job’s known tags (a lantern for Dark, a fur cloak for Cold, remedies for Swamp) before they set out. | A countered tag stops costing the squad: no darkness without a lantern’s light, no extra wear from the cold or the mud. |  |
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
