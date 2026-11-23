# Game Design Document — *Working title: "Ledger & Blade"*

> Status: **Draft v0.3 — for review.** Everything here is a proposal. Items marked **[Q]** are open questions for you.

---

## 1. Pitch

A generation ago the kingdom lost a ruinous war, and it is still paying for it. The Crown owes a crushing debt to **Ostrander's**, a foreign banking house, and the bank has stopped being patient. Its agents are buying offices, foreclosing on castles, and hiring swords to collect.

You are the **Guildmaster** (an abstract "you", never on the field) of a newly chartered, already-indebted guild in **Varrow**, the capital. Everyone needs muscle, information, and people willing to go where it's dangerous: the Crown, the bank, the nobles being foreclosed on, and the hungry streets. Your guild's ledger mirrors the realm's, and you will have to decide whose debts get paid.

Each week you read the dispatches, balance the ledger, send squads into the field, place spies, and court (or cross) the powers of the realm. Then you end the turn and watch everything you set in motion resolve at once.

**Tone:** in between. The politics and money are grounded, morally grey and human-scale. **Magic is common and works like a science or trade:** it is studied in colleges, practised by licensed professionals, sold by the dose, and built into everyday industry (forges, lamps, medicine, mills). It is powerful, but it is never free: it costs reagents, training, and time, and it can be regulated, taxed, and fought over like any other resource. There is no supernatural plot; magic is part of the economy, not a mystery.

**Feel:** a management sim where every decision touches several systems. The game never hides the math from a careful player. It rewards gathering intel, reading the numbers, and planning a few weeks ahead.

## 2. Design Pillars

1. **Every choice has at least two costs.** Gold vs. time, reputation with one faction vs. another, safety of a squad vs. profit, short-term cash vs. long-term debt.
2. **Transparent, but uncertain.** Odds are always shown. Uncertainty comes from *missing information* (which intel can reduce), not from hidden dice.
3. **Concurrency.** Missions take multiple weeks; politics, markets and rivals keep moving. You are always juggling several commitments.
4. **Macro feeds micro and back.** The forge you upgrade (macro) determines the runed blades your squad carries (micro); the mission that squad wins sways a faction (macro).
5. **A story you take part in, not one you watch.** The Debt crisis and the bank's collection progress with or without you; your guild can tip the scales.
6. **Phone-first.** Portrait, one-thumb, short sessions (a turn is 1–3 minutes), and deep sessions are just as rewarding.

## 3. Time & Turn Structure

- **1 turn = 1 week.** 4 weeks = 1 month, 3 months = 1 season, 4 seasons = 1 year.
- Main campaign spans **~4 in-game years (~200 turns)**, split into 4 Acts. After an ending → **Sandbox mode** continues with procedural events.

**Each turn:**
1. **Dispatches** (start of week): mission results, event cards, intel reports, market changes, rival moves, letters from factions. Some events demand a choice.
2. **Planning** (player acts freely, no time pressure):
   - accept/bid on contracts, form & equip squads, dispatch them
   - buy/sell at market, commission crafting, repair gear
   - recruit, train, rest, pay or dismiss members
   - assign spies, lobby factions, spend Influence on decrees
   - build/upgrade facilities, take/repay loans
3. **End Week** → simulation resolves everything simultaneously, in a fixed order (travel → mission phases → crafting/training → economy → AI factions & rivals → world/story clocks).

**Seasons matter:** winter raises supply costs and travel time in the north; harvest lowers food prices; festival season boosts Renown gains; campaign season (spring/summer) brings more military contracts.

## 4. Resources

| Resource | What it is | Main sources | Main sinks |
|---|---|---|---|
| **Crowns** (gold) | Money | Contracts, trade, investments, loot | Wages, upkeep, gear, bribes, debt interest |
| **Supplies** | Food, rations, fodder | Market, farms (facility), contracts | Squads in the field (per member per week), members at home |
| **Materials** | Iron, Timber, Leather, Cloth, **Reagents**, rare: **Starsilver**, **Embercore**, **Gravewax** | Market, mission loot, trade routes | Crafting, repairs, facility construction |
| **Influence** | Spendable political capital | Faction favor, successful political missions, gifts | Lobbying, decrees, calling in favors, legal defense |
| **Renown** | Public reputation (persistent score) | Heroic missions, festivals, story deeds | Lost by failures, scandals, desertion |
| **Intel** | Spendable information points + specific *reveals* | Spies, scouts, archive facility | Revealing mission modifiers, exposing rival plans, blackmail |
| **Heat** | Legal/criminal exposure (0–100) | Shady contracts, smuggling, assassinations | Decays slowly; bribes, Crown favor reduce it |

