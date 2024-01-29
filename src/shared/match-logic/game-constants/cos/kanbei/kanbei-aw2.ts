import type { COProperties } from "../../../co";

export const kanbeiAW2: COProperties = {
  displayName: "Kanbei",
  gameVersion: "AW2",
  dayToDay: {
    description: "Units have +30% firepower and defense, but cost 20% more to build.",
    hooks: {
      buildCost: (value) => value * 1.2,
      attack: () => 130,
      defense: () => 130,
    },
  },
  powers: {
    COPower: {
      name: "Morale Boost",
      description: "Units gain +20% firepower.",
      stars: 4,
      hooks: {
        attack: () => 150,
      },
    },
    superCOPower: {
      name: "Samurai Spirit",
      description:
        "Units gain +20% firepower and defense, and their counterattacks are 50% stronger.",
      stars: 7,
      hooks: {
        attack: () => 150,
        defense: () => 150,
        // counters handled in calculateDamage
      },
    },
  },
};
