# Hand-over: the expeditions trial (v0.13.0-proto)

This is a trial of a major change, and the owner may scrap it. It lives on `claude/expeditions` and goes in a draft PR titled "Expeditions prototype (trial, do not merge)". Nothing is merged or deployed. The design is in `docs/EXPEDITIONS.md`.

## What was done

- **The game on this branch** is now the expeditions loop:
  - prepare four members, their ranks, gear, a 12-slot pack and five standing orders;
  - send them into **Old Pellam** on a short, medium or long route;
  - read the expedition live, line by line;
  - come home to heal, recruit, buy, sell and pay the Weighhouse.
- **The classic game is hidden, not deleted.** `src/features.ts` holds `TRIAL_EXPEDITIONS`, and adding `?classic` to the URL plays the classic game. The trial saves under its own key (`lab.trial.expeditions`), so it never touches a classic save.
- **Engine** (`src/engine/expeditions/`, pure and deterministic):
  - `dive.ts`: the route generator and the simulation.
  - `guild.ts`: guild actions, weeks, debt, sponsors and the save with its migration.
  - `bot.ts`: the balance bot.
  - `tuning.ts`: the headline numbers.
  - `data/content.ts`: Professions, gear, supplies, monsters, zones, goods, scars, habits, conditions and sponsors.
  - `data/lines.ts`: about 500 log lines across 195 situations.
- **UI** (`src/ui/expeditions/`, `src/expStore.ts`, the `x-` section of `styles.css`):
  - the title screen;
  - the Hall, Squad and Market tabs, and the member sheet;
  - preparation, the live log and the result screen;
  - inline SVG silhouettes for the six Professions and the ten monsters.
- **The owner's redirection mid-build:** the first nerve mechanic, Grit, was "too much of a ripoff from Darkest Dungeon". It was replaced by **Fatigue and Exposure**, the owner's choice from four options. The trial save went to v2, with a migration and a test.
- **Reviewers.** Engine, writing, UI, balance and systems all ran. Their fixes are in. The critical systems findings are fixed:
  - the debt falling due mid-trip;
  - negative crowns locking the game;
  - sponsors expiring mid-trip;
  - the hire-and-dismiss gear loop;
  - Kiln Engine farming;
  - members left down after a trap.

## What was checked

- `npm run check`: types, 60 tests including 16 new expedition tests, story checker at 0 violations, style checker.
- `npm run fingerprint` is unchanged: `39f9b740…565a`. The classic engine is untouched.
- `npm run exp:sim`: the numbers are in `docs/EXPEDITIONS.md` §9c.
- Browser screenshots at 390×844: `docs/previews/expeditions/`.
- The UI reviewer checked 360 and 390 px in both themes.
- **Sample logs:** `docs/playthroughs/expeditions/` (well prepared, poorly prepared, somebody dies). Regenerate them with `npm run exp:logs`.
- **Preview:** a private Artifact, built with base `./` and the offline worker off (`VITE_NO_SW=1`). It's inlined into one page.

## What's open

- **Names to approve:** Old Pellam and its three zones, Fatigue, Exposure, wet masks, the monster names, and the Infirmary and Taproom.
- **Balance:**
  - Short expeditions are safe with good prep (0 deaths). That's a low-risk income loop. Possible fixes: thinner finds when the same zone is repeated, or a small death floor.
  - Medium with good prep is 97% intact, perhaps a touch safe.
  - Draughts skip the death roll entirely, and they carry long expeditions. Halving the roll instead is the owner's call.
- **Not exercised in a browser:** the game-over screen and a sponsor being picked.
- **Smaller points the reviewers left:**
  - Training costs crowns without a confirmation.
  - Taps on squad cards can land on the Rest/Train toggle.
  - A wanderer line can use the wrong plural ("the pale hogs" when it's one hog with rats).
  - "it hates that" notes repeat on every weak hit.
- **If the owner keeps the trial:**
  - decide what happens to the story scenes, Dates and the Council (they're hidden now);
  - make Old Pellam canon in `docs/STORY.md` §5d;
  - write a CHANGELOG entry;
  - fold the trial save into the main save, or keep it separate.

## Commands

`npm run exp:sim`, `npm run exp:logs`, `npm test`. For the preview: `BASE_PATH=./ VITE_NO_SW=1 npx vite build --outDir <dir>`, then inline the JS and CSS into one page.
