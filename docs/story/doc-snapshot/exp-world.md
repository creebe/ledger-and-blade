## Expeditions: places, monsters and people

Every contract is walked as an expedition to a site. Every site has three zones and a boss at the bottom of its long route, beaten once. Door scenes (news brought to the yard as a squad sets out for a distant site) are in the thread On the road, in the Story threads. The story bible's account of all this is `docs/STORY.md` §5d.

### Sites

| ID | Site | Zones | Text |
|---|---|---|---|
| `site:pellam` | Old Pellam | the Culverts, the Buried Streets, the College Sink | The first town on the river, under Varrow's Lower Town. Its cellars and streets are still down there, and so is the drain where the college poured its spent reagents for a century. |
| `site:varrow` | Varrow | the Lower Town, the Quays, the Rookeries | Work in the city itself, where the trouble is guarded doors and angry crowds, and further down the hill, people who rent out both. |
| `site:kell` | Kell Mines | the upper workings, the Sump, the Trevick level | Silver workings in the northern hills, half of them flooded, and the deepest of them held by people who never paid for it. |
| `site:saltfens` | The Saltfens | the reed paths, the Pans, the Withies | The marshes along the estuary, good for reagents and salt and for catching fever. |
| `site:drovers` | Drover's Road | the hill road, Brannock Moor, Skell Gap | The cattle road through the hills east of the city, over Brannock Moor to the pass at Skell Gap. |
| `site:harrowmere` | Harrowmere | the lake shore, the bridge houses, the Holms | A lake town on a mere that goes deeper than anyone has sounded. Its old bridge still carries the wool road, and nobody farms the islands. |
| `site:anselm` | Port Anselm | the Wenmouth road, the Burrows, the Strand | The coast road to the port where Ostrander's ships take on the Crown's silver, past the dunes where the wreckers live. |

_Source: expeditions/data/content.ts:667._

### Zones

#### The Culverts (Old Pellam)

`zone:culverts` · expeditions/data/content.ts:255 · depth 1

- _text:_ “Brick drains and cellars under the Lower Town. Grates let a little daylight down.”
- _met here:_ Culvert rats, Grubber, Tallow moths
- _found here:_ Old coin, College glass, Pellam silver
- _curiosities:_ shrine, strongbox, grubber_cache · _traps:_ tripwire, grate

#### The Buried Streets (Old Pellam)

`zone:streets` · expeditions/data/content.ts:273 · depth 2, dark, Exposure every room

- _text:_ “Pellam's old streets, roofed over by Varrow's foundations. The houses are full of silt.”
- _met here:_ Cellar spider, Pale hog, Culvert rats, Sink eel, Sink crab, Grubber, Tallow moths
- _found here:_ Pellam silver, College glass, Old coin, Assay seals
- _curiosities:_ shrine, strongbox, cart, still · _traps:_ floor, tripwire, gas

#### The College Sink (Old Pellam)

`zone:sink` · expeditions/data/content.ts:293 · depth 3, dark

- _text:_ “Where the college poured its spent reagents for a hundred years. The walls sweat colors.”
- _met here:_ Seep, Assay engine, Sink crab, Cellar spider
- _found here:_ Reagent salts, Assay seals, Pellam silver, College glass
- _curiosities:_ still, strongbox, shrine · _traps:_ gas, floor

#### The Lower Town (Varrow)

`zone:lowertown` · expeditions/data/content.ts:312 · depth 1

- _text:_ “Varrow's streets below the hill: yards, warehouses, back stairs and people who saw nothing.”
- _met here:_ Hired thug, Guard
- _found here:_ Old coin
- _curiosities:_ strongbox, shrine · _traps:_ snare

#### The Quays (Varrow)

`zone:quays` · expeditions/data/content.ts:326 · depth 2, dark

- _text:_ “The river warehouses below the chain, at night, with lighters tied up three deep and men paid to stand in the doorways of the bonded stores.”
- _met here:_ Lighterman, Footpad, Hired thug, Yard dog, Watch sergeant, Guard
- _found here:_ Bonded brandy, Old coin
- _curiosities:_ strongbox, boathouse · _traps:_ tide, snare

#### The Rookeries (Varrow)

`zone:rookeries` · expeditions/data/content.ts:343 · depth 3

- _text:_ “Tenement courts behind the tanneries, six storeys of rented rooms leaning on each other, with washing across every gap and a way over the roofs for anyone who knows it.”
- _met here:_ Footpad, Hired thug, Watch sergeant, Yard dog, Lighterman
- _found here:_ Old coin, Bonded brandy, Pellam silver
- _curiosities:_ strongbox, shrine · _traps:_ floor, snare

