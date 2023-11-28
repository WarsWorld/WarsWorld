import type { COProperties } from "../../co";

/* TODO is any rounding needed here? */

export const colinAW2: COProperties = {
  displayName: "Colin",
  gameVersion: "AW2",
  dayToDay: {
    description: "Units cost 20% less to build, but have -10% firepower.",
    hooks: {
      buildCost: (value) => value * 0.8,
      attack: () => 90
    }
  },
  powers: {
    COPower: {
      name: "Gold Rush",
      description: "Current funds are multiplied by 1.5x.",
      stars: 2,
      instantEffect: ({ player }) => {
        player.data.funds = player.data.funds * 1.5;
      }
    },
    superCOPower: {
      name: "Power of Money",
      description: "All units gain 1% firepower per 300 funds.",
      stars: 6,
      hooks: {
        attack({ attacker }) {
          const attackBonusPercent = Math.floor(
            attacker.player.data.funds / 300
          );
          return 100 + attackBonusPercent;
        }
      }
    }
  }
};
