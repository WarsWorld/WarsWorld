import { COProperties } from "../co";
import { isIndirectAttackUnit } from "../units";

export const grit: COProperties = {
  displayName: "Grit",
  dayToDay: {
    description:
      "Indirect units have +1 range and gain +20% attack.ts. Direct units lose -20% attack.ts (footsoldiers are normal).",
    hooks: {
      onAttackRange(value, { attackerData: currentPlayer }) {
        if (isIndirectAttackUnit(currentPlayer.unitType)) {
          return value + 1;
        }
      },
      onAttackModifier(value, { attackerData: { unitType } }) {
        if (isIndirectAttackUnit(unitType)) {
          return value + 20;
        }

        if (unitType !== "infantry" && unitType !== "mech") {
          return value - 20;
        }
      },
    },
  },
  powers: {
    COPower: {
      name: "Snipe Attack",
      description: "Indirect units gain +1 range and +20% attack.ts.",
      stars: 3,
      hooks: {
        onAttackRange(value, { attackerData: currentPlayer }) {
          if (isIndirectAttackUnit(currentPlayer.unitType)) {
            return value + 1;
          }
        },
        onAttackModifier(value, { attackerData: currentPlayer }) {
          if (isIndirectAttackUnit(currentPlayer.unitType)) {
            return value + 20;
          }
        },
      },
    },
    superCOPower: {
      name: "Super Snipe",
      description: "Indirect units gain +2 range and +20% attack.ts.",
      stars: 6,
      hooks: {
        onAttackRange(value, { attackerData: currentPlayerData }) {
          if (isIndirectAttackUnit(currentPlayerData.unitType)) {
            return value + 2;
          }
        },
        onAttackModifier(value, { attackerData: currentPlayerData }) {
          if (isIndirectAttackUnit(currentPlayerData.unitType)) {
            return value + 20;
          }
        },
      },
    },
  },
};
