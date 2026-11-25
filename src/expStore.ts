// The store for the expeditions trial. It holds the trial's own game state and
// saves it under its own key, so it never touches a classic save.
// Toasts and confirmations reuse the classic store's, so Btn and ConfirmSheet work unchanged.
import { create } from 'zustand';
import { produce } from 'immer';
import { migrateExpSave, newExpGame, type ExpGame, type ExpPlan } from './engine';

export const EXP_SAVE_KEY = 'lab.trial.expeditions';

export type XTab = 'hall' | 'squad' | 'market';
export type XView = 'guild' | 'prep' | 'log' | 'result';
export type XSheet = { kind: 'member'; id: string } | { kind: 'week'; fromWeek: number; crownsBefore: number; newsBefore: number };

function load(): ExpGame | null {
  try {
    const t = localStorage.getItem(EXP_SAVE_KEY);
    return t ? migrateExpSave(JSON.parse(t) as ExpGame) : null;
  } catch {
    return null;
  }
}
function save(g: ExpGame | null) {
  try {
    if (g) localStorage.setItem(EXP_SAVE_KEY, JSON.stringify(g));
  } catch {
    /* storage unavailable */
  }
}
export const hasExpSave = () => !!load();

interface XStore {
  game: ExpGame | null;
  tab: XTab;
  view: XView;
  sheets: XSheet[];
  draft?: ExpPlan;
  /** the log being shown is a replay, so it starts fully revealed */
  replay?: boolean;
  act: (fn: (g: ExpGame) => string | undefined | void) => string | undefined;
  start: (seed?: number) => void;
  resume: () => void;
  quit: () => void;
  setTab: (t: XTab) => void;
  setView: (v: XView, replay?: boolean) => void;
  setDraft: (p: ExpPlan | undefined) => void;
  open: (s: XSheet) => void;
  close: () => void;
}

export const useX = create<XStore>((set, get) => ({
  game: null,
  tab: 'hall',
  view: 'guild',
  sheets: [],
  act: (fn) => {
    const g = get().game;
    if (!g) return 'No game.';
    let err: string | undefined | void;
    const next = produce(g, (d) => {
      err = fn(d as ExpGame);
    });
    if (err) return err;
    set({ game: next });
    save(next);
    return undefined;
  },
  start: (seed) => {
    const g = newExpGame(seed);
    save(g);
    set({ game: g, tab: 'hall', view: 'guild', sheets: [], draft: undefined });
  },
  resume: () => {
    const g = load();
    if (g) set({ game: g, tab: 'hall', view: 'guild', sheets: [] });
  },
  quit: () => set({ game: null, sheets: [], view: 'guild' }),
  setTab: (t) => set({ tab: t, sheets: [] }),
  setView: (v, replay) => {
    set({ view: v, sheets: [], replay: !!replay });
    window.scrollTo(0, 0);
  },
  setDraft: (p) => set({ draft: p }),
  open: (s) => set({ sheets: [...get().sheets, s] }),
  close: () => set({ sheets: get().sheets.slice(0, -1) }),
}));