**Upkeep is relentless.** Every week: wages + facility upkeep + supplies consumed + loan interest. The ledger shows a **4-week projection** so you can see a cash crunch coming.

**Debt:** Loans from the Weighhouse, Saint Oda's (interest-free, but with obligations) or Ostrander's itself (cheap, with dangerous strings). Missing payments → penalties → seizure of assets → bankruptcy.

## 5. People (Human Resources)

Two layers, to match "soldiers, spies, etc. to execute strategies":

### 5.1 Named Members (micro: the heroes)
Individuals you recruit, gear and send on missions. Target roster: 6–20.

- **Attributes (1–10):** Might, Finesse, Wits, Resolve
- **Vitals:** Health (wounds), Fatigue, Morale, Loyalty
- **Profession** (class): Vanguard, Skirmisher, Marksman, Arcanist, Chaplain, Scout, Envoy, Infiltrator. Professions set growth and which skills they can learn.
- **Skills** (ranked 0–5) gained via XP and training: e.g. *Shieldwall, Ambush, Fieldcraft, Warding, Mending, Lockcraft, Silver Tongue, Lore*.
- **Traits** (2–3, some hidden until discovered): *Greedy, Brave, Drunkard, Veteran of the Lost War, Afraid of the Dark, Noble-born (the Fourteen like them)*.
- **Relationships:** pairs can become *Bonded* (bonus together) or *Rivals* (penalty together).
- **Wage** scales with level; **Loyalty** drops if unpaid, overworked, or if the guild acts against their values → desertion or betrayal (they may join a rival).
- **Permadeath.** Injuries can become permanent *scars* (stat loss or new traits).

### 5.2 Companies (macro: the rank and file)
Generic units counted by headcount, not individually managed:
- **Men-at-arms** — garrison contracts, escorts, guarding trade routes, defending the hall.
- **Spies** — placed in **Networks** inside factions/rivals; generate Intel weekly; enable covert actions. Can be discovered (Heat, faction penalty).
- **Laborers/Crafters** — speed construction and crafting.

Companies have *size, training level, morale, and wages*. Named members can be assigned as **Captains** to companies/networks for bonuses.

## 6. Contracts & Missions (the micro core)

### 6.1 Contracts
Posted on the **Contract Board** each week; each has:
- **Patron** (faction or private client) → standing changes on success/failure
- **Type:** Hunt, Escort, Expedition, Siege-work, Investigation, Diplomacy, Heist, Assassination, Relic Recovery
- **Region** & travel time (weeks); **Duration** on site
- **Threat** (1–10) and **Tags**: enemy & environment (see 6.3)
- **Reward:** Crowns, materials, Influence, favor, unique items
- **Deadline** & **exclusivity**: some contracts are **contested** — rival guilds bid. Higher Renown or lower bids win; or you can sabotage.
- **Moral/political weight:** e.g. "Escort grain to the rebels" pleases the Commons, angers the Crown, raises Heat.

### 6.2 Mission resolution: the "Phase Check" model
A mission is a series of **3–5 phases** (e.g. *Travel → Approach → Engagement → Objective → Extraction*). Each phase tests a **primary approach** that the player may choose between when options exist:

- **Assault** (Might + weapon power vs. enemy defense & resistances)
- **Stealth** (Finesse, armor weight penalty, light, Scout skill)
- **Guile** (Wits, Envoy/Infiltrator skills, disguises, bribes)
- **Endurance** (Resolve, supplies, environment gear)
- **Arcana** (Arcanist/Chaplain, elemental matchups, wards)

Each phase produces a **success chance** from:
`squad score for that approach` vs `phase difficulty` + modifiers (gear, elements, traits, synergy, fatigue, intel, weather, morale).