#### The upper workings (Kell Mines)

`zone:workings` · expeditions/data/content.ts:361 · depth 1, dark

- _text:_ “Galleries cut into the hill a century ago, propped with timber that has seen better centuries.”
- _met here:_ Claim-jumper, Cave crab, Culvert rats
- _found here:_ Iron, Old coin
- _curiosities:_ strongbox, shrine · _traps:_ collapse, gas

#### The Sump (Kell Mines)

`zone:sump` · expeditions/data/content.ts:378 · depth 2, dark

- _text:_ “The lower galleries, where the pumps gave out the year after the war. The water stands at the knee and is colder than it has any right to be.”
- _met here:_ Cave crab, Pit pony, Claim-jumper, Powder man, Culvert rats
- _found here:_ Silver ore, Iron, Old coin
- _curiosities:_ strongbox, shrine · _traps:_ collapse, gas

#### The Trevick level (Kell Mines)

`zone:trevick` · expeditions/data/content.ts:396 · depth 3, dark

- _text:_ “The old silver gallery, cut by a mine captain called Trevick who died rich and was buried with his pick. The vein is still there, and so are the people who found it first.”
- _met here:_ Claim-jumper, Powder man, Pit pony, Cave crab
- _found here:_ Silver ore, Old coin
- _curiosities:_ strongbox, shrine · _traps:_ collapse, gas

#### The reed paths (The Saltfens)

`zone:reeds` · expeditions/data/content.ts:413 · depth 1, Exposure every room

- _text:_ “Plank paths through reeds higher than a man, over water nobody should drink.”
- _met here:_ Marsh hog, Salt-cutter
- _found here:_ Reagents, Old coin
- _curiosities:_ shrine · _traps:_ bog

#### The Pans (The Saltfens)

`zone:pans` · expeditions/data/content.ts:431 · depth 2, Exposure every room

- _text:_ “The salt pans and brine flats at the edge of the estuary. Low mud walls cut the white crust into squares, and the only shelter is in the boiling huts.”
- _met here:_ Salt-cutter, Marsh hog, Fowler, Fen leeches
- _found here:_ Pan salt, Reagents, Old coin
- _curiosities:_ shrine, boathouse · _traps:_ brine, bog

#### The Withies (The Saltfens)

`zone:withies` · expeditions/data/content.ts:450 · depth 3, Exposure every room

- _text:_ “Willow beds cut through by deep channels, where the fens run into the river. You can see about as far as the next willow.”
- _met here:_ Fen leeches, Marsh hog, Fowler, Salt-cutter
- _found here:_ Reagents, Pan salt, Old coin
- _curiosities:_ shrine, boathouse · _traps:_ bog, snare

#### The hill road (Drover's Road)

`zone:hillroad` · expeditions/data/content.ts:469 · depth 1

- _text:_ “The Drover's Road climbing into the hills: stone walls, sheep, and long views of nobody coming to help.”
- _met here:_ Road agent, Hill wolf, Deserter
- _found here:_ Leather, Old coin
- _curiosities:_ shrine, strongbox · _traps:_ snare

#### Brannock Moor (Drover's Road)

`zone:brannock` · expeditions/data/content.ts:486 · depth 2

- _text:_ “The high moor the road crosses on its way to the pass: heather, standing water, old cairns and wind from every side at once.”
- _met here:_ Hill wolf, Reiver, Moor bull, Deserter
- _found here:_ Fleeces, Leather, Old coin
- _curiosities:_ cairn, shrine · _traps:_ snare, stampede

#### Skell Gap (Drover's Road)

`zone:skell` · expeditions/data/content.ts:504 · depth 3

- _text:_ “The pass at the top of the Drover's Road, between two scree slopes, with the old Crown toll house at the narrowest point.”
- _met here:_ Deserter, Road agent, Reiver, Moor bull
- _found here:_ Old coin, Fleeces, Leather
- _curiosities:_ cairn, strongbox · _traps:_ collapse, snare

#### The lake shore (Harrowmere)

`zone:shore` · expeditions/data/content.ts:522 · depth 1

- _text:_ “Shingle, boathouses and cold water, with the old bridge standing out over the mere.”
- _met here:_ Mere pike, Smuggler
- _found here:_ Timber, Old coin
- _curiosities:_ shrine, strongbox · _traps:_ snare

#### The bridge houses (Harrowmere)

