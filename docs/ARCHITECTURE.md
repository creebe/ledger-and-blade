# Architecture

Ledger & Blade is a React + TypeScript web app (Vite, installable as a PWA). All game rules live in a pure TypeScript **engine** with no UI code. The **UI** reads the engine's state and calls its actions. The **scripts** play the engine headlessly to test story, balance and writing.

```
src/
  engine/            pure game rules: no React, no DOM, no Math.random
    core/            the skeleton every system hangs on
    people/          members and Legends
    missions/        odds, mission resolution, journals
    economy/         contract board, market, items, buildings
    politics/        Council, faction perks
    rivals/          rival AI and guild wars
    story/           scenes engine, Codex and street talk, Guildmaster's Notes
    data/            content: contracts, scenes, items, factions, starts, ...
    actions.ts       everything the player can do
    index.ts         the engine's public surface (the UI imports only this)
  ui/
    kit/             shared building blocks: Sheet, Btn, icons, visuals, theme
    screens/         the five tabs, plus the title and new-guild screens
    sheets/          full-height sheets: planner, member, journal, scenes, reports, menus
    panels/          panels embedded in screens: buildings, Council, notes
  App.tsx            the shell: top bar, tabs, End Week, which sheet is open
  store.ts           Zustand store: holds the game, wraps every action, autosaves
  version.ts         the version shown on the title screen
scripts/             headless tools (see CLAUDE.md for the commands)
tests/               Vitest: engine rules and story coherence
docs/                design doc, story bible, reports, playthroughs
```

## How a week works

1. The player acts. Each action is a function in `engine/actions.ts` (or a system module) that takes the `GameState` and changes it. The UI calls `act(fn)` from `store.ts`, which runs the action inside an Immer draft, checks the Guildmaster's Notes, discovers lore and autosaves.
2. **End Week** calls `advanceWeek()` in `engine/core/turn.ts`. It runs named phases in order:
   1. `homePhase`
   2. `missionPhase`
   3. `worldPhase` (rivals, wars, the Council, street talk)
   4. `economyPhase`
   5. `memberPhase`
   6. `politicsPhase`
   7. `clocksPhase`
   8. `closeLedger`
   9. `checkGameOver`
   10. `startNewWeek`, which refreshes the board and market, plans rival moves and triggers scenes
3. Scenes wait in `pendingEvents` until the player answers them. They are resolved by `resolveEvent()` in `engine/story/scenes.ts`.

## The core modules

| Module | What it holds |
|---|---|
| `core/types.ts` | Every shape in the game: `GameState`, `Member`, `Contract`, `Rival`, `EventEffect` and so on. |
| `core/rng.ts` | The seeded random number generator. All randomness goes through `state.rng`, so a seed always replays the same game. |
| `core/util.ts` | `clamp`, `living`, `addDispatch`. It is free of data imports, so anything can use it without import cycles. |
| `core/effects.ts` | Money in and out (`earn`, `spend`), standing, clocks, contract effects, and `track` for the notes. |
| `core/tuning.ts` | The headline balance numbers. |
| `core/newgame.ts` | `newGame(seed)` and the rolled start. |
| `core/save.ts` | `SAVE_VERSION` and `migrateSave()`, which upgrades older saves step by step. |
| `core/calendar.ts` | Seasons and date labels. |

## Content versus rules

- **Content** lives in `engine/data/`. This covers contracts, scenes (`events.ts` for the core story and world events, `cast.ts` for the wider cast, `field.ts` for road encounters) and everything else with words or numbers about a specific thing. The rules in the other folders should not mention specific content, except where a story outcome needs a hook (for example `afterLeaderDies` in `rivals/war.ts`).
- `data/registry.ts` lists every scene. Anything that looks a scene up by id uses it.
- `data/facts.ts` registers every story fact. Using an unregistered fact is a type error, and the story checker verifies that each fact is both set and read.

## Things that are easy to break

- **Determinism.** Never use `Math.random` or `Date.now` in the engine (except the default seed in `newGame`). Use the helpers in `core/rng.ts`.
- **Saves.** Any change to the shape of `GameState` must:
  - bump `SAVE_VERSION`;
  - add a step to `migrateSave()`;
  - add a test in `tests/engine.test.ts`.
- **Import cycles.** Data modules import each other (scenes import legends for naming, for example). Keep `core/util.ts` and `core/types.ts` free of data imports, and import shared helpers from there. Top-level code must never call into another module at import time.
- **CSS class names.** Two bugs have come from colliding class names (`.phase`, `.objective`). Use specific names.
