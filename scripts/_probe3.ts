import { advanceWeek, dispatchExpedition, generateContract, newGame, resolveEvent, suggestPlan, type GameState } from '../src/engine';
import { TEMPLATE_BY_ID } from '../src/engine/data/contracts';
const clear = (s: GameState) => { while (s.pendingEvents.length) resolveEvent(s, s.pendingEvents[0].uid, 0); };
const s = newGame(11);
clear(s);
const l = s.loans[0];
console.log('due wk', l.dueWeek, 'pay', l.paymentDue, 'principal', Math.round(l.principal));
while (s.week < l.dueWeek) { clear(s); advanceWeek(s); }
clear(s);
const c = generateContract(s, TEMPLATE_BY_ID['pellam_deep']); s.board.push(c);
console.log(dispatchExpedition(s, c.id, suggestPlan(s, c)) ?? 'sent', 'return', s.missions[0]?.returnWeek, 'week', s.week);
clear(s);
const real = s.crowns; s.crowns = 5;
for (let i = 0; i < 6; i++) {
  const n = s.dispatches.length; advanceWeek(s); clear(s);
  console.log('wk', s.week - 1, s.dispatches.slice(n).map((d) => d.title).filter((t) => /Weigh|loan|Loan|Missed/.test(t)).join('; '), 'dueWeek', s.loans[0].dueWeek, 'missed', s.loans[0].missed);
  if (i === 0) s.crowns = Math.max(s.crowns, 5);
}
console.log('real crowns were', real);
