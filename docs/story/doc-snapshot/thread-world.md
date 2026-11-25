## Thread: Varrow at large

No fixed character. Random world events that can fire any week.

### A Whisper in the Taverns

`lead` · World event · data/events.ts:579

**When:** when board.some((c) => c.hidden.some((h) => not h.revealed)); picks a member where m.status is 'idle' and ['envoy', 'infiltrator', 'scout'].includes(m.profession); random draw, weight 2; not again for 5 weeks.

> {member full name} comes back from the taverns smelling of cheap ale. "I heard something about that job, '{c.title}'. Want me to go back and dig?"

- **Dig** · _Reveals a hidden tag. {member}: fatigue +15_ · `lead/root/c1`
  “They go back out that night and come home with a name and a story.”
- **Not now** · `lead/root/c2`
  “They shrug and go back to the tavern anyway.”

### A Petition at the Gate

`petition` · World event · data/events.ts:617

**When:** random draw, weight 2; not again for 5 weeks.

> A widow from the Lower Town is waiting at your gate. The bank's collectors took her husband's tools last month, and she has three children to feed.

- **Give supplies** · _−6 Supplies, Lower Town +4, Renown +1_ · (needs supplies: 6) · `petition/root/c1`
  “She thanks you and goes. By the weekend half the street knows about it.”
- **Turn her away** · _Lower Town −1_ · `petition/root/c2`
  “She goes without arguing. Your gatekeeper watches her all the way down the street.”
