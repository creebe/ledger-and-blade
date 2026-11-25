import { advanceWeek, dispatchExpedition, generateContract, newGame, resolveEvent, suggestPlan, type GameState } from '../src/engine';
import { TEMPLATE_BY_ID } from '../src/engine/data/contracts';
const clear = (s: GameState) => { while (s.pendingEvents.length) resolveEvent(s, s.pendingEvents[0].uid, 0); };
const s = newGame(11);
let waits = 0, paid = 0;
for (let w = 0; w < 40 && !s.gameOver; w++) {
  clear(s);
  if (!s.missions.some((m) => !m.report && m.dispatchedWeek + m.plannedWeeks - 1 > s.week)) {
    const c = generateContract(s, TEMPLATE_BY_ID['pellam_streets']); s.board.push(c);
    const p = suggestPlan(s, c); 
    const e = dispatchExpedition(s, c.id, p); clear(s);
    if (e) console.log('wk', s.week, e);
  }
  const l = s.loans[0];
  let stash = 0;
  if (l && l.dueWeek === s.week) { stash = Math.max(0, s.crowns - Math.min(l.paymentDue - 1, 60)); s.crowns -= stash; }
  const n = s.dispatches.length;
  advanceWeek(s);
  s.crowns += stash; // e.g. held as gear and sold back later, or simply spent on stores
  for (const d of s.dispatches.slice(n)) { if (d.title === 'The Weighhouse waits') waits++; if (d.title === 'Loan payment made') paid++; if (d.title.startsWith('Missed')) console.log('missed wk', s.week); }
}
console.log('weeks', s.week, 'waits', waits, 'paid', paid, 'missed', s.loans[0]?.missed, 'due', s.loans[0]?.dueWeek, s.gameOver?.reason);
