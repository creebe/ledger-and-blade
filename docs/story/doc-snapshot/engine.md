## Reports, warnings and other lines from the rules

Text the rules write into the week report, dispatches, mission journals and warnings. IDs are `file#function.n`.

### actions.ts

| ID | Line |
|---|---|
| `engine/actions.ts#hireRecruit.1` | Need {r.signOn} crowns to sign them |
| `engine/actions.ts#hireRecruit.2` | The hall is full ({rosterCap(s)} members). Expand the Great Hall. |
| `engine/actions.ts#hireRecruit.3` | {member full name} joins the guild |
| `engine/actions.ts#hireRecruit.4` | Signed for {r.signOn} crowns, at {m.wage}/week. |
| `engine/actions.ts#dismissMember.1` | The others notice. |
| `engine/actions.ts#setAssignment.1` | {m.name.split(' ')[0]} is heading out this week. Cancel the dispatch to give other orders. |
| `engine/actions.ts#awayReason.1` | [IF ms] {m.name.split(' ')[0]} is away on "{ms.contract.title}" until the end of week {ms.dispatchedWeek + ms.plannedWeeks - 1}. Gear can't be changed in the field. [ELSE] They are away [END] |
| `engine/actions.ts#repayLoan.1` | The Weighhouse returns your note. The guild owes nothing. |
| `engine/actions.ts#petition.1` | Ostrander's will send work |
| `engine/actions.ts#petition.2` | Factor Vorn accepts your overture. Bank contracts will now appear on the board. |
| `engine/actions.ts#counterCost.1` | Match the Ninth's offer (35 crowns) |
| `engine/actions.ts#counterCost.2` | Pay a loyalty bonus (25 crowns) |
| `engine/actions.ts#counterCost.3` | Send a rider to warn the squad (2 Intel) |
| `engine/actions.ts#counterCost.4` | Hire extra watchmen this week (30 crowns) |
| `engine/actions.ts#counterCost.5` | Pay a loyalty bonus (25 crowns) |

### core/newgame.ts

| ID | Line |
|---|---|
| `engine/core/newgame.ts#newGame.1` | {dateLabel(1)}. Four people, a drafty hall on Tallow Street, and a debt of {backer.loan} crowns. |

### core/turn.ts

| ID | Line |
|---|---|
| `engine/core/turn.ts#endWeekWarnings.1` | [IF idle.length is 1] 1 rested member is doing nothing. [ELSE] {idle.length} rested members are doing nothing. [END] |
| `engine/core/turn.ts#endWeekWarnings.2` | Supplies will run short: {supplies} for {home} mouths. |
| `engine/core/turn.ts#endWeekWarnings.3` | You can't cover this week's loan payment of {due.paymentDue} crowns. |
| `engine/core/turn.ts#endWeekWarnings.4` | Wages and upkeep will put you in the red. |
| `engine/core/turn.ts#endWeekWarnings.5` | [IF expiring.length is 1] 1 contract expires this week. [ELSE] {expiring.length} contracts expire this week. [END] |
| `engine/core/turn.ts#homePhase.1` | {member full name} is over the fever |
| `engine/core/turn.ts#homePhase.2` | [IF hidden.length] Revealed: {(all ? hidden : hidden.slice(0, 1)).map((h) => h.trueTag).join(', ')}. [ELSE] Nothing new was learned. [END] |
| `engine/core/turn.ts#economyPhase.1` | Hall & buildings upkeep |
| `engine/core/turn.ts#economyPhase.2` | [IF hungry is 1] 1 member went hungry this week. Morale suffers. [ELSE] {hungry} members went hungry this week. Morale suffers. [END] |
| `engine/core/turn.ts#economyPhase.3` | The coin at home fell short, so the guild sold its goods for {got} crowns to make the payment. |
| `engine/core/turn.ts#economyPhase.4` | The payment of {due} crowns is due, and a squad is still away. The Weighhouse agrees to wait a week for them, and writes to say so. It wants paying in week {loan.dueWeek}, and [IF loan.waited is 3] it will not wait again [ELSE] it will wait at most three weeks in all [END]. |
| `engine/core/turn.ts#economyPhase.5` | Paid {due} crowns to the Weighhouse. {Math.ceil(loan.principal)} still owed. The next payment is due in week {nextDue}. |
| `engine/core/turn.ts#economyPhase.6` | Missed loan payment! |
| `engine/core/turn.ts#economyPhase.7` | You could not pay the {due} crowns due. A 20-crown penalty was added, and the Weighhouse is displeased. |
| `engine/core/turn.ts#economyPhase.8` | Missed payments: {loan.missed} of 3. At 3, your assets will be seized. The next payment is due in week {nextDue}. |
| `engine/core/turn.ts#economyPhase.9` | Your coffers are empty and wages went unpaid. Loyalty is falling. Weeks in the red: {insolventWeeks} of 4. |
| `engine/core/turn.ts#memberPhase.1` | They left in the night. |
| `engine/core/turn.ts#politicsPhase.1` | The Exchequer is preparing to revoke your charter. Weeks remaining: {6 - charterWeeks}. Raise Exchequer standing above −60 and keep Heat below 100. |
| `engine/core/turn.ts#checkGameOver.1` | The Weighhouse bailiffs arrive at dawn with a writ. The hall, the armory and the sign over the door are seized. Ledger & Blade is finished. |
| `engine/core/turn.ts#checkGameOver.2` | A herald nails the Exchequer's writ to your door: your charter is revoked. Without it, every contract is a crime. The guild disbands. |
| `engine/core/turn.ts#checkGameOver.3` | No one is left to answer the door. The guild is a name on an old ledger. |

### economy/board.ts

