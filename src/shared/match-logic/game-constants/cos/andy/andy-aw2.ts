import type { COProperties } from "../../../co";
import { andyAW1 } from "./andy-aw1";

export const andyAW2: COProperties = {
  ...andyAW1,
  gameVersion: "AW2",
  powers: {
    ...andyAW1.powers,
    superCOPower: {
      name: "Hyper Upgrade",
      description: "All units heal 5 HP, and gain 20% firepower and 1 movement.",
      stars: 6,
      instantEffect(player) {
        player.getUnits().forEach((unit) => unit.heal(5));
      },
      hooks: {
        movementPoints: (value) => value + 1,
        attack: () => 120,
      },
    },
  },
};
