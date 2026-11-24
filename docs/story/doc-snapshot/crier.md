## Heard in Varrow (street talk)

One line a week in the week report.

| ID | text | when |
|---|---|---|
| `crier:start_iron` | The armorers on Anvil Row have started taking old horseshoes in part payment. | when start includes iron_short |
| `crier:start_reagents` | Apothecaries on Still Lane are selling fen salts by the bucket, and complaining about it. | when start includes reagent_glut |
| `crier:start_timber` | Barges of fresh-cut oak go past the chain every morning, every log stamped with Ostrander's mark. | when start includes timber_cheap |
| `crier:start_bread` | A baker on Fish Quay has started selling half-loaves, and charging three quarters for them. | when start includes grain_dear |
| `crier:start_coop` | Porters on the river steps point out your hall to strangers and tell them who paid for it. | when backer is coop |
| `crier:start_college` | Students at the college have a song about the fire. Your founders have asked them not to sing it near the hall. | when backer is college |
| `crier:start_veterans` | Old soldiers drink to your guild at the Copper Kettle, mostly because your founders are buying. | when backer is veterans |
| `crier:veteran_song` | A one-legged veteran outside the Copper Kettle sings about Cassel Ford for coppers. Nobody joins in on the chorus. |  |
| `crier:assay_fees` | The Assay Office has raised its fees on reagent warrants again. Arcanists are grumbling in the college yards. |  |
| `crier:almshouse` | Saint Oda's almshouse turned people away at the gate this week, for the first time anyone can remember. |  |
| `crier:strongbox` | Mudlarks pulled a strongbox out of the river mud at low tide. It was empty, which surprised nobody. |  |
| `crier:arrears` | A crier reads the Crown's arrears aloud in the market square. The crowd jeers at the total. | when arrears clock > 45 |
| `crier:coin` | Moneychangers at the Weighhouse are biting every penny now, and weighing the ones that pass. | when cointrust clock < 45 |
| `crier:chalk` | Someone chalked BREAD NOT BANKS across the Weighhouse doors overnight. It took three porters to scrub it off, and none of them hurried. | when unrest clock > 45 |
| `crier:mill` | Ostrander's has bought another mill on the river. People say the old miller has taken to drinking. | when leverage clock > 30 |
| `crier:loaves` | Bakers have shortened their loaves by a finger to cover the grain levy. Customers have noticed. | when decree grain_levy in force |
| `crier:searches` | Soldiers at the river chain are searching every barge twice. The queue of barges reaches back past the bend. | when decree martial_law in force |
| `crier:dole` | The bread dole queue in the Lower Town starts before dawn. It is the quietest the streets have been in a year. | when decree bread_dole in force |
| `crier:isbet` | Isbet Hobb was seen in the Exchequer gallery again, taking notes. | when scene hobbs_arrive has happened |
| `crier:ship` | A ship from Ostrander's home port is overdue. The bank's factors are short-tempered this week. |  |
| `crier:pensions` | Old soldiers' pensions are three quarters late. The Crown says next quarter. It said that last quarter. |  |
| `crier:ice` | Ice has formed on the river chain. The toll-men are chipping it off with axes and swearing at the cold. | when ((week - 1) % 48) >= 36 |
| `crier:fair` | The summer wool fair at Harrowmere is smaller than last year. The buyers from the coast didn't come. | when ((week - 1) % 48) >= 12 and ((week - 1) % 48) < 24 |
| `crier:default_talk` | Since the missed payment, every tavern argument ends the same way: who will the bank take first? | when silver_lost |
| `crier:paid_talk` | People are still talking about the silver reaching the coast. Somebody wrote a song about it. It isn't good, but it's popular. | when silver_delivered |
