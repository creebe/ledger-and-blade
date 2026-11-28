## Thread: Ostrander's

Factor Maelis Vorn. The bank's office on Quay Street: work offers, the notice board and the loan.

### A Visitor from Ostrander's

`ostrander_agent` · Story beat 2 · data/events.ts:173

**When:** Weeks 2–3; needs alive: Factor Maelis Vorn; 60% a week inside the window.

**Reads:** `vorn_q_hobbs` (set by this scene); `vorn_q_people` (set by this scene); `vorn_q_want` (set by this scene); `vorn_slip` (set by this scene).

> There's a woman from Ostrander's in your front room. She got there before you were up, and she's been reading the notice board while she waited.
>
> "Maelis Vorn. I run the bank's office on Quay Street." She nods at the board. "You've spelled 'carriage' wrong."

- **Hear her out** · `ostrander_agent/root/c1`
  → goes to node `pitch`
- **Show her the door** · _Ostrander's −10, Lower Town +6_ · `ostrander_agent/root/c2`
  “She goes without arguing. By evening half the Lower Town has heard you threw the bank's woman out, and people you've never met are buying your crew drinks.”

**Node `pitch`**, Factor Vorn

> "We're owed money all over this city. Three hundred-odd debts at last count, and I've got four clerks and a dog to chase them." She doesn't smile, so it's hard to tell if the dog is a joke.
>
> "Most of it is knocking on doors and carrying things out. We pay when the job's done, and we pay better than the Exchequer. Which, to be fair, isn't hard."

- **What happens to the people you collect from?** · _Lower Town +2 (the porter outside hears you ask)_ · `ostrander_agent/pitch/c1`
  Shown only if: not vorn_q_people.
  → goes to node `people`
  Sets `vorn_q_people`.
- **Why not hire Hobb & Daughters? They do this already.** · _+1 Intel on your rival_ · `ostrander_agent/pitch/c2`
  Shown only if: not vorn_q_hobbs.
  → goes to node `hobbs`
  Sets `vorn_q_hobbs`.
- **What does the bank really want from Varrow?** · _Guile check: read between her lines_ · (guile check, difficulty 14) · `ostrander_agent/pitch/c3`
  Shown only if: not vorn_q_want and not vorn_slip.
  → goes to node `want`; on failure `want_fail`
  Sets `vorn_slip`; on failure sets `vorn_q_want`.
- **Let's talk terms.** · `ostrander_agent/pitch/c4`
  → goes to node `terms`

**Node `people`**, Factor Vorn

> "Nobody gets hurt, if I can help it. They lose whatever they put up against the loan. Sometimes that's a loom. Sometimes it's the house."
>
> "I know how it looks. But if the Crown stops paying, the treaty lets the bank close the river, and then everyone down there loses something. I'd rather it was looms."

_Same choices as node `pitch` (one shared menu)._

**Node `hobbs`**, Factor Vorn

> "We do use them. Marta charges whatever she likes, her girls are rough with people, and when a street riots, it's the bank's name on the stones." She picks a bit of lint off her sleeve. "I'd like someone else on the list."
>
> "She won't be happy about it, by the way. Better you hear that from me."

- **What happens to the people you collect from?** · _Lower Town +2 (the porter outside hears you ask)_ · `ostrander_agent/hobbs/c1`
  Shown only if: not vorn_q_people.
  → goes to node `people`
  Sets `vorn_q_people`.
- **Why not hire Hobb & Daughters? They do this already.** · _+1 Intel on your rival_ · `ostrander_agent/hobbs/c2`
  Shown only if: not vorn_q_hobbs.
  → goes to node `hobbs`
  Sets `vorn_q_hobbs`.
- **What does the bank really want from Varrow?** · _Guile check: read between her lines_ · (guile check, difficulty 14) · `ostrander_agent/hobbs/c3`
  Shown only if: not vorn_q_want and not vorn_slip.
  → goes to node `want`; on failure `want_fail`
  Sets `vorn_slip`; on failure sets `vorn_q_want`.
- **Let's talk terms.** · `ostrander_agent/hobbs/c4`
  → goes to node `terms`

**Node `want`**, Factor Vorn

> You don't answer straight away, and she's the kind of person who fills a gap. "Getting paid. And something to hold in case we aren't: the Anselm tolls, the Kell silver warrants."
>
> "And if the Crown does miss a payment, the treaty says we get to write the next one." She says it the way a clerk reads out a date, then moves straight on to rates.

_Same choices as node `pitch` (one shared menu)._

**Node `want_fail`**, Factor Vorn

> "To be repaid," she says. "It's a bank." She waits to see if you had a real question.

_Same choices as node `pitch` (one shared menu)._

**Node `terms`**, Factor Vorn

> "So. Do you want the work?"

- **We'll work for the bank.** · _Ostrander's +10, Lower Town −5. Unlocks bank contracts._ · `ostrander_agent/terms/c1`
  “"Good. You'll have something by the end of the week." On her way out she stops at the notice board and fixes your spelling with her own pen.”
  Sets `ostranders_open`, `vorn_fixed_board`.
