## Thread: The Weighhouse

Alderman Piet Coster. The guild's lender, the short weights at Hesketh's and Coster's own page.

### The Man with the Scales

`coster_interest` · Story beat 3 · data/cast.ts:182

**When:** Weeks 3–5; needs alive: Alderman Piet Coster; 50% a week inside the window.

_Speaker: Alderman Piet Coster_

> Alderman Piet Coster of the Weighhouse arrives with a clerk carrying a small brass balance in a velvet box. He sets it on your table, levels it with a coin and only then sits down.
>
> "Your first payment on the note falls due in week six: {loans[0].paymentDue ?? 48} crowns. I mention it because most new guilds forget, and then I have to send men, and the men charge me by the hour."
>
> He taps the balance. "I also have a small job, if you want it."

- **What's the job?** · `coster_interest/root/c1`
  → goes to node `job`
- **You'll have your forty-eight.** · _Coster +2_ · `coster_interest/root/c2`
  “"Good." He packs the balance away himself and checks the clasp twice.”

**Node `job`**, Alderman Coster

> "Hesketh, on Fish Quay. He sells grain by the bushel, and I think his bushel is short by about a fifteenth. I can't prove it myself. He's Weighhouse and I'm Weighhouse, and if I'm seen sniffing round his store there will be a meeting about it. I hate meetings."
>
> "Buy a sack and weigh it on honest scales, then get a look at the measure he keeps under the counter. If I'm right, I'll take forty crowns off your note."

- **Who buys from Hesketh?** · _+1 Intel_ · `coster_interest/job/c1`
  → goes to node `who`
- **Take the job** · _Adds the story contract "Short Weight at Hesketh's". Success: Weighhouse +6, Lower Town +4, loan −40._ · `coster_interest/job/c2`
  “"Good. Keep the receipt. Hesketh will say you bought the sack somewhere else."”
  Sets `coster_job`.
  Adds story contract **Short Weight at Hesketh's** (`false_weights`).
- **Ask for something now as well** · _Guile check. Success: loan −20 today, and the job. Failure: Coster −5, and the job._ · (guile check, difficulty 13) · `coster_interest/job/c3`
  On success: “He sighs, does a sum on the back of his hand, and agrees to take twenty off the note today.”
  On failure: “"No," he says. It turns out that is all he has to say about it. The job is still yours if you want it.”
  Sets `coster_terms`, `coster_job`; on failure sets `coster_job`.
  Adds story contract **Short Weight at Hesketh's** (`false_weights`).
- **Decline** · _Coster −10, Weighhouse −2_ · `coster_interest/job/c4`
  “"As you like." He writes something on a card and puts it in his waistcoat pocket.”

**Node `who`**, Alderman Coster

> "Half the bakers in the Lower Town. That's why the loaves are small, and why your porters threw stones at my windows last spring." He doesn't seem to hold the stones against them.

- **Take the job** · _Adds the story contract "Short Weight at Hesketh's". Success: Weighhouse +6, Lower Town +4, loan −40._ · `coster_interest/who/c1`
  “"Good. Keep the receipt. Hesketh will say you bought the sack somewhere else."”
  Sets `coster_job`.
  Adds story contract **Short Weight at Hesketh's** (`false_weights`).
- **Ask for something now as well** · _Guile check. Success: loan −20 today, and the job. Failure: Coster −5, and the job._ · (guile check, difficulty 13) · `coster_interest/who/c2`
  On success: “He sighs, does a sum on the back of his hand, and agrees to take twenty off the note today.”
  On failure: “"No," he says. It turns out that is all he has to say about it. The job is still yours if you want it.”
  Sets `coster_terms`, `coster_job`; on failure sets `coster_job`.
  Adds story contract **Short Weight at Hesketh's** (`false_weights`).
- **Decline** · _Coster −10, Weighhouse −2_ · `coster_interest/who/c3`
  “"As you like." He writes something on a card and puts it in his waistcoat pocket.”

**Leads to:**

