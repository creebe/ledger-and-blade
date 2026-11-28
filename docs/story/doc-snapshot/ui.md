## Interface text

Labels, help, confirmations and empty states in the screens and sheets (lines of three words or more). Where a sentence is split by bold text or a button inside it, it appears in pieces.

### ui/expeditions/SquadStrip.tsx

| ID | Line |
|---|---|
| `ui/expeditions/SquadStrip.tsx#stateText.1` | [IF c.state is 'dead'] dead [ELSE IF c.state is 'down'] down [ELSE IF c.state is 'out'] carried [ELSE IF c.state is 'spent'] spent [ELSE IF c.fever] fever [END] |
| `ui/expeditions/SquadStrip.tsx#SquadStrip.1` | Exposure {c.exposure}. A Sink change comes at {X.thresholds.join(', ')}. |

### ui/expeditions/xkit.tsx

| ID | Line |
|---|---|
| `ui/expeditions/xkit.tsx#XBar.1` | [IF kind is 'fatigue'] [IF v >= F.spent] bad [ELSE IF v >= F.tired] mid [ELSE] ok [END] [ELSE IF f < 0.3] bad [ELSE IF f < 0.55] mid [ELSE] ok [END] |
| `ui/expeditions/xkit.tsx#Vitals.1` | Exposure: runoff and fever in the body. At 40, 70 and 95 it brings a Sink change. |

### ui/kit/DispatchItem.tsx

| ID | Line |
|---|---|
| `ui/kit/DispatchItem.tsx#DispatchItem.1` | Read the mission report |

### ui/kit/common.tsx

| ID | Line |
|---|---|
| `ui/kit/common.tsx#set.1` | [IF animate] transform 0.2s ease-out [ELSE] none [END] |
| `ui/kit/common.tsx#set.2` | [IF animate] background-color 0.2s ease-out [ELSE] none [END] |
| `ui/kit/common.tsx#set.3` | [IF animate] background-color 0.2s ease-out [ELSE] none [END] |
| `ui/kit/common.tsx#onStart.1` | input, textarea, select, [data-no-swipe], .sheet-foot |
| `ui/kit/common.tsx#ChanceBar.1` | [IF min >= 0.7] good [ELSE IF max < 0.4] bad [ELSE] mid [END] |

### ui/kit/members.tsx

| ID | Line |
|---|---|
| `ui/kit/members.tsx#ASSIGNMENTS.1` | Recover fatigue and wounds faster. Small morale gain. |
| `ui/kit/members.tsx#ASSIGNMENTS.2` | +1 to an attribute every few weeks. Costs crowns each week and adds fatigue. A Training Yard makes it faster and cheaper. |
| `ui/kit/members.tsx#ASSIGNMENTS.3` | +1 Intel per week (+2 for Envoys, Infiltrators and Scouts). |
| `ui/kit/members.tsx#ASSIGNMENTS.4` | Earn a few crowns based on Might. Tiring and dull. |
| `ui/kit/members.tsx#ASSIGNMENTS.5` | Stay home and watch the doors. Each guard makes theft, arson and worse less likely to succeed, and helps catch spies. Mildly tiring. |
| `ui/kit/members.tsx#ASSIGNMENTS.6` | Help with construction: each builder adds half a week of progress. Tiring. |
| `ui/kit/members.tsx#ASSIGNMENTS.7` | Reveal a contract's hidden tags by week's end. Scouts, Skirmishers and Infiltrators reveal all of them; others reveal one. |
| `ui/kit/members.tsx#restingInfo.1` | [IF lay.weeks is 1] next week [ELSE] in {lay.weeks} weeks [END] |
| `ui/kit/members.tsx#restingInfo.2` | {first} is in bed with the Sink fever, so they can't take orders or go out. They'll be up {when}. |
| `ui/kit/members.tsx#restingInfo.3` | {first} is resting while their wounds heal, so they can't take orders or go out. Their health is {m.health}, and they need {FIT_HEALTH} to work again. They'll be fit {when}.[IF level(g, 'infirmary') < 1]  An Infirmary in the Hall would heal them faster. [END] |
| `ui/kit/members.tsx#choose.1` | No contract has anything left to scout. |
| `ui/kit/members.tsx#choose.2` | {m.name.split(' ')[0]}: {a.label} this week. [IF a.id is 'train'] Pick what to train below. [ELSE] {a.blurb} [END] |
| `ui/kit/members.tsx#OrderPicker.1` | [IF a.id is 'train'] +1 to an attribute every {trainWeeks(game)} weeks. Costs {crowns(trainCost(game))} a week and adds fatigue. [ELSE] {a.blurb} [END] |

### ui/kit/reveal.tsx

| ID | Line |
|---|---|
| `ui/kit/reveal.tsx#askReveal.1` | Learn the hidden danger? |
| `ui/kit/reveal.tsx#askReveal.2` | Your informants will find out which of these the squad will meet: {h.candidates.map(tagName).join(' or ')}. |
| `ui/kit/reveal.tsx#askReveal.3` | Knowing it tells you what to pack and who to send. |
| `ui/kit/reveal.tsx#HiddenTag.1` | A hidden danger: {names}. Tap to learn which it is for {cost} Intel. |

### ui/kit/shortfall.ts

| ID | Line |
|---|---|
| `ui/kit/shortfall.ts#short.1` | [IF res is 'crowns'] [IF what] {what} costs [ELSE] It costs [END] {crowns(need)}, and the treasury holds {crowns(have)}. [ELSE IF res in NAMES] [IF what] {what} needs [ELSE] It needs [END] {need} [DEPENDS ON res] supplies: supplies [OR] intel: Intel [OR] influence: Influence [END], and you have {have}. [ELSE] [IF what] {what} needs [ELSE] It needs [END] {need} {MATERIAL_INFO[res as MaterialId].name}, and you have {have}. [END] |

### ui/kit/visual.tsx

| ID | Line |
|---|---|
| `ui/kit/visual.tsx#readiness.1` | [IF ms] [IF ms.dispatchedWeek + ms.plannedWeeks - 1 <= g!.week] Away · due back this week [ELSE] Away · due back in {wk(ms.dispatchedWeek + ms.plannedWeeks - 1 - g!.week + 1)} [END] [ELSE] Away [END] |
| `ui/kit/visual.tsx#slotIcon.1` | [IF def.ranged] marksman [ELSE IF def.bonus.arcana] arcanist [ELSE] weapon [END] |
| `ui/kit/visual.tsx#OddsPill.1` | [IF min >= 0.7] good [ELSE IF max < 0.4] bad [ELSE] mid [END] |

### ui/panels/Buildings.tsx

