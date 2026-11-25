## Interface text

Labels, help, confirmations and empty states in the screens and sheets (lines of three words or more). Where a sentence is split by bold text or a button inside it, it appears in pieces.

### ui/kit/DispatchItem.tsx

| ID | Line |
|---|---|
| `ui/kit/DispatchItem.tsx#DispatchItem.1` | Read the mission report |

### ui/kit/common.tsx

| ID | Line |
|---|---|
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
| `ui/kit/members.tsx#choose.1` | No contract has anything left to scout. |
| `ui/kit/members.tsx#choose.2` | {m.name.split(' ')[0]}: {a.label} this week. [IF a.id is 'train'] Pick what to train below. [ELSE] {a.blurb} [END] |
| `ui/kit/members.tsx#OrderPicker.1` | [IF a.id is 'train'] +1 to an attribute every {trainWeeks(game)} weeks. Costs {crowns(trainCost(game))} a week and adds fatigue. [ELSE] {a.blurb} [END] |

### ui/kit/shortfall.ts

| ID | Line |
|---|---|
| `ui/kit/shortfall.ts#short.1` | [IF res is 'crowns'] [IF what] {what} costs [ELSE] It costs [END] {crowns(need)}, and the treasury holds {crowns(have)}. [ELSE IF res in NAMES] [IF what] {what} needs [ELSE] It needs [END] {need} [DEPENDS ON res] supplies: supplies [OR] intel: Intel [OR] influence: Influence [END], and you have {have}. [ELSE] [IF what] {what} needs [ELSE] It needs [END] {need} {MATERIAL_INFO[res as MaterialId].name}, and you have {have}. [END] |

### ui/kit/visual.tsx

| ID | Line |
|---|---|
| `ui/kit/visual.tsx#readiness.1` | [IF ms] [IF ms.returnWeek <= g!.week] Away · back this week [ELSE] Away · back in {wk(ms.returnWeek - g!.week + 1)} [END] [ELSE] Away [END] |
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
| `ui/screens/Armory.tsx#ArmoryScreen.2` | Stock changes weekly, and better goods appear as your renown grows. Weak coin raises prices, and Weighhouse friendship lowers them. |
| `ui/screens/Armory.tsx#ArmoryScreen.3` | [IF owned] You already own {owned}. It goes into Inventory. Equip it from a member's Gear. [ELSE] It goes into Inventory. Equip it from a member's Gear. [END] |
| `ui/screens/Armory.tsx#ArmoryScreen.4` | Bought {def.name} for {crowns(price)}. Equip it from a member's Gear. |
| `ui/screens/Armory.tsx#ArmoryScreen.5` | The armory is empty. |
| `ui/screens/Armory.tsx#ArmoryScreen.6` | [IF holder] Held by {holder.name} [ELSE] In stores [END] |
| `ui/screens/Armory.tsx#ArmoryScreen.7` | [IF holder] {holder.name} is using it, and will be left without it. [ELSE] It goes back to the market for half its price. [END] |
| `ui/screens/Armory.tsx#ArmoryScreen.8` | Recovered from missions, or bought here. Used to craft in the Workshop and to build in the Hall. Buying or selling a lot at once moves the price. |
| `ui/screens/Armory.tsx#ArmoryScreen.9` | · sell about |
| `ui/screens/Armory.tsx#ArmoryScreen.10` | You have {g.materials[m]} {MATERIAL_INFO[m].name}. Buying a lot at once pushes the price up. |
| `ui/screens/Armory.tsx#ArmoryScreen.11` | Bought 5 {MATERIAL_INFO[m].name}. You now have {g.materials[m]}{5}. |
| `ui/screens/Armory.tsx#ArmoryScreen.12` | Buy 5 · |
| `ui/screens/Armory.tsx#ArmoryScreen.13` | [IF g.materials[m] < 1] No {MATERIAL_INFO[m].name} to sell [END] |
| `ui/screens/Armory.tsx#ArmoryScreen.14` | [IF g.materials[m] < 1] No {MATERIAL_INFO[m].name} to sell [END] |

### ui/screens/Contracts.tsx

