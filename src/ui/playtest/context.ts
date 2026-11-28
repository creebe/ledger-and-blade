// What a playtest note records about the moment it was written: where the
// player is, what's open, and the guild in brief. IDs follow
// docs/story/README.md (`scene/node`, `contract:id`, `date:id`) so main can
// find the code from a pasted note.
import { PROFESSIONS, currentDate, dateLabel, living, loanStillDue, upkeep, weeklyWages, type ExpPlan, type GameEvent, type GameState } from '../../engine';
import type { Sheet, useStore } from '../../store';
import { VERSION } from '../../version';
import { localStamp, type CtxLine, type NoteContext, type SceneCtx } from './notes';

type StoreState = ReturnType<typeof useStore.getState>;

/**
 * Plans being prepped live in the prep sheet's own state, not the game, so
 * the sheet reports its current plan here while it is open.
 */
export const livePlans = new Map<string, ExpPlan>();

const TAB_NAMES: Record<string, string> = { hall: 'Hall', field: 'Field', contracts: 'Contracts', roster: 'Roster', armory: 'Armory', realm: 'Realm' };

const memberName = (g: GameState, id: string) => g.members.find((m) => m.id === id)?.name ?? id;

function sheetLabel(g: GameState, s: Sheet): string {
  switch (s.kind) {
    case 'planner': {
      const c = g.board.find((x) => x.id === s.contractId);
      return c ? `Prep: \`contract:${c.templateId}\` “${c.title}”` : `Prep: ${s.contractId} (no longer on the board)`;
    }
    case 'member':
      return `Member: ${memberName(g, s.id)}`;
    case 'orders':
      return `Orders: ${memberName(g, s.id)}`;
    case 'mission': {
      const m = g.missions.find((x) => x.id === s.id) ?? g.history.find((x) => x.id === s.id);
      return m ? `Expedition log: \`contract:${m.contract.templateId}\` “${m.contract.title}”` : `Expedition log: ${s.id}`;
    }
    case 'watch':
      return `Watching the squads, week ${s.week}`;
    case 'report':
      return `Week report, week ${s.week}`;
    case 'confirm':
      return `Confirm: “${s.title}”${s.cost ? ` (${s.cost})` : ''}`;
    case 'journal':
      return `Journal: ${s.tab ?? 'notes'}`;
    case 'guide':
      return 'Journal: notes';
    case 'endweek':
      return 'End Week';
    case 'date':
      return 'Date';
    case 'menu':
      return 'Menu';
    case 'help':
      return 'How to play';
    case 'playtest':
      return 'Playtest notes';
  }
}

/** The scene on screen, if any, as App shows it: a finished one waiting for Continue first. */
function sceneOnScreen(st: StoreState): { ev: GameEvent; done: boolean } | undefined {
  const g = st.game;
  if (!g || g.gameOver) return undefined;
  if (st.closingEvent) return { ev: st.closingEvent, done: true };
  const reportOpen = st.sheets.some((s) => s.kind === 'report' || s.kind === 'mission' || s.kind === 'watch');
  const ev = reportOpen ? undefined : g.pendingEvents[0];
  return ev ? { ev, done: false } : undefined;
}

function planLine(g: GameState, plan: ExpPlan): string {
  const squad = plan.squad.map((id, i) => {
    const m = g.members.find((x) => x.id === id);
    return m ? `${i + 1}. ${m.name} (${PROFESSIONS[m.profession].name})` : `${i + 1}. ${id}`;
  });
  const pack = Object.entries(plan.pack)
    .filter(([, n]) => n)
    .map(([k, n]) => `${k} ${n}`);
  const o = plan.orders;
  return `squad ${squad.join(', ') || 'none'}; pack ${pack.join(', ') || 'empty'}; orders retreat ${o.retreat}, heal ${o.healFirst}, wanderers ${o.wanderers}, camp ${o.camp}, supplies ${o.consumables}`;
}

