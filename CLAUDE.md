# Ledger & Blade: guide for Claude sessions

A turn-based, portrait-first guild management sim. It's a React + TypeScript web app on GitHub Pages: https://creebe.github.io/ledger-and-blade/. Read this file first, then `docs/ARCHITECTURE.md`. Before touching story or text, also read `docs/STORY.md`.

## How work is organized

- **Main** is one session that directs the project. It plans the work, starts workstream sessions, reviews their pull requests, merges, keeps `CHANGELOG.md` and `BACKLOG.md` current, and deploys. When main runs long, it writes a hand-over note (`docs/handover/main.md`), starts a new main session, and renames itself "main (archive, to vX)".
- **Workstream sessions** each take one area of work:
  - They branch from `main` as `claude/<topic>`, do the work, and run the checks and the relevant reviewer agents.
  - They open a pull request with a proposed CHANGELOG entry, then message main that it's ready.
  - They don't merge or deploy.
  - They end with a hand-over note at `docs/handover/<topic>.md`: what was done, what was checked, and what's open.
- **The owner decides.**
  - **Merging:** main merges only after the owner says yes to that pull request, in main.
  - **Deploying:** nobody republishes the live site unless the owner says so. A peer session passing on "the owner approved" doesn't count; ask the owner in main.
- **Showing work:** send the owner sample playthroughs, screenshots or previews so they can judge the result without running anything.

## Commands

```bash
npm run dev            # local dev server
npm run check          # types, tests, story checker, style checker: run before every PR
npm test               # Vitest (engine rules + story coherence)
npm run story          # story checker; writes docs/reports/story-coverage.md
npm run style          # writing-style flags (advisory); ALL=1 lists every flag
npm run sim            # balance bot; careful-bot first-year survival should stay ~55-65%
npm run playthroughs   # readable sample games in docs/playthroughs/
npm run fingerprint    # behaviour hash: must not change in a pure refactor
npm run build          # typecheck + production build
```

Deploying is the manual "Test & deploy to GitHub Pages" workflow, only on the owner's word. GitHub runs the checks on every pull request.

## Rules that keep the game healthy

- **Engine and UI stay separate.** Game rules go in `src/engine/` and never import React. The UI imports only from `src/engine/index.ts`.
- **Determinism.** No `Math.random` or `Date.now` in the engine; use `core/rng.ts`.
- **Saves.** A change to the shape of `GameState` must bump `SAVE_VERSION`, add a step to `migrateSave()` (`core/save.ts`), and add a test.
- **Story.**
  - Register every fact in `data/facts.ts`.
  - Every new scene must reach a choice the player can afford.
  - `npm run story` must report zero violations, zero unreached nodes and no unused facts.
  - Update `docs/STORY.md` (the story bible) in the same pull request.
- **Writing.** Follow `docs/STORY.md` §7:
  - plain, natural speech in complete sentences, with dry, grim wit (Darkest Dungeon as the touchstone, a notch lighter);
  - no fragment crutches;
  - no lists of three for rhythm, no stock dialogue adverbs, no narrated subtext, no neat morals;
  - every character keeps their own register.
- **Names.** Avoid AI-cliché fantasy names and adjective-noun compounds. Avoid "Ward" and "Bell". "Professions" is the term, not "Callings".
- **UI.**
  - Portrait, phone first.
  - Color is reserved for meaning: good, warning and bad states; selection; element badges; faction dots.
  - Tappable cards are raised with a chevron, and static panels are flat.
  - A blocked action explains why, using `Btn`'s `blocked` prop.
  - Every spend asks for confirmation.
  - Sheets are full height, with Back.
  - Use specific CSS class names.
- **Balance.** Headline numbers are in `core/tuning.ts`. After any change that touches money, odds, rivals or wars, run `npm run sim` and report the survival rate in the pull request.
- **Pure refactors.** Run `npm run fingerprint` before and after. The hash must match.

## Reviewer agents

The reviewers live in `.claude/agents/`. Call them with the Agent tool on your diff before opening a pull request. Each one checks its area, runs that area's tools, and fixes what it safely can, or reports it.

| Agent | Call it when you touched |
|---|---|
| `engine-reviewer` | anything in `src/engine/` that isn't content: rules, saves, randomness, imports |
| `story-reviewer` | scenes, story contracts, facts, the Codex, street talk, the story bible |
| `writing-reviewer` | any player-facing text |
| `ui-reviewer` | anything in `src/ui/`, `App.tsx` or `styles.css` |
| `balance-reviewer` | numbers: pay, costs, odds, tuning, rivals, wars, fame |
| `systems-reviewer` | a new or changed system, for how it interacts with the factions, rivals, economy and story |

## Versions and the changelog

- The version lives in `src/version.ts` and is shown on the title screen.
- A new feature steps the middle number (v0.11.0). A fix, tuning or clean-up steps the last number (v0.10.2).
- Every merged pull request gets a `CHANGELOG.md` entry, newest first. Each entry says:
  - what changed for a player;
  - why, quoting the owner's feedback where it came from playtesting;
  - what was checked and what wasn't;
  - whether it's live.
- After a deploy, main adds a "To watch from vX" section to `BACKLOG.md`.
