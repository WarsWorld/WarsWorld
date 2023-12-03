import type { COProperties } from "../../../co";
import { drakeAW2 } from "./drake-aw2";


export const drakeAWDS: COProperties = {
  ...drakeAW2,
  gameVersion: "AWDS",
  dayToDay: {
    description:
      "Naval units have +20% firepower. Air units have -10% firepower.",
    hooks: {
      attack: ({ attacker }) => {
        if (attacker.properties.facility === "port") {
          return 120;
        }
        else if (attacker.properties.facility === "airport") {
          return 90;
        }
      }
    }
  },
}