| ID | Line |
|---|---|
| `engine/economy/board.ts#expeditionFor.1` | [IF threat <= 3] short [ELSE IF threat <= 6] medium [ELSE] long [END] |
| `engine/economy/board.ts#refreshBoard.1` | "{c.title}" was left undone |

### economy/buildings.ts

| ID | Line |
|---|---|
| `engine/economy/buildings.ts#startBuild.1` | Level {level(s, id)}{1} will take about {next.weeks} weeks. Members assigned to Build speed it up. |
| `engine/economy/buildings.ts#weeklyWorkshop.1` | {FACILITIES[c.id].name} level {c.toLevel} is finished |
| `engine/economy/buildings.ts#weeklyWorkshop.2` | Upkeep +{lv.upkeep} crowns a week. |
| `engine/economy/buildings.ts#weeklyWorkshop.3` | {remaining.length} more still waiting. |

### missions/missions.ts

| ID | Line |
|---|---|
| `engine/missions/missions.ts#levelUp.1` | {attr[0].toUpperCase()}{attr.slice(1)} +1. Wage is now {m.wage}/week. |

### missions/narrative.ts

| ID | Line |
|---|---|
| `engine/missions/narrative.ts#ENEMY_SETUP.beasts.1` | There were more wolves than the drovers had said, and they had stopped being afraid of people some time ago. |
| `engine/missions/narrative.ts#ENEMY_SETUP.beasts.2` | The tracks were everywhere, and the smell reached them a good while before the animals did. |
| `engine/missions/narrative.ts#ENEMY_SETUP.beasts.3` | Something big kept pace with them in the dark, and it was in no hurry. |
| `engine/missions/narrative.ts#ENEMY_SETUP.armored.1` | The men waiting for them wore good mail, better than anyone in Varrow can afford these days. |
| `engine/missions/narrative.ts#ENEMY_SETUP.armored.2` | There was steel behind the barricade, and a lot of it. |
| `engine/missions/narrative.ts#ENEMY_SETUP.swarm.1` | The walls were covered in carrion-beetles, and the noise they made was worse than the sight of them. |
| `engine/missions/narrative.ts#ENEMY_SETUP.swarm.2` | Rats came out of the drains faster than anyone could count them. |
| `engine/missions/narrative.ts#ENEMY_SETUP.thugs.1` | The opposition turned out to be hired knives in patched coats, who looked more bored than dangerous. |
| `engine/missions/narrative.ts#ENEMY_SETUP.thugs.2` | Somebody had hired a dozen dockside bruisers by the day, and hadn't paid them enough to care. |
| `engine/missions/narrative.ts#ENEMY_SETUP.thugs.3` | Somebody had hired a dozen bruisers off the road by the day, and hadn't paid them enough to care. |
| `engine/missions/narrative.ts#ENEMY_SETUP.soldiers.1` | The sell-swords waiting for them wore matching colors and kept proper intervals, which was a bad sign. |
| `engine/missions/narrative.ts#ENEMY_SETUP.soldiers.2` | There were crossbowmen on the ridge, and they knew how to use them. |
| `engine/missions/narrative.ts#ENEMY_SETUP.soldiers.3` | There were crossbowmen at the upstairs windows, and they knew how to use them. |
| `engine/missions/narrative.ts#ENEMY_SETUP.guards.1` | The sentries walked their rounds in pairs and actually looked around while they did it. |
| `engine/missions/narrative.ts#ENEMY_SETUP.guards.2` | The guards were awake and sober, which nobody had planned for. |
| `engine/missions/narrative.ts#ENEMY_SETUP.warded.1` | Every door had pale marks scratched into it. Somebody had paid a hedge-wizard well. |
| `engine/missions/narrative.ts#ENEMY_SETUP.warded.2` | The air near the doors tasted of copper. The wards were fresh. |
| `engine/missions/narrative.ts#ENEMY_SETUP.trolls.1` | The troll stood up from under the bridge, and kept standing up for longer than seemed reasonable. |
| `engine/missions/narrative.ts#ENEMY_SETUP.trolls.2` | It was twice the height of a man, and the scars from the last guild that tried had already healed over. |
| `engine/missions/narrative.ts#ENEMY_SETUP.fireborn.1` | The heat hit them before they saw anything, and then they saw the salamanders. |
| `engine/missions/narrative.ts#ENEMY_SETUP.fireborn.2` | Drakelings had nested in the old galleries, and the rock around them was warm to the touch. |
| `engine/missions/narrative.ts#ENEMY_SETUP.crowd.1` | The crowd pressed in close. Most of them were hungry and some of them had stones. |
| `engine/missions/narrative.ts#ENEMY_SETUP.crowd.2` | There were hundreds of people in the street, and all of them were watching your squad. |
| `engine/missions/narrative.ts#ENV_SETUP.cold.1` | It was cold enough that the buckles froze, and everyone could see their breath. |
| `engine/missions/narrative.ts#ENV_SETUP.cold.2` | The wind came off the hills and went straight through wool. |
| `engine/missions/narrative.ts#ENV_SETUP.swamp.1` | The water was black and knee-deep, and the mud tried to keep their boots. |
| `engine/missions/narrative.ts#ENV_SETUP.swamp.2` | There was a fever-mist over the fens that never quite lifted. |
| `engine/missions/narrative.ts#ENV_SETUP.dark.1` | Past the lanterns there was nothing to see at all. |
| `engine/missions/narrative.ts#ENV_SETUP.dark.2` | They went down into the dark, counting the steps so they could find their way back. |
| `engine/missions/narrative.ts#ENV_SETUP.night.1` | There was no moon, which helped and hurt in about equal measure. |
| `engine/missions/narrative.ts#ENV_SETUP.night.2` | They went after midnight, when anyone sensible was asleep. |
| `engine/missions/narrative.ts#ENV_SETUP.urban.1` | Varrow's back alleys are narrow and crooked, and every one of them has windows. |
| `engine/missions/narrative.ts#ENV_SETUP.urban.2` | The streets were full of washing lines and people with nothing better to do than watch. |
| `engine/missions/narrative.ts#ENV_SETUP.rough.1` | The path was loose scree with a long drop on one side. |
| `engine/missions/narrative.ts#ENV_SETUP.rough.2` | The road on the map turned out to be more of a suggestion. |
| `engine/missions/narrative.ts#ENV_SETUP.open_road.1` | It was open country, with nowhere to hide for a mile in any direction. |
| `engine/missions/narrative.ts#ENV_SETUP.open_road.2` | The road ran straight across bare ground under a wide sky. |
| `engine/missions/narrative.ts#ENV_SETUP.plague.1` | There were chalk crosses on half the doors, and the village was quiet. |
| `engine/missions/narrative.ts#ENV_SETUP.plague.2` | People were coughing behind their shutters as the squad went by. |
| `engine/missions/narrative.ts#ACTION.assault.1` | {lead} went in first{weapon}, with {ally} right behind. |
| `engine/missions/narrative.ts#ACTION.assault.2` | {lead} hit them before they were ready{weapon}, and the others followed. |
| `engine/missions/narrative.ts#ACTION.assault.3` | It was short and ugly. {lead} broke the first rush{weapon}, and there wasn't a second. |
| `engine/missions/narrative.ts#ACTION.assault.4` | {lead} went in hard{weapon}, but the others couldn't keep the line. |
| `engine/missions/narrative.ts#ACTION.assault.5` | It went badly. {ally} was pulled down and had to be dragged back by the collar. |
| `engine/missions/narrative.ts#ACTION.assault.6` | They won ground and lost it again, and it cost them each time. |
| `engine/missions/narrative.ts#ACTION.stealth.1` | {lead} found a way through, along a drainage cut and round a blind corner, and brought the others after one at a time. |
| `engine/missions/narrative.ts#ACTION.stealth.2` | {lead} counted the patrols and timed it, and they got through without anyone looking up. |
| `engine/missions/narrative.ts#ACTION.stealth.3` | {clumsy}'s {armor} scraped the wall, and in that quiet it was very loud. |
| `engine/missions/narrative.ts#ACTION.stealth.4` | {lead} misjudged the ground, and somebody heard them. |
| `engine/missions/narrative.ts#ACTION.stealth.5` | {clumsy} stepped on something that crunched, and every head turned. |
| `engine/missions/narrative.ts#ACTION.guile.1` | {lead} did the talking, with enough borrowed authority that nobody thought to ask for papers. |
| `engine/missions/narrative.ts#ACTION.guile.2` | {lead} told a lie good enough that the man repeated it to his own sergeant. |
| `engine/missions/narrative.ts#ACTION.guile.3` | {lead} worked out who could be paid, and how much. |
| `engine/missions/narrative.ts#ACTION.guile.4` | {lead}'s story had a hole in it, and somebody found it. |
| `engine/missions/narrative.ts#ACTION.guile.5` | They took the bribe and then did nothing they'd been paid for. |
| `engine/missions/narrative.ts#ACTION.guile.6` | {lead} talked for too long, and the man started asking questions back. |
| `engine/missions/narrative.ts#ACTION.endurance.1` | They kept a hard pace, and {lead} made sure nobody fell behind. |
| `engine/missions/narrative.ts#ACTION.endurance.2` | {lead} kept them walking at the point where the others wanted to stop. |
| `engine/missions/narrative.ts#ACTION.endurance.3` | {weakest} fell behind, and the rest had to wait. |
| `engine/missions/narrative.ts#ACTION.endurance.4` | By the time they arrived they had blisters, cramp and very short tempers. |
| `engine/missions/narrative.ts#ACTION.arcana.1` | {lead} drew a sign in the air{element}, and the problem went away. |
| `engine/missions/narrative.ts#ACTION.arcana.2` | {lead}'s spellwork{element} did what the blades couldn't. |
| `engine/missions/narrative.ts#ACTION.arcana.3` | {lead}'s spell fizzled out halfway. |
| `engine/missions/narrative.ts#ACTION.arcana.4` | Either the reagents were bad or the wards were better. The working failed. |
| `engine/missions/narrative.ts#STRONG.1` |  It was about as clean as these things get. |
| `engine/missions/narrative.ts#STRONG.2` |  The others talked about it for days afterwards. |
| `engine/missions/narrative.ts#STRONG.3` |  Nobody could have done it much better. |
| `engine/missions/narrative.ts#SEVERE.1` |  After that, everything went wrong at once. |
| `engine/missions/narrative.ts#SEVERE.2` |  It turned into a disaster. |
| `engine/missions/narrative.ts#SEVERE.3` |  Nobody wanted to talk about it afterwards. |
| `engine/missions/narrative.ts#ADVICE.beasts.1` | arrows, spears and fire serve best against beasts |
| `engine/missions/narrative.ts#vars.weapon.1` | [IF wpn] [IF el]  with [DEPENDS ON el] fire: fire [OR] frost: frost [OR] storm: lightning [OR] radiant: radiance [OR] shadow: shadow [END]-touched {wpn.name.toLowerCase()} [ELSE]  with their {wpn.name.toLowerCase()} [END] [ELSE]  bare-handed [END] |
| `engine/missions/narrative.ts#vars.element.1` | [IF el]  of [DEPENDS ON el] fire: fire [OR] frost: frost [OR] storm: lightning [OR] radiant: radiance [OR] shadow: shadow [END] [END] |
| `engine/missions/narrative.ts#phaseStory.1` | {first(best.m)}'s [IF best.e] [DEPENDS ON best.e] fire: fire [OR] frost: frost [OR] storm: lightning [OR] radiant: radiance [OR] shadow: shadow [END]-keyed  [END]{best.w.name.toLowerCase()} was exactly the right tool against the {TAGS[tag].name.toLowerCase()}. |
| `engine/missions/narrative.ts#phaseStory.2` | {first(worst.m)}'s {worst.w.name.toLowerCase()} did little against the {TAGS[tag].name.toLowerCase()}. Next time, [DEPENDS ON tag] armored: a hammer or a storm-keyed weapon would crack that mail [OR] swarm: fire and blunt force work far better than points on a swarm [OR] fireborn: frost salts would have made short work of them [OR] trolls: only fire stops a troll healing [OR] warded: a wardstone or storm-keyed weapon would cut through those wards [OR] beasts: arrows, spears and fire serve best against beasts [END]. |
| `engine/missions/narrative.ts#phaseStory.3` | The [DEPENDS ON el] fire: fire [OR] frost: frost [OR] storm: lightning [OR] radiant: radiance [OR] shadow: shadow [END] did real damage to the {TAGS[enemies[0]].name.toLowerCase()}. |
| `engine/missions/narrative.ts#phaseStory.4` | The [DEPENDS ON el] fire: fire [OR] frost: frost [OR] storm: lightning [OR] radiant: radiance [OR] shadow: shadow [END] barely bothered them. Next time, [DEPENDS ON enemies[0]] armored: a hammer or a storm-keyed weapon would crack that mail [OR] swarm: fire and blunt force work far better than points on a swarm [OR] fireborn: frost salts would have made short work of them [OR] trolls: only fire stops a troll healing [OR] warded: a wardstone or storm-keyed weapon would cut through those wards [OR] beasts: arrows, spears and fire serve best against beasts [END]. |
| `engine/missions/narrative.ts#phaseStory.5` | {first(carrier)} had packed [IF item.name.toLowerCase().startsWith('fen')]  [ELSE] a  [END]{item.name.toLowerCase()}, and it turned out to matter. |
| `engine/missions/narrative.ts#phaseStory.6` | Having a {def.counterProfession} along meant the {def.name.toLowerCase()} never got a grip on them. |
| `engine/missions/narrative.ts#phaseStory.7` | Nobody had thought to pack {fix.toLowerCase()}s, and the {def.name.toLowerCase()} wore them down. |
| `engine/missions/narrative.ts#ROAD.1` | {a} and {b} argued over the map until {c} found the drovers' track. |
| `engine/missions/narrative.ts#ROAD.2` | It rained for two days, and {a} kept the fire going with wet wood out of pure stubbornness. |
| `engine/missions/narrative.ts#ROAD.3` | They passed a burned-out toll-house with Ostrander's mark still painted on the door. |
| `engine/missions/narrative.ts#ROAD.4` | {a} shot a hare, {b} burned it, and everyone ate it anyway. |
| `engine/missions/narrative.ts#ROAD.5` | A farmer sold them eggs and then told them about the war for an hour. |
| `engine/missions/narrative.ts#ROAD.6` | {a} sang marching songs until {b} threatened to throw them in a ditch. |
| `engine/missions/narrative.ts#ROAD.7` | A Crown courier galloped past without stopping, and {a} spent the next mile guessing what the news was. |
| `engine/missions/narrative.ts#ROAD.8` | They slept one night in a barn that had seen better years. |
| `engine/missions/narrative.ts#TRAIT_ROAD.drunkard.1` | {x} found a wayside inn and had to be fetched out of it. |
| `engine/missions/narrative.ts#TRAIT_ROAD.bookish.1` | {x} read by firelight and corrected everyone's pronunciation of Harrowmere. |
| `engine/missions/narrative.ts#TRAIT_ROAD.hotheaded.1` | {x} got into an argument with a carter about who had right of way. |
| `engine/missions/narrative.ts#TRAIT_ROAD.veteran.1` | {x} went quiet when they passed the old battlefield, and nobody pushed. |
| `engine/missions/narrative.ts#TRAIT_ROAD.greedy.1` | {x} spent an evening working out what their share would come to. |
| `engine/missions/narrative.ts#TRAIT_ROAD.brave.1` | {x} took the night watch that nobody wanted. |
| `engine/missions/narrative.ts#TRAIT_ROAD.frail.1` | {x} had a cough by the second day. |
| `engine/missions/narrative.ts#SEASON_ROAD.Winter.1` | There was snow on the high road, and they walked in each other's footprints. |
| `engine/missions/narrative.ts#SEASON_ROAD.Summer.1` | It was dusty and full of flies, and the evenings stayed light until late. |
| `engine/missions/narrative.ts#SEASON_ROAD.Autumn.1` | The leaves were wet, the mornings were cold, and every village smelled of woodsmoke. |
| `engine/missions/narrative.ts#SEASON_ROAD.Spring.1` | The mud came up to their ankles, and the hedges were just starting to turn green. |
| `engine/missions/narrative.ts#outboundJournal.1` | {squad.map(first).join(', ').replace(/, ([^,]*)$/, ' and $1')} left the hall at dusk and walked across the city to the job. |
| `engine/missions/narrative.ts#homewardJournal.1` | [IF c.travelWeeks > 0] They buried {dead.map(first).join(' and ')} by the road and marked the place. [ELSE] They carried {dead.map(first).join(' and ')} home wrapped in a cloak. [END] |
| `engine/missions/narrative.ts#homewardJournal.2` | [IF tier is 'Triumph'] They came home loud, with heavy purses and a story they would tell for weeks. [ELSE IF tier is 'Success'] They came home tired, and paid. [ELSE IF tier is 'Costly Success'] The job was done, but nobody felt like celebrating. [ELSE IF tier is 'Failure'] Nobody said much on the way home. [ELSE] It was a long walk home, and a quiet one. [END] |
| `engine/missions/narrative.ts#homewardJournal.3` | [IF c.travelWeeks > 0] The road home [ELSE] Home [END] |