`zone:bridge` · expeditions/data/content.ts:539 · depth 2, dark

- _text:_ “The houses built along the old bridge, empty since the middle span fell and the road was carried over the gap on timber. The floors have gone soft, and the water moves underneath all of it.”
- _met here:_ Smuggler, Night boatman, Crayfish, Mere pike
- _found here:_ Old coin, Bog oak, Timber
- _curiosities:_ strongbox, shrine · _traps:_ floor, snare

#### The Holms (Harrowmere)

`zone:holms` · expeditions/data/content.ts:557 · depth 3

- _text:_ “The islands out on the mere, reached by punt and by wading: alder, reed, a ruined chapel or two, and the deepest water anyone has sounded.”
- _met here:_ Mere pike, Crayfish, Smuggler, Night boatman
- _found here:_ Bog oak, Old coin, Timber
- _curiosities:_ boathouse, shrine · _traps:_ bog, snare

#### The Wenmouth road (Port Anselm)

`zone:wenmouth` · expeditions/data/content.ts:575 · depth 1

- _text:_ “The coast road to Port Anselm: salt marsh on one side, dunes on the other, and a ford at every river mouth.”
- _met here:_ Road agent, Deserter
- _found here:_ Old coin
- _curiosities:_ shrine, strongbox · _traps:_ snare

#### The Burrows (Port Anselm)

`zone:burrows` · expeditions/data/content.ts:589 · depth 2

- _text:_ “The dunes between the coast road and the sea, miles of them, full of marram grass and rabbit holes, with the ribs of old ships sticking out of the sand.”
- _met here:_ Wrecker, Herring gulls, Road agent, Deserter
- _found here:_ Old coin, Ambergris, Timber
- _curiosities:_ wreck, shrine · _traps:_ tide, snare

#### The Strand (Port Anselm)

`zone:strand` · expeditions/data/content.ts:607 · depth 3

- _text:_ “Port Anselm's waterfront, a mile of customs sheds and Ostrander's warehouses, with the bank's ships riding at anchor beyond the bar.”
- _met here:_ Tidewaiter, Guard, Herring gulls, Wrecker
- _found here:_ Old coin, Ambergris, Bonded brandy
- _curiosities:_ wreck, strongbox · _traps:_ tide, snare

### Goals

What each route length is for, as the board says it. A plain job on a long route stops short of the boss (_deep_).

| ID | Site | Length | Goal |
|---|---|---|---|
| `pellam_goal:short` | Old Pellam | Short | Through the Culverts to the old pump house |
| `pellam_goal:medium` | Old Pellam | Medium | Down to the Buried Streets and the old counting house |
| `pellam_goal:long` | Old Pellam | Long | To the bottom of the College Sink, where the Kiln Engine walks |
| `site_goal:varrow:short` | Varrow | Short | Through the Lower Town to the cooper's yard |
| `site_goal:varrow:medium` | Varrow | Medium | Down to the Quays and the bonded warehouse |
| `site_goal:varrow:long` | Varrow | Long | Into the Rookeries, to Rudd's yard |
| `site_goal:varrow:deep` | Varrow | Long, a plain job | To the far side of the Rookeries |
| `site_goal:kell:short` | Kell Mines | Short | Through the upper workings to the old winding shaft |
| `site_goal:kell:medium` | Kell Mines | Medium | Down into the Sump, to the drowned pump house |
| `site_goal:kell:long` | Kell Mines | Long | To the end of the Trevick level, where Gaffer Moyle holds the vein |
| `site_goal:kell:deep` | Kell Mines | Long, a plain job | To the end of the Trevick level |
| `site_goal:saltfens:short` | The Saltfens | Short | Along the reed paths to the cutters' landing |
| `site_goal:saltfens:medium` | The Saltfens | Medium | Out to the Pans and the old boiling house |
| `site_goal:saltfens:long` | The Saltfens | Long | Into the Withies, where the Dean lies up |
| `site_goal:saltfens:deep` | The Saltfens | Long, a plain job | Through the Withies to the river |
| `site_goal:drovers:short` | Drover's Road | Short | Along the hill road to the drovers' inn |
| `site_goal:drovers:medium` | Drover's Road | Medium | Across Brannock Moor to the standing cairn |
| `site_goal:drovers:long` | Drover's Road | Long | Up to Skell Gap and the old toll house |
| `site_goal:drovers:deep` | Drover's Road | Long, a plain job | Up to Skell Gap |
| `site_goal:harrowmere:short` | Harrowmere | Short | Along the shore to the boathouses |
| `site_goal:harrowmere:medium` | Harrowmere | Medium | Out along the bridge houses to the timber span |
| `site_goal:harrowmere:long` | Harrowmere | Long | Out to the Holms, where the Bailiff feeds |
| `site_goal:harrowmere:deep` | Harrowmere | Long, a plain job | Out to the far Holms |
| `site_goal:anselm:short` | Port Anselm | Short | Along the Wenmouth road to the ford |
| `site_goal:anselm:medium` | Port Anselm | Medium | Into the Burrows, to the wreck on the point |
| `site_goal:anselm:long` | Port Anselm | Long | Down the Strand to Mags Tull's cove |
| `site_goal:anselm:deep` | Port Anselm | Long, a plain job | To the end of the Strand |

