// Seeded RNG (mulberry32). The rng state lives in GameState so results are
// reproducible and a reload cannot re-roll an outcome.
import type { GameState } from './types';

export function nextFloat(state: { rng: number }): number {
  let t = (state.rng = (state.rng + 0x6d2b79f5) | 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randInt(state: { rng: number }, min: number, max: number): number {
  return min + Math.floor(nextFloat(state) * (max - min + 1));
}

export function pick<T>(state: { rng: number }, arr: readonly T[]): T {
  return arr[Math.floor(nextFloat(state) * arr.length)];
}

export function chance(state: { rng: number }, p: number): boolean {
  return nextFloat(state) < p;
}

export function shuffle<T>(state: { rng: number }, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(nextFloat(state) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function weighted<T>(state: { rng: number }, items: readonly { item: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = nextFloat(state) * total;
  for (const i of items) {
    r -= i.weight;
    if (r <= 0) return i.item;
  }
  return items[items.length - 1].item;
}

export function uid(state: GameState, prefix: string): string {
  state.nextId += 1;
  return `${prefix}${state.nextId}`;
}
