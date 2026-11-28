## Thread: The Assay Office

Master Assayer Corwin Plaice. Licensing the guild's magic.

### Clause Eleven

`plaice_inspection` · Story beat 14 · data/cast.ts:419

**When:** Weeks 12–18; needs alive: Master Assayer Corwin Plaice; 40% a week inside the window.

_Speaker: Master Assayer Corwin Plaice_

> [IF facilities.stillroom] A thin man with a leather satchel is standing in your stillroom when you come down in the morning. He has already taken the lids off three jars.
>
> "Corwin Plaice, Master Assayer. Your door was open, which under section four of the Reagents Charter counts as an invitation." He holds up a jar. "None of these are labeled to standard." [ELSE IF backer is college] A thin man with a leather satchel is waiting in your yard, reading the sign over your door.
>
> "Corwin Plaice, Master Assayer. I knew your founders at the college. I wrote the report on the fire." He looks over your hall. "I've kept your guild on my list since the day you were chartered." [ELSE] A thin man with a leather satchel is waiting in your yard, reading the sign over your door.
>
> "Corwin Plaice, Master Assayer. I'm making a list of the guilds in Varrow that use licensed magic." He looks over your hall. "You aren't on it yet. Everyone is, sooner or later." [END]
>
> "Under clause eleven, any guild that keeps reagents or keyed foci must hold a license from the Assay Office. The license is sixty crowns a year. The fine for not holding one is assessed at the time of inspection." He seems to enjoy saying "assessed".

- **Buy the license** · _−60 crowns. The Assay Office will not fine you._ · (needs crowns: 60) · `plaice_inspection/root/c1`
  “He writes it out in full, reads it back to you, and charges you another crown for the wax.”
  Sets `assay_active`, `assay_licensed`.
- **Slip him something to forget your name** · _−25 crowns. Guile check. Success: counts as licensed. Failure: the money comes back, with Heat +6, and Plaice takes it personally._ · (guile check, difficulty 15; needs crowns: 25) · `plaice_inspection/root/c2`
  On success: “He looks at the coins for a long time, then puts them in his satchel and writes "licensed" next to your name in pencil.”
  On failure: “He gives the coins back, writes down exactly how many there were, and thanks you for the evidence.”
  Sets `assay_active`, `assay_licensed`; on failure sets `assay_active`.
- **Have the Exchequer stay the matter** · _−3 Influence. No license, so Plaice will be back, and less patient._ · (needs influence: 3) · `plaice_inspection/root/c3`
  Shown only if: influence >= 3.
  “A letter from the Exchequer arrives the same afternoon. Plaice reads it twice, folds it into eighths and leaves without a word.”
  Sets `assay_active`.
- **We'll take our chances.** · _The Assay Office may inspect you and fine you._ · `plaice_inspection/root/c4`
  “"Most people do," he says, and adds your name to the list.”
  Sets `assay_active`.

**Leads to:**

- `assay_active` → codex "Master Assayer Corwin Plaice" (`plaice`), rules in `src/engine/story/scenes.ts`
- `assay_licensed` → rules in `src/engine/rivals/rival.ts`

### An Assay-Peddler

`peddler` · Follow-up · data/events.ts:715

**When:** random draw, weight 1.5; not again for 8 weeks.

> A peddler with an Assay Office license that expired last spring offers you a fire-keyed focus for well under the going price. He doesn't say where he got it, and you don't ask.

- **Buy it** · _−55 crowns, gain an Ember Focus, Heat +2_ · (needs crowns: 55) · `peddler/root/c1`
  “It works perfectly, which somehow makes it more suspicious.”
- **Decline** · `peddler/root/c2`
  “He tries the guild across the street.”
