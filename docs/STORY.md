# Story Bible — *Ledger & Blade*

> The single source of truth for the story. Anything marked **Canon** is established in the game and must not be contradicted. **Draft** is planned but not yet written. Update this file in the same change as any story content.

---

## 1. How the story is kept consistent

Every story change goes through these checks. None of them are optional.

1. **Facts are registered.** Every story flag lives in `src/engine/data/facts.ts` with a one-line meaning. An unregistered or misspelled fact will not compile. Facts that can't both be true are listed in `EXCLUSIVE_FACTS`.
2. **Characters are tracked.** Named characters have a status (alive / dead / gone) and an attitude toward the guild (−100 to 100). Events declare the characters in them (`npcs: [...]`) and will not fire if any of them is no longer alive.
3. **Beats are ordered.** Story beats declare what must come first (`after: [...]`) and a window of weeks. A beat can be delayed by its conditions but never fires out of order.
4. **The story checker** (`npm test`, file `tests/story.test.ts`) plays 400 games with random story choices and fails the build on:
   - a choice that leads to a node that doesn't exist;
   - text with an unfilled placeholder (`{name}`, `undefined`, `NaN`);
   - two contradictory facts being true together;
   - a beat firing early, out of order, or featuring a character who isn't alive;
   - a conversation node no playthrough can reach;
   - a fact that is read but never set, or registered but never used;
   - an event that leaves the player with no choice they can afford.
5. **The coverage report** (`npm run story` → `docs/reports/story-coverage.md`) shows when each beat really fires, how often each branch is taken, and how story arcs resolve.
6. **Sample playthroughs** (`npm run playthroughs` → `docs/playthroughs/`) are full games written out as a player would read them. They're the final check on whether the story reads well.
7. **The story document** (`npm run story-export` → `docs/story/all-writing.md`) lists all the game's writing by thread, with each scene's triggers and the facts that link it to later scenes. The owner's editable copy, and how their comments come back into the code, are described in `docs/story/README.md`.

**Structure rule: braided, not tree-shaped.** Choices split the story, but each act rejoins at a small number of key beats. Those beats read the state of the world (facts, the Debt clocks, faction standing, character attitudes) and change their text and options to match. This keeps the number of branches manageable while choices still clearly matter.

---

## 2. Canon: the world

- **The Debt (Canon).** Twenty-two years ago King Aldric's army lost the war at **Cassel Ford**. The peace treaty obliges the realm to repay roughly **four million crowns** to **Ostrander's**, a foreign bank that financed the victors. It is paid in quarterly installments. If the Crown misses a payment, the treaty lets the bank **collect however it likes**: seize tolls, close the river, call in collateral.
- **What has been sold already (Canon):** the crown forests, the river tolls (now Ostrander's), half the royal plate, the Exchequer's tapestries.
- **Varrow (Canon):** the capital. A river port with a chain across the river where tolls are collected. The **Lower Town** lies below the walls: docks, porters, small trades. **Anvil Row** has the armorers, **Tallow Street** has the guild's hall, and the **Copper Kettle** is a tavern.
- **Places (Canon):** Old Pellam (the buried first town under the Lower Town, §5d), Drover's Road (cattle road, hills east), Harrowmere (lake town with an old bridge), Kell Mines (silver, partly flooded), the Saltfens (estuary marshes, reagents, fever), Port Anselm (coast; Ostrander's ships take the Crown's silver here), Wenmouth ford (on the road to Anselm), and **the green** below the walls, where fairs and the Crown's muster are held.
- **Magic (Canon):** common, and practised like a science or trade. It is studied at **the college**, licensed by the **Assay Office**, sold by the dose (reagents), and keyed to elements: fire, frost, storm, radiant, shadow. It is powerful but never free. **There is no supernatural plot.** Magic is part of the economy, not a mystery.
- **Tone (Canon):** in between. Grounded, human-scale politics and money; morally grey choices; dry humor. Nobody is purely evil. The bank is doing what banks do.

## 3. Factions and their positions on the Debt (Canon)

| Faction | Position on the Debt |
|---|---|
| The Exchequer | Must keep paying without losing the realm; squeezes everyone to do it. |
| The Weighhouse | Merchants; split. Some act as Ostrander's local agents. They hold the guild's 800-crown loan. |
| Ostrander's | It is the Debt. Wants repayment, and the right to write the next treaty. |
| The Lower Town | Pays the taxes that service the debt; close to riot. |
| Saint Oda's | Hospital church that runs the almshouse and fever ward. Preaches against usury and takes the bank's donations to buy firewood. Known once you meet Sister Brune. |
| The Fourteen | Founding noble families whose castles are the bank's collateral. Known once you meet Lady Aske. |
| The Mudlarks | River scavengers and smugglers who go round the bank's toll chain. Known once you meet Wenna Pask. |

**The Council of Varrow (Canon):** nine seats. The Exchequer holds 3 (Crown officers), the Weighhouse 2 (merchant aldermen), Ostrander's 2 (seats bought with debt, a sore point in the city), and the Lower Town 2 (porters and trades). It meets every season.

**Rivals (Canon):**
- **Hobb & Daughters**, a family firm of debt collectors on retainer to the bank. Active from the start.
- **The Ninth**, a royal regiment disbanded under article nine of the treaty and paid off in Crown Pennies, now a free company. Active once Captain Mayne arrives.
- **The Assay Office**, which licenses every reagent, focus and enchantment and tests the silver in the Crown Penny. Active once Master Assayer Plaice visits.

Saint Oda's, the Fourteen and the Mudlarks have no Council seats. *(Draft: whether they gain seats is an Act II question.)*

## 3b. Starts, Legends and wars (Canon)

- **Starts.** The backer and circumstances are canon for that campaign only (`src/engine/data/starts.ts`). Scenes may react to them but must work for every start. The story checker plays many seeds, so every combination is exercised.
- **Legends** are named by the street in the `legend_named` scene (`QUEUED_EVENTS` in `cast.ts`). Feats are written as "how {first} ..." so they can be dropped into street talk.
- **Named characters can die in a guild war:** Marta, Isbet, Mayne and Plaice. Any beat that needs a dead character does not fire (`npcs` on `EventDef`). Write later beats so they still make sense if one of them is gone, and give the rival a successor or an ending (`afterLeaderDies` in `war.ts`).

## 4. Cast

Every faction and rival has a face. Each character has a want that is reasonable from their side, a register of their own, and a thread of scenes that react to earlier choices. Full voice notes: `docs/CAST-PROPOSAL.md`.

| Id | Character | Who they are | Voice | Canon so far |
|---|---|---|---|---|
| `vorn` | **Factor Maelis Vorn**, Ostrander's | Runs the bank's office on Quay Street | Clipped and practical; corrects spelling; honest in a way that is not the same as being on your side | Offers bank work. May let slip the bank wants to write the next treaty. Visits about the silver's timing (*The Notice Board*). Offers to buy part of your loan. |
| `fenn` | **Lord Treasurer Aubrey Fenn**, Exchequer | Runs the treasury | Tired and polite; apologizes before asking | Commissions the Crown's silver. Writes after the bread riot. Asks you to sell the last tapestry, the Siege of Carrow. |
| `marta` | **Marta Hobb**, Hobb & Daughters | Head of the firm for thirty years | Chatty and folksy; remembers your members' mothers | Offers to buy a quarter share. Sends a cake when a member reaches level 3. |
| `isbet` | **Isbet Hobb** | Marta's eldest daughter and heir | Says little, mostly numbers | Offers a private split of the river work behind Marta's back. Audits the share and offers to sell it back. *(Draft: a rival in her own right in Act II.)* |
| `dagny` | **Dagny Fell**, Porters' Fraternity | Carrier with a cargo hook on her belt | Blunt; doesn't say thank you | Meets the guild at the bread riot. Asks for help with her brother Ansel. |
| `coster` | **Alderman Piet Coster**, Weighhouse | Master of the city scales; holds your loan | Fussy and exact; brings his own brass balance | Offers to cut the loan if you prove Hesketh's short weights. Takes the bank's loan offer personally. Tied by the river strongbox to an insurance fraud. |
| `brune` | **Sister Agathe Brune**, Saint Oda's | Almoner of the almshouse | Brisk; God in passing, firewood in detail | Needs fever salts from the Saltfens. Asks your advice about the bank's donation. |
| `pask` | **Wenna Pask**, Mudlarks | Runs the low-tide market on the river flats | Quick and funny; never answers directly | Offers a route round the toll chain. Shows you what was in the river strongbox. |
| `mayne` | **Captain Rufus Mayne**, the Ninth | Was a sergeant at Cassel Ford | Loud, friendly, always recruiting | Tries to hire your best fighter. Knows any Cassel Ford veteran in your roster. Comes to the hall for the Ninth's colours if a squad brings them home (*The Ninth's Colours*, §5d). |
| `plaice` | **Master Assayer Corwin Plaice**, Assay Office | Licenses all magic in Varrow | Pedantic and patient; quotes clauses | Inspects the guild and offers a license. |
| `aske` | **Lady Honora Aske**, the Fourteen | Head of a founding family; castle pledged to the bank | Charming and careless with money | Asks you to move the family silver before the assessors arrive. |
| `jory` | **Jory Abbot**, the guild | The hall's clerk through three guildmasters | Dry; gives advice only as remarks | Remarks in the week report ("In the hall"). Asks how to record the dead. |


