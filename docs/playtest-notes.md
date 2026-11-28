# Playtest notes: reading what the owner sends

The owner leaves notes during play with the in-game Note button and sends them to main by copying or sharing them. This page says what a note holds and how main reads one.

## Where the notes come from

- **Menu › Display › Playtest notes** turns the Note button on. It's off by default, and nothing shows while it's off.
- The Note button is a small tab on the left edge of the screen. It sits above every screen, panel, scene and confirmation, and can be dragged up or down. Tapping it opens a note over whatever is on screen, so the game waits. Save keeps the note, Cancel throws it away, and Back keeps the draft for later.
- **Menu › Open the notes** lists them. Each can be edited or deleted. Copy all puts every note on the clipboard as Markdown, and Share sends the same text through the phone's share menu. The third button shares it as a `.md` file, or saves the file where the browser can't share one. Delete all asks first.
- The notes live in `localStorage` under `lab.playtest`, apart from the game and its saves. No save bump was needed, and clearing notes never touches a game.
- Code: `src/ui/playtest/` (`notes.ts` for storage and the Markdown, `context.ts` for what a note records, `PlaytestLayer.tsx` for the button and the note sheet) and `src/ui/sheets/PlaytestSheet.tsx` for the list.

## What a pasted note looks like

```markdown
## Note 2 · Week 14 · v0.17.0

- **Written:** 2026-11-28 21:40
- **In game:** Spring · Week 2 · Year 2
- **Screen:** Contracts
- **Open:** Prep: `contract:varrow_dogs` “The Warehouse Dogs” › Member: Hild Mercer
- **Contract:** `contract:varrow_dogs` “The Warehouse Dogs”, 305 crowns, threat 4, `site:varrow` medium, squad 2–4, expires week 16
- **Plan:** squad 1. Garrick Gant (Vanguard), 2. Hild Mercer (Skirmisher); pack food 4, oil 6; orders retreat steady, heal worst, wanderers avoid, camp sites, supplies sparingly
- **Treasury:** 412 crowns, weekly costs 61; Supplies 40, Intel 3, Influence 5, Renown 9, Heat 12
- **Loan:** 45 due week 18 (in 4 wk) to weighhouse, 610 owed
- **Next Date:** `date:exchequer_list`, in 4 weeks
- **Away:** squad 1 on `contract:tax_escort`, home week 15
- **Roster:** 5 (3 home, 1 away, 1 recovering): Garrick Gant (Vanguard 2, 100%, home); …
- **Scene:** `charter/root` “A Charter and a Debt”

> The Exchequer's seal is still warm on your charter. …

- **Choices shown:**
  1. Let Jory show you round
  2. Skip the tour

**Note:**

The owner's words.

<details><summary>Save code (Menu › Transfer › Import)</summary>
…
</details>
```

Lines appear only when they apply: **Open** when a panel is open, **Contract** and **Plan** when a prep sheet is open, **Scene** when a scene is on screen, and the save code when the owner turned on "Attach the save code to new notes".

## Reading it

- **Version** is in the heading. If it's older than `main`, check `CHANGELOG.md` first; the thing noted may be fixed already.
- **Screen** is the tab, with the Realm or Armory sub-tab after `›`. **Open** is the stack of panels from bottom to top, the last being the one on screen. Without a game it says `Title`.
- **IDs** follow `docs/story/README.md`:
  - a scene is `scene/node`; the scene id is the part before the slash (search `id: 'charter'` in `src/engine/data/`), and the node is a key of its `nodes`, or `root`;
  - choices are listed by the labels shown, in the order shown. A choice the player can't afford is still listed. They're not `cN` IDs, because a scene can hide choices, so find the choice by its label;
  - `contract:<templateId>`, `site:<id>` and `date:<id>` are the same IDs the story export uses.
- A scene marked **(ended, waiting for Continue)** shows the node the player answered, then the last choice and its reply: the ending they were reading.
- **Plan** is the plan as it stood in the prep sheet, unsent. Squad numbers are ranks, front first. Pack and orders use the engine's ids (`ExpPlan` in `src/engine/expeditions/types.ts`).
- **Loan** and **Treasury** are the numbers the top bar showed. Lenders are faction ids.

## Loading the exact moment

When a note carries a save code:

1. Copy the long string between the ```` ``` ```` fences under "Save code".
2. **In the game:** Menu › Transfer, paste it into "Paste a save here to import", then Import. The game opens at the Hall of that week. Panels aren't saved, so reopen the one the note names in **Open**.
3. **In a script or test:** the code is the menu's export format, base64 of the `GameState` JSON. `importSave(code)` in `src/store.ts` decodes and migrates it, so an older save still loads:

   ```ts
   import { importSave } from '../src/store';
   const g = importSave(code)!; // then advanceWeek(g), resolveEvent(g, uid, i), …
   ```

   Outside the app, `JSON.parse(Buffer.from(code, 'base64').toString('utf8'))` gives the raw state, before migration.

A save code is 25 to 100 KB of text. If a pasted note was cut short, ask the owner to share the `.md` file instead.
