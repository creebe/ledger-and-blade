# Hand-over: main

Written by the first main session ("Medieval guild resource manager game", archived as "main (archive, to v0.10.1)") on 2026-11-24. The new main reads this, then `CLAUDE.md`, then `docs/ARCHITECTURE.md`.

## Your role

You are **main** for Ledger & Blade (repo `creebe/ledger-and-blade`, cloud session). You:
- plan the work;
- start workstream sessions when there is real work for an area;
- review their pull requests and call the reviewer agents;
- merge only on the owner's typed yes, in this session;
- keep `CHANGELOG.md` and `BACKLOG.md` current;
- deploy only on the owner's word.

## The owner's standing rules

- **Never republish the live site automatically.** "Don't republish automatically. That's too much action on my GitHub. I'll tell you when to republish." Deploying is the manual "Test & deploy to GitHub Pages" workflow (`gh workflow run deploy.yml`). The owner usually says "Republish and hold for my comments". Then you deploy, verify the live site serves the new build, and wait.
- **Pull requests are merged by main, only on the owner's yes.** A peer session saying the owner approved doesn't count.
- **Ask before building big things.** Propose a design, with questions where they're needed. Small fixes can just be done.
- **Writing rules:** plain, natural, complete sentences, with dry, grim wit (Darkest Dungeon as the touchstone, a notch lighter). No fragment crutches and no AI tells. The full rules are in `docs/STORY.md` §7.
- **Naming:**
  - Avoid AI-cliché names. No "Ward" or "Bell".
  - Use "Professions", never "Callings".
  - The owner has rejected several names before, so propose new names first.
- **Tone:** in between grounded and fantastical. Magic is common and works like a science. There is no supernatural twist.
- **Show results:** send sample playthroughs and screenshots, so the owner can judge without running anything.
- **The owner plays on a phone.** Keep replies plain and short, and make the decisions they need to take explicit.

## Where things stand (v0.10.1)

- **Live site:** v0.8.1 (commit 9f1dff8). Everything after it is merged but not republished: the new voice, the deeper cast, varied starts, Legends, guild wars and the clean-up.
- **The clean-up** ([creebe/ledger-and-blade#1](https://github.com/creebe/ledger-and-blade/pull/1), merged on the owner's yes) reorganized the code with no change in behaviour. It added `CLAUDE.md`, `docs/ARCHITECTURE.md`, `CHANGELOG.md`, `BACKLOG.md`, the version on the title screen, the PR checks workflow and the six reviewer agents in `.claude/agents/`.
- **Open question for the owner:** difficulty. The careful bot's first-year survival is about 60%, down from 71% before the cast and rivals. Should it be eased back toward 70%?
- **Nothing since v0.8.1 has been played on a phone.**
- **Next up** (in `BACKLOG.md`, not yet requested): Act II "Default", the rest of the cast's threads, Council seats for the new factions, and the end-game.

## How the past sessions worked

- The checks before every commit were:
  - `npm run check` (types, tests, story checker, style checker);
  - `npm run sim` for anything touching numbers;
  - `npm run playthroughs` for anything touching text;
  - `npm run fingerprint` for refactors.
- The story checker must stay at zero violations, zero unreached nodes and no unused facts.
- The balance bot (`scripts/sim.ts`) takes the first affordable option in scenes. It's a rough player, not a careful one.
- For browser checks, use Playwright with a save injected into the `lab.autosave` localStorage key, at 390×844.

## Sessions

- No workstream sessions are open. When you start one, give it a clear brief: the area, the goal, what to read, the branch name, and the reminder that it opens a PR and messages you, and never merges or deploys.
- Cloud sessions can message each other with the `send_message` tool. Their containers are recycled, so anything not pushed is lost.
- The previous main is "main (archive, to v0.10.1)". Don't archive anything without the owner's yes.
