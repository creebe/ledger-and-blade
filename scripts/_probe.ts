import { advanceWeek, cancelDispatch, dispatchExpedition, generateContract, newGame, resolveEvent, suggestPlan, type GameState } from '../src/engine';
import { TEMPLATE_BY_ID } from '../src/engine/data/contracts';
const clear = (s: GameState) => { while (s.pendingEvents.length) resolveEvent(s, s.pendingEvents[0].uid, 0); };

// 1. Reroll via cancel: returnWeek leak
{
  const s = newGame(7);
  clear(s);
  const c = generateContract(s, TEMPLATE_BY_ID['pellam_salts']); s.board.push(c);
  const crowns0 = s.crowns;
  const seen: string[] = [];
  for (let i = 0; i < 12; i++) {
    const plan = suggestPlan(s, c);
    const err = dispatchExpedition(s, c.id, plan);
    if (err) { console.log('err', err); break; }
    const ms = s.missions[s.missions.length - 1];
    seen.push(`${ms.returnWeek - ms.dispatchedWeek + 1}/${ms.plannedWeeks} ${ms.result.outcome} goal=${ms.result.goalMet}`);
    if (s.pendingEvents.length) { seen.push('door scene'); break; }
    const e2 = cancelDispatch(s, ms.id);
    if (e2) { seen.push('cancel: ' + e2); break; }
  }
  console.log('reroll:', seen.join(' | '), 'crowns', crowns0, '->', s.crowns);
}

// 2. Loan deferral: keep a squad out, stay poor on payment day
{
  const s = newGame(11);
  clear(s);
  const loan = s.loans[0];
  console.log('loan due', loan?.dueWeek, loan?.paymentDue, 'crowns', s.crowns);
  let payments = 0, missed = 0, waits = 0;
  for (let w = 0; w < 30; w++) {
    clear(s);
    const out = s.missions.filter((m) => !m.report).length;
    if (out < 1) {
      const c = generateContract(s, TEMPLATE_BY_ID['pellam_streets']); s.board.push(c);
      const p = suggestPlan(s, c); p.pack = {};
      dispatchExpedition(s, c.id, p); clear(s);
    }
    // stay poor on the day: park money elsewhere
    const keep = s.crowns; if (s.loans[0]?.dueWeek === s.week) s.crowns = Math.min(s.crowns, s.loans[0].paymentDue - 1);
    const before = s.dispatches.length;
    advanceWeek(s);
    if (s.gameOver) { console.log('over', s.gameOver.reason); break; }
    s.crowns = Math.max(s.crowns, keep - 60);
    for (const d of s.dispatches.slice(before)) { if (d.title === 'The Weighhouse waits') waits++; if (d.title === 'Loan payment made') payments++; if (d.title.startsWith('Missed')) missed++; }
  }
  console.log('30 weeks: waits', waits, 'payments', payments, 'missed', missed, 'loan missed', s.loans[0]?.missed);
}

// 3. Kiln contract after the Kiln is broken
{
  const s = newGame(3);
  s.delve.kilnBroken = true;
  const c = generateContract(s, TEMPLATE_BY_ID['pellam_kiln']); s.board.push(c);
  for (const m of s.members) { m.level = 5; }
  const err = dispatchExpedition(s, c.id, suggestPlan(s, c));
  const ms = s.missions[0];
  console.log('kiln after break:', err ?? '', ms?.result.outcome, 'goalMet', ms?.result.goalMet);
}
