# Expeditions (v0.13.0)

Expeditions are how the guild does its work. The trial on `claude/expeditions` (PR #7) proved the dive; v0.13.0 brings it into the full game, with every classic system kept. The plan the owner approved is `docs/PROPOSAL-EXPEDITIONS-IN-MAIN.md`, and the engine API the UI builds on is `docs/EXPEDITIONS-API.md`.

The owner's brief: "make our game feel a lot more like Darkest Dungeon. More about actual dungeon dives. Monsters. Outfitting a squad and managing THEM as a resource." The expedition plays itself; the player's skill goes into the preparation. Darkest Dungeon is a touchstone for feel, not a template: no stress or afflictions, no torch meter, no hamlet, none of its class names.

## 0. In the full game

- **Contracts are postings.** Each one names a site, a route length (short, medium or long) and a goal: walk the route, reach a zone, bring back goods or kill something. The patron, pay, standing, Heat, story facts and rival operations work as before.
- **Sites (v0.14.0).** Every site is built like Old Pellam: three zones and a boss. Short routes stay in the first zone, medium routes go on into the second, and long routes go down through all three to the boss's room. A plain job on a long route walks the third zone and stops short of the boss. Distant sites add road weeks there and back. The zones, monsters and bosses are in `docs/STORY.md` §5d, and sample logs for each site are in `docs/playthroughs/sites/` (`npm run exp:logs`).
  - Varrow: the Lower Town, the Quays, the Rookeries; Lew Rudd.
  - Kell Mines: the upper workings, the Sump, the Trevick level; Gaffer Moyle.
  - The Saltfens: the reed paths, the Pans, the Withies; the Dean.
  - Drover's Road: the hill road, Brannock Moor, Skell Gap; Sergeant Crewe.
  - Harrowmere: the lake shore, the bridge houses, the Holms; the Bailiff.
  - Port Anselm: the Wenmouth road, the Burrows, the Strand; Mags Tull.
- **Bosses are beaten once, one squad at a time.** Only one squad can be on its way to a boss; beyond Old Pellam a boss is posted once a squad has reached the site's second zone. Each site's boss falls once (`delve.bossesBeaten`); its posting comes off the board, and long routes there end in its room with a lesser fight. Each site has two or three postings of its own (`data/contracts-sites.ts`): reach a zone, bring a find, kill something, and the boss.
- **Depth carries the danger beyond Old Pellam.** A classic contract's threat now counts from what is usual for its route length (3 short, 5 medium, 8 long), because the deeper zones already make the trip harder.
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

v0.14.0, with every site at full depth, 1000 games (main at v0.13 in brackets, also 1000 games):

| Bot | First-year survival | Deaths per expedition | Squads lost | Expeditions a year | Deaths a year |
|---|---|---|---|---|---|
| Bold, good prep | 58% (61%) | 0.19 | 10% | 18 | 3.4 |
| **Careful, good prep** | **71% (70%)** | **0.11** | **6%** | **19** | **2.1** |
| Cautious, good prep | 64% (61%) | 0.07 | 4% | 18 | 1.2 |
| Careful, poor prep | 1% (1%) | 0.73 | 24% | 4 | 3.2 |

Careful bot, deaths per expedition by site: Old Pellam 0.19, Varrow 0.09, Kell Mines 0.14, the Saltfens 0.14, Drover's Road 0.09, Harrowmere 0.13, Port Anselm 0.07. The site postings are contested like other work (a quarter of the time, never for a boss), the medium ones are posted less often than Old Pellam's, and the bosses carry threat 8 (Moyle 7) and pay for their road weeks: Rudd 480, Moyle 650, Crewe 620, the Bailiff 600, the Dean and Tull 700. The bot now reads every site's own postings (a goal other than "see it through") the way it reads Old Pellam's, and keeps pairs out of them; without that it took the long boss jobs with green squads and survived 40%. It still underrates the medium site postings, which play like easy classic work, so it seldom takes them.

A fresh guild's starting squad on a long boss trip (`suggestPlan`, no dangers, 120 seeds) loses the whole squad 16–29% of the time, against 54% for the Kiln Engine.

**Care pays best.** Before the owner's review, a bold guild survived more often than a careful one (82% against 73%, with a cautious one at 40%): a full squad on a short trip came home almost untouched, going out tired cost nothing, a death cost about 40 crowns to replace, and a cautious guild sat out while its people healed. Now:
- **Every trip wears people down.** Rooms on the one-zone sites cost as much fatigue as deeper ones, so a squad comes home from a short trip about a fifth worn out and needs rotating.
- **Going out tired is dangerous.** A member who goes down tired or spent is likelier to die (+5% and +12% on the roll), and the prep sheet says so.
- **A death costs the guild.** The family is paid eight weeks of the member's wage, and for eight weeks recruits ask a quarter more for each recent death.
- **Rest mends.** A member resting at home heals 15 more a week, so a careful guild that rotates its people keeps its squads working.

Other notes:
- **Preparation decides it.** Little in the pack, ranks reversed and stubborn orders ruin a guild within the year.
- **Squad size matters most.** Pairs die; a rested squad of four almost never does on a short or medium route. Expeditions take at least two people.
- **Old Pellam pays four times the trial's sponsor rewards**, so it is worth the risk. Its long routes are a gamble from a fresh guild, and the prep sheet says so.
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
- `src/engine/expeditions/data/`: `content.ts` (Professions in a fight, supplies, monsters, sites and zones, goods, marks), `lines.ts` (Old Pellam's log lines), `lines-sites.ts` (the other sites' first zones, their monsters and the Envoy's and Infiltrator's moves) and `lines-deep.ts` (the other sites' deeper zones, their monsters and bosses). `expeditions/bosses.ts` answers whether a site's boss is beaten.
- `src/ui/sheets/PrepSheet.tsx`, `src/ui/sheets/ExpLogSheet.tsx` and `src/ui/expeditions/` (silhouettes, bars and marks). The Field tab and Watch together are workstream 2.
- `npm run sim` (balance), `npm run playthroughs` (sample games with the logs) and `tests/expeditions.test.ts`.
