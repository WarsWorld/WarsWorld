import type { COProperties } from "server/engine/rules/co";
import { lashAW2 } from "server/engine/constants/cos/lash/lash-aw2";
import { getTerrainDefenseStars } from "server/engine/constants/terrain-properties";

export const lashAWDS: COProperties = {
  ...lashAW2,
  gameVersion: "AWDS",
  dayToDay: {
    description: "Units gain 5% firepower per terrain star (air units don't get terrain stars).",
    hooks: {
      attack({ attacker }) {
        if (attacker.properties.facility !== "airport") {
          const terrainStars = getTerrainDefenseStars(attacker.getTile().type);
          return 100 + 5 * terrainStars;
        }
      },
    },
  },
  powers: {
    ...lashAW2.powers,
    superCOPower: {
      name: "Prime Tactics",
      stars: 7,
      description:
        "Terrain stars are doubled, and all terrain movement cost is reduced to 1 (doesn't apply in snow).",
      hooks: {
        terrainStars: (v) => v * 2,
        movementCost: (_value, { match }) => {
          if (match.getCurrentWeather() !== "snow") {
            return 1;
          }
        },
        // needs a "redefinition" because bonus terrain stars is calculated after the firepower bonuses
        attack({ attacker }) {
          if (attacker.properties.facility !== "airport") {
            const terrainStars = getTerrainDefenseStars(attacker.getTile().type);
            return 100 + 10 * terrainStars;
          }
        },
      },
    },
  },
};
