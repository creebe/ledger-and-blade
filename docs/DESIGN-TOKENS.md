# Design tokens: the decided look

This is the record of how Ledger & Blade looks and why. The owner reviewed it on 2026-11-24. Every value below is a decision, not a default.

- **Where the values live:** the `:root` blocks at the top of `src/styles.css`.
- **What guards them:** `tests/theme.test.ts`, which fails if the two copies of the dark theme drift apart, or if any text pairing below drops under 4.5:1.

**To change a token:**
- change it here and in `styles.css` in the same pull request;
- run `npm test`;
- get the owner's yes.

## 1. The idea

A guild ledger kept by candlelight. Paper, ink and one red, with gold for the story. Everything else is neutral, so the few colors that remain carry meaning (`CLAUDE.md`, "Color is reserved for meaning").

## 2. Surfaces and ink

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | #efe5cf | **#17130f** | The page |
| `--paper` | #f8f1e1 | #221c16 | Cards, sheets, the top bar |
| `--paper-2` | #f2e8d2 | #2a231c | Chips, segmented controls, inset areas |
| `--line` | #d8c7a6 | #3d3329 | Borders and rules |
| `--ink` | #2b2118 | #efe3cc | Main text |
| `--ink-2` | #5e4f3f | #cdbd9f | Secondary text, neutral icons and bars |
| `--muted` | #726351 | #9a8a72 | Notes, labels, small print |

**Why the dark background is #17130f.**
- It's a warm near-black with a little brown in it, the color of an unlit hall rather than a screen. Pure black would look harsh next to the cream ink and smear on OLED phones when scrolling.
- A blue-grey dark would fight the parchment palette.
- The browser's theme color (`index.html` and `kit/theme.ts`) matches it, so the phone's status bar blends in.

**Why the surfaces are so close.**
- Page and card differ by only about 1.1:1 in both themes. Cards are told apart by their border and shadow, not by a lighter fill, which keeps the screen calm.
- This is deliberate. Don't raise the contrast between surfaces without the owner's say.

**Why `--muted` changed.** In the light theme, muted text sat at 3.6:1 and was hard to read in sunlight. It moved from #86745f to #726351, which keeps the same hue at 4.6:1.

## 3. Meaning colors

Contrast is against `--bg` / `--paper`. Every text color is at least 4.5:1 on both.

| Token | Light | Contrast | Dark | Contrast | Means |
|---|---|---|---|---|---|
| `--accent` | #8c2f1e | 6.6 / 7.3 | #d2664d | 5.1 / 4.6 | Selection and the active tab: red text and outlines |
| `--gold` | #7e6018 | 4.7 / 5.2 | #d2a63f | 8.2 / 7.4 | Story contracts and story news, nothing else |
| `--good` | #397136 | 4.7 / 5.2 | #6fb36a | 7.3 / 6.7 | Good states, gains, targets met |
| `--mid` | #9a4f10 | 4.8 / 5.3 | #e8913a | 7.5 / 6.9 | Warnings, uncertain odds, "this week" |
| `--bad` | #a8203a | 5.7 / 6.4 | #e06a4f | 5.6 / 5.1 | Bad states, losses, danger |

**Accent: two reds.**
- The filled red is `--accent-fill`: #8c2f1e in light, **#a8432d** in dark. It's used for primary buttons, End Week and badges, always with light text (`--accent-fill-ink`, #fff8ec). That's 7.8:1 in light and 5.7:1 in dark.
- Red as text or outline stays `--accent`. In the dark theme it moved from #c4553c to #d2664d so it reads on cards.
- Before the split, dark buttons had dark text on a bright red at 4.1:1.

**Gold against orange.** Gold (yellow) means Story. Orange (`--mid`) means a warning. Red means bad. The three are kept apart in hue so a Story card never looks like a risky one. In the light theme, gold moved from #a07a1f to #7e6018, and green from #3d7a3a to #397136, so both pass 4.5:1 as text.

**`--info`** is nearly retired: alerts and tags now use neutral colors. Don't use it for new things.

## 4. Color families with a fixed use

These are icon or badge colors, never text colors, so they're held to 3:1, not 4.5:1.

- **Approaches** (`--ap-*`): the five approaches, used on their icons, chips and the strength matrix.
- **Elements** (`--el-*`): element badges on items.
- **Resources and materials** (`--res-*`): crowns, supplies, Intel, Influence, Renown and Heat, plus Iron, Leather, Timber and Reagents. Used on icons only. A number next to one keeps its good, warning or bad color.
- **Factions and rivals**: their dots and sigils, defined in the engine data (`FACTIONS`, `RIVALS`).

