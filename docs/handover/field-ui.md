# Hand-over: field-ui (expeditions workstream 2)

The Field UI for expeditions in the full game, built on the engine API in `docs/EXPEDITIONS-API.md`. Branch `claude/field-ui`, branched from `claude/exp-engine` and kept merged with it.

## What was done

- **The Field tab** (`src/ui/screens/Field.tsx`), a sixth bottom tab after the Hall.
  - "n of m squads out" at the top, with a pointer to the Muster room when the hall is full.
  - One raised card per squad out, in number order. Each card shows:
    - the number badge, the site and the contract;
    - "Week x of about y", with the zone and room, or "In the yard";
    - a compact squad strip (health, Fatigue, Exposure);
    - the last big line seen, or the last line when nothing big has happened yet.
  - Tapping a card opens the squad's log (`ExpLogSheet`, from exp-engine), revealed up to the current week.
  - **The yard.** A squad waiting in its dispatch week gets a flat dashed panel under its card. A tap on a name opens that member's gear, and "Call off" asks first. Once a door scene has fired, "Call off" is blocked and says why.
  - "Home lately" lists the last three squads home. Each row opens the log.
- **The squad strip and badge** (`src/ui/expeditions/SquadStrip.tsx`).
  - `SquadBadge` is the number in a neutral circle. Squads are told apart by number, never by color.
  - `SquadStrip` takes cells from a log snapshot (`cellsFromSnap`) or from the members at home (`cellsFromMembers`, for the yard).
  - Exposure shows only above 0. It turns orange within 10 of a Sink change threshold.
- **Watch together** (`src/ui/sheets/WatchSheet.tsx`, sheet kind `watch`). It's a full-height sheet that plays `feedForWeek` for the week just ended.
  - It has one strip row per squad, kept sticky at the top. Each row shows the squad's room as the lines play.
  - Every line carries its squad's badge.
  - A big line holds the other squads for 1.7 seconds. Their strips dim and read "waiting".
  - Tap the feed to go four times faster. Skip shows the rest at once.
  - Tap a strip to follow one squad, and tap it again to see everyone.
- **Down below in the week report** (`WeekReport.tsx`). It has one tappable row per squad with its `weekSummary` text, which turns orange when someone went down and red when someone died. A **Watch together** button sits beside the heading. The section shows whenever any squad has new lines, and it replaces exp-engine's placeholder block.
- **The dispatch flow.**
  - The Contracts tab keeps its board. Its old "In the field" cards became one tappable row ("2 squads out. Follow them in the Field.").
  - The Board heading shows "n of m squads out", in orange when the hall is full.
  - The prep sheet opens with the squad limit. When the hall is full, the blocked Set out offers "See the Field", which goes to the Field.
  - The existing shortfall (`short()` for crowns), `Btn blocked` and the confirmation on Set out are unchanged.
- **Withdrawn squads.** A squad called back at the door is sealed and goes to history, so `feedForWeek` returns its log, which never happened. Down below and Watch together filter it out. Main has been told, so the engine can skip it in `feedForWeek`.

## What was checked

- `npm run check`: 52 tests passing, story checker clean, style flags advisory only.
- The browser at 390×844, using a save from the engine with two squads out (seed 1, both dispatched in week 1). Checked: the Field in the yard, the Field after End Week, a squad log, End Week into the report, Down below, and Watch together at normal and fast speed.
- The ui-reviewer and writing-reviewer, on the diff. Their fixes are in the pull request.

## What's open

- **Three squads.** The layout takes any number of squads, but I didn't make a three-squad save (it needs a Muster room).
- **A real death in Watch together.** The test save has big lines (a fall, an ambush) but no death.
- **Hall notices.** "Squad 2 is home" in the Hall (proposal §3, item 4) is still open; the Hall wasn't in this workstream's scope.
- **The version.** It wasn't bumped. Expeditions ships as one feature across the workstreams, so main picks the number.
- **Re-gearing in the yard** opens the member sheet. Whether gear can change there for a member whose status is `mission` is exp-engine's rule. It worked in the browser.