| ID | Line |
|---|---|
| `ui/panels/Buildings.tsx#BuildingsSection.1` | [IF builders] {builders} member[IF builders > 1] s [END] helping. [ELSE] Assign idle members to Build (Roster) to speed it up. [END] |
| `ui/panels/Buildings.tsx#FacilityDetail.1` | · upkeep + |
| `ui/panels/Buildings.tsx#FacilityDetail.2` | Takes about {next.weeks} weeks (faster with builders). Weekly upkeep rises from {upkeep(g)} to {upkeep(g)}{next.upkeep} crowns. |
| `ui/panels/Buildings.tsx#WorkshopPanel.1` | Finished at the end of the week. Forge: |
| `ui/panels/Buildings.tsx#WorkshopPanel.2` | a week · Stillroom: |
| `ui/panels/Buildings.tsx#WorkshopPanel.3` | in the Hall to start crafting here. |
| `ui/panels/Buildings.tsx#WorkshopPanel.4` | · needs level |
| `ui/panels/Buildings.tsx#WorkshopPanel.5` | Market price about |
| `ui/panels/Buildings.tsx#WorkshopPanel.6` | It will be ready at the end of the week. You can cancel it until then and get everything back. |
| `ui/panels/Buildings.tsx#WorkshopPanel.7` | {def.name} queued. It will be ready at the end of the week. |

### ui/panels/Council.tsx

| ID | Line |
|---|---|
| `ui/panels/Council.tsx#Seats.1` | {FACTIONS[f].short}: [DEPENDS ON p] 1: For [OR] 0: Undecided [OR] -1: Against [END] |
| `ui/panels/Council.tsx#DecreeCard.1` | [IF t.passes] Passes as things stand [ELSE] Fails as things stand [END] |
| `ui/panels/Council.tsx#doLobby.1` | [IF item.player > 0] toward supporting it [ELSE] toward opposing it [END] |
| `ui/panels/Council.tsx#doLobby.2` | Call in favors and make your case. {name} moves one step {toward}. |
| `ui/panels/Council.tsx#doLobby.3` | Use what your informants know. {name} moves one step {toward}, but standing with them falls by 4. |
| `ui/panels/Council.tsx#doLobby.4` | Quiet purses for the right aldermen. {name} moves one step {toward}. Heat +3. |
| `ui/panels/Council.tsx#doLobby.5` | Each faction can be worked on once a week. |
| `ui/panels/Council.tsx#DecreeCard.2` | The vote is at the end of this week. Stances are locked. |
| `ui/panels/Council.tsx#DecreeCard.3` | Take a stance to lobby. Factions on your side when the vote passes your way will thank you; the ones you beat will remember. |
| `ui/panels/Council.tsx#CouncilSection.1` | [IF c.agenda.length] votes [IF c.voteWeek is g.week] this week [ELSE] in {weeks((c.voteWeek ?? g.week) - g.week + 1)} [END] [ELSE] next agenda in {wk(untilAgenda)} [END] |
| `ui/panels/Council.tsx#CouncilSection.2` | . A decree needs more seats for than against. |
| `ui/panels/Council.tsx#CouncilSection.3` | The Council is not sitting. It posts an agenda in the seventh week of each season and votes at the end of the season. |
| `ui/panels/Council.tsx#CouncilSection.4` | [IF h.player]  · you [IF h.player > 0] supported [ELSE] opposed [END] it [END] |

### ui/panels/DateCard.tsx

| ID | Line |
|---|---|
| `ui/panels/DateCard.tsx#dueText.1` | [IF left <= 0] this week [ELSE] in {weeks(left)} [END] |
| `ui/panels/DateCard.tsx#DateCard.1` | [IF c.weeksLeft is 0] Arrives this week [ELSE] {dueText(c.weeksLeft)} · {shortDate(c.active.dueWeek, g.week)} [END] |
| `ui/panels/DateCard.tsx#DateCard.2` | [IF c.targets.length is 1] [IF done] Met so far. [ELSE] Not met yet. [END] [ELSE IF done is c.targets.length] Every target met so far. [ELSE] {done} of {c.targets.length} targets met so far. [END] |
| `ui/panels/DateCard.tsx#DatePill.1` | Next Date: {c.def.title}, {dueText(c.weeksLeft)}. {done} of {c.targets.length} targets met. |
| `ui/panels/DateCard.tsx#DatePill.2` | [IF c.weeksLeft is 0] this week [ELSE] {c.weeksLeft} wk [END] |

### ui/panels/Guide.tsx

| ID | Line |
|---|---|
| `ui/panels/Guide.tsx#GuideCard.1` | Nothing to do right now. More notes unlock as the weeks go on. |
| `ui/panels/Guide.tsx#GuideCard.2` | All notes, done and upcoming |
| `ui/panels/Guide.tsx#GuideCard.3` | Notes card hidden. You can still collect rewards from the Journal. |

### ui/screens/Armory.tsx

| ID | Line |
|---|---|
| `ui/screens/Armory.tsx#buySuppliesFlow.1` | The stores go from {g.supplies} to {g.supplies}{n}. |
| `ui/screens/Armory.tsx#buySuppliesFlow.2` | Bought {n} supplies for {crowns(cost)}. You now have {g.supplies}{n}. |
| `ui/screens/Armory.tsx#ArmoryScreen.1` | Food, fodder and lamp-oil. Each member eats 1 a week, and squads carry their own. Bigger orders are cheaper. Price now: |
| `ui/screens/Armory.tsx#ArmoryScreen.2` | What squads pack besides food. Anything short when a squad sets out is bought then, at these prices. |
| `ui/screens/Armory.tsx#ArmoryScreen.3` | in the stores · |
| `ui/screens/Armory.tsx#ArmoryScreen.4` | The stores go from {g.stores[k] ?? 0} to {g.stores[k] ?? 0}{SUPPLIES[k].perSlot}. |
| `ui/screens/Armory.tsx#ArmoryScreen.5` | Bought {SUPPLIES[k].perSlot} {SUPPLIES[k].name.toLowerCase()}. The stores now hold {g.stores[k] ?? 0}{SUPPLIES[k].perSlot}. |
| `ui/screens/Armory.tsx#ArmoryScreen.6` | Sell everything the squads brought back? |
| `ui/screens/Armory.tsx#ArmoryScreen.7` | All the goods above go to the market at once. Materials stay in the stores. |
| `ui/screens/Armory.tsx#ArmoryScreen.8` | Sold the goods for {crowns(v)}. |
| `ui/screens/Armory.tsx#ArmoryScreen.9` | Sell it all · |
| `ui/screens/Armory.tsx#ArmoryScreen.10` | Stock changes weekly, and better goods appear as your renown grows. Weak coin raises prices, and Weighhouse friendship lowers them. |
| `ui/screens/Armory.tsx#ArmoryScreen.11` | [IF owned] You already own {owned}. It goes into Inventory. Equip it from a member's Gear. [ELSE] It goes into Inventory. Equip it from a member's Gear. [END] |
| `ui/screens/Armory.tsx#ArmoryScreen.12` | Bought {def.name} for {crowns(price)}. Equip it from a member's Gear. |
| `ui/screens/Armory.tsx#ArmoryScreen.13` | The armory is empty. |
| `ui/screens/Armory.tsx#ArmoryScreen.14` | [IF holder] Held by {holder.name} [ELSE] In stores [END] |
| `ui/screens/Armory.tsx#ArmoryScreen.15` | [IF holder] {holder.name} is using it, and will be left without it. [ELSE] It goes back to the market for half its price. [END] |
| `ui/screens/Armory.tsx#ArmoryScreen.16` | Recovered from missions, or bought here. Used to craft in the Workshop and to build in the Hall. Buying or selling a lot at once moves the price. |
| `ui/screens/Armory.tsx#ArmoryScreen.17` | · sell about |
| `ui/screens/Armory.tsx#ArmoryScreen.18` | You have {g.materials[m]} {MATERIAL_INFO[m].name}. Buying a lot at once pushes the price up. |
| `ui/screens/Armory.tsx#ArmoryScreen.19` | Bought 5 {MATERIAL_INFO[m].name}. You now have {g.materials[m]}{5}. |
| `ui/screens/Armory.tsx#ArmoryScreen.20` | Buy 5 · |
| `ui/screens/Armory.tsx#ArmoryScreen.21` | [IF g.materials[m] < 1] No {MATERIAL_INFO[m].name} to sell [END] |
| `ui/screens/Armory.tsx#ArmoryScreen.22` | [IF g.materials[m] < 1] No {MATERIAL_INFO[m].name} to sell [END] |

