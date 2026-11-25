## Down below and expedition reports

Lines the expedition rules write: the Down below row in the week report, squad cards, the report when a squad comes home, the prep sheet's warnings and the save migration. IDs are `file#function.n`.

### expeditions/dive.ts

| ID | Line |
|---|---|
| `engine/expeditions/dive.ts#snapSquad.1` | [IF a.state is 'dead'] dead [ELSE IF a.state is 'down'] down [ELSE IF a.fatigue >= 100] out [ELSE IF a.fatigue >= T.fatigue.spent] spent [ELSE] ok [END] |
| `engine/expeditions/dive.ts#makeFoes.1` | [IF id is 'kiln'] the Kiln Engine [ELSE IF counts[id] > 1] the {nth} {def.one} [ELSE] the {def.one} [END] |
| `engine/expeditions/dive.ts#strike.1` | {dmg}[IF weak] , it hates that [ELSE IF strong] , it shrugs [END] |
| `engine/expeditions/dive.ts#foeTurn.1` | [IF f.def.id is 'kiln'] the Kiln Engine [ELSE] a {f.def.one} [END] |
| `engine/expeditions/dive.ts#fight.1` | [IF o.boss] boss_sight [ELSE IF resolve(`sight_${lead.id}`)] sight_{lead.id} [ELSE] sight_{lead.voice ?? 'beast'} [END] |
| `engine/expeditions/dive.ts#trap.1` | no tools: the long way |
| `engine/expeditions/dive.ts#trap.2` | [IF k is 'gas'] bad air [ELSE IF k is 'collapse'] a fall of rock [ELSE IF k is 'bog'] the bog [ELSE] a trap [END] |
| `engine/expeditions/dive.ts#curio.1` | [IF pellam] an Assay seal, 2 purses of coin [ELSE] 3 purses of coin [END] |
| `engine/expeditions/dive.ts#runExpedition.1` | [IF n is 0] masks_none [ELSE IF n < standing().length] masks_some [ELSE] masks_all [END] |
| `engine/expeditions/dive.ts#runExpedition.2` | [IF last] [IF outcome is 'complete'] road_home [ELSE IF outcome is 'lost'] road_home_lost [ELSE] home_retreat [END] [ELSE] road_back [END] |
| `engine/expeditions/dive.ts#runExpedition.3` | Completed a {L.name.toLowerCase()} expedition |
| `engine/expeditions/dive.ts#runExpedition.4` | Fought off [IF wanderersWon is 1] a wandering pack [ELSE] {wanderersWon} wandering packs [END] |
| `engine/expeditions/dive.ts#runExpedition.5` | Brought [IF carriedHome is 1] a fallen member [ELSE] {carriedHome} fallen members [END] home |
| `engine/expeditions/dive.ts#runExpedition.6` | Hurt [IF kills.rioter is 1] a rioter [ELSE] {kills.rioter} rioters [END] in the street |
| `engine/expeditions/dive.ts#runExpedition.7` | Talked their way past {parleys} fights |
| `engine/expeditions/dive.ts#runExpedition.8` | killed {a.kills} things on one trip |

### expeditions/migrate.ts

| ID | Line |
|---|---|
| `engine/expeditions/migrate.ts#convertMission.1` | The road was quiet. |

### expeditions/prep.ts

