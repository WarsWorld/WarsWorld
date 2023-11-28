import type { COProperties } from "../../co";

export const samiAW2: COProperties = {
  displayName: "Sami",
  gameVersion: "AW2",
  dayToDay: {
    description: "Footsoldiers have +30% firepower and capture at 1.5 times the normal rate (rounded down). Transport units have +1 movement range. Other direct units have -10% firepower.",
    hooks: {
      // TODO if i remember correctly capture is an edge case handled somewhere else
      movementRange: (range, unit) => {
        if ("loadedUnit" in unit.properties()) { // if it's a transport
          return range + 1;
        }
      },
      attack: ({ attacker }) => {
        if (attacker.data.type === "infantry" || attacker.data.type === "mech") {
          return 130;
        }

        if (!attacker.isIndirect()) {
          return 90;
        }
      }
    }
  },
  powers: {
    COPower: {
      name: "Double Time",
      description: "Footsoldiers gain 1 movement and +20% firepower.",
      stars: 3,
      hooks: {
        movementRange: (range, unit) => {
          if ("loadedUnit" in unit.properties()) { // if it's a transport
            return range + 1;
          }

          if (unit.data.type === "infantry" || unit.data.type === "mech"){
            return range + 1;
          }
        },
        attack: ({ attacker }) => {
          if (attacker.data.type === "infantry" || attacker.data.type === "mech") {
            return 150;
          }

          if (!attacker.isIndirect()) {
            return 90;
          }
        }
      }
    },
    superCOPower: {
      name: "Victory March",
      description: "Footsoldiers gain 2 movement, +50% firepower and the ability to capture instantly.",
      stars: 8,
      hooks: {
        //TODO again, i think this is handled in a capture edge case somewhere else
        movementRange: (range, unit) => {
          if ("loadedUnit" in unit.properties()) { // if it's a transport
            return range + 1;
          }

          if (unit.data.type === "infantry" || unit.data.type === "mech"){
            return range + 2;
          }
        },
        attack: ({ attacker }) => {
          if (attacker.data.type === "infantry" || attacker.data.type === "mech") {
            return 180;
          }

          if (!attacker.isIndirect()) {
            return 90;
          }
        }
      }
    }
  }
};
