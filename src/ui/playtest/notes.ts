// Playtest notes: the owner's comments written during play, each with the
// moment it was written about. They live in their own localStorage key,
// apart from the game and its saves, so a note never changes a save.
// See docs/playtest-notes.md for how main reads one.
import { create } from 'zustand';

/** One labelled line of context, such as ["Screen", "Contracts"]. */
export type CtxLine = [label: string, value: string];

export interface SceneCtx {
  /** `scene/node`, the ID docs/story/README.md uses (`ostrander_agent/root`) */
  id: string;
  title: string;
  speaker?: string;
  text: string;
  /** the choices on screen, in the order shown */
  choices: string[];
  /** the scene is over and its ending is on screen, waiting for Continue */
  ending?: { choice: string; reply: string };
}

export interface NoteContext {
  version: string;
  /** the real time the note was started, in the player's local time */
  at: string;
  week?: number;
  /** the in-game date, "Spring, week 3, Year 1" */
  date?: string;
  lines: CtxLine[];
  scene?: SceneCtx;
}

export interface PlaytestNote {
  id: string;
  text: string;
  ctx: NoteContext;
  /** the game at that moment, in the menu's export format (Menu › Transfer › Import) */
  save?: string;
  edited?: string;
}

interface Stored {
  on: boolean;
  /** where the Note tab sits, as a fraction of the screen height; the player can drag it */
  btnY?: number;
  attachSave: boolean;
  notes: PlaytestNote[];
  /** a note being written: kept if the sheet is closed with Back, dropped with Cancel */
  draft?: { text: string; ctx: NoteContext; save?: string };
}

export const NOTES_KEY = 'lab.playtest';

function load(): Stored {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<Stored>;
      return { on: !!s.on, btnY: typeof s.btnY === 'number' ? s.btnY : undefined, attachSave: !!s.attachSave, notes: Array.isArray(s.notes) ? s.notes : [], draft: s.draft };
    }
  } catch {
    /* unreadable or unavailable: start empty */
  }
  return { on: false, attachSave: false, notes: [] };
}

/** false when storage is full or unavailable */
function persist(s: Stored): boolean {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify({ on: s.on, btnY: s.btnY, attachSave: s.attachSave, notes: s.notes, draft: s.draft }));
    return true;
  } catch {
    return false;
  }
}

interface NotesStore extends Stored {
  /** the note sheet is open */
  writing: boolean;
  /** the last write to storage failed, so notes are kept for this session only */
  storageFull: boolean;
  setOn: (on: boolean) => void;
  setAttachSave: (on: boolean) => void;
  setBtnY: (y: number) => void;
  /** open the note sheet; a draft already started keeps its own moment */
  startNote: (ctx: NoteContext, save?: string) => void;
  setDraft: (text: string) => void;
  /** close the sheet and keep the draft for next time */
  putAway: () => void;
  cancelNote: () => void;
  saveNote: () => void;
  editNote: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
  clearAll: () => void;
}

let seq = 0;
const newId = () => `n${Date.now().toString(36)}${(++seq).toString(36)}`;

export const useNotes = create<NotesStore>((set, get) => {
  const commit = (patch: Partial<Stored> & { writing?: boolean }) => {
    const next = { ...get(), ...patch };
    set({ ...patch, storageFull: !persist(next) });
  };
  return {
    ...load(),
    writing: false,
    storageFull: false,
    setOn: (on) => commit({ on }),
    setAttachSave: (attachSave) => commit({ attachSave }),
    setBtnY: (btnY) => commit({ btnY }),
    startNote: (ctx, save) => {
      const d = get().draft;
      commit({ writing: true, draft: d ?? { text: '', ctx, save } });
    },
    setDraft: (text) => {
      const d = get().draft;
      if (d) commit({ draft: { ...d, text } });
    },
    putAway: () => {
      const d = get().draft;
      // an empty draft has nothing worth keeping, and the next note should take its own moment
      commit({ writing: false, draft: d && d.text.trim() ? d : undefined });
    },
    cancelNote: () => commit({ writing: false, draft: undefined }),
    saveNote: () => {
      const d = get().draft;
      if (!d || !d.text.trim()) return;
      const note: PlaytestNote = { id: newId(), text: d.text.trim(), ctx: d.ctx, ...(d.save ? { save: d.save } : {}) };
      commit({ writing: false, draft: undefined, notes: [...get().notes, note] });
    },
    editNote: (id, text) => commit({ notes: get().notes.map((n) => (n.id === id ? { ...n, text: text.trim(), edited: localStamp(new Date()) } : n)) }),
    deleteNote: (id) => commit({ notes: get().notes.filter((n) => n.id !== id) }),
    clearAll: () => commit({ notes: [] }),
  };
});

/** "2026-11-28 14:05" in local time */
export function localStamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** A blockquote: every line, blank ones included, starts with ">". */
const quote = (s: string) =>
  s
    .split('\n')
    .map((l) => (l.trim() ? `> ${l}` : '>'))
    .join('\n');

/** The heading line of a note, also used in the list. */
export function noteHeading(n: PlaytestNote, i: number): string {
  const when = n.ctx.week ? `Week ${n.ctx.week}` : 'No game';
  return `Note ${i + 1} · ${when} · ${n.ctx.version}`;
}

/** One note as Markdown: context first, then the note. */
export function noteMarkdown(n: PlaytestNote, i: number): string {
  const L: string[] = [`## ${noteHeading(n, i)}`, ''];
  L.push(`- **Written:** ${n.ctx.at}${n.edited ? ` (edited ${n.edited})` : ''}`);
  if (n.ctx.date) L.push(`- **In game:** ${n.ctx.date}`);
  for (const [k, v] of n.ctx.lines) L.push(`- **${k}:** ${v}`);
  const sc = n.ctx.scene;
  if (sc) {
    L.push(`- **Scene:** \`${sc.id}\` “${sc.title}”${sc.ending ? ' (ended, waiting for Continue)' : ''}`, '');
    L.push(quote(`${sc.speaker ? `**${sc.speaker}:** ` : ''}${sc.text}`), '');
    if (sc.ending) L.push(`- **Last choice:** ${sc.ending.choice}`, '', quote(sc.ending.reply), '');
    else if (sc.choices.length) L.push(`- **Choices shown:**`, ...sc.choices.map((c, k) => `  ${k + 1}. ${c}`), '');
  }
  if (L[L.length - 1] !== '') L.push('');
  L.push('**Note:**', '', n.text, '');
  if (n.save) L.push('<details><summary>Save code (Menu › Transfer › Import)</summary>', '', '```', n.save, '```', '', '</details>', '');
  return L.join('\n');
}

/** Every note as one Markdown document. */
export function allMarkdown(notes: PlaytestNote[]): string {
  const head = `# Playtest notes\n\n${notes.length} note${notes.length === 1 ? '' : 's'}, copied ${localStamp(new Date())}.\n`;
  return [head, ...notes.map((n, i) => noteMarkdown(n, i))].join('\n');
}
