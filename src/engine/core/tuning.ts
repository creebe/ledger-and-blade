// The headline balance numbers, in one place. Change them here and run
// `npm run sim` (survival should stay about 65-75% for the careful bot) and
// `npm test` before committing. Content numbers (a contract's pay, a scene's
// costs) stay with that content in src/engine/data/, and per-building tables
// (training cost, reveal cost, upkeep) are in economy/buildings.ts.

// ---- Economy ----
/** Multiplier on every contract's base pay. */
export const REWARD_SCALE = 1.65;
/** Weekly upkeep of the hall before buildings. */
export const BASE_UPKEEP = 15;
/** Base price of one supply before season, market and decrees. */
export const SUPPLY_BASE = 3;
/** Share of an item's price you get back when selling it. */
export const SELL_RATE = 0.5;
/** Share of a material's price you get back when selling it. */
export const MATERIAL_SELL_RATE = 0.7;

// ---- Intel and Influence ----
/** Intel to learn a rival's plan for the week. */
export const INTEL_RIVAL_COST = 2;
/** Influence to court a faction (+6 standing). */
export const PETITION_COST = 3;
/** Influence to cool Heat by 12. */
export const HEAT_COST = 4;

// ---- Legends ----
/** Fame needed for each tier (Known, Renowned, Legendary). */
export const FAME_KNOWN = 20;
export const FAME_RENOWNED = 75;
export const FAME_LEGENDARY = 120;
/** A Legend also needs a long record, not just one lucky year. */
export const LEGEND_NEEDS = { level: 5, missions: 25 };

// ---- Guild wars ----
/** Feud level at which a rivalry becomes a feud, and then open war. */
export const FEUD_AT = 25;
export const WAR_AT = 60;
/** Intel to search the hall for spies. */
export const SWEEP_COST = 3;
