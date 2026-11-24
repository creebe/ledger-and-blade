
export const pct = (p: number) => `${Math.round(p * 100)}%`;

export function chanceText(min: number, max: number) {
  return Math.round(min * 100) === Math.round(max * 100) ? pct(min) : `${pct(min)}–${pct(max)}`;
}

export function signed(n: number) {
  const r = Math.round(n * 10) / 10;
  return `${r > 0 ? '+' : ''}${r}`;
}

export const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export const SLOT_LABEL = { weapon: 'Weapon', armor: 'Armor', trinket: 'Trinket', consumable: 'Consumable' } as const;