| ID | Line |
|---|---|
| `ui/screens/Contracts.tsx#MissionTrack.1` | [IF m.report] {m.report.tier} · [IF m.returnWeek <= g.week] home at the end of this week [ELSE] home in {weeks(m.returnWeek - g.week + 1)} [END] [ELSE IF m.arriveWeek is g.week] Reaches the objective at the end of this week [ELSE] Arrives in {weeks(m.arriveWeek - g.week + 1)} [END] |
| `ui/screens/Contracts.tsx#MissionTrack.2` | [IF m.report] {m.report.tier} · [IF m.returnWeek <= g.week] home this week [ELSE] home in {wk(m.returnWeek - g.week + 1)} [END] [ELSE IF preparing] Leaving this week [ELSE IF m.arriveWeek is g.week] At the objective this week [ELSE] Arrives in {wk(m.arriveWeek - g.week + 1)} [END] |
| `ui/screens/Contracts.tsx#MissionTrack.3` | [IF m.report]  · read the report [END] |
| `ui/screens/Contracts.tsx#MissionTrack.4` | Tap to read the journal |
| `ui/screens/Contracts.tsx#MissionTrack.5` | Leaving at the end of this week. Gear can still change: |
| `ui/screens/Contracts.tsx#MissionTrack.6` | Cancel this dispatch? |
| `ui/screens/Contracts.tsx#MissionTrack.7` | The squad stays home. The {m.supplies} supplies they packed go back to the stores, and "{c.title}" returns to the board. |
| `ui/screens/Contracts.tsx#MissionTrack.8` | Dispatch cancelled. The squad is back in the hall. |
| `ui/screens/Contracts.tsx#ContractsScreen.1` | In the field ({g.missions.length}) |
| `ui/screens/Contracts.tsx#ContractsScreen.2` | No contracts this week. |
| `ui/screens/Contracts.tsx#ContractCard.1` | Your operation against |
| `ui/screens/Contracts.tsx#ContractCard.2` | Not enough people free |
| `ui/screens/Contracts.tsx#ContractCard.3` | [IF expiring] Expires this week [ELSE] {wk(c.expiresWeek - g.week + 1)} left [END] |

### ui/screens/Hall.tsx

