import type { COProperties } from "../../../co";
import { lashAW2 } from "./lash-aw2";
import { getTerrainDefenseStars } from "../../terrain-properties";


export const lashAWDS: COProperties = {
  ...lashAW2,
  gameVersion: "AWDS",
  dayToDay: {
    description: "Units gain 5% firepower per terrain star (air units don't get terrain stars).",
    hooks: {
      attack({ attacker }) {
        if (attacker.properties.facility !== "airport") {
          const terrainStars = getTerrainDefenseStars(attacker.getTile().type);
          return 100 + 5*terrainStars;
        }
      }
    }
  }
}