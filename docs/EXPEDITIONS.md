# Expeditions (v0.13.0)

Expeditions are how the guild does its work. The trial on `claude/expeditions` (PR #7) proved the dive; v0.13.0 brings it into the full game, with every classic system kept. The plan the owner approved is `docs/PROPOSAL-EXPEDITIONS-IN-MAIN.md`, and the engine API the UI builds on is `docs/EXPEDITIONS-API.md`.

The owner's brief: "make our game feel a lot more like Darkest Dungeon. More about actual dungeon dives. Monsters. Outfitting a squad and managing THEM as a resource." The expedition plays itself; the player's skill goes into the preparation. Darkest Dungeon is a touchstone for feel, not a template: no stress or afflictions, no torch meter, no hamlet, none of its class names.

## 0. In the full game

- **Contracts are postings.** Each one names a site, a route length (short, medium or long) and a goal: walk the route, reach a zone, bring back goods or kill something. The patron, pay, standing, Heat, story facts and rival operations work as before.
- **Sites.** Old Pellam is complete (three zones and the Kiln Engine). Varrow, Kell Mines, the Saltfens, Drover's Road, Harrowmere and Port Anselm have one zone each until their own work fills them out. Distant sites add road weeks there and back.
- **A contract's dangers come along.** Hidden tags are what is rumoured to be there. Enemy tags bring their own fights (thugs, sell-swords, guards, hedge-wizards, trolls, salamanders, rioters); place tags bring the dark, cold, mud or fever. Lanterns, fur cloaks, remedies and climbing kits cancel them as before.
- **All eight Professions fight.** The Envoy talks people out of fights or buys them off; the Infiltrator opens locks and traps without tools and gets the squad past sentries.
- **Classic gear is dive gear.** Weapons, armor and trinkets from the market and the Workshop all work down there; oils and salts key a member's blows for the trip, and a healing draught in their kit saves them once.
- **Several squads at once:** two, or three with a Muster room. Each trip is sealed when the squad leaves the yard at End Week, simulated in full, and revealed one week at a time. The week report has a Down below row for each squad.
- **Door scenes.** The classic road scenes fire as a squad sets out for a distant site. What they change (a harder road, a guide, a bonus, a delay) is folded in before the trip is sealed.
- **At home.** Health, fatigue, morale and loyalty work as before. Members also carry Exposure, Sink changes, scars and habits. The Weighhouse waits for a squad that's away if the money at home is short, after selling the guild's goods. Rivals can wait on the road home and take a third of what the squad carries.
- **Pay.** A contract pays its reward when its goal is met: Triumph (the route done, nobody down), Success, Costly Success (somebody died). Loot and loose coin come home either way unless the squad is lost.

The sections below are the trial's design, still accurate for the dive itself.

## 1. The loop

1. **At the guild** (Tallow Street): heal, rest, recruit, buy gear and supplies, sell what came up, pay the Weighhouse, pick a sponsor's commission.
2. **Prepare** an expedition into **Old Pellam**: choose its length, four members and their ranks, their gear, the pack, and the standing orders.
3. **The expedition plays itself.** The log is revealed line by line, with the squad strip showing health and fatigue as it goes. Tap to speed it up, or skip to the end.
4. **Back at the guild**: the dead are buried, the wounded heal, scars and habits are written into the roster, loot is sold, renown is earned. Time moves on by the expedition's length in weeks; members who stayed home rest.

## 2. The site: Old Pellam

The first town on the river, under Varrow's Lower Town. The engines are clockwork and reagent mechanisms, still running the last instructions they were given: no will of their own. When the river moved two hundred years ago, Pellam silted up and Varrow was built on top of it. Its cellars and streets are still down there, and so is the drain where the college poured its spent reagents for a century. Magic is a trade and a science: nothing down there is cursed, but a great deal of it has been soaking in alchemical runoff for a long time.

| Depth | Zone | What it's like |
|---|---|---|
| 1 | **The Culverts** | Brick drains and cellars. Rats, scavengers, grates with a little daylight. |
| 2 | **The Buried Streets** | Pellam's old streets, roofed over by Varrow. Houses full of silt, spiders, hogs gone pale, crabs. No light. |
| 3 | **The College Sink** | Where the reagents went. Seeps, the Assay Office's abandoned test engines, and at the bottom the **Kiln Engine**. |

**Lengths.** *Short* (the Culverts, about 5 rooms, 1 week), *medium* (down to the Buried Streets, about 9 rooms with one camp, 2 weeks), *long* (to the bottom of the Sink, about 14 rooms, two camps and the Kiln Engine, 3 weeks).

## 3. Preparation (the game)

- **Squad and ranks.** Four members, ranks 1 (front) to 4 (back). Melee reaches from ranks 1–2; bows and spells work from the back; most enemies hit the front two. A member who goes down leaves the line, and everyone behind steps forward, which is how an Arcanist ends up in front of a hog.
- **Gear.** Weapon (damage type, power, element), armor (protection against dodge and stealth), one trinket.
- **The pack: 12 slots.** Food (3 a slot), bandages (3), lamp oil (4), tools (2), wet masks (2), reagents (3), draughts (1). What isn't used comes home, unless nobody does.
  - *Food:* a meal every few rooms and at every camp. A missed meal adds fatigue, and a hungry camp barely heals.
  - *Bandages:* heal between rooms. A Chaplain gets twice as much out of each.
  - *Lamp oil:* the Buried Streets and the Sink are dark. Without oil the squad is ambushed more, misses traps, aims worse and tires faster. Tallow moths eat it.
  - *Tools:* disarm traps, force strongboxes, clear rubble. Without them, a trap goes off or the squad goes the long way round.
  - *Wet masks:* linen and charcoal. One protects one member in the College Sink, halving their Exposure.
  - *Reagents:* doses for the Arcanist's spells and the Chaplain's censer. Without them, the Arcanist casts from their own blood.
  - *Draughts:* pulls a member who goes down straight back up, and skips the roll for their life.
- **Standing orders** (five, each a choice of two or three):
  - *Turn back:* cautious (anyone badly hurt or worn out, or a death) / steady (two badly hurt or worn out, or a death) / stubborn (only when the squad is falling apart).
  - *Heal first:* worst hurt / the front rank / the back rank.
  - *Wandering monsters:* fight them (loot, experience, renown, risk) / avoid them (a stealth check; fail it and they ambush you).
  - *Camp:* only at camp sites / also whenever the squad is hurt (costs food, risks a visit).
  - *Consumables:* freely / sparingly / hoard for emergencies.

Every choice shows in the log: the line where the trap goes off because nobody packed tools, the meal that didn't happen, the Arcanist who burned her own blood.

## 4. The dive generator

Each expedition is built from a seed (the guild's seed and the expedition number) and the plan, so **the same seed and the same preparation always give the same log**. A route is a list of rooms by zone. Each room is drawn from that zone's weighted table: passages, fights, traps, finds, curiosities (an Assay strongbox, a cellar shrine), and camp sites at fixed points. Between rooms there's a chance of a wandering monster, higher in the dark and deeper down. Danger grows with depth: enemies are tougher, there are more of them, and loot is richer.

## 5. Combat

Rounds, ordered by speed. Each member's Profession has its own skills and picks one by a simple rule that reads the standing orders:

| Profession | Rank | Skills |
|---|---|---|
| Vanguard | 1–2 | Covers a hurt ally, shield bash (stuns), cut |
| Skirmisher | 1–3 | Two quick cuts, hamstring (bleeds) |
| Marksman | 2–4 | Aimed shot (reaches the back, crits), pinning shot |
| Arcanist | 3–4 | Bolt or burst in their focus's element, costs reagents (or blood) |
| Chaplain | any | Dresses wounds, gives the most tired a second wind, censer (radiant) |
| Scout | any | Spots traps and ambushes, finds caches, knife in the gap |

Hits roll accuracy against dodge, and damage against armor. Weaknesses and resistances use the existing elements (fire, frost, storm, radiant, shadow) and damage types (slash, pierce, blunt). At 0 HP a member **goes down**: they're out of the fight and roll for their life (worse from a heavy blow or in the dark, better with a Chaplain standing). A draught skips the roll. If the whole squad goes down, the expedition is lost.

## 6. Fatigue and Exposure (replaces Grit)

Two physical meters, nothing mental. Both carry over between expeditions.

- **Fatigue (0–100): wear.** Every room adds some, more deeper down, more in heavy armor (mail and plate cost here as well as in dodge), more in the dark, under a heavy bag of loot, after fights and traps, and a lot from a missed meal. At 40 a member is *tired* (aim and dodge −5). At 70 they're *spent* (−12, and they sometimes fumble a turn). At 100 they can't fight and have to be carried, which draws wanderers. Meals, shrines, camps and the Chaplain's *second wind* take some off. At home, a week of rest clears 40 (more with the Taproom). Training adds some.
- **Exposure (0–100): the College Sink's runoff in the body, and a long-term gift.** Each Sink room adds some, as do seep hits, gas traps, the Kiln Engine's blast, blood-casting in the Sink and tasting the wrong college still. Wet masks halve it.
  - At 40, 70 and 95 it brings a **Sink change**: a permanent gift, drawn from twelve in three tiers. Deeper thresholds draw better ones.
    - *Amusing:* violet skin that seeps burn less, a copper tongue that can tell a bad still, smelling wrong to rats, a slow stomach.
    - *Useful:* pale eyes that see in the dark, a thick hide, quick blood, deep lungs.
    - *Powerful:* reagent blood (a free spell each fight, and blows that burn), iron bones, storm in the fingers (a free bolt to open each fight), Sink sense.
  - **Fatigue decides how it arrives (the owner's idea).**
    - At fatigue 50 or more, the body is too tired to fight it and the change takes at once.
    - Below 50, the member runs the **Sink fever** first: aim and dodge −6 and extra fatigue for 3 rooms. If their fatigue climbs to 50 during the fever, it breaks early.
    - If they die during the fever, the change is lost. If they come home still feverish, they spend a week in bed and then get up changed.
  - So a rested squad entering the Sink risks being weakened at the worst moment, and a worn-out one gets the gift straight away but is worn out.
  - Masks and **Saint Oda's** treatment (−40 Exposure for 30 crowns) are now about timing a change, not avoiding harm.
- Habits and scars that used to touch grit now touch fatigue (Hates the dark, Jumpy, Sleeps badly, Hums on the march, Drinks).

## 7. Members are the resource

- **Wounds carry over.** HP heals a share each week at home (more with the Infirmary). Sending a hurt member down is a choice.
- **Scars** come from going down and getting up again: a bad knee, a burned hand, a stitched brow. Each has an effect.
- **Habits** come from what happened down there: hates the dark, hums on the march, counts the coins. Some help. Being worn out or seeing a friend die makes a bad one more likely.
- **Levels** (to 5) from rooms, fights and the boss: more HP and a better main attribute.
- **Death is permanent.** The roster remembers the dead and how they died.

## 8. Loot, renown and Legends

- **Loot** is goods (Pellam silver, college glass, eel oil, Assay seals, reagent salts), sold at the guild. Deeper is richer. A retreat keeps what was found; a lost squad loses everything.
- **Renown** comes from deeds: reaching a zone for the first time, killing the Kiln Engine, carrying a fallen friend out, a long expedition where nobody fell. Renown brings better recruits, better stock and better-paying sponsors.
- **Legends are folded in:** each deed adds to the member's fame, and at enough fame the street gives them a name taken from what they're known for.

## 9. The guild layer in the trial (superseded)

In the full game the classic guild stays as it was; this section describes the trial only.

Kept, simplified: crowns and selling loot (the Weighhouse waits for a squad that's away, and takes goods if the coin at home falls short); renown; recruiting; gear and supplies; two hall upgrades (**Infirmary**, **Taproom**); the Weighhouse loan as a payment due every four weeks (miss two in a row and the guild loses its hall); **sponsors** (a faction pays for a goal: reach the Sink, bring back three Assay seals, kill the Kiln Engine; a deal taken at the door holds even if the offer lapses during the trip); **rivals reaching the site first** (Hobb & Daughters have been through the Culverts this week: fewer fights, thinner finds).

Hidden behind the trial flag (`TRIAL_EXPEDITIONS` in `src/features.ts`), not deleted: the contract board, the market and materials, the Workshop and buildings, the Council, guild-war operations, Intel, Influence and Heat, Dates and story scenes. Adding `?classic` to the URL plays the classic game. The trial uses its own save key, so it never touches a real save.

## 9b. The Kiln Engine

It breaks once. After that, long expeditions end in the Kiln's yard, where two lesser engines and a seep still work, and the "Put out the Kiln" commission is never offered again.

## 9c. Balance in the full game (`npm run sim`, 300 games of 48 weeks)

| Bot | First-year survival | Deaths per expedition | Squads lost | Expeditions a year | Deaths a year |
|---|---|---|---|---|---|
| Bold, good prep | 86% | 0.21 | 11% | 25 | 5.3 |
| **Careful, good prep** | **72%** | **0.10** | **5%** | **20** | **1.9** |
| Cautious, good prep | 42% | 0.07 | 4% | 12 | 0.9 |
| Careful, poor prep | 1% | 0.71 | 24% | 5 | 3.2 |

- **Preparation decides it.** Little in the pack, ranks reversed and stubborn orders ruin a guild within the year.
- **Squad size matters most.** A full squad of four almost never dies on a short or medium route; pairs do. Expeditions take at least two people.
- **Old Pellam pays four times the trial's sponsor rewards**, so it is worth the risk: for a careful bot, 84% of Pellam trips succeed at 0.15 deaths each. Its long routes are a gamble from a fresh guild, and the prep sheet says so.
- **The cautious bot goes bankrupt** because it takes too little work, not because work kills it.
- **Short trips on the thin sites are close to riskless money.** Contracts below threat 3 are scaled no lower than 0.93 of base, but the real fix is content: more varied rooms when workstream 4 fills the sites.
- **Pack costs are small** (about 4% of spending), so a full pack is never a real trade-off yet. That's for workstream 5.

The trial's own numbers, for one squad from a fresh guild (`exp:sim`, 300 seeds), were: short, good prep 100% intact; medium 97%; long 31%.

## 10. Code

- `src/engine/expeditions/`:
  - `types.ts`: plans, goals, the log, the frozen setup.
  - `dive.ts`: the route generator and the simulation, `runExpedition(setup)`.
  - `run.ts`: dispatch, sealing, the week-by-week reveal and settlement.
  - `prep.ts`: suggested plans, blocks and warnings, pack costs.
  - `gear.ts`: classic items read as dive gear.
  - `migrate.ts`: classic saves (version 12) brought across.
  - `tuning.ts`: the headline numbers.
- `src/engine/expeditions/data/`: `content.ts` (Professions in a fight, supplies, monsters, sites and zones, goods, marks), `lines.ts` (Old Pellam's log lines) and `lines-sites.ts` (the other sites, the new monsters and Professions).
- `src/ui/sheets/PrepSheet.tsx`, `src/ui/sheets/ExpLogSheet.tsx` and `src/ui/expeditions/` (silhouettes, bars and marks). The Field tab and Watch together are workstream 2.
- `npm run sim` (balance), `npm run playthroughs` (sample games with the logs) and `tests/expeditions.test.ts`.
