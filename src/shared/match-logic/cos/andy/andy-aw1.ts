import type { COProperties } from "../../co";

export const andyAW1: COProperties = {
  displayName: "Andy",
  gameVersion: "AW1",
  powers: {
    COPower: {
      name: "Hyper Repair",
      description: "All units heal 2 HP.",
      stars: 3,
      instantEffect({ player }) {
        player.getUnits().data.forEach((u) => u.heal(20));
      }
    }
  }
};
