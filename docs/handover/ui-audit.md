# Hand-over: ui-audit

## What was done

- I wrote a UI/UX audit of `main` at v0.10.1 (`ac9e052`), in `docs/audits/ui-ux.md`. It covers:
  - tap counts;
  - the information each screen shows;
  - icons;
  - color;
  - typography;
  - 23 ranked recommendations, with 6 quick wins marked.
- 17 screenshots are in `docs/audits/ui-ux/`, as JPEGs at 390×844 and deviceScaleFactor 2. Two of them are full-page scroll maps, and one is an icon-collision sheet drawn from `icons.tsx`.
- No game code or CSS was changed, and nothing was renamed. One name change is proposed: the Hall's "Debt" section becomes "The Loan". The owner decides.

## What was checked

- Every screen, sheet and panel in `src/ui`, plus `App.tsx`, was read.
- `src/styles.css` was inventoried with a script that maps every font size and color token to its selectors.
- Playwright and Chromium ran against `vite preview`, using three bot-made saves (seed 101) loaded through `lab.autosave`:
  - week 1, with the opening scene;
  - week 20;
  - week 44, with squads in the field.
- The end-week flow was driven through the warnings, the report and the next week.
- Tap targets under 40 px were measured on every tab and in the planner.
- Light theme was spot-checked.
- `npm run check` passes.

## What's open

- **Not checked:**
  - 360 px width;
  - iOS Safari;
  - the mission replay;
  - the title and new-guild screens in depth;
  - game over.
- The save generator I used lives only in my scratchpad. If later UI work wants repeatable early, mid and late saves, a small `scripts/make-saves.ts` built on `botTurn` from `scripts/sim.ts` would be worth adding.
- **Bugs found that need a fix pull request:**
  - "Guard the hall" has no icon. It shows ⓘ on the member sheet and a bed on the Roster.
  - Four purchases skip confirmation: supplies, shop items, materials and crafting.
  - The toast covers the top of sheets.
