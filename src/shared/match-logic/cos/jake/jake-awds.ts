import type { COProperties } from "../../co";

export const jakeAWDS: COProperties = {
  displayName: "Jake",
  gameVersion: "AWDS",
  dayToDay: {
    description:
      "Units have +10% firepower on top of plains (air units included).",
    hooks: {
      attack: ({ attacker }) => {
        if (attacker.getTile().type === "plain") {
          return 110;
        }
      }
    }
  },
  powers: {
    COPower: {
      name: "Beat Down",
      description:
        "Units gain +10% more firepower on top of plains, and ground indirects gain +1 range.",
      stars: 3,
      hooks: {
        attack: ({ attacker }) => {
          if (attacker.getTile().type === "plain") {
            return 120;
          }
        },
        attackRange: (range, { attacker }) => {
          if (
            attacker.properties().facility === "base" &&
            attacker.isIndirect()
          ) {
            return range + 1;
          }
        }
      }
    },
    superCOPower: {
      name: "Block Rock",
      description:
        "Units gain +30% more firepower on top of plains, ground indirects gain +1 range and ground vehicles gain +2 movement.",
      stars: 6,
      hooks: {
        attack: ({ attacker }) => {
          if (attacker.getTile().type === "plain") {
            return 140;
          }
        },
        attackRange: (range, { attacker }) => {
          if (
            attacker.properties().facility === "base" &&
            attacker.isIndirect()
          ) {
            return range + 1;
          }
        },
        movementPoints: (points, unit) => {
          if (
            unit.properties().facility === "base" &&
            unit.data.type !== "infantry" &&
            unit.data.type !== "mech"
          ) {
            return points + 2;
          }
        }
      }
    }
  }
};
