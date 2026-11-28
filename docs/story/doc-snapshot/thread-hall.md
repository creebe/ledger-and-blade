## Thread: The hall

Jory Abbot and the members. The guild's own people: Jory, the dead, wages, Legends.

### A Tavern Brawl

`brawl` · Follow-up · data/events.ts:576

**When:** picks a member where m.status is 'idle'; random draw, weight 2; not again for 6 weeks.

> {member full name} has put a Weighhouse clerk through the front window of the Copper Kettle.[IF m.traits.includes('hotheaded')]  Nobody who knows them is surprised. [END] The clerk wants compensation, and the watch would like a word.

- **Pay the damages** · _−25 crowns_ · (needs crowns: 25) · `brawl/root/c1`
  “You pay the glazier and the clerk, and the watch loses interest.”
- **Dock {member}'s wages** · _{member}: loyalty −12. Weighhouse +2_ · `brawl/root/c2`
  “They take it without arguing, but they don't like it.”
- **Stand by {member}** · _Weighhouse −4, Heat +3. {member}: loyalty +10. Everyone: morale +4_ · `brawl/root/c3`
  “Your crew cheer. The Weighhouse sends a letter.”

### A Matter of Wages

`raise` · Follow-up · data/events.ts:590

**When:** picks a member where m.status is 'idle' and (m.traits.includes('greedy') or m.level >= 3); random draw, weight 1.5; not again for 10 weeks.

_Speaker: Your member_

> {member full name} catches you in the counting-room. "I've bled for this guild[IF m and m.missions > 0]  on {m.missions} contract[IF m.missions > 1] s [END] [END], and I hear Hobb's people get two crowns a week more than I do."

- **Grant the raise** · _{member}: wage +2/week, loyalty +15_ · `raise/root/c1`
  “They nod and go back to work, looking pleased with themselves.”
- **Bargain** · _Guile check. Success: +1 wage, loyalty +10. Failure: loyalty −10._ · (guile check, difficulty 12) · `raise/root/c2`
  On success: “You meet in the middle. Neither of you is entirely happy, which is probably fair.”
  On failure: “You push too hard, and they walk out halfway through your sentence.”
- **Refuse** · _{member}: loyalty −15_ · `raise/root/c3`
  “"Fine," they say, and leave without closing the door.”

### A Letter from Home

`homesick` · Follow-up · data/events.ts:613

**When:** picks a member where m.status is 'idle'; random draw, weight 1.2; not again for 12 weeks.

> A letter comes for {member full name}. Their mother is ill in Harrowmere, and the physician wants paying before he'll come out.

- **Pay the physician** · _−20 crowns. {member}: loyalty +20, morale +10_ · (needs crowns: 20) · `homesick/root/c1`
  “{member} doesn't say much about it, but they work twice as hard that week.”
- **Give them time off** · _{member}: fully rested, but the worry wears them down (health −20)_ · `homesick/root/c2`
  “They ride for Harrowmere and come back a week later, thin and grateful.”
- **The guild needs them here** · _{member}: loyalty −8, morale −12_ · `homesick/root/c3`
  “They stay, but you catch them reading the letter again at supper.”

### Bad Nights

`nightmares` · Follow-up · data/events.ts:626

**When:** when members.some((m) => m.status is 'dead' and (m.diedWeek ?? -99) >= week - 6); picks a member where m.status is 'idle' and m.missions > 0 and members.some((d) => d.status is 'dead' and (d.diedWeek ?? -99) >= week - 6); random draw, weight 3; not again for 8 weeks.

> {member full name} hasn't slept properly since {dead.name ?? 'the funeral'} died. You keep finding them in the hall after midnight, cleaning a blade that's already clean.

- **Send the Chaplain to talk with them** · _{member}: morale +18_ · `nightmares/root/c1`
  Shown only if: living(s).some((x) => x.profession is 'chaplain' and x.id is not m.id).
  “They talk until it gets light. The next morning {member} eats breakfast for the first time in a week.”
- **Drink with them** · _{member}: morale +10. Might pick up a habit._ · `nightmares/root/c2`
  “You drink to the dead until the candles go out, and neither of you is much use the next morning.”
- **Tell them to toughen up** · _{member}: morale −10, loyalty −5, but they might come out Brave_ · `nightmares/root/c3`
  “They take it badly. A few days later they're the first one up for drill.”

### A Volunteer

`volunteer` · Follow-up · data/events.ts:726

**When:** when lowertown standing >= 10; random draw, weight 1.2; not again for 10 weeks.

> A kid from the Lower Town, sixteen at most, has heard about your guild and wants in. They'll work for a bed and a small wage.

- **Take them in** · _A free recruit joins_ · `volunteer/root/c1`
  “They're green, but they turn up early every day.”
