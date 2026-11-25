## Thread: The Lower Town

Dagny Fell, Porters' Fraternity. The bread riot, the dock tips and Dagny's brother at the chain.

### Bread and Stones

`bread_riot` · Story beat 5 · data/events.ts:244

**When:** Weeks 5–7; when unrest clock >= 31 or week >= 7; needs alive: Dagny Fell; 45% a week inside the window.

> The grain levy came in at dawn. By noon the Lower Town had overturned two bakers' carts and broken most of the Weighhouse windows. Now there are porters at your door asking for help, and an Exchequer clerk behind them holding a purse.

- **Feed them from the guild stores** · _Give 8 Supplies. Lower Town +10, Unrest −5._ · (needs supplies: 8) · `bread_riot/root/c1`
  “Your people hand out loaves from the stores, and the crowd in the street thins out as word gets round.”
  → goes to node `dagny`
  Sets `riot_fed`.
- **Pay the bakers to open their ovens** · _−35 crowns. Lower Town +8, Unrest −4._ · (needs crowns: 35) · `bread_riot/root/c2`
  “You pay three bakeries to keep their ovens going all afternoon. It turns out to be hard to throw stones with your mouth full.”
  → goes to node `dagny`
  Sets `riot_fed`.
- **Take the Exchequer's purse and clear the square** · _+60 crowns, Exchequer +5, Lower Town −5. What happens next is up to you._ · `bread_riot/root/c3`
  “Your people pick up cudgels and shields and head for the bread market.”
  → goes to node `square`
- **Bar the doors** · _Unrest +4._ · `bread_riot/root/c4`
  “You lock up and wait. It's over by nightfall, the city is angrier than before, and your crew spent the day listening to it through the shutters.”

**Node `dagny`**, Dagny Fell, Porters' Fraternity

> One of the porters stays behind when the rest have gone, a big woman with a cargo hook hanging from her belt.
>
> "Dagny Fell. I carry for the Fraternity." She looks round your hall. "Nobody feeds us for free, so what do you want for it?"

- **"Your ears on the docks."** · _+2 Intel now. Dagny becomes a contact._ · `bread_riot/dagny/c1`
  “"All right. If something comes off a boat, I'll know about it, and then you will too."”
  Sets `dagny_contact`.
- **"Nothing. Eat."** · _Lower Town +4_ · `bread_riot/dagny/c2`
  “She looks at you as if you've said something stupid, then laughs. "You're mad. All right." By the end of the week she has told the story in every tavern on the river.”
  Sets `dagny_friend`.

**Node `square`**

> The bread market is packed. A stone bounces off somebody's shield, and the crowd pushes forward to see what you'll do about it.

- **Hold the line without drawing blood** · _Endurance check. Success: Unrest −2, Exchequer +3. Failure: someone is hurt, Unrest +2._ · (endurance check, difficulty 9) · `bread_riot/square/c1`
  On success: “Your people lock shields and stand there taking the shoving until the crowd gets bored and goes home. Nobody swings a cudgel. Even the porters admit it took some nerve.”
  On failure: “The line gives way. One of yours ends up on the ground under a lot of boots before you get things back in hand.”
  Sets `riot_held`; on failure sets `riot_broken`.
- **Break them up** · _Exchequer +5, Lower Town −6, Unrest +3, Heat +3_ · `bread_riot/square/c2`
  “It's over in a few minutes, and the Exchequer clerk is delighted. The Lower Town knows exactly whose cudgels they were.”
  Sets `riot_broken`.

**Leads to:**

- `dagny_contact` → **Dagny Asks** (`dagny_brother`), **Word from the Docks** (`dagny_tip`), codex "Dagny Fell" (`dagny`), Date "The Porters' Feast" (`porters_feast`)
- `dagny_friend` → **Dagny Asks** (`dagny_brother`), codex "Dagny Fell" (`dagny`), Date "The Porters' Feast" (`porters_feast`)
- `riot_broken` → **Under the Chain** (`pask_chain`), **A Letter from Fenn** (`fenn_letter`)
- `riot_fed` → **Under the Chain** (`pask_chain`), **A Letter from Fenn** (`fenn_letter`)
- `riot_held` → **A Letter from Fenn** (`fenn_letter`)