### missions/odds.ts

| ID | Line |
|---|---|
| `engine/missions/odds.ts#squadScore.1` | Best talker + 15% of the rest |
| `engine/missions/odds.ts#squadScore.2` | Best spellworker + half of the second best |
| `engine/missions/odds.ts#previewMission.1` | [IF riskValue < 10] Low [ELSE IF riskValue < 20] Moderate [ELSE IF riskValue < 32] High [ELSE] Deadly [END] |

### people/legends.ts

| ID | Line |
|---|---|
| `engine/people/legends.ts#epithetOptions.1` | [IF lucky] Lucky {first} [ELSE IF ap is 'arcana'] {first} Sparks [ELSE] [DEPENDS ON ap] assault: Hard [OR] stealth: Quiet [OR] guile: Honest [OR] endurance: Steady [OR] arcana: Sparks [END] {first} [END] |
| `engine/people/legends.ts#epithetOptions.2` | [IF place] {first} of {place.replace(/^The /, 'the ')} [ELSE] {first} of Tallow Street [END] |
| `engine/people/legends.ts#earnFame.1` | how {first} [DEPENDS ON bestLead.approach] assault: fought their way through [OR] stealth: got everyone past unseen [OR] guile: talked their way through [OR] endurance: kept everyone walking [OR] arcana: worked the spell that carried [END] on "{c.title}" |
| `engine/people/legends.ts#earnFame.2` | how {first} saw "{c.title}" through |
| `engine/people/legends.ts#reachTier.1` | {member full name} is getting known |
| `engine/people/legends.ts#reachTier.2` | People in the taverns have started asking for {first} by name. Renown +1. |
| `engine/people/legends.ts#reachTier.3` | Half of Varrow has heard of {first}, and the other half has heard a version of it. Renown +2. |
| `engine/people/legends.ts#reachTier.4` | Fame has a price: {first}'s wage rises by 2 a week. Rival guilds will start making offers. |
| `engine/people/legends.ts#reachTier.5` | {member full name} has become a legend |
| `engine/people/legends.ts#reachTier.6` | Children in the Lower Town play at being {first}. Renown +4, and {first}'s wage rises by 3 a week. |
| `engine/people/legends.ts#reachTier.7` | The street is deciding what to call them. |
| `engine/people/legends.ts#mournLegend.1` | [IF legend] {first} is dead. The Copper Kettle has hung black crepe over the door, and strangers stop your people in the street to say they are sorry. Everyone: morale −15. [ELSE] {first} is dead, and people you have never met are asking how it happened. Everyone: morale −8. [END] |
| `engine/people/legends.ts#legendTalk.1` | In the Copper Kettle they are still telling the story of {feat.text}. |
| `engine/people/legends.ts#legendTalk.2` | A ballad-seller on the river steps has a new song about {who}. It gets the facts wrong, but it sells. |
| `engine/people/legends.ts#legendTalk.3` | Somebody asked a porter on Fish Quay whether {who} is real. The porter said yes, and told them {feat.text}. |

