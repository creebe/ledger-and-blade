# Expeditions (trial, v0.13.0-proto)

A trial of a major change, on its own branch (`claude/expeditions`). The owner may scrap it. It turns Ledger & Blade from a contract-board ledger game into a game about **preparing a squad, sending it down into a real place, and reading what happens to them**.

The owner's brief: "make our game feel a lot more like Darkest Dungeon. More about actual dungeon dives. Monsters. Outfitting a squad and managing THEM as a resource." The expedition plays itself; the player's skill goes into the preparation. Darkest Dungeon is a touchstone for feel, not a template: no stress or afflictions, no torch meter, no hamlet, none of its class names.

All names below are **working names** until the owner approves them.

## 1. The loop

1. **At the guild** (Tallow Street): heal, rest, recruit, buy gear and supplies, sell what came up, pay the Weighhouse, pick a sponsor's commission.
2. **Prepare** an expedition into **Old Pellam**: choose its length, four members and their ranks, their gear, the pack, and the standing orders.
3. **The expedition plays itself.** The log is revealed line by line, with the squad strip showing health and grit as it goes. Tap to speed it up, or skip to the end.
4. **Back at the guild**: the dead are buried, the wounded heal, scars and habits are written into the roster, loot is sold, renown is earned. Time moves on by the expedition's length in weeks; members who stayed home rest.

## 2. The site: Old Pellam

The first town on the river, under Varrow's Lower Town. When the river moved two hundred years ago, Pellam silted up and Varrow was built on top of it. Its cellars and streets are still down there, and so is the drain where the college poured its spent reagents for a century. Magic is a trade and a science: nothing down there is cursed, but a great deal of it has been soaking in alchemical runoff for a long time.

| Depth | Zone | What it's like |
|---|---|---|
| 1 | **The Culverts** | Brick drains and cellars. Rats, scavengers, grates with a little daylight. |
| 2 | **The Buried Streets** | Pellam's old streets, roofed over by Varrow. Houses full of silt, spiders, hogs gone pale, crabs. No light. |
| 3 | **The College Sink** | Where the reagents went. Seeps, the Assay Office's abandoned test engines, and at the bottom the **Kiln Engine**. |

**Lengths.** *Short* (the Culverts, about 5 rooms, 1 week), *medium* (down to the Buried Streets, about 9 rooms with one camp, 2 weeks), *long* (to the bottom of the Sink, about 14 rooms, two camps and the Kiln Engine, 3 weeks).

## 3. Preparation (the game)

- **Squad and ranks.** Four members, ranks 1 (front) to 4 (back). Melee reaches from ranks 1–2; bows and spells work from the back; most enemies hit the front two. A member who goes down leaves the line, and everyone behind steps forward, which is how an Arcanist ends up in front of a hog.
- **Gear.** Weapon (damage type, power, element), armor (protection against dodge and stealth), one trinket.
- **The pack: 12 slots.** Food (3 a slot), bandages (3), lamp oil (4), tools (2), charms (2), reagents (3), draughts (1). What isn't used comes home.
  - *Food:* a meal every few rooms and at every camp. No meal costs grit and stops camps healing.
  - *Bandages:* heal between rooms. A Chaplain gets twice as much out of each.
  - *Lamp oil:* the Buried Streets and the Sink are dark. Without oil the squad is ambushed more, misses traps and loses grit. Tallow moths eat it.
  - *Tools:* disarm traps, force strongboxes, clear rubble. Without them, a trap goes off or the squad goes the long way round.
  - *Charms:* Oda's tokens. Spent when someone is about to lose their nerve.
  - *Reagents:* doses for the Arcanist's spells and the Chaplain's censer. Without them, the Arcanist casts from their own blood.
  - *Draughts:* pulls a member who goes down straight back up, and skips the roll for their life.
- **Standing orders** (five, each a choice of two or three):
  - *Turn back:* cautious (anyone badly hurt or shaken) / steady (two in trouble, or a death) / stubborn (only when half the squad is down).
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
| Chaplain | 2–4 | Dresses wounds, steadies nerves, censer (radiant) |
| Scout | any | Spots traps and ambushes, finds caches, knife in the gap |

Hits roll accuracy against dodge, and damage against armor. Weaknesses and resistances use the existing elements (fire, frost, storm, radiant, shadow) and damage types (slash, pierce, blunt). At 0 HP a member **goes down**: they're out of the fight and roll for their life (worse from a heavy blow or in the dark, better with a Chaplain standing). A draught skips the roll. If the whole squad goes down, the expedition is lost.

## 6. Grit (the nerve mechanic, working name)

Each member has **Grit** (0–100), which carries over between expeditions. It drains from wounds, traps, the dark, the bigger monsters, friends going down, and hungry nights. Kills, finds, hot meals, camps and the Chaplain's words restore some. At 0 a member is **shaken**: their aim goes and they only defend themselves, and a cautious squad turns back. Being shaken often leaves a **habit**. Grit comes back slowly at the guild, faster with the Taproom.

## 7. Members are the resource

- **Wounds carry over.** HP heals a share each week at home (more with the Infirmary). Sending a hurt member down is a choice.
- **Scars** come from going down and getting up again: a bad knee, a burned hand, a stitched brow. Each has an effect.
- **Habits** come from what happened down there: hates the dark, hums when frightened, counts the coins. Some help.
- **Levels** (to 5) from rooms, fights and the boss: more HP and a better main attribute.
- **Death is permanent.** The roster remembers the dead and how they died.

## 8. Loot, renown and Legends

- **Loot** is goods (Pellam silver, college glass, eel oil, Assay seals, reagent salts), sold at the guild. Deeper is richer. A retreat keeps what was found; a lost squad loses everything.
- **Renown** comes from deeds: reaching a zone for the first time, killing the Kiln Engine, carrying a fallen friend out, a long expedition where nobody fell. Renown brings better recruits, better stock and better-paying sponsors.
- **Legends are folded in:** each deed adds to the member's fame, and at enough fame the street gives them a name taken from what they're known for.

## 9. The guild layer, trimmed

Kept, simplified: crowns and selling loot; renown; recruiting; gear and supplies; two hall upgrades (**Infirmary**, **Taproom**); the Weighhouse loan as a payment due every four weeks (miss two in a row and the guild loses its hall); **sponsors** (a faction pays for a goal: reach the Sink, bring back three Assay seals, kill the Kiln Engine); **rivals reaching the site first** (Hobb & Daughters have been through the Culverts this week: fewer fights, thinner finds).

Hidden behind the trial flag (`TRIAL_EXPEDITIONS` in `src/features.ts`), not deleted: the contract board, the market and materials, the Workshop and buildings, the Council, guild-war operations, Intel, Influence and Heat, Dates and story scenes. Adding `?classic` to the URL plays the classic game. The trial uses its own save key, so it never touches a real save.

## 10. Code

- `src/engine/expeditions/`: types, the dive simulation, guild actions, saves (`EXP_SAVE_VERSION`, `migrateExpSave()`), the balance bot.
- `src/engine/expeditions/data/`: Professions' combat profiles, monsters, the site, supplies, gear, scars and habits, goods, and the log's lines.
- `src/ui/expeditions/`: the guild, preparation, live log and result screens, and the silhouettes.
- `npm run exp:sim` (balance) and `npm run exp:logs` (sample logs in `docs/playthroughs/expeditions/`).
