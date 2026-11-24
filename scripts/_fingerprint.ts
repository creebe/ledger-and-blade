// Prints a fingerprint of game behaviour: identical output before and after a refactor means nothing changed.
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
