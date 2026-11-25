# Expeditions: the engine API for the UI

This is the surface the Field UI (workstream 2) builds on. Everything here is exported from `src/engine/index.ts`. The engine code lives in `src/engine/expeditions/`. The design is in `docs/EXPEDITIONS.md` and `docs/PROPOSAL-EXPEDITIONS-IN-MAIN.md`.

The engine session keeps this API stable. If something has to change, it messages main first.

## The idea in four lines

- A contract on the board is now a **posting**: a site, a route length, a goal and a patron (`contract.expedition`).
- The player **prepares** a plan (squad in ranks, pack, standing orders) and **dispatches** it. The squad waits in the yard until End Week, and can still be re-geared or called off.
- At that End Week the trip is **sealed**: simulated in full, deterministically. Its log lines are tagged with the trip week they belong to.
- Each End Week **reveals** one more week of every squad's log. When the last week is revealed, the squad is home and the contract is settled.

## Records

### `Mission` (alias `Expedition`)

A squad out on a contract. These live in `state.missions` while out, and in `state.history` (the last 30) once home.

| Field | Meaning |
|---|---|
| `id` | |
| `number` | The squad's number while it is out: 1, 2 or 3. Use it for the badge in a merged feed. Numbers are reused once a squad is home. |
| `contract` | The posting it answers. `contract.expedition` holds `{ site, length, goal }`. |
| `plan` | `ExpPlan`: `squad` (member ids, rank 1 first), `pack`, `orders`. |
| `memberIds` | Same as `plan.squad`. |
| `dispatchedWeek` | The game week it was dispatched. |
| `plannedWeeks` | How long it should take, road included. Show this, not `result.weeks`. |
| `sealed` | `false` while the squad is still in the yard (its dispatch week). |
| `returnWeek` | The game week whose End Week brings them home. **Don't show it before they're home**: an early `returnWeek` gives away a retreat or a wipe. |
| `result` | The sealed outcome without its log: `outcome`, `deepest`, `roomsCleared`, `roomsPlanned`, `weeks`, `loot`, `members`, `kills`, `deeds`, `goalMet`, `squad` (ids in rank order) and `names`. **Spoilers**: only read it once `report` is set. |
| `report` | Set when they're home: `tier`, `summary` (lines), `casualties`, `wounded`, `reward`, and `trip` (a `TripSummary`). |
| `setup` | The frozen inputs the log is rebuilt from. Treat it as opaque. |
| `fieldLog`, `ambush` | What a door scene added, and a rival waiting on the road home. |

### `LogLine`

| Field | Meaning |
|---|---|
| `text` | The line. |
| `kind` | `road`, `zone`, `room`, `fight`, `hit`, `miss`, `enemy`, `heal`, `trap`, `find`, `camp`, `fatigue`, `exposure`, `down`, `death`, `win`, `retreat`, `supply`, `deed`, `end`. |
| `big` | A line that matters: a death, a Sink change, a boss in sight, a retreat. Bold it. Watch together pauses the other squads on these. |
| `note` | A short number after the line: damage, healing, supplies used. |
| `week` | The trip week, 1-based. |
| `t` | Where in its week the line falls, from 0 to 1. Interleave several squads by `t`. |
| `room`, `zone` | The room (0-based) and zone, or undefined on the road. |
| `squad` | `SquadSnap` after the line: arrays in rank order (`hp`, `maxHp`, `fatigue`, `exposure`, `fever`, `state`). `state` is `ok`, `spent`, `out` (carried), `down` or `dead`. |
| `enemies` | `EnemySnap[]` during a fight: `monster`, `name`, `hp`, `maxHp`. |

## Reading a squad

| Function | Returns |
|---|---|
| `expeditionLog(ms)` | The whole log, rebuilt from `ms.setup` and cached. **Contains the future**: filter it, or use `visibleLog`. |
| `revealedWeeks(s, ms)` | How many trip weeks the player has seen: 0 while in the yard, and all of them once home. |
| `visibleLog(s, ms)` | The lines the player may read so far. |
| `weekLines(ms, tripWeek)` | One trip week's lines. |
| `tripWeekOf(ms, gameWeek)` | The trip week that the End Week of `gameWeek` revealed, or 0. After End Week, the week just ended is `s.week - 1`. |
| `weekSummary(ms, tripWeek)` | `{ rooms, fights, finds, down, dead, home, text }`. `text` reads like "4 rooms, a fight, Brenna went down". This is the Down below row. |
| `squadStatus(s, ms)` | For a squad card: `{ number, site, zone, room, rooms, latest, squad, names, revealed, plannedWeeks, home, preparing }`. `latest` is the last visible line and `squad` its snapshot. |
| `feedForWeek(s, gameWeek, missions?)` | The merged feed for Watch together: `{ missionId, number, line }[]` for every squad that week, sorted by `t`. It covers squads out and the last three home. |
| `awaySquads(s)` | Missions not yet home. |
| `squadsOut(s)`, `squadLimit(s)` | Squads out now (the yard included), and the most allowed: 2, or 3 with a Muster room (`level(s, 'muster') >= 1`). |

