## Thread: The Crown's silver

Lord Treasurer Fenn, the Exchequer. The act's spine: the charter, the commission to carry the Crown's payment, Quarter Day and its aftermath.

### A Charter and a Debt

`charter` · Story beat 1 · data/events.ts:84

**When:** Week 1.

> The Exchequer's seal is still warm on your charter. As of this morning, Ledger & Blade may take paid work anywhere in the realm. It is also {loans[0].principal ?? 800} crowns in debt to the Weighhouse, which paid for the hall, the first wages and the sign over the door.
>
> [DEPENDS ON start.backer ?? 'merchant'] veterans: Four old soldiers paid for the charter out of their back pay. Two of them have already argued about where the weapon racks should go. [OR] merchant: A wool merchant on the Weighhouse paid for the charter. He has already sent a list of his wagons and the dates they leave. [OR] coop: The porters and small trades of the Lower Town paid for the charter, in coins so small that the Exchequer's clerk spent a morning counting them. [OR] college: Two Arcanists who were thrown out of the college after the fire paid for the charter with what they had left. One of them still smells faintly of smoke. [END]
>
> The Exchequer man who brought the charter glances at the empty weapon racks. "Quarter-day's in a few weeks," he says, as everyone in Varrow does lately. "Good luck."
>
> The hall came with a clerk, Jory Abbot, who has kept its books through three guildmasters and has already found the leak in the roof. He offers to show you round.

- **Let Jory show you round** · `charter/root/c1`
  → goes to node `people`
- **Skip the tour** · _Go straight to spending the last of the coin_ · `charter/root/c2`
  → goes to node `start`

**Node `people`**, Jory Abbot

> Jory starts in the common room, since the people cost the most. Your people are there, and have clearly been waiting: [IF names.length > 1] {names.slice(0, -1).join(', ')} and {names[names.length - 1]} [ELSE] {names[0] ?? 'nobody yet'} [END].
>
> "{crew.reduce((n, m) => n + m.wage, 0)} crowns a week in wages, whether there's work or not," Jory says. "I'd find them work."
>
> Each week, anyone at the hall can be given an order: rest, train, gather rumors, work the docks. Anyone badly hurt rests whatever you tell them.

- **On to the strongbox** · _Your people and their weekly orders are on the Roster_ · `charter/people/c1`
  → goes to node `loan`
- **That's enough for now** · `charter/people/c2`
  → goes to node `start`

**Node `loan`**, Jory Abbot

> The strongbox is under the stairs, and the ledger sits on top of it, open to a page that is mostly one number. "{l.principal ?? 800} to the Weighhouse," Jory says. "The first payment is {l.paymentDue ?? 48} crowns, in week {l.dueWeek ?? 6}, then one every four weeks after that."
>
> He turns the page back. "Miss three and they take the hall. I've seen it done. They took the chairs first."
>
> Paying early cuts the interest, and the Weighhouse counts it toward the next payment.

- **On to the notice board** · _The treasury and the loan are on the Hall_ · `charter/loan/c1`
  → goes to node `board`
- **That's enough for now** · `charter/loan/c2`
  → goes to node `start`

**Node `board`**, Jory Abbot

> By the door there is a notice board with nothing on it but a nail. "Work gets pinned there," Jory says. "Debts to chase and wagons to guard, mostly. Now and then something in the tunnels under the Lower Town that wants clearing out."
>
> You pick a job and the people for it, and they bring the pay home. Squads on the road can be followed week by week until they are back.
>
> Jory looks at the nail. "Most of them come home."

- **That's the hall, then** · _Jobs are on Contracts, and squads that are out are on the Field_ · `charter/board/c1`
  → goes to node `start`

**Node `start`**, Jory Abbot

> "There's a little left over from the Weighhouse money," Jory says. "I'd spend it before the roof does."
>
> How do you start?

- **Arm the guild** · _Gain a Mail Hauberk and 2 Fire Oils_ · `charter/start/c1`
  “You visit the armorers on Anvil Row. Your people will at least look the part.”
  Sets `start_arms`.
