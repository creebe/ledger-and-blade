## Thread: The Mudlarks

Wenna Pask. The low-tide market round the toll chain and the river strongbox.

### Under the Chain

`pask_chain` · Story beat 7 · data/cast.ts:218

**When:** Weeks 6–10; needs alive: Wenna Pask; 45% a week inside the window.

**Reads:** `riot_broken` (set by **Bread and Stones** (`bread_riot`)); `riot_fed` (set by **Bread and Stones** (`bread_riot`)).

**Checks whether these happened:** **A Mudlark Informant** (`informant`).

> [IF scene informant has happened] The mudlark girl who sold you gossip comes back with a message.  [ELSE] A girl from the river, filthy to the knees, brings you a message.  [END]Somebody wants to meet you on the flats under Fish Quay at low tide, and you are to wear old boots.
>
> The somebody is a small woman in an oilskin coat, sitting on an upturned crate in the middle of the mud with a kettle on a brazier beside her. People around her are selling rope, nails, a ship's bell and most of a door.
>
> "Wenna Pask," she says. "Tea? It's river water, but I boil it."

- **Take the tea** · `pask_chain/root/c1`
  → goes to node `pitch`
- **Ask why she picked your guild** · `pask_chain/root/c2`
  → goes to node `why`

**Node `why`**, Wenna Pask

> [IF riot_fed] "You fed the Lower Town when the levy came in, and you didn't ask for anything." She shrugs. "Or you did, and Dagny's too proud to say. Either way, people down here like you." [ELSE IF riot_broken] "You broke heads in the bread market for the Exchequer, so you aren't squeamish. I find that useful in a friend." [ELSE] "You're new and you're short of money. Those are the two things I look for in a friend." [END]
>
> "The bank takes a toll on everything that comes under the chain, your supplies included." She points her cup at a gap in the river wall, where the water runs shallow over shingle. "Not everything comes under the chain."

- **We'll buy through you.** · _Mudlarks +22 (supplies cost 10% less at 20 or more). Heat +4, Ostrander's −3._ · `pask_chain/why/c1`
  “"Good." She spits in her palm and holds it out, and waits to see whether you'll shake it. You do. She seems a little disappointed.”
  Sets `met_mudlarks`, `pask_deal`.
- **Just this once. Sell us a cartload.** · _−25 crowns, +15 supplies, Mudlarks +6_ · (needs crowns: 25) · `pask_chain/why/c2`
  “Two boys bring the sacks up the river steps after dark. Nobody asks for a receipt.”
  Sets `met_mudlarks`.
- **Report her to the toll-men** · _Ostrander's +6, Mudlarks −30. At −25 or worse, things go missing from your stores._ · `pask_chain/why/c3`
  “The toll-men raid the flats the next morning and find a warm brazier and nothing else. A week later Pask's people start taking an interest in your back door.”
  Sets `met_mudlarks`, `pask_reported`.
- **Not for us** · _Mudlarks −2_ · `pask_chain/why/c4`
  “"Suit yourself." She goes back to haggling over the bell.”
  Sets `met_mudlarks`.

**Node `pitch`**, Wenna Pask

> "The bank takes a toll on everything that comes under the chain: grain, wool, salt, your supplies." She points her cup at a gap in the river wall, where the water runs shallow over shingle. "Not everything comes under the chain."
>
> "Buy through me and you'll pay what things are worth instead of what Ostrander's says they're worth. You'll also be breaking the treaty, but I don't think the treaty has ever done much for you."

_Same choices as node `why` (one shared menu)._

**Leads to:**

- `met_mudlarks` → **What Came Up in the Strongbox** (`pask_strongbox`), codex "Wenna Pask" (`pask`)
- `pask_deal` → **Dagny Asks** (`dagny_brother`)
- `pask_reported` → **What Came Up in the Strongbox** (`pask_strongbox`)

### A Mudlark Informant

`informant` · Follow-up · data/events.ts:613

**When:** random draw, weight 2; not again for 4 weeks.

> A girl from the river, maybe ten years old and filthy to the knees, says she'll tell you what she's heard on the docks if you make it worth her while.

- **Pay her** · _−15 crowns, +3 Intel_ · (needs crowns: 15) · `informant/root/c1`
  “She talks fast, and she knows things a ten-year-old shouldn't.”
- **Send her off** · `informant/root/c2`
  “She shrugs and goes off to find someone who will pay. Possibly Marta Hobb.”

### What Came Up in the Strongbox

`pask_strongbox` · Follow-up · data/cast.ts:624

**When:** when met_mudlarks and not pask_reported and week >= 13; needs alive: Wenna Pask; random draw, weight 2; fires once.

**Reads:** `met_mudlarks` (set by **Under the Chain** (`pask_chain`)); `pask_reported` (set by **Under the Chain** (`pask_chain`)).

_Speaker: Wenna Pask_

> [IF (crierSeen ?? []).includes('strongbox')] You heard about the strongbox the mudlarks pulled out of the river, the one that was empty.  [END]Wenna Pask sends for you at low tide. She has a wet strongbox open on her crate, and she isn't drinking tea.
>
> "It wasn't empty," she says. "Not quite. Somebody emptied it, threw it in and claimed the loss from the bank's insurers. But they left the lining in." She peels back the leather. Underneath is a folded page from a ledger, with a Weighhouse assay mark on every line and a signature at the bottom.
>
> "Piet Coster," she says. "Who'd have thought it."

- **Buy the page** · _−40 crowns. It gives you a hold over Alderman Coster._ · (needs crowns: 40) · `pask_strongbox/root/c1`
  “She folds it into a square of oilcloth for you. "Don't get it wet. It's the only thing in Varrow I'd call evidence."”
  Sets `coster_ledger`.
- **Trade gossip for it** · _−3 Intel. It gives you a hold over Alderman Coster._ · (needs intel: 3) · `pask_strongbox/root/c2`
  “She takes three pieces of gossip about the Weighhouse in exchange, and says two of them were new to her.”
  Sets `coster_ledger`.
- **Leave it** · _Mudlarks −1_ · `pask_strongbox/root/c3`
  “"Your loss." She sells it to somebody else before the tide comes in, and you never find out who.”

**Leads to:**

- `coster_ledger` → **Coster's Page** (`coster_page`)
