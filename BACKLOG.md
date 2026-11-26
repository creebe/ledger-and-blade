# Backlog

What's next, what's open, and what to watch after each release. Main keeps this current; workstream sessions suggest additions in their hand-over notes.

## Expeditions: progress
Done: engine and Field UI (v0.13.0), story bible and export (v0.13.1), Act I payoffs (v0.13.2), six full sites (v0.14.0), feud and Legend balance (v0.14.1). Remaining items are under "Expeditions: still to do" below; the safe-short-trip income loop is still worth watching in the economy workstream.

## To watch from v0.15.0 (live since 2026-11-26)
- Does the prologue and hall tour make the start clear, without slowing a returning player down?
- Do scene endings, resting badges and loan credit read clearly on the phone?
- UI/UX Part 2 (session ui-ux is continuing): small buttons at 34px across the app; the Date "crowns after the bills" target shows as met before its week while the projection says otherwise; backers' "The money came from…" lines read as clashing with the Weighhouse loan; "Hire an Arcanist" offered when the college backer already gave Arcanists.

## To watch from v0.14.2 / v0.14.1 (live since 2026-11-26)
- Do feuds feel like a reaction to what the guild did? Is the "rising/cooling" note on the Realm card enough?
- Bosses: does each one feel like an event, and is the long return job worth taking?
- Legends: the owner set 115 fame in v0.14.2, about 1.0 per game started by week 96 (about 1.6 per guild that lasts). Does that feel right in play?
- War after killing a rival's leader now ends after about 23 weeks. Options if that feels wrong: keep aggression at maximum, slow the fade above the War line, or a cooling dispatch for the successor.
- iPhone: does the top bar now clear the clock? Do nested panels keep their place?

## Expeditions: still to do
- Spelling: "Draught" (Healing Draught, Draughts supply) and "Coldharbour" kept British for now; owner hasn't decided.
- Economy (workstream 5): dropped by the owner on 2026-11-26 ("we're okay with that now that we have the expeditions to balance things out"). Still worth watching the safe-short-trip income loop.
- Dive lines that read story facts (deferred by the owner).
- Housekeeping from the balance reviewer: recruit names include Jory and Fenn; the sim calls caution 0.5 "careful" while the brief calls 0.65 careful.

## To watch from v0.13.0 (live since 2026-11-25)
- Does reading a trip week by week feel "live", or does the wait between End Weeks drag?
- Are deaths too common or too rare for a careful player? The target is about two a year.
- Old saves with a squad already out: does it come home cleanly?
- Is the prep sheet clear about the risk of going down tired?
- Three squads with the Muster room: is Watch together still readable?

## To watch from v0.12.2 (live since 2026-11-24)
- **The final look on a phone:** the deeper red buttons in dark mode, the gauge icon for Heat, and the material colors. `docs/DESIGN-TOKENS.md` is now the reference for every color and type choice.
- **PR #6** (the story document's export script) is waiting for the owner's yes. The owner's comments in the story document will become a writing workstream.

## To watch from v0.12.0
- **Dates by hand.** Check that a Date feels reachable in one sitting, that a missed one stings without snowballing, and that the twelve don't repeat too soon.
- **Saves move to v12.** v11 saves gain a Date when they load. Watch for any report of a broken save.
- **Difficulty.** The careful bot's first-year survival is now 73% (69% in v0.11.0), so Dates pay out a little. It's still inside the 65–75% target, but near the top.
- **Press-and-hold End Week.** Check it feels deliberate, not slow, on a phone.

## To watch from v0.11.0
- **The new UI by hand on a phone:** Best squad, order chips on the Roster, Realm sub-tabs, tappable Hall alerts, and The Loan.
- **Follow-ups from the audit** (pill truncation, toast over sheet titles, light-theme orange): fixed in v0.12.0, not yet checked on a phone.

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
