import { advanceWeek, buildSetup, expeditionOdds, newGame, runExpedition } from '../src/engine';
import type { GameState } from '../src/engine';
import { botTurn } from './sim';
for (let g = 0; g < 40; g++) {
  const s: GameState = newGame(5003 + g * 7717);
  for (let w = 0; w < 40 && !s.gameOver; w++) {
    const snap = JSON.parse(JSON.stringify(s)) as GameState;
    const before = new Set(s.missions.map((m) => m.id));
    botTurn(s, { minChance: 0.35 });
    for (const ms of s.missions.filter((m) => !before.has(m.id))) {
      const c = snap.board.find((x) => x.id === ms.contract.id); if (!c) continue;
      if (!['What the Sea Brings'].includes(c.title)) continue;
      const o = expeditionOdds(s, c, ms.plan, 120)!;
      if (!o || o.cases.length !== 1 || o.goal.min < 0.3) continue;
      const a = JSON.parse(JSON.stringify(ms.setup));
      const fresh = buildSetup(s, ms);
      const diff = (x: any, y: any, p = ''): void => { if (typeof x !== 'object' || x === null) { if (JSON.stringify(x) !== JSON.stringify(y)) console.log('  ', p, JSON.stringify(x), '->', JSON.stringify(y)); return; } for (const k of new Set([...Object.keys(x), ...Object.keys(y ?? {})])) diff(x[k], y?.[k], p + '.' + k); };
      console.log(c.title, 'g', g, 'w', w, 'est', o.goal.min, 'door/extra', ms.extraTags, ms.foeScale, a.fieldLog);
      diff({ ...a, seed: 0 }, { ...fresh, seed: 0 });
      let m = 0; for (let i = 0; i < 200; i++) if (runExpedition({ ...fresh, seed: i * 99991 + 7 }, { quiet: true }).goalMet) m++;
      console.log('  fresh-at-dispatch over 200 seeds', m / 200);
      advanceWeek(s);
      console.log('  sealed diffs vs dispatch:'); diff({ ...fresh, seed: 0 }, { ...ms.setup, seed: 0 });
      process.exit(0);
    }
    advanceWeek(s);
  }
}
