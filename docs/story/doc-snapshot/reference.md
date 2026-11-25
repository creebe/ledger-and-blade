## Names and descriptions

Factions, decrees, professions, traits, dangers, items and buildings: the short text on cards and sheets.

### Factions

| ID | Text |
|---|---|
| `factions:exchequer` | _name:_ The Exchequer · _short:_ Exchequer · _who:_ The Crown's treasury and officers, effectively the government of the realm. · _stance:_ It is desperate to keep paying the bank without losing the realm, and it will squeeze anyone to manage it. · _perks:_ Holds your charter. At −60 or below, the charter is at risk. Heat falls faster when standing is high. |
| `factions:weighhouse` | _name:_ The Weighhouse · _short:_ Weighhouse · _who:_ Merchants who control the city's official scales and measures. They hold your guild's loan. · _stance:_ Divided. Some members act as Ostrander's local agents and profit from it. · _perks:_ Better standing lowers market prices (up to 10%). Your loan is owed to them. |
| `factions:ostranders` | _name:_ Ostrander's · _short:_ Ostrander's · _who:_ The foreign bank the realm owes. It has offices in Varrow and agents everywhere. · _stance:_ It is the Debt. · _perks:_ Pays the best for collection work. High standing makes the Lower Town hate you. |
| `factions:lowertown` | _name:_ The Lower Town · _short:_ Lower Town · _who:_ Varrow's laborers, porters and small trades, crowded below the walls. · _stance:_ They pay the taxes that service the debt, and they are close to riot. · _perks:_ Better standing means cheaper and better recruits. The Unrest clock rises when they are angry. |
| `factions:oda` | _name:_ Saint Oda's · _short:_ Saint Oda's · _who:_ The hospital church by the river gate. It runs the almshouse, the fever ward and most of the city's funerals. · _stance:_ It preaches against usury on Sundays, and on weekdays it takes the bank's donations, because firewood costs money. · _perks:_ Better standing helps your wounded mend: +2 health a week at 20, +4 at 40. |
| `factions:fourteen` | _name:_ The Fourteen · _short:_ Fourteen · _who:_ The fourteen founding families of the realm. Their castles and estates are pledged to the bank as collateral for the Debt. · _stance:_ They want to keep their land and their names. Some would pay the bank anything to do it, and some would rather burn the treaty. · _perks:_ At 25 or more, a family vouches for the guild: +1 Influence every four weeks. Their work often costs standing with Ostrander's. |
| `factions:mudlarks` | _name:_ The Mudlarks · _short:_ Mudlarks · _who:_ River scavengers, fences and smugglers who work the mud flats below the toll chain at low tide. · _stance:_ Every crown the bank takes at the chain is a crown they could have made going round it. · _perks:_ At 20 or more, supplies cost 10% less through the river market. At −25 or worse, things go missing from your stores. |
| `factions:hobbs` | _name:_ Hobb & Daughters · _short:_ Hobbs want it · _who:_ A family firm of debt collectors on retainer to Ostrander's. Old Marta Hobb runs it with her three daughters, and the bank pays them very well. |
| `factions:ninth` | _name:_ The Ninth · _short:_ Ninth want it · _who:_ A royal regiment at Cassel Ford, disbanded by the peace treaty and working ever since as a free company. Captain Rufus Mayne was a sergeant then. |
| `factions:assay` | _name:_ The Assay Office · _short:_ Assay wants it · _who:_ Licenses every reagent, focus and enchantment sold in Varrow, inspects workshops, and tests the silver in the Crown Penny. Master Assayer Corwin Plaice runs it. |
| `factions:arrears` | _name:_ Arrears · _description:_ How far behind the Crown is on its payments to the bank. |
| `factions:leverage` | _name:_ Leverage · _description:_ How much of the realm Ostrander's owns: offices, tolls, castles. |
| `factions:unrest` | _name:_ Unrest · _description:_ How close the Lower Town is to open revolt. |
| `factions:cointrust` | _name:_ Coin Trust · _description:_ Whether people still trust the Crown Penny. When it falls, prices rise. |
| `factions:varrow` | _name:_ Varrow · _description:_ The capital. |
| `factions:drovers` | _name:_ Drover's Road · _description:_ Cattle road through the hills east of the city. |
| `factions:harrowmere` | _name:_ Harrowmere · _description:_ A lake town with an old bridge. |
| `factions:kell` | _name:_ Kell Mines · _description:_ Silver workings in the northern hills, half of them flooded. |
| `factions:saltfens` | _name:_ The Saltfens · _description:_ Marshes along the estuary, rich in reagents and fever. |
| `factions:anselm` | _name:_ Port Anselm · _description:_ The coast port where Ostrander's ships take on the Crown's silver. |