| ID | Line |
|---|---|
| `engine/expeditions/prep.ts#memberBlocked.1` | {first} is already away. |
| `engine/expeditions/prep.ts#memberBlocked.2` | {first} is not with the guild. |
| `engine/expeditions/prep.ts#memberBlocked.3` | {first} is too badly hurt to go (health {m.health}). |
| `engine/expeditions/prep.ts#memberBlocked.4` | {first} is in bed with the Sink fever for [IF m.fever.weeks is 1] another week [ELSE] {m.fever.weeks} more weeks [END]. |
| `engine/expeditions/prep.ts#planBlocked.1` | The guild is closed. |
| `engine/expeditions/prep.ts#planBlocked.2` | That contract is no longer on the board. |
| `engine/expeditions/prep.ts#planBlocked.3` | [IF squadLimit(s) < T.squadsMuster] {out} squads are already out, and the hall can send no more. A Muster room would let a third go. [ELSE] {out} squads are already out, which is all the hall can send. [END] |
| `engine/expeditions/prep.ts#planBlocked.4` | This job needs at least {size.min} people. |
| `engine/expeditions/prep.ts#planBlocked.5` | This job takes at most {size.max} people. |
| `engine/expeditions/prep.ts#planBlocked.6` | Each member can only take one rank. |
| `engine/expeditions/prep.ts#planBlocked.7` | One of the squad is no longer with the guild. |
| `engine/expeditions/prep.ts#planBlocked.8` | The pack holds {T.packSlots} slots. |
| `engine/expeditions/prep.ts#planBlocked.9` | Packing this means buying {cost} crowns of supplies, and the guild has {crowns}. |
| `engine/expeditions/prep.ts#planWarnings.1` | About {meals} meals on this route, and {plan.pack.food ?? 0} packed. |
| `engine/expeditions/prep.ts#planWarnings.2` | About {dark} dark rooms, and oil for {plan.pack.oil ?? 0}. |
| `engine/expeditions/prep.ts#planWarnings.3` | No tools and no Infiltrator: traps and strongboxes will be a problem. |
| `engine/expeditions/prep.ts#planWarnings.4` | No reagents: the Arcanist will cast from their own blood. |
| `engine/expeditions/prep.ts#planWarnings.5` | {first} is [IF /^[AEIOU]/.test(PROFESSIONS[m.profession].name)] an [ELSE] a [END] {PROFESSIONS[m.profession].name} in rank {i}{1}. They work best from rank {ranks.join(' or ')}. |
| `engine/expeditions/prep.ts#planWarnings.6` | {first} is still hurt (health {m.health}). |
| `engine/expeditions/prep.ts#planWarnings.7` | {first} is [IF m.fatigue >= T.fatigue.spent] worn out [ELSE] tired [END] before they start (fatigue {m.fatigue}). If they go down tired, they're likelier to die. |
| `engine/expeditions/prep.ts#planWarnings.8` | {first} is close to a Sink change (Exposure {m.exposure} of {nextTh}). If they're rested they'll run the Sink fever first. If they're worn out, it takes at once. |
| `engine/expeditions/prep.ts#planWarnings.9` | There is no Chaplain in the squad and no bandages in the pack. |
| `engine/expeditions/prep.ts#planWarnings.10` | The Sink is on the route, and there are {plan.pack.masks ?? 0} wet masks for {squad.length} people. |
| `engine/expeditions/prep.ts#planWarnings.11` | A Weighhouse payment of {loan.paymentDue} falls due while they're away. If the money at home is short, the Weighhouse waits for the squad. |
| `engine/expeditions/prep.ts#planWarnings.12` | This is story work. If the squad turns back or is lost, the job fails, and the story goes on without it. |
| `engine/expeditions/prep.ts#planWarnings.13` | This is the deepest route in Old Pellam, and nobody in this squad is past level 2. Squads this green often don't come back from the College Sink. |
| `engine/expeditions/prep.ts#planWarnings.14` | A rival wants this job too. If their crew goes in first, there will be fewer fights at the start and thinner finds. |
| `engine/expeditions/prep.ts#goalText.1` | Reach {ZONES[g.zone].name} and come back |
| `engine/expeditions/prep.ts#goalText.2` | [IF g.monster is 'kiln'] Break the Kiln Engine [ELSE] Kill [IF g.count is 1] a {MONSTERS[g.monster].name.toLowerCase()} [ELSE] {g.count} {MONSTERS[g.monster].plural} [END] [END] |

### expeditions/run.ts

