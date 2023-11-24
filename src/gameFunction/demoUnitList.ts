import type { UnitWithVisibleStats } from "shared/schemas/unit";

export const demoUnit: UnitWithVisibleStats = {
  type: "infantry",
  playerSlot: 0,
  position: [5, 5],
  stats: {
    hp: 9,
    fuel: 99
  },
  isReady: true
};
export const demoUnits: UnitWithVisibleStats[] = [
  {
    type: "infantry",
    playerSlot: 0,
    position: [3, 2],
    stats: {
      hp: 9,
      fuel: 99
    },
    isReady: true
  },

  {
    type: "tank",
    playerSlot: 0,
    position: [0, 0],
    stats: {
      hp: 9,
      fuel: 99,
      ammo: 9
    },
    isReady: true
  },

  {
    type: "recon",
    playerSlot: 1,
    position: [0, 1],
    stats: {
      hp: 9,
      fuel: 99
    },
    isReady: true
  },

  {
    type: "rocket",
    playerSlot: 1,
    position: [3, 8],
    stats: {
      hp: 9,
      fuel: 99,
      ammo: 3
    },
    isReady: true
  },

  {
    type: "mech",
    playerSlot: 1,
    position: [3, 6],
    stats: {
      hp: 9,
      fuel: 99,
      ammo: 3
    },
    isReady: true
  }
];