### Bosses

Each is beaten once. After that, long routes end in its room with a lesser fight.

| ID | Site | Boss | Deed | First beaten (report) | Posting goal |
|---|---|---|---|---|---|
| `boss:pellam` | Old Pellam | the Kiln Engine | Broke the Kiln Engine | The college sends a cart for the Kiln Engine's core, and a letter that is mostly about who is going to pay for the cart. | Break the Kiln Engine |
| `boss:varrow` | Varrow | Lew Rudd | Put Lew Rudd out of business | The Lower Town hears about Rudd's yard before the squad is back on Tallow Street. Nobody admits to having worked for him, which is a first. | Put Lew Rudd out of business |
| `boss:kell` | Kell Mines | Gaffer Moyle | Threw Gaffer Moyle off the Trevick level | The lease-holders write to say they always knew the Trevick level was theirs, and ask whether the guild could also see about the pumps. | Throw Gaffer Moyle off the Trevick level |
| `boss:saltfens` | The Saltfens | the Dean | Killed the Dean | The salt-cutters send a ham, which is in poor taste, and a jar of pan salt, which is not. | Kill the Dean |
| `boss:drovers` | Drover's Road | Sergeant Crewe | Took the toll house at Skell Gap | The drovers bring their herds over the Gap without paying anybody for the first time in two years, and drink to the guild at the inn. | Take the toll house at Skell Gap from Sergeant Crewe |
| `boss:harrowmere` | Harrowmere | the Bailiff | Landed the Bailiff | Harrowmere hangs the Bailiff from the bridge for a week, and three different families claim the rings in its belly were their grandmother's. | Land the Bailiff |
| `boss:anselm` | Port Anselm | Mags Tull | Put out Mags Tull's lantern | The harbour master at Port Anselm writes to thank the guild, and to ask it not to mention the wreckers to the bank. | Put out Mags Tull's lantern |

### Monsters and people

_Met in_ lists the zones where they turn up, and the contract dangers that bring them anywhere. People can be talked to by an Envoy.