### ui/screens/Contracts.tsx

| ID | Line |
|---|---|
| `ui/screens/Contracts.tsx#ContractsScreen.1` | out. Follow them in the Field. |
| `ui/screens/Contracts.tsx#ContractsScreen.2` | No contracts this week. |
| `ui/screens/Contracts.tsx#ContractCard.1` | Your operation against |
| `ui/screens/Contracts.tsx#ContractCard.2` | [IF expiring] Expires this week [ELSE] {wk(c.expiresWeek - g.week + 1)} left [END] |

### ui/screens/Field.tsx

| ID | Line |
|---|---|
| `ui/screens/Field.tsx#FieldCard.1` | [IF st.preparing] [IF m.fieldWeeks.length] They have left by the gate, and the trip begins at the end of this week. [ELSE] In the yard. They leave at the end of this week. [END] [ELSE] Week {st.revealed} of about {m.plannedWeeks}, [IF st.zone] in {st.zone}, room {st.room} of {st.rooms} [ELSE] on the road [END]. [END] |
| `ui/screens/Field.tsx#FieldCard.2` | Squad {m.number}, {st.site}. Open the log. |
| `ui/screens/Field.tsx#YardPanel.1` | Their gear can still change until End Week. Tap a name to see what they carry. |
| `ui/screens/Field.tsx#YardPanel.2` | [IF doorFired] They have already left by the gate, so nobody can call them back now. [END] |
| `ui/screens/Field.tsx#YardPanel.3` | Call off squad {m.number}? |
| `ui/screens/Field.tsx#YardPanel.4` | The squad stays home. What they packed goes back to the stores, and "{m.contract.title}" returns to the board. |
| `ui/screens/Field.tsx#YardPanel.5` | Squad {m.number} stays home and is back in the hall. |
| `ui/screens/Field.tsx#FieldScreen.1` | [IF limit < 3 and used >= limit]  A Muster room in the Hall would let a third go. [END] |
| `ui/screens/Field.tsx#FieldScreen.2` | Nobody is out. Squads leave from the contract board. |
| `ui/screens/Field.tsx#FieldScreen.3` | See the board |

### ui/screens/Hall.tsx

| ID | Line |
|---|---|
| `ui/screens/Hall.tsx#alerts.1` | {plural(g.pendingEvents.length, 'dispatch', 'dispatches')} [IF g.pendingEvents.length is 1] awaits [ELSE] await [END] your decision. |
| `ui/screens/Hall.tsx#alerts.2` | Loan payment of {crowns(owed)} due [IF inWeeks <= 0] this week [ELSE] next week [END]. |
| `ui/screens/Hall.tsx#alerts.3` | Missed loan payments: {l.missed} of 3. |
| `ui/screens/Hall.tsx#alerts.4` | In the red for {plural(g.insolventWeeks, 'week')}. At 4, the guild is bankrupt. |
| `ui/screens/Hall.tsx#alerts.5` | Charter in danger: {plural(6 - g.charterWeeks, 'week')} left to fix it. |
| `ui/screens/Hall.tsx#alerts.6` | Heat is {g.heat}. The Exchequer is watching. |
| `ui/screens/Hall.tsx#alerts.7` | {plural(back.length, 'squad')} [IF back.length is 1] is [ELSE] are [END] due home at the end of this week. |
| `ui/screens/Hall.tsx#alerts.8` | Supplies are low ({g.supplies}). Buy more at the Armory. |
| `ui/screens/Hall.tsx#alerts.9` | Story contract available: "{story.title}". |
| `ui/screens/Hall.tsx#dueWhen.1` | [IF l.dueWeek <= week] this week [ELSE IF l.dueWeek is week + 1] next week [ELSE] in {weeks(l.dueWeek - week)} [END] |
| `ui/screens/Hall.tsx#aheadLine.1` | The next payment is already covered, so this counts toward the one after. |
| `ui/screens/Hall.tsx#aheadLine.2` | [IF left is 0] This covers the next payment of {crowns(now)}, so the Weighhouse takes nothing on the day. [ELSE] The next payment falls from {crowns(now)} to {crowns(left)}. [END] |
| `ui/screens/Hall.tsx#HallScreen.1` | This week so far |
| `ui/screens/Hall.tsx#HallScreen.2` | [IF loanStillDue(loan) > 0] {crowns(loanStillDue(loan))} due [ELSE] nothing due [END] |
| `ui/screens/Hall.tsx#HallScreen.3` | The projection counts known costs and the listed pay of squads already in the field, as if every job succeeds. Supplies are bought separately. |
| `ui/screens/Hall.tsx#HallScreen.4` | "Waits": the coin will be short on the day, but a squad is still away, so the Weighhouse holds off until it's home, for up to three weeks. |
| `ui/screens/Hall.tsx#HallScreen.5` | "Missed": the coin will be short on the day. A missed payment adds 20 crowns to the debt, and a third missed payment means ruin. |
| `ui/screens/Hall.tsx#HallScreen.6` | Supplies run out |
| `ui/screens/Hall.tsx#HallScreen.7` | [IF proj.find((p) => p.hungry)!.week is g.week] this week [ELSE] in {weeks(proj.find((p) => p.hungry)!.week - g.week)} [END] |
| `ui/screens/Hall.tsx#HallScreen.8` | , and anyone at home without them goes hungry. Buy more at the Armory. |
| `ui/screens/Hall.tsx#HallScreen.9` | Last week in detail |
| `ui/screens/Hall.tsx#HallScreen.10` | You owe the Weighhouse |
| `ui/screens/Hall.tsx#HallScreen.11` | % interest per week. |
| `ui/screens/Hall.tsx#HallScreen.12` | [IF loan.dueWeek <= g.week] at the end of this week [ELSE] {dueWhen(loan, g.week)} [END] |
| `ui/screens/Hall.tsx#HallScreen.13` | The payment due |
| `ui/screens/Hall.tsx#HallScreen.14` | [IF loanStillDue(loan) > 0] You've paid {crowns(Math.floor(loan.paidAhead!))} early, which comes off the {crowns(Math.min(loan.paymentDue, Math.ceil(loan.principal)))} due. [ELSE] You've paid {crowns(Math.floor(loan.paidAhead!))} early. The Weighhouse counts it toward the next payment, so nothing is owed on the day. [END] |
| `ui/screens/Hall.tsx#HallScreen.15` | Repay {n} crowns early? |
| `ui/screens/Hall.tsx#HallScreen.16` | Your debt falls from {Math.ceil(loan.principal)} to {Math.ceil(loan.principal - n)}, saving about {crowns(Math.round(n * loan.weeklyRate * 10) / 10)} interest every week. |
| `ui/screens/Hall.tsx#HallScreen.17` | Make sure you can still cover weekly costs: {crowns(weeklyWages(g) + upkeep(g))}. |
| `ui/screens/Hall.tsx#HallScreen.18` | [IF g.crowns < loan.principal] Need {Math.ceil(loan.principal)} crowns to clear the debt [END] |
| `ui/screens/Hall.tsx#HallScreen.19` | Clear the whole debt? |
| `ui/screens/Hall.tsx#HallScreen.20` | The Weighhouse returns your note, and the guild owes nothing. |
| `ui/screens/Hall.tsx#HallScreen.21` | Paying early cuts the interest that piles up each week, and it counts toward the next payment. Missing 3 payments means ruin. |
| `ui/screens/Hall.tsx#HallScreen.22` | The guild is debt-free. |
| `ui/screens/Hall.tsx#HallScreen.23` | Show older dispatches |