Phases chain: a strong Approach (e.g. good stealth) lowers the Engagement difficulty; a botched Travel arrives fatigued.

**Outcome tiers** (aggregated across phases): **Triumph / Success / Costly Success / Failure / Disaster**. These determine rewards, injuries, deaths, gear damage, loot, and faction effects. Results arrive as a readable **mission log** in the next Dispatches.

**Retreat orders:** set a squad's *Resolve threshold* before dispatch ("withdraw if any member is critically wounded" vs. "press on at all costs").

### 6.3 Tags, matchups & elements (rewards preparation)
- **Damage types:** Slash, Pierce, Blunt. Enemies resist/are weak to them (e.g. *Armored*: resists Slash, weak to Blunt; *Swarm*: weak to Blunt & Fire; *Spectral*: immune to physical without Holy/Starsilver).
- **Elements:** **Fire, Frost, Storm, Holy, Shadow** — applied via runes, oils, enchanted weapons, spells. Elemental matchups give large bonuses or penalties. Because magic is an industry, elemental gear and spell-work are bought, crafted and licensed like any other goods: enchanting needs an Arcanist on staff or a contract with a college, uses Reagents, and is regulated (some elements, such as Shadow, may need a licence or be banned by decree).
- **Environment tags:** *Cold, Swamp, Underground/Dark, Urban, Night, Plague, Consecrated Ground*. Each one penalizes the unprepared (e.g. *Cold* without furs → fatigue & Endurance penalty; *Dark* without lanterns/darkvision → Stealth+, Assault−).
- **Hidden tags:** Unscouted missions show some tags as **"?"**. Odds are then shown as a **range** (e.g. 45–80%). Spending Intel, sending a Scout ahead, or buying rumors narrows the range. **This is the main reward for careful players.**

### 6.4 Loadout (the gearing screen)
Per member: **Weapon, Off-hand/Shield, Armor (Light/Medium/Heavy), Trinket, 2 Consumable slots.**
Squad-level: **Supplies carried, Mounts/Wagon, Kit** (climbing gear, lanterns, furs, antidotes, siege tools).

- Armor weight trades protection vs. stealth/fatigue.
- Gear has **quality** (Crude → Masterwork → Relic) and **durability**; repairs cost materials and forge time.
- The planner shows a **live odds preview** per phase as you swap gear, with a breakdown ("+12% Fire vs. Swarm", "−8% Heavy armor in Swamp").

### 6.5 Training & recovery
- **Training Yard** assignments: raise skills/attributes over weeks (member unavailable meanwhile).
- **Infirmary:** heals wounds faster; Chaplains reduce death risk.
- **Rest** restores Fatigue and Morale; constant deployment → burnout.

## 7. The Guild Hall (facilities)

> **Implemented (v0.5):** Great Hall, Forge, Stillroom, Infirmary, Training Yard, Spymaster's Den, Stables. One project at a time; members assigned to *Build* speed it up; each level adds upkeep. Crafting turns mission materials into gear at the Forge and Stillroom (weekly capacity by level), and materials can be bought at the market. Warehouse, Counting House and Chapel are still to come.


Each facility has levels, a construction cost (Crowns + Materials + weeks), and weekly upkeep.

| Facility | Effect |
|---|---|
| Great Hall | Roster capacity, Renown from feasts |
| Barracks | Company capacity, morale |
| Forge | Crafting & repair tiers, rune-work at higher levels |
| Infirmary | Healing speed, reduces permanent scars |
| Training Yard | Training slots & speed |
| Archive | Lore, identifies relics, Intel bonus |
| Spymaster's Den | Network slots, counter-intelligence vs. rivals |
| Warehouse | Storage caps (materials/supplies can spoil without it) |
| Stables | Mounts → faster travel |
| Counting House | Better loan terms, trade routes, investments |

## 8. Economy & Market

- **Market prices** for supplies, materials and gear fluctuate by season, events, wars, and *your own trading* (selling 50 iron drops the price).
- **Trade routes:** invest to open routes between regions for weekly income. Routes need guarding (men-at-arms) or risk raids.
- **Investments:** shares in ventures (a mine, a shipping house) that pay off later or fail.
- **Ledger screen:** income/expense breakdown, last 12 weeks chart, 4-week projection, debts.

