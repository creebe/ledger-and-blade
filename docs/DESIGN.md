# Game Design Document — *Working title: "Ledger & Blade"*

> Status: **Draft v0.1 — for review.** Everything here is a proposal. Items marked **[Q]** are open questions for you.

---

## 1. Pitch

You are the newly-chartered **Guildmaster** of a struggling mercenary-and-everything-else guild in the city of **Varrow**, capital of a kingdom whose old king has just died without a clear heir. Factions circle the throne, rival guilds circle your contracts, and something old is waking in the northern marches.

Each week you read the reports, balance the ledger, send squads into the field, place spies, court (or cross) the powers of the realm — then end the turn and watch everything you set in motion resolve at once.

**Feel:** a management sim where every decision touches several systems. The game never hides the math from a careful player — it rewards gathering intel, reading the numbers, and planning a few weeks ahead.

## 2. Design Pillars

1. **Every choice has at least two costs.** Gold vs. time, reputation with one faction vs. another, safety of a squad vs. profit, short-term cash vs. long-term debt.
2. **Transparent, but uncertain.** Odds are always shown. Uncertainty comes from *missing information* (which intel can reduce), not from hidden dice.
3. **Concurrency.** Missions take multiple weeks; politics, markets and rivals keep moving. You are always juggling several commitments.
4. **Macro feeds micro and back.** The forge you upgrade (macro) determines the runed blades your squad carries (micro); the mission that squad wins sways a faction (macro).
5. **A story you take part in, not one you watch.** The succession crisis and the northern threat progress with or without you; your guild can tip the scales.
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

**Debt:** Loans from the Merchant League or the Temple's Bank (different terms and political strings). Missing payments → penalties → seizure of assets → bankruptcy.

## 5. People (Human Resources)

Two layers, to match "soldiers, spies, etc. to execute strategies":

### 5.1 Named Members (micro: the heroes)
Individuals you recruit, gear and send on missions. Target roster: 6–20.

- **Attributes (1–10):** Might, Finesse, Wits, Resolve
- **Vitals:** Health (wounds), Fatigue, Morale, Loyalty
- **Calling** (class): Vanguard, Skirmisher, Marksman, Arcanist, Chaplain, Scout, Envoy, Infiltrator. Callings set growth and which skills they can learn.
- **Skills** (ranked 0–5) gained via XP and training: e.g. *Shieldwall, Ambush, Fieldcraft, Warding, Mending, Lockcraft, Silver Tongue, Lore*.
- **Traits** (2–3, some hidden until discovered): *Greedy, Brave, Drunkard, Veteran of the Marches, Afraid of the Dark, Noble-born (Old Houses like them)*.
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
- **Elements:** **Fire, Frost, Storm, Holy, Shadow** — applied via runes, oils, enchanted weapons, spells. Elemental matchups give large bonuses or penalties.
- **Environment tags:** *Cold, Swamp, Underground/Dark, Urban, Night, Plague, Sacred Ground*. Each one penalizes the unprepared (e.g. *Cold* without furs → fatigue & Endurance penalty; *Dark* without lanterns/darkvision → Stealth+, Assault−).
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

### 9.1 Factions of Varrow
| Faction | Wants | Offers |
|---|---|---|
| **The Crown Regency** (acting regent, the royal guard) | Order, taxes, a smooth succession | Charter protection, Heat reduction, military contracts |
| **The Gilded Concord** (merchant league) | Profit, open roads, low tariffs | Loans, trade routes, market discounts |
| **The Temple of the Dawn** | Faith, suppression of dark magic | Healing, Holy relics, loans, sanctuary |
| **The Old Houses** (noble families) | Ancient privilege, a noble on the throne | Influence, land, prestige |
| **The Commons** (guilds of laborers, city wards) | Bread, fair wages, voice | Recruits, Renown, cheap labor, riots |
| **The Lantern Court** (underworld) | Shadows, coin, freedom from law | Smuggling, information, assassinations — and Heat |

- **Standing (−100 → +100)** per faction: thresholds unlock contracts, prices, perks, or hostility (refused service, ambushes, legal attacks).
- **Factions have relationships with each other.** Helping the Temple against the Lantern Court changes both your standings. Gaining standing with one usually costs something with another.

### 9.2 The Council of Varrow
Every **season** the Council votes on **Decrees** (e.g. *Grain Tariff, Conscription Levy, Ban on Necromantic Reagents, Guild Licensing Tax, Martial Law in the Lower Wards*).
- Factions and rivals lobby. You can spend **Influence**, call in **favors**, or use **blackmail** (from Intel) to shift votes.
- Decrees change the rules of the economy and missions for the season or permanently.

### 9.3 Succession
Several **claimants** to the throne (each backed by different factions). Your guild can openly back one, secretly work for several, or stay neutral. Who takes the throne at the end of Act II reshapes the rest of the game.

## 10. Rival Guilds

Three AI rivals with distinct personalities and goals, each running a simplified version of your own sim (gold, renown, roster strength, faction standing):

- **The Iron Pact** — an aggressive, militarized mercenary company. Bids low on combat work, poaches your veterans.
- **House Vellacourt's Company** — wealthy and politically connected; buys influence, wins contracts with money.
- **The Grey Lanterns** — secretive arcane order; outbids you on relics and lore, and may have ties to the northern threat.

