## Contracts

Job templates on the board. A contract takes one of its titles at random. Story contracts also appear under the scene that adds them.

### Contract: Wolves on the Drover's Road

`contract:wolf_cull` · data/contracts.ts:43

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

`contract:caravan_escort` · data/contracts.ts:72

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

`contract:debt_collection` · data/contracts.ts:96

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

`contract:tax_escort` · data/contracts.ts:121

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

`contract:riot_guard` · data/contracts.ts:145

- _type:_ “Peacekeeping”
- _titles[1]:_ “Hold the Bread Market”
- _titles[2]:_ “The Fishmarket Crowd”
- _titles[3]:_ “A Night of Torches”
- _description:_

  > Bread prices rose again. The Exchequer wants the market kept open and calm without the royal guard. A riot would embarrass the Crown.

- _phases[1]:_ “Disperse: Calm the crowd, or break it.”
- _phases[2]:_ “Hold: Hold the square until dawn.”

### Contract: Grain for the Lower Town

`contract:bread_convoy` · data/contracts.ts:168

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

`contract:clipped_coin` · data/contracts.ts:193

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

`contract:flooded_mine` · data/contracts.ts:217

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

`contract:fen_harvest` · data/contracts.ts:245

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

`contract:warehouse_job` · data/contracts.ts:271

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

`contract:troll_bridge` · data/contracts.ts:296

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

`contract:deliver_terms` · data/contracts.ts:321

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

`contract:almshouse_watch` · data/contracts.ts:347

- _type:_ “Peacekeeping”
- _titles[1]:_ “Nights at the Almshouse”
- _titles[2]:_ “The Almshouse Gate”
- _titles[3]:_ “Keep Saint Oda's Door”
- _description:_

  > The almshouse has more people at its gate than beds inside, and the Sisters have stopped sleeping. They want steady hands on the door for a few nights. It pays in bread and gratitude, and a little coin.

- _phases[1]:_ “The Queue: Decide who gets a bed, and say it kindly.”
- _phases[2]:_ “After Dark: Somebody always tries the back door.”

### Contract: Fever at Coldharbour

`contract:fever_village` · data/contracts.ts:371

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

`contract:assessors_out` · data/contracts.ts:397

- _type:_ “Peacekeeping”
- _titles[1]:_ “Keep the Assessors Out”
- _titles[2]:_ “A Castle Under Notice”
- _titles[3]:_ “The Gate at Aske”
- _description:_

  > The bank's assessors are coming to list everything a noble house owns, and the family would like them to be delayed. Nobody is to be hurt. The family is quite firm on that, because the family will be blamed.

- _phases[1]:_ “The Ride Out: Get there before the assessors do.”
- _phases[2]:_ “The Gate: Lose their paperwork, block the road, or argue the law.”

### Contract: A Missing Heirloom

`contract:heirloom` · data/contracts.ts:420

- _type:_ “Investigation”
- _titles[1]:_ “A Missing Heirloom”
- _titles[2]:_ “The Countess's Rings”
- _titles[3]:_ “Who Sold the Seal?”
- _description:_

  > Something old and valuable has gone missing from a noble house, and the family suspects a servant who left in a hurry. They want it back before anyone at court hears it was ever gone.

- _phases[1]:_ “Questions: Find out who had a key, and who needed money.”
- _phases[2]:_ “The Pawnshop: Get it back without a scene.”

### Contract: Under the Chain

`contract:under_chain` · data/contracts.ts:444

- _type:_ “Smuggling”
- _titles[1]:_ “Under the Chain”
- _titles[2]:_ “A Barge at Low Tide”
- _titles[3]:_ “Round the Toll”
- _description:_

  > A barge-load of wool needs to pass the river chain without paying the bank's toll. The Mudlarks know the channel. They need people to pole, watch and, if it comes to it, argue.

- _phases[1]:_ “Low Tide: Pole the barge through the shallows under the chain.”
- _phases[2]:_ “The Toll-Boat: If the toll-men see you, give them a reason to look away.”

### Contract: The Sunken Barge

`contract:river_salvage` · data/contracts.ts:468

- _type:_ “Expedition”
- _titles[1]:_ “The Sunken Barge”
- _titles[2]:_ “What the River Took”
- _titles[3]:_ “Salvage at the Old Wharf”
- _description:_

  > A grain barge went down by the old wharf, and the river will give back its iron fittings and timber to whoever gets there first. The mud is deep, and something has been nesting in the wreck.

- _phases[1]:_ “The Flats: Wade out before the tide turns.”
- _phases[2]:_ “The Wreck: Clear out whatever lives in it, and start prying.”

### Contract: Short Weight at Hesketh's

`contract:false_weights` · data/contracts.ts:493

- _type:_ “Story”
- _titles[1]:_ “Short Weight at Hesketh's”
- _description:_

  > Alderman Coster believes Hesketh's grain store on Fish Quay sells by a doctored measure. He needs someone outside the Weighhouse to buy a sack, weigh it on honest scales, and get a look at the measure Hesketh actually uses.

- _phases[1]:_ “The Purchase: Buy a sack like any other customer, and keep the receipt.”
- _phases[2]:_ “The Back Room: Get a look at the measure he keeps under the counter.”
- _expire.title:_ “Nobody went to Hesketh's”
- _expire.text:_

  > Coster's job sat on the board until Hesketh heard someone was asking about his measures and replaced them. Coster has noted it, as he notes everything.