| ID | Line |
|---|---|
| `ui/screens/Hall.tsx#alerts.1` | {plural(g.pendingEvents.length, 'dispatch', 'dispatches')} [IF g.pendingEvents.length is 1] awaits [ELSE] await [END] your decision. |
| `ui/screens/Hall.tsx#alerts.2` | Loan payment of {crowns(l.paymentDue)} due [IF inWeeks <= 0] this week [ELSE] next week [END]. |
| `ui/screens/Hall.tsx#alerts.3` | Missed loan payments: {l.missed} of 3. |
| `ui/screens/Hall.tsx#alerts.4` | In the red for {plural(g.insolventWeeks, 'week')}. At 4, the guild is bankrupt. |
| `ui/screens/Hall.tsx#alerts.5` | Charter in danger: {plural(6 - g.charterWeeks, 'week')} left to fix it. |
| `ui/screens/Hall.tsx#alerts.6` | Heat is {g.heat}. The Exchequer is watching. |
| `ui/screens/Hall.tsx#alerts.7` | {plural(back.length, 'squad')} [IF back.length is 1] returns [ELSE] return [END] at the end of this week. |
| `ui/screens/Hall.tsx#alerts.8` | {plural(arriving.length, 'squad')} [IF arriving.length is 1] reaches its [ELSE] reach their [END] objective this week. |
| `ui/screens/Hall.tsx#alerts.9` | Supplies are low ({g.supplies}). Buy more at the Armory. |
| `ui/screens/Hall.tsx#alerts.10` | Story contract available: "{story.title}". |
| `ui/screens/Hall.tsx#HallScreen.1` | This week so far |
| `ui/screens/Hall.tsx#HallScreen.2` | [IF loan.dueWeek <= g.week] this week [ELSE IF loan.dueWeek is g.week + 1] next week [ELSE] in {weeks(loan.dueWeek - g.week)} [END] |
| `ui/screens/Hall.tsx#HallScreen.3` | The projection counts known costs and the listed pay of squads already in the field. Supplies are bought separately. |
| `ui/screens/Hall.tsx#HallScreen.4` | Last week in detail |
| `ui/screens/Hall.tsx#HallScreen.5` | You owe the Weighhouse |
| `ui/screens/Hall.tsx#HallScreen.6` | % interest per week. Next payment: |
| `ui/screens/Hall.tsx#HallScreen.7` | [IF loan.dueWeek is g.week] at the end of this week [ELSE IF loan.dueWeek is g.week + 1] next week [ELSE] in {weeks(loan.dueWeek - g.week)} [END] |
| `ui/screens/Hall.tsx#HallScreen.8` | Repay {n} crowns early? |
| `ui/screens/Hall.tsx#HallScreen.9` | Your debt falls from {Math.ceil(loan.principal)} to {Math.ceil(loan.principal - n)}, saving about {crowns(Math.round(n * loan.weeklyRate * 10) / 10)} interest every week. |
| `ui/screens/Hall.tsx#HallScreen.10` | Make sure you can still cover weekly costs: {crowns(weeklyWages(g) + upkeep(g))}. |
| `ui/screens/Hall.tsx#HallScreen.11` | [IF g.crowns < loan.principal] Need {Math.ceil(loan.principal)} crowns to clear the debt [END] |
| `ui/screens/Hall.tsx#HallScreen.12` | Clear the whole debt? |
| `ui/screens/Hall.tsx#HallScreen.13` | The Weighhouse returns your note, and the guild owes nothing. |
| `ui/screens/Hall.tsx#HallScreen.14` | Paying early reduces the interest that piles up each week. Missing 3 payments means ruin. |
| `ui/screens/Hall.tsx#HallScreen.15` | The guild is debt-free. |
| `ui/screens/Hall.tsx#HallScreen.16` | Show older dispatches |

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
| `ui/screens/Title.tsx#Title.1` | Switch to [IF theme is 'dark'] light [ELSE] dark [END] mode |
| `ui/screens/Title.tsx#Title.2` | Ledger &amp; Blade |
| `ui/screens/Title.tsx#Title.3` | The realm owes a fortune. Everyone needs a blade. Keep your books balanced. |
| `ui/screens/Title.tsx#Title.4` | Start a new guild? Your autosave will be replaced. |
| `ui/screens/Title.tsx#Title.5` | Import a save |
| `ui/screens/Title.tsx#Title.6` | How to play |
| `ui/screens/Title.tsx#Title.7` | · progress is saved on this device |
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
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.5` | : the squad reaches the objective. |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.6` | : the squad comes home. |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.7` | {x.n} [DEPENDS ON x.a.id] rest: resting [OR] train: training [OR] rumors: gathering rumors [OR] labor: working the docks [OR] guard: guarding the hall [OR] build: building [OR] scout: scouting [END] |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.8` | Building continues, with about |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.9` | The workshop works through its queue of |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.10` | The Council votes. |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.11` | in wages and upkeep |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.12` | [IF loanDue] , plus the loan payment of {crowns(loanDue.paymentDue)} [END] |
| `ui/sheets/EndWeekSheet.tsx#EndWeekSheet.13` | . The treasury should close the week at about |

### ui/sheets/EventCard.tsx

