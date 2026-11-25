# Hand-over: sites (workstream 4, v0.14.0)

The six sites beyond Old Pellam, built out to its depth. Branch `claude/sites`, from main at v0.13.1, with main merged again at v0.13.2. The PR is "Every site at full depth (v0.14.0)". Not merged, not deployed.

## What was done

- **Every site is built like Old Pellam:** three zones and a boss. The owner approved all the names before any content was written.

  | Site | Zones (shallowest first) | Boss |
  |---|---|---|
  | Varrow | the Lower Town, the Quays, the Rookeries | Lew Rudd, in Rudd's yard |
  | Kell Mines | the upper workings, the Sump, the Trevick level | Gaffer Moyle |
  | The Saltfens | the reed paths, the Pans, the Withies | the Dean (a marsh boar) |
  | Drover's Road | the hill road, Brannock Moor, Skell Gap | Sergeant Abner Crewe |
  | Harrowmere | the lake shore, the bridge houses, the Holms | the Bailiff (a pike) |
  | Port Anselm | the Wenmouth road, the Burrows, the Strand | Mags Tull and her wreckers |

  - **Route lengths:** a short route stays in zone 1, medium goes on to zone 2, and long goes through all three to the boss.
  - **Plain jobs** ("see it through") on a long route walk zone 3 and stop short of the boss.
- **Content** (`expeditions/data/content.ts`, `lines-deep.ts`, `data/contracts-sites.ts`):
  - 19 monsters and people;
  - 12 goods: six common finds and six boss finds;
  - traps: tide, stampede, brine;
  - curiosities: wreck, cairn, boathouse;
  - about 300 log lines;
  - 16 postings: medium "bring", "reach" and "kill" jobs, and one long boss job per site.
- **Engine:**
  - **Bosses come from the site** (`SiteDef.boss`, `MonsterDef.boss`). This was done first as a pure refactor, with the fingerprint matching main.
  - **Each boss is beaten once.** `delve.bossesBeaten` replaces `kilnBroken`. `SAVE_VERSION` is 14, with a migration step and tests.
    - Trips sealed before v14 replay the same: Old Pellam reads the old flag, and the other sites get `setup.oneZone`.
  - **Only one squad at a time can be on its way to a boss** (`expeditions/bosses.ts`, `bossBusy`). This also stops the Kiln being broken twice.
  - **Boss postings beyond Old Pellam wait** until a squad has reached that site's second zone.
  - **Depth carries the danger outside Old Pellam.** A contract's threat counts from `EXP_TUNING.threatByLength`: 3 for short, 5 for medium, 8 for long. Site postings keep their own threat instead of the renown cap.
  - **A job to kill several of something** meets them together in its last room.
  - **Killing tidewaiters or watch sergeants has a cost:** Ostrander's standing −1 each (at most −3), and Heat +2 each (at most +6).
  - **A rival ambush on the road home** takes a third of each find, rounded down, so a single boss find comes home.
- **Prep sheet:**
  - It warns a squad where nobody is past level 2 off any unbeaten boss.
  - The dark-room count uses the boss's own zone.
  - The near-Exposure-change warning now covers every zone that gives Exposure.
- **New script:** `npm run exp:logs` writes `docs/playthroughs/sites/<site>.md`, a medium trip and a long boss trip for each site, for the owner to read.
- **Docs:**
  - `docs/STORY.md` §5d: the sites table, bosses and every zone.
  - `docs/EXPEDITIONS.md` and `docs/EXPEDITIONS-API.md`.
  - Story export regenerated.

## What was checked

- **`npm run check`:** 66 tests (5 new site and boss tests, plus the extended v13 migration test). Story checker at 0 violations, 0 unreached nodes and no unused facts.
- **`npm run sim`, 1000 games, branch against main:**

  | Bot | Branch | Main |
  |---|---|---|
  | Careful (0.5) | **71.1%** | 69.6% |
  | Cautious (0.65) | 64.3% | 61.1% |
  | Bold (0.35) | 57.5% | 60.6% |
  | Poor prep | 0.5% | 0.7% |

  - Careful bot, deaths per expedition: 0.110 overall. By site: Old Pellam 0.19, Varrow 0.09, Kell Mines 0.14, the Saltfens 0.14, Drover's Road 0.09, Harrowmere 0.13, Port Anselm 0.07.
- **One change to the bot** (`scripts/sim.ts`): it rates a posting with a goal of its own like an Old Pellam posting, and keeps pairs out of it. Without that it threw green squads at boss jobs, and survival fell to 40%. The balance reviewer called the change fair.
- **Reviewers:** all five ran, and their fixes are in.
  - **Engine:** found and fixed the v13 replay bug for the other sites (`oneZone`). It compared 3,600 trips frozen on main and all of them replay identically.
  - **Writing:** 32 rewrites. No array lengths changed.
  - **Story:**
    - Kell's flood date now matches the Codex.
    - First-zone lines that pointed at what are now deeper zones were reworded.
    - Harrowmere's bridge still carries the road, on a timber span.
    - Kell's warrants belong to the bank, so the Sump survey is Ostrander's work.
    - *Salts for Saint Oda's* no longer mentions the pans.
  - **Systems:** one squad per boss, boss postings gated, the real threat shown on the board, kill goals that can be met, dark-room and brine warnings, patrons matching their effects, the ambush rounding, and costs for killing tidewaiters and sergeants.
  - **Balance:** site postings are now contested a quarter of the time, medium site postings are less frequent, the bosses are at threat 8 (Moyle at 7), and pay is retuned: Rudd 480, the Dean and Tull 700.
- **The fingerprint changed** (`972e1ebf…48cd`). That's expected, because this isn't a pure refactor.
- **Not checked:** a browser pass, because no UI code changed. The board, prep sheet and log show the new text through existing components.

## What's open

- **For the owner:**
  - Harrowmere's bridge: I kept it in use on a timber span, so it fits the Codex and the troll contract.
  - Kell's ownership: the bank holds the warrants, and Weighhouse merchants lease the workings from it.
  - Both are my calls to fit canon, and easy to change.
- **Story hooks with no payoff yet:**
  - The Ninth's colours, and Crewe's death, change nothing with the Ninth or Mayne. The bible marks this as Draft.
  - Rudd's book, the Dean's tusks and the other boss finds sell at a flat price.
- **After-boss lines can't be reached** on the six new sites (`rudd_after` and the others). Only boss postings go to a boss's room, and they're gone once the boss is beaten. A later "clear out" or long "bring" posting would use them.
- ***The Crown's Last Silver*** at medium walks the Wenmouth road and the Burrows, and never reaches the harbour.
- **The mines use the wayside-shrine lines.** Adding Kell's own would change the random draws in old Kell trips, so it should wait for a save bump.
- **Pre-existing bug:** a lost squad where nobody died still gets "short of people" on the road home, and nobody is lost. You can see this in `docs/playthroughs/sites/kell.md` before the reviewers' changes. It may now land on a different seed.
- **Balance, from the reviewer:**
  - Legends per game dropped from 0.80 to 0.52 by week 96, because the long out-of-town trips mean fewer missions. The reviewer suggests `LEGEND_NEEDS.missions` 25 → 23 (untested).
  - Year-one feuds: re-check after the `contestChance` change.
  - The bot rarely takes medium site postings, which play like easy classic work.
- **Spelling** is mixed: the new text has colours and harbour, the older text has harbor.
- **The story document (Claude Doc)** isn't synced. `docs/story/all-writing.md` is regenerated, and syncing follows `docs/story/README.md` step 5 after merge.
