# Cast proposal

**Status:** approved. The Act I scenes are in the game (`src/engine/data/cast.ts`), along with the three new factions and two new rivals. The Act II and III scenes listed below are still to be written. The story bible (`docs/STORY.md`, sections 4 and 5) is the canonical record of what is in the game.

The scripted story currently covers weeks 1 to 20 of a 200-week campaign, with five named characters and seven scenes. The goal is that every faction and rival has a face, and that each character comes back often enough for your earlier choices to show.

Each character gets:
- a **want** (something reasonable from their side);
- a **register** (how they talk, so they don't all sound like me);
- a **thread**: three or more scenes, where later ones change based on what you did earlier;
- a **cost**: helping them should hurt someone else.

---

## 1. The existing five, deepened

### Factor Maelis Vorn (Ostrander's)
- **Want:** a quiet, profitable collection. A riot is bad for business, and so is a guild that grows too strong.
- **Register:** clipped and practical. She corrects people's arithmetic without meaning it as an insult.
- **New scenes:**
  1. *The Notice Board* (Act I, around week 11). She drops by, notices a spelling mistake on your contract board and fixes it with her own pen. She asks, casually, how the silver job is going. You can lie, tell her, or ask why she wants to know.
  2. *Refinancing* (Act I end). She offers to buy your 800-crown loan from the Weighhouse at a lower rate. You'd save money and owe the bank instead of the merchants.
  3. *The Next Treaty* (Act II). If you learned what the bank wants (`vorn_slip`), she knows you know. She asks you to keep it quiet, and offers something real for it.

### Lord Treasurer Aubrey Fenn (Exchequer)
- **Want:** to keep paying long enough for something to change, and to stay a decent man while he does it.
- **Register:** tired and polite. He apologizes before asking for anything.
- **New scenes:**
  1. *Letters.* Short notes after big events, so he reacts to what you did without a full scene each time.
  2. *The Last Tapestry* (Act I end or Act II). He comes to the hall himself, without his clerks, and asks you to sell the Exchequer's last tapestry quietly in Harrowmere so the Crown can make payroll.
  3. *The Choice* (Act II braid point). He asks your advice on which of the Crown's bad options to take. Your trust with him decides whether he listens.

### Marta Hobb (Hobb & Daughters)
- **Want:** to keep the firm on top after she's gone, and to choose who that firm belongs to.
- **Register:** chatty and folksy. She asks after your members by name, which is worse than a threat.
- **New scenes:**
  1. *A Cake for the Hall* (Act I). She sends a cake when a member reaches level 3, along with a note about the member's mother. The scene changes depending on whether you sold her the share, refused, or humiliated her.
  2. *The Audit* (if you sold the share). She checks your books and finds what you didn't pay her.
  3. *Succession* (Act II). She's ill and asks you, of all people, which daughter should inherit.

### Isbet Hobb (Hobb & Daughters)
- **Want:** to run the firm her own way, which is colder and more modern than her mother's.
- **Register:** says very little. When she does speak, it's in numbers.
- **New scenes:**
  1. *The Copper Kettle* (Act I, after the field encounter). She buys you a drink and proposes splitting the river contracts between your two firms, without her mother knowing.
  2. *Two Sisters* (Act II). Her younger sisters Wren and Lotte Hobb come into it (named, but minor), and the firm starts to split.
  3. She becomes a rival in her own right if Marta dies or steps down.

### Dagny Fell (Porters' Fraternity, Lower Town)
- **Want:** fair wages and bread for the docks, without anyone in the Lower Town owing favors for it.
- **Register:** blunt. She swears a little and doesn't say thank you.
- **New scenes:**
  1. *Her Brother* (Act I, if you met her). Her brother Ansel is held at the river chain for smuggling. Freeing him is a story contract, and getting him out by talking costs less than breaking in.
  2. *The Strike* (Act II). The porters plan to stop work on the docks. Join them, break the strike for the Weighhouse, or keep the guild out of it.
  3. If she's your friend, she warns you once, for free, before something goes badly wrong.

---

## 2. New faces, one per faction and rival

### Alderman Piet Coster (The Weighhouse)
- **Who:** master of the city scales, and the man who holds your loan.
- **Want:** honest weights, and to come out of the debt crisis richer than he went in. He doesn't see a conflict between the two.
- **Register:** fussy and exact. He brings his own scales to meetings.
- **Scenes:**
  1. *Interest* (Act I, around week 8). He reminds you about the loan, and offers to waive a quarter's interest if your guild inspects a rival merchant's weights.
  2. If Vorn buys your loan, he takes it personally.
  3. In Act II he can be caught selling Weighhouse votes to the bank.

### Sister Agathe Brune (Saint Oda's)
- **Who:** almoner of Saint Oda's almshouse, which counts its beds every night.
- **Want:** to keep the almshouse open. She preaches against usury, and quietly takes the bank's donations.
- **Register:** brisk and practical. She mentions God in passing and the price of firewood in detail.
- **Scenes:**
  1. *Fever Salts* (Act I). The almshouse needs remedies from the Saltfens, and she can only pay in favors.
  2. *The Donation.* The bank offers the almshouse a large gift on condition that she stops preaching against the debt. She asks what you would do.
  3. In Act II she can bring the church's voice to the Council.

### Lady Honora Aske (The Fourteen)
- **Who:** head of one of the fourteen founding families. Her castle at Aske is pledged to the bank.
- **Want:** to keep her family's name and something to pass on, even if the castle goes.
- **Register:** charming and a little careless with money. She's never had to count it until now.
- **Scenes:**
  1. *The Family Plate* (Act I end). She asks you to move her family silver out of the castle before the bank's assessors arrive. This is illegal, and well paid.
  2. *The Fourteen Split* (Act II). The families divide over the Crown's choice, and she asks for your guild's support.

### Wenna Pask (The Mudlarks)
- **Who:** runs the low-tide market on the river flats, where things that fell off barges are sold.
- **Want:** a city where the river chain doesn't matter.
- **Register:** quick and funny, and never answers a question directly.
- **Scenes:**
  1. *Under the Chain* (Act I). She offers you a smuggling route around the river tolls. It brings cheaper supplies and Heat.
  2. *The Empty Strongbox.* Following up the street talk, she shows you what really came up out of the mud.
  3. In Act III, when the bank closes the river, she knows the other way through.

### Captain Rufus Mayne (The Ninth, rival)
- **Who:** the Ninth were a royal regiment at Cassel Ford. They were disbanded in the peace treaty and now work as a free company. Mayne was a sergeant then and is the captain now.
- **Want:** pay for his men, and to be on the winning side for once.
- **Register:** loud, friendly, and very good at recruiting.
- **Scenes:**
  1. *An Offer for Your Best* (Act I). He tries to hire away your strongest fighter. You can match his offer, let them go, or call in their contract.
  2. If a veteran of Cassel Ford is in your roster, they knew each other.
  3. In Act III the bank hires the Ninth against you, unless you got to Mayne first.

### Master Assayer Corwin Plaice (The Assay Office, rival)
- **Who:** licenses every reagent and enchantment sold in Varrow, and inspects workshops.
- **Want:** to have no magic in the city that he hasn't licensed and charged a fee for.
- **Register:** pedantic and very patient. He reads clauses aloud.
- **Scenes:**
  1. *Inspection* (when you build a Laboratory). He inspects it. Pay the fee, bribe him, or fight it at the Exchequer.
  2. *Debased Coin* (Act II). The Assay Office tests the silver in the Crown Penny. If the Crown debases the coin, he decides whether to say so.

---

## 3. Someone in the hall (optional)

### Jory Abbot, the hall's clerk
- **Who:** came with the charter, and has outlasted three guildmasters.
- **Why:** gives the guild a voice of its own, so the hall feels lived in.
- **How:** an occasional one-line remark in the week report, reacting to what happened ("Jory has stopped asking when the Weighhouse will be paid and started asking whether"). Never exposition, and never more than once a week.
- **Scenes:** one or two, for example when a member dies.

---

## 4. Rough shape

- **Act I** gains about 10 scenes, bringing it to about 17. These include the new scenes for the five existing characters plus Coster, Brune, Pask, Mayne and Plaice. Lady Aske arrives at the end of the act.
- **Acts II–IV** get the remaining scenes for each character as those acts are written.
- Every new scene goes through the story checker, the style checker and the playthroughs, as before.