| ID | Line |
|---|---|
| `ui/sheets/EventCard.tsx#EventCard.1` | [IF mission.arriveWeek <= g.week] this week [ELSE] in {weeks(mission.arriveWeek - g.week + 1)} [END] |
| `ui/sheets/EventCard.tsx#EventCard.2` | [IF chk.who]  ({chk.who.split(' ')[0]} tries) [ELSE IF mission]  [ELSE]  (no one at home to try: your people are away) [END] |

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
| `ui/sheets/HelpSheet.tsx#HelpSheet.15` | . Armored enemies laugh at swords but fear hammers, Fireborn shrug off fire but dread frost, and Cold saps endurance unless someone packs furs. Weapons, oils, salts and kit counter tags. Unknown tags (“?”) turn your odds into a |
| `ui/sheets/HelpSheet.tsx#HelpSheet.16` | . Spend Intel or send a Scout ahead to know what you face. |
| `ui/sheets/HelpSheet.tsx#HelpSheet.17` | Members tire, bleed, level up and can die for good. Wounded and exhausted members perform badly, so rest them. Idle members can train, gather rumors (Intel), work the docks, or scout a contract. Unpaid or unhappy members lose loyalty, and Hobb & Daughters will poach the disloyal. |
| `ui/sheets/HelpSheet.tsx#HelpSheet.18` | Every contract pleases someone and annoys someone else. Watch your standing with the Exchequer (who holds your charter), the Weighhouse, Ostrander's and the Lower Town, and keep your Heat low. The Debt clocks show where the realm is heading. |

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
| `ui/sheets/MemberSheet.tsx#MemberSheet.1` | [IF m.status is 'dead' or m.status is 'left'] {m.name.split(' ')[0]} is no longer with the guild. [ELSE] {awayReason(game, m)} [END] |
| `ui/sheets/MemberSheet.tsx#MemberSheet.2` | {m.xp}/{xpToLevel(m.level)} xp to next level |
| `ui/sheets/MemberSheet.tsx#MemberSheet.3` | Leaving at the end of this week. You can still change their gear, or cancel the dispatch from Contracts. |
| `ui/sheets/MemberSheet.tsx#MemberSheet.4` | [IF m.health < 40] bad [ELSE IF m.health < 75] mid [ELSE] good [END] |
| `ui/sheets/MemberSheet.tsx#MemberSheet.5` | {m.name.split(' ')[0]} now carries {def.name}[IF holder and holder.id is not m.id] , taken from {holder.name.split(' ')[0]} [END]. |
| `ui/sheets/MemberSheet.tsx#MemberSheet.6` | [IF holder] [IF holder.id is m.id] Equipped [ELSE] Held by {holder.name.split(' ')[0]} [END] [ELSE] In stores [END] |
| `ui/sheets/MemberSheet.tsx#MemberSheet.7` | None in the armory. Buy some at the market. |
| `ui/sheets/MemberSheet.tsx#MemberSheet.8` | (no tags, current gear) |
| `ui/sheets/MemberSheet.tsx#MemberSheet.9` | No missions yet. Joined in |
| `ui/sheets/MemberSheet.tsx#MemberSheet.10` | They leave the guild for good. Their gear stays in the armory, and you save {crowns(m.wage)} a week. |
| `ui/sheets/MemberSheet.tsx#MemberSheet.11` | The others will notice (morale −3). |
| `ui/sheets/MemberSheet.tsx#MemberSheet.12` | Dismiss from the guild |
| `ui/sheets/MemberSheet.tsx#FameBlock.1` | [IF m.epithet] {m.epithet}, a Legend of Varrow [ELSE IF tier] {FAME_TIERS[tier].name} [ELSE] Not yet known [END] |
| `ui/sheets/MemberSheet.tsx#FameBlock.2` | [IF tier < 3] Fame {fame} of {next.min} to be {next.name}[IF next.name is 'Legendary']  (also needs level 5 and 25 missions) [END]. [ELSE] Fame {fame}. [END] |
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

### ui/sheets/MissionReplay.tsx

| ID | Line |
|---|---|
| `ui/sheets/MissionReplay.tsx#MissionReplay.1` | The remaining phases were abandoned. |

### ui/sheets/OrdersSheet.tsx

| ID | Line |
|---|---|
| `ui/sheets/OrdersSheet.tsx#OrdersSheet.1` | is not at the hall this week, so there are no orders to give. |

### ui/sheets/Planner.tsx

