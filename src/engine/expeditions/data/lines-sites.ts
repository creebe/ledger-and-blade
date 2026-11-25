// Expedition log lines for the sites beyond Old Pellam: Varrow's own streets,
// and the overland sites (Kell Mines, the Saltfens, Drover's Road, Harrowmere
// and Port Anselm). Also the lines for the new monsters, the monster voices
// (people and beasts) and the Professions' own moves (Envoy, Infiltrator).
//
// The dive looks a key up as `key:<siteId>`, then `key:<group>` (under, town,
// overland), then plain `key`, so a `:town` or `:overland` entry here replaces
// an Old Pellam line that only makes sense underground.
//
// Placeholders: {a} a member, {b} another member, {t} the member being
// attacked, {m} a monster label (it already has "the"), {g} goods, {n} a count,
// {w} a weapon, {p} the site's name (it may start with "The", so it never
// follows "the"). Writing rules: docs/STORY.md §7. Members are referred to by
// name or "they".

export const SITE_LINES: Record<string, string[]> = {
  // ---- the road ----
  road_out: [
    "The squad sets out for {p} with the packs on their backs. {a} has started complaining about the straps before the end of Tallow Street.",
    "They leave Varrow at first light by the gate the carters use, and take the road to {p}.",
    "{a} walks at the front for the first mile, until the novelty wears off. It is a long way to {p}.",
    "They go out past the green, where somebody is selling hot chestnuts. {a} buys a bag for the road, and it is gone by the first milestone.",
  ],
  road_on: [
    "It is another week on the road. {a} has worked out which boot is letting the water in, and it is both of them.",
    "They sleep in a barn one night and under a hedge the next. {p} is still some way off.",
    "The road goes on. {a} counts milestones to pass the time, and gives up when one of them is missing.",
    "A carter going the other way tells them it is not far now. He has probably said that to everybody for twenty years.",
  ],
  road_back: [
    "They walk back toward Varrow with the loads shared out differently for the second time since breakfast.",
    "It is another week on the road home. {a} keeps checking the packs to make sure the haul is still in them.",
    "The road home is the same road, and it is longer. Nobody can explain this.",
    "{a} sings on the way back. The others let it go on for a mile before they ask for quiet.",
  ],
  road_home: [
    "They come in through the gate at dusk and up Tallow Street with the haul. Jory comes to the hall door with the ledger already open.",
    "The squad walks back into Varrow footsore, with the job done. {a} goes straight to the Copper Kettle and is not seen again until morning.",
    "They are home. The hall smells of tallow and wet dog, and {a} sits down in the doorway and takes their boots off where they are.",
  ],
  road_home_lost: [
    "What is left of the squad limps back in through the gate. People on Tallow Street stop what they are doing to count them.",
    "They come home late and short of people. Jory meets them at the door and does not ask for the ledger yet.",
    "{a} brings the survivors back into Varrow. They have nothing to show for the trip apart from the bandages.",
  ],

  // ---- setting out, in the city and overland ----
  'setout_short:town': [
    "The squad goes out of the hall on Tallow Street with {a} in front, and turns down the hill into the Lower Town.",
    "{a} leads them out by the back door, which Jory says gets noticed less. {b} shuts it behind them.",
    "They leave the hall straight after supper. {b} is still eating, and finishes on the stairs.",
  ],
  'setout_short:overland': [
    "They reach {p} and stop at the edge of it to look. {a} goes first, because somebody has to.",
    "{a} drops the pack at the start of the work and stretches. {b} counts the water skins and frowns at the total.",
    "They are at {p} at last. {b} wants to rest first, and is outvoted.",
  ],
  'setout_medium:town': [
    "The squad goes out into Varrow for a fortnight's work, with {a} in front and {b} carrying most of the food.",
    "{a} leads them down Tallow Street. Somebody's mother is shouting about the rent, and then they turn the corner and can't hear her.",
    "They take two weeks' food and a list of addresses in Jory's hand. {b} reads it twice and puts it in a boot.",
  ],
  'setout_medium:overland': [
    "They reach {p} with two weeks of work ahead of them and food for about that. {a} leads off.",
    "{a} looks over {p} from the last rise and says it does not look so bad. {b} has heard that before.",
    "They unpack, repack and set off into {p}. {b} checks the knots twice.",
  ],
  'setout_long:town': [
    "This is three weeks of work in the city, and the squad goes out of the hall knowing it. {a} touches the doorframe on the way out.",
    "{a} leads them out with as much as they can carry. The street watches them go and lays bets.",
    "They go out into Varrow for the long job. Jory has written all their names into the ledger in pencil.",
  ],
  'setout_long:overland': [
    "They come to {p} with three weeks of work ahead of them. Nobody says how long it will really take, because nobody knows.",
    "{a} takes the first step into {p}. The farmer who gave them a bed last night told them not to go, and said it twice.",
    "They go into {p} with as much as they can carry and a map that {b} bought in Varrow and now suspects.",
  ],
  'rival_ahead:town': [
    "Somebody has been asking questions in these streets this week. The doors that should be open are shut, and the people behind them have already been paid.",
    "Hobb's people came through a few days ago. Half the street owes them money now, and the other half is frightened of them.",
  ],
  'rival_ahead:overland': [
    "Somebody has been through here this week. There are fresh hoof prints and a cold fire, and the easy pickings are gone.",
    "Hobb's people came through a few days ago. They took what was easy and left the gates open behind them.",
  ],
  'lamps_lit:kell': [
    "They light the lamps at the mouth of the adit. Kell is not improved by being able to see it.",
    "The lamps go up. The light reaches about four yards down the gallery and gives up.",
    "They light the lamps, and the flames lean toward the deep galleries where the air is moving. Nobody likes it.",
  ],
  'lamps_lit:overland': [
    "They light the lamps, which makes everything outside the light a good deal darker.",
    "The lamps go up, and now anyone watching knows exactly where they are.",
  ],
  'lamps_lit:town': [
    "They light the lamps. Shutters close along the street as they pass.",
    "The lamps go up, and a dog starts barking two streets over and keeps at it.",
  ],
  'scout_cache:overland': [
    "{a} stops at a cairn by the path, moves two stones and finds {g} under them.",
    "{a} notices a hollow under a tree root with {g} stuffed into it.",
    "While the others rest, {a} goes through a heap of junk by the path and comes back with {g}.",
  ],

  // ---- the Lower Town (Varrow) ----
  enter_lowertown: [
    "They go down the hill into the Lower Town, where the streets narrow and the gutters are full.",
    "The Lower Town smells of fish and tar, and everybody in it is minding their own business very hard.",
    "They come down the back stairs into the Lower Town. People take their washing in as they pass.",
  ],
  passage_lowertown: [
    "They cut through a cooper's yard. The cooper watches them all the way across and does not put down the mallet.",
    "They go along a back alley between two warehouses. {a} steps in something and decides not to look.",
    "They climb a set of back stairs that smell of cabbage. A door opens on the landing and shuts again.",
    "They cross the fish market as it closes. {a} is offered a herring for nothing and takes it.",
  ],
  room_lowertown: [
    "They come into a warehouse yard. The gate is open, which it should not be.",
    "There is a counting-house at the end of the lane, shuttered for the night, with a light still on upstairs.",
    "They go into the back room of a lodging house, past a landlady who has decided not to see them.",
  ],
  find_lowertown: [
    "{a} finds {g} in a drawer that somebody forgot to lock.",
    "{a} turns out a sack behind the counter and finds {g}.",
    "Under a loose stair, {a} finds {g} that somebody was saving for a bad winter.",
  ],
  goalroom_lowertown: [
    "They find the house the job named. The door is open, and there are people inside who were expecting somebody else.",
    "The yard they were sent to is at the end of the lane, and it is not empty.",
  ],
  goal_lowertown: [
    "{a} finds what they came for under the floorboards: {g}, in a box with a broken lock.",
    "{a} gets {g} out of the back room and under a coat before the street notices.",
  ],
  camp_lowertown: [
    "They hole up for the night in a loft over a stable and pull the ladder up after them.",
    "They rent a back room in a lodging house and wedge a chair under the door handle.",
  ],

  // ---- the upper workings (Kell Mines) ----
  enter_workings: [
    "The adit goes into the hill beside a spoil heap. Inside, the galleries of Kell run off in all directions, and the props are older than anyone's grandmother.",
    "They go into the upper workings. Water drips from the roof, and the timbers creak when they pass under them.",
    "Kell's upper galleries were cut a century ago and left when the silver went deeper. Nobody told the rats.",
  ],
  passage_workings: [
    "They follow an old tramway into the hill. The rails have rusted to the sleepers, and {a} trips on most of them.",
    "The gallery shrinks until they are walking bent double. {a} counts the props as they go, to have something to count.",
    "They pass a ladder going down into a flooded shaft. The water is black and very still, and nobody wants to know how deep it is.",
    "They walk past a face covered in old pick marks. Somebody has chalked a tally on it, and the tally stops at forty.",
  ],
  room_workings: [
    "They come into a chamber where the miners kept their tools. Most of the tools are still there, rusted to the wall.",
    "The gallery opens into an old stope, high and dark, with a heap of spoil in the middle.",
    "There is a side gallery here with a door on it, which is unusual in a mine.",
  ],
  find_workings: [
    "{a} picks through a heap of spoil and comes out with {g}.",
    "{a} finds {g} in an ore wagon that nobody bothered to push out.",
    "In the old foreman's hut, behind a loose board, {a} finds {g}.",
  ],
  goalroom_workings: [
    "The gallery the job named is at the end of the tramway. There are lamps in it already.",
    "They reach the old silver gallery. Somebody else got here first and has no intention of leaving.",
  ],
  goal_workings: [
    "At the end of the gallery {a} finds {g}, stacked under a tarpaulin for a wagon that did not come.",
    "{a} loads {g} into the packs while the props groan overhead.",
  ],
  camp_workings: [
    "They camp in a dry gallery near the adit, where they can see a little grey daylight at the end.",
    "They make camp in the old powder store, because it is dry and has a door. Nobody lights a pipe.",
  ],

  // ---- the reed paths (the Saltfens) ----
  enter_reeds: [
    "The path goes into the Saltfens on planks laid end to end. The reeds close over their heads within twenty yards.",
    "They are in the reeds now. The water under the planks is brown and warm, and the flies find them at once.",
    "The road gives out at a cutter's hut. After that it is planks and reeds and the smell of the estuary.",
  ],
  passage_reeds: [
    "They walk the plank path in single file. A plank turns under {a}, who goes in to the knee on one side.",
    "The reeds open onto a salt pan that glares white in the sun. They cross it fast with their eyes half shut.",
    "They pass a cutter's hut on stilts. There is a pot on the stove inside and nobody home.",
    "Something big moves in the reeds off to one side and keeps pace with them for a while, then stops.",
  ],
  room_reeds: [
    "They come out on a hummock of dry ground with a hut on it and a boat pulled up.",
    "There is a drying frame here, hung with plants an apothecary in Varrow would pay for.",
    "The path ends at an old salt-house, half sunk, with its door hanging open.",
  ],
  find_reeds: [
    "{a} cuts {g} from the edge of the pans, up to the elbows in brine.",
    "{a} finds {g} in a cutter's lean-to, dried and tied up for market.",
    "{a} wades out and comes back with {g} and a leech on each leg.",
  ],
  goalroom_reeds: [
    "The place the job named is a salt-house on stilts at the end of the path. There is smoke coming out of the chimney.",
    "They reach the pans the job was about. Somebody is working them, and has stopped working to watch the squad come.",
  ],
  goal_reeds: [
    "{a} gathers {g} from the place the job named and wraps the lot in oilcloth against the wet.",
    "{a} gets {g} into the packs. It smells of the fen, and so will the packs from now on.",
  ],
  camp_reeds: [
    "They camp on a hummock with their boots off and their feet up on the packs. The flies take turns.",
    "They camp in a cutter's hut on stilts. It sways whenever anyone turns over.",
  ],

  // ---- the hill road (Drover's Road) ----
  enter_hillroad: [
    "The Drover's Road climbs out of the valley between stone walls. There are sheep on both sides and nobody else.",
    "They are up in the hills now. The road is all ruts and cow muck, and the wind does not let up.",
    "The road narrows as it climbs. Below them the valley spreads out for miles with not a soul on it.",
  ],
  passage_hillroad: [
    "They walk all morning between stone walls. {a} tries to talk to a sheep and is ignored.",
    "The road crosses a ford with the water up to their knees. The far bank is all mud.",
    "They pass a shepherd's hut with the roof fallen in. Somebody has written a rude word on the door and spelled it wrong.",
    "There is a gibbet at the crossroads with nobody in it. {a} says that is a good sign, and nobody agrees.",
  ],
  room_hillroad: [
    "There is a drovers' inn at the top of the pass, with the shutters closed and the door open.",
    "They come to a sheepfold beside the road, with a fire still smoking in one corner.",
    "The road goes through a cutting with high banks on both sides, where anybody meaning trouble would wait.",
  ],
  find_hillroad: [
    "{a} finds {g} in a cart that has been left in the ditch.",
    "Behind a loose stone in the wall {a} finds {g}, wrapped in sacking.",
    "{a} finds {g} on a drover who will not be needing it, and says a word over him.",
  ],
  goalroom_hillroad: [
    "The farm the job named is at the head of the valley. There are horses in the yard that do not belong to any farmer.",
    "They reach the barn the job was about. It is full of people who stop talking when they see the squad.",
  ],
  goal_hillroad: [
    "{a} gets {g} down out of the barn loft and onto their back.",
    "Under the hay in the loft, {a} finds {g}, which is what they came for.",
  ],
  camp_hillroad: [
    "They camp behind a wall out of the wind and take turns at the watch. A few sheep come over to look at them.",
    "They sleep in a ruined fold with a fire in the corner. The wind gets in through the gaps in the stones.",
  ],

  // ---- the lake shore (Harrowmere) ----
  enter_shore: [
    "The road comes down to the shore at Harrowmere. The lake is grey and very big, and the old bridge walks out into it on stone legs.",
    "They come down to the water between boathouses and nets hung up to dry. The mere is cold even to look at.",
    "They reach the lake shore. The shingle crunches under their boots, and out on the water the old bridge has lost two of its arches.",
  ],
  passage_shore: [
    "They walk the shingle between the boathouses and the water. {a} skims a stone and gets four bounces out of it.",
    "They go under the old bridge, where the water slaps against the piers and the stone is green to head height.",
    "They cross a jetty with half its planks missing. {a} goes first and does not look down.",
    "There are nets drying on poles along the shore, and the smell of them follows the squad for a mile.",
  ],
  room_shore: [
    "They come to a boathouse with its doors chained shut, and a new padlock on the old chain.",
    "On the bridge there is a toll house nobody has used in fifty years. Somebody is using it now.",
    "There is a fish store at the water's edge. It is cold inside and smells of last year.",
  ],
  find_shore: [
    "{a} finds {g} in a boat pulled up under the bridge.",
    "{a} pulls {g} out of a heap of driftwood on the shingle.",
    "Under the floor of a boathouse {a} finds {g}.",
  ],
  goalroom_shore: [
    "The boathouse the job named stands at the end of the shore with smoke coming out of the roof. There are people in it.",
    "They reach the middle of the old bridge, where the job said to look. Somebody is already there.",
  ],
  goal_shore: [
    "{a} gets {g} out of the boathouse while the others watch the water.",
    "{a} lifts {g} out from under the floor of the old toll house on the bridge.",
  ],
  camp_shore: [
    "They camp in an empty boathouse. The water slaps the boards under them all night.",
    "They make camp on the shingle under the bridge, with a driftwood fire and their backs to the stone.",
  ],

  // ---- the Wenmouth road (Port Anselm) ----
  enter_wenmouth: [
    "The coast road runs along the top of the dunes with the salt marsh below it. Port Anselm is somewhere ahead, past more fords than anybody warned them about.",
    "They come out on the Wenmouth road. The wind comes off the sea, and it has sand in it.",
    "The road to Anselm is flat and open, and they can be seen coming for miles. So can anybody else.",
  ],
  passage_wenmouth: [
    "They cross the Wenmouth ford with the packs held over their heads. {a} loses a boot to the current and gets it back.",
    "The road runs between the dunes and the marsh, and the wind fills everything with sand. {a} has it in their teeth by noon.",
    "They pass a line of the bank's carts going the other way, empty, with guards sitting on the tailboards.",
    "They walk past a milestone that says Anselm is nine miles off. The next one says eleven.",
  ],
  room_wenmouth: [
    "There is a carters' inn at the ford, low and sandblown, with a few horses outside.",
    "They come to a ferryman's hut at a river mouth. The ferry is on the far bank, and so is the ferryman.",
    "The road dips into a hollow in the dunes, out of the wind and out of sight.",
  ],
  find_wenmouth: [
    "{a} finds {g} in the sand where a cart went over.",
    "{a} digs {g} out of a hole under a marker stone, where somebody meant to come back for it.",
    "{a} finds {g} in the saddlebag of a dead horse out in the marsh.",
  ],
  goalroom_wenmouth: [
    "The hollow the job named is just off the road, and there is a camp in it already.",
    "They reach the ford the job was about. There are people waiting on the far side of it, and they have crossbows.",
  ],
  goal_wenmouth: [
    "{a} gets {g}, which is what they came all this way for, and checks it twice.",
    "{a} finds {g} where the job said it would be, buried in the sand under a cart wheel.",
  ],
  camp_wenmouth: [
    "They camp in the dunes out of the wind. Everything they eat that night has sand in it.",
    "They sleep in a ferryman's shed at a river mouth and listen to the tide come in under the floor.",
  ],

  // ---- new monsters come into view ----
  sight_claim_jumper: [
    "Lamps come round the bend in the gallery. {m} looks up from a seam that is not theirs to dig and reaches for a pick handle.",
    '"Nobody\'s working here," says {m}, standing in front of a fresh heap of ore.',
  ],
  sight_cave_crab: [
    "Something pale clatters up out of a flooded winze. It is a cave crab, and it is the size of a cartwheel.",
    "The water on the gallery floor moves, and {m} climbs out of it claws first.",
  ],
  sight_salt_cutter: [
    "People come out of the reeds with salt rakes in their hands. They have been out on the pans too long, and they do not look well.",
    "{m} is standing on the path with a cutter's blade and a fever flush, talking to somebody who is not there.",
  ],
  sight_marsh_hog: [
    "The reeds shake, and a black hog comes through them at a run.",
    "Something snorts in the reeds close by. {m} has smelled them and does not like it.",
  ],
  sight_road_agent: [
    "{m} steps out from behind a wall with a crossbow and asks for the toll. There is no toll on this road.",
    'There are crossbows behind the rocks. "Purses on the road, please," says {m}.',
  ],
  sight_deserter: [
    "There are people in old Ninth coats by the road, with spears and mail and nowhere to be. {m} looks the squad over.",
    "{m} still has the regiment's spear and has mislaid the rest of the regiment. They want what the squad is carrying.",
  ],
  sight_wolf: [
    "Grey shapes keep pace with them along the wall. The wolves have been following since the last farm.",
    "{m} trots out onto the road ahead, thin as a rake, and the rest of the pack comes after it.",
  ],
  sight_pike: [
    "There is a log lying in the shallows, and then the log has teeth.",
    "{m} comes out of the weed at the water's edge with its mouth open.",
  ],
  sight_smuggler: [
    "There is a boat drawn up on the shingle where no boat should be. {m} and the crew put down a crate and pick up boathooks.",
    '"You didn\'t see us," says {m}, and reaches for a knife to make sure of it.',
  ],
  sight_thug: [
    "Somebody has paid {m} and friends to stand about in this yard, and they mean to earn it.",
    "{m} cracks their knuckles. It is meant to be frightening, and it mostly works.",
  ],
  sight_soldier: [
    "A line of sell-swords forms up across the way with their shields together. {m} calls the step.",
    "{m} has drilled for this, and it shows. The others close up on either side.",
  ],
  sight_guard: [
    '"Who\'s there?" shouts {m}, lifting a lantern. Then they shout for their friends.',
    "{m} sees them and blows a whistle, and boots start coming from two directions.",
  ],
  sight_hedge_wizard: [
    "Somebody in a patched college gown is waiting for them, holding a focus with no Assay stamp on it anywhere.",
    "{m} raises a hand, and the air in front of it goes hot. That working is not licensed.",
  ],
  sight_troll: [
    "A grey boulder by the path stands up. It is a troll, and it has been waiting a long time for something to walk past.",
    "{m} steps out of the hillside, huge and slow, and looks at them the way a farmer looks at a field.",
  ],
  sight_salamander: [
    "A lizard the length of a cart comes out of a crack in the rock, and the air shimmers above it.",
    "{m} opens its mouth, and the heat reaches them before the hiss does.",
  ],
  sight_rioter: [
    "A crowd comes round the corner with stones in their hands. {m} is at the front, shouting about the price of bread.",
    "{m} prises a cobblestone out of the road and weighs it. There are more of them behind, and they all have grievances.",
  ],

  // ---- people: anyone armed without lines of their own ----
  sight_people: [
    "{m} steps out with friends, and the friends are armed.",
    "People come out to meet them with their weapons already out. {m} is doing the talking, which is mostly swearing.",
    '"That\'s far enough," says {m}. The rest of them spread out behind.',
    "There are people waiting for them, and by the look of them they have been waiting a while.",
  ],
  people_hit: [
    "{m} gets a blade into {t}.",
    "{m} clubs {t} across the side of the head.",
    "{m} catches {t} with a knife on the backswing.",
    "{m} kicks {t} in the knee and hits them while they are bent over.",
    "{m} drives the point into {t}'s shoulder.",
    "{m} gets in close and lands a hard one on {t}.",
  ],
  people_miss: [
    "{m} swings at {t} and hits the air where {t} was standing.",
    "{t} knocks the blow aside.",
    "{m} lunges at {t} and overreaches.",
    "{t} ducks, and {m} goes stumbling past.",
    "{m} goes for {t} and gets tangled up with their own side.",
    "{m} feints at {t} and then forgets to follow it up.",
  ],
  people_crit: [
    "{m} puts {t} on the ground and keeps hitting them.",
    "{m} finds the gap in {t}'s guard and goes in deep.",
    "{m} hits {t} with everything they have, and {t} folds up round it.",
  ],
  kill_people: [
    "{a} puts {m} down, and {m} stays down.",
    "{m} drops their weapon and puts both hands up. {a} lets them go, minus their boots.",
    "{m} takes one look at how the fight is going and runs for it.",
    "{a} knocks {m} senseless into the mud.",
    "{m} sits down hard and says they have had enough. {a} takes that as a yes.",
    "{a} gets {m} on the ground, and {m} decides that is where they will stay.",
  ],

  // ---- beasts: animals without lines of their own ----
  sight_beast: [
    "Something has been following them. {m} comes out of cover.",
    "{m} lifts its head and looks straight at them.",
    "They hear {m} before they see it.",
    "{m} is between them and where they are going, and it has no plans to move.",
  ],
  beast_hit: [
    "{m} gets its teeth into {t}.",
    "{m} knocks {t} flat and goes for them on the ground.",
    "{m} rakes {t} and draws blood.",
    "{m} slams into {t} from the side.",
    "{m} bites {t} on the arm and shakes.",
    "{m} catches {t} with a glancing blow that still hurts a great deal.",
  ],
  beast_miss: [
    "{m} snaps at {t} and gets nothing.",
    "{t} gets out of the way of {m}.",
    "{m} lunges, and {t} sidesteps it.",
    "{t} jabs at {m}, and it backs off.",
    "{m} goes for {t} and overshoots.",
    "{m} closes its jaws on {t}'s pack strap and comes away with the strap.",
  ],
  beast_crit: [
    "{m} gets {t} down and does real damage before anyone can drag it off.",
    "{m} closes on {t} and will not let go.",
    "{m} hits {t} at full weight, and something in {t} gives.",
  ],
  kill_beast: [
    "{a} puts {m} down at last.",
    "{m} gives a last kick and lies still.",
    "{a} finishes {m} with a blow behind the head.",
    "{m} limps off a few yards and falls over.",
    "{a} gets {m} in the right place, and it drops.",
  ],

  // ---- the Professions' own moves ----
  hard_words: [
    "{a} tells {m} that the guild knows where they live. {m} stops to think about whether that is true.",
    '"Is this worth what they\'re paying you?" {a} asks {m}. It is a fair question, and {m} lowers the blade to think about it.',
    "{a} calls {m} by the wrong name with great confidence. {m} stops to argue.",
    "{a} points out to {m} that the others have left them at the front to die. {m} looks round to check.",
  ],
  hard_words_miss: [
    "{a} tries to reason with {m}, who is not in a reasoning mood.",
    "{m} hears {a} out and comes on regardless.",
    "{a} says something cutting. {m} has heard worse from their own mother and keeps coming.",
  ],
  backstab_hit: [
    "{a} comes round behind {m} and puts the {w} in up to the hilt.",
    "{m} does not see {a} coming. The {w} goes in low and deep.",
    "{a} slips through the press and opens {m} from behind.",
    "{a} waits for {m} to turn and uses the {w} on the back of them.",
  ],
  backstab_miss: [
    "{a} gets behind {m}, and {m} picks that moment to turn round.",
    "{a} goes for the back of {m} and meets {m} coming the other way.",
    "{a}'s {w} skids off {m}'s back.",
  ],
  parley_ok: [
    "{a} talks to {m} for a while about wages and risk. In the end {m} and the rest decide it is not their fight.",
    "{a} asks {m} how much they are being paid. It is not enough, and once they have all agreed on that, they leave.",
    "{a} steps forward with empty hands and a story. Whether {m} believes it or not, the whole lot of them stand aside.",
  ],
  parley_bribe: [
    "{a} counts some of the coin they found into {m}'s hand. That settles it, and the other side goes home.",
    '"Would this help?" {a} asks, holding up a purse from the haul. It helps, and {m} takes it and leaves with the others.',
    "{a} pays {m} out of the squad's finds to be somewhere else. The squad is lighter, and nobody is bleeding.",
  ],
  parley_fail: [
    "{a} starts to say something reasonable, and {m} does not let them finish.",
    "{a} offers {m} a way out. {m} laughs, and that is the end of the talking.",
    "{a} tries talking to {m}, and it does not take.",
  ],
  regen: [
    "The cuts on {m} close up while they watch. It is a horrible thing to see.",
    "{m} shrugs, and the wound in its side knits shut.",
    "{m}'s grey hide creeps back over the cut. Somebody shouts for fire.",
  ],
  strongbox_pick: [
    "{a} kneels by a strongbox, listens to the lock and has it open before the others have put their packs down.",
    "{a} picks a strongbox's lock with two bent pins and a great deal of swearing.",
    "{a} opens a strongbox without leaving a mark on it. The others look at {a} differently for a while.",
  ],
  'strongbox_pick:under': [
    "{a} picks the lock on an Assay strongbox. The Assay Office would be interested to know how.",
    "{a} gets an old Assay strongbox open with a pin and patience, and the brass seal still unbroken.",
  ],

  // ---- traps ----
  trap_collapse_disarm: [
    "{a} sees the props ahead are rotten through and shores them up with a spare length of timber before anyone goes under.",
    "{a} hears the roof creak and wedges the worst of the props before they pass.",
  ],
  trap_collapse_around: [
    "{a} taps a prop and it crumbles. They have nothing to shore it with, so they go round by another gallery.",
    "{a} spots the bulge in the roof ahead. Without tools to prop it, they take the long way.",
  ],
  trap_collapse_hit: [
    "A prop gives with a crack, and the roof comes down on {a}.",
    "Rock falls out of the ceiling onto {a}. It is a small rock, and that is enough.",
    "{a} brushes against a prop and it folds. Half a cartload of the hill lands on them.",
  ],
  trap_bog_disarm: [
    "{a} prods the path ahead with a pole and finds no bottom. They lay planks across, and everyone keeps their boots.",
    "{a} sees the reeds leaning wrong and throws down a hurdle before anyone steps there.",
  ],
  trap_bog_around: [
    "{a} spots a patch of mud that is too smooth. They have nothing to bridge it with, so they wade round the long way.",
    "{a} sees the bog ahead and has no planks to cross it. They go round through the reeds, and it takes the afternoon.",
  ],
  trap_bog_hit: [
    "{a} steps off the plank and goes in up to the waist. It takes two of them to pull {a} out, and one boot stays behind.",
    "The mud takes {a} to the chest before anyone gets hold of them. They come out cold, with something wrenched.",
  ],
  trap_snare_disarm: [
    "{a} spots a man-trap half buried in the dirt and springs it with a stick. The jaws bite the stick in two.",
    "{a} finds a wire noose at ankle height and cuts it before anyone puts a foot in it.",
    "{a} notices a cord across the way tied to something heavy, and makes it fast before they pass.",
  ],
  trap_snare_around: [
    "{a} spots a man-trap that is set and waiting. They have nothing to spring it with, so they go round.",
    "{a} sees a snare wire and has no tools to deal with it. They take another way, and it is slower going.",
  ],
  trap_snare_hit: [
    "A man-trap closes on {a}'s leg. It takes two of them to get it open again.",
    "{a} puts a foot in a noose and is yanked clean off their feet.",
    "Somebody set a snare here for people. {a} finds it the hard way.",
  ],
  'trap_gas_disarm:kell': [
    "{a} sees the lamp flame shrink and go blue. They stop up the old shaft with sacking before anyone walks into the bad air.",
    "{a} smells damp coming out of a side gallery and hangs a wet cloth across the mouth of it before they pass.",
  ],
  'trap_gas_around:kell': [
    "The lamp gutters at the mouth of a side gallery. With nothing to seal it, they go the long way round.",
  ],
  'trap_gas_hit:kell': [
    "A pocket of bad air comes out of an old working. {a} breathes it before anyone notices the lamp going blue.",
    "{a} walks into a dip full of blackdamp and goes down on their knees, retching.",
  ],

  // ---- fighting, away from the drains ----
  'melee_miss:overland': [
    "{a} swings at {m} and hits the dirt.",
    "{m} twists away from the {w}.",
    "{a} lunges, slips in the mud and misses {m}.",
    "{a}'s blow lands on nothing.",
    "{a} misses, and says something the chaplains would not repeat.",
  ],
  'shot_miss:overland': [
    "{a}'s arrow goes over {m} and into the distance.",
    "{a} shoots, and {m} moves at the last moment.",
    "{a} doesn't have a clear shot and takes it anyway. It misses.",
    "The wind takes {a}'s arrow wide of {m}.",
  ],
  'shot_miss:town': [
    "{a}'s arrow skips off a wall and goes through somebody's shutter.",
    "{a} shoots, and {m} moves at the last moment.",
    "{a} doesn't have a clear shot and takes it anyway. It misses.",
    "{a}'s arrow sticks in a doorpost beside {m}.",
  ],
  'bash_hit:overland': [
    "{a} slams a shoulder into {m}.",
    "{a} batters {m} with the flat of the {w}.",
    "{a} shoves {m} back and off their footing.",
  ],
  'bash_hit:town': [
    "{a} slams a shoulder into {m}.",
    "{a} batters {m} with the flat of the {w}.",
    "{a} shoves {m} back into a wall.",
  ],
  'hamstring_miss:overland': [
    "{a} goes low for {m} and gets nothing but mud.",
    "{a} goes in low, and {m} is not there.",
  ],
  'throw_miss:overland': [
    "{a}'s thrown knife goes into the grass, and somebody will have to find it later.",
    "{a} throws and misses, and now has one fewer knife.",
  ],
  'throw_miss:town': [
    "{a}'s thrown knife clatters away down the cobbles.",
    "{a} throws and misses, and now has one fewer knife.",
  ],
  'foes_withdraw:overland': [
    "{m} has had enough and backs off the way it came.",
    "{m} gives up and goes back where it came from.",
  ],
  'foes_withdraw:town': [
    "{m} has had enough and backs off into an alley.",
    "{m} gives up and goes back where they came from.",
  ],
  'sight_rats:overland': [
    "The ground starts moving. It is rats, a lot of them, and they are all coming this way.",
    "{m} pours out of a hole in the bank. Some of them are the size of cats, and the rest are bigger.",
    "Something squeals, and then everything squeals. It is rats.",
  ],
  'sight_rats:town': [
    "The gutter starts moving against the flow. It is rats, a lot of them, and they are all coming this way.",
    "{m} pours out of a cellar grating. Some of them are the size of cats, and the rest are bigger.",
    "Something squeals, and then everything squeals. It is rats.",
  ],
  'kill_rats:overland': [
    "{a} kills enough of {m} that the rest give up and scatter.",
    "{m} breaks up and goes to ground in the nearest holes.",
    "There is not much left of {m}, and what there is runs off squealing.",
    "{a} stamps on the slowest of {m}, and the others decide they have business elsewhere.",
  ],
  'kill_rats:town': [
    "{a} kills enough of {m} that the rest give up and scatter.",
    "{m} breaks up and flees into the gutters.",
    "There is not much left of {m}, and what there is runs off squealing.",
    "{a} stamps on the slowest of {m}, and the others decide they have business elsewhere.",
  ],
  'wander_avoided:town': [
    "They hear {m} coming and step into a doorway until the noise has gone by.",
    "They duck into a yard and keep still, and the {m} go by close enough to smell.",
    "Somebody signals, and they lose themselves in the crowd while the {m} go past.",
    "They take a side street and leave the {m} to it.",
  ],
  'wander_avoided:overland': [
    "They hear {m} coming and get down out of sight until the noise has gone by.",
    "They keep still in cover, and the {m} go by close enough to smell.",
    "Somebody signals, and they wait while the {m} go past.",
    "They leave the path and give the {m} a wide berth.",
  ],
  'wander_fight:town': [
    "They hear {m} ahead and go to meet them.",
    "Something is coming down the street. The orders are to fight, so they do.",
    "The {m} come out of an alley, and the squad goes straight at them.",
  ],
  'wander_fight:overland': [
    "They hear {m} ahead and go to meet them.",
    "Something is coming along the path. The orders are to fight, so they do.",
    "The {m} come out of cover, and the squad goes straight at them.",
  ],

  // ---- going down ----
  'death:town': [
    "{a} is dead. It was {m}, in the end.",
    "{a} does not get up again. They will be counted among the guild's dead, and it was {m} that did it.",
    "They lose {a} to {m}. Somebody keeps pressing on the wound long after there is any point.",
    "{a} dies on the cobbles, a few streets from the hall. {m} did it.",
  ],
  'death:overland': [
    "{a} is dead. It was {m}, in the end.",
    "{a} does not get up again. They will be counted among the guild's dead, and it was {m} that did it.",
    "They lose {a} to {m}. Somebody keeps pressing on the wound long after there is any point.",
    "{a} dies out here, a long way from Varrow. {m} did it.",
  ],
  'wipe_death:town': [
    "{a} is left in the street where they fell.",
    "They do not bring {a} home.",
    "{a} does not wake up.",
  ],
  'wipe_death:overland': [
    "{a} is left behind in {p}.",
    "They do not bring {a} back from {p}.",
    "{a} does not wake up, and there is nobody left to carry them.",
  ],

  // ---- exposure in the fens ----
  'fever_start:overland': [
    "The fen gets into {a} all at once. They go hot, then cold, and their hands won't keep still. It's the marsh fever, and it has to run its course.",
    "{a} starts sweating and says they're fine. They are running the fen fever, and everyone can see it.",
    "{a} goes grey and shivery out on the planks. The fever has started, and they'll fight worse until it breaks.",
  ],
  'change_take:overland': [
    "{a} is too tired to fight what the fen is doing to them, so it simply happens.",
    "{a} is worn out, and the fen takes the shortcut.",
    "There's no fever: {a} is too spent to argue with it.",
  ],
  'change_deep_lungs:overland': [
    "They breathe slow and deep, and the fen air doesn't catch in their throat any more.",
  ],
  'change_iron_bones:overland': [
    "Their bones feel heavier, and they don't bruise. Something in the fen water has gone into the marrow.",
  ],
  'change_sink_sense:overland': [
    "They stop and turn their head a moment before anything happens, every time. The fen has taught them its habits.",
  ],

  // ---- the dark, food and camps ----
  'dark_room:town': [
    "In the dark, {a} keeps hearing footsteps that stop when they stop.",
    "Somebody's hand brushes {a}'s arm in the dark, and nobody in the squad admits to it.",
    "Without the lamps they walk with a hand on the shoulder in front. {a} counts doorways to stay calm.",
  ],
  'dark_room:overland': [
    "In the dark, {a} keeps hearing something keep pace with them.",
    "{a} walks into something hard in the dark and apologises to it.",
    "Without the lamps they walk with a hand on the shoulder in front. {a} counts steps to stay calm.",
  ],
  'meal:town': [
    "They stop and eat cold bread and hard cheese on a doorstep. {a} says it is the best meal of their life.",
    "They eat standing up in an alley. {a} passes an onion round, which is generous of them, and nobody thanks them for it.",
    "They buy hot pies from a stall and eat them walking. {a} burns their mouth and keeps going.",
    "They share out bread and the end of a sausage. {a} makes theirs last as long as it can.",
  ],
  'meal:overland': [
    "They stop and eat cold bread and hard cheese. {a} says it is the best meal of their life.",
    "They eat sitting on the packs with the wind in their faces. Nobody talks much.",
    "They eat standing up. {a} passes an onion round, which is generous of them, and nobody thanks them for it.",
    "They share out bread and the end of a sausage. {a} makes theirs last as long as it can.",
  ],
  'camp_hurt:town': [
    "They are in no state to go on, so they hole up where they are.",
    "Too many of them are hurt. They stop and bar themselves into the nearest empty room.",
  ],
  'camp_hurt:overland': [
    "They are in no state to go on, so they make camp where they are.",
    "Too many of them are hurt. They stop where they stand and get a fire going.",
  ],

  // ---- curiosities ----
  'shrine_pass:town': [
    "There is a little shrine to Saint Oda on a street corner, with a stub of candle in it. They sit on the step in front of it and rest their legs.",
    "{a} nods at a shrine to Saint Oda in the wall of a yard, and they stop for a breather.",
  ],
  'shrine_pass:overland': [
    "There is a wayside shrine to Saint Oda here, with nobody to say the words. They sit in front of it anyway and rest their legs.",
    "{a} finds a little shrine to Saint Oda, older than the hall in Varrow. They stop for a breather.",
  ],
  'shrine_chaplain:town': [
    "There is a shrine to Saint Oda on the corner. {a} says the words over it and makes everyone sit down for a while.",
    "{a} lights a candle at a street shrine to Saint Oda and says a few words. They all rest their legs while it lasts.",
  ],
  'shrine_chaplain:overland': [
    "They find a wayside shrine to Saint Oda. {a} says the words over it and makes everyone sit down for a while.",
    "{a} clears the dirt off a little shrine to Saint Oda and says a few words. They all rest their legs while it lasts.",
  ],
  'strongbox_open:town': [
    "There is a merchant's strongbox here, bolted to the floor. {a} levers it open with the tools.",
    "{a} works the tools into a strongbox and the lid comes up.",
  ],
  'strongbox_open:overland': [
    "Somebody hid a strongbox here and thought it would not be found. {a} levers it open with the tools.",
    "{a} works the tools into an old strongbox and the lid comes up.",
  ],
  'strongbox_smash:town': [
    "There is a strongbox here. Without tools, {a} smashes it open with a loose paving stone. Most of what's inside survives that.",
  ],
  'strongbox_smash:overland': [
    "There is a strongbox here. Without tools, {a} smashes it open with a rock. Most of what's inside survives that.",
  ],
  'strongbox_ruin:town': [
    "There is a strongbox here. With no tools, {a} smashes it open with a paving stone and breaks everything inside it.",
  ],
  'strongbox_ruin:overland': [
    "There is a strongbox here. With no tools, {a} smashes it open with a rock and breaks everything inside it.",
  ],

  // ---- turning back and going home ----
  'find_picked:town': [
    "Somebody has already been through this place. There are scrape marks where the good things were.",
    "The drawers are open and empty. Whoever got here first did not bother to close them.",
  ],
  'find_picked:overland': [
    "Somebody has already been through here. There are scrape marks where the good things were.",
    "It has been picked clean. Fresh boot prints in the mud say who got here first.",
  ],
  'climb_back:kell': [
    "They climb back up the galleries toward the daylight with full packs.",
    "The way out of the hill feels shorter than the way in, which it is not.",
  ],
  'climb_back:overland': [
    "The packs are full. They turn round and start back out of {p}, watching both sides of the path.",
    "They leave {p} with full packs and the job done, which is the part people tell stories about.",
  ],
  'climb_back:town': [
    "They head back up the hill toward Tallow Street with full packs.",
    "The way back up the hill feels shorter than the way down, which it is not.",
  ],
  'turn_back:kell': [
    "The climb back out of the mine is long, and they keep looking behind them.",
    "They retrace their steps up the galleries, quieter than they came.",
  ],
  'turn_back:overland': [
    "They turn back, and keep looking behind them the whole way.",
    "They retrace their steps out of {p}, quieter than they came.",
  ],
  'turn_back:town': [
    "They turn back up the hill and keep to the busy streets.",
    "They go back the way they came, and keep looking behind them.",
  ],
  'home_short:town': [
    "They come back up Tallow Street in the evening covered in filth and very pleased with themselves.",
    "The squad goes straight past the hall door and into the Copper Kettle to be stared at.",
  ],
  'home_short:overland': [
    "They come out of {p} filthy and pleased with themselves, and turn for Varrow.",
    "The job is done. They shoulder the packs and start for home.",
  ],
  'home_medium:town': [
    "Two weeks after they went out, the squad comes back in through the hall door. Jory counts them, and the count comes out right.",
    "They come back to the hall a fortnight older and a good deal dirtier, and Jory makes them take their boots off at the door.",
  ],
  'home_medium:overland': [
    "Two weeks after they went in, the squad comes out of {p} and stands blinking at the road home.",
    "They put {p} behind them. Somebody counts heads, and the count comes out right.",
  ],
  'home_long:town': [
    "Three weeks after they went out, the squad walks back into the hall. Jory has to look twice before he writes them down.",
    "They come back to Tallow Street after three weeks in the city. Somebody has to tell them it is a Tuesday.",
  ],
  'home_long:overland': [
    "Three weeks after they went into {p}, the squad comes out. Somebody has to tell them it is a Tuesday.",
    "They leave {p} with full packs and start the long walk home.",
  ],
  'home_retreat:town': [
    "They are back in the hall, which is the main thing.",
    "They come back up Tallow Street early and empty-handed. The others look at their faces and do not ask.",
  ],
  'home_retreat:overland': [
    "They come back into Varrow early and empty-handed. The people on Tallow Street look at their faces and do not ask.",
    "They are home, which is the main thing. The job will have to wait.",
  ],
  'lost_crawl:town': [
    "{a} wakes up in an alley. The squad has been beaten, and those still breathing get back to Tallow Street with nothing.",
    "When {a} comes round, the fight is long over. They get the survivors home through the back streets somehow.",
  ],
  'lost_crawl:overland': [
    "{a} wakes up in the open. The squad has been beaten, and those still breathing drag themselves out of {p} with nothing.",
    "When {a} comes round, the fight is long over. They get the survivors back onto the road somehow.",
  ],
  'lost_all:town': [
    "Nobody comes back to the hall. Jory waits up until the candle burns down, and then goes out to ask.",
  ],
  'lost_all:overland': [
    "Nobody comes back from {p}. It is a month before the news reaches Tallow Street, and it comes with a carter who heard it at an inn.",
  ],
  'lost_home:town': [
    "They are within sight of Tallow Street when they are caught. What comes home is less than what went out.",
  ],
  'lost_home:overland': [
    "They are nearly clear of {p} when they are caught. What starts for home is less than what went in.",
  ],
};
