# Proposal: expeditions in the full game

**Status:** a proposal for the owner and main to approve. Nothing here is built. The trial it grows from is in `docs/EXPEDITIONS.md` (PR #7).

**The owner's decisions so far (2026-11-25):**
1. Keep every classic system: the Council, the market and materials, the Workshop, Intel, Influence and Heat, Dates, rivals and wars, the story and the Codex.
2. Several squads can be out at once, and the player must be able to watch more than one.
3. Write this proposal before anyone builds.

## 1. The idea in one paragraph

Contracts become **expeditions to real places**. The week loop, the story, the factions, the Council and the Debt stay exactly as they are. What changes is what happens when a squad leaves the hall. Before, a mission resolved its phases by approach odds. Now the squad walks a site room by room: the player prepares it (ranks, gear, the pack, standing orders) and reads it live. Members carry fatigue, Exposure, wounds, scars, habits and Sink changes, so the roster becomes the resource the owner asked for.

## 2. How each classic system fits

| System | What happens to it |
|---|---|
| **Contract board** | It becomes the **expedition board**. Each posting is a site, a route length, a goal and a patron. A patron's posting is the trial's sponsor, with standing and pay. Hidden dangers (tags) become what is rumoured to be in the site: "rumoured: eels", "rumoured: Hobb's people". Intel still reveals them. |
| **Approaches** (assault, stealth, guile, endurance, arcana) | They retire as dice. They live on as rooms: guarded doors (guile), sentries (stealth), long marches (endurance), warded vaults (arcana: "sealed", never "ward"). Some sites are full of people, not monsters. |
| **Professions** | All eight. The six from the trial, plus the **Envoy** (talks a squad through guard posts and grubber camps, and buys off a fight) and the **Infiltrator** (locks, sentries, picking a pocket for a key). |
| **Story contracts** | They become **story expeditions** with fixed sites and goals. Each keeps its success, failure and expiry facts, so the braid in `STORY.md` is untouched. See §4. |
| **Field decisions** (road scenes) | They move to the **door of the expedition**: a scene can fire as a squad sets out or comes home. Inside, everything runs on standing orders. |
| **Market and materials** | Iron, leather, timber and reagents come up as **loot** from the right sites (iron from Kell, reagents from the Saltfens and the Sink), alongside goods to sell. The market still buys and sells, and the pack is filled from it. |
| **Workshop and buildings** | The Workshop makes gear and **supplies** (masks, bandages, tools, draughts) from materials. The Infirmary and Taproom join the classic buildings. |
| **Council** | Unchanged, with new decrees that touch sites: "close the Culverts" (no Pellam runs for a season), "the Crown's bounty on Assay engines" (+pay), "toll the river road" (Saltfens trips cost more). |
| **Intel, Influence, Heat** | Intel reveals what's in a site and spots rival crews. Influence buys patrons and sponsors and cools Heat. Heat rises from illegal goals, as it does now: Aske's silver, raiding a rival's cache. |
| **Rivals and wars** | Rival **crews** go into the same sites. They take the easy finds and can be met in a tunnel. A war operation becomes an expedition whose goal is a rival crew or their store. Mayne, Isbet and Plaice can lead those crews, which gives the war real faces. |
| **Dates** | Unchanged. New targets fit naturally: "bring three Assay seals by week 12", "a squad home from the Saltfens with nobody lost". |
| **Legends** | Already folded in: deeds give fame, and fame gives an epithet. Feats ("how {first} broke the Kiln Engine") feed street talk. |
| **Fatigue, Exposure, Sink changes** | As in the trial. Each site has its own Exposure flavour: the Sink's reagents, the Saltfens' fever, Kell's bad air. |
| **The Debt and the Weighhouse loan** | Unchanged. The trial's fix carries over: payments wait for a squad that's away. |

## 3. Several squads at once, and watching them

### How time works

- An expedition takes **1–3 weeks**. The whole trip is still simulated at dispatch, so it is deterministic.
- The log is **revealed week by week**: each End Week reveals that week's stretch for every squad out.
- The world doesn't change mid-trip. If a decree passes that week, it applies to the next expedition.
- **Optional, phase 3:** a squad could send word home once a week. You'd change one standing order, and the rest of the trip would be re-simulated from that room. That's the only way into a trip once it has started.

### Where the player watches

1. **The Field tab** (a new bottom tab, beside the Hall). Each squad out is a card:
   - a compact squad strip (HP and fatigue);
   - where they are ("the Buried Streets, room 6 of 9");
   - the latest line of the log.

   Tapping a card opens that squad's **live log**, exactly as in the trial.

2. **The week report gets "Down below".** After End Week, one row per squad shows "New this week: 4 rooms, a fight, Brenna is down". Each row has **Watch**, and there is a **Watch together** button at the top.

3. **Watch together** is how you spectate several squads.
   - **The strips:** each squad's strip sits in its own row, one row per squad: two rows for two squads, three for three, each about 56 px tall.
   - **One merged feed:** the lines are interleaved in the order they happened that week. Each line starts with a small squad badge: the squad's name and its number in a circle.
     - Squads are told apart by name and number, not color. Color stays reserved for meaning.
   - **Pace:**
     - tap to speed up;
     - **Skip** finishes the week for every squad;
     - tap a squad's strip to follow only that squad, and tap it again to see everyone.
   - **Big moments pause the other squads' lines for a beat**, so they can't scroll past unseen: a death, a Sink change, a boss in sight.

```
┌───────────────────────────────┐
│ Down below · week 14     Skip │
│ ① Brenna's squad · Streets 6/9│
│   ▮▮▮▯ ▮▮▯▯ ▮▮▮▮ ▮▮▮▯         │
│ ② Kit's squad · Kell Mines 2/5│
│   ▮▮▮▮ ▮▮▮▮ ▮▮▮▯ ▮▮▮▮         │
├───────────────────────────────┤
│ ① A pale hog comes down the   │
│   street at a run.            │
│ ② Kit lights the lamps at the │
│   first gallery.              │
│ ① Brenna puts the spear into  │
│   the hog. 9                  │
│ ② Somebody's boot finds a     │
│   loose rung.                 │
│ ...                           │
│   Tap to speed up             │
└───────────────────────────────┘
```

4. **Notifications in the Hall.** "Kit's squad is home: the job done, one wounded." "Brenna's squad has turned back." Tapping one opens the result screen.

**Why not split screens?** Two live logs side by side are unreadable at 390 px, and two stacked logs halve the reading space. One merged feed under stacked strips keeps one place to read and one place to glance.

### Limits

- **Squads out at once:** up to 2, or 3 with a hall upgrade (a **Muster room**, working name).
- **Roster:** 8–12 at the start, as the classic roster cap is now.
- **One squad per site at a time.** Rivals can still be there.

## 4. The story, contract by contract (Act I)

| Story contract | As an expedition |
|---|---|
| The Crown's Last Silver (Anselm) | An **escort** along the Wenmouth road to Port Anselm. Rooms are road stretches, fords and camps. Fights are road agents and, if Vorn was told, the bank's own soldiers. The goal: the cart arrives. `silver_delivered` / `silver_lost` as now. |
| Short Weight at Hesketh's (Varrow) | A **night job** in Hesketh's warehouse: sentries, locks, his clerk. A people site, best for the Envoy and Infiltrator. The goal: the false weights. |
| Salts for Saint Oda's (Saltfens) | The **Saltfens**, first visit: reeds, fever pools and salt-cutters gone feral. The goal: the salts. |
| Ansel Fell at the Chain | The **chain-house**: guards and the toll-keeper's cells. With Pask's plan, the route is shorter. |
| The Last Tapestry (Harrowmere) | An escort to **Harrowmere** and across the old bridge. |
| Aske's family silver | An **illegal** night move from the Aske house. Heat as now. |
| Rival operations (intercept, raid, kill) | An expedition against a rival crew or store, in their site. |

Every scene before and after stays as written. The story checker gains a check that every story expedition can be completed with the starting roster.

## 5. Sites

| Site | Zones | Feel | Brings up |
|---|---|---|---|
| **Old Pellam** (built in the trial) | Culverts, Buried Streets, College Sink | Rats, eels, engines, the Kiln | Pellam silver, seals, reagent salts |
| **Kell Mines** | Upper workings, flooded galleries, the deep seam | Bad air, collapsing props, claim-jumpers, cave crabs | Iron, silver ore |
| **The Saltfens** | Reed paths, salt pans, the fever pools | Fever, wading, salt-cutters, marsh hogs | Reagents, fen remedies |
| **Drover's Road** | Hill road, the passes, the outlaws' camp | People: road agents, deserters from the Ninth | Leather, coin |
| **Harrowmere** | The lake shore, the old bridge, the drowned chapel | Pike, smugglers, ice in winter | Timber, chapel silver |

Sites unlock through the story and through renown. Each has its own Exposure flavour, so a member's changes say where they've been.

## 6. Saves

The classic save moves to a new version. Its migration:
- maps members to the new fields (fatigue 0, Exposure 0, no changes);
- turns a mission that is out into an expedition that comes home next week with a short "the road was quiet" log;
- keeps every story fact.

The trial save stays separate and is retired if the merge goes ahead.

## 7. How to build it (workstreams)

1. **Engine merge:**
   - expeditions replace the mission system in `GameState`;
   - squads are out for weeks, with the log revealed week by week;
   - Old Pellam is the first site;
   - the save migration;
   - the fingerprint is expected to change, because this isn't a pure refactor.
2. **Field UI:** the Field tab, Down below in the week report, Watch together, and the expedition board in place of the contract board.
3. **Story:** the Act I story contracts as story expeditions, the story checker's new check, and the bible.
4. **Sites:** Kell Mines and the Saltfens first, then Drover's Road and Harrowmere. Each brings its monsters, rooms, log lines and silhouettes.
5. **Economy:** materials from loot, the Workshop making supplies, site decrees in the Council, rival crews.
6. **Balance:** a new sim that plays whole campaigns with expeditions, and the 65–75% first-year survival target re-measured.

Workstreams 1 and 2 come first, together. Then 3 and 4 can run in parallel, and 5 and 6 last. Each is a PR with its own preview, and the owner judges each.

## 8. Open questions for the owner

1. **Watch together:** does one merged feed with numbered squads and stacked strips feel right?
2. **Sending word home** once a week to change an order: worth having, or keep trips sealed?
3. **Squads out at once:** 2, rising to 3 with a hall upgrade?
4. **The trial's trimmed guild screens** (Hall, Squad, Market): are they a model for decluttering the classic tabs, or should the classic tabs stay as they are?
5. **Names:** the Field tab, Down below, Watch together, Muster room, and the four new sites' zone names.
