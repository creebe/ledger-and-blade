// Headline numbers for the expeditions trial. Run `npm run exp:sim` after changing any.

export const EXP_TUNING = {
  start: { crowns: 180, stores: { food: 6, bandages: 6, oil: 8, tools: 2, masks: 2, reagents: 3, draughts: 1 } },
  packSlots: 12,
  /** rooms between meals */
  mealEvery: 4,
  /** HP: base + might × perMight + (level − 1) × perLevel */
  hp: { base: 16, perMight: 3, perLevel: 2 },
  /** deeper zones scale monsters by this much per zone below their own */
  depthScale: 0.22,
  /** every monster's damage and HP */
  foe: { dmg: 2.0, hp: 1.2 },
  /** the chance of a wandering monster before each room: base + per zone depth, more in the dark */
  wander: { base: 0.1, perDepth: 0.06, dark: 0.1, rivalAhead: -0.06 },
  /** the roll for a member's life when they go down */
  death: { base: 0.18, overkill: 0.45, dark: 0.08, chaplain: 0.08, min: 0.03, max: 0.75, wipe: 0.55 },
  heal: { bandage: 8, chaplainBandage: 8, dress: 4 },
  camp: { heal: 0.25, healHungry: 0.08, visit: 0.15 },
  /** physical wear: what each thing adds (negative clears it) */
  fatigue: { tired: 40, spent: 70, tiredPenalty: 5, spentPenalty: 12, room: { culverts: 3, streets: 5, sink: 5 }, bulkDiv: 4, dark: 2, hungry: 10, fight: 2, boss: 6, trap: 3, meal: -4, camp: 25, chaplainCamp: 8, campHungry: 6, secondWind: 10, loadEvery: 8 },
  /** reagent runoff in the body, and where it leaves a lasting condition */
  exposure: {
    streetsRoom: 1, sinkRoom: 3, seepHit: 4, gas: 8, kilnBlast: 5, bloodCast: 3, stillBad: 6,
    /** each threshold starts a Sink change */
    thresholds: [40, 70, 95],
    /** the odds of drawing tier 1, 2 or 3 at each threshold */
    tierOdds: [[7, 3, 0], [1, 6, 3], [0, 3, 7]],
    /** at or above this fatigue the change takes at once; below it, the Sink fever comes first */
    takeAt: 50,
    feverRooms: 3, feverPenalty: 6, feverFatigue: 3, feverWeeks: 1,
    homeDrop: 3, treat: 40, treatCost: 30,
  },
  /** at the guild, each week */
  home: { heal: 0.2, infirmary: 0.15, rest: 40, taproom: 20, trainXp: 6, trainCost: 10, trainFatigue: 15 },
  xp: { room: 1, fight: 3, perDepth: 2, levels: [0, 20, 50, 95, 160] },
  debt: { principal: 600, installment: 70, every: 4, penalty: 0.2, missedToLose: 2 },
  hall: { infirmary: 220, taproom: 180 },
  renown: { zoneFirst: { culverts: 0, streets: 2, sink: 4 }, boss: 8, wanderer: 1, carried: 1, nobodyFell: 2 },
  fame: { epithet: 8 },
  recruit: { signOnWeeks: 3, hall: 3 },
  /** goods sell for this share of their value */
  sellRate: 1,
};
