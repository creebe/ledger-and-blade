import { APPROACH_INFO, ITEMS, TAGS, type Approach, type ItemDef } from '../../engine';

export const pct = (p: number) => `${Math.round(p * 100)}%`;

export function chanceText(min: number, max: number) {
  return Math.round(min * 100) === Math.round(max * 100) ? pct(min) : `${pct(min)}–${pct(max)}`;
}

export function signed(n: number) {
  const r = Math.round(n * 10) / 10;
  return `${r > 0 ? '+' : ''}${r}`;
}

export function itemSummary(def: ItemDef): string {
  const parts: string[] = [];
  if (def.slot === 'weapon') {
    parts.push(`${cap(def.damage ?? '')} ${def.power ?? 0}`);
    if (def.element) parts.push(cap(def.element));
    if (def.ranged) parts.push('Ranged');
  }
  if (def.slot === 'armor') parts.push(`${cap(def.weight ?? '')} · Prot ${def.protection ?? 0}`);
  if (def.grantsElement) parts.push(`Grants ${cap(def.grantsElement)}`);
  for (const [a, v] of Object.entries(def.bonus ?? {})) parts.push(`${v! > 0 ? '+' : ''}${v} ${APPROACH_INFO[a as Approach].name}`);
  if (def.counters?.length) parts.push(`Negates ${def.counters.map((t) => TAGS[t]?.name ?? t).join('/')}`);
  if (def.mending) parts.push('Saves a life');
  return parts.join(' · ');
}

export const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export const SLOT_LABEL = { weapon: 'Weapon', armor: 'Armor', trinket: 'Trinket', consumable: 'Consumable' } as const;

export function itemName(defId: string) {
  return ITEMS[defId]?.name ?? defId;
}

export const ELEMENT_ICON: Record<string, string> = { fire: '🔥', frost: '❄', storm: '⚡', radiant: '☀', shadow: '☾' };
