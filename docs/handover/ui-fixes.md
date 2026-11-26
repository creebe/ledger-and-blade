# Hand-over: ui-fixes (v0.13.4)

Two fixes from the owner's v0.13.2 phone playtest. Branch `claude/ui-fixes`. Only `src/ui`, `src/styles.css` and `src/version.ts` changed. The version went from v0.13.3 to v0.13.4 because main gave v0.13.3 to the story session's PR #12.

## What was done

1. **Panels keep their level** (`kit/common.tsx` `Sheet`).
   - Owner: "pressing the X from a details view closes the entire weekly results view which means I lose insight into what happened."
   - A panel opened from another panel (depth > 0) now shows only **Back** at the top left and no ✕. Only the bottom panel of a stack has ✕, and it closes that one panel. This is the pattern main recommended. Nothing was found that argued for another one.
   - New CSS `.sheet-head.sheet-head-nested` keeps the title next to Back. From the UI review: Back has a 44 px hit area, because it is now the only way out of a nested panel.
   - Checked paths:
     - week report → Down below row, and week report → Watch together;
     - planner → member;
     - menu → help;
     - Roster → member, and Field → log (both are bottom panels, so they keep ✕).
   - Backdrop taps still pop one level. `kit/navigate.ts` `goTo` still closes everything on purpose, as it is meant for "go to" shortcuts.
   - No `Sheet` passes `onClose`, so no nested panel is left without a way back.

2. **The Intel "?" is back** (new `kit/reveal.tsx`).
   - `HiddenTag` is a dashed "?" tag built on `Btn`. When Intel is short it is blocked by `short(g, 'intel', …)`: tapping it explains why and offers "Gather rumors".
   - Otherwise `askReveal` confirms the spend ("Learn the hidden danger?", Spend N Intel), calls the engine's `revealTag`, and toasts the tag that was learned.
   - **On posting cards (Contracts tab):** the card shows a short "?". The card changed from `<button>` to `<div role="button" tabIndex=0>` with Enter and Space handling, so the tag inside it can be a real button. The tag's wrapper stops the tap from opening the planner. The card also has `user-select: none`.
   - **On the prep sheet:** the tag spells out the candidates ("? Watchful Guards or Thugs"). Below it, a hint names the Intel cost and the Scout order.
   - Scouting still works and is reachable: Roster → Orders → "Scout a contract" (`kit/members.tsx` `OrderPicker`). The engine resolves it in `turn.ts`, and it also counts for the `reveal` objective.

3. **Room under the iPhone status bar** (owner, via main: "can we also lower the very top HUD info? It gets semi obscured by the iPhone darkening the display").
   - A new `--safe-top` in `styles.css` is the top inset plus 12px. It is 0 where there is no inset (`min(inset, 12px)`), so desktop doesn't move.
   - It replaces every `env(safe-area-inset-top)`:
     - the top bar;
     - the sheet height, so the sheet top follows;
     - the toasts;
     - the title screen's theme toggle;
     - the full-screen log head;
     - the `[data-guide]` scroll margin.
   - Scene cards (`.event-backdrop`) now pad by `--safe-top` and the bottom inset. Before, a tall scene card ran up under the status bar.
   - This is CSS only. It was checked with Playwright on an iPhone 15 with a simulated 59px top inset. The shots are in `docs/reports/ui-fixes-top-inset.png`.

## What was checked

- `npm run check` passes, before and after merging main: 61 tests, story checker 0 violations and 0 unreached, style flags 38 (all in engine data, none from this diff).
- **ui-reviewer:** 360 and 390 px, light and dark, in a real browser. It checked the blocked state, the confirm, keyboard use on the card, and that nothing overflows. It fixed the two CSS points above.
- **writing-reviewer:** two wording edits, in the tag title and the prep hint.
- **Screenshots** for the owner, before and after:
  - `docs/reports/ui-fixes-panels.png`
  - `docs/reports/ui-fixes-intel.png`
- Not run:
  - `npm run sim` and `fingerprint`, because no engine or number changed;
  - iOS Safari.

## What's open

- The tutorial objective `reveal` in `engine/data/tutorial.ts` gives as its *why*: "Unknown tags turn your odds into a range." Since expeditions, the prep sheet shows no odds, so that line is no longer quite true. Its *how* line ("Tap a dashed '?' tag…") is true again. I left it alone because it is engine data and the sites session works there. Suggested wording: "Knowing what you face tells you what to pack and who to send."
- `HelpSheet.tsx` still says unknown tags "turn your odds into a range". The same point applies.
- From the UI review, not changed:
  - The bottom panel's ✕ is about 30×34 px, under the 40 px target. This was already the case before this change.
  - The blocked "?" at 0.45 opacity is faint in dark mode. That is the standard `.is-blocked` look.
  - The eye icon on the "?" uses the Intel color, which fits the rule that resource icons carry their color. Whether the tag should be neutral instead is a design call for the owner.
