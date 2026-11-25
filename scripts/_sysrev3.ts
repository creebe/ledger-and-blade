import { newGame } from '../src/engine';
import { refreshBoard } from '../src/engine/economy/board';
import { MONSTERS } from '../src/engine/expeditions/data/content';
// how often a site's boss posting is back on the board within 5 weeks of the last one being taken
let taken = 0, back = 0, wk1 = 0;
for (let g = 0; g < 300; g++) {
  const s = newGame(500 + g);
  if (s.board.some((c) => c.expedition.goal.kind === 'kill' && MONSTERS[c.expedition.goal.monster].boss && c.expedition.site !== 'pellam')) wk1++;
  let out: { site: string; until: number } | undefined;
  for (let w = 1; w <= 40; w++) {
    s.week = w;
    refreshBoard(s);
    const bossPosts = s.board.filter((c) => c.expedition.goal.kind === 'kill' && MONSTERS[c.expedition.goal.monster].boss);
    if (out && w <= out.until && bossPosts.some((c) => c.expedition.site === out!.site)) { back++; out = undefined; }
    if (out && w > out.until) out = undefined;
    if (!out && bossPosts.length) { const c = bossPosts[0]; s.board = s.board.filter((x) => x !== c); taken++; out = { site: c.expedition.site, until: w + 5 }; }
  }
}
console.log(`games with a non-Pellam boss posting on the week-1 board: ${wk1}/300; boss posting taken ${taken} times, same boss back on the board while the first squad is out: ${back} (${(back / taken * 100).toFixed(0)}%)`);
