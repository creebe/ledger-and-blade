import { advanceWeek, migrateSave, newGame, resolveEvent, type GameState } from '../src/engine';
const clear = (s: GameState) => { while (s.pendingEvents.length) resolveEvent(s, s.pendingEvents[0].uid, 0); };
const s = newGame(5) as any;
clear(s);
const [a, b] = s.members;
const c = { ...s.board[0] }; delete c.expedition;
// a classic mission that has resolved (report set) and is on the road home
s.missions = [{ id: 'm1', contract: c, memberIds: [a.id, b.id], dispatchedWeek: 1, arriveWeek: 2, returnWeek: 3, approaches: [], report: { tier: 'Success', phases: [], casualties: [], wounded: [], reward: 50, materials: {}, summary: [] } }];
s.week = 2;
for (const m of [a, b]) { m.status = 'mission'; m.missionId = 'm1'; }
s.version = 12; delete s.stores; delete s.goods; delete s.delve;
const g = migrateSave(JSON.parse(JSON.stringify(s)))!;
for (let i = 0; i < 4; i++) { clear(g); advanceWeek(g); }
console.log('week', g.week, 'missions', g.missions.length, 'history', g.history.length, g.members.filter((m: any) => [a.id, b.id].includes(m.id)).map((m: any) => m.status + ':' + m.missionId));