### ui/screens/Prologue.tsx

| ID | Line |
|---|---|
| `ui/screens/Prologue.tsx#Prologue.1` | Ledger &amp; Blade |

### ui/screens/Realm.tsx

| ID | Line |
|---|---|
| `ui/screens/Realm.tsx#RealmScreen.1` | {undecided} decrees without a stance |
| `ui/screens/Realm.tsx#RealmScreen.2` | The realm's crisis moves every week, with or without you. Contracts and choices push these clocks. |
| `ui/screens/Realm.tsx#RealmScreen.3` | [IF bad > 70] bad [ELSE IF bad > 45] mid [ELSE] good [END] |
| `ui/screens/Realm.tsx#RealmScreen.4` | On the Debt: |
| `ui/screens/Realm.tsx#RealmScreen.5` | [IF g.petitioned.includes(id)] Already courted this week. Try again next week. [ELSE] {short(g, 'influence', PETITION_COST, 'Courting them')} [END] |
| `ui/screens/Realm.tsx#RealmScreen.6` | You call in favors, send gifts and attend the right dinners. Standing with {f.name} rises by 6 (now {v}). |
| `ui/screens/Realm.tsx#RealmScreen.7` | [IF id is 'ostranders' and not g.flags.ostranders_open] This also tells Factor Vorn you are open to bank work. [ELSE] You can court each faction once a week. [END] |
| `ui/screens/Realm.tsx#RealmScreen.8` | [IF g.petitioned.includes(id)] Petitioned this week [ELSE] Court them (+6) · {PETITION_COST} Influence [END] |
| `ui/screens/Realm.tsx#RealmScreen.9` | [IF g.heat >= 60] bad [ELSE IF g.heat >= 30] mid [ELSE] good [END] |
| `ui/screens/Realm.tsx#RealmScreen.10` | /100. Shady work draws the Exchequer's attention. Above 30, audits start; above 80, Exchequer standing falls weekly; at 100, your charter is in danger. |
| `ui/screens/Realm.tsx#RealmScreen.11` | [IF g.heat is 0] No Heat to cool. [ELSE] {short(g, 'influence', HEAT_COST, 'Greasing palms')} [END] |
| `ui/screens/Realm.tsx#RealmScreen.12` | Grease some palms? |
| `ui/screens/Realm.tsx#RealmScreen.13` | A few quiet payments to the right Exchequer clerks. Heat falls from {g.heat} to {Math.max(0, g.heat - 12)}. |
| `ui/screens/Realm.tsx#RealmScreen.14` | Grease palms (−12 Heat) · |
| `ui/screens/Realm.tsx#RealmScreen.15` | on guard · Spymaster's Den level |
| `ui/screens/Realm.tsx#RealmScreen.16` | Assign members to Guard the hall to stop thieves, arsonists and knives in the night. A Den helps catch spies. |
| `ui/screens/Realm.tsx#RealmScreen.17` | Search the hall for spies? |
| `ui/screens/Realm.tsx#RealmScreen.18` | Your people go through the hall and question the new faces. Any rival's spy has a good chance of being found. |
| `ui/screens/Realm.tsx#RealmScreen.19` | Search the hall for spies · |
| `ui/screens/Realm.tsx#spyBody.hobbs.1` | Your informants will learn what the Hobbs intend this week: a contract they want, a member they are courting, or rumors they are spreading. Some plans can then be countered. |
| `ui/screens/Realm.tsx#spyBody.ninth.1` | Your informants will learn what the Ninth intend this week: a contract they want, or one of your people Mayne is trying to hire. Both can be dealt with. |
| `ui/screens/Realm.tsx#spyBody.assay.1` | Your informants will learn whether the Assay Office means to take a contract or inspect your stillroom this week. An inspection can be put off. |
| `ui/screens/Realm.tsx#RivalCard.1` | Contracts taken from under you: |
| `ui/screens/Realm.tsx#RivalCard.2` | [IF r.aggression >= 0.65] High [ELSE IF r.aggression >= 0.35] Moderate [ELSE] Low [END] |
| `ui/screens/Realm.tsx#RivalCard.3` | [IF g.flags.assay_licensed]  · Licensed [ELSE]  · Not licensed [END] |
| `ui/screens/Realm.tsx#RivalCard.4` | · truce until |
| `ui/screens/Realm.tsx#RivalCard.5` | · your spy is inside |
| `ui/screens/Realm.tsx#RivalCard.6` | [IF feudStage(g, id) is 2] bad [ELSE IF feudStage(g, id) is 1] mid [ELSE] good [END] |
| `ui/screens/Realm.tsx#RivalCard.7` | Their plan for this week will come to nothing. |
| `ui/screens/Realm.tsx#RivalCard.8` | [IF counter.influence] Costs {counter.influence} Influence · you have {g.influence} [ELSE IF counter.intel] Costs {counter.intel} Intel · you have {g.intel} [ELSE] Costs {counter.crowns} crowns · you have {g.crowns} [END] |
| `ui/screens/Realm.tsx#RivalCard.9` | Countered. Their plan for this week is foiled. |
| `ui/screens/Realm.tsx#RivalCard.10` | Take the contract yourself before the week ends to deny it to them. |
| `ui/screens/Realm.tsx#RivalCard.11` | Learn their plans this week · |
| `ui/screens/Realm.tsx#Operations.1` | [IF open] Hide operations [ELSE] Operations against {RIVALS[id].name} [END] |
| `ui/screens/Realm.tsx#Operations.2` | [IF costText(o.cost)] Costs {costText(o.cost)} · you have {haveText(o.cost)} [ELSE] Adds a job to your contract board [END] |

