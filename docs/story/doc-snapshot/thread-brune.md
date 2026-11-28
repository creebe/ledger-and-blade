## Thread: Saint Oda's

Sister Agathe Brune. Fever salts from the Saltfens and the bank's donation.

### Fever Salts

`brune_salts` · Story beat 8 · data/cast.ts:257

**When:** Weeks 8–11; needs alive: Sister Agathe Brune; 45% a week inside the window.

**Reads:** `brune_q_bank` (set by this scene).

_Speaker: Sister Agathe Brune_

> A Sister from Saint Oda's is in your counting-room with her sleeves rolled up. She has already moved two of your chairs to get at the fire.
>
> "I'm Agathe Brune, the almoner, and you'll have to forgive me. It's colder in the almshouse than it is out there, and I've forgotten what my hands feel like." She sits. "I'll be quick, because I've left Sister Joan with forty people and one pot.
>
> "The Sink fever is bad down the hill this year. It's the water, it always is. I need salts from the Saltfens to treat it, and the apothecaries want two crowns an ounce. God may forgive them for that, but I won't."

- **We'll fetch the salts.** · _Adds the story contract "Salts for Saint Oda's". It pays little. Success: Saint Oda's +12, Lower Town +4._ · `brune_salts/root/c1`
  “"Thank you. Bring dry sacks. The salt is no good once it's wet, and neither are the people carrying it."”
  Sets `met_oda`, `salts_accepted`.
  Adds story contract **Salts for Saint Oda's** (`fever_salts`).
- **Ask how the almshouse pays for its firewood** · `brune_salts/root/c2`
  Shown only if: not brune_q_bank.
  → goes to node `bank`
  Sets `brune_q_bank`.
- **Give her the money instead** · _−40 crowns, Saint Oda's +8_ · (needs crowns: 40) · `brune_salts/root/c3`
  “She counts it, says a short prayer over it that is mostly about the apothecaries, and goes.”
  Sets `met_oda`.
- **We can't spare anyone.** · _Saint Oda's −4_ · `brune_salts/root/c4`
  “"No. Nobody can, this year." She puts your chairs back before she leaves.”
  Sets `met_oda`.

**Node `bank`**, Sister Brune

> "Some of it is the bank's money," she says. "Ostrander's gives to the almshouse every quarter. I preach against usury on Sunday, and on Monday I buy firewood with it."
>
> "If that bothers you, you could always give me something better to burn."

_Same choices as the opening (one shared menu)._

**Leads to:**

- `brune_q_bank` → **The Bank's Gift** (`brune_donation`)
- `met_oda` → **A Cake from Hobb & Daughters** (`marta_cake`), **The Bank's Gift** (`brune_donation`), codex "Sister Agathe Brune" (`brune`), Date "Saint Oda's Fair" (`oda_fair`)
- `salts_accepted` → **Half a Year** (`act1_slice_end`)

#### Story contract: Salts for Saint Oda's

`contract:fever_salts` · data/contracts.ts:692

- _type:_ “Story”
- _titles[1]:_ “Salts for Saint Oda's”
- _description:_

  > The almshouse needs fen salts for the fever, and the apothecaries want more than the Sisters can pay. The salts grow along the reed paths past the last causeway in the Saltfens. Sister Brune will pay what she can, which is not much.

- _phases[1]:_ “The Causeway: Two days on planks across the marsh.”
- _phases[2]:_ “The Salt Pans: Scrape the good salt and leave the poisoned beds alone.”
- _phases[3]:_ “Home Again: Carry it back dry.”
- _expire.title:_ “The fever salts never came”
- _expire.text:_

  > Nobody went to the Saltfens. Sister Brune bought what she could from the apothecaries on credit, and the almshouse buried four people that week.

- _Sets:_ `salts_delivered` → **Half a Year** (`act1_slice_end`); `salts_failed` → **Half a Year** (`act1_slice_end`)

### Saint Oda's Feast

`festival` · Follow-up · data/events.ts:738

**When:** when seasonOf(week) is 'Summer'; random draw, weight 3; not again for 40 weeks.

> It's Saint Oda's feast, when the guilds of Varrow are expected to be generous in public.

- **Host a feast** · _−40 crowns, Renown +3, morale +10_ · (needs crowns: 40) · `festival/root/c1`
  “The hall is full until dawn, and somebody breaks a bench.”
- **Give your people the day off** · _morale +5_ · `festival/root/c2`
  “Most of them sleep until noon.”

### The Bank's Gift

`brune_donation` · Follow-up · data/cast.ts:690

**When:** when met_oda and ostranders_open and week >= 16; needs alive: Sister Agathe Brune; random draw, weight 2; fires once.

**Reads:** `brune_q_bank` (set by **Fever Salts** (`brune_salts`)); `met_oda` (set by **Fever Salts** (`brune_salts`)); `ostranders_open` (set by **A Visitor from Ostrander's** (`ostrander_agent`), **Quarter Day** (`quarter_day`), rules in `src/engine/actions.ts`).

_Speaker: Sister Brune_

> Sister Brune catches you outside the bread market with a letter in her hand.
>
> "Ostrander's has offered the almshouse five hundred crowns. That's a year of firewood and a roof that doesn't let the snow in." She hands you the letter. The last paragraph asks, very politely, that the Sisters stop preaching about the Debt.
>
> [IF brune_q_bank] "You asked me once how I paid for the firewood. Now you know what it costs."  [END]"What would you do?"

- **Take the money** · _Saint Oda's +3, Ostrander's +4, Lower Town −4, Leverage +1_ · `brune_donation/root/c1`
  “She takes it. The sermon that Sunday is about the virtue of patience, and nobody in the Lower Town is fooled.”
- **Refuse it, and we'll help with the firewood** · _−50 crowns. Saint Oda's +10, Lower Town +3_ · (needs crowns: 50) · `brune_donation/root/c2`
  “She sends the letter back with one line written under the bank's signature. Your people spend a cold afternoon carrying wood up the almshouse stairs.”
- **Refuse it** · _Saint Oda's +4, Lower Town +2, Ostrander's −3_ · `brune_donation/root/c3`
  “"Good," she says. "I needed somebody to say it so I could stop arguing with myself." The almshouse is very cold that winter.”