- `coster_job` → **Half a Year** (`act1_slice_end`), **Coster Takes It Personally** (`coster_bank`)
- `coster_terms` → **Half a Year** (`act1_slice_end`), **Coster Takes It Personally** (`coster_bank`)

#### Story contract: Short Weight at Hesketh's

`contract:false_weights` · data/contracts.ts:664

- _type:_ “Story”
- _titles[1]:_ “Short Weight at Hesketh's”
- _description:_

  > Alderman Coster believes Hesketh's grain store on Fish Quay sells by a doctored measure. He needs someone outside the Weighhouse to buy a sack, weigh it on honest scales, and get a look at the measure Hesketh actually uses.

- _phases[1]:_ “The Purchase: Buy a sack like any other customer, and keep the receipt.”
- _phases[2]:_ “The Back Room: Get a look at the measure he keeps under the counter.”
- _expire.title:_ “Nobody went to Hesketh's”
- _expire.text:_

  > Coster's job sat on the board until Hesketh heard someone was asking about his measures and replaced them. Coster has noted it, as he notes everything.

- _Sets:_ `weights_exposed` → **Half a Year** (`act1_slice_end`); `weights_failed` → **Half a Year** (`act1_slice_end`)

### Coster Takes It Personally

`coster_bank` · Follow-up · data/cast.ts:596

**When:** when bank_paid_loan; needs alive: Alderman Piet Coster; random draw, weight 2; fires once.

**Reads:** `bank_paid_loan` (set by **An Offer from the Bank** (`bank_offer`)); `coster_job` (set by **The Man with the Scales** (`coster_interest`)); `coster_terms` (set by **The Man with the Scales** (`coster_interest`)).

_Speaker: Alderman Coster_

> Alderman Coster comes to the hall with his scales and doesn't take them out of the box.
>
> "I hear the bank holds part of your note now," he says. "I lent you that money when nobody else on the Weighhouse would.[IF coster_terms]  I took twenty off it for you without being asked twice. [ELSE IF coster_job]  I gave you work. [END] I'd like to know what I did wrong."

- **Apologize, and promise the Weighhouse first call on your work** · _Weighhouse +6, Coster +10_ · `coster_bank/root/c1`
  “"Well." He thinks about it. "First call. In writing." You put it in writing, and he takes the scales out after all, to check your coins.”
- **Tell him the bank offered a better rate** · _Weighhouse −3, Coster −15_ · `coster_bank/root/c2`
  “"It always is, at first," he says, and leaves the scales in the box.”

### Coster's Page

`coster_page` · Follow-up · data/cast.ts:660

**When:** when coster_ledger and not coster_exposed; needs alive: Alderman Piet Coster; random draw, weight 2; fires once.

**Reads:** `coster_exposed` (set by this scene); `coster_ledger` (set by **What Came Up in the Strongbox** (`pask_strongbox`)); `ostranders_open` (set by **A Visitor from Ostrander's** (`ostrander_agent`), **Quarter Day** (`quarter_day`), rules in `src/engine/actions.ts`).

> Coster's page is in your strongbox. He has been very polite to you lately, which suggests that he knows.

- **Lean on him** · _Loan −150. Weighhouse −3, Heat +3. Coster will never forgive you._ · `coster_page/root/c1`
  “You show him the page across his own counting table. He goes very still, then takes out a pen and reduces your note by a hundred and fifty crowns. His signature is not as neat as usual.”
- **Hand it to the Weighhouse masters** · _Weighhouse +8, Renown +2. Coster is finished in Varrow._ · `coster_page/root/c2`
  “The masters meet behind closed doors for a day and a half. Coster leaves for the coast the following week, with his scales.”
  Sets `coster_exposed`.
- **Sell it to Vorn** · _+80 crowns, Ostrander's +6. The bank gains a hold over the Weighhouse (Leverage +3)._ · `coster_page/root/c3`
  Shown only if: ostranders_open.
  “Vorn reads it standing up and pays you exactly eighty crowns. "That's what it's worth to us," she says. "What it's worth to him is a different number."”

**Leads to:**

- `coster_exposed` → **Half a Year** (`act1_slice_end`)
