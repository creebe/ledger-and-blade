import { uid } from '../core/rng';
import type { GameState, Member } from '../core/types';

export function addItem(state: GameState, defId: string): string {
  const id = uid(state, 'i');
  state.items.push({ uid: id, defId });
  return id;
}

export function removeItem(state: GameState, itemUid: string) {
  state.items = state.items.filter((i) => i.uid !== itemUid);
  for (const m of state.members) {
    if (m.loadout.weapon === itemUid) m.loadout.weapon = undefined;
    if (m.loadout.armor === itemUid) m.loadout.armor = undefined;
    if (m.loadout.trinket === itemUid) m.loadout.trinket = undefined;
    m.loadout.consumables = m.loadout.consumables.filter((c) => c !== itemUid);
  }
}

export function equippedBy(state: GameState, itemUid: string): Member | undefined {
  return state.members.find(
    (m) =>
      m.status !== 'dead' &&
      m.status !== 'left' &&
      (m.loadout.weapon === itemUid || m.loadout.armor === itemUid || m.loadout.trinket === itemUid || m.loadout.consumables.includes(itemUid)),
  );
}
