import type { COProperties } from "../../../co";
import { samiAW2 } from "./sami-aw2";


export const samiAWDS: COProperties = {
  ...samiAW2,
  gameVersion: "AWDS",
  dayToDay: {
    description: "Footsoldiers have +20% firepower and capture at 1.5 times the normal rate (rounded down). Other direct units have -10% firepower.",
    hooks: {
      attack: ({ attacker }) => {
        if (attacker.isInfantryOrMech()) {
          return 120;
        }

        if (!attacker.isIndirect()) {
          return 90;
        }
      }
    }
  },
  powers: {
    // Same as AW2, but since d2d is "nerfed", all power descriptions have to be overwritten as well
    COPower: {
      name: "Double Time",
      description: "Footsoldiers gain 1 movement and +30% firepower.",
      stars: 3,
      hooks: {
        movementPoints: (points, unit) => {
          if (unit.isInfantryOrMech()) {
            return points + 1;
          }
        },
        attack: ({ attacker }) => {
          if (attacker.isInfantryOrMech()) {
            return 140;
          }

          if (!attacker.isIndirect()) {
            return 90;
          }
        }
      }
    },
    superCOPower: {
      name: "Victory March",
      description: "Footsoldiers gain 2 movement, +60% firepower and the ability to capture instantly.",
      stars: 8,
      hooks: {
        movementPoints: (points, unit) => {
          if (unit.isInfantryOrMech()) {
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
}
