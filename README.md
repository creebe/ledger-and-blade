# Ledger & Blade (working title)

A turn-based, portrait-first guild management sim. The realm owes a fortune to a foreign bank, everyone needs a blade, and you have to keep your own books balanced while you supply it.

- **Play:** https://creebe.github.io/ledger-and-blade/ (once GitHub Pages is enabled; see below). Installable to your phone's home screen and works offline.
- **Design:** [docs/DESIGN.md](docs/DESIGN.md)

## Status: M1 vertical slice

Playable now:
- Weekly turn loop with a ledger, upkeep, supplies, a Weighhouse loan, and a 4-week cash projection
- Named members with Professions, attributes, traits, health, fatigue, morale, loyalty, levels and permadeath
- Contract board with patrons, threat, known and hidden tags, and rival-contested jobs
- Squad planner: per-phase approaches (Assault, Stealth, Guile, Endurance, Arcana), live odds with ranges for unscouted tags, and full score/difficulty breakdowns
- Gear: weapons with damage types and elements, armor weight, trinkets and consumables that counter tags
- Missions with travel time that run concurrently, phase-by-phase resolution, and an animated strip-map report
- Intel (rumors, scouting, revealing tags and rival plans), market with fluctuating prices, recruitment, training
- Four factions (Exchequer, Weighhouse, Ostrander's, Lower Town), Heat, the four Debt clocks, and the rival Hobb & Daughters
- Act I story beats (first ~12 weeks), random events, fail states, autosave + 3 save slots + text export

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # engine unit tests
npm run sim        # headless balance simulation (bot plays many games)
npm run build      # typecheck + production build
```

The simulation lives in `src/engine/` (pure TypeScript, deterministic seeded RNG, no UI). Content is data in `src/engine/data/`. The React UI is in `src/ui/`.

## Deployment

`.github/workflows/deploy.yml` tests, builds and deploys to GitHub Pages on every push to `main`. One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
