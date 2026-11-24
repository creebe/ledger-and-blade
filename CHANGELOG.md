# Changelog

Newest first. Each entry says what changed for a player, why (quoting the owner's feedback where it came from playtesting), and what was and wasn't checked. The live site is https://creebe.github.io/ledger-and-blade/ and is only republished on the owner's word; each entry notes whether it is live.

## v0.12.2 (2026-11-24): The look, decided
The owner asked to "take a good look at typography and the major colors such as the dark mode background color ... I want to make sure it's intentionally decided at this point." Every color and type choice is now written down with its reason in `docs/DESIGN-TOKENS.md`, and a test guards it.
- **Light theme.** Small grey notes, the Story gold and the good green are a shade darker, so all text reads at 4.5:1 or better. The look barely changes.
- **Dark theme.** Primary buttons (End Week, Dispatch, Hire) are a deeper red with light text: 5.7:1, up from 4.1. Red text and outlines, such as the active tab, are a touch brighter, so they read on cards.
- **Fonts.**
  - Italics use the body face's real italic instead of a slanted fake. That covers contract descriptions, street talk and empty states.
  - Bold is named as what it already rendered as: 600 for the body face, 700 for headings.
- **No change:** the dark background (#17130f, a warm near-black like an unlit hall), the surfaces, the faces and the size scale. They're now recorded as decisions.
- **Checked:**
  - `npm run check`.
  - A new theme test checks that every text color is 4.5:1 or better in both themes and that the two copies of the dark theme match.
  - Screenshots in both themes.
- **Not checked:** iOS Safari.
- **Live** (republished on the owner's word, 2026-11-24).

## v0.12.1 (2026-11-24): Colors in the Armory, and a new Heat icon
Materials and prices carry their colors in the Armory, and Heat has a new icon. The owner said: "I was thinking the icon colors would be present in the Armory views too. And can we change the Heat icon? The thermometer seems too silly."
- **Materials.** Iron, Leather, Timber and Reagents each have their own icon and color:
  - Iron: a slate ingot;
  - Leather: a tan hide;
  - Timber: a wooden log;
  - Reagents: a rose mortar.

  They show wherever materials appear: the Materials tab, recipe costs and building costs. The new drawings mean the colors never land on the Rough terrain tag, the Forge or consumables, which used to share those icons.
- **Prices.** Prices in the Armory and the Workshop show a small gold coin instead of the ◉ text. On red buy buttons, the coin sits on a pale disc so it stays readable. Cost chips put the coin after the number, as prices do.
- **Materials tab.** Its rows no longer squeeze: the buy and sell buttons sit on their own line.
- **Heat.** Heat is now a gauge creeping toward the red. The owner picked it from a third round of drawings, after the lantern and a rising chart didn't work.
- **Checked:**
  - `npm run check`.
  - Browser screenshots of the Shop, Materials and Workshop tabs, in dark and light.
  - The UI reviewer at 390 and 360 px: the new colors are 4.9–9.1:1 against the background, and nothing else picked up a material color.
- **Not checked:** iOS Safari.
- **Live** (republished on the owner's word, 2026-11-24).

## v0.12.0 (2026-11-24): Dates, and a careful end of week
A checkpoint you can reach in one sitting, a harder-to-fumble End Week, shortcuts to whatever you're short of, and colored resource icons. The owner asked for "a more tangible goal the player can strive for in shorter terms than the entire 4-year campaign ... something that the player can reasonably reach in a single play session", for missing-resource alerts to "bring us to a place where we can acquire the resource", for "a confirmation loop when ending a week", and for color on the resource icons.
- **Dates.** One dated checkpoint is always 3–6 weeks ahead, and the next is already in view.
  - **Where you see it:**
    - a pill under the week in the top bar;
    - a card at the top of the Hall;
    - a progress line under any resource it asks about;
    - the end-week summary and the week report;
    - a full Dates sheet with stakes and past results.
  - **How it resolves:** meet every target and it pays; miss one and it costs, and the dispatch says which target failed. The story can call one off.
  - **What's in it:** twelve Dates, from the Weighhouse's first collection to Marta Hobb's wager.
  - **Supporting changes:**
    - a Guildmaster's Note introduces them;
    - Council stances now lock in the week of the vote;
    - saves move to version 12.
- **Ending the week.** End Week opens a summary of what's locked in: warnings, squads leaving and returning, orders, bills, and the next Date. You confirm by pressing and holding, so a stray or double tap can't end the week.
- **Shortfalls lead somewhere.** When an action is blocked for lack of crowns, supplies, Intel, Influence or a material, the notice offers one tap to where you can get it, such as "Buy Iron" on the Materials tab. Short cost chips on buildings and crafts are links too.
- **Resource icons have color:** gold crowns, green supplies, blue Intel, violet Influence, teal Renown and orange Heat. The numbers keep their warning colors.
- **Also:**
  - the notice now shows inside the open sheet, just above its footer, instead of over the title;
  - the "Rewards (N)" pill no longer cuts off;
  - in the light theme, bad states are crimson, so they stand apart from the warning orange.
- **Checked:**
  - `npm run check`: 42 tests, the story checker clean, and no style flags in the new text.
  - The engine, story, writing, UI, balance and systems reviewers all ran, and their fixes are in.
  - Careful-bot first-year survival is 72% over 400 games, against 69% on main. That's within noise, and inside the 65–75% target.
  - Browser checks at 390 and 360 px in both themes, including touch, mouse and keyboard on the hold button.
- **Not checked:** iOS Safari and VoiceOver.
- **Live** (republished on the owner's word, 2026-11-24).

## v0.11.0 (2026-11-24): The UI audit, built
Fewer taps for the things you do every week, and colors, icons and type that mean one thing each. The owner asked for a UI/UX audit (`docs/audits/ui-ux.md`) and then to build every recommendation in it: "Go with all of your recommendations and proposals".
- **Fewer taps:**
  - The planner has a Best squad button, which takes a three-person contract from 6 taps to 4. When supplies are short, the planner offers to buy them and keeps the squad picked.
  - Weekly orders can be set from a chip on each Roster row, and the member sheet shows orders first.
  - The Realm has sub-tabs: Council, Powers, Rivals and The Debt.
  - Hall alerts, and "N to check" on the End Week bar, take you where they point.
  - Squads in the field are one-line rows on Contracts, so the Board stays on the first screen.
- **Clearer at a glance:**
  - Gold now means Story only, warnings are orange, and titles are ink instead of red.
  - Every icon has one meaning, and "Guard the hall" has its own.
  - Nine type sizes replace 30, and numbers in the heading font read correctly.
  - Crowns, weeks, minus signs and dates are written one way everywhere.
  - Resources are labelled in the first season, and Roster and Hall have badges.
- **Rules kept:** every purchase asks for confirmation, blocked buttons say why, small controls have bigger tap areas, and the notice no longer covers sheet content.
- **Renamed:** the Hall's "Debt" section is now The Loan.
- **Fixes:** the hire confirmation now uses the real upkeep, and "(s)" plurals are gone from game messages.
- Checked:
  - `npm run check` and the build pass.
  - The UI, writing and engine reviewers ran, and their fixes are in.
  - Browser checks at 390 and 360 px in both themes, on early, mid and late saves, with no console errors.
- Not checked:
  - iOS Safari.
  - The balance sim, because no numbers changed.
- Still open: while a sheet is open, the notice covers its title for about 3 seconds. In the light theme, the warning orange is still fairly close to the bad red.
- **Live** (republished on the owner's word, 2026-11-24).

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
