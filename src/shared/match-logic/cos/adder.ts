import type { COProperties } from "../co";

export const adder: COProperties = {
  displayName: "Adder",
  powers: {
    COPower: {
      name: "Sideslip",
      description: "",
      stars: 2,
      hooks: {
        movementRange: (value) => value + 1,
      },
    },
    superCOPower: {
      name: "Sidewinder",
      description: "",
      stars: 5,
      hooks: {
        movementRange: (value) => value + 2,
      },
    },
  },
};
