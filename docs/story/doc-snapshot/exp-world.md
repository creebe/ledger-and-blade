## Expeditions: places, monsters and people

Every contract is walked as an expedition to a site. Old Pellam has three zones and the Kiln Engine; the other sites have one zone each for now. Door scenes (news brought to the yard as a squad sets out for a distant site) are in the thread On the road, in the Story threads. The story bible's account of all this is `docs/STORY.md` §5d.

### Sites

| ID | Site | Zones | Text |
|---|---|---|---|
| `site:pellam` | Old Pellam | the Culverts, the Buried Streets, the College Sink | The first town on the river, under Varrow's Lower Town. Its cellars and streets are still down there, and so is the drain where the college poured its spent reagents for a century. |
| `site:varrow` | Varrow | the Lower Town | Work in the city itself, where the trouble is guarded doors and angry crowds. |
| `site:kell` | Kell Mines | the upper workings | Silver workings in the northern hills, half of them flooded. |
| `site:saltfens` | The Saltfens | the reed paths | The marshes along the estuary, good for reagents and for catching fever. |
| `site:drovers` | Drover's Road | the hill road | The cattle road through the hills east of the city. |
| `site:harrowmere` | Harrowmere | the lake shore | A lake town with an old bridge. |
| `site:anselm` | Port Anselm | the Wenmouth road | The coast road to the port where Ostrander's ships take on the Crown's silver. |

_Source: expeditions/data/content.ts:391._

### Zones

#### The Culverts (Old Pellam)

`zone:culverts` · expeditions/data/content.ts:220 · depth 1

- _text:_ “Brick drains and cellars under the Lower Town. Grates let a little daylight down.”
- _met here:_ Culvert rats, Grubber, Tallow moths
- _found here:_ Old coin, College glass, Pellam silver
- _curiosities:_ shrine, strongbox, grubber_cache · _traps:_ tripwire, grate

#### The Buried Streets (Old Pellam)

`zone:streets` · expeditions/data/content.ts:238 · depth 2, dark, Exposure every room

- _text:_ “Pellam's old streets, roofed over by Varrow's foundations. The houses are full of silt.”
- _met here:_ Cellar spider, Pale hog, Culvert rats, Sink eel, Sink crab, Grubber, Tallow moths
- _found here:_ Pellam silver, College glass, Old coin, Assay seals
- _curiosities:_ shrine, strongbox, cart, still · _traps:_ floor, tripwire, gas

#### The College Sink (Old Pellam)

`zone:sink` · expeditions/data/content.ts:258 · depth 3, dark

- _text:_ “Where the college poured its spent reagents for a hundred years. The walls sweat colors.”
- _met here:_ Seep, Assay engine, Sink crab, Cellar spider
- _found here:_ Reagent salts, Assay seals, Pellam silver, College glass
- _curiosities:_ still, strongbox, shrine · _traps:_ gas, floor

#### The Lower Town (Varrow)

`zone:lowertown` · expeditions/data/content.ts:277 · depth 1

- _text:_ “Varrow's streets below the hill: yards, warehouses, back stairs and people who saw nothing.”
- _met here:_ Hired thug, Guard
- _found here:_ Old coin
- _curiosities:_ strongbox, shrine · _traps:_ snare

#### The upper workings (Kell Mines)

`zone:workings` · expeditions/data/content.ts:291 · depth 1, dark

- _text:_ “Galleries cut into the hill a century ago, propped with timber that has seen better centuries.”
- _met here:_ Claim-jumper, Cave crab, Culvert rats
- _found here:_ Iron, Old coin
- _curiosities:_ strongbox, shrine · _traps:_ collapse, gas

#### The reed paths (The Saltfens)

`zone:reeds` · expeditions/data/content.ts:308 · depth 1, Exposure every room

- _text:_ “Plank paths through reeds higher than a man, over water nobody should drink.”
- _met here:_ Marsh hog, Salt-cutter
- _found here:_ Reagents, Old coin
- _curiosities:_ shrine · _traps:_ bog

#### The hill road (Drover's Road)

`zone:hillroad` · expeditions/data/content.ts:326 · depth 1

- _text:_ “The Drover's Road climbing into the hills: stone walls, sheep, and long views of nobody coming to help.”
- _met here:_ Road agent, Hill wolf, Deserter
- _found here:_ Leather, Old coin
- _curiosities:_ shrine, strongbox · _traps:_ snare

#### The lake shore (Harrowmere)

`zone:shore` · expeditions/data/content.ts:343 · depth 1

- _text:_ “Shingle, boathouses and cold water, with the old bridge standing out over the mere.”
- _met here:_ Mere pike, Smuggler
- _found here:_ Timber, Old coin
- _curiosities:_ shrine, strongbox · _traps:_ snare

#### The Wenmouth road (Port Anselm)

`zone:wenmouth` · expeditions/data/content.ts:360 · depth 1

