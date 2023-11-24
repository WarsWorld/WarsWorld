import type { COProperties } from "../co";

export const grit: COProperties = {
  displayName: "Grit",
  dayToDay: {
    description:
      "Indirect units have +1 range and gain +20% attack.ts. Direct units lose -20% attack.ts (footsoldiers are normal).",
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

        if (attacker.properties().movementType !== "foot") {
          return 80;
        }
      }
    }
  },
  powers: {
    COPower: {
      name: "Snipe Attack",
      description: "Indirect units gain +1 range and +20% attack.ts.",
      stars: 3,
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
        }
      }
    },
    superCOPower: {
      name: "Super Snipe",
      description: "Indirect units gain +2 range and +20% attack.ts.",
      stars: 6,
      hooks: {
        attackRange(value, { attacker }) {
          if (attacker.isIndirect()) {
            return value + 2;
          }
        },
        attack({ attacker }) {
          if (attacker.isIndirect()) {
            return 120;
          }
        }
      }
    }
  }
};