## 9. Factions & Politics

### 9.1 Factions
| Faction | Who they are | Stance on the Debt | Offers |
|---|---|---|---|
| **The Exchequer** | The Crown's treasury and officers, effectively the government | Desperate to keep paying without losing the realm; it will squeeze anyone to do it | Charter protection, Heat reduction, tax collection & military contracts |
| **The Weighhouse** | Merchants who control the city's official scales and measures | Split: some act as Ostrander's local agents and profit from it | Loans, trade routes, market discounts |
| **Saint Oda's** | Hospital church running the almshouses; preaches that usury is sin | Opposed to the bank on moral grounds | Healing, relics, sanctuary, interest-free "charitable" loans with obligations attached |
| **The Fourteen** | Founding noble families with hereditary seats | Their castles and lands are the collateral being foreclosed | Influence, land, prestige, private wars |
| **The Lower Town** | The city's laborers and small trades | They pay the taxes that service the debt and are close to riot | Recruits, Renown, cheap labor, strikes and riots |
| **The Mudlarks** | The river underworld | They profit from smuggling around the bank's tolls and embargoes | Smuggling, information, dirty work, and Heat |
| **Ostrander's** | The foreign bank itself, with offices in Varrow and agents everywhere | It *is* the debt | Cheap loans with strings, lucrative collection contracts, leverage over every other faction |

- **Standing (−100 to +100)** per faction. Thresholds unlock contracts, prices and perks, or bring hostility (refused service, ambushes, legal attacks).
- **Factions have relationships with each other**, and most of them pivot on the Debt. Taking a collection contract from Ostrander's against one of the Fourteen pleases the bank, angers the nobles, and may please the Lower Town, who like seeing nobles squeezed.

### 9.2 The Council of Varrow
Every **season** the Council votes on **Decrees** (e.g. *Debt Levy on Grain, Debasement of the Crown Penny, Sale of Crown Forests, Licensing of Private Collectors, Usury Ban, Martial Law on the Docks*).
- Factions and rivals lobby. You can spend **Influence**, call in **favors**, or use **blackmail** (from Intel) to shift votes.
- Decrees change the rules of the economy and missions, for the season or permanently.

### 9.3 The Debt (the political spine)
The realm's position is tracked by **world clocks** that advance every week and react to what you and others do:
- **Arrears**: how far behind the Crown is on its payments.
- **Leverage**: how much of the realm Ostrander's owns (offices, castles, tolls, mortgages).
- **Unrest**: how close the Lower Town is to open revolt.
- **Coin Trust**: whether people still trust the Crown Penny. Debasement makes it fall, which raises market prices.

The guild can play every side: collect for the bank, smuggle for the Mudlarks, guard Exchequer silver convoys, or hide the Fourteen's treasures from foreclosure. Different sides pay best at different times.

## 10. Rival Guilds

Three AI rivals with distinct personalities and goals, each running a simplified version of your own sim (gold, renown, roster strength, faction standing):

- **The Ninth**: a disbanded royal company gone private, made up of veterans of the lost war. They are bitter, proud and dangerous. They bid low on combat work, poach your veterans, and want revenge on the bank, even if it costs the realm.
- **Hobb & Daughters**: a family firm of debt collectors on retainer to Ostrander's. They are rich, ruthless and well-connected, and they win contracts with money and blackmail.
- **The Assay Office**: the city's reagent-testers and coin-assayers, gone private. They are scholarly and secretive, and they outbid you on relics and lore. They certify every reagent and enchantment sold in Varrow, and they know more about the Crown Penny's true silver content than anyone should.

Rival interactions: contract bidding wars, poaching members, sabotage (countered via your Spymaster), smear campaigns, temporary alliances, and mergers or hostile takeovers in the late game. Rivals can rise, fall, or be destroyed, by you or by events. Rivals can go into debt too, and **you can buy their debt**.

## 11. The Epic Story — *The Note Comes Due*