function rosterLine(g: GameState): string {
  const people = living(g);
  const tally = (st: string) => people.filter((m) => m.status === st).length;
  const counts = [`${tally('idle')} home`, tally('mission') && `${tally('mission')} away`, tally('recovering') && `${tally('recovering')} recovering`].filter(Boolean).join(', ');
  const status = (s: string) => (s === 'idle' ? 'home' : s === 'mission' ? 'away' : s);
  const who = people.map((m) => `${m.name} (${PROFESSIONS[m.profession].name} ${m.level}, ${m.health}%, ${status(m.status)})`);
  return `${people.length} (${counts}): ${who.join('; ')}`;
}

export function captureContext(st: StoreState): NoteContext {
  const g = st.game;
  const at = localStamp(new Date());
  if (!g) {
    const stack = st.sheets.map((s) => (s.kind === 'confirm' ? `Confirm: “${s.title}”` : s.kind)).join(' › ');
    return { version: VERSION, at, lines: [['Screen', `Title${stack ? ` › ${stack}` : ''}`]] };
  }
  const lines: CtxLine[] = [];
  const sub = st.tab === 'realm' || st.tab === 'armory' ? st.subTabs[st.tab] : undefined;
  lines.push(['Screen', g.gameOver ? `Game over (${g.gameOver})` : `${TAB_NAMES[st.tab] ?? st.tab}${sub ? ` › ${sub}` : ''}`]);
  if (st.sheets.length) lines.push(['Open', st.sheets.map((s) => sheetLabel(g, s)).join(' › ')]);

  // the posting and plan being prepped
  for (const s of st.sheets) {
    if (s.kind !== 'planner') continue;
    const c = g.board.find((x) => x.id === s.contractId);
    if (!c) continue;
    const ex = c.expedition;
    lines.push([
      'Contract',
      `\`contract:${c.templateId}\` “${c.title}”, ${c.reward} crowns, threat ${c.threat}, \`site:${ex.site}\` ${ex.length}, squad ${c.minSquad}–${c.maxSquad}, expires week ${c.expiresWeek}${c.story ? ', story' : ''}`,
    ]);
    const plan = livePlans.get(c.id);
    if (plan) lines.push(['Plan', planLine(g, plan)]);
  }

  const burn = weeklyWages(g) + upkeep(g);
  lines.push(['Treasury', `${g.crowns} crowns, weekly costs ${burn}; supplies ${g.supplies}, Intel ${g.intel}, Influence ${g.influence}, Renown ${g.renown}, Heat ${g.heat}`]);
  const loans = g.loans.filter((l) => l.principal > 0 || loanStillDue(l) > 0);
  if (loans.length)
    lines.push(['Loan', loans.map((l) => `${loanStillDue(l)} due week ${l.dueWeek} (in ${Math.max(0, l.dueWeek - g.week)}) to ${l.lender}, ${l.principal} owed${l.missed ? `, ${l.missed} missed` : ''}`).join('; ')]);
  const d = currentDate(g);
  if (d) lines.push(['Next Date', `\`date:${d.def.id}\`, in ${d.weeksLeft} week${d.weeksLeft === 1 ? '' : 's'}`]);
  if (g.missions.length) lines.push(['Away', g.missions.map((m) => `squad ${m.number} on \`contract:${m.contract.templateId}\`, home week ${m.returnWeek}`).join('; ')]);
  lines.push(['Roster', rosterLine(g)]);

  let scene: SceneCtx | undefined;
  const on = sceneOnScreen(st);
  if (on) {
    const { ev, done } = on;
    const last = ev.transcript?.at(-1);
    scene = {
      id: `${ev.defId}/${ev.node ?? 'root'}`,
      title: ev.title,
      speaker: ev.speaker,
      text: ev.text,
      choices: done ? [] : ev.choices.map((c) => c.label),
      ...(done && last ? { ending: last } : {}),
    };
  }
  return { version: VERSION, at, week: g.week, date: dateLabel(g.week), lines, scene };
}
