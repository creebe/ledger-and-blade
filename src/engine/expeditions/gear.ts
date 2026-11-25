// The classic items, read as gear for a dive, and a member frozen as they
// leave. The armory, market and Workshop keep their one set of items; this is
// how each one works down there.
import { ITEMS } from '../data/items';
import type { GameState, ItemDef, Member } from '../core/types';
import type { Delver, DiveGear } from './types';

export function diveGear(def: ItemDef): DiveGear {
  const g: DiveGear = { id: def.id, name: def.name, slot: def.slot };
  const b = def.bonus ?? {};
  if (def.slot === 'weapon') {
    g.damage = def.damage;
    g.element = def.element;
    g.ranged = def.ranged;
    if (b.arcana) {
      g.focus = true;
      g.power = 3 + b.arcana;
    } else g.power = (def.power ?? 1) + 2;
  }
  if (def.slot === 'armor') {
    g.protection = def.protection ?? 0;
    g.bulk = def.weight === 'heavy' ? 12 : def.weight === 'medium' ? ((def.protection ?? 0) >= 5 ? 3 : 6) : 0;
    if (b.guile) g.parley = b.guile * 0.04;
  }
  if (def.slot === 'trinket' || def.slot === 'consumable') {
    if (b.stealth) {
      g.dodge = b.stealth * 2;
      g.avoid = b.stealth * 0.05;
    }
    if (b.guile) g.parley = b.guile * 0.04;
    if (b.endurance) g.ease = b.endurance;
    if (b.arcana && def.id === 'assay_lens') g.finds = 0.2;
    g.counters = def.counters;
    g.grantsElement = def.grantsElement;
    if (def.mending) g.draught = true;
  }
  return g;
}

const gearOf = (s: GameState, uid: string | undefined): DiveGear | undefined => {
  if (!uid) return undefined;
  const inst = s.items.find((i) => i.uid === uid);
  return inst && ITEMS[inst.defId] ? diveGear(ITEMS[inst.defId]) : undefined;
};

/** A member as they are now, frozen for a trip. */
export function delverOf(s: GameState, m: Member): Delver {
  return {
    id: m.id,
    name: m.name,
    prof: m.profession,
    attrs: { ...m.attrs },
    level: m.level,
    health: m.health,
    fatigue: m.fatigue,
    exposure: m.exposure ?? 0,
    changes: [...(m.changes ?? [])],
    scars: [...(m.scars ?? [])],
    habits: [...(m.habits ?? [])],
    signature: m.signature,
    gear: {
      weapon: gearOf(s, m.loadout.weapon),
      armor: gearOf(s, m.loadout.armor),
      trinket: gearOf(s, m.loadout.trinket),
      consumables: m.loadout.consumables.map((u) => gearOf(s, u)).filter((x): x is DiveGear => !!x),
    },
  };
}
