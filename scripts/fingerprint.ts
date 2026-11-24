// Behaviour fingerprint: plays 40 seeded games for 60 weeks with the balance bot
// and hashes the final states. Run it before and after a refactor: an identical
// hash means the game behaves exactly the same. Any change to rules, content or
// randomness will (rightly) change it.
import { createHash } from 'node:crypto';
import { advanceWeek, newGame } from '../src/engine';
import { botTurn } from './sim';
const h = createHash('sha256');
for (let g = 0; g < 40; g++) {
  const s = newGame(123 + g * 7919);
  for (let w = 0; w < 60 && !s.gameOver; w++) {
    botTurn(s, { minChance: 0.55 });
    advanceWeek(s);
  }
  h.update(JSON.stringify(s));
}
console.log(h.digest('hex'));