### politics/council.ts

| ID | Line |
|---|---|
| `engine/politics/council.ts#canLobby.1` | Declare the guild’s position first |
| `engine/politics/council.ts#canLobby.2` | {FACTIONS[f].short} has already been lobbied this week |
| `engine/politics/council.ts#setPosition.1` | Stances are locked in the week of the vote. |
| `engine/politics/council.ts#announce.1` | The Council of Varrow will vote at the end of week {VOTE_WEEK} of the season, in {VOTE_WEEK - ANNOUNCE_WEEK}{1} weeks. |
| `engine/politics/council.ts#announce.2` | Declare your position and work on the factions from the Realm screen. |
| `engine/politics/council.ts#rivalLobbying.1` | Hobb & Daughters work the Council |
| `engine/politics/council.ts#rivalLobbying.2` | Marta Hobb was seen dining with {factionName(f)}. They now lean [IF item.positions[f] > 0] toward [ELSE IF item.positions[f] < 0] against [ELSE] to neither side of [END] {DECREE_BY_ID[item.id].title}. |
| `engine/politics/council.ts#resolve.1` | {d.title}: [IF t.passes] PASSED [ELSE] FAILED [END] ({t.votesFor} for, {t.votesAgainst} against). |
| `engine/politics/council.ts#resolve.2` |   You [IF won] won [ELSE] lost [END] this one[IF won]  (Influence +1, Renown +1) [END]. Factions on your side remember it, and so do the ones you beat. |