### Decrees

| ID | Text |
|---|---|
| `decrees:grain_levy` | _title:_ The Grain Levy · _text:_ A tax on every sack of grain entering Varrow, paid straight to the debt. · _effects[1]:_ Supplies cost 30% more. · _effects[2]:_ Arrears fall every week. · _effects[3]:_ Unrest rises every week. |
| `decrees:debasement` | _title:_ Debasement of the Crown Penny · _text:_ Melt the coinage down and strike it lighter. The Crown pays its debts in thinner silver. · _effects[1]:_ Arrears −10 at once. · _effects[2]:_ Coin Trust −15 at once, so market prices rise. |
| `decrees:collectors_license` | _title:_ Collectors' Licenses · _text:_ Licensed collectors may enter homes and workshops to seize pledged goods, with the watch standing by. · _effects[1]:_ Ostrander's contracts pay 25% more. · _effects[2]:_ Leverage rises every week. · _effects[3]:_ The Lower Town hates it. |
| `decrees:usury_cap` | _title:_ The Usury Cap · _text:_ No lender in Varrow may charge more than a crown in twenty a year. · _effects[1]:_ Your loan's interest is halved. · _effects[2]:_ Leverage grows more slowly; Ostrander's will remember who voted for it. |
| `decrees:martial_law` | _title:_ Martial Law on the Docks · _text:_ Curfew below the walls, soldiers at the river chain, and searches without warrant. · _effects[1]:_ Heat falls 2 faster each week. · _effects[2]:_ Smuggling and heists pay 30% more, but draw twice the Heat. · _effects[3]:_ Unrest +5 at once. |
| `decrees:guild_tax` | _title:_ The Chartered Guilds Tax · _text:_ Every chartered guild pays a weekly due toward the debt. Including yours. · _effects[1]:_ Your guild pays 10 crowns a week. · _effects[2]:_ Arrears fall a little every week. |
| `decrees:bread_dole` | _title:_ The Bread Dole · _text:_ The Crown buys grain and hands out a loaf a day in the Lower Town. · _effects[1]:_ Supplies cost 15% less. · _effects[2]:_ Unrest falls every week. · _effects[3]:_ Arrears rise every week. |
| `decrees:toll_relief` | _title:_ Toll Relief on the River · _text:_ Buy back the river tolls from Ostrander's, with Crown land as payment. · _effects[1]:_ Market prices fall 10%. · _effects[2]:_ Leverage falls every week, while Arrears rise. |

### Professions

