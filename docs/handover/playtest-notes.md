# Hand-over: playtest notes (claude/playtest-notes, v0.17.0)

The owner asked to "pause the game and leave comments that you can read... share my thoughts as I see things happen in real time and with real context during play." They chose the share menu, and no separate playtest copy of the game.

## What was done

- **The switch.** Menu › Display has a "Playtest notes" row, off by default. When it's off, nothing shows.
- **The Note tab.** A small tab on the left edge, above every screen, panel, scene and confirmation (z-index 85).
  - It can be dragged up or down, and remembers where it was left.
  - It stays between the top bar and End Week. The clamp uses `--safe-top` and the bottom safe area, so it holds on notched iPhones.
  - It hides while the notes list is the top panel, where it covered text.
  - It shows on the title screen and the game-over screen too.
- **The note sheet.** Tapping the tab opens a full-height sheet over everything (z-index 90). The game waits behind it.
  - Save keeps the note, and Cancel discards it.
  - Back, swipe-down or a tap on the backdrop keeps the draft for later. A kept draft keeps the moment it was started.
  - "What is saved with this note" shows the recorded context.
  - `Sheet` gained an `onBack` prop for panels outside the store's stack.
- **Context** (`src/ui/playtest/context.ts`). Each note records:
  - version, real time, week and in-game date;
  - the tab and sub-tab, and the stack of open panels;
  - for a scene: `scene/node`, title, speaker, text and the choices shown, or the ending if the scene is waiting for Continue;
  - for a prep sheet: the contract (`contract:id`, `site:id`) and the unsent plan, which `PrepSheet` reports through `livePlans`;
  - treasury and resources, loans, the next Date (`date:id`), squads away, and the roster in brief.
- **The list** (`src/ui/sheets/PlaytestSheet.tsx`, menu › Open the notes).
  - Each note can be edited or deleted (with confirmation).
  - Copy all copies the notes as Markdown.
  - Share uses `navigator.share` with the text.
  - Share as .md file sends a file, or downloads it where file sharing isn't supported.
  - Delete all asks first.
  - "Attach the save code to new notes" (off by default) stores the menu's existing export string (`exportSave`) with each new note. It loads through Menu › Transfer › Import.
- **Storage.** `localStorage['lab.playtest']`, apart from `GameState`, so there was no save bump. If storage is full, the note sheet and the list both say so.
- **Docs.** `docs/playtest-notes.md` covers how main reads a pasted note and loads its save. `docs/ARCHITECTURE.md` lists `src/ui/playtest/`.

## What was checked

- **`npm run check`:** 91 tests, 4 of them new in `tests/playtest.test.ts`:
  - the context over the prep sheet with its plan;
  - a scene ID and its choices;
  - the Markdown order, with a save code that round-trips through `importSave`;
  - the title screen.
- **Other tools:** the story checker reports 0 violations and 0 unreached, and style flags stay at 40, as on main. `npm run build` is clean.
- **Fingerprint:** `0f8f0a72…3754`, the same as main. The engine is untouched.
- **Playwright (Chromium):** 360 and 390 px, both themes. Covered: the tab over a scene and over the prep sheet; the note sheet over a scene, the prep sheet and a confirmation; the notes list; Copy all, read back from the clipboard; Delete all's confirmation. There were no console errors.
- **Previews:** `docs/previews/v0.17.0/`.
- **Reviewers:**
  - The UI reviewer fixed the notch clamp and the "Note saved." toast, which was hidden over scenes and confirmations. It also hid the tab on the list.
  - The writing reviewer rewrote the labels and toasts. Its notes on the context labels were applied: consistent panel names on the title screen, "(in N wk)", and a distinct name for the Guildmaster's Notes.

## What's open

- **Not tried on a real phone.** Untested: the iOS share sheet (text and file), the clipboard in an installed PWA, tap against drag on the tab, and the on-screen keyboard covering Save and Cancel (other sheets with text fields do the same).
- **The tab covers about 14 px of panel content** at its height. The owner can drag it away. A narrower or fading tab would need a mockup and the owner's say.
- **The tab is 30 px wide**, under the usual 40 px tap target. It's on the screen edge, which helps.
- **Cancel with text discards without asking.** A confirmation would sit under the note sheet (z-index 80 against 90), so it would need its own dialog. That was left as is for a dev tool.
- **Save codes are 25 to 100 KB each.** Many notes with codes can fill storage. The UI says so when it happens.