- **Hire a second Arcanist** · _Another college-trained Arcanist joins for free_ · `charter/start/c2`
  Shown only if: backer is college.
  “Word gets round the college that one of its own is hiring. A second Arcanist turns up the next morning with a sack of books and no questions about the fire.”
- **Hire an Arcanist** · _A college-trained Arcanist joins for free_ · `charter/start/c3`
  Shown only if: not (backer is college).
  “A young Arcanist from the college, short of fees, signs on for the work and the wage.”
- **Keep the coin** · _+80 crowns_ · `charter/start/c4`
  “You put it in the strongbox under the stairs. Eighty crowns is eighty crowns.”

**Leads to:**

- `start_arms` → rules in `src/engine/story/scenes.ts`

### Summoned to the Exchequer

`silver_summons` · Story beat 6 · data/events.ts:387

**When:** Weeks 7–9; after A Visitor from Ostrander's (`ostrander_agent`); needs alive: Lord Treasurer Aubrey Fenn; 50% a week inside the window.

**Reads:** `fenn_haggled` (set by this scene); `fenn_pay` (set by this scene); `fenn_route` (set by this scene); `fenn_stakes` (set by this scene); `silver_bonus` (set by this scene); `vorn_slip` (set by **A Visitor from Ostrander's** (`ostrander_agent`)).

_Speaker: Lord Treasurer Aubrey Fenn_

> Lord Treasurer Aubrey Fenn sees you in an office with pale squares on the walls where the tapestries used to hang. He apologizes for the cold.
>
> "The quarter payment is due, and for once we have it: three wagons of silver, most of what's left of the Crown plate. It has to reach Port Anselm and the bank's ships. I'd send my own guard, but half of them are owed back pay by the sort of people who'd like to see it stolen."

- **"Who knows the route?"** · `silver_summons/root/c1`
  Shown only if: not fenn_route.
  → goes to node `route`
  Sets `fenn_route`.
- **Tell him what Vorn let slip about the next treaty** · _Exchequer +4, Influence +2_ · `silver_summons/root/c2`
  Shown only if: vorn_slip and not fenn_stakes.
  → goes to node `stakes`
  Sets `fenn_stakes`.
- **"What does it pay?"** · `silver_summons/root/c3`
  Shown only if: not fenn_pay.
  → goes to node `pay`
  Sets `fenn_pay`.
- **Haggle** · _Guile check. Success: +60 crowns on the contract._ · (guile check, difficulty 14) · `silver_summons/root/c4`
  Shown only if: fenn_pay and not fenn_haggled and not silver_bonus.
  → goes to node `pay_ok`; on failure `pay_fail`
  Sets `silver_bonus`; on failure sets `fenn_haggled`.
- **Accept the commission** · _[IF fenn_route] Adds "The Crown's Last Silver". Fenn's tip reveals one of its dangers. [ELSE] Adds the story contract "The Crown's Last Silver". [END]_ · `silver_summons/root/c5`
  “"Thank you." He looks very tired. "Pick your people carefully. Somebody out there knows the route."”
  Sets `silver_accepted`.
  Adds story contract **The Crown's Last Silver** (`silver_convoy`).
- **Decline** · _Exchequer −12. The Crown will find someone else, probably Hobb & Daughters._ · `silver_summons/root/c6`
  “Fenn nods. "I understand." By evening the commission has gone to Hobb & Daughters.”
  Sets `silver_declined`.

**Node `route`**, Lord Treasurer Fenn

> "My clerks know the route. So does the guard captain, and so does Vorn, because the bank insists on knowing everything." He rubs his eyes. "If I wanted to rob it, I'd try the ford at Wenmouth. You can't see that stretch of road from either side."

- **"Who knows the route?"** · `silver_summons/route/c1`
  Shown only if: not fenn_route.
  → goes to node `route`
  Sets `fenn_route`.
- **Tell him what Vorn let slip about the next treaty** · _Exchequer +4, Influence +2_ · `silver_summons/route/c2`
  Shown only if: vorn_slip and not fenn_stakes.
  → goes to node `stakes`
  Sets `fenn_stakes`.
- **"What does it pay?"** · `silver_summons/route/c3`
  Shown only if: not fenn_pay.
  → goes to node `pay`
  Sets `fenn_pay`.
- **Haggle** · _Guile check. Success: +60 crowns on the contract._ · (guile check, difficulty 14) · `silver_summons/route/c4`
  Shown only if: fenn_pay and not fenn_haggled and not silver_bonus.
  → goes to node `pay_ok`; on failure `pay_fail`
  Sets `silver_bonus`; on failure sets `fenn_haggled`.
- **Accept the commission** · _[IF fenn_route] Adds "The Crown's Last Silver". Fenn's tip reveals one of its dangers. [ELSE] Adds the story contract "The Crown's Last Silver". [END]_ · `silver_summons/route/c5`
  “"Thank you." He looks very tired. "Pick your people carefully. Somebody out there knows the route."”
  Sets `silver_accepted`.
  Adds story contract **The Crown's Last Silver** (`silver_convoy`).
- **Decline** · _Exchequer −12. The Crown will find someone else, probably Hobb & Daughters._ · `silver_summons/route/c6`
  “Fenn nods. "I understand." By evening the commission has gone to Hobb & Daughters.”
  Sets `silver_declined`.

**Node `stakes`**, Lord Treasurer Fenn

> You tell him what Vorn said about the bank writing the next treaty. Fenn puts his pen down.
>
> "So they'd rather we missed it. That explains a few things." He looks at you properly for the first time. "Thank you. I won't forget that."

- **"Who knows the route?"** · `silver_summons/stakes/c1`
  Shown only if: not fenn_route.
  → goes to node `route`
  Sets `fenn_route`.
- **Tell him what Vorn let slip about the next treaty** · _Exchequer +4, Influence +2_ · `silver_summons/stakes/c2`
  Shown only if: vorn_slip and not fenn_stakes.
  → goes to node `stakes`
  Sets `fenn_stakes`.
- **"What does it pay?"** · `silver_summons/stakes/c3`
  Shown only if: not fenn_pay.
  → goes to node `pay`
  Sets `fenn_pay`.
- **Haggle** · _Guile check. Success: +60 crowns on the contract._ · (guile check, difficulty 14) · `silver_summons/stakes/c4`
  Shown only if: fenn_pay and not fenn_haggled and not silver_bonus.
  → goes to node `pay_ok`; on failure `pay_fail`
  Sets `silver_bonus`; on failure sets `fenn_haggled`.
- **Accept the commission** · _[IF fenn_route] Adds "The Crown's Last Silver". Fenn's tip reveals one of its dangers. [ELSE] Adds the story contract "The Crown's Last Silver". [END]_ · `silver_summons/stakes/c5`
  “"Thank you." He looks very tired. "Pick your people carefully. Somebody out there knows the route."”
  Sets `silver_accepted`.
  Adds story contract **The Crown's Last Silver** (`silver_convoy`).
- **Decline** · _Exchequer −12. The Crown will find someone else, probably Hobb & Daughters._ · `silver_summons/stakes/c6`
  “Fenn nods. "I understand." By evening the commission has gone to Hobb & Daughters.”
  Sets `silver_declined`.

**Node `pay`**, Lord Treasurer Fenn

> "Two hundred and twenty crowns. It comes out of whatever's left after the payment, and I should warn you there isn't much left after the payment."

- **"Who knows the route?"** · `silver_summons/pay/c1`
  Shown only if: not fenn_route.
  → goes to node `route`
  Sets `fenn_route`.
- **Tell him what Vorn let slip about the next treaty** · _Exchequer +4, Influence +2_ · `silver_summons/pay/c2`
  Shown only if: vorn_slip and not fenn_stakes.
  → goes to node `stakes`
  Sets `fenn_stakes`.
- **"What does it pay?"** · `silver_summons/pay/c3`
  Shown only if: not fenn_pay.
  → goes to node `pay`
  Sets `fenn_pay`.
- **Haggle** · _Guile check. Success: +60 crowns on the contract._ · (guile check, difficulty 14) · `silver_summons/pay/c4`
  Shown only if: fenn_pay and not fenn_haggled and not silver_bonus.
  → goes to node `pay_ok`; on failure `pay_fail`
  Sets `silver_bonus`; on failure sets `fenn_haggled`.
- **Accept the commission** · _[IF fenn_route] Adds "The Crown's Last Silver". Fenn's tip reveals one of its dangers. [ELSE] Adds the story contract "The Crown's Last Silver". [END]_ · `silver_summons/pay/c5`
  “"Thank you." He looks very tired. "Pick your people carefully. Somebody out there knows the route."”
  Sets `silver_accepted`.
  Adds story contract **The Crown's Last Silver** (`silver_convoy`).
- **Decline** · _Exchequer −12. The Crown will find someone else, probably Hobb & Daughters._ · `silver_summons/pay/c6`
  “Fenn nods. "I understand." By evening the commission has gone to Hobb & Daughters.”
  Sets `silver_declined`.

**Node `pay_ok`**, Lord Treasurer Fenn

> "All right, two hundred and eighty. Please don't mention it to the guard captain." He writes it down himself.

- **"Who knows the route?"** · `silver_summons/pay_ok/c1`
  Shown only if: not fenn_route.
  → goes to node `route`
  Sets `fenn_route`.
- **Tell him what Vorn let slip about the next treaty** · _Exchequer +4, Influence +2_ · `silver_summons/pay_ok/c2`
  Shown only if: vorn_slip and not fenn_stakes.
  → goes to node `stakes`
  Sets `fenn_stakes`.
- **"What does it pay?"** · `silver_summons/pay_ok/c3`
  Shown only if: not fenn_pay.
  → goes to node `pay`
  Sets `fenn_pay`.
- **Haggle** · _Guile check. Success: +60 crowns on the contract._ · (guile check, difficulty 14) · `silver_summons/pay_ok/c4`
  Shown only if: fenn_pay and not fenn_haggled and not silver_bonus.
  → goes to node `pay_ok`; on failure `pay_fail`
  Sets `silver_bonus`; on failure sets `fenn_haggled`.
- **Accept the commission** · _[IF fenn_route] Adds "The Crown's Last Silver". Fenn's tip reveals one of its dangers. [ELSE] Adds the story contract "The Crown's Last Silver". [END]_ · `silver_summons/pay_ok/c5`
  “"Thank you." He looks very tired. "Pick your people carefully. Somebody out there knows the route."”
  Sets `silver_accepted`.
  Adds story contract **The Crown's Last Silver** (`silver_convoy`).
- **Decline** · _Exchequer −12. The Crown will find someone else, probably Hobb & Daughters._ · `silver_summons/pay_ok/c6`
  “Fenn nods. "I understand." By evening the commission has gone to Hobb & Daughters.”
  Sets `silver_declined`.

**Node `pay_fail`**, Lord Treasurer Fenn

> "Everyone is being squeezed this year, including me. Two hundred and twenty."

- **"Who knows the route?"** · `silver_summons/pay_fail/c1`
  Shown only if: not fenn_route.
  → goes to node `route`
  Sets `fenn_route`.
- **Tell him what Vorn let slip about the next treaty** · _Exchequer +4, Influence +2_ · `silver_summons/pay_fail/c2`
  Shown only if: vorn_slip and not fenn_stakes.
  → goes to node `stakes`
  Sets `fenn_stakes`.
- **"What does it pay?"** · `silver_summons/pay_fail/c3`
  Shown only if: not fenn_pay.
  → goes to node `pay`
  Sets `fenn_pay`.
- **Haggle** · _Guile check. Success: +60 crowns on the contract._ · (guile check, difficulty 14) · `silver_summons/pay_fail/c4`
  Shown only if: fenn_pay and not fenn_haggled and not silver_bonus.
  → goes to node `pay_ok`; on failure `pay_fail`
  Sets `silver_bonus`; on failure sets `fenn_haggled`.
- **Accept the commission** · _[IF fenn_route] Adds "The Crown's Last Silver". Fenn's tip reveals one of its dangers. [ELSE] Adds the story contract "The Crown's Last Silver". [END]_ · `silver_summons/pay_fail/c5`
  “"Thank you." He looks very tired. "Pick your people carefully. Somebody out there knows the route."”
  Sets `silver_accepted`.
  Adds story contract **The Crown's Last Silver** (`silver_convoy`).
- **Decline** · _Exchequer −12. The Crown will find someone else, probably Hobb & Daughters._ · `silver_summons/pay_fail/c6`
  “Fenn nods. "I understand." By evening the commission has gone to Hobb & Daughters.”
  Sets `silver_declined`.

**Leads to:**

- `fenn_haggled` → _nothing reads it_
- `fenn_pay` → _nothing reads it_
- `fenn_route` → _nothing reads it_
- `fenn_stakes` → _nothing reads it_
- `silver_accepted` → **The Notice Board** (`vorn_board`)
- `silver_bonus` → rules in `src/engine/story/scenes.ts`
- `silver_declined` → **Quarter Day** (`quarter_day`)

#### Story contract: The Crown's Last Silver

`contract:silver_convoy` · data/contracts.ts:880

- _type:_ “Story”
- _titles[1]:_ “The Crown's Last Silver”
- _description:_

  > The Exchequer has scraped together the realm's overdue payment: three wagons of silver bound for Port Anselm and Ostrander's ships. Someone does not want it to arrive. If it fails, the Crown defaults.

- _phases[1]:_ “Muster at the Vault: Sort the Exchequer's honest clerks from the bought ones.”
- _phases[2]:_ “The King's Road: Two weeks of road with a fortune in the wagons.”
- _phases[3]:_

  > Ambush at the Ford: Someone will be waiting. Fight them, or take the wagons the long way round.

- _phases[4]:_ “The Harbor: Hand the silver to the bank's factor, and count every coin twice.”
- _expire.title:_ “The escort never came”
- _expire.text:_

  > You accepted the commission, but no squad was ever sent. The Exchequer's own guard took the wagons as far as Wenmouth ford and waited there for you until the ships had sailed. The Crown has missed its payment.

- _Sets:_ `silver_delivered` → **The Notice Board** (`vorn_board`), **Quarter Day** (`quarter_day`), **The Last Tapestry** (`fenn_tapestry`), **Half a Year** (`act1_slice_end`), street talk "paid_talk" (`paid_talk`), Date "The Lord Treasurer Visits" (`treasurer_visit`); `silver_lost` → **The Notice Board** (`vorn_board`), **Quarter Day** (`quarter_day`), **The Last Tapestry** (`fenn_tapestry`), **The Family Silver** (`aske_plate`), **Half a Year** (`act1_slice_end`), codex "The Treaty of Cassel" (`the_treaty`), street talk "default_talk" (`default_talk`), rules in `src/engine/core/turn.ts`; `silver_abandoned` → **Half a Year** (`act1_slice_end`), **The Crown's Wagons** (`field_crown_wagons`)

### Quarter Day

`quarter_day` · Story beat 13 · data/events.ts:431

**When:** Weeks 9–18; after Summoned to the Exchequer (`silver_summons`); when (silver_delivered or silver_lost or silver_declined); 70% a week inside the window.

**Reads:** `silver_declined` (set by **Summoned to the Exchequer** (`silver_summons`)); `silver_delivered` (set by contract **The Crown's Last Silver** (`silver_convoy`)); `silver_lost` (set by contract **The Crown's Last Silver** (`silver_convoy`)); `vorn_honest` (set by **The Notice Board** (`vorn_board`)); `vorn_told` (set by **The Notice Board** (`vorn_board`)).

> [IF silver_delivered] At noon the cathedral bells ring to say the payment has been received at Port Anselm. The realm has paid its way for one more quarter.
>
> A royal courier brings you a letter from Fenn, written in his own hand. He wants to thank you, and he has something to offer. [ELSE IF silver_lost] Noon comes and the bells stay quiet. For the first time in twenty-two years, the Crown has missed a payment to Ostrander's.
>
> By evening the bank's clerks are going door to door with lists, and a note from Vorn asks whether you have a minute.[IF vorn_honest]  At the bottom she has written, "I did tell you which stretch of road to watch." [END][IF vorn_told]  You remember giving her the date the wagons would leave, and wonder who she gave it to. [END] [ELSE] At noon the bells ring. The payment reached Port Anselm, carried by Hobb & Daughters, and the criers are making a great deal of Marta's name.
>
> That night somebody slips a note under your door. The wagons reached the coast a good deal lighter than they were when they left. [END]

- **Accept a purse from the Crown** · _+100 crowns_ · `quarter_day/root/c1`
  Shown only if: silver_delivered.
  “Fenn has found it somewhere. You suspect it's his own money.”
- **Accept a Crown writ of good conduct** · _Heat −20, Exchequer +6_ · `quarter_day/root/c2`
  Shown only if: silver_delivered.
  “You hang the writ by the door, and the watch starts nodding to your people in the street.”
- **Ask for a seat at the Exchequer's table** · _Influence +4_ · `quarter_day/root/c3`
  Shown only if: silver_delivered.
  “"Done," Fenn writes back. "I'm afraid you'll find it's mostly arguing about money."”
  Sets `fenn_ally`.
- **Offer the bank your services** · _Ostrander's +8, Lower Town −6. Unlocks bank contracts._ · `quarter_day/root/c4`
  Shown only if: not (silver_delivered) and silver_lost.
  “Vorn doesn't seem surprised to see you. "Good. We're about to be very busy."”
  Sets `ostranders_open`.
- **Swear to the Lower Town** · _Lower Town +8, Ostrander's −8_ · `quarter_day/root/c5`
  Shown only if: not (silver_delivered) and silver_lost.
  “You send Vorn's note back unopened, with a loaf of bread. The Lower Town hears about it within the hour.”
- **Stay out of it** · `quarter_day/root/c6`
  Shown only if: not (silver_delivered) and silver_lost.
  “You stay in, like most of the city. Nobody sleeps much.”
- **Prove that Hobb skimmed the silver** · _Spend 3 Intel. Exchequer +10, Hobb & Daughters lose renown._ · (needs intel: 3) · `quarter_day/root/c7`
  Shown only if: not (silver_delivered) and not (silver_lost).
  “Your evidence goes to Fenn, and Marta Hobb pays back every coin with interest. She also sends you a cake, which nobody eats.”
- **Let it go** · `quarter_day/root/c8`
  Shown only if: not (silver_delivered) and not (silver_lost).
  “You let it go. There will be other fights.”

**Leads to:**

- `fenn_ally` → **Half a Year** (`act1_slice_end`), **An Exchequer Writ** (`field_writ`)
- `ostranders_open` → **Coster's Page** (`coster_page`), **The Bank's Gift** (`brune_donation`), contract **How Deep It Goes** (`pellam_deep`), contract **A Matter of Arrears** (`debt_collection`), contract **Deliver the Bank's Terms** (`deliver_terms`), contract **The Bank's Warrants** (`kell_sump`), contract **The Insurers' Survey** (`anselm_burrows`), Date "Ostrander's Reads the Books" (`vorn_books`), rules in `src/engine/actions.ts`

### The Last Tapestry

`fenn_tapestry` · Story beat 15 · data/cast.ts:468

**When:** Weeks 15–20; after Quarter Day (`quarter_day`); needs alive: Lord Treasurer Aubrey Fenn; 45% a week inside the window.

**Reads:** `silver_delivered` (set by contract **The Crown's Last Silver** (`silver_convoy`)); `silver_lost` (set by contract **The Crown's Last Silver** (`silver_convoy`)).

_Speaker: Lord Treasurer Fenn_

> Fenn comes to Tallow Street himself, on foot and without his clerks. He apologizes for that before anything else.
>
> [IF silver_delivered] "You did us a great service with the silver. I'm afraid I'm here to ask for another, which is poor manners." [ELSE IF silver_lost] "You'll know we missed the payment. The bank has frozen the Crown's accounts on Quay Street, so I can't pay my own clerks." [ELSE] "I know I gave the silver to Marta Hobb last time. I'm told it arrived lighter than it left, which is my own fault for asking her." [END]
>
> "There is one tapestry left in the Exchequer. It's the Siege of Carrow, and it has hung in the great hall for two hundred years. A wool merchant in Harrowmere will pay four hundred crowns for it, provided nobody learns that the Crown is selling its walls. I need someone to take it there without being noticed."

- **We'll take it.** · _Adds the story contract "The Exchequer's Last Tapestry". Success: Exchequer +8, Arrears −3._ · `fenn_tapestry/root/c1`
  “"Thank you." He looks at the floor. "Please don't let them fold it. It's very old."”
  Adds story contract **The Exchequer's Last Tapestry** (`last_tapestry`).
- **Lend the Crown the money and keep the tapestry here** · _−150 crowns. It hangs in your hall. Exchequer +6, Renown +2._ · (needs crowns: 150) · `fenn_tapestry/root/c2`
  “It takes four of your people to hang it. Fenn comes to see it the next week and stands in front of it for some time without saying anything.”
  Sets `tapestry_bought`.
- **We can't help this time.** · _Exchequer −3, Fenn −10_ · `fenn_tapestry/root/c3`
  “"No, of course." He thanks you for your time anyway, and walks home.”

**Leads to:**

- `tapestry_bought` → **Half a Year** (`act1_slice_end`), Jory "j_tapestry" (`j_tapestry`)

#### Story contract: The Exchequer's Last Tapestry

`contract:last_tapestry` · data/contracts.ts:750

- _type:_ “Story”
- _titles[1]:_ “The Exchequer's Last Tapestry”
- _description:_

  > The last tapestry in the Exchequer, rolled in sacking, has to reach a buyer in Harrowmere without anyone learning the Crown is selling its walls. The money pays the Crown's clerks for another season.

- _phases[1]:_ “Out of the City: Get a cart out of the Exchequer yard without being remembered.”
- _phases[2]:_ “The Road: Somebody has heard what is in the sacking.”
- _phases[3]:_ “The Buyer: Get the agreed price, in coin that is not clipped.”
- _expire.title:_ “The tapestry stayed in the yard”
- _expire.text:_

  > The cart never left. Fenn sold the tapestry in Varrow in the end, for a third of its worth, and by the end of the week the whole city knew.

- _Sets:_ `tapestry_sold` → **Half a Year** (`act1_slice_end`); `tapestry_lost` → **Half a Year** (`act1_slice_end`)

### Half a Year

`act1_slice_end` · Story beat 17 · data/events.ts:482

**When:** Weeks 22–26; after Quarter Day (`quarter_day`), The Last Tapestry (`fenn_tapestry`), The Family Silver (`aske_plate`); 60% a week inside the window.

**Reads:** `ansel_freed` (set by **Dagny Asks** (`dagny_brother`), contract **Ansel Fell at the Chain** (`ansel_chain`)); `ansel_lost` (set by contract **Ansel Fell at the Chain** (`ansel_chain`)); `aske_betrayed` (set by **The Family Silver** (`aske_plate`)); `aske_plate_lost` (set by contract **The Aske Silver** (`aske_plate`)); `aske_plate_saved` (set by contract **The Aske Silver** (`aske_plate`)); `coster_exposed` (set by **Coster's Page** (`coster_page`)); `coster_job` (set by **The Man with the Scales** (`coster_interest`)); `coster_terms` (set by **The Man with the Scales** (`coster_interest`)); `fenn_ally` (set by **Quarter Day** (`quarter_day`)); `isbet_betrayed` (set by **The Copper Kettle** (`isbet_kettle`)); `isbet_pact` (set by **The Copper Kettle** (`isbet_kettle`)); `salts_accepted` (set by **Fever Salts** (`brune_salts`)); `salts_delivered` (set by contract **Salts for Saint Oda's** (`fever_salts`)); `salts_failed` (set by contract **Salts for Saint Oda's** (`fever_salts`)); `silver_abandoned` (set by contract **The Crown's Last Silver** (`silver_convoy`)); `silver_delivered` (set by contract **The Crown's Last Silver** (`silver_convoy`)); `silver_lost` (set by contract **The Crown's Last Silver** (`silver_convoy`)); `tapestry_bought` (set by **The Last Tapestry** (`fenn_tapestry`)); `tapestry_lost` (set by contract **The Exchequer's Last Tapestry** (`last_tapestry`)); `tapestry_sold` (set by contract **The Exchequer's Last Tapestry** (`last_tapestry`)); `weights_exposed` (set by contract **Short Weight at Hesketh's** (`false_weights`)); `weights_failed` (set by contract **Short Weight at Hesketh's** (`false_weights`)).

> Half a year has passed since the Exchequer sealed your charter. [IF silver_delivered] The Crown's silver reached Port Anselm, and the realm has a few more months of grace. In the Exchequer, people know your guild's name now. [ELSE IF silver_lost] The Crown's silver never reached the coast. The realm has defaulted for the first time, and Ostrander's factors are walking the city with lists. [ELSE] The Crown's silver went to the coast without you. [END][IF people.length] 
>
> {people.join(' ')} [END]
>
> This is where the prototype's scripted story ends for now. Contracts, rivals, the Council and the Debt all carry on, and so does the guild.

- **Continue** · `act1_slice_end/root/c1`
  “Back to work.”

### The Exchequer Audits

`audit` · Follow-up · data/events.ts:694

**When:** when heat >= 30; random draw, weight 4; not again for 6 weeks.

> Two Exchequer clerks turn up with ledgers and a long list of questions about your recent "night work".

- **Pay the fine** · _−50 crowns, Heat −15_ · (needs crowns: 50) · `audit/root/c1`
  “The clerks take the money, give you a receipt and leave.”
- **Talk them round** · _Guile check. Success: Heat −10. Failure: Heat +10, Exchequer −6._ · (guile check, difficulty 14) · `audit/root/c2`
  On success: “By the end of the afternoon the clerks are apologizing for wasting your time.”
  On failure: “The clerks write down everything you say and ask to see the stores.”
- **Stonewall** · _Exchequer −8_ · `audit/root/c3`
  “They leave with nothing, and they make a note of that too.”

### A Letter from Fenn

`fenn_letter` · Follow-up · data/cast.ts:725

**When:** when scene bread_riot has happened and scene silver_summons has happened; needs alive: Lord Treasurer Aubrey Fenn; random draw, weight 2; fires once.

**Reads:** `riot_broken` (set by **Bread and Stones** (`bread_riot`)); `riot_fed` (set by **Bread and Stones** (`bread_riot`)); `riot_held` (set by **Bread and Stones** (`bread_riot`)).

**Checks whether these happened:** **Bread and Stones** (`bread_riot`), **Summoned to the Exchequer** (`silver_summons`).

> A short letter from Lord Treasurer Fenn, in his own hand:
>
> [IF riot_broken] "My clerk tells me you cleared the bread market for us. I'm grateful, and I'm sorry it had to be your people who did it. The Lower Town has a long memory, and so, I find, do I." [ELSE IF riot_held] "My clerk tells me you held the bread market without drawing blood. I have spent six years telling the Council this was possible. Thank you for the demonstration." [ELSE IF riot_fed] "I hear you fed the Lower Town when the levy came in, at your own expense. Officially, the Exchequer can't approve. Unofficially, thank you. I wish we had done it." [ELSE] "I hear you kept your doors shut during the bread riot. Very sensible. I wish I had been able to do the same." [END]
>
> It is signed "A. Fenn", with no title.

- **Write back** · _Fenn +5_ · `fenn_letter/root/c1`
  “You write a short reply. A week later he answers that too, mostly about the weather.”
- **File it** · `fenn_letter/root/c2`
  “Jory files it under F, with the others.”