### ui/screens/Roster.tsx

| ID | Line |
|---|---|
| `ui/screens/Roster.tsx#Vital.1` | [IF v < 30] var(--bad) [ELSE IF v < 50] var(--mid) [ELSE] var(--ink-2) [END] |
| `ui/screens/Roster.tsx#RosterScreen.1` | a week. Tap an order to change it, or a member to see their gear and record. |
| `ui/screens/Roster.tsx#RosterScreen.2` | Orders for {member full name}: {ASSIGNMENTS.find((a) => a.id is m.assignment).label}. Tap to change. |
| `ui/screens/Roster.tsx#RosterScreen.3` | New faces arrive each week. Lower Town standing affects their quality and sign-on fee. |
| `ui/screens/Roster.tsx#RosterScreen.4` | No one is looking for work. |
| `ui/screens/Roster.tsx#RosterScreen.5` | a week · leaves in |
| `ui/screens/Roster.tsx#RosterScreen.6` | The hall is full ({rosterCap(g)} members). Expand the Great Hall to hire more. |
| `ui/screens/Roster.tsx#RosterScreen.7` | Weekly costs rise from {crowns(weeklyWages(g) + upkeep(g))} to {crowns(weeklyWages(g) + upkeep(g) + m.wage)} (wage {m.wage}). |
| `ui/screens/Roster.tsx#RosterScreen.8` | {member full name} joins the guild, with their gear. |

### ui/screens/Title.tsx

| ID | Line |
|---|---|
| `ui/screens/Title.tsx#NewGuild.1` | A New Guild |
| `ui/screens/Title.tsx#NewGuild.2` | Every charter starts somewhere different. |
| `ui/screens/Title.tsx#NewGuild.3` | crowns in hand · |
| `ui/screens/Title.tsx#NewGuild.4` | owed to the Weighhouse · |
| `ui/screens/Title.tsx#NewGuild.5` | The state of Varrow |
| `ui/screens/Title.tsx#NewGuild.6` | Found the guild |
| `ui/screens/Title.tsx#NewGuild.7` | Roll a different start |
| `ui/screens/Title.tsx#NewGuild.8` | Read the prologue again |
| `ui/screens/Title.tsx#setChoosing.1` | [IF v] [IF prologueSeen()] new [ELSE] prologue-new [END] [ELSE] title [END] |
| `ui/screens/Title.tsx#Title.1` | Switch to [IF theme is 'dark'] light [ELSE] dark [END] mode |
| `ui/screens/Title.tsx#Title.2` | Ledger &amp; Blade |
| `ui/screens/Title.tsx#Title.3` | The realm owes a fortune. Everyone needs a blade. Keep your books balanced. |
| `ui/screens/Title.tsx#Title.4` | Start a new guild? |
| `ui/screens/Title.tsx#Title.5` | The guild you are playing now is lost when you found the new one, unless you have saved it to a slot from the menu. Saves already in slots are kept. |
| `ui/screens/Title.tsx#Title.6` | Import a save |
| `ui/screens/Title.tsx#Title.7` | How to play |
| `ui/screens/Title.tsx#Title.8` | Read the prologue |
| `ui/screens/Title.tsx#Title.9` | · progress is saved on this device |
| `ui/screens/Title.tsx#GameOver.1` | The Ledger Closes |
| `ui/screens/Title.tsx#GameOver.2` | Your guild lasted until |
| `ui/screens/Title.tsx#GameOver.3` | fell in your service. |
| `ui/screens/Title.tsx#GameOver.4` | Back to the title screen |

### ui/sheets/DateSheet.tsx

| ID | Line |
|---|---|
| `ui/sheets/DateSheet.tsx#DateSheet.1` | A Date is a day on the guild's calendar worth preparing for. If every target is met when it arrives, the guild collects the reward, and if any one is missed, it pays the cost. The next Date is always in view, though events can call one off. |
| `ui/sheets/DateSheet.tsx#DateSheet.2` | If nothing changes, the treasury will hold about |
| `ui/sheets/DateSheet.tsx#DateSheet.3` | when that week closes. |
| `ui/sheets/DateSheet.tsx#DateSheet.4` | If you meet it |
| `ui/sheets/DateSheet.tsx#DateSheet.5` | If you miss it |
| `ui/sheets/DateSheet.tsx#DateSheet.6` | Nothing is on the calendar this week. A new Date is set at the start of next week. |
| `ui/sheets/DateSheet.tsx#DateSheet.7` | This one is expected next, but events may change it. |
| `ui/sheets/DateSheet.tsx#DateSheet.8` | [IF p.outcome is 'met'] check [ELSE IF p.outcome is 'missed'] x [ELSE] exit [END] |
| `ui/sheets/DateSheet.tsx#DateSheet.9` | [IF p.outcome is 'met'] Met [ELSE IF p.outcome is 'missed'] Missed [ELSE] Called off [END] |

### ui/sheets/EndWeekSheet.tsx

| ID | Line |
|---|---|
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.1` | End the week? |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.2` | Press and hold to end the week. |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.3` | Hold to end |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.4` | Everything below happens at once when the week ends, and none of it can be undone. |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.5` | goes on. Their next stretch is in the week report. |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.6` | : the squad is due home. |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.7` | {x.n} [DEPENDS ON x.a.id] rest: resting [OR] train: training [OR] rumors: gathering rumors [OR] labor: working the docks [OR] guard: guarding the hall [OR] build: building [OR] scout: scouting [END] |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.8` | Building continues, with about |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.9` | The workshop works through its queue of |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.10` | The Council votes. |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.11` | in wages and upkeep |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.12` | [IF loanDue] [IF loanStillDue(loanDue) > 0] , plus the loan payment of {crowns(loanStillDue(loanDue))} [ELSE] . The loan payment due this week was paid early [END] [END] |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.13` | . The treasury should close the week at about |

### ui/sheets/EventCard.tsx

| ID | Line |
|---|---|
| `ui/sheets/EventCard.tsx#pick.1` | [IF failCost.length and not cost.length] If the check fails, it costs {joinParts(failCost)}. [END] |
| `ui/sheets/EventCard.tsx#pick.2` | This choice spends from the guild. |
| `ui/sheets/EventCard.tsx#EventCard.1` | · setting out for |
| `ui/sheets/EventCard.tsx#EventCard.2` | [IF chk.who]  ({chk.who.split(' ')[0]} tries) [ELSE IF mission]  [ELSE]  (no one at home to try: your people are away) [END] |

