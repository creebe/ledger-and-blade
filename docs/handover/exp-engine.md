# Hand-over: exp-engine (workstream 1, v0.13.0)

Expeditions in the full game, the engine merge. Branch `claude/exp-engine`; the PR is "Expeditions in the full game: engine (v0.13.0)". Nothing is merged or deployed.

## What was done

- **The trial's dive is the engine for every contract.** `src/engine/expeditions/` holds the simulation (`dive.ts`), each trip's life (`run.ts`), planning (`prep.ts`), classic items as dive gear (`gear.ts`), the save migration (`migrate.ts`), types and tuning.
- **Contracts are postings** with `contract.expedition = { site, length, goal }`.
  - Classic templates take the site of their region and a length from their threat. Distant sites cap at medium.
  - Eight Old Pellam templates (`pellam_*`) turn the trial's sponsors into board work: kill, bring, reach and the Kiln Engine.
- **Sites:** Old Pellam is complete. Varrow, Kell Mines, the Saltfens, Drover's Road, Harrowmere and Port Anselm each have one zone, with monsters, finds, traps and log lines. Contract tags bring fights and conditions (`TAG_DIVE`).
- **All eight Professions fight.** The Envoy and the Infiltrator are new in the dive.
- **Several squads at once:** two, or three with a Muster room (a new facility).
  - The squad waits in the yard in its dispatch week, when it can be re-geared or called off.
  - At End Week the trip is sealed and simulated in full.
  - Each End Week reveals one more week of its log.
  - When the last week is revealed, the squad is settled: members, loot, pay, effects, facts, fame and morale.
- **Logs aren't stored.** A trip keeps its frozen inputs and outcome, and `expeditionLog()` replays the log on demand. That keeps saves small with three squads out.
- **Wired in:**
  - door scenes (the classic road scenes, before sealing);
  - rival ambushes on the road home;
  - contested jobs, so a rival is ahead in the site;
  - ops against rivals;
  - the Weighhouse waiting up to three weeks for an away squad, after selling goods;
  - Legends (fame from tiers and dive deeds);
  - Dates (successes still count);
  - Sink fever and Exposure at home, and Saint Oda's treatment.
- **Saves:** `SAVE_VERSION` 13. Version 12 saves gain the new fields. A squad already out comes home when it was due, as a Success with "The road was quiet."
- **Minimal UI:**
  - the prep sheet (`PrepSheet.tsx`) replaces the Planner;
  - the single-squad log (`ExpLogSheet.tsx`) replaces the mission replay;
  - squad cards on the Contracts tab;
  - Down below rows with Watch in the week report;
  - expedition stores and goods in the Armory shop;
  - Exposure, marks and Saint Oda's on the member sheet.
- **The engine API for the Field UI** is `docs/EXPEDITIONS-API.md`.

## What was checked

- `npm run check`: types, 52 tests (8 new in `tests/expeditions.test.ts`, including every site walked with no missing lines, and the v12 migration), the story checker at 0 violations, and the style checker (advisory).
- `npm run sim` (100 games, 48 weeks). The table is in `docs/EXPEDITIONS.md` §9c.
  - Careful bot: **72%** first-year survival and **0.10 deaths per expedition** (1.9 deaths a year).
  - Poor prep: 1% survival and 0.71 deaths per expedition.
  - The balance reviewer raised Old Pellam's pay fourfold, so it is worth the risk. Expeditions now take at least two people, and contracts below threat 3 are scaled no lower than 0.93 of base.
- `npm run fingerprint` changed. That's expected: this is not a pure refactor.
- Browser at 390×844: contracts, the log, prep, confirm, the yard, End Week and the report, with no console errors.

## What's open

- **For workstream 2 (Field UI):** the Field tab, Watch together (use `feedForWeek`), the expedition board in place of the contract board's odds, rumoured tags, and the hall notifications.
- **For workstream 3 (story):** the story contracts are walked on their region's thin site with a "walk the route" goal. Bespoke story sites and the story checker's "completable with the starting roster" check are still to do.
- **For workstream 4 (sites):** each thin site has one zone. Silhouettes for the new monsters and for the Envoy and Infiltrator borrow existing ones.
- **For workstream 5 (economy):** pack supplies (`s.stores`) are bought, not crafted. Taproom, site decrees and rival crews aren't done.
- **Balance:**
  - The cautious bot goes bankrupt because it takes too little work.
  - Old Pellam's long routes are a gamble from a fresh guild.
  - Deaths are much higher than in the classic game (about 2 a year for a careful player, against 0.1). That's intended, but the owner should feel it.
- **Names for main to approve:** Varrow (zone "the Lower Town") and Port Anselm (zone "the Wenmouth road") as sites, and the generic enemies thug, sell-sword, guard, hedge-wizard, troll, salamander, rioter and hill wolf.
