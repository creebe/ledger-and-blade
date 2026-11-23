import { create } from 'zustand';
import { produce } from 'immer';
import { advanceWeek, newGame, SAVE_VERSION, type GameState } from './engine';

export type Tab = 'hall' | 'contracts' | 'roster' | 'armory' | 'realm';
export type Sheet =
  | { kind: 'planner'; contractId: string }
  | { kind: 'member'; id: string }
  | { kind: 'mission'; id: string }
  | { kind: 'report'; dispatchIds: string[]; week: number }
  | { kind: 'warnings'; warnings: string[] }
  | { kind: 'menu' }
  | { kind: 'help' };

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
    const g = JSON.parse(text) as GameState;
    if (!g || typeof g.week !== 'number' || g.version !== SAVE_VERSION) return null;
    return g;
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
  act: (fn: (g: GameState) => string | undefined | void) => boolean;
  startNew: () => void;
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
    const next = produce(g, (draft) => {
      err = fn(draft as GameState);
    });
    if (err) {
      get().notify(err);
      return false;
    }
    set({ game: next });
    safeSet(AUTOSAVE, JSON.stringify(next));
    return true;
  },
  startNew: () => {
    const g = newGame();
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
    const before = new Set(g.dispatches.map((d) => d.id));
    const week = g.week;
    const ok = get().act((d) => advanceWeek(d));
    if (!ok) return;
    const after = get().game!;
    const fresh = after.dispatches.filter((d) => !before.has(d.id)).map((d) => d.id);
    set({ sheets: after.gameOver ? [] : [{ kind: 'report', dispatchIds: fresh, week }] });
  },
  setTab: (t) => set({ tab: t, sheets: [] }),
  open: (s) => set({ sheets: [...get().sheets, s] }),
  close: () => set({ sheets: get().sheets.slice(0, -1) }),
  closeAll: () => set({ sheets: [] }),
  notify: (text) => {
    const id = ++toastId;
    set({ toast: { text, id } });
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: undefined });
    }, 2600);
  },
}));
