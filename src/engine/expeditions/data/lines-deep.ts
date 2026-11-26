// Expedition log lines for the deeper zones of the six sites beyond Old Pellam,
// their own monsters and people, and their bosses. Each site is built like Old
// Pellam: a first zone (in lines-sites.ts), two deeper zones and a boss room.
//
// The dive looks a key up as `key:<siteId>`, then `key:<group>`, then plain
// `key`, so `boss_sight:kell` replaces the Kiln Engine's lines on Kell routes.
//
// Placeholders: {a} a member, {b} another member, {t} the member being
// attacked, {m} a monster label (it already has "the", or is a boss's name),
// {g} goods, {n} a count. Writing rules: docs/STORY.md §7. Members are referred
// to by name or "they".

export const DEEP_LINES: Record<string, string[]> = {
  // ===================================================================
  // Varrow: the Quays and the Rookeries, and Rudd's yard
  // ===================================================================
  enter_quays: [
    "They come down the river stairs onto the Quays after dark. The lighters are tied up three deep, and the warehouses have men in the doorways who do not look like warehousemen.",
    "The Quays smell of tar and the river. {a} lights the lamps, and somebody further along puts theirs out.",
    "They go down past the chain-house onto the Quays, where the bonded stores are. Everything here belongs to somebody who is not about.",
  ],
  passage_quays: [
    "They walk along the quay edge between bollards. The river slaps at the steps below, and {a} keeps well away from it.",
    "They pass a row of bonded warehouses, each with the Exchequer's seal on the door and a much newer padlock beside it.",
    "A lighter goes by in the dark with no lamp, close enough to touch. Nobody on it says anything, and nor does {a}.",
    "{a} steps over a sleeping porter who is holding an empty bottle tight against his chest.",
  ],
  room_quays: [
    "They come into a warehouse with its doors propped open, full of crates stencilled for Port Anselm.",
    "The quay opens out into a timber yard, with stacks of planks higher than a house and paths between them.",
    "There is a weighbridge here, and a hut beside it with a light on and nobody inside.",
  ],
  find_quays: [
    "{a} finds {g} behind a stack of crates, put there by someone who meant to come back for it.",
    "In a lighter tied up at the steps, under a tarpaulin, {a} finds {g}.",
    "{a} prises the lid off a crate marked 'NAILS' and finds {g}.",
  ],
  goalroom_quays: [
    "They reach the bonded warehouse the job named. The duty has not been paid, and neither, by the look of them, have the men guarding it.",
    "The bonded warehouse is at the end of the Quays, with a lamp over the door and people under it.",
  ],
  goal_quays: [
    "In the back of the bonded warehouse {a} finds {g}, with a chalk mark on it that probably means somebody's name.",
    "{a} rolls out {g} from behind the bonded racks while {b} keeps an eye on the door.",
  ],
  camp_quays: [
    "They camp in the loft of a sail-maker's shed, among bolts of canvas that smell of the river.",
    "They make camp in an empty lighter under the quay wall, with the river going past a plank away.",
  ],
  sight_lighterman: [
    "{m} stands up in a lighter with a boat hook and asks what they want on this quay.",
    "{m} comes along the quay with a hook over one shoulder. \"Nobody walks here after dark,\" they say, \"except us.\"",
  ],
  sight_footpad: [
    "{m} drops off a warehouse roof in front of them with a knife already out.",
    "Somebody has been walking behind them for a street. {m} stops pretending otherwise.",
  ],
  sight_watch_sergeant: [
    "{m} steps out under a lamp with a stick and a brass badge, and says the street is closed for the evening.",
    "\"Evening,\" says {m}, who has been paid by somebody to say a good deal more than that.",
  ],
  sight_yard_dog: [
    "A chain rattles somewhere in the dark, and then it isn't a chain any more. {m} comes out of a yard at a run.",
    "{m} stands in a warehouse doorway with its head down and a growl going in its chest.",
  ],
  trap_tide_disarm: [
    "{a} notices the steps are wet higher than they should be, and gets everyone up onto the next landing before the river comes up.",
    "{a} reads the waterline on the wall and calls a halt. The tide comes in across the way ahead and goes out again, and they walk on dry.",
  ],
  trap_tide_around: [
    "The river is coming up over the way ahead. With nothing to bridge it, they go round by the long way.",
    "{a} sees the water rising across the path and turns them back. It is a long detour, and their feet still get wet.",
  ],
  trap_tide_hit: [
    "The water comes in faster than anyone expected and knocks {a} off their feet against the stones.",
    "{a} is halfway across when the tide arrives. It is cold, and it is in a hurry.",
    "A surge comes up the steps and drags {a} down two of them before letting go.",
  ],
  'enter_rookeries': [
    "They climb into the Rookeries by a back stair behind the tanneries. The courts are six stories deep, and every window has somebody in it.",
    "The Rookeries start where the street gives up. It is all washing lines and rented rooms, and people stop talking when the squad comes past.",
    "{a} leads them in under an archway into the Rookeries. It is noisy, and it gets quiet in front of them as they go.",
  ],
  passage_rookeries: [
    "They cross a court where six families are cooking on one fire. Nobody looks at them, very hard.",
    "They go up one stair and across a roof and down another stair, because that is the only way through. {a} does not look down.",
    "A child follows them for three courts and then asks for a penny. {a} pays, and the child follows them for three more.",
    "They squeeze through a gap between two houses that lean on each other. {a} has to go sideways.",
  ],
  room_rookeries: [
    "They come into a court with a pump in the middle and doors on every side, all shut.",
    "The stair opens onto a long room under the roof where people sleep in rows. Most of them are pretending to.",
    "They come out into a yard full of handcarts, chained together, and a man who says he is minding them.",
  ],
  find_rookeries: [
    "{a} finds {g} under a loose floorboard in a room whose tenant has not been seen for a while.",
    "Behind a chimney breast on the roof, {a} finds {g}.",
    "{a} buys a bundle off an old woman for a few pennies without asking what is in it. It is {g}.",
  ],
  goalroom_rookeries: [
    "They reach the far side of the Rookeries, where the courts back onto the town wall. People are waiting for them there.",
    "The last court in the Rookeries has one way in and one way out, and somebody is standing in both.",
  ],
  goal_rookeries: [
    "In a locked room off the last court {a} finds {g}, stacked under the bed with a blanket over it.",
    "{a} goes through the back room of the yard and comes out with {g}. {b} carries the lamp and pretends not to see anything else.",
  ],
  camp_rookeries: [
    "They rent a room in the Rookeries for the night, at a price that would buy the room in Tallow Street.",
    "They camp on a flat roof with their backs to a chimney. The whole Rookeries is snoring below them.",
  ],
  // the boss
  'boss_sight:varrow': [
    "Rudd's yard is behind a high gate in the deepest court of the Rookeries. Lew Rudd is sitting in it on an upturned barrel, and he does not get up until the dogs are loose.",
    "Lew Rudd comes out of his office into the yard wiping his hands. \"You're the guild,\" he says. \"I've hired your sort. You're dear.\"",
  ],
  rudd_hit: [
    "Lew Rudd hits {t} with a fist the size of a ham.",
    "Lew Rudd gets {t} by the collar and puts them into a barrel.",
    "Lew Rudd swings a cudgel into {t}'s ribs and grunts with satisfaction.",
  ],
  rudd_miss: [
    "Lew Rudd swings at {t} and hits the gatepost, which he will feel tomorrow.",
    "{t} ducks under Lew Rudd's arm. He is big, and he is slow about it.",
  ],
  rudd_crit: ["Lew Rudd picks {t} up off the ground and throws them across the yard."],
  kill_rudd: [
    "Lew Rudd goes down on the cobbles of his own yard and stays there. Somebody's dog licks his face.",
    "Lew Rudd sits down hard against the wall and says that he is out of the trade as of now.",
  ],
  'boss_won:varrow': [
    "Rudd's yard is quiet. His office is full of ledgers, and every one of them has names in it that the Lower Town will be glad to see burned.",
    "The fight is over. Lew Rudd's men have gone over the wall, and the dogs have gone with them.",
  ],
  rudd_after: [
    "Rudd's yard has new tenants. The men who used to work for Lew Rudd are working for themselves, and they are worse at it.",
    "Somebody has taken over Rudd's yard and painted over his name on the gate. They still keep dogs.",
  ],

  // ===================================================================
  // Kell Mines: the Sump and the Trevick level, and Gaffer Moyle
  // ===================================================================
  enter_sump: [
    "They climb down a ladder into the Sump. The water is at their knees at the bottom, and it gets colder as they go.",
    "The pumps that kept the lower galleries dry gave out the year after the war. They wade into the Sump with the lamps held high.",
    "{a} tests the water at the bottom of the shaft with one boot and says something the others agree with.",
  ],
  passage_sump: [
    "They wade along a drowned gallery with the roof a hand's breadth above the lamps. {a} hums to keep their teeth from chattering.",
    "The water drops away for a stretch and the floor is mud instead. Nobody thinks this is better.",
    "They pass an old pump, still fixed to the wall, with a nest of something in the workings.",
    "Something moves past {a}'s legs in the water and keeps going. They do not mention it until later.",
  ],
  room_sump: [
    "The gallery opens into a flooded chamber where the miners used to stable the ponies. The stalls are still there.",
    "They come out into a dry pocket where somebody has made a bed of sacks. It has been slept in this week.",
    "They come to a junction of four galleries, all flooded, with a ladder going up into the dark.",
  ],
  find_sump: [
    "{a} feels along the bottom of a flooded cut and comes up with {g}.",
    "In an ore wagon tipped on its side in the water, {a} finds {g}.",
    "{a} finds {g} on a shelf above the waterline, where a miner left it twenty years ago and meant to come back.",
  ],
  goalroom_sump: [
    "They reach the drowned pump house the job named. The great beam engine is still there, rusted solid, and somebody is living in its boiler.",
    "The pump house is at the bottom of the Sump. The water here is up to the chest, and there are people standing in it.",
  ],
  goal_sump: [
    "Under the beam of the old pump engine {a} finds {g}, stacked where the water can't reach.",
    "{a} wades out of the pump house with {g} held above their head.",
  ],
  camp_sump: [
    "They camp on a ledge above the water in the old stables, on dry straw that is twenty years old.",
    "They make camp in a side gallery the water never reached. It drips, but it drips slowly.",
  ],
  sight_pit_pony: [
    "{m} comes out of the dark with its ears back and its teeth showing. It has not seen daylight in years, and it hasn't missed it.",
    "There is a pony down here, shaggy and gray with dust. {m} looks at the squad's packs, and then at the squad, and charges.",
  ],
  sight_powder_man: [
    "{m} lights a fuse off a candle, looks up and sees them, and thinks about it.",
    "{m} has a bag over one shoulder that hisses. \"Back off,\" they say, \"or I'll show you what's in it.\"",
  ],
  enter_trevick: [
    "They climb up into the Trevick level, the old silver gallery. The walls shine where the lamps catch them.",
    "The Trevick level was cut by a mine captain who died rich. The vein runs along the wall at shoulder height, and it is still there.",
    "{a} puts a hand on the wall of the Trevick level and it comes away gray and glittering.",
  ],
  passage_trevick: [
    "They walk along the silver gallery past fresh pick marks. Somebody has been working this vein all week.",
    "The gallery is lit here, with candles in niches, and somebody keeps them trimmed.",
    "There is a chalk line across the floor with MOYLE written beside it. {a} steps over it.",
    "They pass a row of picks hung on the wall, each with a name burned into the handle.",
  ],
  room_trevick: [
    "They come into a wide working where the vein bulges, with a windlass and a pile of sacks waiting to go up.",
    "The gallery opens into the old captain's office, cut into the rock, with a desk and a portrait gone black with damp.",
    "They come out onto a ledge above a shaft, where the claim-jumpers lower their sacks.",
  ],
  find_trevick: [
    "{a} finds {g} in a sack at the bottom of the windlass, tied and waiting.",
    "{a} takes a pick to the vein for a few minutes and comes away with {g}.",
    "In the old captain's desk {a} finds {g} and a letter to his wife that was never sent.",
  ],
  goalroom_trevick: [
    "They reach the end of the Trevick level, where the vein goes into the rock and the miners stopped following it. Somebody else has started.",
    "The far end of the Trevick level is a working face, and it is being worked. The people working it put their picks down.",
  ],
  goal_trevick: [
    "At the working face {a} finds {g}, already bagged for somebody else to carry out.",
    "{a} goes through the claim-jumpers' store at the end of the level and comes out with {g}.",
  ],
  camp_trevick: [
    "They camp in Trevick's old office, with the portrait watching. {b} turns it to the wall.",
    "They make camp in a dead working off the silver gallery. The walls glitter all night, and nobody can sleep for looking at them.",
  ],
  'boss_sight:kell': [
    "At the end of the Trevick level Gaffer Moyle sits in a carved chair with a keg of powder beside it. He has been expecting somebody for six years.",
    "Gaffer Moyle stands up from his chair at the working face. \"This vein's mine,\" he says. \"I found it. I've got the powder to prove it.\"",
  ],
  moyle_hit: [
    "Gaffer Moyle hits {t} with a pick handle that has done this before.",
    "Gaffer Moyle throws a lump of ore at {t}'s head, and it is a big lump.",
    "Gaffer Moyle gets in close and puts a knee into {t}.",
  ],
  moyle_miss: [
    "Gaffer Moyle swings at {t} and buries his pick in his own vein.",
    "{t} steps back, and Gaffer Moyle's swing goes past their nose.",
  ],
  moyle_crit: ["Gaffer Moyle brings the pick handle down on {t} with six years of temper behind it."],
  blast_moyle: [
    "{m} lights a fuse and rolls a powder bag down the gallery. The blast takes everybody off their feet.",
    "{m} throws a lit charge and gets behind his chair. The gallery fills with smoke and flying rock.",
  ],
  blast_powder_man: [
    "{m} lobs a charge into the middle of the squad. Rock and smoke fly everywhere.",
    "{m} lights a powder bag and throws it, and for once the aim is good.",
  ],
  kill_moyle: [
    "Gaffer Moyle sits down in his chair and does not get up again. The candle beside him is still burning.",
    "Gaffer Moyle drops his pick and says the vein can go to whoever wants it. Then he runs.",
  ],
  'boss_won:kell': [
    "The Trevick level is quiet except for the dripping. The vein shines along the wall, and it belongs to somebody who isn't here.",
    "It is over. The claim-jumpers have gone up the ladder, and Gaffer Moyle's chair is empty.",
  ],
  moyle_after: [
    "Moyle's chair is still at the end of the Trevick level. New claim-jumpers have moved in, and one of them is sitting in it.",
    "Somebody has taken over Moyle's working. They have not found his powder yet, and they are looking.",
  ],

  // ===================================================================
  // The Saltfens: the Pans and the Withies, and the Dean
  // ===================================================================
  enter_pans: [
    "The reeds stop and the Pans begin. There are low mud walls around square ponds of brine, with a white crust over everything, and nothing at all between the squad and the sky.",
    "They come out onto the salt pans. The light is flat and white, and {a} has to squint to see the far wall.",
    "The Pans go on for a mile, with boiling huts along the edge and smoke rising from some of them.",
  ],
  passage_pans: [
    "They walk along the top of a pan wall with brine on both sides. The crust crunches under their boots.",
    "{a} licks a finger and touches the crust, and then wishes they hadn't.",
    "They pass a boiling hut with a fire going under a great iron pan, and nobody tending it.",
    "The wind comes across the Pans with salt in it. Everybody's lips crack by the second wall.",
  ],
  room_pans: [
    "They come to a crossing of four pan walls, with a sluice gate and a hut beside it.",
    "The walls open out onto a wide pan that has been raked into heaps, ready for carting.",
    "They reach a boiling house with a tall chimney and a door hanging off its hinges.",
  ],
  find_pans: [
    "{a} finds {g} stacked in a boiling hut and waiting for a buyer.",
    "On a cart with a broken wheel, {a} finds {g}.",
    "{a} pokes about in the heaps on a raked pan and comes up with {g}.",
  ],
  goalroom_pans: [
    "They reach the old boiling house the job named, at the far end of the Pans. The fires under its pans are lit, and somebody is feeding them.",
    "The boiling house is at the end of the last pan wall. People are standing in its door, some with the violet skin the pans give anyone who stays out long enough, and they want to know what the squad is doing on their pans.",
  ],
  goal_pans: [
    "In the drying loft of the boiling house {a} finds {g}, stacked to the rafters.",
    "{a} loads {g} out of the boiling house while {b} keeps the fire from going out, for no good reason.",
  ],
  camp_pans: [
    "They camp in a boiling hut with the fire lit under the pan. It is warm, and everything tastes of salt in the morning.",
    "They make camp in the lee of a pan wall, out of the wind. {a} keeps watch and watches the stars, because there is nothing else to watch.",
  ],
  trap_brine_disarm: [
    "{a} sees that the crust ahead is too thin to stand on, and lays a plank across before anyone tries.",
    "{a} spots a soft patch in the crust where the brine is just underneath, and they all step round it.",
  ],
  trap_brine_around: [
    "The crust ahead has gone soft over deep brine. With nothing to bridge it, they go the long way round the pan.",
    "{a} prods the crust and it gives. They go back to the last wall and find another way across.",
  ],
  trap_brine_hit: [
    "The crust breaks under {a}, who goes into the brine up to the chest. It gets into every cut they have.",
    "{a} goes through the salt crust into a pit of hot brine and comes out screaming and white to the waist.",
    "The pan wall crumbles, and {a} slides down into the brine. It stings worse than it looks.",
  ],
  enter_withies: [
    "The Pans run out into the Withies, willow beds cut through by deep channels where the fens meet the river.",
    "They go into the Withies by a plank bridge. You can see about as far as the next willow, and the next willow is close.",
    "The willows close in around them. The water in the channels is brown and quick, and nobody wants to fall in.",
  ],
  passage_withies: [
    "They follow a path of cut willow laid over the mud. It moves under their feet like something breathing.",
    "A heron gets up out of the channel beside them and frightens {a} half to death.",
    "They cross a channel on a fallen willow. {a} goes first, on hands and knees, and nobody laughs.",
    "The path splits three ways around a stand of willow, and {a} picks the middle one for no reason they can give.",
  ],
  room_withies: [
    "They come into a clearing where the willows have been cut back for the wood, with bundles stacked to dry.",
    "The path comes out at a punt landing with a rope across the channel and no punt.",
    "They reach an island of solid ground, with a fowler's hide on it built of reeds and mud.",
  ],
  find_withies: [
    "{a} finds {g} growing along a channel bank, and cuts it with care.",
    "In a fowler's hide, under a heap of decoys, {a} finds {g}.",
    "{a} pulls {g} out of the mud at the edge of the channel, where somebody dropped it.",
  ],
  goalroom_withies: [
    "They come through the Withies to where they open out onto the river. The far bank is good farmland, and something is wallowing between them and it.",
    "The Withies end at the river's edge. There is a wide mud wallow there, and it is in use.",
  ],
  goal_withies: [
    "In the wallow, where the boar has rooted up the bank, {a} finds {g}.",
    "{a} wades out into the trampled reeds and comes back with {g}. {b} says they smell of boar, which is true.",
  ],
  camp_withies: [
    "They camp on an island of hard ground among the willows, and light a fire that the damp keeps trying to put out.",
    "They make camp in a fowler's hide, close together because there is no other way. {a} snores.",
  ],
  sight_leeches: [
    "{a} looks down. {m} has come up out of the channel and is going up their boots.",
    "The water at the edge of the channel starts to move, and {m} comes out of it.",
  ],
  sight_fowler: [
    "{m} rises out of a hide with a punt gun as long as a man and points it at the squad, which is a lot of gun for a duck.",
    "\"These are my beds,\" says {m}, coming out of the willows with a fowling gun. \"Go and shoot your own ducks.\"",
  ],
  'boss_sight:saltfens': [
    "The Dean is lying in the wallow at the end of the Withies. It gets up, and it keeps getting up. It is the size of a cart.",
    "Something the size of a cart heaves itself out of the mud and turns to face them. The cutters were right about the likeness.",
  ],
  dean_hit: [
    "The Dean gets its tusks under {t} and throws them into the reeds.",
    "The Dean drives a shoulder into {t}, and it is a great deal of shoulder.",
    "The Dean hooks {t} with one yellow tusk and opens them up.",
  ],
  dean_miss: [
    "The Dean charges at {t} and goes past into the willows, taking three of them with it.",
    "{t} jumps aside, and the Dean plows into the mud where they were standing.",
  ],
  dean_crit: ["The Dean tramples {t} into the mud and stands on them for a while."],
  kill_dean: [
    "The Dean goes down on its knees in the wallow, and then all the way. The ground shakes when it lands.",
    "The Dean gives one last heave and lies still in the mud it has lived in for twenty years.",
  ],
  'boss_won:saltfens': [
    "The Dean is dead. The Withies are very quiet, and then the frogs start up again.",
    "It is over. {a} sits down on the Dean, because it is the only dry thing in sight.",
  ],
  dean_after: [
    "The Dean's wallow has new tenants. Its sons are smaller, and there are two of them.",
    "Something else has moved into the Dean's wallow. It is smaller, and it is very keen to prove itself.",
  ],

  // ===================================================================
  // Drover's Road: Brannock Moor and Skell Gap, and Sergeant Crewe
  // ===================================================================
  enter_brannock: [
    "The road climbs out of the valley onto Brannock Moor. It is heather and standing water as far as anyone can see, and the wind comes from all sides.",
    "They come up onto the moor. The road is a line of stones across the heather, with a cairn every mile or so.",
    "Brannock Moor opens out ahead, brown and very wide. {a} says it is beautiful. Nobody else has the breath to agree.",
  ],
  passage_brannock: [
    "They follow the line of stones across the heather. A curlew calls somewhere and doesn't call again.",
    "They pass the bones of a cow by the road, picked clean. {a} counts the ribs and comes up two short.",
    "The road dips into a peat hag, and they wade through black water to the knees.",
    "A drover's dog runs alongside them for a mile, and then goes back the way it came without a word.",
  ],
  room_brannock: [
    "They come to a sheepfold of piled stone, with a gate made of a bed frame.",
    "The road crosses a beck by a ford of flat stones, with a shepherd's hut on the far side.",
    "They reach a ring of old stones on a rise, with the whole moor laid out below.",
  ],
  find_brannock: [
    "{a} finds {g} caught on the heather where a flock went through.",
    "In a shepherd's hut, under a sack, {a} finds {g}.",
    "{a} finds {g} tied up in a bundle behind a wall, where a reiver meant to come back for it.",
  ],
  goalroom_brannock: [
    "They reach the standing cairn the job named, in the middle of Brannock Moor. There are cattle penned behind it that do not belong to whoever is guarding them.",
    "The standing cairn is a heap of stones taller than a house. People are camped in the lee of it, and they get up.",
  ],
  goal_brannock: [
    "In the lee of the standing cairn {a} finds {g}, bundled for carrying.",
    "{a} goes through the reivers' camp by the cairn and comes back with {g}.",
  ],
  camp_brannock: [
    "They camp in a sheepfold, with the wall to keep the wind off. It doesn't.",
    "They make camp in a shepherd's hut. The shepherd isn't in, and he has left a note saying not to eat the cheese.",
  ],
  sight_reiver: [
    "{m} comes over the wall with a cudgel and a bag, and the bag is for whatever the squad has.",
    "\"That's a fine pack,\" says {m}, coming up out of the heather. \"My cousin's got one like that. Used to.\"",
  ],
  sight_moor_bull: [
    "{m} lifts its head out of the heather. It is a red, shaggy animal the size of a hay cart, and it does not like the look of anybody.",
    "There is a bull standing in the road. {m} lowers its head, and the horns go wide enough to take two of them at once.",
  ],
  trap_stampede_disarm: [
    "{a} hears the cattle before they come over the rise, and gets everyone behind a wall in time.",
    "{a} sees the herd start to move and waves the squad up onto a rock. The cattle go past on both sides.",
  ],
  trap_stampede_around: [
    "There is a herd spooked and milling across the road. They give it a wide berth, and it costs them an hour.",
    "{a} sees the cattle starting to run and turns the squad back the way they came, the long way round.",
  ],
  trap_stampede_hit: [
    "A herd comes over the rise at a run, and {a} is in the way of it.",
    "Somebody has spooked the cattle. {a} goes under the hooves before they can get clear.",
    "A heavy red cow runs straight over {a} and does not slow down.",
  ],
  'trap_collapse_disarm:drovers': [
    "{a} sees the scree above the road start to slide and gets them all under an overhang before it comes down.",
    "{a} spots a boulder balanced on the slope above, and they wedge it before anyone walks under it.",
  ],
  'trap_collapse_around:drovers': [
    "The scree above the road looks ready to go. With nothing to make it safe, they climb round by a sheep track.",
    "{a} sees loose rock all the way up the slope and takes them the long way, round the far side of the gap.",
  ],
  'trap_collapse_hit:drovers': [
    "The scree slides, and a boulder the size of a sheep comes down on {a}.",
    "Rocks come bouncing down the slope. One of them finds {a}.",
    "The road gives way under {a}, and they go down the slope with half of it.",
  ],
  enter_skell: [
    "The road goes up into Skell Gap between two scree slopes, and at the narrowest point there is the old Crown toll house with smoke coming out of it.",
    "They climb into the pass. The wind comes through it hard, and the slopes on either side are gray and loose.",
    "Skell Gap is the top of the Drover's Road. {a} looks back over the moor and says it was further than it looked.",
  ],
  passage_skell: [
    "They climb the road through the pass, past a cairn with a soldier's helmet on top.",
    "The wind is so strong in the gap that they walk bent over, holding onto each other.",
    "They pass a camp fire that is still warm, with a great many boot prints in the ash.",
    "There is an empty sentry post here, built of piled stones. Somebody has carved NINTH into the lintel.",
  ],
  room_skell: [
    "They come to a stretch of the road where the slopes close in. Somebody has piled stones across it to make a wall.",
    "The road opens into a hollow where the drovers used to rest their herds. There are tents in it.",
    "They reach an old Crown milestone with the distances to Varrow chiseled off and something else written over them.",
  ],
  find_skell: [
    "{a} finds {g} in a soldier's pack left by the road.",
    "Under the cairn with the helmet on it, {a} finds {g}.",
    "{a} goes through an empty tent and comes out with {g}.",
  ],
  goalroom_skell: [
    "They reach the top of Skell Gap, where the road starts down the other side. The deserters have put a barrier across it, and they are behind it.",
    "The top of the pass is held. There is a barrier across the road, and people behind it with spears.",
  ],
  goal_skell: [
    "Behind the barrier {a} finds {g}, the takings of a season's tolls.",
    "{a} goes through the deserters' stores at the top of the pass and finds {g}.",
  ],
  camp_skell: [
    "They camp in the lee of a boulder in the pass, with the wind going over the top of it all night.",
    "They make camp in the old sentry post with the NINTH over the door. {a} sleeps with a hand on their weapon.",
  ],
  'boss_sight:drovers': [
    "The old toll house at Skell Gap has the Ninth's colors over the door. Sergeant Abner Crewe comes out under them with his men and asks for the toll.",
    "Sergeant Crewe is waiting at the toll house with a pike and twenty years in the Ninth. \"Toll's a crown a head,\" he says. \"Or you can turn round.\"",
  ],
  crewe_hit: [
    "Sergeant Crewe gets his pike through {t}'s guard with a thrust straight off the drill square.",
    "Sergeant Crewe hits {t} with the butt of his pike and then with the point.",
    "Sergeant Crewe steps in and catches {t} under the arm.",
  ],
  crewe_miss: [
    "Sergeant Crewe thrusts at {t} and misses, and swears at himself the way he used to swear at recruits.",
    "{t} knocks the pike aside, and Sergeant Crewe steps back into line.",
  ],
  crewe_crit: ["Sergeant Crewe drives his pike into {t} with all twenty years of the Ninth behind it."],
  kill_crewe: [
    "Sergeant Crewe goes down under the colors he carried away. His men put their spears on the ground.",
    "Sergeant Crewe drops his pike and sits on the toll house step. \"That's that, then,\" he says, and he doesn't get up.",
  ],
  'boss_won:drovers': [
    "The toll house at Skell Gap is taken. The colors are still over the door, torn and faded, and {a} takes them down.",
    "It is over. The deserters are walking down the far side of the pass, and none of them looks back.",
  ],
  crewe_after: [
    "The toll house at Skell Gap has tenants again. They used to stand behind Sergeant Crewe, and they charge his toll without him.",
    "Somebody has rebuilt the barrier at Skell Gap. Crewe's men have come back without him, and they are less polite about it.",
  ],

  // ===================================================================
  // Harrowmere: the bridge houses and the Holms, and the Bailiff
  // ===================================================================
  enter_bridge: [
    "They go out along the old bridge, between the houses built on it. The middle span fell twenty years ago, and when the road was carried over on timber the houses were left as they stood.",
    "The bridge houses are dark, with nailed shutters and doors that open onto the water. {a} lights the lamps.",
    "They step onto the old bridge. The boards creak under them, and the houses lean in over the road from both sides.",
  ],
  passage_bridge: [
    "They walk the bridge road between the houses. Every board in it has an opinion.",
    "{a} looks through a gap in the floor and sees the mere going past, black and quick, a long way down.",
    "They go through a house because the road is blocked. There is still a table laid in it.",
    "A shutter bangs in the wind behind them, and {a} draws their weapon on it.",
  ],
  room_bridge: [
    "They come into a chandler's shop on the bridge, with the stock still on the shelves and the floor half gone.",
    "The road opens into a little square on the bridge, with a well in the middle that goes straight down to the mere.",
    "They reach a house with its back wall gone, open to the water and the wind.",
  ],
  find_bridge: [
    "{a} finds {g} in a cellar under a bridge house, above the water.",
    "In a locked cupboard in the chandler's, {a} finds {g}.",
    "{a} fishes {g} out from under the floorboards with a boat hook.",
  ],
  goalroom_bridge: [
    "They reach the timber span over the gap. The last stone house before it is full of smugglers' cargo, and smugglers.",
    "The last house before the timber span has a light in it and a boat tied up underneath. People come out of it.",
  ],
  goal_bridge: [
    "In the last house on the bridge {a} finds {g}, stacked ready to lower to a boat.",
    "{a} goes through the smugglers' store by the timber span and comes out with {g}.",
  ],
  camp_bridge: [
    "They camp in a bridge house with the door barred. The water is loud under the floor all night.",
    "They make camp in a sail loft at the top of a bridge house. {b} sleeps by the window, where they can see the shore.",
  ],
  'trap_floor_disarm:harrowmere': [
    "{a} tests the floor ahead and finds it rotten through. They lay a plank across before anyone steps on it.",
    "{a} notices the boards are soft and gray and gets everyone to walk on the joists.",
  ],
  'trap_floor_around:harrowmere': [
    "The floor ahead is rotten. With nothing to bridge it, they go back and find another way round, through the house next door.",
    "{a} pokes the floor and a board falls through into the mere. They go round.",
  ],
  'trap_floor_hit:harrowmere': [
    "The floor gives way under {a}, who drops through into the mere and comes up gasping.",
    "{a} goes through the boards up to the waist and hangs there over the water.",
    "A whole floor falls into the mere with {a} on it.",
  ],
  sight_night_boatman: [
    "A boat comes out of the dark with muffled oars. {m} stands up in it with a cudgel.",
    "{m} climbs up out of a boat under the bridge and asks the squad if they are lost. It is not a kind question.",
  ],
  sight_crayfish: [
    "Something clicks in the dark under the bridge. {m} comes up out of the water, claws first.",
    "{m} crawls out of a drain, the size of a cat and the color of mud.",
  ],
  enter_holms: [
    "They take a punt out to the Holms, the islands in the middle of the mere. The water around them is the deepest anyone has sounded.",
    "The Holms come out of the mist one at a time, all alder and reed, with a ruined chapel on the nearest.",
    "{a} poles them out to the first of the Holms. The water under the punt is black and goes down a long way.",
  ],
  passage_holms: [
    "They wade from one island to the next across a bar of gravel. {a} says the water is cold enough to stop a heart.",
    "They walk along the shore of an island, under alder trees full of cormorants.",
    "The path goes past a ruined chapel with no roof. Somebody has been sleeping in it.",
    "Something big turns over in the water beside the island and goes down again.",
  ],
  room_holms: [
    "They come into the ruins of a chapel on the largest island, with nets drying on the walls.",
    "The island opens into a clearing with a fish trap built across the channel.",
    "They reach a landing stage with three boats tied up and nobody in them.",
  ],
  find_holms: [
    "{a} finds {g} sticking out of the mud at the island's edge, where the water has been working at it for centuries.",
    "In the chapel ruins, under the altar stone, {a} finds {g}.",
    "{a} pulls {g} out of a smugglers' cache on the far side of the island.",
  ],
  goalroom_holms: [
    "They reach the far Holms, where the deepest water lies. The fishermen do not come out this far, and the people here are not fishermen.",
    "The last island in the mere has a fire on it and a boat drawn up, and its owners are waiting.",
  ],
  goal_holms: [
    "On the last island {a} finds {g}, hidden in a hollow tree.",
    "{a} wades out to a sunken boat off the far Holms and comes back with {g}.",
  ],
  camp_holms: [
    "They camp in the ruined chapel, with a fire in the nave. The wind comes through the windows and nobody minds.",
    "They make camp on the largest island, under the alders. {a} keeps watch on the water. Twice in the night something turns over out there, close to the shore.",
  ],
  'boss_sight:harrowmere': [
    "The water off the far Holms goes very still, and then something comes up under it, longer than the punt. The Bailiff has come for its share.",
    "A shape moves in the deep water off the island, as long as a boat. The fishermen said it would come, and it has.",
  ],
  bailiff_hit: [
    "The Bailiff comes out of the water and takes {t} by the leg.",
    "The Bailiff hits {t} with its tail and knocks them flat on the shingle.",
    "The Bailiff gets its teeth into {t} and drags them toward the water.",
  ],
  bailiff_miss: [
    "The Bailiff lunges at {t} and gets a mouthful of shingle instead.",
    "{t} jumps back, and the Bailiff's jaws close on nothing.",
  ],
  bailiff_crit: ["The Bailiff gets {t} in its jaws and shakes them hard."],
  kill_bailiff: [
    "The Bailiff thrashes in the shallows and then lies still, half out of the water. It is longer than anybody's boat.",
    "The Bailiff rolls over and shows its white belly to the sky. Harrowmere will be talking about this for a hundred years.",
  ],
  'boss_won:harrowmere': [
    "The Bailiff is landed. It takes all of them to drag it up onto the island, and {a} has to sit down afterwards.",
    "It is over. The mere is calm, and for the first time in living memory nothing is taking its share.",
  ],
  bailiff_after: [
    "The water off the far Holms is still deep, and the pike in it are getting bigger. One of them is already taking a share.",
    "Something else has moved into the Bailiff's water. It is not as big yet, and it is working on it.",
  ],

  // ===================================================================
  // Port Anselm: the Burrows and the Strand, and Mags Tull
  // ===================================================================
  enter_burrows: [
    "They leave the road and go into the Burrows, which are miles of dunes and marram grass with the ribs of old ships sticking out of the sand.",
    "The road runs out into soft sand at the edge of the Burrows. The wind is full of it, and {a} is already shaking it out of a boot.",
    "They climb the first dune and see the Burrows laid out to the sea, with the wrecks along the beach like the bones of animals.",
  ],
  passage_burrows: [
    "They walk along the bottom of a dune, out of the wind. It is very quiet there, apart from the sea.",
    "They cross a slack of wet sand between dunes where somebody has been digging.",
    "{a} finds a lantern on a pole stuck in the top of a dune, facing the sea. It has been lit recently.",
    "Rabbits run in front of them all the way across the dune, and {a} is too tired to chase any of them.",
  ],
  room_burrows: [
    "They come into a hollow in the dunes with a hut built of ship's timbers.",
    "The dunes open onto the beach, where the wreck of a ship lies on its side with the tide around it.",
    "They reach a dune top with a lookout post on it, built of driftwood, with a view down the whole coast.",
  ],
  find_burrows: [
    "{a} digs in the sand beside a wreck and comes up with {g}.",
    "On the strand line, among the weed and the rope, {a} finds {g}.",
    "{a} finds {g} buried in a hut made of ship's timbers.",
  ],
  goalroom_burrows: [
    "They reach the wreck on the point that the job named. It is a big ship, broken in two, and somebody is taking it apart.",
    "The wreck on the point is full of people with crowbars, who stop working when the squad comes down the dune.",
  ],
  goal_burrows: [
    "In the hold of the wreck on the point {a} finds {g}, still dry.",
    "{a} climbs into the broken stern of the wreck and comes out with {g}.",
  ],
  camp_burrows: [
    "They camp in the lee of a dune with a driftwood fire. The sea is loud all night, and {a} says it is a comfort, and nobody believes them.",
    "They make camp in the hut of ship's timbers. It smells of tar and the people who built it.",
  ],
  sight_wrecker: [
    "{m} comes over the dune with a crowbar and a lantern, and sizes the squad up for salvage.",
    "\"This beach is taken,\" says {m}, stepping out from behind a wreck. \"Whatever washes up on it is ours, and you've washed up.\"",
  ],
  sight_gulls: [
    "{m} drops out of the sky onto the squad's packs, all screaming at once.",
    "{m} has been following them since the road. Now the gulls come down, beaks first, for the food.",
  ],
  enter_strand: [
    "They come into Port Anselm along the Strand: customs sheds, rope walks, Ostrander's warehouses and the bank's ships out beyond the bar.",
    "The Strand is the port's waterfront, a mile of sheds and warehouses. Everything here has a number painted on it, and somebody is counting.",
    "They walk onto the Strand. {a} sees the bank's ships riding at anchor and says they are bigger than they look in Varrow.",
  ],
  passage_strand: [
    "They walk along the waterfront past the customs sheds. A clerk at a window writes something down about them.",
    "They go down a rope walk, a shed a quarter of a mile long with a rope being laid in it, slowly.",
    "They pass a warehouse with Ostrander's mark on the door and a guard on the roof.",
    "{a} buys a fried fish from a stall and is charged a duty on it.",
  ],
  room_strand: [
    "They come into a customs yard full of crates waiting for their duty to be paid.",
    "The Strand opens into the fish market, empty at this hour, with gulls on every stall.",
    "They reach the end of a pier, with a crane on it and the ships moored close enough to read their names.",
  ],
  find_strand: [
    "{a} finds {g} in a crate in the customs yard that has been waiting a long time for somebody to claim it.",
    "Under a pile of nets on the pier, {a} finds {g}.",
    "{a} pays a man in a doorway for {g}, and does not ask where he got it.",
  ],
  goalroom_strand: [
    "They reach the end of the Strand, past the last shed, where the dunes come down to the sea. There are lanterns there, and people holding them.",
    "The end of the Strand is a slipway down to the water, and somebody is waiting on it.",
  ],
  goal_strand: [
    "At the end of the Strand {a} finds {g}, hidden under a boat turned upside down.",
    "{a} goes through a shed at the end of the Strand and comes out with {g}.",
  ],
  camp_strand: [
    "They camp in an empty net loft above the fish market. It smells of fish, and so do they by morning.",
    "They rent a room at an inn on the Strand, all of them in one bed, and nobody sleeps.",
  ],
  sight_tidewaiter: [
    "{m} steps out of a customs shed with a lantern and a ledger, and asks for their papers. They have none that would help.",
    "\"Nobody goes past here without the bank's say-so,\" says {m}, and calls for the others.",
  ],
  'boss_sight:anselm': [
    "Mags Tull's cove is at the end of the Strand, where the Burrows come down to the sea. She is standing on the beach with the false lantern in one hand, and she waves with the other.",
    "The wreckers' cove is full of cargo from a dozen ships. Mags Tull comes out from behind it with a hook, and her people come with her.",
  ],
  tull_hit: [
    "Mags Tull gets {t} with her hook and pulls them off their feet.",
    "Mags Tull swings a wrecker's crowbar into {t}'s ribs.",
    "Mags Tull kicks sand in {t}'s face and cuts them while they are blinking.",
  ],
  tull_miss: [
    "Mags Tull swings her hook at {t} and catches nothing but sea air.",
    "{t} steps back, and Mags Tull's hook buries itself in a cask of brandy.",
  ],
  tull_crit: ["Mags Tull hooks {t} by the belt and drags them into the surf."],
  kill_tull: [
    "Mags Tull goes down on her own beach and does not get up. Her lantern is still burning on the rock.",
    "Mags Tull drops her hook and walks into the sea up to her waist, and then she swims for it. Nobody follows.",
  ],
  'boss_won:anselm': [
    "The cove is taken. {a} blows out Mags Tull's lantern, and the coast is dark for the first time in years.",
    "It is over. The wreckers are gone back into the Burrows, and the cove is full of other people's cargo.",
  ],
  tull_after: [
    "Mags Tull's cove has new tenants. Somebody has lit her lantern again, and they are not as good at it.",
    "The wreckers have come back to the cove without Mags Tull. They argue about who gets to hold the lantern.",
  ],
  wreck_tools: [
    "There is a wreck half buried in the sand. {a} gets the crowbar into the hold and opens it up.",
    "{a} prises the planks off a wreck's hold with the tools and climbs in. They come out with something worth having.",
  ],
  wreck_reach: [
    "{a} reaches into the broken hold of a wreck as far as their arm will go, and comes out with a purse.",
    "There is a wreck here with a hole in its side. {a} crawls in and finds something somebody missed.",
  ],
  wreck_empty: [
    "There is a wreck on the beach, picked clean long ago. {a} kicks it, and it doesn't mind.",
    "{a} climbs over a wreck and finds nothing in it but sand and a crab.",
  ],

  // ---- curiosities beyond Old Pellam ----
  cairn: [
    "There is a drovers' cairn by the road. Everyone adds a stone for luck and sits in the lee of it for a while.",
    "{a} puts a stone on the cairn the way the drovers do, and they all rest out of the wind.",
  ],
  cairn_cache: [
    "Tucked in among the stones of the cairn, {a} finds a bundle of oatcake the last drover left for the next.",
    "{a} finds a parcel of food at the foot of the cairn, wrapped in oilcloth. It is the custom up here.",
  ],
  boathouse: [
    "There is an empty boathouse here. {a} goes through it and finds a purse and a sack of food somebody stowed in the rafters.",
    "{a} searches a boathouse and finds a tin of biscuits and a few coins in a tobacco jar.",
  ],
  boathouse_empty: [
    "There is a boathouse here with nothing in it but nets and a smell. {a} looks twice.",
    "{a} goes through an old boathouse and finds only a punt with a hole in it.",
  ],

  // ---- a squad beaten but nobody lost (lost_crawl, lost_home and road_home_lost would count the dead) ----
  // each has as many versions as the line it stands in for, so the dive's draws are unchanged
  lost_crawl_all: [
    "{a} wakes up in the dark. The squad has been beaten, but everyone is still breathing, and they crawl out of Old Pellam together with nothing.",
    "When {a} comes round, the fight is long over and nobody is dead, which nobody can explain. They get each other back up the rungs somehow.",
  ],
  'lost_crawl_all:town': [
    "{a} wakes up in an alley with the rest of the squad around them, all alive. They get back to Tallow Street with nothing.",
    "When {a} comes round, the fight is long over. Somehow nobody is dead, and they help each other home through the back streets.",
  ],
  'lost_crawl_all:overland': [
    "{a} wakes up in the open. The rest of the squad are lying nearby, and every one of them is alive. They drag themselves out of {p} with nothing.",
    "When {a} comes round, the fight is long over and everyone is still breathing. They get each other back onto the road somehow.",
  ],
  lost_home_beaten: [
    "They are nearly at the grate when they are caught. All of them climb out alive, though the only things they bring up are bruises.",
  ],
  'lost_home_beaten:town': [
    "They are caught two streets from the hall. Every one of them gets home, and the packs stay in the gutter where they were dropped.",
  ],
  'lost_home_beaten:overland': [
    "They are caught on the way out of {p}. Nobody dies, which is the only good thing anyone says about it.",
  ],
  road_home_beaten: [
    "They come home late, every one of them, with nothing but the bandages. Jory counts them twice and says it makes a change for the numbers to come out right.",
    "The whole squad limps back in through the gate with nothing to show for the trip. Tallow Street is surprised to see all of them.",
    "{a} walks the squad back into Varrow, all of them, carrying nothing but the packs they left with. Somebody at the Copper Kettle buys them a round for coming back at all.",
  ],
};