| ID | Text |
|---|---|
| `professions:vanguard` | _name:_ Vanguard · _blurb:_ A front-line fighter who can carry heavy armor all day without complaining. |
| `professions:skirmisher` | _name:_ Skirmisher · _blurb:_ A quick fighter who works the flanks and is at home in rough country. |
| `professions:marksman` | _name:_ Marksman · _blurb:_ A bow or crossbow specialist, at their best against anything they can see coming. |
| `professions:arcanist` | _name:_ Arcanist · _blurb:_ Trained at the college to turn reagents into fire or frost on demand, and paid accordingly. |
| `professions:chaplain` | _name:_ Chaplain · _blurb:_ Trained as a field physician at Saint Oda's. Keeps people alive, and keeps them calm while doing it. |
| `professions:scout` | _name:_ Scout · _blurb:_ A tracker and pathfinder, good at noticing things before they turn into problems. |
| `professions:envoy` | _name:_ Envoy · _blurb:_ Talks the squad out of trouble, usually for less than a fight would have cost. |
| `professions:infiltrator` | _name:_ Infiltrator · _blurb:_ Good with locks and rooftops, and with a knife when it comes to that. |
| `professions:assault` | _name:_ Assault · _blurb:_ Brute force. Every member fights, so numbers and good weapons matter. |
| `professions:stealth` | _name:_ Stealth · _blurb:_ Quiet and unseen. The clumsiest member drags everyone down, and heavy armor makes noise. |
| `professions:guile` | _name:_ Guile · _blurb:_ Talk, bribe, deceive. The best talker leads and the rest support. |
| `professions:endurance` | _name:_ Endurance · _blurb:_ Hard roads, cold and hunger. Everyone must keep up, and fatigue hurts. |
| `professions:arcana` | _name:_ Arcana · _blurb:_ Spellwork. Only trained Arcanists and Chaplains contribute fully. |

### Traits

| ID | Text |
|---|---|
| `traits:brave` | _name:_ Brave · _description:_ Assault +1. Morale falls less after losses. |
| `traits:cautious` | _name:_ Cautious · _description:_ Stealth +1, Assault -1. |
| `traits:greedy` | _name:_ Greedy · _description:_ Wage +2. Loyalty falls twice as fast when unpaid. |
| `traits:hotheaded` | _name:_ Hotheaded · _description:_ Assault +1, Guile -2. Prone to brawls. |
| `traits:steady` | _name:_ Steady · _description:_ Endurance +1. |
| `traits:silver_tongue` | _name:_ Silver Tongue · _description:_ Guile +2. |
| `traits:veteran` | _name:_ Veteran of the Lost War · _description:_ Assault and Endurance +1. Wage +2. |
| `traits:drunkard` | _name:_ Drunkard · _description:_ Endurance -1. Cheerful, though. |
| `traits:frail` | _name:_ Frail · _description:_ Endurance -1. Recovers slowly. |
| `traits:lower_born` | _name:_ Lower Town Born · _description:_ Guile +1 in Varrow. Loyal to the Lower Town. |
| `traits:bookish` | _name:_ Bookish · _description:_ Arcana +1, Assault -1. |
| `traits:nimble` | _name:_ Nimble · _description:_ Stealth +1, Endurance +1. |

### Tags

| ID | Text |
|---|---|
| `tags:armored` | _name:_ Armored · _description:_ Mail and plate. Slashing weapons struggle; blunt weapons crack them open. |
| `tags:beasts` | _name:_ Beasts · _description:_ Wolves, boar or worse. Arrows and fire work well, and they can't be talked to. |
| `tags:swarm` | _name:_ Swarm · _description:_ Rats, carrion-beetles, many small things. Fire and blunt force; points are wasted. |
| `tags:thugs` | _name:_ Thugs · _description:_ Hired muscle. Cowardly, and easily bribed. |
| `tags:soldiers` | _name:_ Soldiers · _description:_ Drilled sell-swords. Harder in a straight fight. |
| `tags:guards` | _name:_ Watchful Guards · _description:_ Alert sentries. Hard to sneak past, but they take bribes. |
| `tags:warded` | _name:_ Warded · _description:_ Hedge-wizards with protective wards. Physical attacks are blunted; storm cracks wards. |
| `tags:trolls` | _name:_ Trolls · _description:_ Huge and regenerating. Only fire stops the healing; frost barely slows them. |
| `tags:fireborn` | _name:_ Fireborn · _description:_ Salamanders and drakelings. Immune to fire; frost is deadly to them. |
| `tags:crowd` | _name:_ Crowds · _description:_ Angry citizens. Violence here costs reputation, and they are hard to sneak through. |
| `tags:cold` | _name:_ Cold · _description:_ Bitter cold. Endurance suffers without furs. |
| `tags:swamp` | _name:_ Swamp · _description:_ Mud and marsh-fever. Armor drags; remedies help. |
| `tags:dark` | _name:_ Dark · _description:_ Underground or lightless. Fighting blind is hard, though hiding is easy. |
| `tags:night` | _name:_ Night · _description:_ Night work. Stealth is easier, and fighting is harder without light. |
| `tags:urban` | _name:_ Urban · _description:_ Varrow's streets. Plenty of people to talk to, and plenty of witnesses. |
| `tags:rough` | _name:_ Rough Country · _description:_ Cliffs, scree and broken ground. |
| `tags:open_road` | _name:_ Open Road · _description:_ Open country. Nowhere to hide. |
| `tags:plague` | _name:_ Sickness · _description:_ Fever in the air. A Chaplain or remedies keep the squad on its feet. |