- _text:_ “The coast road to Port Anselm: salt marsh on one side, dunes on the other, and a ford at every river mouth.”
- _met here:_ Road agent, Deserter
- _found here:_ Old coin
- _curiosities:_ shrine, strongbox · _traps:_ snare

### Old Pellam's goals

The room at the end of each route length. Other sites use their goalroom lines (see the log lines).

| ID | Length | Goal |
|---|---|---|
| `pellam_goal:short` | Short | Through the Culverts to the old pump house |
| `pellam_goal:medium` | Medium | Down to the Buried Streets and the old counting house |
| `pellam_goal:long` | Long | To the bottom of the College Sink, where the Kiln Engine walks |

### Monsters and people

_Met in_ lists the zones where they turn up, and the contract dangers that bring them anywhere. People can be talked to by an Envoy.

| ID | Name | Met in | Text |
|---|---|---|---|
| `monster:rats` | Culvert rats | the Culverts, the Buried Streets, the upper workings, contracts with Swarm | A knot of rats the size of cats, fed on everything that comes down the drains. |
| `monster:moths` | Tallow moths | the Culverts, the Buried Streets | Pale moths as wide as a hand. They drink lamp oil, and they will drink it out of the lamp. |
| `monster:grubber` | Grubber (people) | the Culverts, the Buried Streets | People who live down here and dig for what Pellam left behind. They do not like company. |
| `monster:eel` | Sink eel | the Buried Streets | A grey eel as long as a cart, living in the flooded cellars. It strikes from the water first. |
| `monster:spider` | Cellar spider | the Buried Streets, the College Sink | A long-legged spider the color of wet plaster. Its bite keeps working after it lets go. |
| `monster:hog` | Pale hog | the Buried Streets | Pigs got down here a century ago and kept breeding. They are white and blind, and as big as ponies. |
| `monster:crab` | Sink crab | the Buried Streets, the College Sink | River crabs grown huge on reagent runoff. Blades skid off them. |
| `monster:seep` | Seep | the College Sink | A spill of spent reagents that never stopped reacting. It moves toward warmth and it burns what it touches. |
| `monster:engine` | Assay engine (engine) | the College Sink | An iron testing engine the Assay Office left running when it moved upstairs. It still tests anything it finds, very hard. |
| `monster:kiln` | the Kiln Engine (engine) | the bottom of the College Sink | The college's great reagent furnace, built to walk the length of the Sink and burn the spill. Nobody told it to stop. |
| `monster:claim_jumper` | Claim-jumper (people) | the upper workings | Miners working galleries that belong to somebody else. They would rather fight than be written down. |
| `monster:cave_crab` | Cave crab | the upper workings | Pale crabs that came up the flooded galleries and liked it. Blades skid off them. |
| `monster:salt_cutter` | Salt-cutter (people) | the reed paths | Cutters who stayed out on the pans too long. The fever took their manners first. |
| `monster:marsh_hog` | Marsh hog | the reed paths | A bristled black hog that lives in the reeds and charges anything that moves in them. |
| `monster:road_agent` | Road agent (people) | the hill road, the Wenmouth road | A highwayman with a crossbow and a speech about tolls. |
| `monster:deserter` | Deserter (people) | the hill road, the Wenmouth road, contracts with Soldiers | A soldier of the Ninth who walked away with his mail and his spear and kept walking. |
| `monster:wolf` | Hill wolf | the hill road, contracts with Beasts, contracts with Trolls | Grey hill wolves, thin from a bad winter and bolder than they should be. |
| `monster:pike` | Mere pike | the lake shore | A pike as long as a man that lies in the shallows and takes ankles. |
| `monster:smuggler` | Smuggler (people) | the lake shore | Lake people who move cargo at night and do not want to be counted. |
| `monster:thug` | Hired thug (people) | the Lower Town, contracts with Thugs, contracts with Warded, contracts with Crowds | Muscle hired by the day. They are brave in a crowd and keen on being paid. |
| `monster:soldier` | Sell-sword (people) | contracts with Soldiers | Soldiers in armor who have been drilled, and are paid to stand still while you try to move them. |
| `monster:guard` | Guard (people) | the Lower Town, contracts with Watchful Guards, contracts with Warded | A watchman with a cudgel and a lantern, who will shout for his friends first. |
| `monster:hedge_wizard` | Hedge-wizard (people) | contracts with Warded | A wizard for hire with no license, hiding behind protective workings the college would never pass. |
| `monster:troll` | Troll | contracts with Trolls | A big grey troll that is in no hurry about anything. It heals while you watch, unless you burn it. |
| `monster:salamander` | Salamander | contracts with Fireborn | A lizard the length of a cart, living where the rock is warm. It burns what it bites. |
| `monster:rioter` | Rioter (people) | contracts with Crowds | Somebody with a grievance and a cobblestone. Hurting them costs the guild its name. |

_Source: expeditions/data/content.ts:162 onward._

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
