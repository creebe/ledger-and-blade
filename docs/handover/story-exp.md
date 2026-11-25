# Hand-over: story-exp (workstream 3, v0.13.1)

The story workstream for expeditions. Branch `claude/story-exp`, from main at v0.13.0. Not merged, not deployed.

## What was done

- **The story bible** (`docs/STORY.md`):
  - §5d is rewritten as "Expeditions". It covers how a trip reads (the yard and the door, the log's voice, Down below, the tiers) and a table of the seven sites, with their zones, patrons and who is met there. It describes Old Pellam's three zones and what lives in them, and the other sites and their people.
  - Also in §5d: what a contract's dangers bring; Exposure, the Sink fever and Sink changes; how the dives tie into each faction and the cast; and the acts.
  - §5b lists the eight door scenes. §2 adds Old Pellam to the places. §6b says what the Codex does and doesn't cover for expeditions. §7 has rules for log lines (keys per place, versions, "they") and for monsters (animals, people or mechanisms; nothing evil).
- **Contradictions fixed:**
  - The fever and Sink-change lines talked about "the Sink" or "the fen" when Exposure came from somewhere else: a fever on a Varrow job (`almshouse_watch`'s hidden Sickness), or bad air in Kell's gas traps.
  - Now the Saltfens have their own versions (the marsh fever). The town and overland sites have neutral ones, and the Lower Town's version blames its wells, which take Pellam's runoff. A fever never passes from person to person.
  - The cancel message for a squad whose door scene has fired no longer says "word from the door" can call it back.
  - Saint Oda's fever beds work before the guild meets Brune. The bible now says the beds are open to anyone who pays, and that the faction is known once you meet her.
  - "Bodies, not minds" was reworded so habits fit: habits are quirks, and there is no stress meter.
- **Writing pass** (writing reviewer): six noun-phrase openings in `lines.ts` became sentences, and the town change lines no longer mention a fever right after "There's no fever this time". The number of versions of every situation is unchanged, so the dive's random draws and the fingerprint are unchanged.
- **The story export** (`scripts/story-export.ts`) has an Expeditions part:
  - places, monsters and people: sites, zones (with who is met there, finds, curiosities and traps), Old Pellam's goals, monsters with where they are met, what each contract danger brings, Professions in a fight, the pack, goods, scars, habits and Sink changes;
  - Old Pellam's log, and the other sites' log, every line by situation under the source file's own headings, with IDs `line:<situation>.<n>`;
  - Down below and expedition report lines (`run.ts`, `dive.ts`, `prep.ts`, `migrate.ts`).
  - Expedition files are taken out of the generic rules section, so nothing is listed twice. The snapshot has four new files (`exp-world`, `exp-pellam`, `exp-sites`, `exp-reports`). `docs/story/README.md` gives the new IDs and which snapshot file goes in which tab.
- **The Claude Doc:**
  - I read all three tabs and their comments before changing anything. There were no comments and no owner edits; the only difference from the snapshot was the doc's own intro text. Reported to main.
  - A new Expeditions tab was added. The stale sections from v0.13.0 were updated in place, with main's go-ahead: the On the road thread, the Contracts, Legends, Facilities and tutorial rows, and the changed report and interface tables.
  - The snapshot in this branch is what the doc now holds.
- **Loose threads.** Main has a proposal for the seven outcomes nothing reacts to (`silver_abandoned`, `fenn_ally`, `weights_failed`, `isbet_betrayed`, `tapestry_sold`, `tapestry_lost`, `aske_plate_lost`), and has passed it to the owner.
  - For each one there is a Half a Year line and an expedition option (a door scene, or a site line).
  - I recommended the Half a Year lines, two door scenes and an Isbet variant of *Hobb's People Are Packing*. Site lines need the dive to read story facts, which is an engine change.
  - Nothing is built until the owner answers.

## What was checked

- `npm run check`: 59 tests, story checker at 0 violations, 0 unreached nodes and no unused facts. Style flags: 37, none on changed lines.
- `npm run fingerprint`: `63bb8491…a341d` before and after. The dive's outcomes are unchanged; only log text changed.
- `npm run sim` was not run: no numbers changed.
- The story reviewer checked the bible against the code and fixed seven statements: tiers, masks, Exposure sources, the fever at home, the road-home ambush and the Codex. The writing reviewer checked the new and existing expedition text.
- The doc sync was verified by exporting each tab and comparing it word by word with the snapshot.

## What's open

- **For the owner:**
  - The loose-threads proposal.
  - Whether Saint Oda's almshouse fever in Act I (the one the fever salts are for) is the Sink fever. The bible marks it open.
- **Codex:** Old Pellam, its zones and the dive's own monsters have no Codex entries. Pellam jobs unlock the Varrow entry.
- **Story contracts** are still walked on their region's one zone with a "walk the route" goal. Bespoke story sites and the "completable with the starting roster" check are still to do.
- **Small things left alone:**
  - The deserter's and guard's descriptions say "his" (they are monsters, not members).
  - `dark_room:overland` "keeps hearing something keep pace with them" is clumsy.
  - `trap_gas_disarm` has an extra "they" after the name.
  - Kell Mines yields iron, not silver. The bible says the silver is deeper than the upper workings go.
  - The `warded` tag's display name is "Warded", and the Fireborn description mentions drakelings. Both predate this work.
- **Re-syncing the doc:** after this merges, the doc already matches. The next text change follows `docs/story/README.md` step 5.
