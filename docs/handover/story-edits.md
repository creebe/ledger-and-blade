# Hand-over: story-edits (v0.16.1)

The owner edited the story document (Claude Doc `573eec1b-f345-41c5-8b8d-627a0b6fc2a2`) by hand. Those edits went into the game in PR #23, which is merged and live as v0.16.1. The doc and its snapshot are now synced to v0.16.1.

## What was done

- **Read the doc.** There were no comment threads in any of the four tabs, so nothing needed a reply.
- **Diffed every tab** against `docs/story/doc-snapshot/` (de15a46, v0.15.2), using the normalisation in `docs/story/README.md`. Two extra steps were needed:
  - Soft line breaks inside list items come back joined into one line, so I joined paragraph lines on both sides before comparing.
  - Tab intro headings and `\&` come back from the export as noise, so I ignored them.
- **The owner's 21 edits** were all in the Silver thread: the `charter` scene, the `BACKER_LINE` table, `silver_summons` and the `silver_convoy` contract. I applied them word for word. The only exception was a curly apostrophe in "they’d", which I made straight.
  - The owner edited the contract only in its Story threads copy. The code has one source, so the World text copy was updated at the sync.
- **The owner's answers to the questions on the PR** (passed on by main) were:
  - Keep Jory's "get them ready" line. The bible now lets Jory say how serious the risks are, but he still never coaches (cast table, beat 1 note, §7 registers).
  - Cut the roof leak from Codex `jory`.
  - Make street talk `start_coop` say "your charter".
  - Apply all seven wording notes: "round", "get them ready", "goes on", "underlined twice", "either bank", Fenn's "I'm sorry to ask, but I need someone to see it safely to…", and the Harbor phase's "watch who else is on the quay". The last two are Claude's wording, written to the owner's brief.
- **Synced the doc in place** after the merge, with `find` replacements on the old words:
  - Story threads: the final Silver wording.
  - World text: Codex `jory`, `silver_convoy` description and phase, `crier:start_coop` and `tutorial:read_odds`.
  - Reports and interface: the v0.16.0 UI lines. I added an `ui/kit/odds.tsx` section and replaced the Contracts, HelpSheet and PrepSheet tables whole, because their IDs were renumbered. There were no comments, so nothing could detach.
  - Expeditions: one new row, `dive.ts#fill.1`.
  - Re-exported all four tabs afterwards: they match the new snapshot, apart from the known export noise.
- **Committed the new snapshot** on `claude/story-doc-sync`.

## Checked

- `npm run check` on the PR head: 87 tests passed. Story checker: 0 violations, 0 unreached, no unused facts. Style flags 40, the same as before.
- The story reviewer (coherence) and the writing reviewer ran twice. They found nothing broken, and only the optional notes the owner then accepted.
- Not run: the sim, the fingerprint and the playthroughs, since the change is text only.

## Open

- Nothing from the owner is pending.
- The diff tooling lives only in this session's scratchpad. A later session would benefit from a small script, `npm run story-diff`, that exports the tabs and compares them with the paragraph-joining normalisation described above.
