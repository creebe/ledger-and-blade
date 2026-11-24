import { create } from 'zustand';
import { produce } from 'immer';
import { advanceWeek, checkTutorial, discoverLore, migrateSave, newGame, type GameState, type Objective } from './engine';

export type Tab = 'hall' | 'contracts' | 'roster' | 'armory' | 'realm';
export type Sheet =
  | { kind: 'planner'; contractId: string }
  | { kind: 'member'; id: string }
  | { kind: 'orders'; id: string }
  | { kind: 'mission'; id: string }
  | { kind: 'report'; dispatchIds: string[]; week: number; before: ResourceSnap }
  | { kind: 'confirm'; title: string; body: string[]; cost?: string; confirmLabel: string; danger?: boolean; onConfirm: () => void }
  | { kind: 'warnings'; warnings: string[] }
  | { kind: 'menu' }
  | { kind: 'guide' }
  | { kind: 'journal'; tab?: 'notes' | 'codex' | 'chronicle' }
  | { kind: 'help' };

export interface ResourceSnap {
  crowns: number;
  supplies: number;
  intel: number;
  influence: number;
  renown: number;
  heat: number;
}

export const snap = (g: GameState): ResourceSnap => ({
  crowns: g.crowns,
  supplies: g.supplies,
  intel: g.intel,
  influence: g.influence,
  renown: g.renown,
  heat: g.heat,
});

const AUTOSAVE = 'lab.autosave';
const SLOT = (n: number) => `lab.slot${n}`;

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage may be unavailable (private mode) */
  }
}

export function parseSave(text: string | null): GameState | null {
  if (!text) return null;
  try {
    return migrateSave(JSON.parse(text) as GameState);
  } catch {
    return null;
  }
}

export function slotInfo(n: number): { week: number; crowns: number } | null {
  const g = parseSave(safeGet(SLOT(n)));
  return g ? { week: g.week, crowns: g.crowns } : null;
}

export function hasAutosave() {
  return !!parseSave(safeGet(AUTOSAVE));
}

export function exportSave(g: GameState): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(g))));
}

export function importSave(text: string): GameState | null {
  try {
    return parseSave(decodeURIComponent(escape(atob(text.trim()))));
  } catch {
    return null;
  }
}

interface Store {
  game: GameState | null;
  tab: Tab;
  sheets: Sheet[];
  toast?: { text: string; id: number };
  guideTarget?: string;
  showMe: (o: Objective) => void;
  act: (fn: (g: GameState) => string | undefined | void) => boolean;
  startNew: (seed?: number) => void;
  continueGame: () => void;
  loadGame: (g: GameState) => void;
  saveSlot: (n: number) => void;
  loadSlot: (n: number) => boolean;
  quit: () => void;
  endWeek: () => void;
  setTab: (t: Tab) => void;
  open: (s: Sheet) => void;
  close: () => void;
  closeAll: () => void;
  notify: (text: string) => void;
  confirm: (opts: { title: string; body: string[] | string; cost?: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void }) => void;
}

let toastId = 0;

export const useStore = create<Store>((set, get) => ({
  game: null,
  tab: 'hall',
  sheets: [],
  act: (fn) => {
    const g = get().game;
    if (!g) return false;
    let err: string | undefined | void;
    let completed: Objective[] = [];
    const next = produce(g, (draft) => {
      err = fn(draft as GameState);
      if (!err) {
        completed = checkTutorial(draft as GameState);
        discoverLore(draft as GameState);
      }
    });
    if (err) {
      get().notify(err);
      return false;
    }
    set({ game: next });
    safeSet(AUTOSAVE, JSON.stringify(next));
    if (completed.length) {
      const o = completed[completed.length - 1];
      window.setTimeout(() => get().notify(`✓ Note done: ${o.title}. Collect your reward from the notes.`), 900);
    }
    return true;
  },
  startNew: (seed) => {
    const g = newGame(seed);
    safeSet(AUTOSAVE, JSON.stringify(g));
    set({ game: g, tab: 'hall', sheets: [] });
  },
  continueGame: () => {
    const g = parseSave(safeGet(AUTOSAVE));
    if (g) set({ game: g, tab: 'hall', sheets: [] });
  },
  loadGame: (g) => {
    safeSet(AUTOSAVE, JSON.stringify(g));
    set({ game: g, tab: 'hall', sheets: [] });
  },
  saveSlot: (n) => {
    const g = get().game;
    if (!g) return;
    safeSet(SLOT(n), JSON.stringify(g));
    get().notify(`Saved to slot ${n}`);
  },
  loadSlot: (n) => {
    const g = parseSave(safeGet(SLOT(n)));
    if (!g) return false;
    get().loadGame(g);
    return true;
  },
  quit: () => set({ game: null, sheets: [] }),
  endWeek: () => {
    const g = get().game;
    if (!g) return;
    const seen = new Set(g.dispatches.map((d) => d.id));
    const week = g.week;
    const before = snap(g);
    const ok = get().act((d) => advanceWeek(d));
    if (!ok) return;
    const after = get().game!;
    const fresh = after.dispatches.filter((d) => !seen.has(d.id)).map((d) => d.id);
    set({ sheets: after.gameOver ? [] : [{ kind: 'report', dispatchIds: fresh, week, before }] });
  },
  setTab: (t) => set({ tab: t, sheets: [] }),
  showMe: (o) => {
    set({ tab: o.tab, sheets: [], guideTarget: o.guide });
    get().notify(o.how);
    window.setTimeout(() => {
      if (get().guideTarget === o.guide) set({ guideTarget: undefined });
    }, 4500);
  },
  open: (s) => set({ sheets: [...get().sheets, s] }),
  close: () => set({ sheets: get().sheets.slice(0, -1) }),
  closeAll: () => set({ sheets: [] }),
  confirm: (o) =>
    set({
      sheets: [
        ...get().sheets,
        { kind: 'confirm', title: o.title, body: Array.isArray(o.body) ? o.body : [o.body], cost: o.cost, confirmLabel: o.confirmLabel ?? 'Confirm', danger: o.danger, onConfirm: o.onConfirm },
      ],
    }),
  notify: (text) => {
    const id = ++toastId;
    set({ toast: { text, id } });
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: undefined });
    }, 2600);
  },
}));
