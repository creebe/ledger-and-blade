# Changelog

Newest first. Each entry says what changed for a player, why (quoting the owner's feedback where it came from playtesting), and what was and wasn't checked. The live site is https://creebe.github.io/ledger-and-blade/ and is only republished on the owner's word; each entry notes whether it is live.

## v0.15.2 (2026-11-26): A ledger you can trust
The Hall's money forecast now matches what the week will actually do, and the Date targets read from it. This is UI/UX Part 2, batch 2.
- **The forecast follows the Weighhouse.** When the coin will be short on the day, the forecast does what the Weighhouse does. It sells goods first, then waits if a squad is still away (up to three weeks). Otherwise the payment is missed and no coin leaves; before, it always subtracted the payment. The Loan column shows "waits" or "missed", with a short note under the table.
- **No phantom supply bill.** The forecast no longer charges crowns for supplies the game never buys. Instead, a warning says when supplies run out and people at home will go hungry.
- **Squad pay** still counts in the week a trip is planned to end, as if the job succeeds, so the forecast doesn't give away how the trip went. A squad that's overdue counts as still away.
- **Date targets use one forecast.** "Pay the Weighhouse" and "Have N crowns" both forecast from the same projection. When short, they say by how much, e.g. "about 30 short by then, if no new pay comes in". That explains the red figure a new guild sees in week 1.
- **Backers paid for the charter.** Each backer's line in the opening scene now says so, which no longer clashes with the Weighhouse loan. With the college backers, the start choice is "Hire a second Arcanist".
- **Checked:** main re-ran `npm run check` (81 tests, story checker clean) on the PR head. The fingerprint matches v0.15.1, so the rules are unchanged. Sim: careful first-year survival 68%. The engine reviewer's projection matched the real week's loan outcome in 120 of 120 cases. Story and UI reviewers (360/390 px, both themes).
- **Not checked:** a real iPhone.
- **Live** (deployed on the owner's word, 2026-11-26).

## v0.15.1 (2026-11-26): Easier to tap, safer to choose
The first batch of UI/UX Part 2, plus two choices the owner made: confirmation on story choices that cost something (A), and keeping ✕/Back while adding swipe-down to close (A).
- **Scene choices that cost anything ask first.** A choice that spends crowns, supplies, Intel, Influence, Renown or goods now asks you to confirm. On a check, a cost that only applies if you fail also counts.
- **Swipe a panel down to close it.** It closes one level, like ✕ or Back. It only starts from the header, or from the body when it's scrolled to the top. It never starts on the footer, so End Week's press-and-hold is safe. Confirmations and scenes can't be swiped away.
- **Bigger touch areas.** Small buttons, the date pill, icon buttons and segmented controls are now about 44px to the finger. Rows of small buttons that wrap are spaced so a tap lands on the one you meant.
- **Roster.** A long status like "Away · due back in 2 wk" drops below the name instead of squeezing it onto two lines.
- **Date crowns target.** "Have N crowns ... after the bills" now uses the same forecast as the ledger, so it can't show a tick while the ledger says you'll fall short. It reads "about N by then".
- **Prologue dots** are readable in light mode.
- **Checked:** main re-ran `npm run check` (79 tests, story checker clean) and the build on the PR head. The fingerprint matches v0.15.0, so the rules are unchanged. UI reviewer (360/390 px, both themes, touch tests of the swipe), engine reviewer and writing reviewer.
- **Not checked:** a real iPhone. Rubber-band and momentum scrolling can't be emulated, so swipe-down needs trying by hand.
- **Live** (deployed on the owner's word, 2026-11-26).

## v0.15.0 (2026-11-26): The opening
The owner: "We should begin a new guild with more of a story and setting intro. It's confusing to begin the way we do now." They chose a prologue plus a guided first scene, shown on the first new guild only, with a button to read it again.
- **A prologue.** Four short pages before your first start screen: the Debt, Varrow, the guilds and your guild. Skip is top right, and Back and Next stay at the bottom. Read it again from the title screen ("Read the prologue") or the start screen.
- **A walk round the hall.** "A Charter and a Debt" is now a tour with Jory Abbot: your people and their wages, the strongbox and the loan, the empty notice board, then the last of the coin with the same three starting choices. Each step can be cut short and names the tab that holds what you just saw.
- **Story bible:** a canon line on chartered guilds and a paragraph on the opening.
- **Checked:** `npm run check` (78 tests, story checker clean, every tour step reached); story, writing and UI reviewers (360/390 px, both themes). Main re-ran check and the sim on the combined v0.14.4 + v0.15.0 build: careful first-year survival 67%.
- **Not checked:** iOS Safari on a real device.
- **Live** (deployed on the owner's word, 2026-11-26).

## v0.14.4 (2026-11-26): Five playtest fixes
Fixes from the owner's iPhone playtest of v0.14.3. Shipped together with v0.15.0.
- **Scene endings stay on screen.** "I just chose 'humiliate her in front of her daughters' and the story UI vanished... I didn't even get to read the final exchange." A scene's last exchange now stays on screen with a Continue button, for every kind of scene.
- **Resting members say why.** "I couldn't select them to assign anything for the week... we need to display that and make it clear." Below 40 health, or in bed with the Sink fever, a member can't take orders or go out. The Roster card shows "Resting, 2 weeks", and a tap explains why and when they'll be fit.
- **The At Home list keeps still.** "It's a jarring change." Each row is now always two lines, with 44px position buttons.
- **"Home lately" is now "Contracts recently completed"** on the Field tab.
- **Early loan payments count.** "I had just paid 100 early and then the collection week came and I got docked." Early repayments are credited to the next collection; any leftover counts toward the one after. The Hall, the repay confirmation, End Week and the Date card show what's still due.
- **Lineup wording.** "Rank" is now "position" (the owner's call); standing orders say "Front line" and "Back line".
- **New Guild** asks for confirmation in the game's own panel instead of the phone's system dialog.
- **Saves:** version 16; older saves start with no early-payment credit.
- **Checked:** `npm run check` (78 tests); sim careful 67–68%; the fingerprint matches main for a player who never prepays; balance reviewer found no prepayment exploit (keep credit uncapped); engine, writing and UI reviewers; before/after phone screenshots.
- **Not checked:** iOS Safari on a real device.
- **Live** (deployed on the owner's word, 2026-11-26).

## v0.14.3 (2026-11-26): Old Gullet, and the house style
The owner answered four questions from the story pass.
- **Old Gullet.** The great pike of Harrowmere is called Old Gullet now, for its appetite; the owner didn't want "the Bailiff". The hunt still comes from the Mudlarks.
- **Anvil Row is the armorers' street.** Bog oak goes to an armorer for a presentation shield, not to a cabinet-maker.
- **American spelling** in every line the player reads: colors, gray, harbor and the rest (the owner's call). Saves are untouched. "Draught" and the place name "Coldharbour" are kept for now.
- **The salt-cutters** were changed by the pans and are proud of it, rather than driven feral by the fever, which in this world ends in a gift.
- **The story document** (the owner's Claude Doc) covers all of v0.14, and the story bible agrees with the game again.
- **Checked:** `npm run check` (72 tests, story checker clean), re-run by main; story and writing reviewers; the fingerprint with strings blanked is unchanged, so only text moved; the doc compared word for word with the snapshot.
- **Not checked:** a browser pass (no UI changed).
- **Live** (deployed on the owner's word, 2026-11-26).

## v0.14.2 (2026-11-26): Legends a little rarer
Legends need 115 fame (was 105), with the same level and missions. The owner's call after v0.14.1: "Let's change the legends threshold to 115."
- **Checked:** 1000 games. Legends per game by week 96 went from 1.44 to 1.04, none before week 63. Survival and feud rates unchanged (careful 69.5%). `npm run check` passed (72 tests), also re-run by main.
- **Live** (deployed on the owner's word, 2026-11-26).

## v0.14.1 (2026-11-26): Feuds that settle, and more Legends
Rival feuds now rise and fall with what the guild does, and Legends come a little more often. The balance brief asked for about a third of passive games to reach a feud in year one, with open war rare unless the player escalates; the owner set the Legend target at one or two per game by the end of year two.
- **Feuds fade.** Every week a feud cools in proportion to its size. Left alone, a rivalry settles short of a feud. A rival's own moves against you add less (+1, was +3), so a feud no longer feeds itself into war.
- **Contested jobs matter.** Beating a rival to a job they wanted raises the feud by 9 (was 3). The prep sheet warns you first, and the report says so.
- **Stages hold.** A feud or war, once reached, lasts until the feud is clearly below its line. A truce or payment ends it at once. Each rival card on the Realm screen shows whether its feud is rising or cooling, and a feud that cools on its own is announced.
- **Story.** Humiliating Marta makes it a feud if it lands. The new Master Assayer starts at feud 40. Street talk no longer names the dead. A war started by killing a rival's leader now ends after about 23 weeks of open war, then a long feud.
- **Legends** need 105 fame (was 120).
- **Saves:** version 15; older saves are upgraded.
- **Checked:** 1000 games each. Passive feuds in year one went from 3% to 31%; open war by week 96 from 61% to 9%. A bot that provokes rivals still reaches war in every game that lasts. Legends per game went from 0.77 to 1.44, none before week 58. Careful first-year survival 69.5% (was 71.1%); main's own 100-game check 67%. `npm run check` (72 tests) passed; balance, systems, engine, writing, story and UI reviewers ran.
- **Not checked:** iOS Safari.
- **Live** (deployed on the owner's word, 2026-11-26).

## v0.14.0 (2026-11-26): Every site at full depth
Each of the six thin sites now goes as deep as Old Pellam, with the names the owner approved. Shipped together with the owner's playtest fixes (v0.13.3 and v0.13.4 were never released on their own).
- **Six full sites.** Varrow, Kell Mines, the Saltfens, Drover's Road, Harrowmere and Port Anselm each have three zones and a boss: Lew Rudd, Gaffer Moyle, the Dean, Sergeant Crewe, the Bailiff and Mags Tull. There are 16 new postings and about 300 new log lines. Each boss is beaten once; after that a long return job ends in the boss's old room with a lesser fight.
- **The Ninth's colours.** Bring them home from Skell Gap and Mayne comes to the hall: give them back, sell them to him, or hang them in the hall.
- **Fixes.** A squad beaten with nobody dead no longer gets the "short of people" line. The tutorial note on hidden dangers no longer mentions odds.
- **Playtest fixes (owner's reports).**
  - "Pressing the X from a details view closes the entire weekly results view": a panel opened from another panel now has only Back, and the ✕ is on the bottom panel only.
  - "There's no ? to tap for intel anymore": the dashed "?" tags are back on posting cards and the prep sheet, with a confirmation before spending Intel.
  - "Lower the very top HUD info": the top bar, panel tops, toasts and story scenes now clear the iPhone status bar.
  - A garbled sentence in The Crown's Wagons is fixed.
- **Saves:** version 14 (bosses beaten per site); trips already out replay as before.
- **Checked:** `npm run check` (68 tests, story checker clean); sim careful 74%, cautious 70%, bold 58% on main's check; engine, story, writing, balance, systems and UI reviewers; phone screenshots at 360/390 px and a simulated iPhone 15 inset.
- **Not checked:** iOS Safari on a real device.
- **Live** (deployed on the owner's word, 2026-11-26).

## v0.13.2 (2026-11-25): Loose ends from Act I
The owner chose which of the proposed payoffs to build: Half a Year lines for every Act I outcome, two door scenes and a colder Isbet. Site lines that read story facts are on the backlog.
- **Half a Year remembers more.** Abandoning the Crown's silver, taking a seat at the Exchequer's table, failing to prove Hesketh's short weights, telling Marta about Isbet, and the fate of the Siege of Carrow and the Aske silver all get a line.
- **New at the door.** If the guild abandoned the silver, a squad bound for Port Anselm can bring home the Exchequer clerk who has been living in an empty Crown wagon at Wenmouth ford (Exchequer +3, Fenn +10, fatigue +8). With a seat at the Exchequer's table, Fenn can send a writ for the Crown's post-houses (fatigue −15, Lower Town −2). Each happens at most once.
- **Isbet remembers.** If you told Marta about her offer, Isbet's crew leaves for the same job without a word to yours.
- **The almshouse fever is the Sink fever** (the owner's call). Sister Brune now says so, and the story bible agrees. The abandoned silver's expiry text now matches the door scene.
- **Checked:** `npm run check` (61 tests, story checker 0 violations, 0 unreached, no unused facts); `npm run sim` against main, identical (careful 72%, cautious 65%, bold 52%, poor prep 1%); story and writing reviewers. The Crown's wagons are rare (about 4% of games abandon the silver) and are covered by a test.
- **Not checked:** a browser pass (no UI changed).
- **Live** (republished on the owner's word, 2026-11-25).

## v0.13.1 (2026-11-25): Expedition writing, joined to the story
Expedition text now agrees with the rest of the story, and the owner's story document covers it.
- **Fevers fit their place.** Fever and Sink-change lines on Varrow, Kell Mines and the overland roads no longer mention the Sink or the fen. Each site has its own version, and the Lower Town's version blames the wells, so a fever never passes from person to person.
- **No false recall.** The message after a squad's last orders no longer suggests it can still be called back.
- **Writing pass:** six log lines that opened with fragments are now sentences.
- **Story bible and story document:** `docs/STORY.md` covers expeditions in full (sites, zones, monsters and people, Exposure and the Sink fever, how the dives tie to factions, cast and acts). `npm run story-export` has an Expeditions part, and the owner's Claude Doc has a new Expeditions tab, with the other tabs brought up to v0.13.0. The doc had no comments or edits to keep.
- **Checked:** `npm run check` (59 tests, story checker at 0 violations and 0 unreached nodes). The fingerprint is the same as v0.13.0, so game outcomes are unchanged. Story and writing reviewers.
- **Not checked:** the balance bot (no numbers changed); iOS Safari.
- **Live** (republished on the owner's word, 2026-11-25).

## v0.13.0 (2026-11-25): Expeditions
Contracts are walked as expeditions. The owner asked to "make our game feel a lot more like Darkest Dungeon. More about actual dungeon dives. Monsters. Outfitting a squad and managing THEM as a resource", wanted the whole trip "auto played" and read "live" line by line, and approved the plan for bringing the trial into the full game with every classic system kept.
- **Postings.** Each contract names a site, a route length and a goal. Old Pellam, the buried town under the Lower Town, has its own work: rats, a survey, Pellam plate, eel oil, Assay seals, reagent salts, an account of the Sink and the Kiln Engine. Varrow, Kell Mines, the Saltfens, Drover's Road, Harrowmere and Port Anselm have one zone each for now.
- **Preparation is the game.** Pick two to four members in ranks, fill a 12-slot pack and set five standing orders. Once the squad leaves, nobody can send it orders.
- **The Field tab** shows the squads in the yard and away. **Watch together** plays every squad's week as one numbered feed, and **Down below** in the week report says who came home and what they carried.
- **Several squads at once:** two, or three with a Muster room. Each trip is revealed one week at a time at End Week.
- **The roster is the resource.** Members carry Fatigue, Exposure, scars and habits home. Going down tired raises the risk of death, and the prep sheet says so. Deaths are permanent: the family is paid eight weeks of wages, and recruits cost more for a while. Envoys and Infiltrators have their own uses down there.
- **Door scenes** are now news brought to the yard on Tallow Street as the squad gets ready, and the choice is the squad's last order (the owner's call).
- **Kept:** the Council, factions, Dates, the Debt, rivals and wars, the story, Legends, the market, materials and the Workshop. The Weighhouse waits up to three weeks for a squad that's away. Rivals can wait on the road home.
- **Saves:** version 13. Older saves carry over, and a squad already out comes home when it was due.
- **Checked:**
  - `npm run check`: 59 tests, story checker at 0 violations and 0 unreached nodes.
  - Balance bot, first-year survival. The engine session's 300 games: careful 71%, cautious 62%, bold 60%, poor prep 1%. Main's own 100 games: careful 72%, cautious 65%, bold 52%, poor prep 1%. Recklessness no longer pays better than care.
  - Engine, story, writing, systems, balance and UI reviewers; phone screenshots at 360 and 390 px; a private playable preview for the owner.
- **Not checked:** iOS Safari.
- **Live** (republished on the owner's word, 2026-11-25).

## Story document (docs only, 2026-11-25)
No change to the game. The owner asked for "an organized document with all of the writing in the game, preferably with ways for me to view and follow potential story threads and connections", which they can edit and comment on.
- **`npm run story-export`** (`scripts/story-export.ts`) reads the scene, content, rules and interface source and writes `docs/story/all-writing.md`: every scene by story thread in act order, with what triggers it, what each choice sets, and which later scenes read those facts; then contracts, the Codex, street talk, Dates, tutorial objectives, starts, Legends, names, report lines and interface text. Templated text keeps its placeholders, and text that changes with the story shows every version.
- **The owner's copy** is a Claude Doc with comments and inline editing. `docs/story/README.md` says how a later session reads the comments and edits and turns them into code, and why re-running the export never wipes them (`docs/story/doc-snapshot/` is the baseline).
- **Found:** seven story outcomes that nothing reacts to yet, such as `tapestry_sold` and `isbet_betrayed`. No broken or unreachable conversation nodes.
- **Checked:** `npm run check`. The game's behavior is untouched: no file under `src/` changed.
- **No version of its own:** docs and a script only, merged alongside v0.13.0. The export doesn't cover expedition text yet; that is the next story workstream.

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
