# Hand-over: Dates, the end-week confirmation, shortfall links and resource colors (v0.12.0)

The work is on branch `claude/ui-audit`, the only branch this session can push to. Before starting, I merged `main` (v0.11.0) into it.

## What was done

- **Dates.** These are dated checkpoints 3–6 weeks ahead, with one always current and the next one in view.
  - **Engine:**
    - `src/engine/data/dates.ts` holds the content: twelve Dates.
    - `src/engine/story/dates.ts` holds the rules: scheduling, twists, resolution, and the progress views the UI reads.
    - `datesPhase` runs in `advanceWeek`, and `scheduleDates` runs at the start of each week.
    - `SAVE_VERSION` is now 12, with a migration step.
  - **UI:**
    - the top-bar pill and the Date card (`panels/DateCard.tsx`);
    - the Dates sheet (`sheets/DateSheet.tsx`);
    - progress lines under the resource chips a Date asks about;
    - a block in the week report.
  - **Story bible:** §5c documents the Dates.
  - **Guildmaster's Notes:** a new note, "Look at the next Date".
- **End-week confirmation.** `sheets/EndWeekSheet.tsx` shows the summary, and you confirm with `kit/HoldButton.tsx`, a 650 ms press-and-hold.
  - Sliding off the button cancels the hold.
  - A quick tap shows a hint instead.
  - The keyboard and screen readers can still confirm.
- **Shortfall links.** `kit/shortfall.ts` and `kit/navigate.ts`:
  - toasts can carry one action;
  - `Btn` takes a blocked reason with an action;
  - short cost chips are links;
  - the Armory and Realm sub-tabs live in the store, so a link can open the right one.
- **Resource icon colors.** The `--res-*` tokens color icons only. `CLAUDE.md` and the UI reviewer's brief now list resource icons as a reserved use of color.
- **Main's three open items:**
  - The toast now renders inside the open sheet, above its footer.
  - The Rewards pill label is shorter.
  - Light `--bad` is now crimson.

## What was checked

- `npm run check`: types, 42 tests, the story checker (0 violations, 0 unreached nodes) and the style checker, which now also scans `data/dates.ts`.
- **Reviewers.** All six ran, and their findings are fixed. The notable fixes:
  - Council stances lock in the vote week, to stop the Council Date being farmed.
  - Targets stay reachable: the Muster stays within the hall's room, and Lower Town targets start from where you stand.
  - On the due week, the forecast counts the week's bills.
  - A missed Date says which target failed.
  - The Date shown next is rechecked every week.
  - The Lord Treasurer visits only after the silver is delivered.
  - Canon and voice fixes.
- **Balance.** Careful-bot first-year survival is 72% over 400 games, against 69% on main. The difference is noise.
- **Screenshots** are in `docs/previews/v0.12/`.

## What's open

- **Keyboard focus.** Focus isn't moved into or trapped inside sheets. This is older than this branch and affects every sheet.
- **The balance bot doesn't aim for Dates.** Survival therefore measures only their passive effect. The Lord Treasurer's visit can't be measured, because the bot always loses the silver.
- **Existing gaps the balance reviewer noted.** None comes from this branch:
  - the veterans start sits about 16 points below average;
  - Legends average about 0.5 per campaign, against a target of 1;
  - 4 games in 400 go bankrupt by week 8.
- **Not tested:** iOS Safari and VoiceOver.
