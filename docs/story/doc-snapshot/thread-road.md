## Thread: On the road

The squad in the yard. Door scenes: news brought to the yard on Tallow Street as a squad sets out for a distant site. The choice is the last order the squad gets before it leaves.

### The Bridge Is Out

`field_bridge` · Road decision · data/field.ts:35

**When:** picks a member where onRoad; random draw, weight 2.

> A coal carter comes into the yard with mud up to his knees. The river is up, he says, and the bridge on the way to {placeOf(s, m)} has gone. {member} has the squad packed and wants to know which way to go before they leave.

- **Send them by the marsh road** · _No delay, but the squad will face Swamp as well._ · `field_bridge/root/c1`
  “The carter says the reeds are only waist-deep for most of the way, and nobody believes him.”
- **Tell them to wait for the ferry** · _One week's delay. Costs {squadOf(s, ms).length} supplies, bought at the crossing._ · `field_bridge/root/c2`
  “They set out expecting to spend a week in a ferryman's barn.”
- **Tell them to ford the river** · _Endurance check ({pct(p)}). Failure: someone is swept off their feet and everyone arrives exhausted._ · (endurance check, difficulty 8 + (ms?.contract.threat ?? 3)) · `field_bridge/root/c3`
  On success: “At the river they rope themselves together and get across, soaked to the chest.”
  On failure: “At the river the current takes someone off their feet, and it takes the rest of them to drag the poor soul out.”

### A Deserter at the Door

`field_deserter` · Road decision · data/field.ts:59

**When:** picks a member where onRoad(s, m) and missionOf(s, m).contract.hidden.some((h) => not h.revealed); random draw, weight 2.

> A nervous man is waiting at the hall door as the squad gets ready for {placeOf(s, m)}. He says he ran from the people they're going there to deal with, and he'll tell them what he knows if they make it worth his while.

- **Pay him** · _−20 crowns. Reveals what the squad will face._ · (needs crowns: 20) · `field_deserter/root/c1`
  “He talks fast and keeps looking up and down Tallow Street.”
- **Talk it out of him** · _Guile check ({pct(p)}). Success reveals everything for free._ · (guile check, difficulty 11) · `field_deserter/root/c2`
  On success: “A couple of drinks later, he tells them everything he knows and a good deal he doesn't.”
  On failure: “He takes fright and bolts down Tallow Street.”
- **Send him on his way** · `field_deserter/root/c3`
  “He goes off down the street, and the squad sets out the other way.”

### Watched

`field_shadowed` · Road decision · data/field.ts:83

**When:** picks a member where onRoad; random draw, weight 2.

> The stable boy says a pair of riders have been watching the yard for two days from the corner of Tallow Street. They're there now, with their horses saddled. {member} thinks they mean to follow the squad out, because somebody wants to know when it arrives.

- **Ambush them on the road** · _Assault check ({pct(pa)}). Success makes the fights there easier. Failure: someone is hurt._ · (assault check, difficulty 14 + t * 1.5) · `field_shadowed/root/c1`
  On success: “The riders never report back to whoever sent them.”
  On failure: “The riders were expecting it.”
- **Lose them in the hills** · _Stealth check ({pct(ps)}). Success: the fights there are a little easier. Failure: the enemy is warned (the fights there will be harder)._ · (stealth check, difficulty 9 + t) · `field_shadowed/root/c2`
  On success: “By the second morning out, the riders are gone.”
  On failure: “The riders stay with them all the way.”
- **Let them follow** · _The enemy will be expecting them (the fights there will be harder)._ · `field_shadowed/root/c3`
  “The squad rides out, and the two riders fall in behind.”

### A Local Guide

`field_guide` · Road decision · data/field.ts:117

**When:** picks a member where onRoad; random draw, weight 1.5.

> An old drover is drinking in the hall after a sale. He hears where the squad is bound and offers to take them to {placeOf(s, m)} by the sheep tracks, which he swears are quicker and drier than the road.

- **Hire the guide** · _−25 crowns. The squad arrives fresher and better placed (the fights a little easier)._ · (needs crowns: 25) · `field_guide/root/c1`
  “He finishes his drink and whistles for his dog. He says he knows every sheep track in the hills.”
- **Decline** · `field_guide/root/c2`
  “He shrugs and orders another. The squad will keep to the road.”

### A Wounded Carter

`field_traveler` · Road decision · data/field.ts:128

**When:** picks a member where onRoad; random draw, weight 1.5.

> A carter limps into the yard on a broken leg while {member} is loading up. His wagon is on its side a mile out, on the road the squad is about to take. Bandits, he says, two days ago.

- **Help him** · _−3 supplies. Renown +1, the squad feels good about it (morale)._ · (needs supplies: 3) · `field_traveler/root/c1`
  “He promises to tell everyone at the market.”
- **Leave him** · `field_traveler/root/c2`
  “Somebody else will see to him, probably.”

### Hobb's People Are Packing

`field_rivals` · Road decision · data/field.ts:139

**When:** picks a member where onRoad(s, m) and missionOf(s, m).contract.contestedBy is 'hobbs' and isbet status is 'alive'; random draw, weight 3.

**Reads:** `isbet_betrayed` (set by **The Copper Kettle** (`isbet_kettle`)).

