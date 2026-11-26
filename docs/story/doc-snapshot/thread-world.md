## Thread: Varrow at large

No fixed character. Random world events that can fire any week.

### A Whisper in the Taverns

`lead` · World event · data/events.ts:586

**When:** when board.some((c) => c.hidden.some((h) => not h.revealed)); picks a member where m.status is 'idle' and ['envoy', 'infiltrator', 'scout'].includes(m.profession); random draw, weight 2; not again for 5 weeks.

> {member full name} comes back from the taverns smelling of cheap ale. "I heard something about that job, '{c.title}'. Want me to go back and dig?"

- **Dig** · _Reveals a hidden tag. {member}: fatigue +15_ · `lead/root/c1`
  “They go back out that night and come home with a name and a story.”
- **Not now** · `lead/root/c2`
  “They shrug and go back to the tavern anyway.”

### A Petition at the Gate

`petition` · World event · data/events.ts:624

**When:** random draw, weight 2; not again for 5 weeks.

> A widow from the Lower Town is waiting at your gate. The bank's collectors took her husband's tools last month, and she has three children to feed.

- **Give supplies** · _−6 Supplies, Lower Town +4, Renown +1_ · (needs supplies: 6) · `petition/root/c1`
  “She thanks you and goes. By the weekend half the street knows about it.”
- **Turn her away** · _Lower Town −1_ · `petition/root/c2`
  “She goes without arguing. Your gatekeeper watches her all the way down the street.”

### The Ninth's Colours

`ninth_colours` · Queued scene · data/cast.ts:785

**When:** needs alive: Captain Rufus Mayne.

_Speaker: Captain Rufus Mayne_

> Captain Mayne is at the hall before the squad has finished unpacking. He has heard, and so has half the Copper Kettle, because he told them on the way.
>
> "Abner Crewe!" he says. "I stood next to that man for twenty years. He could drill a goat to march in step, and he walked off with the colours, the daft sod." He looks at the bundle on the table and lowers his voice, which for Mayne means people in the yard can no longer hear him. "They were at Cassel Ford. What do you want for them?"

- **Give them back to the Ninth** · _The colours go. Renown +2, Mayne +20, the Ninth's renown +3_ · `ninth_colours/root/c1`
  “Mayne carries them out of the hall himself and down Tallow Street at the slow march, with nobody following. By evening the whole Ninth is drunk, and three of them have asked Jory whether the guild is hiring.”
- **Sell them to him** · _The colours go. +200 crowns, Mayne −5_ · `ninth_colours/root/c2`
  “Mayne pays in Crown Pennies and counts them out on the table one at a time. "Worth every one," he says. "I'll be telling the lads what it cost, mind."”
- **Hang them in the hall** · _The colours stay and are not for sale. Renown +3, Mayne −15, the Ninth grow more aggressive_ · `ninth_colours/root/c3`
  “Jory has them hung over the hall door, a little crooked. Mayne stands under them for some time, says the guild has a nerve, and then asks two of your people whether they have ever thought of soldiering.”
