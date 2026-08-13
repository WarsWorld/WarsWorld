import type { COProperties } from "server/engine/rules/co";
import { nellAW1 } from "server/engine/constants/cos/nell/nell-aw1";

export const nellAW2: COProperties = {
  ...nellAW1,
  gameVersion: "AW2",
  powers: {
    ...nellAW1.powers,
    superCOPower: {
      name: "Lady Luck",
      description: "Luck is increased by an extra 80% (for a total of 100%).",
      stars: 6,
      hooks: {
        maxGoodLuck: () => 100,
      },
    },
  },
};