- **We'll take your jobs case by case.** · _Ostrander's +3. Unlocks bank contracts._ · `ostrander_agent/terms/c2`
  “"That's what most people say at first." She writes something in a small book and leaves.”
  Sets `ostranders_open`.
- **Not today.** · _Ostrander's −2. You can court the bank later from the Realm screen._ · `ostrander_agent/terms/c3`
  “"Suit yourself. You know where Quay Street is."”

**Leads to:**

- `ostranders_open` → **Coster's Page** (`coster_page`), **The Bank's Gift** (`brune_donation`), contract **How Deep It Goes** (`pellam_deep`), contract **A Matter of Arrears** (`debt_collection`), contract **Deliver the Bank's Terms** (`deliver_terms`), contract **The Bank's Warrants** (`kell_sump`), contract **The Insurers' Survey** (`anselm_burrows`), Date "Ostrander's Reads the Books" (`vorn_books`), rules in `src/engine/actions.ts`
- `vorn_fixed_board` → **The Notice Board** (`vorn_board`)
- `vorn_q_hobbs` → _nothing reads it_
- `vorn_q_people` → codex "The Treaty of Cassel" (`the_treaty`)
- `vorn_q_want` → **The Notice Board** (`vorn_board`)
- `vorn_slip` → **Summoned to the Exchequer** (`silver_summons`), **The Notice Board** (`vorn_board`), codex "The Treaty of Cassel" (`the_treaty`)

### The Notice Board

`vorn_board` · Story beat 10 · data/cast.ts:306

**When:** Weeks 10–14; after A Visitor from Ostrander's (`ostrander_agent`), Summoned to the Exchequer (`silver_summons`); when silver_accepted and not silver_delivered and not silver_lost; needs alive: Factor Maelis Vorn; 50% a week inside the window.

**Reads:** `silver_accepted` (set by **Summoned to the Exchequer** (`silver_summons`)); `silver_delivered` (set by contract **The Crown's Last Silver** (`silver_convoy`)); `silver_lost` (set by contract **The Crown's Last Silver** (`silver_convoy`)); `vorn_fixed_board` (set by **A Visitor from Ostrander's** (`ostrander_agent`)); `vorn_q_want` (set by **A Visitor from Ostrander's** (`ostrander_agent`)); `vorn_slip` (set by **A Visitor from Ostrander's** (`ostrander_agent`)).

_Speaker: Factor Vorn_

> Vorn calls in on her way back from the river, with ink on her fingers and a ledger under her arm.[IF vorn_fixed_board]  She looks at your notice board first, sees that her correction has survived, and seems pleased. [ELSE]  She looks at your notice board first. 'Carriage' is still spelled wrong, so she takes out a pen and fixes it without asking. [END]
>
> "I hear you've taken the Crown's silver," she says. "I'd like to know when it leaves. The bank has a factor waiting at Anselm, and he hates waiting."

- **Tell her when the wagons leave** · _Ostrander's +6. The convoy will meet more trouble on the road._ · `vorn_board/root/c1`
  “She writes the date in her small book. "Thank you. That's very helpful." It occurs to you later that you have no idea who else reads that book.”
  Sets `vorn_told`.
- **Give her the wrong date** · _Guile check. Failure: Vorn −10._ · (guile check, difficulty 13) · `vorn_board/root/c2`
  On success: “You give her a date a week out. She writes it down and thanks you.”
  On failure: “She writes it down, then looks at you over the book. "That isn't true, is it?" She doesn't seem angry, only interested.”
- **Ask her straight out whether the bank wants the silver to fail** · _Vorn +5. Reveals a danger on the convoy._ · `vorn_board/root/c3`
  Shown only if: (vorn_slip or vorn_q_want).
  “"Some of the partners would prefer it," she says. "I wouldn't. A default makes a mess, and I'm the one who has to clean it up." Before she goes, she tells you which stretch of the road she would worry about.”
  Sets `vorn_honest`.
- **Tell her it's guild business** · _Vorn −3_ · `vorn_board/root/c4`
  “"Fair enough." She leaves without correcting anything else.”

**Leads to:**

- `vorn_honest` → **Quarter Day** (`quarter_day`)
- `vorn_told` → **Quarter Day** (`quarter_day`)

### An Offer from the Bank

`bank_offer` · Follow-up · data/events.ts:750

**When:** when ostranders standing >= 15 and loans.length > 0; needs alive: Factor Maelis Vorn; random draw, weight 1.5; not again for 12 weeks.

_Speaker: Factor Vorn_

> Vorn offers to buy part of your Weighhouse loan. The bank would pay off 200 crowns of it. In return, she says, the bank would expect "first refusal" on your time.

- **Accept** · _Loan −200, Ostrander's +5, Weighhouse −8, Lower Town −4_ · `bank_offer/root/c1`
  “Your debt is lighter, and you now owe some of it to the bank.”
  Sets `bank_paid_loan`.
- **Decline** · _Ostrander's −2_ · `bank_offer/root/c2`
  “"Fine," says Vorn, and writes something in her small book.”

**Leads to:**

- `bank_paid_loan` → **Coster Takes It Personally** (`coster_bank`), rules in `src/engine/story/scenes.ts`
