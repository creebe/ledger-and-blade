# Hand-over: odds for expeditions (claude/odds, v0.16.0)

The owner asked: "I'd like you to bring back the success odds based on party composition in the contracts/expeditions."

## What was done

- **Engine (`src/engine/expeditions/odds.ts`).**
  - `expeditionOdds(s, contract, plan)` and `oddsRunner(...)` estimate a plan by running the real `runExpedition` over a fixed run of seeds: 120 per case, at most 480 in all.
  - They never touch `state.rng` or the trip's real seed, and they use only the dangers the player knows. Each unconfirmed "?" is tried as each of its candidates, and the result is a min–max across those cases.
  - The result gives:
    - the job-done chance and the death chance;
    - the outcome tiers;
    - how failures went (turned back, lost, or short of the goal);
    - each member's chance of dying.
  - Results are cached by a key built from the plan, the frozen squad and the cases. Cached results are frozen.
  - Door scenes and road ambushes aren't counted, because nobody knows about them at the prep sheet.
- **`runExpedition(setup, { quiet: true })`.** This skips writing the log's words but keeps every roll. A test checks that the outcome is identical across all sites, and another checks that a walk never mutates its setup.
- **`openingPlan(s, c)`.** It moved from PrepSheet into `prep.ts`, so the board and the sheet show odds for the same plan.
- **UI (`src/ui/kit/odds.tsx`).**
  - `useExpOdds` works the estimate out in slices of about 10 ms after a 150 ms settle. While it updates, the last figure stays on screen, dimmed.
  - The shown odds are capped at 3–97%.
- **Prep sheet.**
  - The footer row shows "Job done NN%", "Chance of a death NN%" and Why?, which scrolls to "The odds" section. That section has:
    - the per-"?" cases;
    - a tier bar;
    - how failures went;
    - who was most at risk.
  - Below the contract's minimum squad size, the footer says the odds show once the squad is big enough.
  - The owner chose to show the death chance as "Chance of a death" with a percentage, and wants both lines kept.
- **Board.** Each card shows "Suggested squad NN%", or "Not enough people free to send".
- **Clean-up and docs.**
  - The dead `useBestOdds` was removed.
  - The HelpSheet's Contracts text was rewritten (it still described phases).
  - The tutorial's `read_odds` note was updated.
  - The new functions were added to `docs/EXPEDITIONS-API.md`.
- **New command.** `npm run odds` checks the estimate against real outcomes. It takes `GAMES`, `WEEKS`, `MIN` and `ORACLE`.

## What was checked

- **`npm run check`:** 87 tests. The story checker reports 0 violations and 0 unreached. Style flags are 40, as on main.
- **Fingerprint:** `0f8f0a72…3754` matches main.
- **`npm run sim`:** identical to main in every line. Careful bot: 67% first-year survival.
- **Engine reviewer.**
  - There are no leaks of hidden dangers, the estimate is deterministic and it never mutates the state.
  - Quiet mode can't diverge from a full walk.
  - It fixed the cache key so it includes the assumed dangers, and made the estimate snapshot the plan.
- **Balance reviewer (1744 trips, plus 947 with a bolder bot).**
  - Calibration holds in every band, for example estimate 51% against real 55%, 69% against 69%, and 94% against 93%.
  - Overall: goal 90% estimated against 91% real; death 7% against 6%.
  - The 97% cap is justified. Door scenes are neutral on average but can occasionally wreck a trip (the worst was −73 points).
  - 120 runs gives about ±3 points.
- **UI reviewer (360/390 px, both themes).**
  - No long tasks while editing, and taps respond in 20–60 ms.
  - No horizontal scroll and no console errors.
  - It made Why? a `Btn` with a blocked reason, and fixed the footer's wrapping.
- **Writing reviewer.** Removed the lists of three and the fragments.
- **Screenshots** are in `docs/previews/v0.16.0/`.

## What's open

- **Odds after a door scene.** These would be recomputed from `buildSetup`, with the door's tag, foe scale and delay, wherever the player can still withdraw at the door. The balance reviewer recommends it as a follow-up.
- **Tier bar.** Triumph and Success share green, and Costly Success and Failure share orange, so neighbouring segments are told apart only by a gap. Changing that is a visual decision for the owner.
- **Board odds bunch high.** In a typical early save the board's figures sit around 92–97%, so they don't separate the contracts much. That's a fact about how easy the jobs are, not about the estimate.
- **Repeated cases.** Cases whose tags come out the same are each walked in full. That costs time but doesn't change the result.
- **Not checked:** a real phone. The timing was measured on desktop: a median of 52 ms per estimate, spread over frames.
