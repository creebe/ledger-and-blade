# Ledger & Blade (working title)

A turn-based, portrait-first guild management sim. The realm owes a fortune to a foreign bank, everyone needs a blade, and you have to keep your own books balanced while you supply it.

- **Play:** https://creebe.github.io/ledger-and-blade/ (once GitHub Pages is enabled; see below). Installable to your phone's home screen and works offline.
- **Design:** [docs/DESIGN.md](docs/DESIGN.md) · **Story bible:** [docs/STORY.md](docs/STORY.md) · [Story coverage report](docs/reports/story-coverage.md) · [Sample playthroughs](docs/playthroughs/README.md)

## Status

Version and history: [CHANGELOG.md](CHANGELOG.md). What's next: [BACKLOG.md](BACKLOG.md). How the code is laid out: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Working on it with Claude: [CLAUDE.md](CLAUDE.md).

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # engine unit tests
npm run sim        # headless balance simulation (bot plays many games)
npm run story      # story checker: writes docs/reports/story-coverage.md
npm run playthroughs  # readable full-game transcripts in docs/playthroughs/
npm run build      # typecheck + production build
```

The simulation lives in `src/engine/` (pure TypeScript, deterministic seeded RNG, no UI). Content is data in `src/engine/data/`. The React UI is in `src/ui/`.

## Deployment

`.github/workflows/deploy.yml` tests, builds and deploys to GitHub Pages. It runs only when started manually (Actions tab → "Test & deploy to GitHub Pages" → Run workflow); pushes do not trigger it. One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