| Act | Span | Arc | Key decisions |
|---|---|---|---|
| **I: The First Collection** | Year 1 | Ostrander's collectors arrive in force. The Crown misses a payment and the first foreclosures begin. Your guild is chartered into the chaos, already owing money, and everyone wants to hire you. | Who funds your guild? Your first collection job, or your first refusal. The first clash with Hobb & Daughters. |
| **II: Default** | Year 2 | The Crown must choose: sell the realm piece by piece, tax the Lower Town into revolt, debase the coin, or default. The Council becomes a battlefield. The Fourteen split between selling out and resisting. | Which path you push the Council toward, and which faction you're willing to sacrifice. |
| **III: The War of Collection** | Year 3 | Ostrander's stops negotiating. It hires foreign companies (and maybe your rivals), blockades the river and seizes the tolls. Trade collapses and prices spike. Your guild becomes a blockade-runner, a defender, or the bank's own blade. | Whose side you fight on, and what you'll risk your people for. |
| **IV: Settlement** | Year 4 | The turn: Ostrander's is overextended across half a dozen realms, and its own investors start to panic. The realm's debt notes are now being **sold off and traded**, and whoever holds them holds Varrow: Hobb & Daughters, the Weighhouse, the Fourteen, or your guild. The realm's fate is settled by who ends up holding the paper. | The final terms; endings. |

**Story missions** are large, multi-phase operations that may need several squads plus companies at once (escorting the Crown's last silver to the coast, a heist on Ostrander's vault, holding the river chain during the blockade).

**Endings** (several), determined by the world clocks, which factions hold power, and your guild's status:
- **Free Realm**: the debt is broken and the realm survives the consequences.
- **The Bought Crown**: Ostrander's owns the realm in all but name, and possibly your guild with it.
- **The Settlement**: a negotiated restructuring in which everyone loses something.
- **The House of Ledger & Blade**: your guild becomes the realm's lender itself.
- **Ruin**: the realm or your guild collapses.

An **epilogue screen** summarizes the fate of members, factions and rivals.

## 12. Events & Story Delivery

**Structure: a scripted spine with variable timing, plus procedural texture.**
- **Story beats** are hand-written and happen for everyone, but each fires inside a *window* of weeks (e.g. weeks 4–6) with a per-week chance, and many depend on world state (e.g. the bread riot needs Unrest to be high enough). Text and options vary with earlier choices and flags (Hobb's greeting changes if you've been working for the bank, and Quarter Day plays out three different ways).
- **Conversations:** story events are branching dialogues. Asking questions costs nothing but can earn Intel, Influence or flags that open options later (what Vorn lets slip can be used with Fenn). Some questions are skill checks made by your best member at home.
- **Random events** (about 40% of weeks) draw from a weighted pool with conditions and cooldowns. Many are **member-focused**: a named member wants a raise, gets a letter from home, can't sleep after a death, or brings back a tip. These build attachment and pressure the roster.
- **Every new game is different:** recruits, contracts, hidden tags, market stock, rival behavior, event timing and the random event draw are all seeded per game.

