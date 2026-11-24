## The Codex

Reference entries the guild unlocks through play. _source_ is the line saying how the guild learned it; _unlock_ is when.

### Common knowledge

#### Varrow

`codex:varrow` · data/codex.ts:29

- _text:_

  > The capital: a river port behind old walls, with the Lower Town crowded below them along the docks. The river chain across the water once paid the Crown a fortune in tolls. Now it pays Ostrander's.

- _source:_ “You live here.”
- _unlock:_ when true

#### The Debt

`codex:the_debt` · data/codex.ts:37

- _text:_

  > Everyone in Varrow can tell you the number: four million crowns, owed to Ostrander's bank since the war, paid in quarterly installments. Fewer can tell you where the money went, and nobody can tell you when it ends.

- _source:_ “Common talk in every tavern.”
- _unlock:_ when true

#### Guild charters

`codex:charters` · data/codex.ts:45

- _text:_

  > A charter from the Exchequer lets a guild take paid work anywhere in the realm, armed. The Exchequer can revoke it, and does, for guilds that become an embarrassment: too much Heat, or too little standing with the Crown.

- _source:_ “It hangs on your wall.”
- _unlock:_ when true

### History

#### Cassel Ford

`codex:cassel_ford` · data/codex.ts:54

- _text:_

  > Twenty-two years ago the old king's army tried to cross the Cassel in spring flood, against advice. The enemy held the far bank with crossbows hired on credit from a foreign bank. The men who came back don't call it a defeat. They just say 'the ford', and then talk about something else.

- _source:_

  > [IF (someone(s, (m) => m.traits.includes('veteran')))] Told by {v.name}, who was there. [ELSE] A veteran singing for coppers outside the Copper Kettle. [END]

- _unlock:_ when someone(s, (m) => m.traits.includes('veteran')) or crier(s, 'veteran_song')

#### The Treaty of Cassel

`codex:the_treaty` · data/codex.ts:65

- _text:_

  > The peace that ended the war made the realm repay what the victors had borrowed from Ostrander's. Its sharpest clause: if the Crown ever misses an installment, the bank may collect however it sees fit. Tolls, mills, castles: everything is collateral.

- _source:_

  > [IF vorn_slip or vorn_q_people] Factor Vorn, over a cup of your own tea. [ELSE] Learned the hard way, when the Crown missed a payment. [END]

