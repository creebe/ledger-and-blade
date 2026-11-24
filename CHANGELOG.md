# Changelog

Newest first. Each entry says what changed for a player, why (quoting the owner's feedback where it came from playtesting), and what was and wasn't checked. The live site is https://creebe.github.io/ledger-and-blade/ and is only republished on the owner's word; each entry notes whether it is live.

## v0.10.2 (2026-11-24): A little more pay
Every contract pays about 10% more, which makes the first year a little more forgiving. The owner asked to ease difficulty back toward where it was before the new cast and rivals: "Yes, please ease it back toward 70%."
- Contract pay goes from ×1.5 to ×1.65 (`REWARD_SCALE` in `core/tuning.ts`). Nothing else changes. The target range in the guide and the balance reviewer moves from 55–65% to 65–75%.
- Checked:
  - Balance bot over 400 games: careful bot's first-year survival went from 58% to 69%, and the middle bot's from 54% to 64%. Average deaths stay low (0.06 a year for the careful bot).
  - A sweep over 300 games put ×1.6 at 67% and ×1.7 at 75%.
  - Tests, the story checker and the build pass.
- Not checked: a real player's feel for it. Bankruptcy is still the main way to lose.
- **Live** (republished on the owner's word, 2026-11-24). This deploy also brought v0.8.2 to v0.10.1 to the live site.

## v0.10.1 (2026-11-24): Clean house
No change to how the game plays. The owner asked for "a thorough code clean up pass and reorganize anything necessary to make it easier to continue development".
- The engine is in area folders (core, people, missions, economy, politics, rivals, story, data), and the screens are in kit, screens, sheets and panels. The two catch-all files (`world.ts` and `turn.ts`) are split up, and the weekly turn is a list of named phases.
- Headline balance numbers live in `src/engine/core/tuning.ts`. One scene registry replaces three copies. Dead code removed.
- New tooling: `npm run check` (types, tests, story checker, style checker) and `npm run fingerprint` (proves a refactor changed nothing). GitHub runs the checks on every pull request.
- A project guide (`CLAUDE.md`), an architecture map, this changelog, a backlog, the version on the title screen, and reviewer agents for each area of the game.
- Two small visible fixes found by the UI reviewer: confirming a rival operation now says what you have as well as what it costs, and the version line on the title screen wraps neatly on narrow phones.
- Checked:
  - The behaviour fingerprint over 40 seeded 60-week games is identical before and after.
  - Tests, the story checker and the build pass.
  - The engine reviewer and the UI reviewer both reviewed the change. The UI reviewer compared every screen with the previous version at 390 and 360 wide: they match pixel for pixel apart from the title line, with no console errors.
- Not live.

## v0.10.0 (2026-11-24): Starts, Legends and wars
- **Varied starts.** Each campaign rolls a backer (old soldiers, a Weighhouse merchant, a Lower Town co-op or disgraced Arcanists) and four circumstances (the Debt, the market, politics and the rivals' mood), with a re-roll and a seed on the new-guild screen. Scenes react to the start.
- **Legends.** Members earn fame from deeds; Known, Renowned and Legendary tiers; the street names a Legend and they gain a signature ability. About one per campaign, in year two.
- **Guild wars.** Feuds with each rival (competition, feud, open war). Your operations: spies, smears, hiring away their people, hitting their jobs, raids and assassinations of their leaders. Their moves: spies, ambushes, theft, bribes, arson and murder. Defenses: guarding the hall, the Spymaster's Den, scouts, loyalty, searching for spies, truces and pacts.
- The owner asked for these ("legendary heroes", "inter-guild wars", "randomness to the start of each new campaign"), with no limits on who can be killed and fully random starts.
- Checked: tests, story checker, balance bot (first-year survival 59–63%). Not live.

## v0.9.0 (2026-11-24): A deeper cast, in a new voice
- Every faction and rival has a face: Alderman Coster, Sister Brune, Wenna Pask, Lady Aske, Captain Mayne, Master Assayer Plaice and Jory Abbot, the hall's clerk. Act I grows from 7 to 17 scenes, plus follow-ups that react to earlier choices.
- Saint Oda's, the Fourteen and the Mudlarks become active factions once met; the Ninth and the Assay Office join Hobb & Daughters as rivals.
- All game text rewritten in complete sentences with dry wit (the owner: "I do enjoy Darkest Dungeon, but I do not want you to resort to overusing sentence fragments").
- Checked: tests, story checker, style checker. Not live.

## v0.8.2 (2026-11-23)
Collectable note rewards, sticky odds in the planner, full-height panels with Back, and a writing-style pass. Not live.

## v0.8.1 (2026-11-23)
Clearer tap targets, bulk supply discounts, renamed Armory tabs. Was the live version until v0.10.2.

## v0.8.0 (2026-11-23)
The Journal (notes, Codex, Chronicle), lore through play and street talk, a compact roster and a sortable strength grid.

## v0.7.0 (2026-11-23)
Guildmaster's Notes: guided objectives that introduce every system.

## v0.6.0 (2026-11-23)
The Council of Varrow: seasonal decrees, lobbying and votes.

## v0.5.0 (2026-11-23)
Buildings and crafting; color reserved for meaning.

## v0.4.0 (2026-11-23)
Decisions in the field: road encounters and arrival reports.

## v0.3.0 (2026-11-23)
Story safeguards (typed facts, the story checker) and the icon set.

## v0.2.0 (2026-11-23)
Story conversations, expedition journals, dark mode by default.

## v0.1.0 (2026-11-23)
The first playable slice: the weekly loop, members, contracts, the squad planner, gear, missions, factions, the Debt clocks and Hobb & Daughters.
