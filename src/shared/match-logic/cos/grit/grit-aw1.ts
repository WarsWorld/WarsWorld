import type { COProperties } from "../../co";

export const gritAW1: COProperties = {
  displayName: "Grit",
  gameVersion: "AW1",
  dayToDay: {
    description:
      "Indirect units have +1 range. Direct units (including footsoldiers) lose -20% firepower.",
    hooks: {
      attackRange(value, { attacker }) {
        if (attacker.isIndirect()) {
          return value + 1;
        }
      },
      attack({ attacker }) {
        if (!attacker.isIndirect()) {
          return 80;
        }
      }
    }
  },
  powers: {
    COPower: {
      name: "Snipe Attack",
      description: "Indirect units gain +2 additional range and +50% firepower.",
      stars: 3,
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
        }
      }
    }
  }
};