| ID | Name | Met in | Text |
|---|---|---|---|
| `monster:rats` | Culvert rats | the Culverts, the Buried Streets, the upper workings, the Sump, contracts with Swarm | A knot of rats the size of cats, fed on everything that comes down the drains. |
| `monster:moths` | Tallow moths | the Culverts, the Buried Streets | Pale moths as wide as a hand. They drink lamp oil, and they will drink it out of the lamp. |
| `monster:grubber` | Grubber (people) | the Culverts, the Buried Streets | People who live down here and dig for what Pellam left behind. They do not like company. |
| `monster:eel` | Sink eel | the Buried Streets | A grey eel as long as a cart, living in the flooded cellars. It strikes from the water first. |
| `monster:spider` | Cellar spider | the Buried Streets, the College Sink | A long-legged spider the color of wet plaster. Its bite keeps working after it lets go. |
| `monster:hog` | Pale hog | the Buried Streets | Pigs got down here a century ago and kept breeding. They are white and blind, and as big as ponies. |
| `monster:crab` | Sink crab | the Buried Streets, the College Sink | River crabs grown huge on reagent runoff. Blades skid off them. |
| `monster:seep` | Seep | the College Sink | A spill of spent reagents that never stopped reacting. It moves toward warmth and it burns what it touches. |
| `monster:engine` | Assay engine (engine) | the College Sink | An iron testing engine the Assay Office left running when it moved upstairs. It still tests anything it finds, very hard. |
| `monster:kiln` | the Kiln Engine (engine) | the boss room of Old Pellam (the College Sink) | The college's great reagent furnace, built to walk the length of the Sink and burn the spill. Nobody told it to stop. |
| `monster:claim_jumper` | Claim-jumper (people) | the upper workings, the Sump, the Trevick level | Miners working galleries that belong to somebody else. They would rather fight than be written down. |
| `monster:cave_crab` | Cave crab | the upper workings, the Sump, the Trevick level | Pale crabs that came up the flooded galleries and liked it. Blades skid off them. |
| `monster:salt_cutter` | Salt-cutter (people) | the reed paths, the Pans, the Withies | Cutters who stayed out on the pans too long. The fever took their manners first. |
| `monster:marsh_hog` | Marsh hog | the reed paths, the Pans, the Withies | A bristled black hog that lives in the reeds and charges anything that moves in them. |
| `monster:road_agent` | Road agent (people) | the hill road, Skell Gap, the Wenmouth road, the Burrows | A highwayman with a crossbow and a speech about tolls. |
| `monster:deserter` | Deserter (people) | the hill road, Brannock Moor, Skell Gap, the Wenmouth road, the Burrows, contracts with Soldiers | A soldier of the Ninth who walked away with his mail and his spear and kept walking. |
| `monster:wolf` | Hill wolf | the hill road, Brannock Moor, contracts with Beasts, contracts with Trolls | Grey hill wolves, thin from a bad winter and bolder than they should be. |
| `monster:pike` | Mere pike | the lake shore, the bridge houses, the Holms | A pike as long as a man that lies in the shallows and takes ankles. |
| `monster:smuggler` | Smuggler (people) | the lake shore, the bridge houses, the Holms | Lake people who move cargo at night and do not want to be counted. |
| `monster:footpad` | Footpad (people) | the Quays, the Rookeries | A quick hand with a short knife, who knows every alley and would rather you never saw their face. |
| `monster:lighterman` | Lighterman (people) | the Quays, the Rookeries | A boatman who unloads ships onto the quays by night, with a boat hook and strong opinions about who walks on their quay. |
| `monster:watch_sergeant` | Watch sergeant (people) | the Quays, the Rookeries | A sergeant of the watch with a brass badge and a pension to think about. Somebody other than the city is paying them tonight. |
| `monster:yard_dog` | Yard dog | the Quays, the Rookeries | A warehouse mastiff, kept hungry so it stays interested. |
| `monster:rudd` | Lew Rudd (people) | the boss room of Varrow (the Rookeries) | Lew Rudd rents out muscle by the day from a yard in the Rookeries. Half the thugs in the Lower Town have worked for him, and the other half owe him money. |
| `monster:powder_man` | Powder man (people) | the Sump, the Trevick level | A claim-jumper who handles the blasting powder, and throws it at people when there is no rock handy. Most of them are short of eyebrows. |
| `monster:pit_pony` | Pit pony | the Sump, the Trevick level | The ponies were left below when the mine closed. They found their own way to live, and they bite. |
| `monster:moyle` | Gaffer Moyle (people) | the boss room of Kell Mines (the Trevick level) | The claim-jumpers' captain. Moyle has held the Trevick level for six years without paying anybody for it, and keeps a keg of powder within reach of his chair. |
| `monster:leeches` | Fen leeches | the Pans, the Withies | Leeches as long as a hand, which come up out of the channels in a knot when anything warm steps in. |
| `monster:fowler` | Fowler (people) | the Pans, the Withies | A wildfowler with a punt gun, who shoots duck for the Varrow markets and anything else that comes through the withies uninvited. |
| `monster:dean` | the Dean | the boss room of the Saltfens (the Withies) | The oldest marsh boar in the fens, the size of a cart, with tusks like hay hooks. The cutters named it after the college's dean, and say the likeness is fair. |
| `monster:reiver` | Reiver (people) | Brannock Moor, Skell Gap | A cattle thief from the moor farms, who lifts other people's herds in the autumn and calls it a family trade. |
| `monster:moor_bull` | Moor bull | Brannock Moor, Skell Gap | A shaggy red bull that got away from a drove years ago and has run the moor since. It does not like the look of anybody. |
| `monster:crewe` | Sergeant Crewe (people) | the boss room of Drover's Road (Skell Gap) | Sergeant Abner Crewe walked out of the Ninth with twenty men and the regiment's colours. He holds the old toll house at Skell Gap, and charges a toll. |
| `monster:night_boatman` | Night boatman (people) | the bridge houses, the Holms | A smuggler's oarsman, with muffled oars and a cudgel under the thwart. |
| `monster:crayfish` | Crayfish | the bridge houses, the Holms | Lake crayfish the size of a cat, which live under the bridge piers and pinch anything that wades. |
| `monster:bailiff` | the Bailiff | the boss room of Harrowmere (the Holms) | The biggest pike in the mere, longer than a boat. The fishermen call it the Bailiff, because it takes its share of every catch. |
| `monster:wrecker` | Wrecker (people) | the Burrows, the Strand | Dune people who hang lanterns where ships will mistake them for the harbour, and are first down the beach in the morning. |
| `monster:tidewaiter` | Tidewaiter (people) | the Strand | A customs man on Ostrander's books, who guards the sheds on the Strand and does not care whose papers you have. |
| `monster:gulls` | Herring gulls | the Burrows, the Strand | Big grey gulls that have learned what a pack looks like. They will have whatever is in it. |
| `monster:tull` | Mags Tull (people) | the boss room of Port Anselm (the Strand) | Mags Tull runs the wreckers of the Burrows from a cove at the end of the Strand. She has lit the false lantern on more nights than the harbour master has lit the real one. |
| `monster:thug` | Hired thug (people) | the Lower Town, the Quays, the Rookeries, contracts with Thugs, contracts with Warded, contracts with Crowds | Muscle hired by the day. They are brave in a crowd and keen on being paid. |
| `monster:soldier` | Sell-sword (people) | contracts with Soldiers | Soldiers in armor who have been drilled, and are paid to stand still while you try to move them. |
| `monster:guard` | Guard (people) | the Lower Town, the Quays, the Strand, contracts with Watchful Guards, contracts with Warded | A watchman with a cudgel and a lantern, who will shout for his friends first. |
| `monster:hedge_wizard` | Hedge-wizard (people) | contracts with Warded | A wizard for hire with no license, hiding behind protective workings the college would never pass. |
| `monster:troll` | Troll | contracts with Trolls | A big grey troll that is in no hurry about anything. It heals while you watch, unless you burn it. |
| `monster:salamander` | Salamander | contracts with Fireborn | A lizard the length of a cart, living where the rock is warm. It burns what it bites. |
| `monster:rioter` | Rioter (people) | contracts with Crowds | Somebody with a grievance and a cobblestone. Hurting them costs the guild its name. |

