import type { COProperties } from "../../co";

export const samiAW2: COProperties = {
  displayName: "Sami",
  gameVersion: "AW2",
  dayToDay: {
    description: "Footsoldiers have +30% firepower and capture at 1.5 times the normal rate (rounded down). Transport units have +1 movement point. Other direct units have -10% firepower.",
    hooks: {
      movementPoints: (points, unit) => {
        if ("loadedUnit" in unit.properties()) { // if it's a transport
          return points + 1;
        }
      },
      attack: ({ attacker }) => {
        if (attacker.isInfantryOrMech()) {
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
        movementPoints: (points, unit) => {
          if ("loadedUnit" in unit.properties()) { // if it's a transport
            return points + 1;
          }

          if (unit.isInfantryOrMech()){
            return points + 1;
          }
        },
        attack: ({ attacker }) => {
          if (attacker.isInfantryOrMech()) {
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
        // capturing handled in abiltiy event
        movementPoints: (points, unit) => {
          if ("loadedUnit" in unit.properties()) { // if it's a transport
            return points + 1;
          }

          if (unit.isInfantryOrMech()){
            return points + 2;
          }
        },
        attack: ({ attacker }) => {
          if (attacker.isInfantryOrMech()) {
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
