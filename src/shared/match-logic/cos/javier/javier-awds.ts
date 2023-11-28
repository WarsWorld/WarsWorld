import type { COProperties } from "../../co";

export const javierAWDS: COProperties = {
  displayName: "Javier",
  gameVersion: "AWDS",
  dayToDay: {
    description:
      "Units have +20% defense against indirect units. Comm Towers grant all units additional +10% defense.",
    hooks: {
      defense({ attacker }) {
        const bonusFromIndirectAttacks = attacker.isIndirect() ? 20 : 0;

        return (
          100 +
          attacker.player.getCommtowerAttackBoost() +
          bonusFromIndirectAttacks
        );
      }
    }
  },
  powers: {
    COPower: {
      name: "Tower Shield",
      stars: 3,
      description:
        "Indirect defense is increased to +40%. Comm Tower bonuses are doubled.",
      hooks: {
        defense({ defender }) {
          const bonusFromIndirectAttacks = defender.isIndirect()
            ? 40
            : 0;

          return (
            100 +
            defender.player.getCommtowerAttackBoost() * 2 +
            bonusFromIndirectAttacks
          );
        },
        attack({ attacker }) {
          return 100 + attacker.player.getCommtowerAttackBoost(); //one boost is already applied automatically by default
        }
      }
    },
    superCOPower: {
      name: "Tower of Power",
      stars: 6,
      description:
        "Indirect defense is increased to +60%. Comm Tower bonuses are tripled.",
      hooks: {
        defense({ defender }) {
          const bonusFromIndirectAttacks = defender.isIndirect()
            ? 60
            : 0;

          return (
            100 +
            defender.player.getCommtowerAttackBoost() * 3 +
            bonusFromIndirectAttacks
          );
        },
        attack({ attacker }) {
          return 100 + attacker.player.getCommtowerAttackBoost() * 2;
        }
      }
    }
  }
};