### Items

| ID | Text |
|---|---|
| `items:dagger` | _name:_ Dagger · _description:_ Quiet and easily hidden. |
| `items:arming_sword` | _name:_ Arming Sword · _description:_ A reliable one-handed blade. |
| `items:spear` | _name:_ Spear · _description:_ Reach and a sharp point. Good against beasts. |
| `items:mace` | _name:_ Flanged Mace · _description:_ Dents armor and breaks shells. |
| `items:hunting_bow` | _name:_ Hunting Bow · _description:_ Strikes first from cover. |
| `items:focus_rod` | _name:_ Plain Focus Rod · _description:_ A college-issue rod. It channels spells well enough, but has no element. |
| `items:longsword` | _name:_ Longsword · _description:_ Long reach and a keen edge. |
| `items:warhammer` | _name:_ Warhammer · _description:_ Made for opening armor, and not much else. |
| `items:crossbow` | _name:_ Arbalest · _description:_ Slow and loud, but it punches through mail. |
| `items:ember_focus` | _name:_ Ember Focus · _description:_ A fire-keyed focus licensed by the Assay Office. |
| `items:rime_focus` | _name:_ Rime Focus · _description:_ A frost-keyed focus. Slows anything warm-blooded. |
| `items:storm_focus` | _name:_ Storm Focus · _description:_ Storm-keyed. Cracks wards and armor alike. |
| `items:dawn_censer` | _name:_ Dawn Censer · _description:_ Saint Oda's radiant censer, for burning out rot and fear. |
| `items:padded_robes` | _name:_ Padded Robes · _description:_ Barely armor at all. |
| `items:gambeson` | _name:_ Gambeson · _description:_ Quilted linen. Light and quiet. |
| `items:leather_jack` | _name:_ Leather Jack · _description:_ Boiled leather. Flexible and silent. |
| `items:fine_doublet` | _name:_ Fine Doublet · _description:_ Good clothes get you into places armor never will. |
| `items:mail_hauberk` | _name:_ Mail Hauberk · _description:_ Riveted mail. It jingles when you move. |
| `items:brigandine` | _name:_ Brigandine · _description:_ Plates riveted inside cloth. Quieter than mail. |
| `items:plate_harness` | _name:_ Plate Harness · _description:_ Near-proof against blades. Hard to sneak or march in. |
| `items:oda_medal` | _name:_ Saint Oda's Medal · _description:_ A pilgrim token. People swear it helps on long marches. |
| `items:signet` | _name:_ Borrowed Signet · _description:_ A merchant house signet, borrowed more or less honestly. |
| `items:assay_lens` | _name:_ Assay Lens · _description:_ Shows whether a reagent is pure or a coin has been clipped. |
| `items:soft_boots` | _name:_ Soft Boots · _description:_ Felt-soled. Silent on stone. |
| `items:fur_cloak` | _name:_ Fur-lined Cloak · _description:_ Keeps the squad moving in the cold. Negates Cold. |
| `items:wardstone` | _name:_ Wardstone · _description:_ Unpicks enemy wards. Negates Warded's protection. |
| `items:fire_oil` | _name:_ Fire Oil · _description:_ Coats the carrier's weapon in fire for one mission. |
| `items:frost_salts` | _name:_ Frost Salts · _description:_ Frost-keys the carrier's weapon for one mission. |
| `items:storm_flask` | _name:_ Storm Flask · _description:_ Storm-keys the carrier's weapon for one mission. |
| `items:radiant_chalk` | _name:_ Radiant Chalk · _description:_ Radiant sigils for the carrier's weapon, for one mission. |
| `items:draught` | _name:_ Healing Draught · _description:_ Reduces the next serious wound to the carrier. Can prevent a death. |
| `items:smoke` | _name:_ Smoke Pellets · _description:_ Stealth +3 for the carrier. |
| `items:purse` | _name:_ Bribe Purse · _description:_ Guile +4 for the carrier. Most doors open for the right amount. |
| `items:lantern` | _name:_ Hooded Lantern · _description:_ Negates the Assault penalty of Dark and Night for the squad. |
| `items:remedies` | _name:_ Fen Remedies · _description:_ Negates the Endurance penalty of Swamp and Plague for the squad. |
| `items:climbing_kit` | _name:_ Climbing Kit · _description:_ Negates the Endurance penalty of Rough Country for the squad. |

