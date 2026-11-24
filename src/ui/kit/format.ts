// One way to write each kind of number. Use these instead of building the
// string by hand, so crowns, weeks, signs and dates read the same everywhere.

export const pct = (p: number) => `${Math.round(p * 100)}%`;

export function chanceText(min: number, max: number) {
  return Math.round(min * 100) === Math.round(max * 100) ? pct(min) : `${pct(min)}–${pct(max)}`;
}

/** A real minus sign (U+2212), never a hyphen. */
export const MINUS = '−';

/** +3, −2.5, 0: one decimal at most, with a real minus. */
export function signed(n: number) {
  const r = Math.round(n * 10) / 10;
  return r > 0 ? `+${r}` : r < 0 ? `${MINUS}${Math.abs(r)}` : '0';
}

/** A plain number with a real minus when negative. */
export const num = (n: number) => (n < 0 ? `${MINUS}${Math.abs(n)}` : `${n}`);

/** Crowns in text: "106◉", "−217◉". */
export const crowns = (n: number) => `${num(n)}◉`;

/** A change in crowns: "+500◉", "−106◉". */
export const crownsDelta = (n: number) => `${n > 0 ? '+' : ''}${num(n)}◉`;

/** Compact weeks for chips and meta lines: "3 wk". */
export const wk = (n: number) => `${n} wk`;

/** Weeks in a sentence: "1 week", "3 weeks". */
export const weeks = (n: number) => `${n} week${n === 1 ? '' : 's'}`;

/** "1 squad", "2 squads". */
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;

/**
 * A short calendar date for an absolute week number, matching the top bar:
 * "Summer wk 5", with the year added when it isn't the current one.
 */
export function shortDate(week: number, now?: number) {
  const season = SEASONS[Math.floor(((week - 1) % 48) / 12)];
  const year = Math.floor((week - 1) / 48) + 1;
  const nowYear = now ? Math.floor((now - 1) / 48) + 1 : year;
  return `${season} wk ${((week - 1) % 12) + 1}${year !== nowYear ? `, Year ${year}` : ''}`;
}

/** Rewrites a stored "Week 17 · …" record line to use the calendar date. */
export const datedLine = (line: string, now: number) => line.replace(/^Week (\d+) ·/, (_, w) => `${shortDate(Number(w), now)} ·`);

export const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export const SLOT_LABEL = { weapon: 'Weapon', armor: 'Armor', trinket: 'Trinket', consumable: 'Consumable' } as const;
