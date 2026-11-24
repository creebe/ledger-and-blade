import { modProduct } from '../data/decrees';
import { ITEMS, MARKET_POOL, STAPLES } from '../data/items';
import { nextFloat, shuffle } from '../core/rng';
import type { GameState, MaterialId } from '../core/types';
import { clamp } from '../core/util';
import { season } from '../core/calendar';
import { SUPPLY_BASE } from '../core/tuning';

export const MATERIAL_INFO: Record<MaterialId, { name: string; base: number }> = {
  iron: { name: 'Iron', base: 6 },
  leather: { name: 'Leather', base: 5 },
  timber: { name: 'Timber', base: 3 },
  reagents: { name: 'Reagents', base: 12 },
};

export function priceMultiplier(state: GameState): number {
  // weak coin pushes prices up; Weighhouse friendship pulls them down
  const coin = 1 + (50 - state.clocks.cointrust) / 150;
  const wh = 1 - clamp(state.factions.weighhouse.standing, 0, 50) / 500;
  return coin * wh * modProduct(state, 'prices');
}

export function supplyPrice(state: GameState): number {
  const s = season(state);
  const seasonal = s === 'Winter' ? 1.3 : s === 'Autumn' ? 0.85 : s === 'Spring' ? 1.1 : 1;
  // the river market undercuts the Weighhouse for friends of the Mudlarks
  const river = state.factions.mudlarks?.standing >= 20 ? 0.9 : 1;
  return Math.max(1, Math.round(SUPPLY_BASE * seasonal * (state.market.supplies ?? 1) * priceMultiplier(state) * modProduct(state, 'supplyPrice') * river * 10) / 10);
}

export function materialPrice(state: GameState, m: MaterialId): number {
  return Math.max(1, Math.round(MATERIAL_INFO[m].base * (state.market[m] ?? 1) * priceMultiplier(state)));
}

export function itemPrice(state: GameState, defId: string): number {
  return Math.round(ITEMS[defId].price * priceMultiplier(state));
}

export function refreshMarket(state: GameState) {
  for (const k of ['supplies', 'iron', 'leather', 'timber', 'reagents']) {
    const cur = state.market[k] ?? 1;
    // drift back toward 1 with noise
    const target = state.marketBias?.[k] ?? 1;
    state.market[k] = clamp(cur + (target - cur) * 0.3 + (nextFloat(state) - 0.5) * 0.12, 0.5, 1.8);
  }
  const pool = MARKET_POOL.filter((p) => state.renown >= p.minRenown && !STAPLES.includes(p.id)).map((p) => p.id);
  const stock = new Set<string>(STAPLES);
  shuffle(state, pool);
  for (const id of pool.slice(0, 7)) stock.add(id);
  state.stock = [...stock];
}
