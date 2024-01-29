import type { COProperties } from "../../../co";

export const kanbeiAW1: COProperties = {
  displayName: "Kanbei",
  gameVersion: "AW1",
  dayToDay: {
    description: "Units have +20% firepower and defense, but cost 20% more to build.",
    hooks: {
      buildCost: (value) => value * 1.2,
      attack: () => 120,
      defense: () => 120,
    },
  },
  powers: {
    COPower: {
      name: "Morale Boost",
      description: "Units gain +10% firepower.",
      stars: 5,
      hooks: {
        attack: () => 130,
      },
    },
  },
};
