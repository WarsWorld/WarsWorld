import type { COProperties } from "../../../co";

export const adderAW2: COProperties = {
  displayName: "Adder",
  gameVersion: "AW2",
  powers: {
    COPower: {
      name: "Sideslip",
      description: "All units gain 1 movement.",
      stars: 2,
      hooks: {
        movementPoints: (value) => value + 1,
      },
    },
    superCOPower: {
      name: "Sidewinder",
      description: "All units gain 2 movement.",
      stars: 5,
      hooks: {
        movementPoints: (value) => value + 2,
      },
    },
  },
};
