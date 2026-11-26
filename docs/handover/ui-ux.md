# Hand-over: ui-ux (v0.14.4, then v0.15.0)

Branch `claude/ui-ux` holds Part 1 of the UI/UX brief, the owner's five playtest reports, as v0.14.4. Two later owner requests ride along: "position" instead of "rank" on the lineup, and an in-game New Guild confirm. The story intro the owner asked for in the same message is on its own branch, `claude/intro` (v0.15.0), built on top of this one.

## What was done (v0.14.4)

1. **Scene endings stay on screen.** Owner: "the story UI vanished. I had to go to the Hall screen to read what happened."
   - When a choice ends a scene and its last exchange has text, `EventCard` keeps showing the scene in a `done` mode: the text you answered, then your choice and its result, then **Continue**.
   - The copy lives in the store as `closingEvent` and is not saved. Every scene goes through `EventCard`, so this covers events, dialogue, door scenes and queued scenes.
2. **Resting members say why.** Owner: "I couldn't select them to assign anything for the week."
   - The rule: below 40 health (or in bed with the Sink fever) a member takes no orders and can't go out. `laidUp()` and `FIT_HEALTH` live in `engine/people/health.ts`. For a member who has the fever and is also badly wounded, the estimate counts both.
   - Roster shows a dashed "Resting, N weeks" chip, a blocked `Btn` that explains on tap. The member sheet, orders sheet and prep bench give the same reason.
3. **The At Home list keeps still.** Each prep bench row is always two lines, with the position buttons on the second, at 44px.
4. **"Home lately" is "Contracts recently completed"** (the only use of the old wording).
5. **Early loan payments count.** Owner: "I had just paid 100 early and then the collection week came and I got docked."
   - `Loan.paidAhead` holds early repayments.
   - A collection takes from that credit first. A fully covered collection takes nothing, and leftover credit carries forward. A missed one clears the credit; the principal was already cut, so no money is lost.
   - `loanStillDue()` (`core/util.ts`) feeds the Hall, the repay confirm, End Week, projections, warnings, the Dates and the prep warning.
   - Saves are now version 16, with a migration and tests.
6. **Lineup wording.** "Rank" is now "position" on the prep sheet, in plan warnings and in the tutorial note. Standing orders "Front rank" and "Back rank" became "Front line" and "Back line". The battle log keeps "front rank" as narration.
7. **New Guild confirm** on the title screen uses `ConfirmSheet`, not `window.confirm`.

## What was checked

- `npm run check`: 78 tests, story checker 0 violations and 0 unreached, style flags 40 (unchanged).
- `npm run sim`: careful (0.65) 68%, 0.5 at 67%, 0.35 at 57% first-year survival.
- **Fingerprint:** the hash changes (save version and `paidAhead` are in state). With those two stripped it matches main exactly: the bot never prepays.
- **Engine reviewer:** fixed the fever estimate, added a test, found no import cycles.
- **Balance reviewer:** 300 games per variant with bots that prepay. Baseline 69.3% on both trees, and no prepay strategy beats it. Recommendation: keep carry-forward credit uncapped.
- **Writing reviewer:** two passes, small edits.
- **UI reviewer:** 360 and 390 px, both themes, every fix. It fixed a 360 px wrap on the bench.
- **Before and after screenshots:** `docs/reports/ui-ux-*.png`.

## What's open

- **A small rule change to note:** a member still marked `recovering` at exactly 40 health (only after one rival attack) now stays home one more week before they can go out. This matches how their orders already worked.
- **Part 2, found but not fixed:**
  - `.btn.small` controls are 34px tall almost everywhere: repay, market, hire, the position arrows and the Roster order chips.
  - The date pill is 30px, the notes "Hide" link is 30×22, and the guide nudge and segmented controls are 36px.
  - On Roster at 360, "Away · due back in 2 wk" squeezes names onto two lines.
  - The Date target "Have N crowns when the week closes, after the bills" shows as met before the due week, while the projection says the treasury will close below N. The forecast only subtracts bills in the due week (`targetMet` in `story/dates.ts`).
- **`claude/intro` (v0.15.0):** see its own section below once it's reviewed.

## v0.15.0: the opening (branch `claude/intro`)

Owner: "We should begin a new guild with more of a story and setting intro. It's confusing to begin the way we do now." They chose a prologue plus a guided first scene, shown on the first new guild only, with a button to read it again.

- **Prologue:** four narrator pages (`data/prologue.ts`, `ui/screens/Prologue.tsx`): the Debt, Varrow, the guilds, your guild.
  - Shown before the start screen the first time on a device (`lab.prologue.seen`).
  - Read it again from the title screen ("Read the prologue") or the start screen ("Read the prologue again").
- **Jory's tour:** `charter` is a walk round the hall with Jory: the people, the strongbox and loan, the notice board, then the original three starting choices.
  - Every step can be cut short.
  - Each step's detail line names the tab that holds what was just shown.
- **Story bible:** a canon line on chartered guilds and a paragraph on the opening.