> The pot boy from the Copper Kettle runs in to say that Hobb & Daughters are loading packs in their yard for the same job you've given {member}: "{missionOf(s, m).contract.title}". Isbet Hobb is leading them, and they mean to leave today.[IF isbet_betrayed and marta status is 'alive'] 
>
> He says one more thing, looking at his feet. Isbet saw him coming this way and told him to give the guild her mother's regards, and nothing else. [END]

- **Race them there** · _Endurance check ({pct(pe)}). Success: the patron pays a bonus (+{bonus}). Failure: the squad arrives exhausted._ · (endurance check, difficulty 8 + t) · `field_rivals/root/c1`
  On success: “Your people get there first, and the patron notices.”
  On failure: “They lose the race and arrive with blistered feet anyway.”
- **Raid their camp on the road** · _Stealth check ({pct(ps)}). Success: Hobb & Daughters lose face (rival renown −3), Heat +2. Failure: Heat +5 and a fight._ · (stealth check, difficulty 10 + t) · `field_rivals/root/c2`
  On success: “Isbet Hobb's squad wakes up on the first morning to cut girths and scattered horses.”
  On failure: “Isbet was waiting for them.”
- **Let them go first** · _They will have stirred things up (the fights there will be harder)._ · `field_rivals/root/c3`
  “[IF isbet_betrayed] The Hobbs are out of town by noon. Isbet rides past the hall door and does not turn her head. [ELSE] The Hobbs are out of town by noon. [END]”

### The Weather Turns

`field_weather` · Road decision · data/field.ts:183

**When:** picks a member where onRoad(s, m) and ['Autumn', 'Winter'].includes(seasonOf(week)); random draw, weight 2.

> A drover just in from {placeOf(s, m)} says [IF seasonOf(week) is 'Winter'] snow [ELSE] freezing rain [END] has set in out there. {member} wants to know before they go whether to push on through it or find somewhere dry and wait.

- **Tell them to push on** · _Everyone arrives tired (fatigue +15)._ · `field_weather/root/c1`
  “They tie their hoods down and set off.”
- **Tell them to shelter and wait** · _One week's delay. Costs {squadOf(s, missionOf(s, m)).length} supplies._ · `field_weather/root/c2`
  “The drover tells them where to find a shepherd's hut on the way.”

### Fresh Tracks

`field_tracks` · Road decision · data/field.ts:194

**When:** picks a member where onRoad(s, m) and squadOf(s, missionOf(s, m)).some((x) => x.profession is 'scout' or x.profession is 'skirmisher') and missionOf(s, m).contract.hidden.some((h) => not h.revealed); random draw, weight 2.5.

> A tinker who came in from {placeOf(s, m)} saw fresh tracks a mile from the job. {first(sc)} wants leave to spend a day following them once the squad gets there.

- **Follow the tracks** · _Reveals what the squad will face, and the fights there are a little easier. Fatigue +10._ · `field_tracks/root/c1`
  “The tinker draws them a map on the back of a bill, which is better than most maps.”
- **Stay on schedule** · `field_tracks/root/c2`
  “They will go straight to the job.”

### The Crown's Wagons

`field_crown_wagons` · Road decision · data/field.ts:208

**When:** picks a member where onRoad(s, m) and silver_abandoned and missionOf(s, m).contract.expedition.site is 'anselm'; needs alive: Lord Treasurer Aubrey Fenn; random draw, weight 4; fires once.

**Reads:** `silver_abandoned` (set by contract **The Crown's Last Silver** (`silver_convoy`)).

> A carter in from the coast road tells {member} that the Crown's wagons are still at Wenmouth ford. They went that far with the Exchequer's own guard to meet the escort the Crown had hired, and the escort never came. When the ships had sailed, the guard took the silver back to the Exchequer's vault and went home. The wagons are still there, empty, and so is a clerk from the Exchequer is still there, living in one of them, because nobody has told him to come back.

- **Bring the clerk home** · _Exchequer +3, Fenn +10. The squad stops at the ford for him (fatigue +8)._ · `field_crown_wagons/root/c1`
  “Fenn writes two lines to thank you, and spends one of them apologizing for the clerk.”
- **Leave him there** · `field_crown_wagons/root/c2`
  “The carter says the clerk seemed happy enough, and he had a stove.”

### An Exchequer Writ

`field_writ` · Road decision · data/field.ts:231

**When:** picks a member where onRoad(s, m) and fenn_ally; needs alive: Lord Treasurer Aubrey Fenn; random draw, weight 4; fires once.

**Reads:** `fenn_ally` (set by **Quarter Day** (`quarter_day`)).

> A clerk from the Exchequer is in the yard with a writ under the Lord Treasurer's seal. Fenn heard at the table that your people are going to {placeOf(s, m)}, and the writ lets them change horses at the Crown's post-houses on the way. The clerk mentions that the post-riders wear the Crown's colors, and that {member}'s squad would be riding with them.

- **Take the writ** · _The squad arrives fresher (fatigue −15). Lower Town −2: the street sees who they ride with._ · `field_writ/root/c1`
  “The clerk folds the writ into a leather case and hands it to the squad as if it might go off.”
- **Thank Fenn and walk** · `field_writ/root/c2`
  “The clerk takes the writ back. He says Fenn will understand, and Fenn probably will.”