## 5. Typography

**Faces.**
- **Source Serif 4** for everything you read: body text, labels, numbers. It's a sturdy text serif with an optical-size axis (loaded 8–60), so small labels stay open and large text stays crisp.
- **Cormorant Garamond** for display: screen and sheet titles, section heads, card titles, the date. It brings the old-book feel. It's only ever used at heading sizes, where its fine strokes survive.

**What's loaded (`index.html`).**
- Source Serif 4: 400, 600, and 400 italic.
- Cormorant Garamond: 600 and 700.

Nothing else is loaded. Asking for any other weight or style makes the browser fake it.

**Weights.**
- Bold text in the body face is **600** (`--fw-bold`): `b`, `strong`, button labels, numbers.
- Display headings are **700** (`--fw-display`).
- Regular is 400.
- These two tokens replaced the old 700 that the body face had no file for.

**Italic.** It's used for contract descriptions, street talk ("Heard in Varrow"), empty states and the "On the Debt" lines. The body face's real italic is loaded, so it's no longer a slanted fake.

**Size scale.** Nine tokens; don't add sizes outside them.

| Token | Size | Used for |
|---|---|---|
| `--fs-xs` | 0.72rem | Tiny labels, badges, resource labels |
| `--fs-s` | 0.8rem | Chips, meta lines, tags |
| `--fs-m` | 0.88rem | Small text, notes, buttons |
| `--fs-body` | 1rem (16px) | Body text |
| `--fs-lead` | 1.15rem | Lead lines, card titles, the date |
| `--fs-h3` | 1.3rem | Section heads, Date titles |
| `--fs-h2` | 1.5rem | Sheet and scene titles |
| `--fs-h1` | 2rem | Screen titles |
| `--fs-hero` | 2.8rem | The title screen |

**Line height.** Body text uses 1.4. Headings use 1.15, and small stacked labels 1.1. The body line is kept short on purpose, because phone columns run 45–55 characters.

**Numerals.** The display face uses lining numerals (`font-variant-numeric: lining-nums`), because its default old-style figures make 0 read as "o" and 1 as "ı". Tables and the ledger use tabular numerals so the columns line up.

**Letter spacing.** Only small uppercase kickers ("NEXT DATE") are spaced, at 0.05–0.1em. The resource labels in the first season are tightened (−0.03em) so "Influence" fits at 360 px.

## 6. Shape

| Token or value | What |
|---|---|
| `--radius` (12px) | Cards |
| 8–10px | Chips and controls |
| 999px | Pills |
| `--shadow` | Raises tappable cards only. Static panels are flat (`CLAUDE.md`). |

## 7. When adding something new

- Use an existing token. A new color needs a meaning that isn't covered, a light and a dark value, and the owner's yes.
- Text colors must reach 4.5:1 on `--bg` and `--paper` in both themes. Add them to `tests/theme.test.ts`.
- Put new dark values in **both** dark blocks in `styles.css`, the `prefers-color-scheme` one and the `[data-theme='dark']` one. The test checks they match.

## 8. Alternatives considered

On 2026-11-24 the owner compared the current look with three full alternatives, rendered on the real Hall and Contracts screens in both themes. The images are `docs/previews/v0.12.2/alternatives-*.jpg`. **The owner kept the current look.**

| Set | Faces | Palette | Why it was passed over |
|---|---|---|---|
| 1. Candlelit ledger (kept) | Source Serif 4 / Cormorant Garamond | Warm brown, cream ink, one red | — |
| 2. Old print | EB Garamond / IM Fell English | Oxblood and bone | The most period feel. Small text is harder to read on a phone, and IM Fell has only old-style numerals, so a 1 looks like ı. |
| 3. Slate & brass | Alegreya / Alegreya SC | Cool blue-grey with brass | A colder, more official mood. Small-caps headings shout, and it loses the candlelit warmth. |
| 4. Modern guild | Source Sans 3 / Fraunces | The current palette | The easiest to read, but a sans body text makes the game feel like an app rather than a ledger. |

The **Heat** icon was chosen the same way. The owner went through three rounds of drawings (a thermometer, a lantern, a rising chart, then six more) and picked the **gauge**, a dial creeping toward the red.
