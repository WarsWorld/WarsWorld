import type { COProperties } from "../../co";

export const koalAWDS: COProperties = {
  displayName: "Koal",
  gameVersion: "AWDS",
  dayToDay: {
    description: "Units have +10% firepower on top of roads (air units included).",
    hooks: {
      attack: ( {attacker} ) => {
        if (attacker.getTileOrThrow().type === "road") {
          return 110;
        }
      },
    }
  },
  powers: {
    COPower: {
      name: "Forced March",
      description: "Units gain +1 movement and +10% more firepower on top of roads.",
      stars: 3,
      hooks: {
        attack: ( {attacker} ) => {
          if (attacker.getTileOrThrow().type === "road") {
            return 120;
          }
        },
        movementRange: (range) => range + 1
      }
    },
    superCOPower: {
      name: "Trail of Woe",
      description: "Units gain +2 movement and +20% more firepower on top of roads.",
      stars: 5,
      hooks: {
        attack: ( {attacker} ) => {
          if (attacker.getTileOrThrow().type === "road") {
            return 130;
          }
        },
        movementRange: (range) => range + 2
      }
    }
  }
};
