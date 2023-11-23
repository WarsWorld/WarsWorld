import type { COProperties } from "../co";

/* TODO is any rounding needed here? */

export const colin: COProperties = {
  displayName: "Colin",
  dayToDay: {
    description: "Units cost -20% less to build and lose -10% attack.ts.",
    hooks: {
      buildCost: (value) => value * 0.8,
      attack: (value) => value * 0.9,
    },
  },
  powers: {
    COPower: {
      name: "Gold Rush",
      description: "Funds are multiplied by 1.5x.",
      stars: 2,
      instantEffect: ({ player }) => {
        player.data.funds = player.data.funds * 1.5;
      },
    },
    superCOPower: {
      name: "Power of Money",
      description: "All units gain 3% attack.ts per 1000 funds.",
      stars: 6,
      hooks: {
        attack(value, { attacker }) {
          const numberOf1000Funds = Math.floor(
            attacker.player.data.funds / 1000
          );
          const attackBonus = numberOf1000Funds * 3;
          return value + attackBonus;
        },
      },
    },
  },
};
