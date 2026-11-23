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

**Structure rule: braided, not tree-shaped.** Choices split the story, but each act rejoins at a small number of key beats. Those beats read the state of the world (facts, the Debt clocks, faction standing, character attitudes) and change their text and options to match. This keeps the number of branches manageable while choices still clearly matter.

---

## 2. Canon: the world

- **The Debt (Canon).** Twenty-two years ago King Aldric's army lost the war at **Cassel Ford**. The peace treaty obliges the realm to repay roughly **four million crowns** to **Ostrander's**, a foreign bank that financed the victors. It is paid in quarterly installments. If the Crown misses a payment, the treaty lets the bank **collect however it likes**: seize tolls, close the river, call in collateral.
- **What has been sold already (Canon):** the crown forests, the river tolls (now Ostrander's), half the royal plate, the Exchequer's tapestries.
- **Varrow (Canon):** the capital. A river port with a chain across the river where tolls are collected. The **Lower Town** lies below the walls: docks, porters, small trades. **Anvil Row** has the armorers, **Tallow Street** has the guild's hall, and the **Copper Kettle** is a tavern.
- **Places (Canon):** Drover's Road (cattle road, hills east), Harrowmere (lake town with an old bridge), Kell Mines (silver, partly flooded), the Saltfens (estuary marshes, reagents, fever), Port Anselm (coast; Ostrander's ships take the Crown's silver here), Wenmouth ford (on the road to Anselm).
- **Magic (Canon):** common, and practised like a science or trade. It is studied at **the college**, licensed by the **Assay Office**, sold by the dose (reagents), and keyed to elements: fire, frost, storm, radiant, shadow. It is powerful but never free. **There is no supernatural plot.** Magic is part of the economy, not a mystery.
- **Tone (Canon):** in between. Grounded, human-scale politics and money; morally grey choices; dry humor. Nobody is purely evil. The bank is doing what banks do.

## 3. Factions and their positions on the Debt (Canon)

| Faction | Position on the Debt |
|---|---|
| The Exchequer | Must keep paying without losing the realm; squeezes everyone to do it. |
| The Weighhouse | Merchants; split. Some act as Ostrander's local agents. They hold the guild's 800-crown loan. |
| Ostrander's | It is the Debt. Wants repayment, and the right to write the next treaty. |
| The Lower Town | Pays the taxes that service the debt; close to riot. |
| Saint Oda's *(Draft: not yet in game)* | Hospital church that runs the almshouses; preaches against usury. |
| The Fourteen *(Draft)* | Founding noble families whose castles are the bank's collateral. |
| The Mudlarks *(Draft)* | River underworld; smuggles around the bank's tolls. |

**Rival:** Hobb & Daughters, a family firm of debt collectors on retainer to the bank. *(Draft rivals: The Ninth, The Assay Office.)*

## 4. Cast

| Id | Character | Who they are | Voice | Canon so far |
|---|---|---|---|---|
| `vorn` | **Factor Maelis Vorn**, Ostrander's | The bank's chief factor in Varrow | Cool, precise, never raises her voice; honest in a way that's worse than lying | Offers the guild bank work. May let slip that the bank wants to draft the next treaty. Knows the silver convoy's route. |
| `fenn` | **Lord Treasurer Aubrey Fenn**, Exchequer | Runs the treasury | Tired, decent, dry; out of options and knows it | Commissions the guild to carry the Crown's silver. Can come to trust the guild. |
| `marta` | **Marta Hobb**, Hobb & Daughters | Matriarch of the firm, collecting for 30 years | Pleasant, grandmotherly, utterly ruthless; carries an umbrella as a walking stick | Offers to buy a quarter share of the guild's income. |
| `isbet` | **Isbet Hobb** | Marta's eldest daughter and heir | Silent; prices everything she looks at | Present at Marta's visit. *(Draft: becomes a rival in her own right.)* |
| `dagny` | **Dagny Fell**, Porters' Fraternity | A carrier with a porter's hook on her belt | Blunt, suspicious of charity, loyal once won | Meets the guild if it feeds the riot. Becomes a contact (Intel) or a friend. |

---

## 5. Act I: The First Collection (Canon)

Weeks are windows. A beat fires on a random week inside its window, or at the end of it, once its prerequisites have fired and its conditions are met.

| # | Beat | Window | After | Condition | Characters |
|---|---|---|---|---|---|
| 1 | `charter` A Charter and a Debt | 1 | — | — | (Exchequer clerk) |
| 2 | `ostrander_agent` A Visitor from Ostrander's | 2–3 | — | — | Vorn |
| 3 | `hobbs_arrive` Hobb & Daughters | 4–6 | 2 | — | Marta, Isbet |
| 4 | `bread_riot` Bread and Stones | 5–7 | — | Unrest ≥ 31 or week ≥ 7 | Dagny |
| 5 | `silver_summons` Summoned to the Exchequer | 7–9 | 2 | — | Fenn |
| 6 | `quarter_day` Quarter Day | 9–18 | 5 | The silver's fate is known | (varies) |
| 7 | `act1_slice_end` End of the Season | 12–20 | 6 | — | — |

### Branches and the facts they set

- **1. Charter.** Optional: ask about the debt (exposition). Then choose: arm the guild (`start_arms`), a free Arcanist, or +80 crowns.
- **2. Vorn.** Show her the door (bank −10, Lower Town +6, Vorn −15), or hear her out. You can ask about the people collected from (`vorn_q_people`, Lower Town +2), about the Hobbs (`vorn_q_hobbs`, +1 Intel), and what the bank wants (Guile check: `vorn_slip` on success, `vorn_q_want` on failure). Then the terms: work for the bank (`ostranders_open`, Vorn +15), case by case (`ostranders_open`, Vorn +5), or not today (Vorn −5). Not today can be undone later by courting Ostrander's from the Realm screen, which also sets `ostranders_open`.
- **3. Marta.** Her greeting changes if bank standing ≥ 8. Choices: refuse; or ask the terms, then sell the share (`hobbs_share`: 25% of contract pay goes to her, the Hobbs compete far less, Marta +15), refuse, or humiliate her (Guile check; Hobbs grow more aggressive either way).
- **4. Riot.** Feed them (8 supplies) or pay the bakers (35 crowns) → meet Dagny → her ears (`dagny_contact`: occasional Intel tips) or nothing (`dagny_friend`, Lower Town +4). Or take the Exchequer's purse → hold the line without blood (Endurance check) or break the crowd. Or bar the doors.
- **5. Fenn.** You can ask who knows the route (`fenn_route`: reveals a convoy danger when you accept), pass on what Vorn let slip if you learned it (`vorn_slip` → `fenn_stakes`: Fenn +15, Influence +2), ask the pay (`fenn_pay`), then haggle (Guile check: `silver_bonus` +60, or `fenn_haggled`). Then accept (`silver_accepted`, adds the story contract) or decline (`silver_declined`; Hobb & Daughters carry it, Fenn −15).
- **The Crown's Last Silver** (story contract, threat 4, Port Anselm). Success sets `silver_delivered` (Arrears −15). Failure sets `silver_lost` (Arrears +12; the Crown defaults). Letting it expire sets `silver_abandoned` and `silver_lost`.
- **6. Quarter Day: the act's braid point.** One of three versions:
  - *Delivered:* Fenn offers a purse, a writ of good conduct (Heat −20), or a seat at the Exchequer table (`fenn_ally`, Influence +4).
  - *Lost or abandoned:* the first default in 22 years. Vorn sends for you: serve the bank, swear to the Lower Town, or stay out.
  - *Declined:* the Hobbs delivered it, lighter than it left. You can spend 3 Intel to prove they skimmed.
- **7. End of the season.** Summarizes the silver outcome. In this prototype the scripted story stops here.

### Facts that can never be true together
`silver_delivered` ⟂ `silver_lost` · `silver_delivered` ⟂ `silver_declined` · `silver_accepted` ⟂ `silver_declined` · `silver_bonus` ⟂ `fenn_haggled` · `vorn_slip` ⟂ `vorn_q_want` · `dagny_contact` ⟂ `dagny_friend`

---

## 6. Acts II–IV (Draft outline, not yet written)

- **Act II: Default (Year 2).** The Crown must choose: sell the realm piece by piece, tax the Lower Town into revolt, debase the coin, or default. The Council becomes the battlefield (decrees). The Fourteen split. *Braid point:* the Council vote on the Crown's choice. Act I outcomes shape who sits at the table: Fenn's trust, Vorn's attitude, the Lower Town's standing.
- **Act III: The War of Collection (Year 3).** Ostrander's blockades the river and hires foreign companies, maybe your rivals. *Braid point:* the river chain.
- **Act IV: Settlement (Year 4).** The bank is overextended across several realms. Its debt notes are sold off and traded, and whoever holds them holds Varrow. *Endings:* Free Realm · The Bought Crown · The Settlement · The House of Ledger & Blade · Ruin.
- **After the ending (Draft):** the ending reshapes the world, then generated multi-week storylines, player-chosen Ambitions, and legacy/retirement take over.

---

## 7. Writing rules

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
