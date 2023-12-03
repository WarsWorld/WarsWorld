import type { COProperties } from "../../../co";

export const gritAW2: COProperties = {
  displayName: "Grit",
  gameVersion: "AW2",
  dayToDay: {
    description:
      "Indirect units have +1 range and +20% firepower. Direct units have -20% firepower (footsoldiers are normal).",
    hooks: {
      attackRange(value, { attacker }) {
        if (attacker.isIndirect()) {
          return value + 1;
        }
      },
      attack({ attacker }) {
        if (attacker.isIndirect()) {
          return 120;
        }

        if (!attacker.isInfantryOrMech()) {
          return 80;
        }
      }
    }
  },
  powers: {
    COPower: {
      name: "Snipe Attack",
      description: "Indirect units gain +1 range and +30% firepower.",
      stars: 3,
      hooks: {
        attackRange(value, { attacker }) {
          if (attacker.isIndirect()) {
            return value + 2;
          }
        },
        attack({ attacker }) {
          if (attacker.isIndirect()) {
            return 150;
          }

          if (!attacker.isInfantryOrMech()) {
            return 80;
          }
        }
      }
    },
    superCOPower: {
      name: "Super Snipe",
      description: "Indirect units gain +2 range and +30% firepower.",
      stars: 6,
      hooks: {
        attackRange(value, { attacker }) {
          if (attacker.isIndirect()) {
            return value + 3;
          }
        },
        attack({ attacker }) {
          if (attacker.isIndirect()) {
            return 150;
          }

          if (!attacker.isInfantryOrMech()) {
            return 80;
          }
        }
      }
    }
  }
};
