## Contracts

Job templates on the board. A contract takes one of its titles at random. Story contracts also appear under the scene that adds them.

### Contract: The Cellar Rats

`contract:pellam_rats` · data/contracts.ts:51

- _type:_ “Hunt”
- _titles[1]:_ “The Cellar Rats”
- _titles[2]:_ “Rats under Tallow Street”
- _description:_

  > The Porters' Fraternity will pay to have fewer rats coming up through the Tallow Street cellars. Kill four knots of them in the Culverts.

- _phases[1]:_ “The Culverts: Down the steps behind the chandler's.”

### Contract: A Survey of the Streets

`contract:pellam_streets` · data/contracts.ts:71

- _type:_ “Survey”
- _titles[1]:_ “A Survey of the Streets”
- _titles[2]:_ “How Wrong the Map Is”
- _description:_

  > The Exchequer has a map of Pellam from two hundred years ago and would like to know how wrong it is. Reach the Buried Streets and come back.

- _phases[1]:_ “The Buried Streets: Down through the Culverts and on.”

### Contract: Pellam Plate

`contract:pellam_plate` · data/contracts.ts:91

- _type:_ “Salvage”
- _titles[1]:_ “Pellam Plate”
- _titles[2]:_ “Silver by Weight”
- _description:_

  > The Weighhouse will weigh any Pellam silver you bring back and pay for it by weight, which the aldermen say is the only honest way to pay for anything. They want two pieces.

- _phases[1]:_ “The Buried Streets: The old merchants' houses.”

### Contract: Eel Oil for the Flats

`contract:pellam_eels` · data/contracts.ts:111

- _type:_ “Hunt”
- _titles[1]:_ “Eel Oil for the Flats”
- _titles[2]:_ “An Eel for Wenna Pask”
- _description:_

  > Wenna Pask's people need eel oil for their boats, and she says the eels are easy if you don't mind eels. Kill one in the flooded cellars of the Buried Streets.

- _phases[1]:_ “The flooded cellars: Where the eels are.”

### Contract: The Assay Seals

`contract:pellam_seals` · data/contracts.ts:131

- _type:_ “Salvage”
- _titles[1]:_ “The Assay Seals”
- _titles[2]:_ “Brass for the Exchequer”
- _description:_

  > The Exchequer wants the Assay Office's lost seals found before the Office finds them and claims it never lost them. Bring back one.

- _phases[1]:_ “The Buried Streets: Wherever the engines walked.”

### Contract: Salts for the Fever Beds

`contract:pellam_salts` · data/contracts.ts:151

- _type:_ “Salvage”
- _titles[1]:_ “Salts for the Fever Beds”
- _titles[2]:_ “Sister Brune's Order”
- _description:_

  > Sister Brune needs reagent salts for the fever beds and would rather not buy them from an apothecary who asks no questions. She wants two jars from the College Sink.

- _phases[1]:_ “The College Sink: All the way down.”

### Contract: How Deep It Goes

`contract:pellam_deep` · data/contracts.ts:171

- _type:_ “Survey”
- _titles[1]:_ “How Deep It Goes”
- _titles[2]:_ “Vorn's Account of the Sink”
- _description:_

  > Factor Vorn wants a reliable account of the College Sink. The bank holds a note on the college and likes to know what it owns.