### ui/sheets/ExpLogSheet.tsx

| ID | Line |
|---|---|
| `ui/sheets/ExpLogSheet.tsx#ExpLogSheet.1` | Nothing to show. |
| `ui/sheets/ExpLogSheet.tsx#ExpLogSheet.2` | [IF speed > 1] Fast. Tap the log to slow down. [ELSE] Tap the log to speed up. [END] |
| `ui/sheets/ExpLogSheet.tsx#ExpLogSheet.3` | [IF ms.report] {ms.report.tier}. [ELSE IF not ms.sealed] Still in the yard: they leave at the end of the week. [ELSE] Week {st.revealed} of about {ms.plannedWeeks}[IF st.zone] , in {st.zone}, room {st.room} of {st.rooms} [ELSE] , on the road [END]. [END] |
| `ui/sheets/ExpLogSheet.tsx#ExpLogSheet.4` | [IF state is 'dead'] dead [ELSE IF state is 'down'] down [ELSE IF state is 'out'] carried [ELSE] {cur.squad.hp[i]} hp[IF state is 'spent']  · spent [END][IF cur.squad.fever.[i]]  · fever [END] [END] |
| `ui/sheets/ExpLogSheet.tsx#ExpLogSheet.5` | Nothing yet. The first stretch of the trip shows in the week report after End Week. |

### ui/sheets/HelpSheet.tsx

| ID | Line |
|---|---|
| `ui/sheets/HelpSheet.tsx#HelpSheet.1` | Ledger & Blade |
| `ui/sheets/HelpSheet.tsx#HelpSheet.2` | , a guild in Varrow, a city drowning in the realm's debt to Ostrander's bank. Each turn is one week. Plan freely, then press |
| `ui/sheets/HelpSheet.tsx#HelpSheet.3` | , and everything you set in motion resolves at once. |
| `ui/sheets/HelpSheet.tsx#HelpSheet.4` | Reading the colors |
| `ui/sheets/HelpSheet.tsx#HelpSheet.5` | Tags: what you'll face. Dashed “?” tags are unknown. |
| `ui/sheets/HelpSheet.tsx#HelpSheet.6` | Good, uncertain, poor odds. |
| `ui/sheets/HelpSheet.tsx#HelpSheet.7` | Wages, hall upkeep and supplies are due every week, and your Weighhouse loan wants a payment every four. Four weeks in the red, or three missed loan payments, and the guild is finished. The Hall shows a four-week projection. |
| `ui/sheets/HelpSheet.tsx#HelpSheet.8` | Pick a contract and choose a squad. Each mission is a series of |
| `ui/sheets/HelpSheet.tsx#HelpSheet.9` | , and each phase can be tackled with an |
| `ui/sheets/HelpSheet.tsx#HelpSheet.10` | : Assault, Stealth, Guile, Endurance or Arcana. Every approach uses different attributes and adds up the squad differently. Stealth is only as good as your clumsiest member, while Assault counts everyone's blades. |
| `ui/sheets/HelpSheet.tsx#HelpSheet.11` | Phase odds come from your squad's score against the phase's difficulty. Tap |
| `ui/sheets/HelpSheet.tsx#HelpSheet.12` | to see every number. The final phase is the objective. Strong results make the next phase easier, and failures make it harder and hurt people. |
| `ui/sheets/HelpSheet.tsx#HelpSheet.13` | Tags and preparation |
| `ui/sheets/HelpSheet.tsx#HelpSheet.14` | Enemies and environments have |
| `ui/sheets/HelpSheet.tsx#HelpSheet.15` | . Armored enemies laugh at swords but fear hammers, Fireborn shrug off fire but dread frost, and Cold saps endurance unless someone packs furs. Weapons, oils, salts and kit counter tags. Unknown tags (“?”) are dangers you don't know about yet. Spend Intel or send a Scout ahead to find out, so you know what to pack and who to send. |
| `ui/sheets/HelpSheet.tsx#HelpSheet.16` | Members tire, bleed, level up and can die for good. Wounded and exhausted members perform badly, so rest them. Idle members can train, gather rumors (Intel), work the docks, or scout a contract. Unpaid or unhappy members lose loyalty, and Hobb & Daughters will poach the disloyal. |
| `ui/sheets/HelpSheet.tsx#HelpSheet.17` | Every contract pleases someone and annoys someone else. Watch your standing with the Exchequer (who holds your charter), the Weighhouse, Ostrander's and the Lower Town, and keep your Heat low. The Debt clocks show where the realm is heading. |

### ui/sheets/Journal.tsx

| ID | Line |
|---|---|
| `ui/sheets/Journal.tsx#NotesTab.1` | The notes card is hidden, but your progress and rewards still count. |
| `ui/sheets/Journal.tsx#NotesTab.2` | Show it again |
| `ui/sheets/Journal.tsx#NotesTab.3` | All notes complete. You know the ropes. |
| `ui/sheets/Journal.tsx#NotesTab.4` | [IF waiting.get(o.id)] Not yet: {waiting.get(o.id)} [ELSE] After the current notes [END] |
| `ui/sheets/Journal.tsx#NotesTab.5` | Nothing completed yet. |
| `ui/sheets/Journal.tsx#CodexTab.1` | entries. More are learned by going places, facing new enemies, meeting people, and listening to the street. |

### ui/sheets/MemberSheet.tsx