- _Sets:_ `weights_exposed` → **Half a Year** (`act1_slice_end`); `weights_failed` → _nothing reads it_

### Contract: Salts for Saint Oda's

`contract:fever_salts` · data/contracts.ts:521

- _type:_ “Story”
- _titles[1]:_ “Salts for Saint Oda's”
- _description:_

  > The almshouse needs fen salts for the fever, and the apothecaries want more than the Sisters can pay. The salt pans are out past the last causeway in the Saltfens. Sister Brune will pay what she can, which is not much.

- _phases[1]:_ “The Causeway: Two days on planks across the marsh.”
- _phases[2]:_ “The Salt Pans: Scrape the good salt and leave the poisoned beds alone.”
- _phases[3]:_ “Home Again: Carry it back dry.”
- _expire.title:_ “The fever salts never came”
- _expire.text:_

  > Nobody went to the Saltfens. Sister Brune bought what she could from the apothecaries on credit, and the almshouse buried four people that week.

- _Sets:_ `salts_delivered` → **Half a Year** (`act1_slice_end`); `salts_failed` → **Half a Year** (`act1_slice_end`)

### Contract: Ansel Fell at the Chain

`contract:ansel_chain` · data/contracts.ts:551

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

`contract:last_tapestry` · data/contracts.ts:579

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

- _Sets:_ `tapestry_sold` → _nothing reads it_; `tapestry_lost` → _nothing reads it_

### Contract: The Aske Silver

`contract:aske_plate` · data/contracts.ts:608

- _type:_ “Story”
- _titles[1]:_ “The Aske Silver”
- _description:_

  > Lady Aske wants her family's silver out of the castle before the bank's assessors list it. It is illegal, it is heavy, and the assessors could arrive any day.

- _phases[1]:_ “Packing: Wrap two hundred years of silver in straw, quietly.”
- _phases[2]:_ “The Back Road: The assessors have men on the main road.”
- _expire.title:_ “The assessors reached Aske first”
- _expire.text:_

  > Nobody went for the silver. The bank's assessors listed every spoon, and Lady Aske signed the inventory herself.

- _Sets:_ `aske_plate_saved` → **Half a Year** (`act1_slice_end`); `aske_plate_lost` → _nothing reads it_

### Contract: Beat them to a job

`contract:op_intercept` · data/contracts.ts:638

- _type:_ “Operation”
- _titles[1]:_ “Beat them to a job”
- _phases[1]:_ “Get There First: Ride hard and arrive before they do.”
- _phases[2]:_ “Do Their Job: Finish the work and collect the pay in your own name.”

### Contract: A raid

`contract:op_raid` · data/contracts.ts:661

- _type:_ “Operation”
- _titles[1]:_ “A raid”
- _phases[1]:_ “The Watch: Learn the route and the guards.”
- _phases[2]:_ “The Hit: Take it, and be gone before anyone can follow.”

### Contract: A death

`contract:op_kill` · data/contracts.ts:685

- _type:_ “Operation”
- _titles[1]:_ “A death”
- _phases[1]:_ “Their Habits: Learn where they go and who goes with them.”
- _phases[2]:_ “The Knife: One chance. Make it count.”
- _phases[3]:_ “Away Clean: Leave nothing that points home.”

### Contract: The Crown's Last Silver

`contract:silver_convoy` · data/contracts.ts:709

- _type:_ “Story”
- _titles[1]:_ “The Crown's Last Silver”
- _description:_

  > The Exchequer has scraped together the realm's overdue payment: three wagons of silver bound for Port Anselm and Ostrander's ships. Someone does not want it to arrive. If it fails, the Crown defaults.

- _phases[1]:_ “Muster at the Vault: Sort the Exchequer's honest clerks from the bought ones.”
- _phases[2]:_ “The King's Road: Two weeks of road with a fortune in the wagons.”
- _phases[3]:_

  > Ambush at the Ford: Someone will be waiting. Fight them, or take the wagons the long way round.

- _phases[4]:_ “The Harbor: Hand the silver to the bank's factor, and count every coin twice.”
- _expire.title:_ “The Crown's silver never left Varrow”
- _expire.text:_

  > You accepted the commission, but no squad was ever sent. The wagons sat in the Exchequer yard until it was too late to reach the ships. The Crown has missed its payment.

- _Sets:_ `silver_delivered` → **The Notice Board** (`vorn_board`), **Quarter Day** (`quarter_day`), **The Last Tapestry** (`fenn_tapestry`), **Half a Year** (`act1_slice_end`), street talk "paid_talk" (`paid_talk`), Date "The Lord Treasurer Visits" (`treasurer_visit`); `silver_lost` → **The Notice Board** (`vorn_board`), **Quarter Day** (`quarter_day`), **The Last Tapestry** (`fenn_tapestry`), **The Family Silver** (`aske_plate`), **Half a Year** (`act1_slice_end`), codex "The Treaty of Cassel" (`the_treaty`), street talk "default_talk" (`default_talk`), rules in `src/engine/core/turn.ts`; `silver_abandoned` → _nothing reads it_
