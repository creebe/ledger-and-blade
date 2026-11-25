// Headline numbers for the expeditions trial. Run `npm run exp:sim` after changing any.

export const EXP_TUNING = {
  start: { crowns: 180, stores: { food: 6, bandages: 6, oil: 8, tools: 2, charms: 2, reagents: 3, draughts: 1 } },
  packSlots: 12,
  /** rooms between meals */
  mealEvery: 4,
  /** HP: base + might × perMight + (level − 1) × perLevel */
  hp: { base: 16, perMight: 3, perLevel: 3 },
  /** deeper zones scale monsters by this much per zone below their own */
  depthScale: 0.22,
  /** every monster's damage and HP */
  foe: { dmg: 1.7, hp: 1.2 },
  /** the chance of a wandering monster before each room: base + per zone depth, more in the dark */
  wander: { base: 0.1, perDepth: 0.06, dark: 0.1, rivalAhead: -0.06 },
  /** the roll for a member's life when they go down */
  death: { base: 0.12, overkill: 0.45, dark: 0.08, chaplain: 0.08, min: 0.03, max: 0.75, wipe: 0.55 },
  heal: { bandage: 8, chaplainBandage: 8, dress: 4 },
  camp: { heal: 0.25, healHungry: 0.08, grit: 10, chaplainGrit: 6, gritHungry: -10, visit: 0.15 },
  grit: { meal: 3, hungry: -8, darkRoom: -4, trap: -6, downAlly: -12, deathAlly: -25, kill: 2, crit: 3, find: 2, fightWon: 0, steady: 12, charm: 30, room: { culverts: -1, streets: -3, sink: -5 } },
  /** at the guild, each week */
  home: { heal: 0.2, infirmary: 0.15, grit: 12, taproom: 12, trainXp: 6, trainCost: 10, trainGrit: -6 },
  xp: { room: 1, fight: 3, perDepth: 2, levels: [0, 20, 50, 95, 160] },
  debt: { principal: 600, installment: 70, every: 4, penalty: 0.2, missedToLose: 2 },
  hall: { infirmary: 220, taproom: 180 },
  renown: { zoneFirst: { culverts: 0, streets: 2, sink: 4 }, boss: 8, wanderer: 1, carried: 1, nobodyFell: 2 },
  fame: { epithet: 8 },
  recruit: { signOnWeeks: 3, hall: 3 },
  /** goods sell for this share of their value */
  sellRate: 1,
};
