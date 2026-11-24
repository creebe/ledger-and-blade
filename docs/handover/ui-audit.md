# Hand-over: ui-audit

## What was done

1. **The audit.** I audited `main` at v0.10.1 for a player on a phone. It's in `docs/audits/ui-ux.md`, with screenshots in `docs/audits/ui-ux/`.
2. **The build.** The owner asked for every recommendation and the rename to be built. It's v0.11.0 on the same branch and the same pull request, #3. Section 7 of the audit lists what was built and where it differs from the plan. In short:
   - **Planner:** a Best squad button, and buying missing supplies from the footer without losing the squad.
   - **Orders:** weekly orders can be set from an order chip on each Roster row, through a new `OrdersSheet`. The member sheet shows orders first.
   - **Realm:** sub-tabs for Council, Powers, Rivals and The Debt.
   - **Hall:**
     - alerts and "N to check" are tappable;
     - a loan line sits under the ledger;
     - the feed is shorter, with older news behind a button;
     - the loan section is renamed **The Loan**.
   - **Contracts:** squads in the field show as one-line rows.
   - **Purchases:** buying supplies, items and materials, and crafting, all ask for confirmation. Blocked buttons say why.
   - **Color:**
     - gold is used only for Story;
     - the warning tone moved to orange;
     - titles are ink instead of red;
     - the leftover resource colors are gone.
   - **Icons:** redrawn so each meaning has its own drawing. Glyphs and the emoji are now icons, and icons use four sizes.
   - **Type:** nine size tokens replace 30 sizes, there's one bold weight, and the display font uses lining numerals.
   - **Formatting helpers** in `kit/format.ts`. Calendar dates replace absolute week numbers.
   - **Smaller changes:**
     - resource labels in the first season;
     - Roster and Hall badges;
     - bigger tap areas;
     - the toast moved to the bottom.
   - **Engine:** text only. The plurals in the end-week warnings and the hungry dispatch were fixed, and the tutorial's directions say "The Loan".

## What was checked

- `npm run check` passes: types, 31 tests, the story checker with 0 violations and 0 unreached nodes, and the style checker.
- `npm run build` passes.
- **Reviewers:**
  - The engine reviewer found no rule breaks. No save change was needed.
  - The writing reviewer's fixes were applied.
  - The UI reviewer tested in Chromium at 390 and 360 px, in both themes. It fixed four problems:
    - hit areas that took taps from neighbouring controls;
    - the Roster row and order chip both reacting to one key press;
    - planner cards overflowing;
    - a missing notice after buying materials.

  I fixed the rest of its list myself: the toast's animation, the order chip's height, the light-theme warning contrast, and the "Influence" label.
- **My own browser checks:**
  - the buy-supplies flow in the planner;
  - no horizontal overflow at 360 on any tab;
  - no console errors on early, mid and late saves.
- `npm run sim` wasn't run, because no money, odds or tuning changed. Supplies bought from the planner go through the same `buySupplies` as before.
- `npm run fingerprint` wasn't run, because this isn't a pure refactor.

## What's open

- **Toast over the sheet title.** When a sheet is open, the toast covers the sheet's title for about 3 seconds. Taps pass through it. The other place to put it, the sheet footer, would hide main buttons. This needs the owner's call.
- **Light-theme warning orange** is `#9a4f10`. It passes contrast now, but it's still fairly close to the bad red `#a3321f` on light paper.
- **No "new recruits this week" badge.** Recruits don't record when they arrived, so the badge would need a save change.
- **Planner picker on phones.** Below 420 px the squad picker has two columns, so the planner is a little taller.
- **Small buttons** (`.btn.small`) are still 34 px tall, as before this branch.
- **The save generator** I used is in my scratchpad only. A `scripts/make-saves.ts` built on `botTurn` would help later UI work.
- **Story text** still opens some dispatch bodies with "▸" in the story data. That's for the story or writing reviewer.
