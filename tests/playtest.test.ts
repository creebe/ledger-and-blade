// Playtest notes (UI only): the context a note records, and the Markdown it copies as.
import { describe, expect, it } from 'vitest';
import { newGame, openingPlan } from '../src/engine';
import { captureContext, livePlans } from '../src/ui/playtest/context';
import { allMarkdown, noteMarkdown, type PlaytestNote } from '../src/ui/playtest/notes';
import { exportSave, importSave } from '../src/store';

type St = Parameters<typeof captureContext>[0];
const state = (over: Partial<St>): St => ({ game: null, tab: 'hall', sheets: [], subTabs: {}, closingEvent: undefined, ...over }) as St;

describe('playtest notes', () => {
  it('records the screen, the prep sheet and its plan, and the guild in brief', () => {
    const g = newGame(11);
    const c = g.board[0];
    const plan = openingPlan(g, c)!;
    livePlans.set(c.id, plan);
    const ctx = captureContext(state({ game: g, tab: 'contracts', sheets: [{ kind: 'planner', contractId: c.id }] }));
    livePlans.clear();
    const get = (k: string) => ctx.lines.find((l) => l[0] === k)?.[1] ?? '';
    expect(ctx.week).toBe(g.week);
    expect(get('Screen')).toBe('Contracts');
    expect(get('Open')).toContain(`contract:${c.templateId}`);
    expect(get('Contract')).toContain(`site:${c.expedition.site}`);
    expect(get('Plan')).toContain('squad 1.');
    expect(get('Treasury')).toContain(`${g.crowns} crowns`);
    expect(get('Roster')).toMatch(/^\d+ \(/);
  });

  it('records a scene by scene/node with its text and choices', () => {
    const g = newGame(11);
    const ev = g.pendingEvents[0] ?? { uid: 'x', defId: 'demo', title: 'Demo', text: 'Words.', choices: [{ label: 'Go', effects: {} }], week: 1 };
    if (!g.pendingEvents.length) g.pendingEvents.push(ev as never);
    const ctx = captureContext(state({ game: g }));
    expect(ctx.scene?.id).toBe(`${ev.defId}/${ev.node ?? 'root'}`);
    expect(ctx.scene?.choices).toEqual(ev.choices.map((c) => c.label));
    const md = noteMarkdown({ id: 'a', text: 'This line runs long.', ctx }, 0);
    expect(md).toContain(`\`${ev.defId}/`);
    expect(md).toContain('**Note:**\n\nThis line runs long.');
  });

  it('copies context first, then the note, with a save code that loads', () => {
    const g = newGame(5);
    const save = exportSave(g);
    const n: PlaytestNote = { id: 'b', text: 'Hm.', ctx: captureContext(state({ game: g })), save };
    const md = allMarkdown([n, { ...n, id: 'c', save: undefined }]);
    expect(md.indexOf('**Screen:**')).toBeLessThan(md.indexOf('**Note:**'));
    expect(md.match(/^## Note /gm)).toHaveLength(2);
    const code = md.match(/```\n(.+)\n```/)![1];
    expect(importSave(code)?.seed).toBe(g.seed);
  });

  it('works on the title screen, with no game', () => {
    const ctx = captureContext(state({ sheets: [{ kind: 'menu' }] }));
    expect(ctx.week).toBeUndefined();
    expect(ctx.lines[0][1]).toBe('Title › Menu');
  });
});