### Facilities

| ID | Text |
|---|---|
| `facilities:hall` | _name:_ Great Hall · _blurb:_ Bunks, benches and a long table. Room for more members. · _levels[1].effect:_ Room for 7 members. · _levels[2].effect:_ Room for 10 members. +5 morale on completion. · _levels[3].effect:_ Room for 13 members. Renown +3 on completion. |
| `facilities:forge` | _name:_ Forge · _blurb:_ Make weapons and armor from iron, timber and leather. · _levels[1].effect:_ Craft standard weapons, light and mail armor, lanterns and kits. 1 item a week. · _levels[2].effect:_ Craft longswords, warhammers, arbalests and brigandines. 2 items a week. · _levels[3].effect:_ Craft plate harness. 3 items a week. |
| `facilities:stillroom` | _name:_ Stillroom · _blurb:_ Distill reagents into oils, salts, draughts and, in time, keyed foci. · _levels[1].effect:_ Brew fire oil, frost salts, draughts, remedies and smoke. 2 a week. · _levels[2].effect:_ Brew storm flasks and radiant chalk; make wardstones and assay lenses. 4 a week. · _levels[3].effect:_ Key ember, rime and storm foci. 6 a week. |
| `facilities:infirmary` | _name:_ Infirmary · _blurb:_ Clean beds and a physician on call. Wounded members recover faster. · _levels[1].effect:_ +5 health a week for members at home. · _levels[2].effect:_ +9 health a week. · _levels[3].effect:_ +13 health a week, and fatigue falls faster. |
| `facilities:yard` | _name:_ Training Yard · _blurb:_ Pells, butts and a sand ring. Training is faster and cheaper. · _levels[1].effect:_ Training takes 3 weeks per point (instead of 4). · _levels[2].effect:_ Training takes 2 weeks per point and costs 6 crowns a week. · _levels[3].effect:_ Training costs 4 crowns a week. Trainees also gain experience. |
| `facilities:den` | _name:_ Spymaster's Den · _blurb:_ A back room, paid ears and a ledger of secrets. · _levels[1].effect:_ +1 Intel a week. · _levels[2].effect:_ +2 Intel a week. Revealing a hidden tag costs 1 Intel. · _levels[3].effect:_ Hobb & Daughters' plans are known every week. |
| `facilities:stables` | _name:_ Stables · _blurb:_ Horses and a wagon. Squads travel faster, and spend less on the road. · _levels[1].effect:_ Return trips are 1 week shorter. · _levels[2].effect:_ Trips of 2 weeks each way are also 1 week shorter going out. |
