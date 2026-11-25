// The expedition log's lines. The dive picks one variant per situation and
// works through all of a situation's variants before repeating one.
// Placeholders: {a} a member, {t} another member, {m} a monster or a cause,
// {w} a weapon, {g} goods, {s} a scar, {el} an element, {n} a count.
// Writing rules: docs/STORY.md §7. Members are referred to by name or "they".

export const LINES: Record<string, string[]> = {
  // ---- setting out ----
  setout_short: [
    'The squad goes down the Tallow Street steps with {a} in front, and the hall door shuts behind them.',
    '{a} lifts the culvert grate behind the chandler\'s. It is heavier than it looks, and it smells worse.',
    'They climb down the iron rungs into the Culverts. {b} goes last and counts the rungs out loud, which nobody asked for.',
  ],
  setout_medium: [
    'The squad goes down into Old Pellam with food for two weeks and the hope that it will be enough.',
    "{a} leads them down the Tallow Street steps. Somebody's mother is shouting about the rent in the street above, and then they can't hear her.",
    'They lower the packs on a rope before they climb down after them. {b} checks the knots twice.',
  ],
  setout_long: [
    'The squad goes down to find the bottom of the College Sink. Nobody says how long it will take, because nobody knows.',
    "{a} takes the first step down into the Culverts. The porters at the top have stopped joking, which is the first bad sign of the trip.",
    'They go down with as much as they can carry and one map of Pellam, which is two hundred years out of date.',
  ],
  rival_ahead: [
    'Somebody has been through here this week. There are fresh boot marks and chalk on the walls, and the rats are thinner on the ground.',
    'Another crew came down this way a few days ago. They took what was easy and left the doors open behind them.',
  ],
  rival_ahead_hobbs: ["Hobb's people came through a few days ago. They took what was easy and left the doors open behind them."],

  // ---- zones ----
  enter_culverts: [
    'The Culverts are old brick, and wet. Daylight comes down through the grates in grey squares.',
    'They are in the Culverts now. Water runs ankle deep over the brick, and somewhere ahead something drops into it.',
    'The Culverts begin under the chandler\'s cellar. Everything the Lower Town throws away ends up down here, sooner or later.',
  ],
  enter_streets: [
    "The drain opens out into a street. It has a gutter and a name painted on a corner, and Varrow's foundations sit on its roofs like a lid.",
    'They come out into the Buried Streets. The houses stand where they were left, full to the windows with silt, and there is no light at all.',
    "Below the Culverts the brick changes to Pellam's yellow stone. These were streets once, and they still have doorsteps.",
  ],
  enter_sink: [
    'The street slopes down into the College Sink. The walls sweat green and violet, and the air tastes of pennies.',
    'They reach the Sink. A hundred years of spent reagents went down here, and none of it has quite finished reacting.',
    'The stone gives way to a glassy crust that crunches underfoot. This is the College Sink, and it is warm.',
  ],
  lamps_lit: [
    'They light the lamps. Pellam is not improved by being able to see it.',
    'The lamps go up. The light reaches about four yards and gives up.',
    'They light the lamps, and the flames burn a little blue down here. Nobody likes it.',
  ],

  // ---- passages ----
  passage_culverts: [
    'The drain here is so low that everyone stoops. {a} hits their head twice and stops apologising to the ceiling.',
    'They wade through a junction where four drains meet. One of them is warm, and nobody asks why.',
    'They pass through a cellar whose stairs were bricked up from above. Someone has carved a list of names into the wall, and the most recent is from last spring.',
    'The drain narrows to a pipe they have to crawl through. {a} goes first and reports that it gets better, which is a lie.',
    'They squeeze past an old sluice wheel that has rusted solid. Rats have nested in its gears and moved out again.',
    'They walk a stretch of dry brick under the Copper Kettle and can hear the singing through the ceiling, and it is not good singing.',
  ],
  passage_streets: [
    "They walk down the middle of a buried street. A baker's sign still hangs over one door, and the loaf on it is the right shape.",
    'They cross a square with a dry fountain. Somebody has stacked bones in the basin, very neatly, by size.',
    'The street is blocked by a fallen roof beam. They go through a house instead, in at the front door and out through the scullery.',
    '{a} finds a child\'s shoe on a doorstep, two hundred years old and the size of a hand. They put it back where it was.',
    "They go along an arcade of shops with the shutters still down. The silt has come in through the cracks and filled them to the counters.",
    'They cross a little bridge over a culvert that used to be the river. The water under it is black and goes the wrong way.',
  ],
  passage_sink: [
    'The spill has cut a channel through the crust and runs along it in a thin bright stream. Everybody steps over it with great care.',
    "They pass an old college sluice gate, jammed half open. Somebody has scratched their initials into the brass, and a rude word under them.",
    'The floor here is crystal, and it rings when they walk on it. {a} tries to walk more quietly and it rings anyway.',
    'They go through a gallery of dead pipes, each one stained a different color. The air stings the eyes.',
    'They walk past a wall of fused glassware, thousands of broken retorts that melted together. It is almost pretty.',
  ],
  scout_cache: [
    '{a} stops at a loose brick, works it free with a knife and finds {g} behind it.',
    '{a} notices a cupboard behind a fallen door. There is {g} inside, and a note nobody can read.',
    'While the others rest, {a} goes through a heap of rubble and comes back with {g}.',
  ],

  // ---- rooms with something in them ----
  room_culverts: [
    "They come into a smuggler's cellar under the old fish market. It is mostly empty.",
    'There is a dry room off the main drain, with shelves.',
    'The next room is a collapsed coal store, where the Lower Town dumped its rubbish for a century.',
  ],
  room_streets: [
    "They go into a merchant's house. Varrow's foundations have crushed the upper floor, but the ground floor is still whole.",
    'The next door opens on a chandlery with its stock still on the shelves, all of it gone to wax and silt.',
    'They climb into a chapel with no roof, where the silt has come in up to the altar rail.',
  ],
  room_sink: [
    "They find an old college storeroom with its shelves fused into one glassy block.",
    'A side chamber opens off the passage. The spill has dried into crust in here, and the crust has cracked.',
    'This is a laboratory the college sealed and forgot. The seals have failed.',
  ],
  find_culverts: [
    '{a} turns over a heap of rotten crates and finds {g}.',
    'Under a loose flagstone {a} finds {g} that somebody hid and never came back for.',
    '{a} fishes {g} out of the water with a bent nail on a stick.',
    'On a high shelf, wrapped in oilcloth and still dry, {a} finds {g}.',
  ],
  find_streets: [
    "{a} finds {g} in a cupboard whose lock gave up long ago.",
    '{a} digs {g} out of the silt on the floor with their bare hands.',
    "{a} finds {g} wedged up a chimney, left by whoever ran out of here when the river moved.",
    '{a} finds {g} in a sideboard that has not been opened in two centuries.',
  ],
  find_sink: [
    '{a} chips {g} out of the crust, gloves on, face turned away.',
    'Among the broken glassware {a} finds {g}, unbroken and worth something.',
    '{a} gets {g} out of a crusted pool without touching the pool, mostly.',
    "{a} finds {g} on the body of a college porter who came down here a long time ago.",
  ],
  find_picked: [
    'Somebody has already been through this room. There are scrape marks where the good things were.',
    'The shelves are bare. Fresh boot prints in the silt say who got here first.',
  ],
  goalroom_culverts: [
    'The old pump house is where the map said. Something lives in it.',
    "They reach the pump house at the end of the Culverts. It is occupied.",
  ],
  goalroom_streets: [
    "The counting house of Pellam stands at the bottom of the street, with its doors open and something moving inside.",
    'They find the counting house. The ledgers are still on the desks, and the desks are not empty.',
  ],
  goal_culverts: [
    'In the pump house they find what they came for: {g}, in a lead box under the wheel pit.',
    'The pump house strongbox gives up {g}. {a} weighs the haul in one hand and grins.',
  ],
  goal_streets: [
    "The counting house vault is still locked. {a} gets it open and finds {g} inside.",
    "Pellam's counting house has been sitting on {g} for two hundred years, and nobody upstairs ever knew.",
  ],
  goal_sink: [
    "In the ashes where the Kiln Engine stood, {a} finds {g}, still warm. They wrap the lot in a wet blanket and do not complain about the weight.",
    'They pick through the wreck of the Kiln Engine and take {g}. The college will want all of it back.',
  ],

  // ---- monsters come into view ----
  sight_rats: [
    'The water starts moving against the current. It is rats, a lot of them, and they are all coming this way.',
    '{m} pours out of a broken pipe. Some of them are the size of cats, and the rest are bigger.',
    'Something squeals, and then everything squeals. It is rats.',
  ],
  sight_moths: [
    'Pale shapes come down out of the dark toward the lamps. They are tallow moths, and they want the oil.',
    'A soft noise fills the drain, the sound of a great deal of paper being folded. Moths as wide as a hand come out of it.',
  ],
  sight_grubber: [
    'A lamp goes out ahead of them, and then people with picks step into the light. They are grubbers, and they are not here to talk.',
    '"This is ours," says a grubber with no front teeth. There are more behind them.',
    'These are grubbers. They have been digging here a long time, and they do not want to share it.',
    'Someone throws a stone, and then the grubbers come at them out of a side tunnel.',
  ],
  sight_eel: [
    'The flooded cellar is too still. Then the water stands up.',
    'Something long and grey turns over in the water beside the path, and it is longer than the path.',
  ],
  sight_spider: [
    'There are webs across the doorway, thick enough to hold a dog. Whatever made them is coming down the wall.',
    'A spider the color of wet plaster unfolds from the ceiling. Its legs keep unfolding for some time.',
    'Somebody brushes a thread, and the room starts moving.',
  ],
  sight_hog: [
    'Something big snorts in the dark ahead. A pale hog, blind and the size of a pony, has smelled them.',
    'There are hoofbeats on the stone, and then a white hog comes down the street at a run.',
  ],
  sight_crab: [
    'A pile of rubble stands up on six legs. It is a sink crab, and there is another behind it.',
    'Claws click on the stone. The crabs down here grew big on runoff, and they grew mean as well.',
  ],
  sight_seep: [
    'The floor moves toward them. A seep, a spill of reagents that never stopped reacting, has found something warm.',
    'Something bright and wet crawls out of a drain, fizzing where it touches the stone. It is a seep, and it has noticed them.',
  ],
  sight_engine: [
    'Iron feet ring on the crust. An Assay engine walks out of the dark, its testing arms already moving.',
    'A brass plate on its chest reads "Assay Office. Do not obstruct." It is coming straight for them.',
  ],
  boss_sight: [
    'At the bottom of the Sink the Kiln Engine walks out of its own glow. It is the size of a chapel, and there is fire moving behind the grilles in its chest.',
    "The Kiln Engine turns toward the lamps. The college built it to burn the spill, and it burns whatever it can reach.",
  ],
  ambush: [
    '{m} gets the first blow in before anyone sees it coming.',
    'They walk straight into it. {m} has the first move.',
    'Nobody was watching that side. {m} is already among them.',
  ],
  moths_oil: [
    'The moths go straight for the oil flasks and get into them before anyone can stop it.',
    'A moth lands on a flask and drinks through the cork. They lose some oil to the swarm.',
  ],

  // ---- the squad attacks ----
  melee_hit: [
    '{a} brings the {w} down on {m}.',
    '{a} steps in and hits {m} hard with the {w}.',
    '{a} catches {m} with the {w} and something cracks.',
    '{a} swings the {w} into {m} and keeps swinging.',
    '{a} gets the {w} into {m} and twists.',
    '{a} chops at {m} and connects.',
    '{a} puts their weight behind the {w}, and {m} takes all of it.',
    '{a} finds an opening and hits {m} in it.',
  ],
  melee_miss: [
    '{a} swings at {m} and hits the wall.',
    '{m} twists away from the {w}.',
    '{a} lunges, slips on the wet stone and misses {m}.',
    "{a}'s blow lands on nothing.",
    '{a} misses, and says something the chaplains would not repeat.',
  ],
  second_hit: [
    '{a} cuts again, faster, and finds {m}.',
    '{a} comes back the other way and catches {m}.',
    "{a}'s second strike finds {m}.",
    '{a} does not wait to see what the first one did, and hits {m} again.',
    '{a} follows through and opens {m} up a second time.',
  ],
  second_miss: [
    "{a}'s second cut goes wide.",
    '{a} tries a second strike and nearly loses the {w}.',
    '{a} goes for a second cut, and {m} is ready for that one.',
  ],
  bash_hit: [
    '{a} slams a shoulder into {m}.',
    '{a} batters {m} with the flat of the {w}.',
    '{a} shoves {m} back into the dark.',
  ],
  bash_miss: [
    '{a} charges {m} and finds only air.',
    '{m} gives ground, and {a} stumbles past it.',
  ],
  stunned: [
    '{m} reels and stands there with no idea where it is.',
    '{m} lurches and loses track of the fight.',
    '{m} goes down and is slow getting up.',
  ],
  hamstring_hit: [
    '{a} goes low and opens a long cut in {m}.',
    '{a} slashes at {m} and leaves it bleeding.',
    '{a} cuts {m} somewhere that will keep bleeding.',
  ],
  hamstring_miss: [
    '{a} goes low for {m} and gets nothing but stone.',
    '{a} goes in low, and {m} is not there.',
  ],
  shot_hit: [
    '{a} looses, and the arrow takes {m}.',
    "{a}'s shot goes over the front rank and into {m}.",
    '{a} picks a spot on {m} and puts an arrow in it.',
    '{a} shoots between two shoulders and hits {m}.',
    'A bolt from {a} thumps into {m}.',
  ],
  shot_miss: [
    "{a}'s arrow skips off the wall.",
    '{a} shoots and {m} moves at the last moment.',
    "{a} doesn't have a clear shot and takes it anyway. It misses.",
    "{a}'s arrow goes into the dark, and nothing comes back.",
  ],
  pin_hit: [
    "{a} puts an arrow into {m}, and it won't be aiming at anyone for a while.",
    '{a} pins {m} where it stands.',
  ],
  pin_miss: ['{a} tries to pin {m} and misses.', "{a}'s pinning shot falls short."],
  spell_hit: [
    '{a} speaks the working and it hits {m} square.',
    '{a} opens a hand and the focus spits at {m}.',
    'The air goes tight around {a}, and then {m} takes the spell full on.',
    '{a} lets go of the working. {m} is in the way of it.',
    '{a} traces the figure without looking and the spell finds {m}.',
  ],
  spark_hit: [
    '{a} flicks a small working at {m}, the cheapest one they know.',
    '{a} flicks a spark off the {w} at {m}. It stings, at least.',
    '{a} taps {m} with a working the size of a candle flame.',
    '{a} has nothing better left and throws a spark at {m} anyway.',
    '{a} pinches out a little working at {m}, about as much as they can spare, and it lands.',
  ],
  spark_miss: ["{a}'s little working dies before it reaches {m}.", '{a} flicks a spark at {m} and misses.'],
  spell_miss: [
    "{a}'s spell splashes off the stones beside {m}.",
    '{a} casts, and the working comes apart in the wet air.',
    '{a} gets the figure wrong. The spell fizzles.',
  ],
  burst: [
    '{a} cracks two doses together and the {el} working goes off across the whole front.',
    '{a} spends two doses at once. The {el} burst fills the room.',
    '{a} shouts for everyone to get their heads down, and lets the {el} working go wide.',
  ],
  blood_cast: [
    'There are no doses left, so {a} cuts their own palm and casts from that.',
    '{a} has run out of reagents. They spend their own blood instead, and go grey.',
    "{a} casts dry. It comes out of them instead of the doses, and it hurts.",
    '{a} opens the cut on their palm again and casts from that.',
    '{a} pays for the next working in blood. Their lips have gone blue.',
  ],
  censer_hit: [
    "{a} swings the censer and radiant light burns into {m}.",
    '{a} lights a dose in the censer. {m} hates the light.',
    'The censer flares in {a}\'s hand and {m} recoils, smoking.',
  ],
  censer_miss: ['{a} swings the censer and the light goes past {m}.', "The censer's light catches {m} at the edge and does little."],
  knife_hit: [
    '{a} slips in close and finds a gap in {m}.',
    '{a} puts the {w} where {m} is softest.',
    '{a} ducks under and stabs upward into {m}.',
    '{a} gets behind {m} and uses the {w}.',
  ],
  knife_miss: ['{a} darts in at {m} and darts out again with nothing.', "{a}'s knife scrapes off {m}."],
  throw_hit: ['{a} throws a knife over the front rank. It sticks in {m}.', '{a} flicks a blade into {m} from the back.'],
  throw_miss: ["{a}'s thrown knife clatters away into the dark.", '{a} throws and misses, and now has one fewer knife.'],
  crit: [
    "{a} finds the weak place on {m}, and it goes in deep.",
    '{a} gets the blow they were waiting for. {m} feels all of it.',
    "{a} hits {m} so hard that the others stop to look.",
    '{a} goes clean through {m} and does not look surprised about it.',
    '{a} times it perfectly and {m} pays for it.',
  ],
  cant_reach: [
    "{a} can't reach anything from back here and shouts advice instead.",
    '{a} waits behind the others for an opening that never comes.',
    "{a} is too far back to hit anything, and knows it.",
    '{a} tries to push forward past the others and gets an elbow for it.',
  ],

  // ---- the squad holds together ----
  cover: [
    '{a} steps in front of {t}. "Get behind me."',
    '{a} plants their feet between {t} and the fight.',
    '{a} pulls {t} back and takes their place.',
  ],
  covered: [
    '{m} goes for {t}, and {a} is there first.',
    '{a} takes the blow meant for {t}.',
    '{m} swings at {t} and hits {a} instead.',
  ],
  dress: [
    '{a} kneels by {t} and packs the wound while the fight goes on around them.',
    '{a} gets a dressing on {t}, tight and fast.',
    '{a} stitches {t} up in three movements, with big crooked stitches that hold anyway.',
    '"Hold still," {a} tells {t}, and pours something on the cut that makes {t} swear.',
    '{a} drags {t} back a yard and ties off the worst of the bleeding.',
    '{a} gets a pad of lint on {t} and leans on it until it stops.',
  ],
  dress_self: ['{a} binds their own arm with their teeth and one hand.', '{a} packs their own wound and keeps going.'],
  steady: [
    "{a} sits {t} on a step, rubs the cramp out of their legs and makes them drink.",
    "\"Up,\" {a} tells {t}. \"You can lie down when we're home.\" It works, somehow.",
    "{a} gives {t} a twist of salt and sugar from Saint Oda's and tells them to chew.",
    "{a} takes {t}'s pack for a while and lets them walk light.",
  ],
  steady_self: [
    "{a} eats a twist of salt and sugar from their own bag and keeps going.",
    "{a} stops long enough to retie their boots properly. It helps more than it should.",
  ],
  bandage: [
    '{a} binds their own cuts with a fresh bandage.',
    'They stop long enough to bandage {a}.',
    '{a} wraps a bandage round the worst of it and pulls it tight.',
    'Someone gets a bandage onto {a}. It soaks through, but slowly.',
  ],
  bandage_chaplain: [
    '{t} cleans and bandages {a} properly, the way they teach it at Saint Oda\'s.',
    '{t} takes a bandage to {a} and makes it go twice as far as anyone else would.',
    '{t} sits {a} down on a step and does the job properly.',
  ],
  draught: [
    '{a} goes down, and somebody gets a draught between their teeth before they finish falling. They come up coughing.',
    '{a} drops, then sits up again with the empty draught bottle still in their mouth.',
    'A draught brings {a} back up off the stones, white and swearing.',
  ],

  // ---- enemies attack ----
  rats_hit: ['{m} swarms up {t}\'s legs, biting.', 'The rats get under {t}\'s guard and into their boots.', '{m} goes for {t}\'s hands.', 'Rats bite {t} in several places at once.'],
  rats_miss: ['{t} kicks the rats away.', 'The rats break around {t} and come back together behind them.', '{t} stamps, and the rats scatter and then come straight back.'],
  rats_crit: ['The rats get {t} by the throat, and it takes two people to pull them off.'],
  moths_hit: ['{m} beats against {t}\'s face, all powder and wings.', 'Moths get into {t}\'s mouth.', '{m} smothers {t}\'s lamp hand.'],
  moths_miss: ['{t} swats through the moths.', 'The moths flutter round {t} and away.'],
  moths_crit: ['The moths cover {t} entirely, and when they lift, {t} is bleeding from a hundred small cuts.'],
  grubber_hit: ['{m} swings a pick into {t}.', '{m} hits {t} with a length of chain.', '{m} gets {t} with a short, dirty knife.', '{m} cracks {t} across the head with a shovel.'],
  grubber_miss: ['{m} swings the pick and buries it in the wall.', '{t} steps inside the grubber\'s swing.', '{m} lunges at {t}, skids on the wet brick and nearly goes down.'],
  grubber_crit: ['{m} drives the pick into {t} and has to put a foot on them to pull it out.'],
  eel_hit: ['{m} comes up out of the water and closes its jaws on {t}.', '{m} lashes {t} with its whole body.', '{m} drags {t} toward the water.'],
  eel_miss: ['{m} snaps at {t} and gets a mouthful of water.', '{t} jumps back as the eel strikes.'],
  eel_crit: ['{m} gets {t} by the leg and pulls them under. {t} comes back up coughing water, and the leg is not right.'],
  spider_hit: ['{m} bites {t}, and the bite goes numb straight away.', '{m} drops onto {t} from above.', "{m}'s fangs go through {t}'s sleeve."],
  spider_miss: ['{m} strikes at {t} and hits the floor.', '{t} gets an arm up just in time.'],
  spider_crit: ['{m} sinks both fangs into {t} and holds on.'],
  hog_hit: ['{m} slams into {t} and keeps going.', '{m} gores {t} with a yellow tusk.', '{m} tramples {t}.'],
  hog_miss: ['{m} charges past {t} into the wall, and the wall comes off worse.', '{t} throws themselves sideways and {m} thunders past.'],
  hog_crit: ['{m} hits {t} full on. {t} goes a long way and lands hard.'],
  crab_hit: ['{m} closes a claw on {t}.', '{m} pinches {t} hard enough to bend their armor.', '{m} batters {t} with a claw.'],
  crab_miss: ['{m} snaps at {t} and misses.', '{m} scuttles sideways and its claw closes on nothing.'],
  crab_crit: ['{m} gets {t} in both claws and squeezes.'],
  seep_hit: ['{m} washes over {t}\'s boots, and the leather starts to smoke.', '{m} splashes {t}, and it burns.', '{m} reaches up {t}\'s leg.'],
  seep_miss: ['{m} surges at {t}, who gets out of the way.', '{m} spits at {t} and the stone hisses where it lands.'],
  seep_crit: ['{m} drops onto {t} from a ledge. They scream until somebody pulls them out of it.'],
  engine_hit: ['{m} brings a testing arm down on {t}.', '{m} grips {t} in its calipers and squeezes, testing.', '{m} stamps on {t}.'],
  engine_miss: ['{m} reaches for {t} and closes on air.', '{m} swings and the arm sticks halfway, grinding.'],
  engine_crit: ['{m} picks {t} up, weighs them carefully, and throws them at the wall.'],
  kiln_hit: ['{m} swings a burning arm into {t}.', '{m} opens its door and breathes fire on {t}.', '{m} treads on {t}.'],
  kiln_miss: ['{m} swings at {t} and melts a hole in the wall instead.', '{t} rolls clear of a burning arm.'],
  kiln_crit: ['{m} catches {t} with its whole weight. There is a smell of burned leather and worse.'],
  kiln_blast: [
    '{m} opens every door in its body at once. Fire rolls across the whole squad.',
    "{m} vents its firebox. The heat hits everyone at the same time.",
  ],
  foe_wait: ['{m} waits behind the others for a gap.', '{m} pushes at the ones in front and cannot get through.'],
  stolen: ['{m} grabs {g} out of a pack and runs off with it.', 'In the scuffle {m} gets away with {g}.'],
  poisoned: ["The spider's venom is still working in {a}.", '{a} is sweating and their hands have gone numb.', '{a} sways. The bite has gone purple and hot.', '{a} is sick against the wall and wipes their mouth and carries on.', "{a}'s arm has swollen up tight inside the sleeve."],
  bleeds: ['{m} is bleeding badly.', '{m} leaves a trail behind it now.'],

  // ---- kills ----
  kill_rats: [
    '{a} kills enough of {m} that the rest give up and scatter.',
    '{m} breaks up and flees down the pipes.',
    'There is not much left of {m}, and what there is runs off squealing.',
    '{a} stamps on the slowest of {m}, and the others decide they have business elsewhere.',
  ],
  kill_moths: ['{a} swats the last of {m} out of the air.', "{m} falls apart in a shower of pale powder."],
  kill_grubber: ['{m} drops the pick and does not get up.', '{a} puts {m} down for good.', '{m} goes down and stays down.'],
  kill_eel: ['{m} rolls over in the water, belly up, and sinks.', "{a} finishes {m}. It takes a long time to stop moving."],
  kill_spider: ['{m} curls its legs in and dies.', '{a} splits {m} open and the smell is terrible.'],
  kill_hog: ['{m} goes down with a noise that shakes the silt off the walls.', '{a} gets {m} at last. It falls over and takes a while to finish.'],
  kill_crab: ['{a} cracks {m} open.', "{m}'s legs fold up under it."],
  kill_seep: ['{m} stops moving and goes dull, then hard.', '{a} breaks {m} apart, and the pieces crust over in the air.'],
  kill_engine: ['{m} stops in the middle of a movement and ticks twice. Then it falls over.', "{a} smashes something inside {m}, and it winds down with a long whine."],
  kill_kiln: [
    "{a} breaks the Kiln Engine's firebox, and the fire inside it goes out for the first time in sixty years.",
    'The Kiln Engine stops. It stands there cooling and ticking, and then it falls forward and does not get up.',
  ],
  kill_bleed: ['{m} bleeds out where it stands.', '{m} goes down at last from the bleeding.'],
  fight_won: [
    'It is over. They stand there breathing hard and counting each other.',
    'The last of them goes down. Somebody laughs, too loudly.',
    'It goes quiet again, apart from something dripping.',
    'They wipe the blades on whatever is nearest and count the bandages.',
    'When it is done, somebody\'s hands will not stop shaking, and nobody mentions it.',
    'That is the end of it. Everybody checks their hands for missing fingers.',
    'They win that one. Nobody says anything for a while.',
  ],
  boss_won: [
    "Nobody believes it at first. The Kiln Engine is down, and the Sink is getting colder already.",
    'The Kiln Engine is dead, if an engine can be dead. The squad sits down on the crust, all at once.',
  ],
  foes_withdraw: ['{m} has had enough and backs off into the dark.', '{m} gives up and goes back where it came from.'],

  // ---- going down ----
  down: [
    '{a} goes down and does not get up.',
    '{a} falls. The others close up over them.',
    '{a} hits the stones and lies there.',
    '{a} crumples and somebody drags them back by the collar.',
  ],
  death: [
    '{a} is dead. It was {m}, in the end.',
    '{a} does not get up again. They will be counted among the guild\'s dead, and it was {m} that did it.',
    'They lose {a} to {m}. Somebody keeps pressing on the wound long after there is any point.',
    '{a} dies down here, under the Lower Town. {m} did it.',
  ],
  gets_up: [
    '{a} comes round and gets up very slowly.',
    'Somebody slaps {a} awake. They are alive, though not by much.',
    '{a} gets up on the second try.',
  ],
  gets_up_scar: [
    '{a} gets up again, though not as they were. Jory will write "{s}" next to their name in the roster.',
    '{a} lives. At Saint Oda\'s they will write "{s}" on a chart and tell {a} it is for good.',
    '{a} is alive. The chaplains at home will call it "{s}", and {a} will call it worse.',
  ],
  wipe_death: ['{a} is left behind in Old Pellam.', 'They do not bring {a} back.', '{a} never wakes up.'],

  // ---- fatigue and exposure ----
  dark_room: [
    "In the dark, {a} keeps hearing things behind them.",
    "Somebody's hand brushes {a}'s face in the dark, and nobody admits to it.",
    "Without the lamps they walk with a hand on the shoulder in front. {a} counts steps to stay calm.",
  ],
  oil_out: [
    'The last of the lamp oil gutters out. They go on in the dark.',
    'The lamps go out one by one. Nobody packed enough oil, and now everyone knows it.',
  ],
  no_oil: [
    'There is no lamp oil in the pack. They go into the dark with their hands out in front of them.',
    'Nobody brought oil. The squad goes on in the pitch dark, and the dark is not empty.',
  ],

  // ---- food and camps ----
  meal: [
    'They stop and eat cold bread and hard cheese. {a} says it is the best meal of their life.',
    'They eat sitting on a step with their boots in the wet. Nobody talks much.',
    'They eat standing up. {a} shares an onion, which is generous and unwise.',
    'They share out bread and the end of a sausage. {a} makes theirs last as long as it can.',
  ],
  hungry: [
    'It is time to eat, and there is nothing in the pack. {a} pretends not to be hungry, badly.',
    'The food is gone. They go on with empty stomachs, and tempers shorten.',
    "There is no food left, so {a} chews a strip of leather from their belt to keep busy.",
  ],
  camp_culverts: ['They make camp in a dry cellar where a grate lets a little air down.', 'They camp in an old pump room and wedge the door shut.'],
  camp_streets: [
    "They make camp in a buried house, upstairs, where the silt didn't reach.",
    "They camp in a pawnbroker's, behind a counter that has seen worse.",
  ],
  camp_sink: ['They make camp on a ledge above the spill, where the air is almost clean.', 'They camp in a dead college storeroom, where the shelves glow faintly all night.'],
  camp_hurt: ['They are in no state to go on, so they make camp where they are.', 'Too many of them are hurt. They stop and make camp in the open.'],
  camp_fed: [
    'They eat hot food for the first time in days. {a} sleeps sitting up with the spoon still in hand.',
    'They get a small fire going under a pot. Wounds get looked at, and people sleep where they sit.',
    'They eat and sleep in turns. {a} takes the first watch and does not complain about it.',
  ],
  camp_fed_chaplain: [
    'The chaplain makes everyone eat and cleans every cut, and is the last one to sleep.',
    'There is hot food, and the chaplain goes round everyone with a lamp and a needle. By morning they are in better shape than they deserve.',
  ],
  camp_hungry: [
    'There is nothing to eat. They lie in the dark and listen to each other\'s stomachs.',
    'A camp without food. They rest, but they do not sleep much, and {a} talks about pies until somebody tells them to stop.',
  ],
  camp_visit: ['Something finds the camp in the night.', 'The watch shouts that they have company.'],

  // ---- wanderers ----
  wander_avoided: [
    'They hear {m} coming and get into a doorway until the noise has gone by.',
    'They put their backs to the wall and keep still, and the {m} go by close enough to smell.',
    'Somebody signals, and they wait in the dark while {m} go past.',
    'They take a side passage and leave the {m} to it.',
  ],
  wander_failed: [
    'They try to wait it out, and the {m} find them anyway.',
    'Somebody\'s buckle clinks, and the {m} turn round.',
    'They try to slip past the {m} and get caught in the open.',
  ],
  wander_fight: [
    'They hear {m} ahead and go to meet them.',
    'Something is coming down the passage. The orders are to fight, so they do.',
    '{m} come out of a side tunnel, and the squad goes straight at them.',
  ],

  // ---- traps ----
  trap_unseen: ['Nobody sees it.', 'Nobody notices anything wrong until it is too late.', 'It happens before anyone can shout.'],
  trap_disarm_fail: ['{a} gets the tools on it, then slips.', "{a} is halfway through disarming it when something goes click."],
  trap_tripwire_disarm: ['{a} spots a tripwire at shin height and cuts it, very slowly. A crossbow on the far wall twangs at nothing.', '{a} finds a wire at ankle height and wedges the trigger before stepping over it.'],
  trap_tripwire_around: ['{a} spots a tripwire. Nobody has the tools to make it safe, so they go round by another drain.', '{a} sees the wire but they have nothing to wedge it with. They go the long way.'],
  trap_tripwire_hit: ['A grubber crossbow fires from the wall and the bolt hits {a}.', "{a} catches a wire. The bolt goes in somewhere unpleasant."],
  trap_grate_disarm: ['{a} sees the grate overhead has been loosened and props it with a wedge.', '{a} spots the loosened grate and pins it in place.'],
  trap_grate_around: ['The grate overhead hangs by one rusted bracket. Without tools they detour round it.'],
  trap_grate_hit: ['An iron grate drops out of the roof onto {a}.', 'The grate comes down and catches {a} across the shoulders.'],
  trap_floor_disarm: ['{a} tests the floor ahead with a pole and finds it rotten. They lay planks across.', '{a} spots the bowed boards, and they rope across one at a time.'],
  trap_floor_around: ['{a} sees the floor is rotten. They have nothing to bridge it, so they go round through two other houses.'],
  trap_floor_hit: ['The floor gives way under {a}, who drops into the cellar below.', '{a} falls through the floor and lands on something hard.'],
  trap_gas_disarm: ['{a} smells the pocket of bad air ahead and they rig a cloth over the vent before passing.', '{a} sees the candle flame go blue and they seal the crack with clay.'],
  trap_gas_around: ['The air ahead has gone bad. With nothing to seal it, they go round, the long way.'],
  trap_gas_hit: ['A pocket of bad air bursts out of the crust. {a} breathes it in.', '{a} coughs until they bring something up.'],

  // ---- curiosities ----
  shrine_chaplain: [
    "They find a shrine to Saint Oda in the wall. {a} says the words over it and makes everyone sit down for a while.",
    "{a} cleans the silt off a cellar shrine and says a few words. They all rest their legs while it lasts.",
  ],
  shrine_pass: [
    "A little shrine in the wall, with nobody to say the words. They sit in front of it anyway and rest their legs.",
    "There is a cellar shrine to Saint Oda here, older than the hall upstairs. {a} nods at it, and they stop for a breather.",
  ],
  strongbox_open: [
    "An Assay Office strongbox, sealed in brass. {a} levers it open with the tools.",
    '{a} works the tools into an old Assay strongbox and the lid comes up.',
  ],
  strongbox_smash: ["An Assay strongbox. There are no tools, so {a} smashes it open with a rock. Most of what's inside survives that."],
  strongbox_ruin: ["An Assay strongbox. With no tools, {a} smashes it open, and breaks everything inside it."],
  cache: [
    "{a} spots a grubber's cache behind a loose panel: coin and a bag of dried peas.",
    'A grubber stash under a flagstone. {a} takes the coin and the food, and leaves the dice.',
  ],
  cache_missed: ['There are grubber marks on the wall here, pointing at something. Nobody can work out what.'],
  cart_tools: ["A cart lies on its side in the flood. With a crowbar, {a} gets the strongbox off its bed.", "{a} levers open a drowned cart's chest and finds the silver still in it."],
  cart_bitten: ['{a} reaches into a drowned cart, and something in there bites.', 'There is something in the drowned cart besides silver. It gets {a} by the wrist.'],
  cart_reach: ['{a} reaches into a drowned cart up to the shoulder and comes out with a piece of silver.'],
  still_arcanist: ['An old college still is dripping in a corner. {a} knows what it is and drains two good doses from it.', '{a} reads the labels on a college still and draws off two doses.'],
  still_good: ['There is a college still in the corner, dripping. {a} tastes it, and it turns out to be brandy, more or less.'],
  still_bad: ['{a} tastes what is dripping out of an old college still. It is not brandy.'],

  // ---- turning back and going home ----
  retreat_cautious: ['The orders say turn back when it goes wrong, and it has gone wrong. They turn back.', '{a} calls it. They are going home.'],
  retreat_steady: ['Too many of them are hurt now. They turn round.', "{a} looks at the state of everyone and says it's time. Nobody argues."],
  retreat_stubborn: ['Even the orders have limits. They turn back with what is left of them.', 'Half the squad is down. Stubborn or not, they turn round.'],
  turn_back: ['The climb back up is long, and they keep looking behind them.', 'They retrace their steps, quieter than they came.'],
  climb_back: ['They climb back up toward the Lower Town with full packs.', 'The way back up feels shorter than the way down, which it is not.'],
  home_short: ['They come up out of the Culverts into the Tallow Street evening, filthy and pleased with themselves.', "The grate goes back over the culvert, and the squad goes into the Copper Kettle to be stared at."],
  home_medium: ['Two weeks after they went down, the squad climbs out into daylight. They stand in the street blinking.', 'They come back up out of Pellam. The porters at the top count them, and the count comes out right.'],
  home_long: [
    'Three weeks after they went down, the squad walks into the hall on Tallow Street. Jory writes something in the ledger before he sees who it is, and then looks up again.',
    'They come out of Old Pellam into the light. Somebody has to tell them it is a Tuesday.',
  ],
  home_retreat: ['They are home, which is the main thing.', 'They come up early and empty-handed. The others look at their faces and do not ask.'],
  lost_crawl: ["{a} wakes up in the dark. The squad has been beaten, and those still breathing crawl out of Old Pellam with nothing.", 'When {a} comes round, the fight is long over. They get the survivors back up the rungs somehow.'],
  lost_all: ['Nobody comes back up out of Old Pellam. The porters wait at the grate until dark, and then they go and tell Tallow Street.'],
  lost_home: ['They get within sight of the grate, and then they are caught. Fewer of them come up than went down, and they have less with them.'],
  spent_fumble: [
    "{a} swings the {w} half a second behind everyone else and hits nothing.",
    "{a} is too tired to lift the {w} properly, and it shows.",
    "{a}'s legs go, and they spend the moment getting their feet back under them.",
    "{a} stops to breathe in the middle of the fight, which is a bad place for it.",
  ],
  too_tired: [
    "{a} has nothing left. They lean on the wall and let the others do it.",
    "{a} can barely stand, let alone fight. Somebody keeps them behind the line.",
    "{a} sits down where they are. The fight goes on around them.",
  ],
  spent: [
    "{a} is worn out. Every step is an argument now.",
    "{a} has stopped talking, which means they are saving their breath for walking.",
    "{a} is moving slower than the others and has to be waited for at every corner.",
    "{a}'s boots are full of water and their shoulders are raw from the pack. They are spent.",
  ],
  collapse: [
    "{a} goes down on one knee and doesn't get up. They are carried after that, which slows everyone.",
    "{a}'s legs give out. Two of the others take an arm each, and the squad goes on at half the pace.",
    "{a} has walked as far as they can. From here they are luggage.",
  ],
  second_wind_back: [
    "{a} gets their breath back and picks the {w} up again.",
    "{a} has found a second wind from somewhere.",
    "{a} is walking properly again.",
  ],
  masks_all: [
    "Before they go down into the Sink, everyone soaks a mask and ties it on. They look ridiculous and breathe better.",
    "They put the wet masks on. The air in the Sink still tastes of pennies through the charcoal.",
  ],
  masks_some: [
    "There aren't enough wet masks to go round. The ones without them breathe through their sleeves.",
    "They share out the wet masks. Somebody goes without, and coughs about it the whole way down.",
  ],
  masks_none: [
    "Nobody packed wet masks. They go into the Sink breathing it.",
    "There are no masks, so they tie their scarves over their faces, which does about as much good as you'd expect.",
  ],
  kiln_yard: [
    "The Kiln Engine's yard is still there, and so are the smaller engines that used to feed it. Without the Kiln to answer to, they test whatever walks in.",
    "Where the Kiln Engine stood there is only a scorched floor and two of the college's lesser engines, going about their business.",
  ],
  fever_start: [
    "The Sink gets into {a} all at once. They go hot, then cold, and their hands won't keep still. It's the Sink fever, and it has to run its course.",
    "{a} starts sweating violet. They say they're fine. They are running the Sink fever, and everyone can see it.",
    "{a} goes grey and shivery in the middle of the Sink. The fever has started, and they'll fight worse until it breaks.",
  ],
  fever_room: [
    "{a} is burning up and keeps having to stop.",
    "The fever has {a} talking to people who aren't there.",
    "{a} shivers through another room, teeth chattering.",
  ],
  fever_breaks: [
    "{a}'s fever breaks all at once, and they come out of it different.",
    "{a} stops shaking and sits up, blinking at the others. The fever has done its work.",
    "The fever lets go of {a}, and leaves something behind.",
  ],
  change_take: [
    "{a} is too tired to fight what the Sink is doing to them, so it simply happens.",
    "{a} is worn out, and the Sink takes the shortcut.",
    "There's no fever this time. {a} is too spent to fight the change, so it just comes.",
  ],
  storm_fingers: [
    "A crack of storm jumps from {a}'s hands to {m} before anyone has moved.",
    "{a} flexes their fingers and {m} takes a bolt of storm to open the fight.",
  ],
  change_violet_skin: [
    "Their skin has gone a deep, even violet, and the seeps don't seem to bite it the same way.",
  ],
  change_copper_tongue: [
    "Everything tastes of copper now, and they can tell what's in a still by the smell alone.",
  ],
  change_rat_smell: [
    "The rats have started giving them a wide berth. Nobody can smell anything, but the rats can.",
  ],
  change_slow_stomach: [
    "They say they aren't hungry, and they mean it. They may not be hungry until Thursday.",
  ],
  change_pale_eyes: [
    "Their eyes have gone pale and strange, and the dark doesn't trouble them now.",
  ],
  change_thick_hide: [
    "Their skin has thickened like boiled leather. A knife would have to work at it.",
  ],
  change_quick_blood: [
    "Their blood runs fast and bright now, and a cut closes while you watch it.",
  ],
  change_deep_lungs: [
    "They breathe slow and deep, and the Sink air doesn't catch in their throat any more.",
  ],
  change_reagent_blood: [
    "Their blood has gone half reagent. A drop of it on a blade smokes.",
  ],
  change_iron_bones: [
    "Their bones feel heavier, and they don't bruise. Something in the runoff has gone into the marrow.",
  ],
  change_storm_fingers: [
    "Their fingertips crackle when they rub them together, and the hair on their arms stands up.",
  ],
  change_sink_sense: [
    "They stop and turn their head a moment before anything happens, every time. The Sink has taught them its habits.",
  ],
};
