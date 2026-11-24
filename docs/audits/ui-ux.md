# UI/UX audit (v0.10.1, main at `ac9e052`)

An audit of the game as it stands on `main`, for a player on a phone. The audit itself changed no game code.

> **Status:** the owner asked for every recommendation and the rename to be built. They are in v0.11.0, on the same branch. [Section 7](#7-what-was-built-in-v0110) lists what was built and where it differs from the plan.

## Summary

The game holds together well on a phone. Sheets, confirmations and blocked-action toasts are used consistently, and the planner's sticky odds footer is the best screen in the game. The problems are in four places.

1. **Red means too many things.** The accent red is used for every screen and sheet title, for selection, for primary buttons and for threat pips. The "bad" red is nearly the same color. A selected squad member, a price button and a failing odds bar all read as alarms. Gold and the warning amber are also nearly the same color, so a Story contract and a risky one look alike.
2. **The busiest actions sit at the bottom of long pages.** Weekly orders are at the bottom of the member sheet, 1,430 px down. Rivals are 3,700 px down the Realm. The Hall is about ten screens tall. Setting orders for six members costs about 19 taps and six scrolls.
3. **Some icons carry two or three meanings.** The star means Renown, Story and fame. The moon means Stealth, Shadow and the dark theme. The flame means Heat and Fire. "Guard the hall" has no icon, so it shows the bed icon on the Roster and the info icon on the member sheet.
4. **Type and numbers drift.** The stylesheet uses 30 different font sizes. Crowns are written four ways (◉ after, ◉ before, a coin icon, the word). Weeks are written five ways (`3w`, `4 wks`, `3 wk`, `in 3 weeks`, `/week`). The display font's numerals make "(0)" look like "(o)" and "Year 1" look like "Year ı".

**The quick wins** take under an hour each:
- fix the Guard icon;
- add confirmations to the four purchases that skip them;
- make the "N to check" label and the Hall alerts tappable;
- move weekly orders to the top of the member sheet;
- set lining numerals on the display font;
- move the toast so it stops covering sheet content;
- take the titles off the accent red.

**The biggest wins for more work:**
- a "Best squad" button in the planner;
- buying supplies from inside the planner;
- sub-tabs on the Realm;
- weekly orders set straight from the Roster row;
- splitting the warning amber from the gold.

The ranked list is in [section 6](#6-recommendations-ranked).

## How this was checked

- **Browser.** Playwright and Chromium at 390×844 with touch on. Screenshots are at deviceScaleFactor 2.
- **Game states.** Saves were made by the balance bot (`scripts/sim.ts`, seed 101) and loaded through the `lab.autosave` key:
  - week 1, with the tutorial on and the opening scene pending;
  - week 20 (Summer, week 8), with seven members, a building going up and a Council agenda;
  - week 44 (Winter, week 8), with two squads in the field and the treasury nearly empty.
- **Both themes.** Dark is the default, and light was spot-checked.
- **Source.** The source is the ground truth for icons, colors and type:
  - `src/styles.css`, read with a script that maps every font size and color token to its selectors;
  - `src/ui/kit/icons.tsx`;
  - every screen, sheet and panel.
- **Not checked:** 360 px width, iOS Safari, the title and new-guild screens in depth, the mission replay, and the game-over screen.

The usable height between the top bar and the End Week bar is **643 px** (86 to 729). "Above the fold" below means inside that band.

---

## 1. Tap counts for common actions

Counts start from the screen where a player would naturally be. Each confirmation counts as a tap. Scrolls are listed separately.

| Action | Starting point | Taps | Scrolls | Verdict |
|---|---|---|---|---|
| Start a contract (squad of 3) | any tab | **6**: Contracts, card, 3 members, Dispatch. A risky plan adds 1 for the confirm. | 0–1 | Too many. The card already knows the best squad. |
| Start a contract when supplies are short | planner | **10 or more**: close, Armory, buy, Contracts, card, 3 members again, Dispatch | 1 | Too many. Closing the planner throws away the squad you picked. |
| Set one member's weekly order | Roster | **3**: row, order, close | 1 long scroll (the order list is at 1,431 px in a 744 px sheet) | Too many when repeated. |
| Set orders for 6 members | Roster | **19** | 6 | Too many. This is the most repeated chore in the game. |
| End the week | any tab | **2**: End Week, then "Begin week" on the report. With warnings it's 3. | 0 | Fine |
| Buy supplies | any tab | **2**: Armory, then +N | 0 | Few enough, but there's no confirmation (see §4.4) |
| Answer a scene | opens by itself | **1 per choice** | often 1 inside the card | Fine. The choices of a long scene start below the fold (`scene-week1.jpg`). |
| Recruit | any tab | **3**: Roster, Hire, confirm | 1 (Hiring Hall at 950 px mid-game) | The scroll is the problem |
| Check a member | any tab | **2**: Roster, row | 0 | Fine. From the planner it takes a long-press nobody will find. |
| Open the Journal | any tab | **1** | 0 | Fine |
| Spy on a rival, then counter | any tab | **5**: Realm, Learn plans, confirm, Counter, confirm | 5 or 6 screens | The scroll is the problem |
| Run a rival operation | any tab | **4**: Realm, "Operations against…", operation, confirm | 5 or 6 screens | The scroll is the problem, and the link is a 24 px target |
| Lobby the Council | any tab | **4**: Realm, stance, method, confirm | 0–1 | Fine |
| Start a building | any tab | **4**: Hall, tile, Build, confirm | 1 (Buildings at 650–1,140 px) | Fine |
| Speed a building up | Roster | 3 per builder, as for any order | 1 each | Too many (same fix as orders) |
| Repay the loan | any tab | **3**: Hall, Repay, confirm | 1–2 (Debt at 950–1,420 px) | Fine |
| Equip an item | any tab | **5**: Roster, row, slot, item, close | 1 | Fine |
| Reveal a hidden tag | planner | **2**: ?, confirm | 0 | Fine, but the ? is a 24 px target |
| Collect a note reward | any tab | **2**: nudge, note. On the Hall it's 1. | 0 | Fine |

**What stands out**

- **Orders.** A member's order resets to Rest when they're dispatched (`Planner.tsx`, `send`), so a player sets orders again after every mission. Orders live in the member sheet, below the attributes, vitals, traits, approach scores, service record and gear (`member-top.jpg`, `member-bottom-guard-icon.jpg`).
- **Picking a squad.** The contract card already works out the best squad to show its odds (`useBestOdds`). The planner doesn't offer that squad, so the player picks the same people by hand.
- **Supplies.** When supplies are short, the Dispatch button says "Not enough supplies" and stays dead. The way out costs about 10 taps and loses the squad, because the planner keeps the selection in local state.
- **Hidden gesture.** "Hold a member to see their gear" is the only way into a member from the squad picker until they're selected.

## 2. Important information on each screen

### Always on screen

| Element | What it shows | What's missing |
|---|---|---|
| Top bar | Date, then 6 resources as icon and number. Crowns turn red when they won't cover a week's costs, and Heat turns amber or red. Journal dot for new Codex entries. | Labels: the six icons have no words, and you tap each one to get a toast. The loan isn't shown: the payment due and the weeks left only appear in the Hall. Supplies show a count, not how many weeks they last. |
| End Week bar | "N to check" or "Ready", squads in the field, the next note | "N to check" isn't tappable, so you can't see what to check without pressing End Week. |
| Bottom nav badges | Contracts: Story contracts on the board. Realm: decrees with no stance taken. | No badge on Roster (new recruits, wounded members, unspent orders) or on Hall (bad alerts such as a missed payment). |

### Tabs

**Hall** (`hall-week1.jpg`, `hall-mid.jpg`, `hall-scroll-map.jpg`). About 6,600 px mid-game, roughly ten screens.

- **Above the fold:**
  - the title and the date (the date repeats the top bar);
  - Attention;
  - in week 1, the Guildmaster's Notes card, which fills the whole first screen and pushes the Ledger to 710 px.
- **Buried:**
  - the Ledger projection, half below the fold;
  - Buildings, at 650 px;
  - **Debt**, at 950–1,420 px;
  - the dispatch feed, which runs to 40 items and makes up most of the height.
- **Missing:**
  - Alerts aren't tappable. "Supplies are low. Buy more at the Armory" doesn't take you there.
  - Alert icons don't match their tone: a warning shows the info icon, and info shows the clock.

**Contracts** (`contracts-mid.jpg`, `contracts-late.jpg`)

- **Above the fold:**
  - mid-game, the first two board cards;
  - late game, only the two in-field cards. The Board starts at **700 px**, below the fold.
- When nobody is in the field, "In the field (0)" still takes 130 px.
- Cards show:
  - reward;
  - patron;
  - type and region;
  - duration;
  - phase plan;
  - best-squad odds;
  - tags;
  - threat;
  - expiry.

  That's complete, but each card is about 350 px, so two fit on screen.

**Planner** (`planner-squad.jpg`)

- The sticky footer always shows:
  - phase odds;
  - supplies;
  - duration;
  - risk;
  - Dispatch.

  This is the right pattern.
- The contract header takes 300 px before the squad picker.
- "Select at least 3" is a disabled button. Its label explains, but it uses `disabled` rather than `Btn blocked`, so tapping it does nothing.

**Roster** (`roster-mid.jpg`)

- **Above the fold:** about 4.5 member rows. Each row shows:
  - readiness;
  - order;
  - profession and level;
  - top two approaches.
- Hiring Hall is at 950 px mid-game and 1,062 late, with no badge to say anyone new arrived.

**Member sheet** (`member-top.jpg`, `member-bottom-guard-icon.jpg`)

- **First screen:**
  - profession;
  - XP;
  - fame;
  - status;
  - attributes;
  - vitals;
  - traits.
- **Below it, in order:** approach scores, service record, gear (1,025 px), then **This week** (1,431 px).
- The sheet's order is the reverse of how often each part is used.

**Armory** (`armory-shop.jpg`)

- Supplies and the first shop item are visible.
- The supply price and bulk discounts are clear.
- The Shop, Inventory, Workshop and Materials tabs work well.
- Prices are red filled buttons (see §4.1).

**Realm** (`realm-top.jpg`, `realm-scroll-map.jpg`). About 4,800 px, seven to eight screens.

| Section | Where it starts |
|---|---|
| Council | 153 px (it runs to 1,250, with two decrees) |
| The Debt clocks | 1,250 px |
| Powers of Varrow | 1,570 px |
| Heat | 3,470 px |
| Rivals | 3,650 px |

- Heat and rival plans change every week, yet they're the deepest things in the game.

### Sheets and cards

**Scene card** (`scene-week1.jpg`)

- It shows:
  - the date;
  - the speaker;
  - the transcript;
  - the choices, with check odds and blocked reasons.
- The odds sit with the choice they belong to, which is good.
- Long openings push the choices below the fold, and the card scrolls inside itself, so a player may not notice there's a third choice.

**Week report** (`week-report.jpg`)

- The resource deltas are clear.
- The title wraps to two lines ("End of week · Summer · Week 8 · Year 1").
- The routine weekly drop in supplies shows in bad red every week.

**Warnings sheet** (`endweek-toast-covers-warning.jpg`)

- The toast is fixed at 96 px from the top, above sheets. Here it covered the only warning in the list.
- It does the same on every sheet whose content starts near the top.

**Journal and Menu.** Fine. The Codex "New" badges are gold, the same as the Objective badge and the hint borders.

## 3. Icon consistency

The icon set is one family: 24-pixel line icons, stroke 1.8, drawn in `currentColor`. The problems are meaning, not style. See `icon-collisions.jpg`.

### 3.1 One drawing, several meanings (identical path data)

| Drawing | Meanings |
|---|---|
| Moon | Stealth (approach), Shadow (element), dark theme. Night is the moon plus a sparkle. |
| Flame | Fire (element), Heat (resource). Fireborn is the flame with eyes. |
| Snowflake | Frost (element), Cold (terrain tag) |
| Bolt | Storm (element), Fatigue/Freshness (vital) |
| Sun | Radiant (element), light theme |
| Star | Renown (resource), Story (`quest`), fame tier and Legends |
| Compass | Scout (profession), Scout a contract (order), Expedition (contract type) |
| Flag | Soldiers (enemy tag), The Ninth (rival) |

The star is the worst case. On a Story contract card the star means Story, the reward line next to it means crowns, and the same star is Renown in the top bar.

### 3.2 One name, several jobs

- **`armor`:** the Armory tab, the armour slot, Leather (material), and every "Gear: name" button.
- **`anvil`:** Iron (material) and the Build order.
- **`scroll`:** the Contracts tab, the Guildmaster's Notes, mission news, and the fallback for unknown contract types.
- **`info`:**
  - the fallback for any unknown icon name;
  - warning-tone alerts in the Hall;
  - **Guard the hall**, because `guard` is missing from the order icon map in `MemberSheet.tsx`, so the fallback shows. On the Roster, `ASSIGN_ICON` in `Roster.tsx` falls back to `rest` instead, so the same order shows a bed on one screen and an ⓘ on the next. This is a bug.
- **`clock`:** time left, the Arrears clock, and info alerts.
- **`coin`, `eye`, `sack`:** Crowns, Intel and Supplies, and also the Collection, Investigation and Smuggling contract types.
- **`hobbs`:** every rival's news in the feed, including the Ninth's and the Assay Office's (`DispatchItem.tsx`, `KIND_ICON.rival`).

### 3.3 Look-alikes

- `train` (the Train order) and `assault` are both crossed diagonals with hooked ends. In the roster they sit side by side.
- `night` and `stealth` differ by one small sparkle.

### 3.4 Glyphs and emoji mixed with icons

There are 31 places where text glyphs stand in for icons:

- ✓ for countered tags, squad picks and "Note done";
- ✝ and ↦ for the fallen;
- ▶ for "Read the mission report";
- ▸ for the scene transcript;
- ☀ and ☾ for the theme;
- ◉ for crowns, in 23 places;
- the 💬 emoji on talk choices.

The emoji renders in full color in the platform's own style, unlike everything around it.

### 3.5 Sizes

- Icons come in 10 fixed sizes: 11, 12, 13, 14, 16, 18, 20, 21, 22 and 24, plus some computed ones.
- 13 and 14 are used for the same job, a small icon in a meta line: 13 on contract cards, 14 on the scene card and the End Week bar.
- A four-step scale would cover every use: 12, 14, 18 and 24.

## 4. Color consistency

The rule allows color for:
- good, warning and bad states;
- selection;
- element badges;
- faction dots.

### 4.1 Accent red is used for decoration and for selection, and it's nearly the bad red

| | Light | Dark |
|---|---|---|
| `--accent` | `#8c2f1e` | `#c4553c` |
| `--bad` | `#a3321f` | `#e06a4f` |

Side by side, they're hard to tell apart. Accent is used for:

- **Decoration (stray uses):**
  - every title: the screen title, sheet title, subheads, scene title, confirm title and Help headings;
  - the threat pips;
  - the current node on the mission strip;
  - the Story dispatch icon;
  - the notes progress bar.
- **Selection (allowed):** the nav, the selected squad member, the chosen order, the selected matrix row.
- **Primary buttons:** End Week, Dispatch, Hire, and every shop price (`armory-shop.jpg`).

So the guild's own name in the title, a member you just picked, and a phase with a 31% chance all wear the same red.

### 4.2 Gold is used as decoration, and it's nearly the warning amber

| | Light | Dark |
|---|---|---|
| `--gold` | `#a07a1f` | `#d2a63f` |
| `--mid` | `#b5851d` | `#d9a93a` |

Gold is used for:
- the Story card border and tag;
- reward amounts;
- hint borders;
- the cost box border;
- the scene speaker name;
- the service record rule;
- the objective phase;
- the facility tiles and pips;
- notes ready to collect;
- fame and Legends;
- the XP bar;
- the building progress bar;
- the Objective and New badges.

None of these is a state. On a Story card (`contracts-mid.jpg`), the gold border, the gold Story tag and the amber odds pill look like one color, so a player can't tell "Story" from "uncertain odds".

### 4.3 Other overlaps and strays

- **`--good` and `--ap-endurance`** are the same color in the light theme (`#3d7a3a`). A green odds bar and the Endurance approach mean different things.
- **The resource colors** (`--r-*`) aren't in the allowed list, and they're half retired:
  - the top bar overrides them to muted grey;
  - they still color the Supplies heading in the Armory (green), the Influence and Heat headings in the Realm (purple and orange), and the crowns cost chip.
  - Four of them are copies of other tokens: `--r-intel` = `--info`, `--r-influence` = `--ap-arcana`, `--r-heat` = `--el-fire`, and `--r-renown` = `--el-radiant`.
- **Tag borders:** *(correction)* an early rule tints enemy tags red and terrain tags blue, but a later rule in `styles.css` already sets both back to neutral. What players see is correct. The stale early rule is the only problem.
- **Week report:** the routine weekly use of supplies is shown in bad red every week.
- **Faction colors** fill the whole left border of faction and rival cards, not just a dot. This is borderline; it reads well.

### 4.4 Rule breaks found along the way (not color)

- **Purchases with no confirmation** ("every spend asks for confirmation"):
  - buying supplies;
  - buying a shop item;
  - buying materials;
  - queuing a craft.

  The supply buttons also aren't `Btn` with a `blocked` reason.
- **Disabled buttons that explain nothing when tapped** ("a blocked action explains why"):
  - the planner's Dispatch;
  - the menu's Load on an empty slot.

### 4.5 Tap targets under 40 px

| Control | Height |
|---|---|
| Resource chips | 30 px |
| Tags, including the hidden-tag ? you tap to reveal | 24 px |
| The planner's "Why?" bar | 22 px |
| Strength-matrix sort headers | 22×28 px |
| Link buttons ("Operations against…", "Hide strengths") | 24 px |
| Approach chips | 31 px |
| Small buttons | 34 px |

## 5. Typography consistency

### 5.1 Families and weights

- **Families:**
  - Source Serif 4 for body text;
  - Cormorant Garamond for display;
  - a monospace font for the seed input.

  That's fine.
- **Weights:** 700 (19 rules), 600 (8), 400 (4) and `normal` (1). Using 600 and 700 together for the same kind of label is drift.
- **Numerals:** Cormorant uses old-style figures, so:
  - "In the field (0)" reads as "(o)";
  - the top bar's "Week 1 · Year 1" reads as "Week ı · Year ı" (`contracts-mid.jpg`, `hall-week1.jpg`).

  The Hall subtitle shows the same date in Source Serif with lining figures, two lines below.

### 5.2 Sizes

There are **30 distinct font sizes**, plus three set inline in TSX (`1rem` twice in `Realm.tsx`, `1.05rem` in `Guide.tsx`). Grouped by intent, many are near-duplicates:

| Intent | Sizes in use |
|---|---|
| Micro labels | 0.6, 0.65, 0.68, 0.7, 0.72 |
| Tiny | 0.75, 0.76, 0.78 |
| Chip and meta | 0.8, 0.82, 0.85 |
| Small | 0.88, 0.9, 0.92, 0.95 |
| Body | 1 (and 16 px on the root) |
| Lead and labels | 1.05, 1.1, 1.15 |
| Section headings | 1.2, 1.3 |
| Sheet and card titles | 1.45, 1.5, 1.6, 1.7, 1.8 |
| Display | 2, 2.8, 3 |

- **One-offs:**
  - `.fac-badge` at 0.6;
  - `.j-line` at 0.95;
  - `.confirm-card h3` at 1.45;
  - `.attr-v` at 1.6;
  - `.event-card h2` at 1.7;
  - `.outcome h3` at 1.8.
- Seven steps would cover everything: 0.72, 0.8, 0.88, 1, 1.15, 1.3 and 1.7, with 2 and 2.8 for display.

### 5.3 Heading levels

There are two h3 styles:
- `.section-head h3`: 1.3rem, ink, used on the tabs;
- `.subhead`: 1.15rem, accent red, used in sheets.

The h4s also vary: `.week-head` and `.breakdown h4` are 1rem, while `.dispatch h4` is 1.05rem. The confirm card's title is an h3 at 1.45rem, larger than any section heading.

### 5.4 Number and unit formatting

| Thing | Forms in use |
|---|---|
| Crowns | `106◉`, `◉ 160` (planner header), a coin icon then `215` (cards), `52 crowns` (confirms), `15/wk` with a coin icon |
| Minus | `−106` (U+2212, ledger table) and `-217` / `-106` (hyphen: ledger grid, week report) |
| Weeks | `3w`, `4 wks left`, `~3 wk left`, `leaves in 2 wk`, `in 3 weeks`, `Takes 1 week`, `(2w away)` |
| Rates | `/wk`, `◉/week`, `a week` |
| Level | `Lv 3` (roster) and `Level 3` (member sheet) |
| Odds | `27%–66%`, rebuilt by hand in the planner footer and `OddsPill` instead of using `chanceText` |
| Plurals | `1 squad(s) return…`, `dispatch(es)`, `week(s)` in Hall alerts |

**There are also two week-numbering systems.** The calendar shows the week of the season ("Winter · Week 8 · Year 1"). These use the absolute week (44):
- "Away · back wk 47" on the roster;
- "truce until week 50";
- "Week 17: The Chandler Owes" in the service record;
- "Week 16: people tell…" in the fame block;
- the Council's past votes.

A player can't connect week 47 to "Winter, week 11".

### 5.5 Line length

On a phone, body lines run 45–55 characters, which is comfortable. On wide screens, the 560 px column keeps them under about 80. Nothing to fix.

---

## 6. Recommendations, ranked

The ranking is value to a phone player weighed against effort. Effort is S (under an hour), M (a few hours) or L (a day or more, or it needs a mockup first). ⚡ marks a quick win. Visual changes (items 9, 15, 17 and 19) need the owner's approval of a mockup first, as the UI reviewer's brief asks.

| # | Recommendation | Value | Effort | Why |
|---|---|---|---|---|
| 1 ⚡ | **Fix the Guard icon.** Add `guard` to both order icon maps, using the existing `guards` drawing. | High | S | It's a bug: one order, two wrong icons. |
| 2 ⚡ | **Confirm every purchase.** Add `confirm()` to supplies, shop items, materials and crafting, and make the supply buttons `Btn` with a `blocked` reason. | High | S | House rule. It's also the only place a misclick spends money silently. |
| 3 ⚡ | **Weekly orders at the top of the member sheet,** just under vitals. Move approach scores and the service record below gear. | High | S | It's the most-used part of the sheet and currently the last. It saves a long scroll every time. |
| 4 ⚡ | **Make the End Week bar's "N to check" open the warnings, and make Hall alerts tappable** (low supplies opens the Armory, a loan payment scrolls to Debt, a story contract opens its planner). | High | S | It turns warnings into one-tap routes. |
| 5 ⚡ | **Lining numerals on the display font** (`font-variant-numeric: lining-nums` on `.topbar .date` and headings). | Medium | S | It removes "(o)" and "Year ı" in one line of CSS. |
| 6 ⚡ | **Move the toast** to sit above the End Week bar, or inside the sheet footer when a sheet is open. | Medium | S | It currently covers the first lines of every sheet. |
| 7 | **"Best squad" button in the planner** that selects the squad `useBestOdds` already found. The player can still change it. | High | M | A three-person contract drops from 6 taps to 4. It's the core loop. |
| 8 | **Buy supplies from the planner.** When supplies are short, the footer shows "Buy N supplies · X◉", with a confirmation, instead of a dead button. | High | M | It saves about 7 taps and keeps the squad. |
| 9 | **Split the warning amber from the gold.** Keep gold for Story only. Make rewards, hints, the speaker, records, pips, the XP bar and badges neutral ink. | High | M | It brings back the meaning of amber (uncertain odds, moderate risk). Needs a mockup. |
| 10 | **Sub-tabs on the Realm** using the existing `Seg`: Council, Powers, Rivals, Debt. Put a dot on Rivals when a plan is revealed. | High | M | Rivals and Heat move from 3,700 px to the first screen of a tab. It's the same pattern as the Armory. |
| 11 | **Set weekly orders on the Roster row.** Tapping the order chip opens a short picker sheet without leaving the Roster. | High | M | Orders for six members drop from 19 taps to about 13, with no scrolling. |
| 12 | **Trim the Hall.** Show this week's and last week's dispatches, with "Older in the Journal". Put "Loan: X owed, Y due in N wk" in the ledger grid. Drop the repeated date. | Medium | M | The Hall goes from about ten screens to three, and the loan becomes visible at a glance. |
| 13 | **Contracts: board first when full.** Collapse in-field missions to a one-line row each (title, route dots, return week) that expands on tap. Hide "In the field" when it's empty. | Medium | M | In the late game the board is below the fold. |
| 14 | **Formatting helpers in `kit/format.ts`:** `crowns(n)`, `weeks(n)` and `signed(n)` with a real minus, plus plural-aware alert text. Use them everywhere. | Medium | M | It ends the 5 week forms, 4 crown forms and 2 minus signs. |
| 15 | **Take titles off the accent red.** Make screen and sheet titles and subheads ink, and keep accent for selection and primary buttons. | Medium | S–M | Most of the red on screen disappears, so the red that's left means something. Needs a mockup. |
| 16 | **Show dates, not absolute week numbers,** in readiness, truces, the service record, fame and Council history: "back in 3 wk", "Summer, wk 4". | Medium | S | One calendar, not two. |
| 17 | **Redraw the duplicate icons** in §3.1. Each meaning gets its own drawing, Renown and Story first, then Stealth/Shadow, Fire/Heat and Storm/Fatigue. Replace 💬 and the ✝ ↦ ▶ ▸ glyphs with icons. | Medium | L | One meaning per icon. Needs drawings and a mockup. |
| 18 | **Bigger tap areas** for tags, the hidden-tag ?, "Why?", matrix headers and link buttons. Pad the hit area with `::after` so the visual size stays the same. | Medium | S | Phone thumbs. The ? is a paid action. |
| 19 | **Type scale tokens** (`--fs-1` … `--fs-7`), replacing the 30 sizes, unifying the two h3 styles and settling on one bold weight. | Medium | M | It's a visual-only change, but it touches many rules. Needs a mockup. |
| 20 | **Badges on Roster and Hall.** Roster: new recruits this week or a wounded member. Hall: any bad alert. | Medium | S | It surfaces what currently needs a scroll to find. |
| 21 | **Labels for the resources.** Show a one-line label under each number for the first few weeks, or add a legend row to the Hall. | Low–Medium | S | Six bare icons are hard to learn. Tapping each one for a toast is slow. |
| 22 | **Drop the `--r-*` resource colors** where they remain (Armory and Realm headings, the cost chip), or add "resource tint" to the allowed list. | Low | S | Either finish retiring them or make them a rule. |
| 23 | **Show the routine supply drop as neutral** in the week report; keep red for an unplanned loss. | Low | S | A red chip every week teaches players to ignore red. |

### A name to decide

The Hall's loan section is titled **"Debt"**, and the Realm's crisis section is titled **"The Debt"**. These are different things. The story bible uses *the Debt* for the realm's crisis, so the Hall section is the one to change.

I propose **"The Loan"** for the Hall section. The alternative is "The Weighhouse Note", after the lender, which matches the confirm text "The Weighhouse returns your note". Nothing has been renamed; the owner decides.

### What I'd build first

The six quick wins (1–6) fit in one small pull request.

After that, these four change how the game feels on a phone:
- Best squad (7);
- supplies in the planner (8);
- Realm tabs (10);
- Roster orders (11).

The color work (9 and 15) should start with a mockup the owner can compare against the current screens.

## 7. What was built in v0.11.0

Everything in section 6 was built, plus the rename. Where the build differs from the recommendation, it says so.

- **1. The Guard icon.** Order icons now come from one map, `ORDER_ICON` in `kit/members.tsx`. Guard has its own drawing, a shield with a tick.
- **2. Purchases.**
  - Supplies, shop items, materials and crafting all ask for confirmation.
  - The supply buttons explain why when you can't afford them.
  - The planner's Dispatch and the Menu's Load and Import buttons explain why when they're blocked, instead of doing nothing.
- **3. The member sheet.** Weekly orders come straight after the vitals. Gear, approach scores and the service record follow.
- **4. Tappable warnings.**
  - "N to check" opens the warnings.
  - Hall alerts take you to the right place: the loan, the ledger, Heat, Contracts, the Armory, or a Story contract's planner.
  - Warning alerts show the warning icon, and info alerts show the info icon.
- **5. Numerals.** The display font uses lining numerals, so "(0)" and "Year 1" read correctly.
- **6. The toast.** In play it sits above the End Week bar. When a sheet is open it sits over the sheet's title. Taps pass through it.
- **7. Best squad.** A button beside the planner's Squad heading picks the squad the card's odds were worked out from.
- **8. Supplies in the planner.** When supplies are short, the footer offers "Buy N supplies · X◉" with a confirmation, and the squad stays picked.
- **9. Story gold.** Gold now appears only on Story contracts and Story news. Rewards, hints, the speaker, records, pips, the XP bar and badges are neutral, and notes ready to collect are green. *Change from the plan:* moving the decoration wasn't enough, because the two colors were still nearly the same. The warning tone moved toward orange: `#e8913a` dark, `#b8641a` light. The scale now reads gold (Story), then orange (warning), then red (bad).
- **10. Realm sub-tabs.** Council, Powers (with Heat), Rivals and The Debt. Council shows a dot when a decree has no stance, and Rivals shows a dot when a revealed plan hasn't been countered. The chosen tab is remembered, and the notes' "show me" opens the right one.
- **11. Orders from the Roster.**
  - Each idle member's row has an order chip that opens a short orders sheet.
  - A simple order closes the sheet. Train and Scout stay open for the second choice.
  - The row itself still opens the member.
- **12. The Hall.**
  - The repeated date is gone.
  - A loan line ("Loan: X owed · Y due in N weeks") sits under the ledger grid and scrolls to The Loan.
  - The feed shows this week and last week, with "Show older dispatches" for the rest. *Change from the plan:* the older news stays in the Hall behind that button rather than moving to the Journal, because the Journal's Chronicle holds only story news.
- **13. Contracts.** "In the field" is hidden when it's empty. Each squad is a one-line row with route dots: tap it to expand, or to read the journal once the mission is done. The Board doesn't move up to the top of the screen; with the rows this short, it doesn't need to.
- **14. Formatting.** These helpers live in `kit/format.ts`: `crowns`, `crownsDelta`, `num` (with a real minus), `wk`, `weeks`, `plural`, `shortDate` and `datedLine`. The UI uses them throughout. "Lv" is the level label everywhere.
- **15. Titles.** Screen, sheet, scene, confirm and Help titles are ink. The accent red is kept for selection, primary buttons and badges. The threat pips and the mission strip's current-stop marker (formerly a red dot) are neutral.
- **16. Dates.** Absolute week numbers are gone from the UI:
  - readiness says "back in 3 wk";
  - truces, the service record, fame and Council history use "Summer wk 5".

  Old save records are rewritten when they're displayed.
- **17. Icons.** New drawings for:
  - Stealth, a closed eye;
  - Heat, a thermometer;
  - Fatigue, an hourglass;
  - Story, a ribbon bookmark;
  - fame, a laurel;
  - Cold, icicles;
  - Night, stars;
  - Fireborn, a horned head;
  - Train and the Training Yard, a dumbbell;
  - Scout a contract, a spyglass;
  - the Ninth, a pennant;
  - Leather, a hide;
  - Build, bricks;
  - the Guildmaster's Notes, a checklist;
  - Arrears, a calendar;
  - Collection, a chest;
  - Investigation, a magnifier;
  - Smuggling, a crate;
  - Expedition, a map;
  - rival news, a mask;
  - talk choices, a speech bubble;
  - leaving the guild, an exit;
  - the theme toggle, a lamp.

  The ✝ ↦ ▶ ▸ ✓ glyphs and the 💬 emoji are now icons. Icon sizes are 12, 14, 18 and 24.
- **18. Tap targets.** Tags, "Why?", matrix headers, link buttons, resource chips and approach chips have a 44 px tall invisible hit area.
- **19. Type scale.** Nine tokens (`--fs-xs` to `--fs-hero`) replace the 30 sizes. The two h3 styles match, there's one bold weight (700), and the inline font sizes are gone.
- **20. Badges.**
  - Hall shows the number of bad alerts.
  - Roster shows the number of wounded members.

  *Change from the plan:* recruits have no arrival week in the save, so "new recruits this week" would need a save change. It was left out.
- **21. Resource labels.** In the first season, each top-bar chip names its resource under the number.
- **22. Resource colors.** The `--r-*` tokens are gone.
- **23. The week report.** The routine drop in supplies shows neutral. It turns red only when stores fall below two weeks' food.
- **The Loan.** The Hall section is now "The Loan", and the tutorial's directions say so.
- **Also fixed along the way:**
  - The hire confirmation worked out weekly costs with a hard-coded upkeep of 15. It now uses the real upkeep.
  - The end-week warnings no longer say "contract(s)" or "member(s)".

## Screenshots

All are in `docs/audits/ui-ux/`, at 390×844 and deviceScaleFactor 2, dark theme unless named.

| File | Shows |
|---|---|
| `hall-week1.jpg` | The notes card fills the first screen. Old-style numerals in the top bar. |
| `hall-mid.jpg` | The Hall mid-game, with alert icons and the ledger |
| `hall-scroll-map.jpg` | The full Hall, with each screen height marked |
| `realm-top.jpg`, `realm-scroll-map.jpg` | The Council fills the first screens. Rivals are on screen 6. |
| `contracts-mid.jpg`, `contracts-light.jpg` | Gold Story vs amber odds, in both themes. "(o)" for zero. |
| `contracts-late.jpg` | In-field cards push the Board below the fold |
| `planner-squad.jpg` | Red selection outlines, the sticky footer, the dead Dispatch button |
| `roster-mid.jpg` | The roster rows |
| `member-top.jpg`, `member-bottom-guard-icon.jpg` | The member sheet's order. "Guard the hall" with the ⓘ icon. |
| `armory-shop.jpg` | Red price buttons, no confirmation on supplies |
| `scene-week1.jpg` | The opening scene. The choices start below the fold. |
| `endweek-toast-covers-warning.jpg` | The toast hides the only warning |
| `week-report.jpg` | Two-line title, red routine supplies, hyphen minus |
| `icon-collisions.jpg` | Every duplicate and look-alike icon, drawn from `icons.tsx` |