_Source: expeditions/data/content.ts:164 onward._

### What a contract's dangers bring

| Danger | Down there |
|---|---|
| `tags:thugs` Thugs | fights with thugs |
| `tags:soldiers` Soldiers | fights with sell-swords and deserters |
| `tags:guards` Watchful Guards | fights with guards |
| `tags:beasts` Beasts | fights with hill wolves |
| `tags:swarm` Swarm | fights with culvert rats |
| `tags:warded` Warded | fights with hedge-wizards and guards and thugs |
| `tags:trolls` Trolls | fights with trolls and hill wolves |
| `tags:fireborn` Fireborn | fights with salamanders |
| `tags:crowd` Crowds | fights with rioters and thugs |
| `tags:armored` Armored | enemies wear more armor |
| `tags:cold` Cold | more fatigue every room |
| `tags:swamp` Swamp | more fatigue every room; heavy armor tires twice as fast |
| `tags:dark` Dark | the whole route is dark |
| `tags:night` Night | the whole route is dark; easier to slip past wanderers |
| `tags:rough` Rough Country | more fatigue every room |
| `tags:open_road` Open Road | harder to slip past wanderers |
| `tags:plague` Sickness | fever (Exposure every room), unless a Chaplain comes |
| `tags:urban` Urban | nothing extra |

### Professions in a fight

