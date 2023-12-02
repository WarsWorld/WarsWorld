import type { COProperties } from "../../../co";

export const andyAW1: COProperties = {
  displayName: "Andy",
  gameVersion: "AW1",
  powers: {
    COPower: {
      name: "Hyper Repair",
      description: "All units heal 2 HP.",
      stars: 3,
      instantEffect(player) {
        player.getUnits().forEach((unit) => unit.heal(20));
      }
    }
  }
};
