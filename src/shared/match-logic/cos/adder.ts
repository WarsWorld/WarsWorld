import { COProperties } from "../co";

export const adder: COProperties = {
  displayName: "Adder",
  powers: {
    COPower: {
      name: "Sideslip",
      description: "",
      stars: 2,
      hooks: {
        onMovementRange: ({ currentValue }) => currentValue + 1,
      },
    },
    superCOPower: {
      name: "Sidewinder",
      description: "",
      stars: 5,
      hooks: {
        onMovementRange: ({ currentValue }) => currentValue + 2,
      },
    },
  },
};