- _phases[1]:_ “The College Sink: All the way down.”
- _Reads:_ `ostranders_open` (from **A Visitor from Ostrander's** (`ostrander_agent`), **Quarter Day** (`quarter_day`), rules in `src/engine/actions.ts`)

### Contract: Put Out the Kiln

`contract:pellam_kiln` · data/contracts.ts:192

- _type:_ “Hunt”
- _titles[1]:_ “Put Out the Kiln”
- _description:_

  > The college has asked the Crown, which has asked you, to stop the Kiln Engine before it walks into the river and boils it.

- _phases[1]:_ “The Kiln Engine: At the bottom of the Sink.”

### Contract: Wolves on the Drover's Road

`contract:wolf_cull` · data/contracts.ts:214

- _type:_ “Hunt”
- _titles[1]:_ “Wolves on the Drover's Road”
- _titles[2]:_ “The Hill Pack”
- _titles[3]:_ “Cull the Pack”
- _description:_

  > Drovers are losing cattle, and now a boy is missing. Clear the pack before the autumn drive.

- _phases[1]:_ “Track: Follow the spoor into the hills.”
- _phases[2]:_ “The Hunt: Corner the pack and end it.”
- _phases[3]:_ “Return: Bring the pelts home.”

### Contract: Wool to Harrowmere

`contract:caravan_escort` · data/contracts.ts:243

- _type:_ “Escort”
- _titles[1]:_ “Wool to Harrowmere”
- _titles[2]:_ “The Spice Wagons”
- _titles[3]:_ “A Merchant Train”
- _description:_

  > A Weighhouse caravan needs swords. Bandits have been thick on the road since the war-pensions stopped.

- _phases[1]:_ “The Road: Walk beside slow oxen for days, eating their dust.”
- _phases[2]:_ “Ambush: Fight them off, or slip the wagons past by a back road.”
- _phases[3]:_ “Toll Bridge: Talk the caravan through the Crown's toll-keepers.”

### Contract: A Matter of Arrears

`contract:debt_collection` · data/contracts.ts:267

- _type:_ “Collection”
- _titles[1]:_ “A Matter of Arrears”
- _titles[2]:_ “The Chandler Owes”
- _titles[3]:_ “Recover the Pledge”
- _description:_

  > Ostrander's wants a debtor's pledged goods recovered before they vanish downriver. The bank pays well and doesn't need to hear how it was done.

- _phases[1]:_ “Locate: Find where the goods are hidden.”
- _phases[2]:_ “Confront: Persuade the household to hand them over, or take them.”
- _phases[3]:_ “Haul: Get it all back to the bank before the street turns.”
- _Reads:_ `ostranders_open` (from **A Visitor from Ostrander's** (`ostrander_agent`), **Quarter Day** (`quarter_day`), rules in `src/engine/actions.ts`)

### Contract: The Tax Wagons

`contract:tax_escort` · data/contracts.ts:292

- _type:_ “Escort”
- _titles[1]:_ “The Tax Wagons”
- _titles[2]:_ “The Crown's Collection”
- _titles[3]:_ “Quarter-Day Levy”
- _description:_

  > The Exchequer's tax-farmers need protection while they collect the debt levy in the Lower Town.

- _phases[1]:_ “Muster: Coordinate with the tax-farmers, who distrust you.”
- _phases[2]:_ “The Streets: Keep the crowd back from the wagons.”
- _phases[3]:_ “The Vault: Get the coin to the Exchequer vault intact.”

### Contract: Hold the Bread Market

`contract:riot_guard` · data/contracts.ts:316

- _type:_ “Peacekeeping”
- _titles[1]:_ “Hold the Bread Market”
- _titles[2]:_ “The Fishmarket Crowd”
- _titles[3]:_ “A Night of Torches”
- _description:_

  > Bread prices rose again. The Exchequer wants the market kept open and calm without the royal guard. A riot would embarrass the Crown.

- _phases[1]:_ “Disperse: Calm the crowd, or break it.”
- _phases[2]:_ “Hold: Hold the square until dawn.”

### Contract: Grain for the Lower Town

`contract:bread_convoy` · data/contracts.ts:339

- _type:_ “Smuggling”
- _titles[1]:_ “Grain for the Lower Town”
- _titles[2]:_ “The Miller's Favor”
- _titles[3]:_ “Under the Toll Chain”
- _description:_

  > Ostrander's has bought the river tolls, and grain sits rotting at the chain. The Lower Town wants it moved at night, without paying.

- _phases[1]:_ “Load: Load heavy sacks onto dark barges without making a sound.”
- _phases[2]:_ “The Toll Chain: Slip past the bank's toll-men, or bribe them.”
- _phases[3]:_

  > Distribute: Get the grain to the bakers before dawn, and keep the crowd from fighting over it.


### Contract: Who Is Clipping the Penny?

`contract:clipped_coin` · data/contracts.ts:364

- _type:_ “Investigation”
- _titles[1]:_ “Who Is Clipping the Penny?”
- _titles[2]:_ “Light Coins”
- _titles[3]:_ “The Counterfeit Mint”
- _description:_

  > Light coins are flooding the market. Someone is clipping or forging the Crown Penny, and the Exchequer needs a name before Coin Trust falls any further.

- _phases[1]:_ “Inquiry: Ask the moneychangers the right questions.”
- _phases[2]:_ “The Workshop: Get into the forger's workshop. An Arcanist can trace the alloy.”
- _phases[3]:_ “The Arrest: Take the forger alive.”

### Contract: The Flooded Gallery

`contract:flooded_mine` · data/contracts.ts:388

- _type:_ “Clearance”
- _titles[1]:_ “The Flooded Gallery”
- _titles[2]:_ “Kell Deep Workings”
- _titles[3]:_ “Something in the Silver”
- _description:_

  > A silver gallery at Kell was abandoned after the flood. The miners say something nests down there now. With the Crown Penny the way it is, silver is worth more than ever.

- _phases[1]:_ “Descent: Climb down through the flooded shafts.”
- _phases[2]:_ “Clear the Nest: Whatever lives down here has to go.”
- _phases[3]:_ “Recover: Haul ore and reagents back up.”

### Contract: Fen-lily Harvest

`contract:fen_harvest` · data/contracts.ts:416

- _type:_ “Expedition”
- _titles[1]:_ “Fen-lily Harvest”
- _titles[2]:_ “Reagents from the Saltfens”
- _titles[3]:_ “The Marsh Gatherers”
- _description:_

  > Fen-lily and bog-amber are selling for triple their usual price since the bank bought the reagent warrants. Bring back a cartload.

- _phases[1]:_ “The March: Wade through the fens for days.”
- _phases[2]:_ “Harvest: Gather quietly, or let an Arcanist find the richest beds.”
- _phases[3]:_ “Return: Get the cart out of the mud.”

### Contract: Lighten the Bank's Warehouse

`contract:warehouse_job` · data/contracts.ts:442

- _type:_ “Heist”
- _titles[1]:_ “Lighten the Bank's Warehouse”
- _titles[2]:_ “The Pledge-House”
- _titles[3]:_ “Seized Goods”
- _description:_

  > Ostrander's has seized a whole street's tools and looms as pledges. The Lower Town wants them back, quietly.

- _phases[1]:_ “Case the Place: Learn the patrols and the locks.”
- _phases[2]:_ “Break In: Get through the locks and the wards.”
- _phases[3]:_ “Getaway: Get out with the goods before anyone raises the alarm.”

### Contract: The Bridge at Harrowmere

`contract:troll_bridge` · data/contracts.ts:467

- _type:_ “Hunt”
- _titles[1]:_ “The Bridge at Harrowmere”
- _titles[2]:_ “Toll of the Troll”
- _titles[3]:_ “Under the Old Bridge”
- _description:_

  > A hill troll has taken the old Harrowmere bridge, and trade is backing up for leagues. It must be killed or driven off.

- _phases[1]:_ “Approach: Reach the bridge without being seen.”
- _phases[2]:_ “The Fight: It heals as fast as you cut it.”
- _phases[3]:_ “Aftermath: Clear the bridge for traffic.”

### Contract: Deliver the Bank's Terms

`contract:deliver_terms` · data/contracts.ts:492

- _type:_ “Diplomacy”
- _titles[1]:_ “Deliver the Bank's Terms”
- _titles[2]:_ “A Letter for Lord Harl”
- _titles[3]:_ “Notice of Foreclosure”
- _description:_

  > Ostrander's needs its terms delivered to a noble debtor who has stopped opening his letters. They must be read aloud, and he must sign.

- _phases[1]:_ “The Ride: Ride out to the debtor's hall.”
- _phases[2]:_ “The Audience: Make him listen, and make him sign.”
- _phases[3]:_ “Leaving Alive: His retainers may not take it well.”
- _Reads:_ `ostranders_open` (from **A Visitor from Ostrander's** (`ostrander_agent`), **Quarter Day** (`quarter_day`), rules in `src/engine/actions.ts`)

### Contract: Nights at the Almshouse

`contract:almshouse_watch` · data/contracts.ts:518

- _type:_ “Peacekeeping”
- _titles[1]:_ “Nights at the Almshouse”
- _titles[2]:_ “The Almshouse Gate”
- _titles[3]:_ “Keep Saint Oda's Door”
- _description:_

  > The almshouse has more people at its gate than beds inside, and the Sisters have stopped sleeping. They want steady hands on the door for a few nights. It pays in bread and gratitude, and a little coin.

- _phases[1]:_ “The Queue: Decide who gets a bed, and say it kindly.”
- _phases[2]:_ “After Dark: Somebody always tries the back door.”

### Contract: Fever at Coldharbour

`contract:fever_village` · data/contracts.ts:542

- _type:_ “Expedition”
- _titles[1]:_ “Fever at Coldharbour”
- _titles[2]:_ “The Fen Villages”
- _titles[3]:_ “Carry the Sisters Out”
- _description:_

  > Marsh fever has taken hold in the fen villages, and two Sisters want to go out with medicines. Somebody has to get them there through the marsh and bring them home again.

- _phases[1]:_ “The Causeway: Keep the cart on the planks.”
- _phases[2]:_ “The Village: Help the Sisters work, and try not to catch it.”
- _phases[3]:_ “Home: Get everyone back before the tide.”

### Contract: Keep the Assessors Out

`contract:assessors_out` · data/contracts.ts:568

- _type:_ “Peacekeeping”
- _titles[1]:_ “Keep the Assessors Out”
- _titles[2]:_ “A Castle Under Notice”
- _titles[3]:_ “The Gate at Aske”
- _description:_

  > The bank's assessors are coming to list everything a noble house owns, and the family would like them to be delayed. Nobody is to be hurt. The family is quite firm on that, because the family will be blamed.

- _phases[1]:_ “The Ride Out: Get there before the assessors do.”
- _phases[2]:_ “The Gate: Lose their paperwork, block the road, or argue the law.”

### Contract: A Missing Heirloom

`contract:heirloom` · data/contracts.ts:591

- _type:_ “Investigation”
- _titles[1]:_ “A Missing Heirloom”
- _titles[2]:_ “The Countess's Rings”
- _titles[3]:_ “Who Sold the Seal?”
- _description:_

  > Something old and valuable has gone missing from a noble house, and the family suspects a servant who left in a hurry. They want it back before anyone at court hears it was ever gone.

- _phases[1]:_ “Questions: Find out who had a key, and who needed money.”
- _phases[2]:_ “The Pawnshop: Get it back without a scene.”

### Contract: Under the Chain

`contract:under_chain` · data/contracts.ts:615

- _type:_ “Smuggling”
- _titles[1]:_ “Under the Chain”
- _titles[2]:_ “A Barge at Low Tide”
- _titles[3]:_ “Round the Toll”
- _description:_

  > A barge-load of wool needs to pass the river chain without paying the bank's toll. The Mudlarks know the channel. They need people to pole, watch and, if it comes to it, argue.

- _phases[1]:_ “Low Tide: Pole the barge through the shallows under the chain.”
- _phases[2]:_ “The Toll-Boat: If the toll-men see you, give them a reason to look away.”

### Contract: The Sunken Barge

`contract:river_salvage` · data/contracts.ts:639

- _type:_ “Expedition”
- _titles[1]:_ “The Sunken Barge”
- _titles[2]:_ “What the River Took”
- _titles[3]:_ “Salvage at the Old Wharf”
- _description:_

  > A grain barge went down by the old wharf, and the river will give back its iron fittings and timber to whoever gets there first. The mud is deep, and something has been nesting in the wreck.

- _phases[1]:_ “The Flats: Wade out before the tide turns.”
- _phases[2]:_ “The Wreck: Clear out whatever lives in it, and start prying.”

### Contract: Short Weight at Hesketh's

`contract:false_weights` · data/contracts.ts:664

- _type:_ “Story”
- _titles[1]:_ “Short Weight at Hesketh's”
- _description:_

  > Alderman Coster believes Hesketh's grain store on Fish Quay sells by a doctored measure. He needs someone outside the Weighhouse to buy a sack, weigh it on honest scales, and get a look at the measure Hesketh actually uses.

- _phases[1]:_ “The Purchase: Buy a sack like any other customer, and keep the receipt.”
- _phases[2]:_ “The Back Room: Get a look at the measure he keeps under the counter.”
- _expire.title:_ “Nobody went to Hesketh's”
- _expire.text:_

  > Coster's job sat on the board until Hesketh heard someone was asking about his measures and replaced them. Coster has noted it, as he notes everything.

- _Sets:_ `weights_exposed` → **Half a Year** (`act1_slice_end`); `weights_failed` → **Half a Year** (`act1_slice_end`)

### Contract: Salts for Saint Oda's

`contract:fever_salts` · data/contracts.ts:692

- _type:_ “Story”
- _titles[1]:_ “Salts for Saint Oda's”
- _description:_

  > The almshouse needs fen salts for the fever, and the apothecaries want more than the Sisters can pay. The salts grow along the reed paths past the last causeway in the Saltfens. Sister Brune will pay what she can, which is not much.

- _phases[1]:_ “The Causeway: Two days on planks across the marsh.”
- _phases[2]:_ “The Salt Pans: Scrape the good salt and leave the poisoned beds alone.”
- _phases[3]:_ “Home Again: Carry it back dry.”
- _expire.title:_ “The fever salts never came”
- _expire.text:_

  > Nobody went to the Saltfens. Sister Brune bought what she could from the apothecaries on credit, and the almshouse buried four people that week.

- _Sets:_ `salts_delivered` → **Half a Year** (`act1_slice_end`); `salts_failed` → **Half a Year** (`act1_slice_end`)

### Contract: Ansel Fell at the Chain

`contract:ansel_chain` · data/contracts.ts:722

- _type:_ “Story”
- _titles[1]:_ “Ansel Fell at the Chain”
- _description:_

  > Dagny's brother Ansel was caught smuggling wool under the river chain, and the bank's toll-men are holding him in the chain-house. In ten days he goes to the galleys at Anselm. Talk him out, buy him out or break him out.

- _phases[1]:_ “The Chain-House: Find out who holds the keys and what they want.”
- _phases[2]:_ “Getting Him Out: Out the door, or out the window.”
- _expire.title:_ “Ansel Fell goes to the galleys”
- _expire.text:_

  > Nobody came for Ansel. The toll-men put him on a cart for Anselm with six others, and Dagny walked beside it as far as the city gate.

- _Sets:_ `ansel_freed` → **Half a Year** (`act1_slice_end`); `ansel_lost` → **Half a Year** (`act1_slice_end`)

### Contract: The Exchequer's Last Tapestry

`contract:last_tapestry` · data/contracts.ts:750

- _type:_ “Story”
- _titles[1]:_ “The Exchequer's Last Tapestry”
- _description:_

  > The last tapestry in the Exchequer, rolled in sacking, has to reach a buyer in Harrowmere without anyone learning the Crown is selling its walls. The money pays the Crown's clerks for another season.

- _phases[1]:_ “Out of the City: Get a cart out of the Exchequer yard without being remembered.”
- _phases[2]:_ “The Road: Somebody has heard what is in the sacking.”
- _phases[3]:_ “The Buyer: Get the agreed price, in coin that is not clipped.”
- _expire.title:_ “The tapestry stayed in the yard”
- _expire.text:_

  > The cart never left. Fenn sold the tapestry in Varrow in the end, for a third of its worth, and by the end of the week the whole city knew.

- _Sets:_ `tapestry_sold` → **Half a Year** (`act1_slice_end`); `tapestry_lost` → **Half a Year** (`act1_slice_end`)

### Contract: The Aske Silver

`contract:aske_plate` · data/contracts.ts:779

- _type:_ “Story”
- _titles[1]:_ “The Aske Silver”
- _description:_

  > Lady Aske wants her family's silver out of the castle before the bank's assessors list it. It is illegal, it is heavy, and the assessors could arrive any day.

- _phases[1]:_ “Packing: Wrap two hundred years of silver in straw, quietly.”
- _phases[2]:_ “The Back Road: The assessors have men on the main road.”
- _expire.title:_ “The assessors reached Aske first”
- _expire.text:_

  > Nobody went for the silver. The bank's assessors listed every spoon, and Lady Aske signed the inventory herself.

- _Sets:_ `aske_plate_saved` → **Half a Year** (`act1_slice_end`); `aske_plate_lost` → **Half a Year** (`act1_slice_end`)

### Contract: Beat them to a job

`contract:op_intercept` · data/contracts.ts:809

- _type:_ “Operation”
- _titles[1]:_ “Beat them to a job”
- _phases[1]:_ “Get There First: Ride hard and arrive before they do.”
- _phases[2]:_ “Do Their Job: Finish the work and collect the pay in your own name.”

### Contract: A raid

`contract:op_raid` · data/contracts.ts:832

- _type:_ “Operation”
- _titles[1]:_ “A raid”
- _phases[1]:_ “The Watch: Learn the route and the guards.”
- _phases[2]:_ “The Hit: Take it, and be gone before anyone can follow.”

### Contract: A death

`contract:op_kill` · data/contracts.ts:856

- _type:_ “Operation”
- _titles[1]:_ “A death”
- _phases[1]:_ “Their Habits: Learn where they go and who goes with them.”
- _phases[2]:_ “The Knife: One chance. Make it count.”
- _phases[3]:_ “Away Clean: Leave nothing that points home.”

### Contract: The Crown's Last Silver

`contract:silver_convoy` · data/contracts.ts:880

- _type:_ “Story”
- _titles[1]:_ “The Crown's Last Silver”
- _description:_

  > The Exchequer has scraped together the realm's overdue payment: three wagons of silver bound for Port Anselm and Ostrander's ships. Someone does not want it to arrive. If it fails, the Crown defaults.

- _phases[1]:_ “Muster at the Vault: Sort the Exchequer's honest clerks from the bought ones.”
- _phases[2]:_ “The King's Road: Two weeks of road with a fortune in the wagons.”
- _phases[3]:_

  > Ambush at the Ford: Someone will be waiting. Fight them, or take the wagons the long way round.

- _phases[4]:_ “The Harbor: Hand the silver to the bank's factor, and count every coin twice.”
- _expire.title:_ “The escort never came”
- _expire.text:_

  > You accepted the commission, but no squad was ever sent. The Exchequer's own guard took the wagons as far as Wenmouth ford and waited there for you until the ships had sailed. The Crown has missed its payment.

- _Sets:_ `silver_delivered` → **The Notice Board** (`vorn_board`), **Quarter Day** (`quarter_day`), **The Last Tapestry** (`fenn_tapestry`), **Half a Year** (`act1_slice_end`), street talk "paid_talk" (`paid_talk`), Date "The Lord Treasurer Visits" (`treasurer_visit`); `silver_lost` → **The Notice Board** (`vorn_board`), **Quarter Day** (`quarter_day`), **The Last Tapestry** (`fenn_tapestry`), **The Family Silver** (`aske_plate`), **Half a Year** (`act1_slice_end`), codex "The Treaty of Cassel" (`the_treaty`), street talk "default_talk" (`default_talk`), rules in `src/engine/core/turn.ts`; `silver_abandoned` → **Half a Year** (`act1_slice_end`), **The Crown's Wagons** (`field_crown_wagons`)

### Contract: Duty Unpaid

`contract:varrow_brandy` · data/contracts-sites.ts:16

- _type:_ “Salvage”
- _titles[1]:_ “Duty Unpaid”
- _titles[2]:_ “The Bonded Brandy”
- _description:_

  > There is brandy sitting in the bonded warehouses on the Quays that nobody has paid duty on, and the Exchequer would like three casks of it as evidence. It would also like the evidence back unopened.

- _phases[1]:_ “The Quays: Down the river stairs after dark.”

### Contract: The Warehouse Dogs

`contract:varrow_dogs` · data/contracts-sites.ts:32

- _type:_ “Hunt”
- _titles[1]:_ “The Warehouse Dogs”
- _titles[2]:_ “Dogs on the Quays”
- _description:_

  > Somebody on the Quays has started keeping mastiffs in the yards, and two porters have been bitten on the way to work. The Fraternity wants two of the dogs dealt with.

- _phases[1]:_ “The Quays: Down past the chain-house.”

### Contract: Rudd's Yard

`contract:varrow_rudd` · data/contracts-sites.ts:48

- _type:_ “Hunt”
- _titles[1]:_ “Rudd's Yard”
- _titles[2]:_ “Muscle for Hire”
- _description:_

  > Every crowd that gets broken up in the Lower Town is broken up by men Lew Rudd hired out that morning. The Porters' Fraternity would like him out of business, and has taken up a collection.

- _phases[1]:_ “Rudd's yard: At the bottom of the Rookeries.”

### Contract: Ore by the Sack

`contract:kell_ore` · data/contracts-sites.ts:67

- _type:_ “Salvage”
- _titles[1]:_ “Ore by the Sack”
- _titles[2]:_ “Assay Samples”
- _description:_

  > The Weighhouse wants three sacks of silver ore out of the Sump to assay, so it can decide what the Kell veins are worth before somebody else does.

- _phases[1]:_ “The Sump: Down the ladder into the water.”

### Contract: The Bank's Warrants

`contract:kell_sump` · data/contracts-sites.ts:83

- _type:_ “Survey”
- _titles[1]:_ “The Bank's Warrants”
- _titles[2]:_ “How Deep the Water Is”
- _description:_

  > Ostrander's bought the Crown's silver warrants for Kell, and Factor Vorn's office would like to know what it bought. Somebody has to go down into the Sump and see how deep the water is.

- _phases[1]:_ “The Sump: Through the upper workings and down.”
- _Reads:_ `ostranders_open` (from **A Visitor from Ostrander's** (`ostrander_agent`), **Quarter Day** (`quarter_day`), rules in `src/engine/actions.ts`)

### Contract: The Trevick Level

`contract:kell_moyle` · data/contracts-sites.ts:100

- _type:_ “Hunt”
- _titles[1]:_ “The Trevick Level”
- _titles[2]:_ “Moyle's Vein”
- _description:_

  > Gaffer Moyle has worked the best silver in Kell for six years without paying a penny for it. The Weighhouse merchants who lease the workings from the bank would like him off the Trevick level, by whatever means the guild thinks best.

- _phases[1]:_ “The Trevick level: At the end of the old silver gallery.”

### Contract: Salt for the Wounds

`contract:fens_salt` · data/contracts-sites.ts:119

- _type:_ “Salvage”
- _titles[1]:_ “Salt for the Wounds”
- _titles[2]:_ “Pan Salt”
- _description:_

  > Saint Oda's goes through salt faster than the apothecaries can sell it at a fair price. Sister Brune's almoners want four cakes of pan salt from the Saltfens, and they want it clean.

- _phases[1]:_ “The Pans: Out past the reed paths.”

### Contract: The Dean

`contract:fens_dean` · data/contracts-sites.ts:135

- _type:_ “Hunt”
- _titles[1]:_ “The Dean”
- _titles[2]:_ “A Boar in the Withies”
- _description:_

  > The salt-cutters will not work the Withies while the Dean is in them, and Varrow is running short of salt. Somebody has to go and have a word with it.

- _phases[1]:_ “The Withies: Where the fens run into the river.”

### Contract: The Brannock Bull

`contract:drovers_bull` · data/contracts-sites.ts:154

- _type:_ “Hunt”
- _titles[1]:_ “The Brannock Bull”
- _titles[2]:_ “A Bull on the Moor”
- _description:_

  > A moor bull has been scattering the droves on Brannock Moor all autumn. The cattle dealers would pay to have it gone before the next herd comes through.

- _phases[1]:_ “Brannock Moor: Up onto the moor.”

### Contract: Moor Fleeces

`contract:drovers_fleece` · data/contracts-sites.ts:170

- _type:_ “Salvage”
- _titles[1]:_ “Moor Fleeces”
- _titles[2]:_ “The Wool Clip”
- _description:_

  > The reivers have been lifting fleeces off the moor farms and selling them in Varrow at half the price. The wool merchants want four of them back, to prove where they came from.

- _phases[1]:_ “Brannock Moor: Across the heather.”

### Contract: The Toll House at Skell Gap

`contract:drovers_crewe` · data/contracts-sites.ts:186

- _type:_ “Hunt”
- _titles[1]:_ “The Toll House at Skell Gap”
- _titles[2]:_ “Crewe's Toll”
- _description:_

  > A sergeant who walked out of the Ninth is charging the Crown's own toll at Skell Gap and keeping it. The Exchequer would like the toll house back.

- _phases[1]:_ “Skell Gap: At the top of the pass.”

### Contract: Bog Oak

`contract:mere_oak` · data/contracts-sites.ts:205

- _type:_ “Salvage”
- _titles[1]:_ “Bog Oak”
- _titles[2]:_ “Black Timber”
- _description:_

  > An armorer on Anvil Row has a commission for a presentation shield from a man who can afford one, and needs two lengths of bog oak out of Harrowmere for its boards.

- _phases[1]:_ “The bridge houses: Out along the old bridge.”

### Contract: Old Gullet

`contract:mere_bailiff` · data/contracts-sites.ts:221

- _type:_ “Hunt”
- _titles[1]:_ “Old Gullet”
- _titles[2]:_ “The Big Pike”
- _description:_

  > The fishermen of Harrowmere have lost two boats and a boy's leg to the pike they call Old Gullet. They have asked the river people in Varrow who might help, and the river people have asked you.

- _phases[1]:_ “The Holms: Out on the deep water.”

### Contract: Ambergris

`contract:anselm_ambergris` · data/contracts-sites.ts:240

- _type:_ “Salvage”
- _titles[1]:_ “Ambergris”
- _titles[2]:_ “What the Sea Brings”
- _description:_

  > A perfumer on Quay Street will pay very well for two lumps of ambergris off the Burrows, and asks that nobody tells the wreckers what it is worth.

- _phases[1]:_ “The Burrows: Off the road and into the dunes.”

### Contract: The Insurers' Survey

`contract:anselm_burrows` · data/contracts-sites.ts:256

- _type:_ “Survey”
- _titles[1]:_ “The Insurers' Survey”
- _titles[2]:_ “False Lights”
- _description:_

  > Ostrander's insures the ships that run aground off the Burrows, and Factor Vorn's office wants to know how many of them ran aground on purpose. Reach the dunes and see where the lanterns are.

- _phases[1]:_ “The Burrows: Into the dunes.”
- _Reads:_ `ostranders_open` (from **A Visitor from Ostrander's** (`ostrander_agent`), **Quarter Day** (`quarter_day`), rules in `src/engine/actions.ts`)

### Contract: Mags Tull's Lantern

`contract:anselm_tull` · data/contracts-sites.ts:273

- _type:_ “Hunt”
- _titles[1]:_ “Mags Tull's Lantern”
- _titles[2]:_ “The Wreckers of the Burrows”
- _description:_

  > The Crown's silver goes to Port Anselm along a coast where Mags Tull lights false lanterns for a living. The Exchequer would like the lantern put out before the next shipment.

- _phases[1]:_ “Tull's cove: At the end of the Strand.”

### Contract: Rudd's Old Yard

`contract:varrow_yard_after` · data/contracts-sites.ts:291

- _type:_ “Clearance”
- _titles[1]:_ “Rudd's Old Yard”
- _titles[2]:_ “New Tenants in the Rookeries”
- _description:_

  > Lew Rudd is out of business, and the men who worked for him have kept his yard and his dogs. The Porters' Fraternity would like the yard emptied before somebody else takes Rudd's book up where he left it.

- _phases[1]:_ “Rudd's yard: At the bottom of the Rookeries.”

### Contract: Moyle's Chair

`contract:kell_level_after` · data/contracts-sites.ts:308

- _type:_ “Clearance”
- _titles[1]:_ “Moyle's Chair”
- _titles[2]:_ “The Trevick Level Again”
- _description:_

  > Gaffer Moyle is gone, and new claim-jumpers are sitting in his chair at the end of the Trevick level. The lease-holders would like them gone too, preferably before they find his powder.

- _phases[1]:_ “The Trevick level: At the end of the old silver gallery.”

### Contract: The Dean's Wallow

`contract:fens_wallow_after` · data/contracts-sites.ts:325

- _type:_ “Clearance”
- _titles[1]:_ “The Dean's Wallow”
- _titles[2]:_ “Boars in the Withies”
- _description:_

  > The Dean is dead, and two of its sons have moved into its wallow. They are smaller than their father, and the salt-cutters would still rather somebody else went.

- _phases[1]:_ “The Withies: Where the fens run into the river.”

### Contract: The Toll House Again

`contract:drovers_gap_after` · data/contracts-sites.ts:342

- _type:_ “Clearance”
- _titles[1]:_ “The Toll House Again”
- _titles[2]:_ “A New Toll at Skell Gap”
- _description:_

  > Sergeant Crewe is gone, but his men have come back to the toll house at Skell Gap without him and started charging again. The Exchequer would like the Crown's toll house to stay the Crown's.

- _phases[1]:_ “Skell Gap: At the top of the pass.”

### Contract: Old Gullet's Water

`contract:mere_holms_after` · data/contracts-sites.ts:359

- _type:_ “Hunt”
- _titles[1]:_ “Old Gullet's Water”
- _titles[2]:_ “Pike off the Holms”
- _description:_

  > Old Gullet is landed, and the pike in its water off the far Holms are getting bigger. The Harrowmere fishermen have asked the river people again, and the river people have asked you again.

- _phases[1]:_ “The Holms: Out on the deep water.”

### Contract: Tull's Cove

`contract:anselm_cove_after` · data/contracts-sites.ts:376

- _type:_ “Clearance”
- _titles[1]:_ “Tull's Cove”
- _titles[2]:_ “The Lantern Lit Again”
- _description:_

  > Mags Tull is gone, and somebody has lit her lantern again. The Exchequer would like it put out a second time, and this time for good.

- _phases[1]:_ “Tull's cove: At the end of the Strand.”