| ID | Profession | Ranks | Skill | Text |
|---|---|---|---|---|
| `delver:vanguard.1` | Vanguard | 1, 2 | Cover | Steps in front of a badly hurt friend and takes the hits meant for them. |
| `delver:vanguard.2` | Vanguard | 1, 2 | Shield bash | A lighter blow that can stun. |
| `delver:vanguard.3` | Vanguard | 1, 2 | Cut | A plain, heavy swing at the front rank. |
| `delver:skirmisher.1` | Skirmisher | 1, 2 | Two cuts | Two quick strikes at the front rank. |
| `delver:skirmisher.2` | Skirmisher | 1, 2 | Hamstring | Opens a wound that bleeds for two rounds. |
| `delver:marksman.1` | Marksman | 2, 3, 4 | Aimed shot | Reaches any rank and finds the weak places more often. |
| `delver:marksman.2` | Marksman | 2, 3, 4 | Pinning shot | Spoils the aim of the most dangerous enemy for two rounds. |
| `delver:arcanist.1` | Arcanist | 2, 3, 4 | Bolt | One dose of reagents, one target, in the focus's element. |
| `delver:arcanist.2` | Arcanist | 2, 3, 4 | Burst | Two doses, every enemy at once, for less each. |
| `delver:chaplain.1` | Chaplain | 1, 2, 3, 4 | Dress wounds | Heals a hurt friend in the middle of a fight. Bandages go twice as far in a Chaplain's hands. |
| `delver:chaplain.2` | Chaplain | 1, 2, 3, 4 | Second wind | Gets the most worn-out member back on their feet. |
| `delver:chaplain.3` | Chaplain | 1, 2, 3, 4 | Censer | With a censer and a dose of reagents, burns radiant light into the enemy. |
| `delver:scout.1` | Scout | 1, 2, 3, 4 | Eyes open | Better odds of spotting traps and ambushes, and of finding hidden caches. |
| `delver:scout.2` | Scout | 1, 2, 3, 4 | Knife in the gap | From the front, a knife that slips past armor. From the back, a shot or a thrown knife. |
| `delver:envoy.1` | Envoy | 2, 3, 4 | Parley | Before a fight with people, tries to talk them out of it, or buys them off with what the squad has found. |
| `delver:envoy.2` | Envoy | 2, 3, 4 | Hard words | In a fight, tells one of the other side something that makes them stop and think. They lose their next turn. |
| `delver:infiltrator.1` | Infiltrator | 1, 2 | Locks | Opens strongboxes and makes traps safe without using up tools. |
| `delver:infiltrator.2` | Infiltrator | 1, 2 | Sentries | Gets the squad past wanderers and sentries more often. |
| `delver:infiltrator.3` | Infiltrator | 1, 2 | From behind | A knife that goes past armor and finds the weak places. |

### The pack

| ID | Supply | Text |
|---|---|---|
| `supply:food` | Food | One feeds the squad once. They eat every few rooms and at every camp. It comes out of the guild's supplies. |
| `supply:bandages` | Bandages | Heal between rooms. Twice as good with a Chaplain standing. |
| `supply:oil` | Lamp oil | Dark places need light. One flask lights a room. |
| `supply:tools` | Tools | A crowbar and a bag of wedges. They make traps safe and force strongboxes, and they help with rubble. |
| `supply:masks` | Wet masks | Linen and charcoal, soaked before use. One keeps a member breathing cleaner in the College Sink: half the Exposure. |
| `supply:reagents` | Reagents | Doses for the Arcanist's spells and the Chaplain's censer. |
| `supply:draughts` | Draughts | Brings a member who goes down straight back up. No roll for their life. |

### Goods brought home

| ID | Name | Text |
|---|---|---|
| `good:coin` | Old coin | Old coin from before the river moved, or from somebody who will not miss it. Collectors pay for it by the purse. |
| `good:glass` | College glass | Retorts and lenses the college threw away. The glassblowers on Anvil Row buy them back. |
| `good:eel_oil` | Eel oil | Rendered from sink eels. The Mudlarks use it to waterproof everything. |
| `good:silver` | Pellam silver | Plate and candlesticks from houses that were rich two hundred years ago. |
| `good:salts` | Reagent salts | Crystals scraped from the Sink. Apothecaries ask no questions. |
| `good:seal` | Assay seals | Brass seals from the Assay Office's old engines. The Office pays to get them back. |
| `good:kiln_core` | Kiln core | The furnace heart of the Kiln Engine. The college would like it back, and will pay. |
| `good:brandy` | Bonded brandy | Brandy that was waiting on the Quays for the duty to be paid. It still is. |
| `good:rudd_book` | Rudd's book | Lew Rudd's ledger of who hired whom, for what and when. The watch would pay for it, and so would several people who would rather the watch never saw it. |
| `good:ore` | Silver ore | Grey rock with a shine in it, from the Kell veins. The Weighhouse assays it and pays by the sack. |
| `good:moyle_takings` | Moyle's takings | Six years of silver from a vein Gaffer Moyle never paid for, in a chest he kept under his chair. |
| `good:pan_salt` | Pan salt | White salt boiled off the Saltfens pans and pressed into cakes. Every kitchen in Varrow uses it, and Saint Oda's uses it on wounds. |
| `good:tusks` | The Dean's tusks | Two yellow tusks as long as a forearm. The college has asked for them, for reasons it will not put in writing. |
| `good:fleece` | Fleeces | Moor fleeces, greasy and thick, from sheep that will not miss them for long. |
| `good:colours` | The Ninth's colours | The regiment's flag, carried at Cassel Ford and carried off by Sergeant Crewe. Somebody in the Ninth will pay a great deal for it, or at least shout a great deal. |
| `good:bog_oak` | Bog oak | Oak that has lain in the mere for centuries and turned black and hard as iron. The furniture makers on Anvil Row fight over it. |
| `good:rings` | The Bailiff's rings | Mostly rings and buckles, with a bishop's seal among them, from the belly of the biggest pike in Harrowmere. Some of the owners are still alive. |
| `good:ambergris` | Ambergris | A grey waxy lump that washes up on the Burrows. It smells odd and the perfumers pay a fortune for it. |
| `good:salvage` | Tull's salvage | What the wreckers took off a dozen ships: plate and bolts of cloth, and a ship's figurehead with the name chiselled off. |
| `good:iron` | Iron | Ore and old iron. The Forge uses it. |
| `good:leather` | Leather | Hides for the Forge and the market. |
| `good:timber` | Timber | Seasoned wood for building and the Forge. |
| `good:reagents` | Reagents | Fen plants and salts for the Stillroom. |