- **Send them home** · `volunteer/root/c2`
  “They leave disappointed, and try Hobb & Daughters next.”

### A Page in the Roll

`jory_page` · Follow-up · data/cast.ts:747

**When:** when members.some((m) => m.status is 'dead'); needs alive: Jory Abbot; random draw, weight 2; fires once.

_Speaker: Jory Abbot_

> Jory Abbot brings you the guild roll, open at {dead.name ?? 'the latest'}'s page. He has already written the date in the margin.
>
> "The guildmaster before last used to strike the dead through," he says. "The one after him kept their pages and hung their names in the hall. I'm only asking which you would like. I'll need more ink either way."

- **Hang their names in the hall** · _−15 crowns. Everyone: morale +8_ · (needs crowns: 15) · `jory_page/root/c1`
  “Jory paints the board himself, slowly, in good letters. People stop in front of it on their way out to a job.”
- **Strike them through** · _Everyone: morale −3_ · `jory_page/root/c2`
  “He does it with a ruler, so that the line is straight.”

### A Name in the Streets

`legend_named` · Queued scene · data/cast.ts:815

_Speaker: Jory Abbot_

> People have started calling {member full name} something. Jory has heard two versions in the Copper Kettle, and asks which one should go in the roll.
>
> "The other one will stick anyway," he says, "but it helps to have it written down."

- **"{name}"** · _The name the guild will use_ · `legend_named/root/c1`
  One choice per item of `epithetOptions(m)`.
  Shown only if: m.
  “Jory writes it in the roll in his best hand: {name}.”
  → goes to node `signature`

**Node `signature`**, Jory Abbot

> {member} has done this long enough to have a way of doing it. Jory wants to know what the rest of the guild will learn to count on.

- **{SIGNATURES[id].name}** · _{SIGNATURES[id].text}_ · `legend_named/signature/c1`
  One choice per item of `signatureOptions(m)`.
  Shown only if: m.
  “Within a month, the newer members are copying {member} without noticing.”

### In the hall: Jory's remarks

One line about one week in four, in the week report.

| ID | text | when |
|---|---|---|
| `jory:j_candles` | Jory has started weighing the candles before he lights them. | when crowns < 60 |
| `jory:j_loan` | Jory reminds you that the Weighhouse payment is due this week, and that he reminded you last week too. | when loans.some((l) => l.dueWeek - week <= 1 and loanStillDue(l) > 0) |
| `jory:j_watch` | Jory says a man from the watch has walked past the hall four times today, and he's starting to recognize the hat. | when heat >= 40 |
| `jory:j_renown` | Jory says people have started spelling the guild's name right in their letters. He thinks this is a good sign. | when renown >= 15 |
| `jory:j_candle` | Jory has left a candle burning in the hall. He doesn't say who it's for. | when members.some((m) => m.status is 'dead' and (m.diedWeek ?? -99) >= week - 1) |
| `jory:j_pegs` | Jory says the hall has run out of pegs for coats, and asks whether he should buy more pegs or hire fewer people. | when crew(s).length >= 8 |
| `jory:j_stores` | Jory says the stores are low, and that the rats noticed before you did. | when supplies < home(s).length * 2 |
| `jory:j_quiet` | Jory says supper was very quiet tonight, and asks whether somebody has died or is about to. | when crew(s).length > 0 and crew(s).reduce((a, m) => a + m.morale, 0) / crew(s).length < 35 |
| `jory:j_still` | Jory says the stillroom smells like a burned shoe, and wants to know whether that's normal. | when (facilities.stillroom ?? 0) >= 1 |
| `jory:j_letter` | Jory has pinned Fenn's letter to the wall above his desk, next to a recipe for eel pie. | when scene fenn_letter has happened |
| `jory:j_tapestry` | Jory dusts the tapestry every morning with a goose feather. He says it was like that when he found it. | when tapestry_bought |
| `jory:j_back_door` | Jory has put a second bolt on the back door of the stores, and a bell on the first one. | when (mudlarks standing ?? 0) <= -25 |
| `jory:j_lines` | Jory spent the morning re-ruling the ledger. He says the old lines were crooked, and that he drew them himself when he was young. |  |
| `jory:j_stove` | Jory says this is the coldest the hall has been since the second guildmaster, who sold the stove. | when (week - 1) % 48 >= 36 |
| `jory:j_hobbs` | Jory says one of the Hobb girls has been sitting in the window of the Copper Kettle all week, and that she's very good at not looking at the hall. | when hobbs active and hobbs aggression >= 0.6 |
| `jory:j_mayne` | Jory says Captain Mayne bought him a drink, and that he has never been recruited so pleasantly in his life. | when ninth_active and mayne status is 'alive' |