### politics/factions.ts

| ID | Line |
|---|---|
| `engine/politics/factions.ts#factionPerks.1` | One of the old families mentioned your guild favorably at court. Influence +1. |
| `engine/politics/factions.ts#factionPerks.2` | The back door of the stores was found open this morning, and {lost} supplies have gone. Nobody on the river saw a thing. |

### rivals/rival.ts

| ID | Line |
|---|---|
| `engine/rivals/rival.ts#describePlan.1` | {name} [IF id is 'hobbs'] have [ELSE] has [END] nothing special planned this week. |
| `engine/rivals/rival.ts#describePlan.2` | [IF c] They intend to take the contract "{c.title}" at the end of this week. [ELSE] They had a contract in mind, but it is gone. [END] |
| `engine/rivals/rival.ts#describePlan.3` | [IF id is 'ninth'] Captain Mayne has been buying {m.name ?? 'one of your people'} drinks and talking about the old regiment. [ELSE] They are courting {m.name ?? 'one of your people'} with a better offer. [END] |
| `engine/rivals/rival.ts#describePlan.4` | Plaice has your stillroom on his list for this week. The fine would be about {inspectionFine(state)} crowns. |
| `engine/rivals/rival.ts#describePlan.5` | They are spreading stories about your guild in the taverns and counting-houses. |
| `engine/rivals/rival.ts#executeOne.1` | The contract is no longer available. |
| `engine/rivals/rival.ts#executeOne.2` | [IF id is 'ninth'] Mayne offered steady pay and a regiment to belong to. Their gear stays in your armory. [ELSE] They took a better offer. Their gear stays in your armory. [END] |
| `engine/rivals/rival.ts#executeOne.3` | They turned the offer down. |
| `engine/rivals/rival.ts#executeOne.4` | {name} are telling everyone your guild is a bad risk. Renown −2. |
| `engine/rivals/rival.ts#executeOne.5` | Two assayers spent the morning reading your labels and found several of them wanting. Fined {fine} crowns. Heat +2. |
| `engine/rivals/rival.ts#executeOne.6` | Their plan for the week came to nothing. |
| `engine/rivals/rival.ts#executeOne.7` | You let it sit too long. |

