# Hand-over: story-threads (v0.13.2)

This builds what the owner agreed to from the loose-threads proposal: option (a), with no site lines and no engine change. It also settles the fever question. Branch `claude/story-threads`, from main after PR #10. Not merged, not deployed.

## What was done

- **Half a Year** (`act1_slice_end`, `events.ts`) has a line for each of the seven outcomes that had no echo:
  - `silver_abandoned`: the wagons waited at Wenmouth ford.
  - `fenn_ally`: Thursdays at the Exchequer's table.
  - `weights_failed`: Hesketh's bushels are still short.
  - `isbet_betrayed`: Isbet avoids the Copper Kettle (only while she is alive).
  - `tapestry_sold`: a wool merchant in Harrowmere has the Siege of Carrow.
  - `tapestry_lost`: the Siege of Carrow is keeping somebody's hay dry.
  - `aske_plate_lost`: Lady Aske blames the assessors.
- **Two door scenes** (`field.ts`), each fires at most once a game:
  - *The Crown's Wagons*. Needs `silver_abandoned` and a squad bound for Port Anselm. An Exchequer clerk is living in an empty Crown wagon at Wenmouth ford. Bringing him home gives Exchequer +3 and Fenn +10, and costs the squad fatigue +8.
  - *An Exchequer Writ*. Needs `fenn_ally`. Taking it means riding with the Crown's post-riders: fatigue −15 and Lower Town −2.
- **A cold Isbet.** When `isbet_betrayed` is set, *Hobb's People Are Packing* changes. If Marta is alive, Isbet sends her mother's regards and nothing else. Either way, she rides past the hall door without turning her head.
- **The almshouse fever is the Sink fever** (the owner's call). Brune's opening in *Fever Salts* now says "The Sink fever is bad down the hill this year. It's the water, it always is." The bible agrees.
- **One account of the abandoned silver.** The silver contract's expiry text now says the Exchequer's own guard took the wagons to Wenmouth ford and waited there until the ships had sailed. It used to say they sat in the Exchequer yard, which contradicted the new door scene.
- **Door-scene wording.** Lines like "the road to Drover's Road" and "The Saltfens" in mid-sentence are fixed with a small `placeOf` helper.
- **Bible** updates: §5 (#17 and the silver's expiry), §5b (ten door scenes; Fenn and the cold Isbet), and §5d (the fever decision, and the backlog item for site lines).
- **Tests:** the new door scenes fire and apply their effects, including the Isbet variant, and Half a Year has every new line, with Isbet left out once she's dead.

## What was checked

- `npm run check`: 61 tests pass. The story checker reports 0 violations, 0 unreached nodes and no unused facts. The story export now lists 0 problems; before, it flagged the seven outcomes with no echo.
- `npm run sim`, 100 games × 48 weeks, this branch against main. The numbers are identical:
  - careful: 72% first-year survival;
  - cautious: 65%;
  - bold: 52%;
  - poor prep: 1%.
  The new effects are small and rare.
- Story and writing reviewers. Their fixes are in. Three judgement calls were settled:
  - the Wenmouth account of the silver (the expiry text was changed to match);
  - Fenn still writes, so "Fenn hasn't written since" was cut;
  - the Isbet line no longer promises that Marta keeps sending cakes.
- **Coverage:** *An Exchequer Writ* and the cold Isbet both fired in the story checker's 400 games. *The Crown's Wagons* didn't: the silver is abandoned in about 4% of games, and a Port Anselm job then has to come up. The engine test proves it can fire and pay.
- **Fingerprint:** changed. That's expected, since new door scenes change what is eligible to fire. This was never a pure refactor.

## What's open

- **The Claude Doc** is not yet synced with this change. After it merges, run `npm run story-export -- --snapshot` and update these in place (`docs/story/README.md` step 5):
  - the On the road thread;
  - *Fever Salts*;
  - Half a Year;
  - the silver contract's expiry;
  - the door-scene openings.
- **Backlog:** site lines that read story facts, for example the Siege of Carrow in a Harrowmere window, or an Aske spoon in a road agent's pack. These need the dive to see facts.
