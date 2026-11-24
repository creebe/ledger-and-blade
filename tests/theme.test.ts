// Guards the palette decisions recorded in docs/DESIGN-TOKENS.md: the two
// copies of the dark theme stay identical, and every text pairing we rely on
// keeps at least 4.5:1 contrast in both themes.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

function tokens(selector: string): Record<string, string> {
  const start = css.indexOf(selector);
  expect(start).toBeGreaterThanOrEqual(0);
  const body = css.slice(start, css.indexOf('}', start));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6});/g)].map((m) => [m[1], m[2].toLowerCase()]));
}

const light = tokens(':root {');
const darkMedia = tokens(":root:not([data-theme='light'])");
const darkAttr = tokens(":root[data-theme='dark']");
const dark = { ...light, ...darkAttr };

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('theme', () => {
  it('keeps the two copies of the dark theme identical', () => {
    expect(darkMedia).toEqual(darkAttr);
  });

  it('keeps text readable: 4.5:1 or better on the page and on cards, in both themes', () => {
    const text = ['ink', 'ink-2', 'muted', 'accent', 'gold', 'good', 'mid', 'bad'];
    for (const [name, t] of [
      ['light', light],
      ['dark', dark],
    ] as const) {
      for (const fg of text)
        for (const bg of ['bg', 'paper']) expect(contrast(t[fg], t[bg]), `${name}: ${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t['accent-fill-ink'], t['accent-fill']), `${name}: label on a filled button`).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t.paper, t.ink), `${name}: toast`).toBeGreaterThanOrEqual(4.5);
    }
  });
});