## Preparing and dispatching

| Function | Use |
|---|---|
| `suggestPlan(s, contract, orders?)` | A sensible plan: the healthiest squad in sensible ranks and a pack for the route. |
| `planBlocked(s, contract, plan)` | Why it can't go (a string), or undefined. Use it with `Btn`'s `blocked`. |
| `planWarnings(s, contract, plan)` | Plain warnings: short of food or oil, a member out of rank, hurt, tired, close to a Sink change, a payment due while away. |
| `memberBlocked(s, member)` | Why one member can't go (away, badly hurt, in bed with the fever). |
| `squadSize(contract)` | `{ min, max }`, with at most 4 ranks. |
| `packSlots(pack)`, `slotsFor(id, n)`, `EXP_TUNING.packSlots` | 12 slots. Each supply has its own `perSlot`. |
| `stockOf(s, id)`, `packCost(s, pack)`, `supplyUnitPrice(s, id)` | What's at home, and the crowns to buy the rest. Food is the guild's `supplies`; the other six are in `s.stores`. |
| `dispatchExpedition(s, contractId, plan)` | Buys the pack's shortfall, takes the pack from the stores, seals a first simulation, and may open a door scene (`pendingEvents`). Returns an error string or undefined. |
| `cancelDispatch(s, missionId)` | Calls off a squad still in the yard: the pack goes back and the contract returns to the board. A squad whose door scene has fired can't be called off. |
| `buyStores(s, id, n)` | Buy pack supplies ahead of time. |
| `postingInfo(s, contract)`, `goalText(contract)`, `contractRoute(contract)`, `plannedWeeks(s, contract)` | What the board shows: site name, zones, length, weeks and the goal in words. |

## At home

| Function | Use |
|---|---|
| `sellGoods(s, good?)`, `goodsValue(s)` | Loot comes home as `s.goods` (sold at the market) or straight into `s.materials` (iron, leather, timber, reagents). |
| `treatExposure(s, memberId)` | Saint Oda's fever beds: −40 Exposure for 30 crowns. |
| `delverMaxHp`, `delverOf(s, member)` | A member's dive HP and their frozen dive stats. |

Members have new fields: `exposure`, `changes` (Sink changes), `fever`, `scars`, `habits` and `kills`. `health` stays 0–100 as before; the dive turns it into hit points and back.

## Content

`SITES` (each with its zones, `goals` per length, `deep` and `boss`), `ZONES`, `MONSTERS` (`boss: true` for the six site bosses and the Kiln), `GOODS`, `SUPPLIES`, `SCARS`, `HABITS`, `CHANGES`, `DELVER_PROFS` (ranks and skills for all eight Professions), `LENGTHS`, `routeOf(site, length, goal?)` (a plain job's long route stops short of the boss), `TAG_DIVE` (what a contract's dangers do down there).

## Timing, worked through

A squad is dispatched in week 10 for a trip of about 2 weeks.

1. **Week 10, during the player's turn.** `sealed` is false and `revealedWeeks` is 0. The squad is in the yard. A door scene may be waiting.
2. **End Week of 10.** The trip is sealed with the squad as it is now. Then trip week 1 is revealed. The week report can show `weekSummary(ms, 1)`, and `feedForWeek(s, 10)` is the merged feed.
3. **End Week of 11.** Trip week 2 is revealed. If that was the last week, the squad is settled: members updated, loot and pay in, `report` set, and a `mission` dispatch with `missionId` added. Then the record moves to `history`.

A trip that ends early (a retreat or a wipe) simply has fewer weeks. The player finds out when the week is revealed, never before.

## Saves

`SAVE_VERSION` is 14. Version 13 saves turn `delve.kilnBroken` into `delve.bossesBeaten` (`['pellam']` if the Kiln was broken); trips sealed before that still replay the same, because the dive reads the old flag for Old Pellam. `migrateSave` brings classic saves across. Members get the new fields at zero, and every board contract gets its expedition. A squad already out comes home when it was due, with the job done and a single line: "The road was quiet."