| ID | Line |
|---|---|
| `engine/expeditions/run.ts#weekSummary.1` | [IF st is 'dead' and before.state[i] is not 'dead'] {name(i)} [END] |
| `engine/expeditions/run.ts#weekSummary.2` | [IF rooms is 1] a room [ELSE] {rooms} rooms [END] |
| `engine/expeditions/run.ts#weekSummary.3` | [IF fights is 1] a fight [ELSE] {fights} fights [END] |
| `engine/expeditions/run.ts#dispatchExpedition.1` | That contract is no longer on the board. |
| `engine/expeditions/run.ts#cancelExpedition.1` | No such expedition. |
| `engine/expeditions/run.ts#cancelExpedition.2` | They have already left. |
| `engine/expeditions/run.ts#cancelExpedition.3` | They have had their last orders at the door. Nobody can call them back now. |
| `engine/expeditions/run.ts#buyStores.1` | Nothing to buy. |
| `engine/expeditions/run.ts#buyStores.2` | That costs {cost} crowns, and the guild has {crowns}. |
| `engine/expeditions/run.ts#treatExposure.1` | No such member. |
| `engine/expeditions/run.ts#treatExposure.2` | There is nothing in them to draw out. |
| `engine/expeditions/run.ts#treatExposure.3` | Saint Oda's asks {T.exposure.treatCost} crowns, and the guild has {crowns}. |
| `engine/expeditions/run.ts#treatExposure.4` | {member full name} at Saint Oda's |
| `engine/expeditions/run.ts#treatExposure.5` | {m.name.split(' ')[0]} spends a night in the fever beds and comes back smelling of vinegar. Exposure −{T.exposure.treat}. |
| `engine/expeditions/run.ts#settleExpedition.1` | {name}'s people were waiting on the road home. The squad saw them first and went round. |
| `engine/expeditions/run.ts#settleExpedition.2` | {name}'s people were waiting on the road home and took a third of what the squad was carrying. |
| `engine/expeditions/run.ts#settleExpedition.3` | Week {week} · Died on "{c.title}" in {site.name}: {o.died}. |
| `engine/expeditions/run.ts#settleExpedition.4` | The guild pays {m.name.split(' ')[0]}'s family {owed} crowns. |
| `engine/expeditions/run.ts#settleExpedition.5` | {m.name.split(' ')[0]} came back changed: {CHANGES[ch].name.toLowerCase()}. |
| `engine/expeditions/run.ts#settleExpedition.6` | {m.name.split(' ')[0]} came home with the Sink fever and goes to bed. |
| `engine/expeditions/run.ts#settleExpedition.7` | [IF o.wentDown] went down and got up [END] |
| `engine/expeditions/run.ts#settleExpedition.8` | [IF tier is 'Triumph'] strong [ELSE IF won] success [ELSE] fail [END] |
| `engine/expeditions/run.ts#settleExpedition.9` | Brought back {goodsHome.map((g) => (loot[g] is 1 ? GOODS[g].one : `${loot[g]} ${G…}, to sell at the market. |
| `engine/expeditions/run.ts#settleExpedition.10` | Found {res.crownsFound} crowns in loose coin. |
| `engine/expeditions/run.ts#settleExpedition.11` | First to reach {ZONES[z].name} (+{bonus} renown). |
| `engine/expeditions/run.ts#settleExpedition.12` | The college sends a cart for the Kiln Engine's core, and a letter that is mostly about who is going to pay for the cart. |
| `engine/expeditions/run.ts#settleExpedition.13` | Hobb & Daughters took their quarter share: {cut} crowns. |
| `engine/expeditions/run.ts#settleExpedition.14` | The patron adds {ms2.join(', ')}. |
| `engine/expeditions/run.ts#settleExpedition.15` | Renown +2 for a flawless job |
| `engine/expeditions/run.ts#settleExpedition.16` | Renown +1: people came out to watch |
| `engine/expeditions/run.ts#settleExpedition.17` | [IF res.outcome is 'lost'] The squad was lost, and the job with it. [ELSE] The job was not done: {goalText(c).charAt(0).toLowerCase()}{goalText(c).slice(1)}. [END] |
| `engine/expeditions/run.ts#settleExpedition.18` | {factionName(c.patron)} is furious. Renown −2 |
| `engine/expeditions/run.ts#settleExpedition.19` | [IF res.outcome is 'lost'] was lost [ELSE IF res.goalMet] [IF res.outcome is 'complete'] came back with the job done [ELSE] turned back early, with the job done [END] [ELSE IF res.outcome is 'complete'] walked the whole route without getting what the job needed [ELSE] turned back early [END] |
| `engine/expeditions/run.ts#settleExpedition.20` | Squad {ms.number} {verdict}. {site.name}, {res.roomsCleared} of {res.roomsPlanned} rooms. |
| `engine/expeditions/run.ts#settleExpedition.21` | Did not come home: {deadNames.join(', ')}. |
| `engine/expeditions/run.ts#withdrawAtDoor.1` | Week {week} · "{c.title}": called off at the door. |
| `engine/expeditions/run.ts#withdrawAtDoor.2` | [IF c.op] Called off at the door. The operation is off. [ELSE] Called off at the door. −3 standing with {factionName(c.patron)}. [END] |
