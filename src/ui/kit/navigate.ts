import { type Tab, useStore } from '../../store';

/** Where a tap should take the player: a tab, a sub-tab, an anchor on it, or a planner. */
export interface NavTarget {
  tab?: Tab;
  /** a `data-guide` anchor to scroll to on that tab */
  guide?: string;
  /** the Realm sub-tab to show */
  realm?: 'council' | 'powers' | 'rivals' | 'debt';
  /** the Armory sub-tab to show */
  armory?: 'market' | 'stores' | 'workshop' | 'materials';
  /** open this contract's planner */
  planner?: string;
}

const remember = (key: string, v: string) => {
  try {
    localStorage.setItem(key, v);
  } catch {
    /* storage unavailable */
  }
};

/** Follow a target: close sheets, switch tab and sub-tab, then scroll to the anchor and pulse it. */
export function goTo(to: NavTarget) {
  const st = useStore.getState();
  if (to.planner) return st.open({ kind: 'planner', contractId: to.planner });
  if (to.realm) {
    remember('lab.realm.tab', to.realm);
    st.setSubTab('realm', to.realm);
  }
  if (to.armory) st.setSubTab('armory', to.armory);
  if (to.tab) st.setTab(to.tab);
  else st.closeAll();
  window.setTimeout(() => {
    const el = to.guide ? document.querySelector(`[data-guide="${to.guide}"]`) : null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.classList.remove('nav-pulse');
      void (el as HTMLElement).offsetWidth;
      el.classList.add('nav-pulse');
    } else window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 80);
}