### rivals/war.ts

| ID | Line |
|---|---|
| `engine/rivals/war.ts#raiseFeud.1` | [IF after > before] {name}: {STAGES[after].toLowerCase()} [ELSE] {name}: things have cooled [END] |
| `engine/rivals/war.ts#raiseFeud.2` | [IF after is 2] It is open war with {name}. Expect raids, fire and knives, and expect the Exchequer to blame you for all of it. [ELSE IF after is 1 and before is 2] {name} have stopped sending knives. It is still a feud, though, and they will keep going after your jobs and your stores. [ELSE IF after is 1] What was business with {name} has become personal. They will start going after your jobs, your stores and your people. [ELSE] {name} have stopped treating you as an enemy, for now. [END] |
| `engine/rivals/war.ts#SHIPMENT.hobbs.1` | Hobb & Daughters' collection cart |
| `engine/rivals/war.ts#SHIPMENT.ninth.1` | the Ninth's pay chest |
| `engine/rivals/war.ts#SHIPMENT.assay.1` | the Assay Office's reagent wagon |
| `engine/rivals/war.ts#needStage.1` | [IF stage < n] Only once things with {name} reach {STAGES[n].toLowerCase()}. [ELSE IF truce] You agreed a truce with {name} until week {r.truceUntil}. [END] |
| `engine/rivals/war.ts#operationOptions.1` | Guile check. Success: their plans are known every week and the spy sends 1 Intel a week. Failure: Heat +3. Feud +5 either way. |
| `engine/rivals/war.ts#operationOptions.2` | [IF r.ourSpy] You already have someone inside. [ELSE IF truce] You agreed a truce with {name} until week {r.truceUntil}. [END] |
| `engine/rivals/war.ts#operationOptions.3` | Their renown −4. Feud +8. |
| `engine/rivals/war.ts#operationOptions.4` | [IF truce] You agreed a truce with {name} until week {r.truceUntil}. [END] |
| `engine/rivals/war.ts#operationOptions.5` | A seasoned member joins you at a high wage, with loyalty to earn. Their strength −1. Feud +10. |
| `engine/rivals/war.ts#operationOptions.6` | [IF living(state).length >= rosterCap(state)] Your hall is full. [END] |
| `engine/rivals/war.ts#operationOptions.7` | Adds an operation to your contract board: get there first and take the pay. Feud +15, Heat +5 on success. |
| `engine/rivals/war.ts#operationOptions.8` | [IF opOnBoard(state, id, 'intercept')] You already have one planned. [END] |
| `engine/rivals/war.ts#operationOptions.9` | Raid [DEPENDS ON id] hobbs: Hobb & Daughters' collection cart [OR] ninth: the Ninth's pay chest [OR] assay: the Assay Office's reagent wagon [END] |
| `engine/rivals/war.ts#operationOptions.10` | Adds an operation to your contract board. Rich pickings, Heat +10, Feud +20. |
| `engine/rivals/war.ts#operationOptions.11` | [IF opOnBoard(state, id, 'raid')] You already have one planned. [END] |
| `engine/rivals/war.ts#operationOptions.12` | [IF leader] Have {NPCS[leader].name} killed [ELSE] Nobody left to kill [END] |
| `engine/rivals/war.ts#operationOptions.13` | Adds a dangerous operation to your contract board. Success changes the rival for good. Heat +25, Exchequer −15. |
| `engine/rivals/war.ts#operationOptions.14` | [IF not leader] Their leaders are already dead. [ELSE] {needStage(2) ?? (opOnBoard(state, id, 'kill') ? 'You already have o…} [END] |
| `engine/rivals/war.ts#operationOptions.15` | Guile check. Success: Feud −30 and no hostile moves by either side for 8 weeks. Failure: Feud +5. |
| `engine/rivals/war.ts#operationOptions.16` | [IF stage < 1] There is nothing to make peace about yet. [ELSE IF truce] You already have a truce. [END] |
| `engine/rivals/war.ts#operationOptions.17` | Feud −25. It works, and everyone hears that it works. |
| `engine/rivals/war.ts#operationOptions.18` | [IF stage < 1] There is nothing to pay for yet. [END] |
| `engine/rivals/war.ts#operationOptions.19` | [IF others.length] Make a pact against {RIVALS[others[0]].name} [ELSE] Make a pact [END] |
| `engine/rivals/war.ts#operationOptions.20` | [IF others.length] A 16-week truce with {name}, and they share what they know about {RIVALS[others[0]].name}: that rival's plans are known every week. [ELSE] Needs another rival you are feuding with. [END] |
| `engine/rivals/war.ts#operationOptions.21` | [IF not others.length] You need another rival you are feuding with. [ELSE IF stage >= 1] You are feuding with {name} yourself. [ELSE IF truce] You already have an arrangement. [END] |
| `engine/rivals/war.ts#runOperation.1` | {c.who ?? 'Your agent'} found someone on the inside who can be paid. Their plans will reach you every week. |
| `engine/rivals/war.ts#runOperation.2` | The clerk you approached went straight to {name}. Heat +3. |
| `engine/rivals/war.ts#runOperation.3` | Your people spend a week buying drinks and telling stories. Their renown −4. |
| `engine/rivals/war.ts#runOperation.4` | {member full name} leaves {name} for you |
| `engine/rivals/war.ts#runOperation.5` | They are good, they know it, and they will want to be paid like it. Loyalty has to be earned. |
| `engine/rivals/war.ts#runOperation.6` | It is on your contract board. Choose the squad carefully. |
| `engine/rivals/war.ts#runOperation.7` | {c.who ?? 'Your envoy'} and their people shook hands in the back of the Copper Kettle. Neither side moves against the other until week {r.truceUntil}. |
| `engine/rivals/war.ts#runOperation.8` | {name} refuse a truce |
| `engine/rivals/war.ts#runOperation.9` | They listened, laughed, and sent your envoy home. |
| `engine/rivals/war.ts#runOperation.10` | The money changes hands in a back room. The pressure eases, and half the city hears the price. |
| `engine/rivals/war.ts#runOperation.11` | For the next sixteen weeks, {name} leave you alone and tell you what {RIVALS[other].name} are planning. |
| `engine/rivals/war.ts#operationContract.1` | Beat {name} to a job |
| `engine/rivals/war.ts#operationContract.2` | {name} have a collection lined up on the Drover's Road. Get there first, do the job yourselves, and send them home empty-handed. |
| `engine/rivals/war.ts#operationContract.3` | Raid [DEPENDS ON id] hobbs: Hobb & Daughters' collection cart [OR] ninth: the Ninth's pay chest [OR] assay: the Assay Office's reagent wagon [END] |
| `engine/rivals/war.ts#operationContract.4` | {SHIPMENT[id][0].toUpperCase()}{SHIPMENT[id].slice(1)} moves through the city this month. Take it. |
| `engine/rivals/war.ts#operationContract.5` | {who} has to die, somewhere quiet, in a way nobody can prove. If it goes wrong, everyone will know who sent you. |
| `engine/rivals/war.ts#resolveOperation.1` | {name} lost the job, and renown with it. Heat +5 |
| `engine/rivals/war.ts#resolveOperation.2` | {name} know who tried. Heat +3 |
| `engine/rivals/war.ts#resolveOperation.3` | {name} are poorer and angrier. Heat +10 |
| `engine/rivals/war.ts#resolveOperation.4` | The raid failed, and {name} know exactly who to blame. Heat +6 |
| `engine/rivals/war.ts#resolveOperation.5` | {NPCS[op.target].name} is dead. Heat +25, Exchequer −15. |
| `engine/rivals/war.ts#resolveOperation.6` | By the time the squad got there, {NPCS[op.target].name} was already beyond their reach. |
| `engine/rivals/war.ts#resolveOperation.7` | The attempt failed. {op.target ? NPCS[op.target].name : name} survived, and will not forget. Heat +10 |
| `engine/rivals/war.ts#afterLeaderDies.1` | Marta Hobb was buried at Saint Oda's with her umbrella. Isbet stood at the graveside and looked at your people the whole time. The firm is hers now, and she has no interest in being friends. |
| `engine/rivals/war.ts#afterLeaderDies.2` | Marta does not send a cake this time. Her other daughters have been seen buying crossbows. |
| `engine/rivals/war.ts#afterLeaderDies.3` | Hobb & Daughters closes its doors |
| `engine/rivals/war.ts#afterLeaderDies.4` | With Marta and Isbet both dead, the younger daughters sell the firm's debts to the bank and leave for the coast. Nobody collects for the Hobbs any more. |
| `engine/rivals/war.ts#afterLeaderDies.5` | Without Mayne the company falls apart within a week. The veterans in your guild are quiet at supper, and some of them look at you differently. |
| `engine/rivals/war.ts#afterLeaderDies.6` | Master Assayer Plaice was found in the river. The Exchequer has opened an inquiry, and the Office will take a season to appoint his successor. Exchequer −10. |
| `engine/rivals/war.ts#describeHostile.1` | They are trying to get someone inside your guild. |
| `engine/rivals/war.ts#describeHostile.2` | They mean to ambush your squad on the road home from "{ms.contract.title ?? 'their job'}". |
| `engine/rivals/war.ts#describeHostile.3` | They are planning to rob your stores. |
| `engine/rivals/war.ts#describeHostile.4` | They have been talking to {m.name ?? 'one of your people'} about money. |
| `engine/rivals/war.ts#describeHostile.5` | They are planning to set fire to your workshops. |
| `engine/rivals/war.ts#describeHostile.6` | They have hired a knife for {m.name ?? 'one of your people'}. |
| `engine/rivals/war.ts#executeHostile.1` | {name} are waiting for your squad |
| `engine/rivals/war.ts#executeHostile.2` | Word is that {name}'s people are watching the road home from {ms.contract.region}. Squad {ms.number} will have to get past them. |
| `engine/rivals/war.ts#executeHostile.3` | Your guards caught {name}'s people at the back door of the stores and sent them off with bruises. |
| `engine/rivals/war.ts#executeHostile.4` | Somebody got into the stores in the night and took {supplies} supplies and {crowns} crowns from the strongbox. Jory found {name}'s mark chalked on the door. |
| `engine/rivals/war.ts#executeHostile.5` | {member full name} sold you out |
| `engine/rivals/war.ts#executeHostile.6` | {member full name} took {name}'s money and left in the night[IF spare] , with something from the armory [END]. |
| `engine/rivals/war.ts#executeHostile.7` | Your guards caught a man with a lamp and a jar of oil by the workshop door. He works for {name}, and he says so quite quickly. |
| `engine/rivals/war.ts#executeHostile.8` | The workshops burned for an hour before the bucket line got it out. Half your materials are gone, the work in progress is lost, and the repairs cost 50 crowns. Nobody doubts who set it. |
| `engine/rivals/war.ts#executeHostile.9` | Someone came for {member full name} in the night. [IF g] {g.name} was on watch and fought them off, and took a cut doing it. [ELSE] The hall was ready for them, and they ran. [END] |
| `engine/rivals/war.ts#executeHostile.10` | {member full name} was found in the alley behind the Copper Kettle. Everyone knows who paid for it. |
| `engine/rivals/war.ts#executeHostile.11` | {member full name} was stabbed on the way home and barely made it back to the hall. |
| `engine/rivals/war.ts#weeklyWar.1` | The Assay Office has a new head, appointed by the Exchequer. She has read the file on Plaice, and she has read the file on you. |
| `engine/rivals/war.ts#weeklyWar.2` | A spy for {RIVALS[id].name} caught |
| `engine/rivals/war.ts#weeklyWar.3` | A new cook had been reading your ledgers when nobody was looking. Your people put him on a barge downriver. |
| `engine/rivals/war.ts#weeklyWar.4` | Your spy in {RIVALS[id].name} was found out |
| `engine/rivals/war.ts#weeklyWar.5` | They will not be sending any more reports. |
| `engine/rivals/war.ts#sweepForSpies.1` | [IF found.length] You found [IF found.length is 1] a spy [ELSE] spies [END] working for {found.map((id) => RIVALS[id].name).join(' and ')}, and sent them packing. [ELSE] Your people turned the hall upside down and found nobody. That may mean nobody is there. [END] |

### story/codex.ts

| ID | Line |
|---|---|
| `engine/story/codex.ts#discoverLore.1` | Open the Journal to read it. |

### story/dates.ts

| ID | Line |
|---|---|
| `engine/story/dates.ts#datesPhase.1` | {d.who} will not be coming after all. |
| `engine/story/dates.ts#dateWarning.1` | {d.title} arrives at the end of this week, and [IF short is 1] one target is [ELSE] {short} targets are [END] not met yet. |
| `engine/story/dates.ts#dateTargets.1` | Pay the Weighhouse {loan.paymentDue} crowns on the day |
| `engine/story/dates.ts#dateTargets.2` | {crowns} in the treasury |
| `engine/story/dates.ts#dateTargets.3` | Have {t.at} crowns when the week closes, after the bills |
| `engine/story/dates.ts#dateTargets.4` | Keep {t.at} supplies in store |
| `engine/story/dates.ts#dateTargets.5` | Bring [IF t.count is 1] a successful contract [ELSE] {t.count} successful contracts [END] home |
| `engine/story/dates.ts#dateTargets.6` | Muster {t.count} members, {t.seniors} of them at level 3 or higher |
| `engine/story/dates.ts#dateTargets.7` | {crew.length} members, {seniors} at level 3+ |
| `engine/story/dates.ts#dateTargets.8` | Pay the Weighhouse {t.amount} crowns, due payments included |
| `engine/story/dates.ts#dateTargets.9` | [IF backed] [IF met] Your side is winning a vote [ELSE] Your side is losing every vote [END] [ELSE] No stance taken yet [END] |
| `engine/story/dates.ts#stakesLines.1` | {sign(st.morale)} morale for everyone at home |
| `engine/story/dates.ts#stakesLines.2` | [IF st.loanRate < 0] a lower rate on the loan [ELSE] a higher rate on the loan [END] |

### story/scenes.ts

| ID | Line |
|---|---|
| `engine/story/scenes.ts#resolveEvent.1` | [IF ok] Success [ELSE] Failure [END] at {Math.round(p * 100)}% |
| `engine/story/scenes.ts#resolveEvent.2` | [IF STORY_IDS[ev.defId]] story [ELSE IF ev.missionId] mission [ELSE] info [END] |
| `engine/story/scenes.ts#applyEventEffect.1` | [IF d < 0] {GOODS[g].name}: gone from the guild's goods. [ELSE] +{d} {GOODS[g].name}. [END] |
| `engine/story/scenes.ts#applyEventEffect.2` | Item added to the armory. |
| `engine/story/scenes.ts#applyEventEffect.3` | New contract on the board. |
| `engine/story/scenes.ts#applyEventEffect.4` | [IF sourceId is 'charter'] arcanist [ELSE] [ONE OF] skirmisher [OR] scout [OR] vanguard [OR] marksman [END] [END] |
| `engine/story/scenes.ts#applyEventEffect.5` | {member full name} joins the guild. |
| `engine/story/scenes.ts#applyEventEffect.6` | {member full name} leaves the guild. Their gear stays in the armory. |
| `engine/story/scenes.ts#applyEventEffect.7` | A Mail Hauberk and 2 Fire Oils are added to the armory. |
| `engine/story/scenes.ts#applyEventEffect.8` | Your loan is reduced by 200 crowns. |
| `engine/story/scenes.ts#applyMissionEffect.1` | The squad will also face: {x.tag}. |

### story/tutorial.ts

| ID | Line |
|---|---|
| `engine/story/tutorial.ts#claimNote.1` | You've run contracts, read the odds, kitted out and ordered your people, dealt with the city and the Council, and started building. |
| `engine/story/tutorial.ts#claimNote.2` | The Weighhouse sends a small purse for a guild that looks like it might last. +{FINAL_REWARD.crowns} crowns. |
