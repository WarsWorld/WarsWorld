import type { COProperties } from "server/engine/rules/co";
import { drakeAW2 } from "server/engine/constants/cos/drake/drake-aw2";

export const drakeAWDS: COProperties = {
  ...drakeAW2,
  gameVersion: "AWDS",
  dayToDay: {
    description: "Naval units have +20% firepower. Air units have -10% firepower.",
    hooks: {
      attack: ({ attacker }) => {
        if (attacker.properties.facility === "port") {
          return 120;
        } else if (attacker.properties.facility === "airport") {
          return 90;
        }
      },
    },
  },
};