**Decisions in the field:** squads on multi-week trips meet things on the road (a washed-out bridge, riders shadowing them, a deserter selling information, Hobb's people racing them to the same job, bad weather, fresh tracks). Each is a choice with visible costs and checks made by the squad's own members, and it changes the mission: an extra tag, an easier or harder first phase, a delay, a bonus, revealed tags. On arrival, if anything is still unknown or the odds look poor, a **field report** shows what the squad really faces, with the option to switch to a better plan or withdraw before anyone gets hurt. What happened on the road goes into the journal.

**Mission journals:** each mission produces an expedition journal: the road out, every phase (scene-setting from the tags, who led and how, which gear was right or wrong for the job, which preparations paid off), and the road home. Members keep a **service record** of their missions and deeds.

## 13. Fail States (Hard but fair)

- **Bankruptcy:** debt exceeds the limit and you miss 3 payments → assets seized → game over (or a "fallen guild" restart in Sandbox).
- **Charter revoked:** Crown standing below −60 *or* Heat at 100 for 2 weeks → you have one season to fix it (go underground, appeal, or bribe) before it's game over.
- **Guild collapse:** no members left and no means to recruit.
- **The realm falls:** a world clock maxes out (e.g. Leverage 100 = the bank owns Varrow, Unrest 100 = revolution), which forces a bad ending unless your guild is positioned to survive it.

**Saves:** an autosave every turn + 3 manual slots. No undo within a turn after End Week.

## 14. UI & UX (portrait, phone)

**Persistent top bar:** Week/Season · Crowns (with weekly ± delta) · Supplies · Influence · Renown · Heat. Tap any of them for a breakdown.

**Bottom tab bar (5 tabs):**
1. **Hall** — Dispatches feed, alerts ("Squad B arrives in 1 week", "Loan payment due"), facilities.
2. **Contracts** — board, active missions with timelines, squad planner.
3. **Roster** — members, companies, spy networks; training/rest assignments.
4. **Armory** — inventory, market, forge/crafting queue.
5. **Realm** — factions, council & decrees, rivals, region map, story journal.

**End Week** is a large floating button, which warns you if something has gone unused ("2 idle members, 1 unanswered event").

**Squad Planner** (key screen): member cards across the top → slot editor in the middle → **phase odds bar** at the bottom that updates live, with tap-to-see breakdowns.

**Mission presentation (visual, but not tactics):** no hex map and no unit-by-unit movement. Each active mission is shown as an **expedition track**, a stylized route drawn like a ledger margin or pilgrim's map strip. The phases are stops along it and the squad's tokens move along it week by week. When a phase resolves, it plays as a short animated **phase card**: the odds bar fills, the result is stamped (*Triumph*, *Costly*, *Failure*…), and wound or loot icons drop in, followed by a written log line. It is quick to watch, skippable, and always backed by the full text log. Art can grow over time (portraits, location vignettes) without changing the system. *(Agreed for now; revisit once playable.)*

Style: parchment and ink with heraldic color accents. Text-forward, iconography for tags, minimal art at first (heraldic sigils and icon glyphs). Supports dark mode.

## 15. Technical Architecture

- **Stack:** TypeScript, **Vite**, **React**, a lightweight state store (Zustand), **PWA** (installable, offline), hosted on **GitHub Pages** via GitHub Actions.
- **Engine/UI separation:** `src/engine/` is pure, deterministic TypeScript with no React: `advanceWeek(state, rng) → { state, dispatches }`. The UI only reads state and dispatches player actions. This makes the simulation fully unit-testable and allows balance simulations (run 1,000 games headless).
- **Seeded RNG** saved with the game state → reproducible bugs, fair saves (no save-scumming a single roll).
- **Data-driven content:** items, enemies, contracts, events and story beats live in typed data files (`src/data/`), so new content doesn't require engine changes.
- **Saves:** IndexedDB/localStorage with versioned save migrations; export/import a save as text.
- **Tests:** Vitest for the engine; Playwright smoke test on a phone viewport.
- **App-store path:** built to be wrapped with **Capacitor** for iOS/Android later. That means no browser-only dependencies in the engine, safe-area-aware layout, touch-first controls, offline-first assets, and saves behind a storage interface that can swap to native storage.

## 16. Milestones

| # | Milestone | Contents |
|---|---|---|
| **M0** | Design doc (this) | Review & agree |
| **M1** | **Vertical slice** | Project setup + deploy, turn loop, ledger & upkeep, roster (named members), contract board, squad planner with gear/tags/elements, phase-check resolution with odds ranges, Intel reveals, market (buy/sell), 3 factions with standing, 1 rival bidding on contracts, save/load, first ~8 weeks of Act I (The First Collection) |
| **M2** | Macro depth | Facilities, crafting & repairs, companies & spy networks, loans, events system, all 6 factions, Council & decrees, 3 rivals |
| **M3** | The story | Acts I–IV, story missions, Debt clocks, endings & epilogue, Sandbox mode |
| **M4** | Balance & polish | Headless balance simulations, tutorialization, accessibility, sound, art pass, difficulty tuning |

## 17. Decisions & Open Questions

**Decided:** tone is in between · working names *Ledger & Blade* and *Varrow* · the Guildmaster is an abstract "you" · campaign of ~200 turns · keep the app-store option open (Capacitor) · premise A, *The Note Comes Due* · member classes are called **Professions** · Commons faction is **The Lower Town** · the bank is **Ostrander's** · magic is common and works like a science/trade; no supernatural twist · expedition-track missions for now.

**Open [Q]:**
1. Home city/country of Ostrander's.
2. Revisit the expedition-track mission presentation once it's playable.
