import type { COProperties } from "../../../co";

export const maxAW1: COProperties = {
  displayName: "Max",
  gameVersion: "AW1",
  dayToDay: {
    description: "Non-footsoldier direct units have +50% firepower, but indirect units have -10% firepower, -10% defense and -1 range.",
    hooks: {
      attack: ({ attacker }) => {
        if (attacker.isIndirect()) {
          return 90;
        }

        if (!attacker.isInfantryOrMech()) {
          return 150;
        }
      },
      defense({ attacker }) {
        if (attacker.isIndirect()) {
          return 90;
        }
      },
      attackRange(value, { attacker }) {
        if (attacker.isIndirect()) {
          return value - 1;
        }
      },
    }
  },
  powers: {
    COPower: {
      name: "Max Force",
      description: "Non-footsoldier direct units (and transport units) gain 1 movement and +20% firepower.",
      stars: 3,
      hooks: {
        movementPoints: (value, unit) => {
          if (!unit.isIndirect() && !unit.isInfantryOrMech()) {
            return value + 1;
          }
        },
        attack: ({ attacker }) => {
          if (attacker.isIndirect()) {
            return 90;
          }

          if (!attacker.isInfantryOrMech()) {
            return 170;
          }
        },
      },
    },
  },
};