### Scars, habits and Sink changes

Marks a member brings home. Sink changes are tier 1 (amusing), 2 (useful) or 3 (powerful).

| ID | Name | Text |
|---|---|---|
| `scar:bad_knee` | Bad knee | Dodge −4. |
| `scar:cracked_ribs` | Cracked ribs | Max HP −4. |
| `scar:burned_hand` | Burned hand | Aim −4. |
| `scar:half_ear` | Half an ear | Worse at spotting traps and ambushes. |
| `scar:limp` | A limp | Slower in a fight. |
| `scar:stitched_brow` | Stitched brow | Their life is a little safer when they go down. They have the knack of it now. |
| `scar:bite_scar` | A bite scar | Max HP −2. It aches when it rains, and it always rains. |
| `habit:hates_dark` | Hates the dark | Tires 2 faster in every dark room, from holding the lamp too tight. |
| `habit:jumpy` | Jumpy | Dodge +3, but tires 1 faster each room. |
| `habit:drinks` | Drinks | Shakes off fatigue faster at the guild and heals slower. |
| `habit:rat_fear` | Can't abide rats | Aim −10 against rats. |
| `habit:sleeps_badly` | Sleeps badly | Camps clear half as much of their fatigue. |
| `habit:hums` | Hums on the march | Tires 1 slower each room. The others have opinions about the tune. |
| `habit:steady_hands` | Steady hands | Aim +4. |
| `habit:counts_coin` | Counts the coins | Finds are worth a tenth more with them in the squad. |
| `habit:rat_hater` | Hates rats | Deals 3 more damage to rats. |
| `habit:old_hand` | Old hand at camp | Camps heal them a little more. |
| `change:violet_skin` | Violet skin (tier 1) | Seeps and the Kiln Engine do 2 less damage to them. The colour is lovely and does not wash off. |
| `change:copper_tongue` | A copper tongue (tier 1) | They can taste what a college still holds, so stills never hurt them. Everything else tastes of pennies. |
| `change:rat_smell` | Smells wrong to rats (tier 1) | Rats aim 12 worse at them. Dogs are not keen either. |
| `change:slow_stomach` | A slow stomach (tier 1) | A missed meal tires them half as much. They eat once a day at home and nobody likes watching. |
| `change:pale_eyes` | Pale eyes (tier 2) | No aim penalty in the dark, and a worse one with their mother. |
| `change:thick_hide` | A thick hide (tier 2) | Armor +1. Their skin has gone thick and stiff, and they can't feel a pinch. |
| `change:quick_blood` | Quick blood (tier 2) | Venom and bleeding stop after one round, and bandages heal them 4 more. |
| `change:deep_lungs` | Deep lungs (tier 2) | They take half the Exposure, and tire 1 slower each room. |
| `change:reagent_blood` | Reagent blood (tier 3) | Their first spell or censer in every fight costs no dose, and their weapon blows burn. |
| `change:iron_bones` | Iron bones (tier 3) | Max HP +6, and their life is much safer when they go down. |
| `change:storm_fingers` | Storm in the fingers (tier 3) | When a fight starts, a crack of storm jumps from their hands to the nearest enemy. |
| `change:sink_sense` | Sink sense (tier 3) | They can tell when something nearby is about to move: much better at spotting traps and slipping past wanderers. |
