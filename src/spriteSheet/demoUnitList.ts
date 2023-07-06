import { CreatableUnit } from "../server/schemas/unit";

export const demoUnit: CreatableUnit = {
  type: "infantry",
  playerSlot: 0,
  position: [5, 5],
  stats: {
    hp: 9,
    fuel: 99,
  },
};
export const demoUnits: CreatableUnit[] = [
  {
    type: "infantry",
    playerSlot: 0,
    position: [3, 2],
    stats: {
      hp: 9,
      fuel: 99,
    },
  },

  {
    type: "tank",
    playerSlot: 0,
    position: [5, 5],
    stats: {
      hp: 9,
      fuel: 99,
      ammo: 9,
    },
  },

  {
    type: "recon",
    playerSlot: 1,
    position: [12, 4],
    stats: {
      hp: 9,
      fuel: 99,
    },
  },
];
