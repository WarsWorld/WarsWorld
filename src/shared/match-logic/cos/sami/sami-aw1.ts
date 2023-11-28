import type { COProperties } from "../../co";

export const samiAW1: COProperties = {
  displayName: "Sami",
  gameVersion: "AW1",
  dayToDay: {
    description: "Footsoldiers have +20% firepower and +10% defense, and capture at 1.5 times the normal rate (rounded down). Transport units have +1 movement range. Other direct units have -10% firepower.",
    hooks: {
      // TODO if i remember correctly capture is an edge case handled somewhere else
      movementRange: (range, unit) => {
        if ("loadedUnit" in unit.properties()) { //if it's a transport
          return range + 1;
        }
      },
      attack: ({ attacker }) => {
        if (attacker.data.type === "infantry" || attacker.data.type === "mech") {
          return 120;
        }

        if (!attacker.isIndirect()) {
          return 90;
        }
      },
      defense: ({ attacker }) => {
        if (attacker.data.type === "infantry" || attacker.data.type === "mech") {
          return 110;
        }
      }
    }
  },
  powers: {
    COPower: {
      name: "Double Time",
      description: "Footsoldiers gain 1 movement, 20% firepower and 10% defense, and all terrain cost is reduced to 1 (only for footsoldiers).",
      stars: 2.5, //xdd
      hooks: {
        movementRange: (range, unit) => {
          if ("loadedUnit" in unit.properties()) { //if it's a transport
            return range + 1;
          }

          if (unit.data.type === "infantry" || unit.data.type === "mech"){
            return range + 1;
          }
        },
        movementCost: (_value, match) => { // TODO AAAAAAAAAAAAAAA this needs a unit/ unittype
          if (unit.data.type === "infantry" || unit.data.type === "mech") {
            return 1;
          }
        },
        attack: ({ attacker }) => {
          if (attacker.data.type === "infantry" || attacker.data.type === "mech") {
            return 140;
          }

          if (!attacker.isIndirect()) {
            return 90;
          }
        },
        defense: ({ attacker }) => {
          if (attacker.data.type === "infantry" || attacker.data.type === "mech") {
            return 120;
          }
        }
      }
    },
  }
};