| ID | Line |
|---|---|
| `ui/sheets/MemberSheet.tsx#statusLine.1` | On "{ms.contract.title}", back [IF left <= 0] at the end of this week [ELSE] in {left}{1} weeks [END] |
| `ui/sheets/MemberSheet.tsx#statusLine.2` | [IF lay.weeks is 1] next week [ELSE] in {lay.weeks} weeks [END] |
| `ui/sheets/MemberSheet.tsx#statusLine.3` | [IF lay.why is 'fever'] In bed with the Sink fever, up {when} [ELSE] Resting with wounds, fit {when} [END] |
| `ui/sheets/MemberSheet.tsx#MemberSheet.1` | [IF m.status is 'dead' or m.status is 'left'] {m.name.split(' ')[0]} is no longer with the guild. [ELSE] {awayReason(game, m)} [END] |
| `ui/sheets/MemberSheet.tsx#MemberSheet.2` | {m.xp}/{xpToLevel(m.level)} xp to next level |
| `ui/sheets/MemberSheet.tsx#MemberSheet.3` | Leaving at the end of this week. You can still change their gear, or cancel the dispatch from Contracts. |
| `ui/sheets/MemberSheet.tsx#MemberSheet.4` | [IF m.health < 40] bad [ELSE IF m.health < 75] mid [ELSE] good [END] |
| `ui/sheets/MemberSheet.tsx#MemberSheet.5` | Runoff and fever in the body. At 40, 70 and 95 it brings a Sink change. |
| `ui/sheets/MemberSheet.tsx#MemberSheet.6` | In bed with the Sink fever for |
| `ui/sheets/MemberSheet.tsx#MemberSheet.7` | [IF m.fever.weeks is 1] another week [ELSE] {m.fever.weeks} more weeks [END] |
| `ui/sheets/MemberSheet.tsx#MemberSheet.8` | . They'll get up changed. |
| `ui/sheets/MemberSheet.tsx#MemberSheet.9` | Saint Oda's fever beds |
| `ui/sheets/MemberSheet.tsx#MemberSheet.10` | Send {m.name.split(' ')[0]} to Saint Oda's? |
| `ui/sheets/MemberSheet.tsx#MemberSheet.11` | A night in the fever beds draws {EXP_TUNING.exposure.treat} Exposure out of them. It puts off a Sink change; it doesn't undo one they already have. |
| `ui/sheets/MemberSheet.tsx#MemberSheet.12` | {m.name.split(' ')[0]} spends a night at Saint Oda's. Exposure is down to {Math.max(0, (m.exposure ?? 0) - EXP_TUNING.exposure.treat)}. |
| `ui/sheets/MemberSheet.tsx#MemberSheet.13` | Saint Oda's fever beds · − |
| `ui/sheets/MemberSheet.tsx#MemberSheet.14` | {m.name.split(' ')[0]} now carries {def.name}[IF holder and holder.id is not m.id] , taken from {holder.name.split(' ')[0]} [END]. |
| `ui/sheets/MemberSheet.tsx#MemberSheet.15` | [IF holder] [IF holder.id is m.id] Equipped [ELSE] Held by {holder.name.split(' ')[0]} [END] [ELSE] In stores [END] |
| `ui/sheets/MemberSheet.tsx#MemberSheet.16` | None in the armory. Buy some at the market. |
| `ui/sheets/MemberSheet.tsx#MemberSheet.17` | (no tags, current gear) |
| `ui/sheets/MemberSheet.tsx#MemberSheet.18` | No missions yet. Joined in |
| `ui/sheets/MemberSheet.tsx#MemberSheet.19` | They leave the guild for good. Their gear stays in the armory, and you save {crowns(m.wage)} a week. |
| `ui/sheets/MemberSheet.tsx#MemberSheet.20` | The others will notice (morale −3). |
| `ui/sheets/MemberSheet.tsx#MemberSheet.21` | Dismiss from the guild |
| `ui/sheets/MemberSheet.tsx#FameBlock.1` | [IF m.epithet] {m.epithet}, a Legend of Varrow [ELSE IF tier] {FAME_TIERS[tier].name} [ELSE] Not yet known [END] |
| `ui/sheets/MemberSheet.tsx#FameBlock.2` | [IF tier < 3] Fame {fame} of {next.min} to be {next.name}[IF next.name is 'Legendary']  (also needs level {LEGEND_NEEDS.level} and {LEGEND_NEEDS.missions} missions) [END]. [ELSE] Fame {fame}. [END] |
| `ui/sheets/MemberSheet.tsx#FameBlock.3` | : people tell |

### ui/sheets/MenuSheet.tsx

| ID | Line |
|---|---|
| `ui/sheets/MenuSheet.tsx#MenuSheet.1` | Slot {n} holds a save from week {info.week}. It will be replaced with your current game. |
| `ui/sheets/MenuSheet.tsx#MenuSheet.2` | [IF not info] Slot {n} is empty. Save a game there first. [END] |
| `ui/sheets/MenuSheet.tsx#MenuSheet.3` | [IF g] Your current game will be replaced by this save. Anything not saved to a slot will be lost. [ELSE] Load this save? [END] |
| `ui/sheets/MenuSheet.tsx#MenuSheet.4` | The game also autosaves after every action. |
| `ui/sheets/MenuSheet.tsx#MenuSheet.5` | Export save as text |
| `ui/sheets/MenuSheet.tsx#MenuSheet.6` | [IF not importText] Paste a save into the box above first. [END] |
| `ui/sheets/MenuSheet.tsx#MenuSheet.7` | Guildmaster’s Notes (guided objectives) |
| `ui/sheets/MenuSheet.tsx#MenuSheet.8` | How to play |
| `ui/sheets/MenuSheet.tsx#MenuSheet.9` | Back to title |

### ui/sheets/OrdersSheet.tsx

| ID | Line |
|---|---|
| `ui/sheets/OrdersSheet.tsx#OrdersSheet.1` | is not at the hall this week, so there are no orders to give. |

### ui/sheets/PrepSheet.tsx