| ID | Line |
|---|---|
| `ui/sheets/Planner.tsx#StrengthMatrix.1` | Nobody here yet. |
| `ui/sheets/Planner.tsx#StrengthMatrix.2` | Tap a column to sort, a name to add or remove them. Underlined columns are the ones your plan uses. |
| `ui/sheets/Planner.tsx#reveal.1` | Revealing costs {INTEL_REVEAL_COST} Intel and you have {game.intel}. Set members to Gather rumors, or send a Scout ahead. |
| `ui/sheets/Planner.tsx#reveal.2` | Reveal a hidden danger? |
| `ui/sheets/Planner.tsx#reveal.3` | Your informants will find out which of these you'll face: {h.candidates.map((t) => TAGS[t].name ?? t).join(', ')}. |
| `ui/sheets/Planner.tsx#reveal.4` | Knowing turns the odds range into an exact number, and tells you what gear to bring. |
| `ui/sheets/Planner.tsx#ContractHeader.1` | Your operation against |
| `ui/sheets/Planner.tsx#ContractHeader.2` | Unknown tags make the odds a range. Tap a “?” to reveal it for |
| `ui/sheets/Planner.tsx#ContractHeader.3` | Intel (you have |
| `ui/sheets/Planner.tsx#ContractHeader.4` | ), or send a Scout ahead from the Roster. |
| `ui/sheets/Planner.tsx#ContractHeader.5` | this one. It may not last the week. |
| `ui/sheets/Planner.tsx#ContractHeader.6` | [IF c.expiresWeek <= game.week] this week [ELSE] in {weeks(c.expiresWeek - game.week + 1)} [END] |
| `ui/sheets/Planner.tsx#Planner.1` | This contract is no longer on the board. |
| `ui/sheets/Planner.tsx#blockedReason.1` | [IF ms] {m.name.split(' ')[0]} is already committed to "{ms.contract.title}". [ELSE] {m.name.split(' ')[0]} is away. [END] |
| `ui/sheets/Planner.tsx#blockedReason.2` | {m.name.split(' ')[0]} is too badly wounded to go ({m.health} HP). Rest them, or build an Infirmary. |
| `ui/sheets/Planner.tsx#toggle.1` | At most {c.maxSquad} members |
| `ui/sheets/Planner.tsx#Planner.2` | [IF members.length < c.minSquad] Pick at least {plural(c.minSquad, 'member')} for this contract. [END] |
| `ui/sheets/Planner.tsx#pickBest.1` | Not enough people are fit to go. This contract needs {c.minSquad}. |
| `ui/sheets/Planner.tsx#buyShortfall.1` | The squad needs {pv.supplies} supplies for the trip and the stores hold {game.supplies}. |
| `ui/sheets/Planner.tsx#buyShortfall.2` | Bought {shortBy} supplies. The squad can leave. |
| `ui/sheets/Planner.tsx#dispatch.1` | [IF pv.risk is 'Deadly'] This could get people killed [ELSE] Send them anyway? [END] |
| `ui/sheets/Planner.tsx#dispatch.2` | Risk: {pv.risk}. The objective succeeds {chanceText(pv.overall.min, pv.overall.max)} of the time. |
| `ui/sheets/Planner.tsx#dispatch.3` | Failed phases wound people, and wounds can kill. Better gear, a different approach, or revealing hidden tags may improve the odds. |
| `ui/sheets/Planner.tsx#send.1` | {members.map((m) => m.name.split(' ')[0]).join(', ')} set out for {c.region} carrying {pv.supplies} supplies. [IF c.travelWeeks] They arrive in {c.travelWeeks} week[IF c.travelWeeks > 1] s [END]. [ELSE] Results at the end of this week. [END] |
| `ui/sheets/Planner.tsx#Planner.3` | [IF p.min >= 0.7] good [ELSE IF p.max < 0.4] bad [ELSE] mid [END] |
| `ui/sheets/Planner.tsx#Planner.4` | [IF members.length < c.minSquad] Pick at least {c.minSquad} [ELSE] Dispatch squad ({members.length}) [END] |
| `ui/sheets/Planner.tsx#Planner.5` | [IF not best] Not enough people are fit to go. This contract needs {c.minSquad}. [END] |
| `ui/sheets/Planner.tsx#Planner.6` | Plan of action |
| `ui/sheets/Planner.tsx#Planner.7` | Select members to see your odds for each phase, then tap “Why?” to see how each number is built. |
| `ui/sheets/Planner.tsx#Planner.8` | Known tags only. Unknown tags may change this; see the range. |
| `ui/sheets/Planner.tsx#Planner.9` | Mission succeeds if the objective succeeds: |
| `ui/sheets/Planner.tsx#Planner.10` | before knock-on effects. A strong result in one phase makes the next easier, and a failure makes it harder. |
| `ui/sheets/Planner.tsx#Planner.11` | Withdraw if anyone is critically wounded (safer, but the contract fails) |
| `ui/sheets/Planner.tsx#Planner.12` | Hold a member, or tap Gear once they are picked, to see their details. Destination: |

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