---

## 5. Act I: The First Collection (Canon)

Weeks are windows. A beat fires on a random week inside its window, or at the end of it, once its prerequisites have fired and its conditions are met.

| # | Beat | Window | After | Condition | Characters |
|---|---|---|---|---|---|
| 1 | `charter` A Charter and a Debt | 1 | — | — | (Exchequer clerk), Jory |
| 2 | `ostrander_agent` A Visitor from Ostrander's | 2–3 | — | — | Vorn |
| 3 | `coster_interest` The Man with the Scales | 3–5 | — | — | Coster |
| 4 | `hobbs_arrive` Hobb & Daughters | 4–6 | 2 | — | Marta, Isbet |
| 5 | `bread_riot` Bread and Stones | 5–7 | — | Unrest ≥ 31 or week ≥ 7 | Dagny |
| 6 | `silver_summons` Summoned to the Exchequer | 7–9 | 2 | — | Fenn |
| 7 | `pask_chain` Under the Chain | 6–10 | — | — | Pask |
| 8 | `brune_salts` Fever Salts | 8–11 | — | — | Brune |
| 9 | `mayne_offer` An Offer for Your Best | 10–14 | — | An idle fighter or senior member | Mayne |
| 10 | `vorn_board` The Notice Board | 10–14 | 2, 6 | Silver accepted and not yet resolved | Vorn |
| 11 | `dagny_brother` Dagny Asks | 11–15 | 5 | Met Dagny | Dagny |
| 12 | `isbet_kettle` The Copper Kettle | 12–16 | 4 | — | Isbet |
| 13 | `quarter_day` Quarter Day | 9–18 | 6 | The silver's fate is known | (varies) |
| 14 | `plaice_inspection` Clause Eleven | 12–18 | — | — | Plaice |
| 15 | `fenn_tapestry` The Last Tapestry | 15–20 | 13 | — | Fenn |
| 16 | `aske_plate` The Family Silver | 17–22 | 13 | — | Aske |
| 17 | `act1_slice_end` Half a Year | 22–26 | 13, 15, 16 | — | — |

Only one beat fires a week. Beats whose window closes first are checked first (`STORY_EVENTS` is sorted by window end).

### Branches and the facts they set

