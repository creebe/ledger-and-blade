# Hand-over: balance (v0.14.1)

Feuds and wars retuned, and Legends brought to the owner's new target. Branch `claude/balance`, from `claude/sites` (PR #14, v0.14.0), with its PR into `claude/sites` so the two ship together. Not merged, not deployed.

## The two problems, and what caused them

1. **Feuds and wars were wrong in both directions.** Only 3% of passive games reached a feud in year one, but 61% of all games (93% of those still running at week 96) were at open war by week 96. The sim bot never runs operations, so this was passive build-up.
   - **The cause** (measured with a temporary trace on every feud change, 300 games):
     - Nothing ever cooled a feud. Resentment (`0.7 × aggression − 0.3` a week) only grows, because a rival's aggression climbs +0.02 a week whenever your renown passes theirs.
     - Once a rival reached a feud, each of its own hostile moves added +3. More feud meant more moves, so it ran away to war. In year two the rivals' own moves added more feud than everything else put together.
   - **Constants alone couldn't fix it.** `FEUD_AT` and `WAR_AT` alone don't fix it, because the ramp is the same for every game.
2. **Legends.** The owner's target is now 1–2 Legends per game by week 96, and rarely before week 50. The base gave 0.77.

## What was done

- **Feud dynamics** (`core/tuning.ts`, `rivals/war.ts`):
  - **Feud fades every week, in proportion to its size** (`FEUD_DECAY 0.04`, with `FEUD_RESENT 1` and `FEUD_COOL 0.3`).
    - Left alone, the most aggressive rival settles at about 17.5, below a feud.
    - What tips a rivalry into a feud is what the guild does.
  - **A rival's own moves add +1, not +3** (`FEUD_THEIR_MOVE`), so a feud can't feed itself into war.
  - **Beating a rival to a contested job adds +9, not +3** (`FEUD_CONTESTED`).
    - Every passive year-one feud measured started in a week a contested job was won.
  - **Stages hold** (`FEUD_HOLD 6`, `WAR_HOLD 8`, stored as `Rival.stage`).
    - A stage, once reached, holds until the feud is clearly below its line.
    - A truce, a payment, a killing or the Assay comeback sets the stage at once (`setFeud`).
    - Without the hold, stages flickered: a +9 landed just over a line and decay pulled it back a week later. Feuds lasted a median of 3 weeks.
  - **`SAVE_VERSION` 15**, with a migration step and a test.
  - **The weekly drift goes through `raiseFeud`,** so a feud that grows or cools on its own is announced. There's a new line for open war cooling to a feud.
  - **A truce cools at least as fast as no truce** (`min(−3, natural)`).
- **Feedback:**
  - **Prep warning:** a contested job's prep warning names the rival and says the feud rises by 9 if the squad gets the job done. The PrepSheet's duplicate "want this job too" line is removed.
  - **Mission report:** it says "Feud +N".
  - **Realm card:** each rival reads e.g. "Feud 31/100, cooling", and the number rounds down so it agrees with the stage.
- **Story:**
  - **Humiliating Marta:** if it lands, the feud rises by 25, which makes it a feud at once. If she laughs it off, it rises by 15. The detail text says so.
  - **The new Master Assayer** starts at feud 40 (was 30).
  - **Marta's Wager** reads the held war stage.
  - **Street talk:** three lines now check that the person or firm is still alive.
  - **`docs/STORY.md`:** it gains "Feuds fade" as canon.
- **Legends:** `FAME_LEGENDARY` goes from 120 to 105. At 300 games, 110 gave 1.17 per game, 105 gave 1.45 and 100 gave 1.73.
- **Tools:**
  - `BotOpts.provoke` in `scripts/sim.ts`: smears every rival, intercepts at feud, raids at war, and prefers contested jobs and operations.
  - `npm run sim:long [games]` (`scripts/long-sim.ts`): reports feud and war rates for the passive and provoking bots, stage changes, feud length and Legends per game.
- **Docs:** `balance-reviewer.md` targets (Legends, wars, how to count), `CLAUDE.md` (the new command), `docs/DESIGN.md` (Legends and guild wars).
- **Previews:** `docs/previews/balance/` has the Realm card and the prep warning at 360 wide.

## What was checked

All rates are counted over every game started. About 30% of games end in year one.

**Wars and Legends** (`npm run sim:long 1000`):

| Measure | Base (`claude/sites`) | Branch | Target |
|---|---|---|---|
| Passive: feud in year one | 3.1% | 31.2% | about a third |
| Passive: ever at open war by week 96 | 61.0% | 9.2% | under ~15% |
| Passive: survivors at war in week 96 | 93.4% | 10.2% | |
| Passive: median feud length | n/a | 13 weeks | |
| Passive: stage changes within 4 weeks of the last | 0* | 11 (per 1000 games) | |
| Provoking: feud / war in year one | 78.7% / 67.0% | 82.6% / 57.8% | |
| Provoking: survivors at war in week 96 | 100% | 100% | still the usual outcome |
| Legends per game, by week 96 | 0.77 | 1.44 | 1–2, aim ~1.5 |
| Legends before week 50 | 0 (first week 68) | 0 (first week 58) | rare |

\* Feud on the base never fell back, so stages never flickered there. They just ended in war.

**Survival** (`npm run sim 1000`, 48 weeks):

| Bot | Base | Branch |
|---|---|---|
| Careful (0.5) | 71.1% | 69.5% |
| Cautious (0.65) | 64.3% | 63.4% |
| Bold (0.35) | 57.5% | 54.9% |
| Poor prep | 0.5% | 0.5% |

- Careful-bot deaths per expedition: 0.110 before, 0.114 after.
- The balance reviewer puts the 1.6-point careful drop down to extra year-one feud thefts, within noise. The per-start spread is tighter than on base.

**Other checks:**
- **`npm run check`:** 72 tests, including the feud settling point, the hold, tribute ending a war at once, the contested warning, and the v14 migration. Story checker at 0 violations, 0 unreached, no unused facts. `npm run build` passes.
- **Reviewers:** balance, systems, engine (twice), writing (twice), story and UI. Their fixes are in.
  - **UI:** a Playwright pass at 390 and 360 wide.
  - **Engine:** confirmed that every feud write keeps `stage` current.
- **Not checked:** the fingerprint, because this isn't a pure refactor. iOS Safari.

## What's open

- **For the owner:**
  - **Legends, per game or per survivor?** 1.44 counts every game started, which matches how the 0.78 baseline was given. Counted over games still running at week 96 it's 2.29, and 44% of those have three or more Legends. If the target means survivors, `FAME_LEGENDARY` should be about 112–120.
  - **A killing's war now ends.** Killing a Hobb sets feud to 100. If nobody fights on, it's open war for about 23 weeks, then a feud that lasts months; on the base it was permanent. Options: aggression 1 after a killing, a slower fade above `WAR_AT`, or a successor-specific cooling dispatch.
  - **Feud in year two.** Year-two feuds are common (mean top feud about 40 at week 96), but war isn't.
- **Story, small and not new:**
  - **Marta's Wager** can come after a humiliation once the feud cools, and she sends a cake.
  - **Codex entries for dead characters** stay in the present tense.
  - **Old text with a list of three:** the "has become personal" feud line in `raiseFeud` (your jobs, your stores and your people).
- **Code:** `.feud` in `styles.css` is a generic class name with one use, so rename it some time. `dates.ts` restates the war-stage rule (`hobbsAtWar`) to avoid a data→rules import.