### Dagny Asks

`dagny_brother` · Story beat 11 · data/cast.ts:353

**When:** Weeks 11–15; after Bread and Stones (`bread_riot`); when (dagny_contact or dagny_friend); needs alive: Dagny Fell; 50% a week inside the window.

**Reads:** `dagny_contact` (set by **Bread and Stones** (`bread_riot`)); `dagny_friend` (set by **Bread and Stones** (`bread_riot`)); `pask_deal` (set by **Under the Chain** (`pask_chain`)).

_Speaker: Dagny Fell_

> Dagny comes in without knocking and doesn't sit down.
>
> "My brother Ansel got himself caught under the chain with a boat full of wool. The bank's toll-men have him in the chain-house, and in ten days he goes on a cart to the galleys at Anselm." She looks at the floor and then at you. "I don't ask people for things. I'm asking."[IF dagny_friend] 
>
> She doesn't mention the bread. She doesn't need to. [END]

- **We'll get him out.** · _Adds the story contract "Ansel Fell at the Chain". Success: Lower Town +10._ · `dagny_brother/root/c1`
  “"Right." She nods once and leaves before either of you has to say anything else.”
  Adds story contract **Ansel Fell at the Chain** (`ansel_chain`).
- **Get him out, and ask Wenna Pask about the chain-house** · _Adds the contract and reveals one of its dangers. Mudlarks +3._ · `dagny_brother/root/c2`
  Shown only if: pask_deal.
  “Pask knows the chain-house well, because two of her cousins have been in it. She draws you a plan on the back of a tide table.”
  Adds story contract **Ansel Fell at the Chain** (`ansel_chain`).
- **Pay his fine** · _−90 crowns. Ansel is freed. Lower Town +6._ · (needs crowns: 90) · `dagny_brother/root/c3`
  “The toll-captain counts the coins twice and lets Ansel out. He's thinner than Dagny and a lot less polite. She cuffs him round the ear in the street.”
  Sets `ansel_freed`.
- **We can't.** · _Dagny −25, Lower Town −3. She stops sending you dock gossip._ · `dagny_brother/root/c4`
  “"No. I didn't think so." She goes. No more scraps of sacking come to the door after that.”
  Clears `dagny_contact`.

**Leads to:**

- `ansel_freed` → **Half a Year** (`act1_slice_end`)

#### Story contract: Ansel Fell at the Chain

`contract:ansel_chain` · data/contracts.ts:717

- _type:_ “Story”
- _titles[1]:_ “Ansel Fell at the Chain”
- _description:_

  > Dagny's brother Ansel was caught smuggling wool under the river chain, and the bank's toll-men are holding him in the chain-house. In ten days he goes to the galleys at Anselm. Talk him out, buy him out or break him out.

- _phases[1]:_ “The Chain-House: Find out who holds the keys and what they want.”
- _phases[2]:_ “Getting Him Out: Out the door, or out the window.”
- _expire.title:_ “Ansel Fell goes to the galleys”
- _expire.text:_

  > Nobody came for Ansel. The toll-men put him on a cart for Anselm with six others, and Dagny walked beside it as far as the city gate.

- _Sets:_ `ansel_freed` → **Half a Year** (`act1_slice_end`); `ansel_lost` → **Half a Year** (`act1_slice_end`)

### Word from the Docks

`dagny_tip` · Follow-up · data/events.ts:595

**When:** when dagny_contact; needs alive: Dagny Fell; random draw, weight 2; not again for 6 weeks.

**Reads:** `dagny_contact` (set by **Bread and Stones** (`bread_riot`)).

_Speaker: Dagny Fell_

> A porter's boy brings round a scrap of sacking with a few words chalked on it, and Dagny's mark underneath.

- **Read it** · _+2 Intel_ · `dagny_tip/root/c1`
  “It's mostly dock gossip, but some of it is useful.”