- _unlock:_ when (vorn_slip or vorn_q_people or silver_lost)
- _Reads:_ `vorn_slip` (from **A Visitor from Ostrander's** (`ostrander_agent`)); `vorn_q_people` (from **A Visitor from Ostrander's** (`ostrander_agent`)); `silver_lost` (from contract **The Crown's Last Silver** (`silver_convoy`))

#### The Crown plate

`codex:crown_plate` · data/codex.ts:73

- _text:_

  > The royal silver: cups, chargers and candlesticks from four reigns. Most of it has already been melted down for the debt. What's left is the last thing standing between the Crown and default.

- _source:_ “Lord Treasurer Fenn, in his stripped office.”
- _unlock:_ when scene silver_summons has happened

### Places

#### The Lower Town

`codex:lower_town` · data/codex.ts:82

- _text:_

  > Below the walls: docks, warehouses, tanneries and the porters who carry everything. They pay the levies that service the debt, and they remember who stood with them.

- _source:_ “Your people have worked its streets.”
- _unlock:_ when reports(s).some((m) => m.contract.patron is 'lowertown') or scene bread_riot has happened

#### Drover's Road

`codex:drovers` · data/codex.ts:90

- _text:_

  > The cattle road east into the hills. Wolves follow the herds, and since the war-pensions stopped, so do men who used to be soldiers.

- _source:_ “Your squads have walked it.”
- _unlock:_ when visited(s, "Drover's Road")

#### Harrowmere

`codex:harrowmere` · data/codex.ts:98

- _text:_

  > A lake town of wool merchants and boatwrights, and a bridge older than the kingdom. Whoever controls the bridge controls the wool road.

- _source:_ “Your squads have been there.”
- _unlock:_ when visited(s, 'Harrowmere')

#### Kell Mines

`codex:kell` · data/codex.ts:106

- _text:_

  > Silver workings in the northern hills. The deep galleries flooded the year after the war. The Crown's silver warrants were sold to the bank, and the bank wants them worked again.

- _source:_ “Your squads have been underground there.”
- _unlock:_ when visited(s, 'Kell Mines')

#### The Saltfens

`codex:saltfens` · data/codex.ts:114

- _text:_

  > Estuary marsh, two weeks from Varrow: fen-lily, bog-amber and every reagent the colleges need, along with fever, leeches and things that live in black water.

- _source:_ “Your squads came back muddy, and some came back sick.”
- _unlock:_ when visited(s, 'The Saltfens')

#### Port Anselm

`codex:anselm` · data/codex.ts:122

- _text:_

  > The coast port where Ostrander's ships take on the Crown's payments. The harbor-master is a Crown officer, and the harbor is the bank's in all but name.

- _source:_ “Your squads have seen the bank’s ships at anchor.”
- _unlock:_ when visited(s, 'Port Anselm')

### People

#### Factor Maelis Vorn

`codex:vorn` · data/codex.ts:131

- _text:_

  > Runs Ostrander's office on Quay Street. She doesn't waste words or lose her temper. Ask her what the bank plans to do to you and she'll tell you, straight out. Corrects other people's spelling.

- _source:_ “She came to your hall.”
- _unlock:_ when scene ostrander_agent has happened

#### Marta Hobb

`codex:marta` · data/codex.ts:139

- _text:_

  > Marta has collected debts in Varrow for thirty years, and nobody has seen her without her umbrella. She calls everyone "dear" and remembers their mothers. Her eldest daughter Isbet prices everything she looks at, including people.

- _source:_ “She visited, with her daughters.”
- _unlock:_ when scene hobbs_arrive has happened

#### Dagny Fell

`codex:dagny` · data/codex.ts:147

- _text:_

  > A carrier in the Porters' Fraternity with a hook on her belt and no patience for charity. If the docks hear something, Dagny hears it next.

- _source:_ “You met her during the bread riot.”
- _unlock:_ when (dagny_contact or dagny_friend)
- _Reads:_ `dagny_contact` (from **Bread and Stones** (`bread_riot`)); `dagny_friend` (from **Bread and Stones** (`bread_riot`))

#### Lord Treasurer Aubrey Fenn

`codex:fenn` · data/codex.ts:155

- _text:_

  > Head of the Exchequer, in an office with nothing left on the walls. He is a decent man and a tired one, and he ran out of options some time ago. He has kept the payments going for six years on willpower and the Crown's silverware.

- _source:_ “He summoned you.”
- _unlock:_ when scene silver_summons has happened

#### Jory Abbot

`codex:jory` · data/codex.ts:163

- _text:_

  > The hall's clerk. He came with the building, along with the leak in the roof, and has kept its books through three guildmasters. He doesn't give advice unless you ask for it, and then only in the form of a remark about the weather.

- _source:_ “He came with the hall.”
- _unlock:_ when true

#### Alderman Piet Coster

`codex:coster` · data/codex.ts:171

- _text:_

  > Master of the city scales and the man who holds your loan. He carries a brass balance in a velvet box and weighs coins before he accepts them. He believes in honest weights, and in coming out of the Debt richer than he went in, and he does not see why those should conflict.

- _source:_ “He came about your loan.”
- _unlock:_ when scene coster_interest has happened

#### Sister Agathe Brune

`codex:brune` · data/codex.ts:179

- _text:_

  > Almoner of Saint Oda's. She counts the almshouse beds every night and the firewood every morning. She preaches against usury on Sundays and takes the bank's donations on Mondays, and she will tell you so if you ask.

- _source:_ “She came to ask for fever salts.”
- _unlock:_ when met_oda
- _Reads:_ `met_oda` (from **Fever Salts** (`brune_salts`))

#### Wenna Pask

`codex:pask` · data/codex.ts:187

- _text:_

  > She runs the low-tide market on the river flats below Fish Quay, where things that fell off barges are sold. She is quick and funny, and you have never heard her answer a question directly.

- _source:_ “She invited you onto the flats at low tide.”
- _unlock:_ when met_mudlarks
- _Reads:_ `met_mudlarks` (from **Under the Chain** (`pask_chain`))

#### Captain Rufus Mayne

`codex:mayne` · data/codex.ts:195

- _text:_

  > Commands the Ninth, a royal regiment disbanded under article nine of the treaty and paid off in Crown Pennies. Mayne was a sergeant at Cassel Ford. He is loud and friendly, and he never stops recruiting.

- _source:_ “He tried to hire one of your people.”
- _unlock:_ when ninth_active
- _Reads:_ `ninth_active` (from **An Offer for Your Best** (`mayne_offer`))

#### Master Assayer Corwin Plaice

`codex:plaice` · data/codex.ts:203

- _text:_

  > Runs the Assay Office. He licenses every reagent and enchantment sold in Varrow, and he can quote the clause that covers each of them. He has never been seen in a hurry.

- _source:_ “He came to inspect the guild.”
- _unlock:_ when assay_active
- _Reads:_ `assay_active` (from **Clause Eleven** (`plaice_inspection`), rules in `src/engine/core/newgame.ts`)

#### Lady Honora Aske

`codex:aske` · data/codex.ts:211

- _text:_

  > Head of one of the Fourteen. Her castle at Aske is pledged to the bank, and she has only recently had to learn what things cost. She is charming and generous, and she usually forgets to say how much she's paying until afterwards.

- _source:_ “She asked you to move her family silver.”
- _unlock:_ when met_fourteen
- _Reads:_ `met_fourteen` (from **The Family Silver** (`aske_plate`))

### Foes

#### Hill trolls

`codex:foe_trolls` · data/codex.ts:220

- _text:_

  > Trolls are huge, slow to anger and very hard to kill, because their wounds close while you watch. Fire stops the healing. That's why the old bridge-keepers always kept a brazier lit.

- _source:_ “Your people fought one.”
- _unlock:_ when faced(s, 'trolls')

#### Fireborn

`codex:foe_fireborn` · data/codex.ts:228

- _text:_

  > Salamanders and drakelings that nest where the earth runs hot: flooded forges, old mine galleries. They shrug off fire and dread cold. Frost salts are worth their weight in silver against them.

- _source:_ “Your people met them underground.”
- _unlock:_ when faced(s, 'fireborn')

#### Hedge-wards

`codex:foe_warded` · data/codex.ts:236

- _text:_

  > Unlicensed spellwork scratched onto doors and armor. It turns blades aside, but storm-keyed weapons and wardstones cut straight through. The Assay Office would very much like to know who's selling it.

- _source:_ “Your people ran into it.”
- _unlock:_ when faced(s, 'warded')

#### Swarms

`codex:foe_swarm` · data/codex.ts:244

- _text:_

  > Rats, carrion-beetles and worse, in numbers nobody wants to count. Blades and arrows are mostly wasted on them. Hammers and fire work, and so does a good lantern.

- _source:_ “Your people have the bites to prove it.”
- _unlock:_ when faced(s, 'swarm')

#### Sell-swords

`codex:foe_soldiers` · data/codex.ts:252

- _text:_

  > Since the war-pensions stopped, half the veterans in the realm work for whoever pays. They fight like soldiers, because they were.

- _source:_ “Your people faced them.”
- _unlock:_ when faced(s, 'soldiers')

### Powers & trades

#### The Assay Office

`codex:assay_office` · data/codex.ts:261

- _text:_

  > It licenses every reagent, focus and enchantment sold in Varrow, and tests the silver in the Crown Penny. Spellwork is a trade like any other here, and the Assay Office is its guild, its watchman and its tax collector.

- _source:_

  > [IF someone(s, (m) => m.profession is 'arcanist')] Your Arcanist complains about their fees. [ELSE] Heard in the market. [END]

- _unlock:_ when someone(s, (m) => m.profession is 'arcanist' and m.status is not 'left') or crier(s, 'assay_fees')

#### Saint Oda's

`codex:saint_oda` · data/codex.ts:269

- _text:_

  > A hospital church that runs the almshouses and trains field physicians. It preaches that lending at interest is a sin, which makes it unpopular at the bank and popular everywhere else.

- _source:_

  > [IF someone(s, (m) => m.profession is 'chaplain')] Your Chaplain trained there. [ELSE] Heard in the streets. [END]

- _unlock:_ when someone(s, (m) => m.profession is 'chaplain' and m.status is not 'left') or crier(s, 'almshouse') or scene festival has happened

#### The Mudlarks

`codex:mudlarks` · data/codex.ts:277

- _text:_

  > Children and grown thieves who work the riverbank at low tide. They know the tides and the toll-men, and which barges cross the chain after dark, and they'll sell any of it to whoever pays first.

- _source:_ “One of them sold you information.”
- _unlock:_ when scene informant has happened or crier(s, 'strongbox')

#### The Council of Varrow

`codex:council` · data/codex.ts:285

- _text:_

  > Nine seats: three for the Crown's officers, two for the merchant aldermen, two for the Lower Town's trades, and two that Ostrander's bought outright when a debtor alderman couldn't pay. It meets every season, and it can be persuaded.

- _source:_ “The Council posted its agenda.”
- _unlock:_ when council.agenda.length > 0 or council.history.length > 0
