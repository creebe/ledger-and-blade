# Backlog

What's next, what's open, and what to watch after each release. Main keeps this current; workstream sessions suggest additions in their hand-over notes.

## To watch from v0.11.0 (live since 2026-11-24)
- **The new UI by hand on a phone:** Best squad, order chips on the Roster, Realm sub-tabs, tappable Hall alerts, and The Loan.
- **Follow-ups from the audit:** the "Collect rewards" pill is truncated in the bar above End Week on the Realm; the toast briefly covers a sheet's title; the light-theme warning orange is still close to the bad red.

## To watch from v0.10.2
- **The owner's first phone playtest** of everything since v0.8.1: the new voice, the cast, varied starts, Legends and guild wars, with the easier first year.
- **Old saves.** Players with a v0.8.1 autosave will load it through `migrateSave()` for the first time on the live site. Watch for any report of a broken save.

## Still to watch from v0.10.0
- **Difficulty.** Eased in v0.10.2 on the owner's word: the careful bot's first-year survival is back to about 69% (it had fallen to about 58%). Watch whether a real player finds year one too easy now.
- **Guild wars by hand.** About a third of games drift into a feud in year one. Nobody has yet played a war by hand to see whether it is fun, too punishing, or too easy to avoid.
- **Legends by hand.** About one per campaign by year two in bot games. Check that it feels earned and not too slow for a real player.
- **Nothing since v0.8.1 has been played on a phone.**

## Next up (proposed, not yet requested)
- **Act II: Default** (Year 2). The Crown's choice, the Council as the battlefield, the Fourteen split. Outline in `docs/STORY.md` §6.
- Remaining scenes for the cast (Act II and III threads in `docs/CAST-PROPOSAL.md`).
- Whether Saint Oda's, the Fourteen and the Mudlarks get Council seats (an Act II question).
- The end-game: Acts III and IV, endings, and what happens after.

## Housekeeping
- `src/styles.css` is one 1,700-line file. Split it by area when a UI workstream next touches it.
- The style checker has about 26 flags, mostly false positives (initials, "two hundred and eighty", deliberate character voice). Consider teaching it those cases.
