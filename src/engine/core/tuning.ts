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
export const FAME_LEGENDARY = 105;
/** A Legend also needs a long record, not just one lucky year. */
export const LEGEND_NEEDS = { level: 5, missions: 23 };

// ---- Guild wars ----
/** Feud level at which a rivalry becomes a feud, and then open war. */
export const FEUD_AT = 25;
export const WAR_AT = 60;
/**
 * How a feud moves on its own each week (see weeklyWar in rivals/war.ts).
 * A rival resents a guild that is catching up with it (FEUD_RESENT × its
 * aggression), and every grudge cools a little (FEUD_COOL) and fades in
 * proportion to its size (FEUD_DECAY). Left alone, a fully aggressive rival
 * settles at (FEUD_RESENT − FEUD_COOL) / FEUD_DECAY, about 17: below a feud.
 * What tips a rivalry into a feud, and a feud into war, is what the guild
 * does: contested jobs, operations, and the story.
 */
export const FEUD_RESENT = 1;
export const FEUD_COOL = 0.3;
export const FEUD_DECAY = 0.04;
/**
 * A stage, once reached, holds until the feud falls this far below its line, so
 * one contested job doesn't flip a rival into a feud and out again a week later.
 * A truce or tribute ends the stage at once.
 */
export const FEUD_HOLD = 6;
export const WAR_HOLD = 8;
/** Feud from each move a rival makes against you. Kept small so a feud can't feed itself into war. */
export const FEUD_THEIR_MOVE = 1;
/** Feud from beating a rival to a contested job. */
export const FEUD_CONTESTED = 9;
/** Intel to search the hall for spies. */
export const SWEEP_COST = 3;
