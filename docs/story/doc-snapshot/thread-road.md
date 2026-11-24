## Thread: On the road

The squad in the field. Decisions that come up while a squad is travelling.

### Field report

`field_arrival` · Road decision · data/field.ts:49

> {member} sends word from {ms.contract.region}: the squad has reached "{ms.contract.title}" and looked the place over.
>
> [IF unknown.length] What you didn't know: {unknown.join(' and ')}.  [ELSE] It is much as you expected.  [END]They face {real.tags.map((t) => TAGS[t].name ?? t).join(', ')}.
>
> With your plan ({ms.approaches.map((a) => APPROACH_INFO[a].name).join(' → ')}), the objective succeeds {pct(o.objective)} of the time, and the hardest phase is {pct(o.weakest)}.

- **Proceed as planned** · _Objective {pct(now.objective)}_ · `field_arrival/root/c1`
  “Your orders stand.”

### The Bridge Is Out

`field_bridge` · Road decision · data/field.ts:95

**When:** picks a member where onRoad; random draw, weight 2.

> {member} sends a rider back. The river is up, and the bridge on the road to {missionOf(s, m).contract.region} has gone. The squad is waiting for your word.

- **Take the marsh road** · _No delay, but the squad will face Swamp as well._ · `field_bridge/root/c1`
  “They turn off into the reeds.”
- **Wait for the ferry** · _One week's delay. Costs {squadOf(s, ms).length} supplies, bought locally._ · `field_bridge/root/c2`
  “They make camp and wait.”
- **Ford the river** · _Endurance check ({pct(p)}). Failure: someone is swept off their feet and everyone arrives exhausted._ · (endurance check, difficulty 8 + (ms?.contract.threat ?? 3)) · `field_bridge/root/c3`
  On success: “They rope themselves together and get across, soaked to the chest.”
  On failure: “The current takes someone off their feet, and it takes the rest of them to drag the poor soul out.”

### A Deserter on the Road

`field_deserter` · Road decision · data/field.ts:119

**When:** picks a member where onRoad(s, m) and missionOf(s, m).contract.hidden.some((h) => not h.revealed); random draw, weight 2.

> A nervous man flags the squad down near {missionOf(s, m).contract.region}. He says he ran from the people they're on their way to deal with, and he'll tell them what he knows if they make it worth his while.

- **Pay him** · _−20 crowns. Reveals what the squad will face._ · (needs crowns: 20) · `field_deserter/root/c1`
  “He talks fast and keeps looking back down the road.”
- **Talk it out of him** · _Guile check ({pct(p)}). Success reveals everything for free._ · (guile check, difficulty 11) · `field_deserter/root/c2`
  On success: “A couple of drinks later, he tells them everything he knows and a good deal he doesn't.”
  On failure: “He takes fright and bolts into the trees.”
- **Send him on his way** · `field_deserter/root/c3`
  “The squad moves on.”

### Followed

`field_shadowed` · Road decision · data/field.ts:143

**When:** picks a member where onRoad; random draw, weight 2.

> {member} reports that a pair of riders have kept pace with the squad for two days, staying just out of bowshot. Somebody wants to know when they arrive.

- **Ambush the riders** · _Assault check ({pct(pa)}). Success makes the first phase easier. Failure: someone is hurt._ · (assault check, difficulty 14 + t * 1.5) · `field_shadowed/root/c1`
  On success: “The riders never report back to whoever sent them.”
  On failure: “The riders were ready for it.”
- **Lose them in the hills** · _Stealth check ({pct(ps)}). Success: first phase a little easier. Failure: the enemy is warned (first phase harder)._ · (stealth check, difficulty 9 + t) · `field_shadowed/root/c2`
  On success: “By the next morning the riders are gone.”
  On failure: “The riders stay with them all the way.”
- **Ignore them** · _The enemy will be expecting them (first phase harder)._ · `field_shadowed/root/c3`
  “The squad presses on, watched.”

### A Local Guide

`field_guide` · Road decision · data/field.ts:177

**When:** picks a member where onRoad; random draw, weight 1.5.

> An old drover offers to take the squad to {missionOf(s, m).contract.region} by the sheep tracks, which he swears are quicker and drier than the road.

- **Hire the guide** · _−25 crowns. The squad arrives fresher and better placed (every phase a little easier)._ · (needs crowns: 25) · `field_guide/root/c1`
  “The drover knows every sheep-track in the hills.”
- **Decline** · `field_guide/root/c2`
  “They keep to the road.”

### A Wounded Carter

`field_traveler` · Road decision · data/field.ts:188

**When:** picks a member where onRoad; random draw, weight 1.5.

> {member}'s squad finds a carter by the road with a broken leg and an overturned wagon. Bandits, he says, two days ago.

- **Help him** · _−3 supplies. Renown +1, the squad feels good about it (morale)._ · (needs supplies: 3) · `field_traveler/root/c1`
  “He promises to tell everyone in the next town.”
- **Leave him** · `field_traveler/root/c2`
  “Somebody else will be along, probably.”

### Hobb's People on the Road

`field_rivals` · Road decision · data/field.ts:199

**When:** picks a member where onRoad(s, m) and missionOf(s, m).contract.contestedBy; random draw, weight 3.

> {member} spots a Hobb & Daughters squad on the same road, heading for the same job: "{missionOf(s, m).contract.title}". Isbet Hobb is leading them.

- **Race them there** · _Endurance check ({pct(pe)}). Success: the patron pays a bonus (+{bonus}). Failure: the squad arrives exhausted._ · (endurance check, difficulty 8 + t) · `field_rivals/root/c1`
  On success: “Your people get there first, and the patron notices.”
  On failure: “They lose the race and arrive with blistered feet anyway.”
- **Slip into their camp at night** · _Stealth check ({pct(ps)}). Success: Hobb & Daughters lose face (rival renown −3), Heat +2. Failure: Heat +5 and a fight._ · (stealth check, difficulty 10 + t) · `field_rivals/root/c2`
  On success: “Isbet Hobb's squad wakes up to cut girths and scattered horses.”
  On failure: “Isbet was waiting for them.”
- **Let them go ahead** · _They will have stirred things up (first phase harder)._ · `field_rivals/root/c3`
  “The Hobbs ride on ahead.”

### The Weather Turns

`field_weather` · Road decision · data/field.ts:234

**When:** picks a member where onRoad(s, m) and ['Autumn', 'Winter'].includes(seasonOf(week)); random draw, weight 2.

> [IF seasonOf(week) is 'Winter'] Snow [ELSE] Freezing rain [END] has set in on the road. {member} wants to know whether to push on or find somewhere dry.

- **Push on** · _Everyone arrives tired (fatigue +15)._ · `field_weather/root/c1`
  “Heads down, they keep walking.”
- **Shelter and wait** · _One week's delay. Costs {squadOf(s, missionOf(s, m)).length} supplies._ · `field_weather/root/c2`
  “They find a shepherd's hut and wait it out.”

### Fresh Tracks

`field_tracks` · Road decision · data/field.ts:245

**When:** picks a member where onRoad(s, m) and squadOf(s, missionOf(s, m)).some((x) => x.profession is 'scout' or x.profession is 'skirmisher') and missionOf(s, m).contract.hidden.some((h) => not h.revealed); random draw, weight 2.5.

> {first(sc)} found fresh tracks a mile from the job and wants to follow them for a day.

- **Follow the tracks** · _Reveals what the squad will face, and the first phase is easier. Fatigue +10._ · `field_tracks/root/c1`
  “By nightfall they know exactly what is waiting.”
- **Stay on schedule** · `field_tracks/root/c2`
  “They keep to the plan.”
