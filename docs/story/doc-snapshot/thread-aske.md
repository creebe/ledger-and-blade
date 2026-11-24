## Thread: The Fourteen

Lady Honora Aske. The family silver, before the bank's assessors arrive.

### The Family Silver

`aske_plate` · Story beat 16 · data/cast.ts:507

**When:** Weeks 17–22; after Quarter Day (`quarter_day`); needs alive: Lady Honora Aske; 45% a week inside the window.

**Reads:** `silver_lost` (set by contract **The Crown's Last Silver** (`silver_convoy`)).

_Speaker: Lady Honora Aske_

> A carriage that has seen better decades stops outside the hall. A woman in a very good coat with a very bad hem climbs down without waiting for the step.
>
> "Honora Aske. Lady Aske, if you like, though nobody has said it with a straight face since the assessors came.[IF silver_lost]  Since the Crown missed its payment, the bank has started listing what it's owed. They reach Aske next week." [ELSE]  The bank is listing what it will take if the Crown ever misses a payment. They reach Aske next month." [END]
>
> "I would like my family's silver to be somewhere else when they arrive. There are two hundred years of it, and most of it has our name engraved on it. I'm told this is illegal. I'm also told you're short of money."

- **Why not sell it and pay the bank?** · `aske_plate/root/c1`
  → goes to node `why`
- **We'll do it.** · _Adds the story contract "The Aske Silver". It is illegal and well paid. Success: Fourteen +14, Ostrander's −6, Heat +6._ · `aske_plate/root/c2`
  “She shakes your hand with both of hers and forgets to mention how much she is paying. It turns out to be a lot.”
  Sets `met_fourteen`.
  Adds story contract **The Aske Silver** (`aske_plate`).
- **Tell the bank's assessors** · _Ostrander's +8, Fourteen −20_ · `aske_plate/root/c3`
  “The assessors reach Aske two days early and list every spoon. Lady Aske signs the inventory herself and sends you a copy, with your name underlined.”
  Sets `met_fourteen`, `aske_betrayed`.
- **Not our business** · _Fourteen −3_ · `aske_plate/root/c4`
  “"No, I suppose it isn't." She climbs back into the carriage, and it takes the driver three tries to get the horse moving.”
  Sets `met_fourteen`.

**Node `why`**, Lady Aske

> "Because then it's just silver." She seems to think that is a complete answer, then tries again. "The castle can go. It's damp, and the roof costs more than I have. But I would like my grandchildren to eat off the same plates I did, even if they eat in a rented house."

- **We'll do it.** · _Adds the story contract "The Aske Silver". It is illegal and well paid. Success: Fourteen +14, Ostrander's −6, Heat +6._ · `aske_plate/why/c1`
  “She shakes your hand with both of hers and forgets to mention how much she is paying. It turns out to be a lot.”
  Sets `met_fourteen`.
  Adds story contract **The Aske Silver** (`aske_plate`).
- **Tell the bank's assessors** · _Ostrander's +8, Fourteen −20_ · `aske_plate/why/c2`
  “The assessors reach Aske two days early and list every spoon. Lady Aske signs the inventory herself and sends you a copy, with your name underlined.”
  Sets `met_fourteen`, `aske_betrayed`.
- **Not our business** · _Fourteen −3_ · `aske_plate/why/c3`
  “"No, I suppose it isn't." She climbs back into the carriage, and it takes the driver three tries to get the horse moving.”
  Sets `met_fourteen`.

**Leads to:**

- `aske_betrayed` → **Half a Year** (`act1_slice_end`)
- `met_fourteen` → codex "Lady Honora Aske" (`aske`)

#### Story contract: The Aske Silver

`contract:aske_plate` · data/contracts.ts:608

- _type:_ “Story”
- _titles[1]:_ “The Aske Silver”
- _description:_

  > Lady Aske wants her family's silver out of the castle before the bank's assessors list it. It is illegal, it is heavy, and the assessors could arrive any day.

- _phases[1]:_ “Packing: Wrap two hundred years of silver in straw, quietly.”
- _phases[2]:_ “The Back Road: The assessors have men on the main road.”
- _expire.title:_ “The assessors reached Aske first”
- _expire.text:_

  > Nobody went for the silver. The bank's assessors listed every spoon, and Lady Aske signed the inventory herself.

- _Sets:_ `aske_plate_saved` → **Half a Year** (`act1_slice_end`); `aske_plate_lost` → _nothing reads it_