Rival interactions: contract bidding wars, poaching members, sabotage (and counter-sabotage via your Spymaster), smear campaigns, temporary alliances, mergers or hostile takeovers late game. Rivals can rise, fall, or be destroyed — by you or by events.

## 11. The Epic Story

**Premise:** King Aldric III is dead. In the north, the **Hollowing** spreads — a blight of grey ash where the dead do not stay still. Old scholars whisper about a sealed god beneath the Marches.

| Act | Span | Arc | Key decisions |
|---|---|---|---|
| **I — The Charter** | Year 1 | Establish the guild, survive debt, first factional entanglements. First signs of the Hollowing. | Who funds you? First rival confrontation. |
| **II — The Crown Contest** | Year 2 | Succession war in all but name. Council battles, assassinations, rigged contracts. | Which claimant you back (or betray). |
| **III — The Grey Tide** | Year 3 | The Hollowing breaks out. The realm must unite or fall. Expeditions into the Marches. | Alliances, sacrifices, what to do with the relics you've gathered. |
| **IV — Reckoning** | Year 4 | Final campaign against the source; the realm's fate is set. | Final stand; endings. |

- **Story events** are triggered by **world clocks** (Hollowing spread, succession tension, rival power), which advance each turn *and* respond to your actions. Ignoring the north lets the Hollowing advance faster.
- **Story missions** are large, multi-phase operations that may need several squads plus companies at once.
- **Endings** (several), determined by: who rules, Hollowing contained or not, guild's status (dominant / respected / disbanded / outlawed), and key relationships. An **epilogue screen** summarizes the fate of members, factions and rivals.

## 12. Events

Weekly **event cards** (procedural + story): a member caught brawling, a plague outbreak, a noble's daughter wants to join, a rival's agent offers a deal, a caravan disappears. Most offer 2–4 choices with visible costs, and some outcomes depend on stats/skills/traits (with shown odds).

## 13. Fail States (Hard but fair)

- **Bankruptcy:** debt exceeds the limit and you miss 3 payments → assets seized → game over (or a "fallen guild" restart in Sandbox).
- **Charter revoked:** Crown standing below −60 *or* Heat at 100 for 2 weeks → you have one season to fix it (go underground, appeal, or bribe) before it's game over.
- **Guild collapse:** no members left and no means to recruit.
- **The Hollowing wins:** the story clock completes → bad ending.

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

Style: parchment and ink with heraldic color accents. Text-forward, iconography for tags, minimal art at first (heraldic sigils and icon glyphs). Supports dark mode.

## 15. Technical Architecture

- **Stack:** TypeScript, **Vite**, **React**, a lightweight state store (Zustand), **PWA** (installable, offline), hosted on **GitHub Pages** via GitHub Actions.
- **Engine/UI separation:** `src/engine/` is pure, deterministic TypeScript with no React: `advanceWeek(state, rng) → { state, dispatches }`. The UI only reads state and dispatches player actions. This makes the simulation fully unit-testable and allows balance simulations (run 1,000 games headless).
- **Seeded RNG** saved with the game state → reproducible bugs, fair saves (no save-scumming a single roll).
- **Data-driven content:** items, enemies, contracts, events and story beats live in typed data files (`src/data/`), so new content doesn't require engine changes.
- **Saves:** IndexedDB/localStorage with versioned save migrations; export/import a save as text.
- **Tests:** Vitest for the engine; Playwright smoke test on a phone viewport.

## 16. Milestones

| # | Milestone | Contents |
|---|---|---|
| **M0** | Design doc (this) | Review & agree |
| **M1** | **Vertical slice** | Project setup + deploy, turn loop, ledger & upkeep, roster (named members), contract board, squad planner with gear/tags/elements, phase-check resolution with odds ranges, Intel reveals, market (buy/sell), 3 factions with standing, 1 rival bidding on contracts, save/load, first ~8 weeks of Act I story |
| **M2** | Macro depth | Facilities, crafting & repairs, companies & spy networks, loans, events system, all 6 factions, Council & decrees, 3 rivals |
| **M3** | The story | Acts I–IV, story missions, succession, world clocks, endings & epilogue, Sandbox mode |
| **M4** | Balance & polish | Headless balance simulations, tutorialization, accessibility, sound, art pass, difficulty tuning |

## 17. Open Questions **[Q]**

1. **Tone:** grim and grounded (low magic, political, morally grey), heroic high fantasy, or in between (grounded politics plus rare, dangerous magic, which is what I've drafted)?
2. **Name & setting:** keep "Ledger & Blade" / Varrow / the Hollowing as working names, or do you have your own?
3. **Mission presentation:** is a written mission log with phase results enough, or do you eventually want a more visual or tactical layer (still turn-based, no real-time)?
4. **Player character:** is the Guildmaster an abstract "you", or a character with their own stats/background who can (riskily) join missions?
5. **Scale:** does ~200 turns (~4 years) for the campaign feel right, or do you want shorter runs (~1–2 years) with more replayability?
6. **Monetization/distribution:** purely a personal project, or something you may want on app stores later? (This affects whether we plan for native wrapping.)
