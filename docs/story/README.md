# The story document

All the game's writing in one place, organized for a writer. There are two copies:

- **The Claude Doc** (private to the owner): https://claude.ai/artifact/BmrzeQPvrndzLsvFtTBLgH. The owner reads, edits and comments on this one, on their phone. It has three tabs:
  - **Story threads**: how to use the doc, the thread map, every scene by thread, what's planned, and what looks broken.
  - **World text**: contracts, the Codex, street talk, Dates, tutorial objectives, starts, Legends, and names and descriptions.
  - **Reports and interface**: lines the rules write (week report, dispatches, journals, warnings) and the text on screens and sheets.
- **`all-writing.md`** (this folder): the same content as one Markdown file, with links between scenes and a Mermaid thread map that GitHub draws. It is generated. Don't edit it by hand.

Both come from `npm run story-export` (`scripts/story-export.ts`). The script reads the source files rather than running the game, so a line built from a template shows its placeholders (`{member}`), and a line that changes with the story shows every version (`[IF riot_fed] … [ELSE] … [END]`).

## IDs

Every item carries an ID and its source file and line:

| Kind | ID | Example |
|---|---|---|
| Scene | scene id | `ostrander_agent` |
| Choice | scene/node/cN, counted in source order | `ostrander_agent/root/c2` |
| Contract, Codex, street talk, Jory, Date, objective, start, Legend | kind:id | `codex:varrow`, `crier:ship`, `date:first_payment` |
| Names and descriptions | group:id | `factions:oda` |
| Rules and interface lines | file#function.n | `engine/core/turn.ts#endWeekWarnings.1` |

Line numbers move as code changes; the IDs don't. Choice numbers and the `.n` on rules lines are positions, so check the text as well when you find one.

## How a later session turns the owner's notes into code

1. **Read the comments.** Use the Claude Docs connector: `read` the doc (`{"object":"project","id":"573eec1b-f345-41c5-8b8d-627a0b6fc2a2"}`) to list its tabs, then `query` the comment threads under each tab's body (`object: "utterance"`). Load the connector's guide first (`guide` with `topic.index`, then `topic.comments`). Each comment is anchored to the words it is about, and the nearest ID above those words says where in the code it goes.
2. **Find the owner's edits.** Read each tab's text and compare it with `docs/story/doc-snapshot/`, which holds exactly what was pasted into the doc. Any difference is an edit by the owner. The thread map's drawing and the line under it were added in the doc and aren't in the snapshot.
   - The connector's `export` as Markdown gives the easiest comparison, but it reformats some text that the owner didn't touch, so normalize both sides first: `_x_` comes back as `*x*`, square brackets come back escaped (`\[`), a paragraph starting with `[IF` can come back as `&#91;IF`, table separator rows are redrawn, and doubled blank lines are collapsed. Compare line by line, ignoring blank lines and spaces at the edges of table cells, which the doc may trim.
3. **Make the change in code** at the ID's source file, following `docs/STORY.md` §7 and the usual checks (`npm run check`, the writing and story reviewers). Placeholders in curly braces must stay filled from engine data.
4. **Answer in the doc.** Reply in each comment thread with what changed (or why it didn't), as a doc comment. Leave resolving threads to the owner.
5. **Sync the doc.** After the code change merges, run `npm run story-export -- --snapshot`, then update only the changed lines in the doc in place (a `replace` with a `find` target on the old words). Don't rebuild a tab: comments are anchored to the text, and replacing whole sections would detach them. Commit the new snapshot in the same pull request.

## Why re-running the export never wipes the owner's notes

`npm run story-export` writes only files in this folder. It never touches the Claude Doc. The snapshot (`doc-snapshot/`) is rewritten only with `--snapshot`, which a session runs when it syncs the doc. Until then the snapshot stays the baseline for finding the owner's edits.