| ID | Line |
|---|---|
| `ui/sheets/PrepSheet.tsx#ORDER_ROWS.1` | Turn back as soon as anyone is badly hurt or worn out, or anyone dies. |
| `ui/sheets/PrepSheet.tsx#ORDER_ROWS.2` | Turn back when two are badly hurt or worn out, or anyone dies. |
| `ui/sheets/PrepSheet.tsx#ORDER_ROWS.3` | Keep going until half the squad is dead or close to it. |
| `ui/sheets/PrepSheet.tsx#ORDER_ROWS.4` | Bandages and dressings go to whoever is worst off. |
| `ui/sheets/PrepSheet.tsx#ORDER_ROWS.5` | Keep the people in front standing, and the rest wait. |
| `ui/sheets/PrepSheet.tsx#ORDER_ROWS.6` | Keep the casters and shooters up, and the front looks after itself. |
| `ui/sheets/PrepSheet.tsx#ORDER_ROWS.7` | Hide and let them pass. A Scout, an Infiltrator and soft boots help; plate and the dark do not. Fail and they ambush you. |
| `ui/sheets/PrepSheet.tsx#ORDER_ROWS.8` | Go and meet them. More loot, experience and renown, and more wounds. |
| `ui/sheets/PrepSheet.tsx#ORDER_ROWS.9` | Only at the safe places on the route. |
| `ui/sheets/PrepSheet.tsx#ORDER_ROWS.10` | Also stop wherever the squad is badly hurt. It costs food, and something may find you. |
| `ui/sheets/PrepSheet.tsx#ORDER_ROWS.11` | Bandage early and cast with doses every time. |
| `ui/sheets/PrepSheet.tsx#ORDER_ROWS.12` | Bandage the badly hurt, and save doses for the bigger monsters. |
| `ui/sheets/PrepSheet.tsx#ORDER_ROWS.13` | Only in emergencies. Doses are kept for the biggest fights. |
| `ui/sheets/PrepSheet.tsx#PrepSheet.1` | That contract is no longer on the board. |
| `ui/sheets/PrepSheet.tsx#setPack.1` | The pack is full. It holds {EXP_TUNING.packSlots} slots. |
| `ui/sheets/PrepSheet.tsx#setOut.1` | Send a squad of {squad.length} to {info.siteName}? |
| `ui/sheets/PrepSheet.tsx#setOut.2` | {squad.map(first).join(', ')}: {info.goalText}. They should be away about [IF info.weeks is 1] a week [ELSE] {info.weeks} weeks [END], and leave the yard at the end of this one. |
| `ui/sheets/PrepSheet.tsx#setOut.3` | Their wages while away: about {wages} crowns. |
| `ui/sheets/PrepSheet.tsx#setOut.4` | Once they leave, nobody can send them orders. The standing orders are all they have. |
| `ui/sheets/PrepSheet.tsx#setOut.5` | [IF cost] {cost} crowns of supplies to buy · treasury {g.crowns} → {g.crowns - cost} [END] |
| `ui/sheets/PrepSheet.tsx#setOut.6` | The squad is getting ready in the yard. They leave for {info.siteName} at the end of the week. |
| `ui/sheets/PrepSheet.tsx#PrepSheet.2` | [IF atLimit] {squadsOut(g)} of {squadLimit(g)} squads are out, so this one can't leave until one is home or called off. [ELSE] {squadsOut(g)} of {squadLimit(g)} squads out. The hall can send [IF squadLimit(g) - squadsOut(g) is 1] one more [ELSE] {squadLimit(g) - squadsOut(g)} more [END]. [END] |
| `ui/sheets/PrepSheet.tsx#PrepSheet.3` | Your operation against |
| `ui/sheets/PrepSheet.tsx#PrepSheet.4` | [IF camps] , with [IF camps is 1] a camp site [ELSE] {camps} camp sites [END] on the way [END] |
| `ui/sheets/PrepSheet.tsx#PrepSheet.5` | . Away for about |
| `ui/sheets/PrepSheet.tsx#PrepSheet.6` | [IF info.weeks is 1] a week [ELSE] {info.weeks} weeks [END] |
| `ui/sheets/PrepSheet.tsx#PrepSheet.7` | , road included. |
| `ui/sheets/PrepSheet.tsx#PrepSheet.8` | A dashed “?” is a danger nobody has confirmed. Tap one to learn which it is for |
| `ui/sheets/PrepSheet.tsx#PrepSheet.9` | Intel (you have |
| `ui/sheets/PrepSheet.tsx#PrepSheet.10` | ), or give a member the Scout order on the Roster and they'll report back at the end of the week. |
| `ui/sheets/PrepSheet.tsx#PrepSheet.11` | The squad, front to back ([IF size.min is size.max] {size.max} [ELSE] {size.min} to {size.max} [END]) |
| `ui/sheets/PrepSheet.tsx#PrepSheet.12` | Positions 1 and 2 are in front: they can reach with a blade, and most enemies hit them. Bows and spells work from further back. Tap a member to change their gear. |
| `ui/sheets/PrepSheet.tsx#PrepSheet.13` | · best in position |
| `ui/sheets/PrepSheet.tsx#PrepSheet.14` | [IF i < size.min] Empty. Choose someone from the bench. [ELSE] Empty. Optional. [END] |
| `ui/sheets/PrepSheet.tsx#PrepSheet.15` | Move [IF m] {member} [ELSE] position [END] forward |
| `ui/sheets/PrepSheet.tsx#PrepSheet.16` | Move [IF m] {member} [ELSE] position [END] back |
| `ui/sheets/PrepSheet.tsx#PrepSheet.17` | Leave [IF m] {member} [ELSE] position [END] at home |
| `ui/sheets/PrepSheet.tsx#PrepSheet.18` | These are your people at home. Tap a number beside someone to put them in that position. |
| `ui/sheets/PrepSheet.tsx#PrepSheet.19` | a slot · |
| `ui/sheets/PrepSheet.tsx#PrepSheet.20` | [IF k is 'food'] in the guild supplies [ELSE] in the stores [END] |
| `ui/sheets/PrepSheet.tsx#PrepSheet.21` | Buying what the stores don't have: |
| `ui/sheets/PrepSheet.tsx#PrepSheet.22` | Nobody can send orders once they've gone. These are what the squad will do. |
| `ui/sheets/PrepSheet.tsx#PrepSheet.23` | Start again from a suggested plan |

### ui/sheets/WatchSheet.tsx

| ID | Line |
|---|---|
| `ui/sheets/WatchSheet.tsx#WatchSheet.1` | [IF speed > 1] Tap the feed to go back to normal speed. [ELSE] Tap the feed to speed up. [END] |
| `ui/sheets/WatchSheet.tsx#WatchSheet.2` | [IF squads.length > 1] [IF follow] Tap the squad again to see everyone. [ELSE] Tap a squad to follow only them. [END] [END] |
| `ui/sheets/WatchSheet.tsx#WatchSheet.3` | [IF room.zone] {ZONES[room.zone].name}, room {room.room}{1} of {ms.result.roomsPlanned} [ELSE] on the road [END] |
| `ui/sheets/WatchSheet.tsx#WatchSheet.4` | Nothing new down below this week. |

### ui/sheets/WeekReport.tsx

| ID | Line |
|---|---|
| `ui/sheets/WeekReport.tsx#WeekReport.1` | The week's end |
| `ui/sheets/WeekReport.tsx#WeekReport.2` | No change to your resources. |
| `ui/sheets/WeekReport.tsx#WeekReport.3` | Where the crowns went |
| `ui/sheets/WeekReport.tsx#WeekReport.4` | From the field |
| `ui/sheets/WeekReport.tsx#WeekReport.5` | A quiet week. |

### App.tsx

| ID | Line |
|---|---|
| `App.tsx#TopBar.1` | Crowns. Weekly costs: {burn} (wages {weeklyWages(g)} + upkeep {upkeep(g)}). |
| `App.tsx#TopBar.2` | Supplies. {living(g).filter((m) => m.status is not 'mission').length} eaten per week at home; squads carry their own. |
| `App.tsx#TopBar.3` | Intel. Reveal hidden tags and rival plans. |
| `App.tsx#TopBar.4` | Influence. Court factions and cool Heat. |
| `App.tsx#TopBar.5` | Renown. Better contracts and goods; rivals take note. |
| `App.tsx#TopBar.6` | Heat. Legal exposure from shady work. |
| `App.tsx#TopBar.7` | {r.name} {r.value}[IF goal] . The next Date asks about {r.name}. [END] |
