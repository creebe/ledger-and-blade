# Hand-over: the story document

Branch `claude/story-doc`. Docs and a script only; no file under `src/` changed.

## What was done

- **`npm run story-export`** (`scripts/story-export.ts`). It parses the source with the TypeScript compiler rather than running the game:
  - scenes come from `events.ts`, `cast.ts` and `field.ts`, in the order `registry.ts` lists them, including the menus built by helper functions (`vornQuestions`, `summonsChoices` and so on);
  - templates keep their placeholders (`{member}`), and text that branches shows every version (`[IF …] … [ELSE] … [END]`, `[DEPENDS ON …]` for lookup tables like `BACKER_LINE`);
  - facts set, cleared and read are traced through choices, contracts (`successFlag`, `failFlag`, `expireFlags`) and the rest of the content, which gives each scene its "Reads" and "Leads to" lines and the "Where threads cross" table;
  - other content items are any object literal with an `id` in the content files; rules and interface lines are any string of three or more words, grouped by function.
- **Output:**
  - `docs/story/all-writing.md`: everything in one file, with GitHub anchor links and a Mermaid thread map.
  - `docs/story/doc-snapshot/` (only with `--snapshot`): the exact sections pasted into the Claude Doc, plus the thread-map drawing.
- **The Claude Doc:** https://claude.ai/artifact/BmrzeQPvrndzLsvFtTBLgH, with three tabs: Story threads, World text, and Reports and interface.
- **`docs/story/README.md`**: IDs, and how a later session turns the owner's comments and edits into code (the "way back").
- `docs/STORY.md` §1 now points to the export; `CHANGELOG.md` has a docs-only entry; `package.json` has the script.

## Counts

48 scenes (71 conversation nodes, 199 choices), 271 content items, 315 lines from the rules and 285 interface lines. Thirteen threads: ten character threads with Act I beats, plus the hall, Varrow at large and On the road.

## What was checked

- `npm run check` passes: 42 tests, the story checker reports 0 violations, 0 unreached nodes and no unused facts. The style flags are advisory and come from existing game text.
- The thread-map drawing was looked at as rendered.
- One helper exported the World text tab and compared it line by line with the snapshot; it matched.

## Open

- **Seven outcome facts** are set but nothing reacts to them: `silver_abandoned`, `fenn_ally`, `weights_failed`, `isbet_betrayed`, `tapestry_sold`, `tapestry_lost`, `aske_plate_lost`. The story checker counts them as read only because its own contradiction test reads them. Half a Year mentions none of them. That's a story decision for the owner.
- **Interface text is approximate.** A sentence split by bold text or a button shows in pieces, and a few UI fragments may still be class names. Story and content text is complete.
- Choice numbers (`/c3`) and rules-line numbers (`#fn.2`) are positions, so they shift when choices are added. The text next to them is the reliable key.
- The doc is not regenerated automatically. After any text change merges, a session runs `npm run story-export -- --snapshot` and updates the changed lines in the doc in place (see the README).