- **1. Charter.** No exposition (any guildmaster knows the city's situation; that lives in the Codex as common knowledge). Choose: arm the guild (`start_arms`), a free Arcanist, or +80 crowns.
- **2. Vorn.** Show her the door (bank −10, Lower Town +6, Vorn −15), or hear her out. You can ask about the people collected from (`vorn_q_people`, Lower Town +2), about the Hobbs (`vorn_q_hobbs`, +1 Intel), and what the bank wants (Guile check: `vorn_slip` on success, `vorn_q_want` on failure). Then the terms: work for the bank (`ostranders_open`, Vorn +15), case by case (`ostranders_open`, Vorn +5), or not today (Vorn −5). Not today can be undone later by courting Ostrander's from the Realm screen, which also sets `ostranders_open`.
- **4. Marta.** Her greeting changes if bank standing ≥ 8. Choices: refuse; or ask the terms, then sell the share (`hobbs_share`: 25% of contract pay goes to her, the Hobbs compete far less, Marta +15), refuse, or humiliate her (Guile check; Hobbs grow more aggressive either way, and the feud rises by 25, which is enough to make it a feud at once).
- **5. Riot.** Feed them (8 supplies) or pay the bakers (35 crowns) → meet Dagny → her ears (`dagny_contact`: occasional Intel tips) or nothing (`dagny_friend`, Lower Town +4). Or take the Exchequer's purse → hold the line without blood (Endurance check) or break the crowd. Or bar the doors.
- **6. Fenn.** You can ask who knows the route (`fenn_route`: reveals a convoy danger when you accept), pass on what Vorn let slip if you learned it (`vorn_slip` → `fenn_stakes`: Fenn +15, Influence +2), ask the pay (`fenn_pay`), then haggle (Guile check: `silver_bonus` +60, or `fenn_haggled`). Then accept (`silver_accepted`, adds the story contract) or decline (`silver_declined`; Hobb & Daughters carry it, Fenn −15).
- **The Crown's Last Silver** (story contract, threat 4, Port Anselm). Success sets `silver_delivered` (Arrears −15). Failure sets `silver_lost` (Arrears +12; the Crown defaults). Letting it expire sets `silver_abandoned` and `silver_lost`: the Exchequer's own guard took the wagons as far as Wenmouth ford and waited there for the guild until the ships had sailed, then took the silver back to the vault and went home.
- **13. Quarter Day: the act's braid point.** One of three versions:
  - *Delivered:* Fenn offers a purse, a writ of good conduct (Heat −20), or a seat at the Exchequer table (`fenn_ally`, Influence +4).
  - *Lost or abandoned:* the first default in 22 years. Vorn sends for you: serve the bank, swear to the Lower Town, or stay out.
  - *Declined:* the Hobbs delivered it, lighter than it left. You can spend 3 Intel to prove they skimmed.

- **3. Coster.** Ask about Hesketh's buyers (+1 Intel). Take the job (`coster_job`, story contract *Short Weight at Hesketh's*: success `weights_exposed`, Weighhouse +6, Lower Town +4, loan −40; failure or expiry `weights_failed`), haggle (Guile: `coster_terms`, loan −20 now), or decline.
- **7. Pask.** Buy through her (`met_mudlarks`, `pask_deal`: Mudlarks +22, Heat +4), buy one cartload, report her (`pask_reported`: Mudlarks −30, which brings thefts), or say no. Her opening line changes with how you handled the riot (`riot_fed`, `riot_broken`).
- **8. Brune.** Fetch the salts (`met_oda`, `salts_accepted`, story contract *Salts for Saint Oda's*: `salts_delivered` / `salts_failed`), give 40 crowns, or refuse. You can ask about the bank's donations (`brune_q_bank`).
- **9. Mayne.** Picks your most senior idle fighter. Ask about the Ninth (`mayne_q_ford`). Match his offer (wage +2), let the member decide (they leave if loyalty < 50), or hold them to contract. Any choice sets `ninth_active`.
- **10. Vorn's notice board.** Her greeting depends on `vorn_fixed_board`. Tell her the convoy's timing (`vorn_told`: the convoy gains a Soldiers danger), lie (Guile), ask whether the bank wants it to fail (needs `vorn_slip` or `vorn_q_want`; sets `vorn_honest`, reveals a convoy danger), or refuse.
- **11. Dagny.** Take the story contract *Ansel Fell at the Chain* (`ansel_freed` / `ansel_lost`), ask Pask for the chain-house plan (needs `pask_deal`), pay his fine (−90 crowns, `ansel_freed`), or refuse (her dock tips stop: clears `dagny_contact`).
- **12. Isbet.** Agree to the split (`isbet_pact`: the Hobbs contest far less river work) or tell Marta (`isbet_betrayed`).
- **14. Plaice.** Buy the license (`assay_licensed`), bribe him (Guile), have the Exchequer stay it (Influence), or take your chances. Any choice sets `assay_active`.
- **15. Fenn's tapestry.** Opening changes with the silver's fate. Carry it to Harrowmere (story contract: `tapestry_sold` / `tapestry_lost`), lend the Crown 150 and hang it in your hall (`tapestry_bought`), or refuse.
- **16. Aske.** Move the silver (`met_fourteen`, illegal story contract: `aske_plate_saved` / `aske_plate_lost`), tell the assessors (`aske_betrayed`), or stay out.
- **17. Half a Year.** Summarizes the silver and the other threads that resolved. Every Act I outcome has a line here, including the ones nothing else reacts to: `silver_abandoned` (the Crown's wagons waited at Wenmouth ford for an escort that never came), `fenn_ally` (the guild sits at the Exchequer's table on Thursdays), `weights_failed`, `isbet_betrayed` (Isbet stops going to the Copper Kettle when your people are there; only while she is alive), `tapestry_sold`, `tapestry_lost` and `aske_plate_lost`.

**Follow-ups** (random events that fire once, when their conditions hold): `marta_cake` (a member reaches level 3; the card depends on Marta's attitude), `hobbs_audit` (`hobbs_share`: buy it back for 250), `coster_bank` (`bank_paid_loan`), `pask_strongbox` (met Pask, not reported: buy `coster_ledger`), `coster_page` (`coster_ledger`: lean on him for loan −150, expose him (`coster_exposed`), or sell the page to Vorn), `brune_donation` (met Brune and bank work open), `fenn_letter` (text depends on the riot flags), `jory_page` (after the first death).

**Story contracts** carry their own outcome facts (`successFlag`, `failFlag`, `expireFlags` in `contracts.ts`), so a contract that is accepted and never sent still resolves the story.

### Facts that can never be true together

See `EXCLUSIVE_FACTS` in `facts.ts`. Besides the silver pairs: the three riot outcomes, `weights_exposed`/`weights_failed`, `pask_deal`/`pask_reported`, `salts_delivered`/`salts_failed`, `isbet_pact`/`isbet_betrayed`, `ansel_freed`/`ansel_lost`, the three tapestry outcomes and the three Aske outcomes.
`silver_delivered` ⟂ `silver_lost` · `silver_delivered` ⟂ `silver_declined` · `silver_accepted` ⟂ `silver_declined` · `silver_bonus` ⟂ `fenn_haggled` · `vorn_slip` ⟂ `vorn_q_want` · `dagny_contact` ⟂ `dagny_friend`

---

## 5b. Field decisions: door scenes (Canon)

Not story beats: they fire **at the door of an expedition**, as a squad sets out for a distant site (one with road weeks; never Varrow or Old Pellam), before the trip is sealed (`src/engine/data/field.ts`). Each one is news brought to the yard on Tallow Street as the squad gets ready, by a carter, a stable boy or someone who came that way, and the choice is the last order the squad gets. Once a squad is through the door nobody can send it orders, so there is no arrival report any more. There are ten: *The Bridge Is Out*, *A Deserter at the Door*, *Watched*, *A Local Guide*, *A Wounded Carter*, *Hobb's People Are Packing*, *The Weather Turns*, *Fresh Tracks*, and two that pay off Act I outcomes and fire once a game:
  - *The Crown's Wagons* (`silver_abandoned`, a squad bound for Port Anselm): the Crown's empty wagons are still at Wenmouth ford, with an Exchequer clerk living in one because nobody told him to come back. Bringing him home: Exchequer +3, Fenn's attitude up, the squad a little more tired.
  - *An Exchequer Writ* (`fenn_ally`): Fenn sends a writ letting the squad change horses at the Crown's post-houses. Taking it: the squad arrives fresher, Lower Town −2 for riding with the Crown's colors.

What they change (a harder road, a guide, a bonus, a delay) is folded in before the trip is sealed. They are covered by the story checker. Characters who can appear: **Isbet Hobb** leads the rival squad in *Hobb's People Are Packing* (attitude falls if you sabotage her camp). If you told Marta about her offer (`isbet_betrayed`), she sends the guild her mother's regards and nothing else (only while Marta is alive), and rides past the hall door without turning her head. **Fenn** sends the writ and is thanked for in *The Crown's Wagons*.

## 5c. Dates (Canon)

A **Date** is a day on the guild's calendar, three to six weeks ahead, that the player prepares for in one sitting. One Date is always current, and the next is already in view ("After that"). Content is in `src/engine/data/dates.ts`, and the rules are in `src/engine/story/dates.ts`.

- **How one resolves.** At the end of its week, every target met pays its reward. Anything less applies its cost. Either way the week report shows a dispatch ("…: met" or "…: missed").
- **Twists.** A twist is checked every week until the Date arrives. When the story moves, a Date can be called off (`cancel`). A Date is also called off if a character it names is no longer alive. A called-off Date leaves a dispatch ("…: called off"), and the next one moves up.
- **Order.** The first two Dates always come in this order, and after that they're chosen by weight from the ones available:
  1. *The Weighhouse Collects* (the loan's first due week);
  2. *The Exchequer's List*.
- **Not a story beat.** A Date never fires a scene and sets no facts. It only reads facts and reports. A missed Date says which target failed.

| Date | Who | Available when | Targets | Twist |
|---|---|---|---|---|
| The Weighhouse Collects | Coster's clerk | Week 1–2, a loan exists | Pay on the day; a week's costs left after | — |
| The Exchequer's List | Fenn's office | By week 9 | 2 successful contracts (not operations); +4 Renown | — |
| The Council Votes | The Council | An agenda is posted | Back the winning side of one decree (stances lock in the vote week) | — |
| The Lord Treasurer Visits | Fenn | `silver_delivered` | Exchequer ≥ 10; Heat < 30 | — |
| Ostrander's Reads the Books | Vorn | `ostranders_open`, week 8+ | A healthy balance; Heat < 40 | — |
| Saint Oda's Fair | Brune | `met_oda` | 30 supplies, 15 of them given; Lower Town standing up | — |
| The Exchequer's Auditors | The Exchequer | Heat ≥ 20 | Bring Heat down by 8 | — |
| The Porters' Feast | Porters' Fraternity | Week 8+, Unrest < 80 | Lower Town standing up | Called off if Unrest ≥ 85 |
| The Weighhouse Reviews the Note | Coster | Week 14+, 200+ owed | Pay the Weighhouse 100, due payments included | Called off if Coster is gone |
| The Muster on the Green | The Crown's muster officers | Week 10+ | One more member, within the hall's room; 2 at level 3+ | — |
| Before the Snow | Jory | Autumn, weeks 1–8 | Four weeks of food in store | — |
| Marta Hobb's Wager | Marta | Week 12+, the Hobbs active, not at open war | Renown above the Hobbs' | Called off if Marta dies or the feud turns to open war |

**Writing.** A Date's text is one or two sentences in the narrator's voice. It says who is coming and what they will judge, and never explains the world. Jory only ever makes remarks. The met and missed lines report what happened, in the dry register of the week report, and promise nothing the stakes don't give.

## 5d. Expeditions (Canon from v0.13.0)

Contracts are walked as **expeditions** to real places (`docs/EXPEDITIONS.md`). A posting names a site, a route length and a goal; the patron and the story facts work as before. The expedition plays itself and is revealed a week at a time; the player's part is the preparation. Content is in `src/engine/expeditions/data/` (`content.ts` for sites, zones, monsters, bosses and goods; `lines.ts` for Old Pellam's log and the default lines; `lines-sites.ts` for the other sites' first zones; `lines-deep.ts` for their deeper zones and bosses). The other sites' postings are in `src/engine/data/contracts-sites.ts`. All of it is in the story document's Expeditions tab.

### How an expedition reads

- **The yard and the door.** A squad gets ready in the yard of the hall on Tallow Street in its dispatch week. Bound for a distant site, it may hear news at the door (§5b). After that nobody can send it orders: there are no messengers, no recalls and no arrival reports. The prep sheet is the guild's last word.
- **The log** is written in the narrator's dry voice, in the present tense. Members are named or called "they". Most situations (a passage, a hit, a kill, a camp) have two or more versions, used in turn before any repeats; some rare ones (a crit, each Sink change) have one. A site's own version replaces the general one (`key:<site>`), then a kind of place (`key:town` for Varrow, `key:overland` for the distant sites), then the default, which is written for Old Pellam.
- **A beaten squad.** If everyone goes down, the squad is lost and comes home with nothing. When nobody died, the lines home say so (`lost_crawl_all`, `lost_home_beaten`, `road_home_beaten`) instead of counting the dead.
- **Down below.** The week report has a Down below row for each squad: rooms, fights, finds, who went down. A squad home brings a report: the tier (Triumph, Success, Costly Success, Failure or Disaster; Withdrawn if it was called off at the door), who died, the loot and the pay.
- **Wear, not breakdowns.** Members carry **Fatigue** (wear) and **Exposure** (what got into them), and bring home scars, habits and Sink changes. Habits are quirks a member picks up down there (hating the dark, humming on the march), not breakdowns: there is no stress meter, no afflictions, no madness and no torch meter. This is our own game, not a copy of Darkest Dungeon (the owner turned down Grit as "too much of a ripoff").

### The sites

Every site is built like Old Pellam (Canon from v0.14.0): three zones and a boss. A short route stays in the first zone, a medium route goes on into the second, and a long route goes down through all three to the boss's room. A plain job ("see the job through") on a long route walks the third zone and stops short of the boss; postings with a goal of their own (reach a zone, bring something back, kill something) go all the way.

| Site | Zones, shallowest first | Boss | Kind | Who posts work there | Who and what is met |
|---|---|---|---|---|---|
| **Old Pellam** | the Culverts, the Buried Streets, the College Sink | the Kiln Engine | under the city | Saint Oda's, the Exchequer, the Mudlarks, the Weighhouse, Ostrander's, the Porters' Fraternity (`pellam_*`) | grubbers; culvert rats, tallow moths, sink eels, cellar spiders, pale hogs, sink crabs, seeps, Assay engines |
| **Varrow** | the Lower Town, the Quays, the Rookeries | Lew Rudd, in Rudd's yard | the city | any patron with work in the city; the Exchequer (bonded brandy), the Porters (the yard dogs, Rudd) (`varrow_*`); the story contracts *Short Weight at Hesketh's* and *Ansel Fell at the Chain* | hired thugs, the watch's guards and sergeants, footpads, lightermen, yard dogs, rioters |
| **Kell Mines** | the upper workings, the Sump, the Trevick level | Gaffer Moyle | overland, north | as classic Kell work; the Weighhouse (ore; Moyle, for the merchants who lease the workings from the bank), Ostrander's (a survey of the Sump for the silver warrants it bought from the Crown; needs `ostranders_open`) (`kell_*`) | claim-jumpers, powder men, pit ponies, cave crabs, culvert rats; bad air (gas), falls of rock |
| **The Saltfens** | the reed paths, the Pans, the Withies | the Dean, a marsh boar | overland, the estuary | as classic Saltfens work; *Salts for Saint Oda's*; Saint Oda's (pan salt), the Weighhouse and the Porters (the Dean) (`fens_*`) | salt-cutters gone feral, fowlers, fen leeches, marsh hogs; the marsh fever, brine |
| **Drover's Road** | the hill road, Brannock Moor, Skell Gap | Sergeant Abner Crewe | overland, east | as classic road work; *The Aske Silver*; the Weighhouse and the Porters for the cattle dealers (the bull), the Weighhouse for the wool merchants (fleeces), the Exchequer (Crewe) (`drovers_*`) | road agents, reivers, deserters from the Ninth, hill wolves, moor bulls; stampedes, scree |
| **Harrowmere** | the lake shore, the bridge houses, the Holms | the Bailiff, a pike | overland | as classic lake work; *The Exchequer's Last Tapestry*; the Weighhouse for an Anvil Row cabinet-maker (bog oak), the Mudlarks and the Porters for Harrowmere's fishermen (the Bailiff) (`mere_*`) | lake smugglers, night boatmen, crayfish, mere pike; rotten floors |
| **Port Anselm** | the Wenmouth road, the Burrows, the Strand | Mags Tull and her wreckers | overland, the coast | as classic coast work; *The Crown's Last Silver*; the Weighhouse for a Quay Street perfumer (ambergris), Ostrander's (the insurers' survey, needs `ostranders_open`; it names Vorn, who cannot die or leave), the Exchequer (Tull) (`anselm_*`) | road agents, deserters, wreckers, herring gulls, Ostrander's tidewaiters; the tide |

The distant sites add road weeks there and back (`road_out`, `road_on`, `road_back`, `road_home`). Varrow and Old Pellam have no road, so no door scenes fire for them.

**Bosses are beaten once** (`GameState.delve.bossesBeaten`). The first time one falls, the report says what the place makes of it, its posting comes off the board for good, and long routes that still go to its room meet a lesser fight there from whoever moved in (`afterKey`, `after` in `SITES`). In Old Pellam that is the Kiln's yard, on the salts and survey postings. On the other sites, once the boss is beaten, the site posts the work in its room (`*_after` postings in `contracts-sites.ts`: Rudd's old yard, Moyle's chair, the Dean's wallow, the toll house again, the Bailiff's water, Tull's cove), a long route that ends there. Only one squad at a time can be on its way to a boss, and beyond Old Pellam a boss is only posted once a squad has reached that site's second zone. If the boss dies but the squad is lost, the report says so instead of the thanks. Each boss is an animal or a person, never anything evil: a man who rents out muscle, a claim-jumper who never paid for his vein, an old boar, a deserter sergeant, a big pike and a wrecker. People bosses can't be talked out of the fight by an Envoy.

### Old Pellam

- **What it is.** Pellam was the first town on the river. When the river moved two hundred years ago, Pellam silted up and Varrow was built on top of it. Its cellars and streets are still down there, under the Lower Town. You get in by the steps behind the chandler's on Tallow Street, through a culvert grate and down iron rungs.
- **The Culverts** are the Lower Town's brick drains and cellars, with grates that let a little daylight down. Everything the Lower Town throws away ends up there. The short route ends at the old pump house.
- **The Buried Streets** are Pellam's own streets of yellow stone, roofed over by Varrow's foundations. The houses stand full of silt, with their signs and doorsteps. There is no light. The medium route ends at Pellam's counting house, whose vault nobody upstairs knew about.
- **The College Sink** is where the college poured its spent reagents for a century. The walls sweat green and violet, the floor is a glassy crust, and the air tastes of pennies. The long route ends at the Kiln Engine.
- **Nothing down there is supernatural.**
  - The animals grew big and pale, or strange, on runoff. Rats the size of cats, tallow moths that drink lamp oil, grey sink eels as long as a cart, cellar spiders, pale hogs (pigs that got down a century ago and kept breeding) and sink crabs.
  - **Seeps** are spills of spent reagent that never stopped reacting. They move toward warmth and burn what they touch.
  - **The Assay engines** are iron testing engines the Assay Office left running when it moved upstairs. They test anything they find, very hard. Their brass seals are worth money: the Office buys them back, and the Exchequer would rather find them first.
  - **The Kiln Engine** is the college's great reagent furnace, built to walk the Sink and burn the spill. Nobody told it to stop. It is clockwork and reagent, with no will of its own, and it runs the last instructions it was given. It breaks once. After that its contract no longer appears, and long routes end in the Kiln's yard, where two lesser engines still go about their business.
- **People down there.** Grubbers live below and dig for what Pellam left. They don't like company. Hobb & Daughters and the Ninth sometimes send crews down, and a rival crew that went first leaves open doors and bare shelves.
- **Old Saint Oda's shrines** stand in some cellars, older than the hall upstairs. A Chaplain can make use of one.

### The other sites and their people

- **Varrow.**
  - *The Lower Town.* Work in the city is guarded doors and angry crowds: hired thugs who are brave in a crowd, watchmen who shout for their friends first, and rioters. Hurting rioters costs the guild renown. People in the Lower Town "saw nothing". The short route ends at a cooper's yard.
  - *The Quays* are the river warehouses below the chain, walked at night: lighters tied up three deep, bonded stores whose brandy is waiting for its duty to be paid, and the tide coming up the river stairs. Lightermen think the quay is theirs. Footpads work the alleys behind. Somebody keeps mastiffs (yard dogs) in the yards, and a watch sergeant can be paid by anyone for an evening. The medium route ends at the bonded warehouse. The Quays are dark.
  - *The Rookeries* are tenement courts behind the tanneries, six storeys of rented rooms with a way over the roofs. They are poor, crowded and nobody's friend.
  - *Lew Rudd* rents out muscle by the day from a yard at the bottom of the Rookeries. Half the thugs in the Lower Town have worked for him. The Porters' Fraternity wants him out of business. His book (who hired whom) is the boss's find.
- **Kell Mines.**
  - *The upper workings* are galleries cut into the hill a century ago, propped with old timber, half of them flooded. Claim-jumpers work galleries that belong to somebody else and would rather fight than be written down. Pale cave crabs came up the flooded galleries. The finds are iron and coin. The short route ends at the old winding shaft.
  - *The Sump* is the lower galleries, flooded since the pumps gave out the year after the war (the Codex: "the deep galleries flooded the year after the war"). It is knee-deep, cold and dark. Pit ponies left below when the mine closed have gone half wild, and powder men (claim-jumpers with the blasting powder) throw it at people. The medium route ends at the drowned pump house. Silver ore starts here.
  - *The Trevick level* is the old silver gallery, cut by a mine captain called Trevick. The vein is still there.
  - *Gaffer Moyle*, the claim-jumpers' captain, has held the Trevick level for six years without paying anyone, with a keg of powder beside his chair. His powder hits the whole squad, like the Kiln's blast, but gives no Exposure. The lease-holders (Weighhouse merchants who lease the workings from the bank, which bought the Crown's warrants) want him off. His takings are the boss's find.
- **The Saltfens.**
  - *The reed paths* are plank paths through reeds taller than a man. Salt-cutters who stayed out on the pans too long have lost their manners to the fever, and black marsh hogs charge anything that moves in the reeds. Reagents grow here. The short route ends at the cutters' landing.
  - *The Pans* are the salt pans and brine flats: low walls, white crust and boiling huts. Soft crust over hot brine is a hazard, and the brine gets into cuts (Exposure). Pan salt is the find, and Saint Oda's uses it on wounds. The medium route ends at the old boiling house.
  - *The Withies* are willow beds cut by deep channels where the fens meet the river. Fen leeches come up out of the channels in a knot, and fowlers with punt guns shoot ducks for the Varrow markets and anyone else in their beds.
  - *The Dean* is the oldest marsh boar in the fens, the size of a cart. The cutters named it after the college's dean and say the likeness is fair. The cutters won't work the Withies while it is there. Its tusks are the boss's find; the college wants them, for reasons it won't put in writing.
- **Drover's Road.**
  - *The hill road* is the cattle road climbing into the hills, with stone walls, sheep and nobody coming to help. Road agents give a speech about tolls before they shoot. Deserters are soldiers of the Ninth who walked away with their mail and spears. The hill wolves are thin from a bad winter. The short route ends at the drovers' inn.
  - *Brannock Moor* is the high moor the road crosses: heather, standing water and cairns, with wind from every side. Reivers lift other people's herds and call it a family trade, and a moor bull that got away from a drove years ago runs it now. Spooked herds stampede. Drovers leave food at the cairns for the next drover. The medium route ends at the standing cairn.
  - *Skell Gap* is the pass at the top, between scree slopes, with the old Crown toll house at the narrowest point.
  - *Sergeant Abner Crewe* walked out of the Ninth with twenty men and the regiment's colours, and holds the toll house, charging the Crown's toll and keeping it. The Exchequer wants the toll house back. The colours are the boss's find, carried at Cassel Ford; somebody in the Ninth will pay a great deal for them, or shout a great deal. **The colours come home (Canon from v0.14.0).** The week a squad brings them back, if Captain Mayne has come to Varrow (`ninth_active`) and is alive, he is at the hall before the squad has unpacked (*The Ninth's Colours*, `ninth_colours` in `QUEUED_EVENTS`, queued by `triggerEvents`). Give them back to the Ninth (renown +2, Mayne +20, the Ninth's renown +3), sell them to him (+200 crowns, Mayne −5), or hang them in the hall (renown +3, Mayne −15, the Ninth grow more aggressive). Every answer takes the colours off the market. It fires once and sets no facts, and the market holds the colours back while he waits. He doesn't come if the Ninth is at open war with the guild, or if the colours have been sitting in the hall since before he reached Varrow; then they are only goods to sell. If he is dead (a guild war), the scene never fires and the colours are only goods to sell; the Ninth broke up without him, so nobody is left to want them.
- **Harrowmere.**
  - *The lake shore* is shingle, boathouses and cold water, with the old bridge standing out over the mere. Lake smugglers move cargo at night and don't want to be counted; mere pike lie in the shallows and take ankles. The short route ends at the boathouses.
  - *The bridge houses* are the houses built along the old bridge, empty since the middle span fell twenty years ago; the road still crosses the gap on a timber span, so the bridge still carries the wool road. Their floors are rotten over the water, and they are dark. Night boatmen row for the smugglers, and crayfish the size of cats live under the piers. The medium route ends at the timber span.
  - *The Holms* are the islands out on the mere: alder, reed, ruined chapels and the deepest water anyone has sounded. Bog oak, black and hard as iron, is the find; Anvil Row's furniture makers fight over it.
  - *The Bailiff* is the biggest pike in the mere, longer than a boat. The fishermen named it that because it takes its share of every catch. It strikes from the water first. The rings in its belly are the boss's find, and three families say they were their grandmother's.
- **Port Anselm.**
  - *The Wenmouth road* is the coast road through salt marsh and dunes, with a ford at every river mouth (Wenmouth among them). Road agents and deserters work it, because the Crown's silver goes this way to Ostrander's ships. The short route ends at the ford.
  - *The Burrows* are miles of dunes between the road and the sea, with marram grass and the ribs of old ships in the sand. Wreckers hang false lanterns where ships will mistake them for the harbour, and herring gulls have learned what a pack looks like and steal from it. Ambergris washes up here. The tide comes in fast across the slacks. The medium route ends at the wreck on the point.
  - *The Strand* is Port Anselm's waterfront: customs sheds, rope walks and Ostrander's warehouses. Ostrander's tidewaiters (customs men on the bank's books; the Codex has the harbour as "the bank's in all but name") guard the sheds and don't care whose papers the guild has. Killing them costs standing with Ostrander's (−1 each, at most −3 a trip), as killing the watch's sergeants on the Quays and in the Rookeries costs Heat (+2 each, at most +6). Only long routes reach the Strand, and Port Anselm is two weeks out, so only *Mags Tull's Lantern* (the Exchequer's) goes there: the bank's survey and *The Crown's Last Silver* are medium and stop in the Burrows.
  - *Mags Tull* runs the wreckers from a cove at the end of the Strand, where the Burrows come down to the sea. She steals from the squad as she fights. The Exchequer wants her lantern out before the next shipment of silver; her salvage from a dozen ships is the boss's find.
- **Curiosities beyond Old Pellam.** Wayside or street shrines to Saint Oda (a Chaplain can use them), strongboxes, wrecks in the Burrows and on the Strand (tools get into the hold for ambergris and coin), drovers' cairns on Drover's Road (a rest, and sometimes the food the last drover left for the next) and boathouses on the Quays, the Pans, the Withies and the Holms (coin and food, more often with a Scout).
- **What a contract's dangers bring.** A contract's tags bring their own enemies anywhere: hired thugs, sell-swords, the watch's guards, unlicensed hedge-wizards behind workings the college would never pass, trolls (big, grey, slow, and they heal unless burned), salamanders (lizards the length of a cart that live where the rock is warm) and rioters. Trolls and salamanders are animals. Place tags bring the dark, cold, mud and fever.

### Exposure, the Sink fever and Sink changes

- Exposure is what gets into the body down there: the Sink's runoff above all, and also the Buried Streets' damp, the fens' bad water, gas in Kell's workings, a hidden fever on a job, a seep's burn, a bad college still and the Kiln's blast. A wet mask of linen and charcoal, put on at the edge of the College Sink, halves what the wearer takes from there on. A job's fever (the Sickness tag) gives no Exposure if a Chaplain is in the squad or someone carries Fen Remedies.
- Given time, it changes the body: violet skin, pale eyes, a thick hide, iron bones, storm in the fingers, reagent in the blood. Twelve changes in three tiers, all gifts, some of them embarrassing. This is chemistry, not a curse.
- A rested body fights the change and runs the **Sink fever** first. The Lower Town calls it that wherever it's caught; out in the fens they call it the marsh fever. A worn-out body takes the change at once. A member who dies in the fever loses the change. A member still in the fever when the squad gets home spends a week in bed and gets up changed.
- **It doesn't pass from person to person.** A "fever on a job" means bad air or bad water on the way. In Varrow it is the Lower Town's water: its wells and cellars take some of Pellam's runoff, which is why the street knows the Sink fever by name. **The almshouse fever in Act I is the Sink fever** (the owner's decision). Brune says so in *Fever Salts*: "It's the water, it always is." The fen salts treat it, and the fever beds draw Exposure out.
- The Lower Town calls changed people **Sink-touched**.
- **Saint Oda's fever beds** draw Exposure out with vinegar, charcoal and water, for 30 crowns. The beds are the almshouse's, open to anyone who pays, so a guild can use them before it has met Sister Brune. The faction itself, as a power in the city, is known once you meet her (§3).

### How the dives tie into the factions and the cast

- **The Exchequer** wants the Assay seals found before the Office claims it never lost them, a survey of how wrong its two-hundred-year-old map of Pellam is, and the Kiln Engine stopped (the college asked the Crown, and the Crown asked you). Fenn's Crown still needs the silver carried to Port Anselm.
- **The Assay Office** left its engines running in the Sink, and buys their seals back. Plaice's office is upstairs from the problem it left.
- **The college** dumped its reagents in the Sink for a century and wants the Kiln's core back. Ostrander's holds a note on the college, so **Vorn** wants an account of the Sink: the bank likes to know what it owns.
- **Saint Oda's** (Brune) wants reagent salts from the Sink for the fever beds, rather than buying them from apothecaries who ask no questions. The fever beds treat Exposure.
- **The Mudlarks** (Pask) want eel oil, which waterproofs everything on the flats. Pellam's buried river channel is the oldest way round the toll chain. *(Draft: a hook for Act III's river.)*
- **The Weighhouse** buys Pellam silver by weight, "the only honest way to pay for anything". The posting does not name Coster, who can be gone after `coster_exposed`.
- **The Lower Town** (the Porters' Fraternity) wants fewer rats coming up through the Tallow Street cellars. Porters wait at the top of the rungs and count squads out and back in.
- **Hobb & Daughters** go into the same sites. A rival ahead on a job has thinned it. **Isbet Hobb** leads the Hobb crew in the door scene *Hobb's People Are Packing*. Rivals can also wait on the road home and take a third of what the squad carries, unless a Scout or Infiltrator who walked home spots them first.
- **The Ninth.** Deserters from the company work Drover's Road and the Wenmouth road.
- **Jory** meets squads coming home with the ledger open, and only ever makes remarks.
- **Patrons who must be met first.** Saint Oda's and the Mudlarks only post once the guild has met them (`met_oda`, `met_mudlarks`). A patron at −30 or worse stops posting. Vorn's survey needs `ostranders_open`.
- **Story contracts are story expeditions.** Each keeps its success, failure and expiry facts and succeeds when its goal is met. Their sites come from their regions: *Short Weight at Hesketh's* and *Ansel Fell at the Chain* in Varrow, *Salts for Saint Oda's* in the Saltfens, *The Exchequer's Last Tapestry* at Harrowmere, *The Aske Silver* on Drover's Road and *The Crown's Last Silver* on the Wenmouth road to Port Anselm. They are walked with a "see the job through" goal, at a length set by their threat (3 or less short, 4–6 medium, 7 or more long; long is cut to medium for the sites two weeks out, the Saltfens and Port Anselm). At today's threats they are all short, on the site's first zone, except *The Crown's Last Silver* (threat 4), which is medium: the Wenmouth road, then the Burrows. None of them meets a boss; a plain job on a long route walks all three zones and stops short of it. Bespoke story sites are still to come.
- **Envoys and Infiltrators.** An Envoy can talk people out of a fight, or buy them off with what the squad has found, and can stop one of the other side with a hard word. An Infiltrator opens locks and makes traps safe without tools, and gets the squad past sentries.

### In the acts

- **Act I (Canon).** Expeditions are the guild's work all through the act. The story beats are unchanged, and the story contracts are walked as expeditions.
- **Act II–IV (Draft).** Old Pellam runs under the whole Lower Town and under the river's old bed. If the bank blockades the river in Act III, the Buried Streets and the Mudlarks' channels are the other way through. The college's note, held by Ostrander's, is one of the notes that can change hands in Act IV.
- **Act I outcomes on expeditions (Canon from v0.13.2).** The seven outcomes that had no echo now have a Half a Year line each, and three of them reach the door: *The Crown's Wagons* (`silver_abandoned`), *An Exchequer Writ* (`fenn_ally`) and the cold Isbet of *Hobb's People Are Packing* (`isbet_betrayed`). *(Draft, on the backlog: site lines that read story facts, such as the Siege of Carrow seen through a Harrowmere window or an Aske spoon in a road agent's pack. They need the dive to see facts, which is an engine change.)*

## 6. Acts II–IV (Draft outline, not yet written)

- **Act II: Default (Year 2).** The Crown must choose: sell the realm piece by piece, tax the Lower Town into revolt, debase the coin, or default. The Council becomes the battlefield (decrees). The Fourteen split. *Braid point:* the Council vote on the Crown's choice. Act I outcomes shape who sits at the table: Fenn's trust, Vorn's attitude, the Lower Town's standing.
- **Act III: The War of Collection (Year 3).** Ostrander's blockades the river and hires foreign companies, maybe your rivals. *Braid point:* the river chain.
- **Act IV: Settlement (Year 4).** The bank is overextended across several realms. Its debt notes are sold off and traded, and whoever holds them holds Varrow. *Endings:* Free Realm · The Bought Crown · The Settlement · The House of Ledger & Blade · Ruin.
- **After the ending (Draft):** the ending reshapes the world, then generated multi-week storylines, player-chosen Ambitions, and legacy/retirement take over.

---

## 6b. How lore reaches the player (Canon)

- **No lectures.** Characters never explain what any Varrow resident would know. Common knowledge sits in the **Codex** from the start, as reference.
- **The Codex** (`src/engine/data/codex.ts`) unlocks entries from play: places your squads visit, enemies they face, people you meet, members' own pasts (a veteran in the roster tells you about Cassel Ford), and street talk. Every entry records how the guild learned it.
- **In the hall:** about one week in four, Jory Abbot remarks on the state of the guild (low funds, Heat, a death, a crowded hall). Lines are in `JORY` in `codex.ts` and never explain the world.
- **Expeditions** unlock Codex entries the way contracts always did: a squad home from a region unlocks that place, and the dangers it faced unlock their entries. Old Pellam, its zones, the other sites' deeper zones and bosses, and the dive's own monsters have no entries yet (a Pellam job counts as Varrow); they are described only in their own text (the site and zone cards, and the log). *(Open: Codex entries for Old Pellam.)*
- **Heard in Varrow:** one line of street talk a week in the week report, chosen to reflect the Debt clocks, decrees in force and story facts. Some lines unlock Codex entries.

## 7. Writing rules

### Sounding like people, not like a machine

Run `npm run style` to flag the habits below. It's advisory: a flag is a prompt to look again, not an automatic fail.

- **No neat morals.** Don't end a scene on a maxim ("The ledger is the only weapon that never dulls"). Stop when the useful part is over.
- **No narrated subtext.** Not "she says pleasantly, and means something else entirely". Write the line so the reader gets it, or leave it ambiguous.
- **People talk like people.** Short, plain, sometimes clumsy. They hedge, joke badly, mention practical things (four clerks and a dog), and don't speak in quotable epigrams.
- **Break the rhythm.** Avoid lists of exactly three and paired sentences of matching length. Vary: one long sentence, then two short ones, or a list of two or four.
- **Specific, slightly odd details over symbolic ones.** Not a porter spitting at the bank's carriage. Vorn spotting a spelling mistake on your notice board, and later fixing it with her own pen.
- **One simile per scene, at most,** and only if it's something that speaker would actually say.
- **No stock adverbs on dialogue** (pleasantly, thinly, dryly, kindly).
- **No dramatic pauses** ("a beat", "for a long moment").
- **Touchstone: *Darkest Dungeon*.** Borrow its grim, dry wit, its strong concrete verbs, and its sense that every win costs something. Keep our tone a notch lighter and more human, since this is a city of debts, not a crypt.
- **Complete sentences.** Don't lean on clipped fragments for punch ("Steel. Blood. Debt."). A short sentence now and then is fine, but it should still be a sentence. Get variety from mixing long and short sentences, not from chopping them up.
- **Characters have their own registers:** Vorn is clipped and practical, Fenn is tired and polite, Marta is chatty and folksy, Dagny is blunt and swears a little. Coster is fussy about exact amounts, Brune is brisk and practical, Pask never answers a question directly, Mayne is loud and friendly, Plaice reads clauses aloud, Lady Aske is charming and vague about money, and Jory only ever makes remarks.


- **Expedition log lines** are the narrator's, in the present tense, one or two sentences each. Members are named (`{a}`) or called "they", never "he" or "she". Give each situation at least two versions (some rare ones, such as crits and the Sink changes, still have only one), and a line that only makes sense in one place (a grate, a drain, the Sink, the fens) goes under that place's key (`key:<site>`, `key:town`, `key:overland`) so it never turns up somewhere else. Keep the number of versions of an existing situation the same when rewording it: the count feeds the dive's random draws, so changing it changes what happens in trips already in a save.
- **Monsters are animals, people or mechanisms.** Write them as such: hungry, frightened, paid, or following old instructions. Nothing is evil, cursed or ancient.
- **Plain, concrete language.** Name the thing: "a porter's hook", not "a weapon of the common folk".
- **Avoid tired fantasy vocabulary.** No "ward" as a city district; avoid "shadows gather", "ancient evil", "the realm trembles", chosen ones, prophecies. Names should sound like real places and people, not adjective-noun compounds (*Gilded X*, *Iron Y*).
- **Characters have their own motives.** Everyone wants something reasonable from their own point of view.
- **Questions should pay off.** Asking things in a conversation should earn information, Intel, Influence or facts that open options later, not just flavor.
- **Show the cost before the choice.** Every choice with a mechanical effect says so in its detail line.
- **Placeholders** are only filled from engine data (member names, items, tags). Never hand-write a name that the game might have killed or removed.

## 8. Adding or changing story: checklist

1. Register any new fact in `facts.ts` (and add to `EXCLUSIVE_FACTS` if needed).
2. Declare `npcs`, `after` and `window` on story beats.
3. Write the conversation; make sure every `next` points at a node.
4. Run `npm test`. It must pass, including the story checker.
5. Run `npm run story` and read the coverage report: timing, branch usage, endings.
6. Run `npm run playthroughs` and read at least one transcript end to end.
7. Update this file.
8. A Date that names a character lists them in `npcs`. Its met and missed lines must not contradict a beat that can fire in the same weeks.
