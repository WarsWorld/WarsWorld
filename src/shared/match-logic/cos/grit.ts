import { COProperties } from "../co";
import { isIndirectAttackUnit } from "../units";

export const grit: COProperties = {
  displayName: "Grit",
  dayToDay: {
    description:
      "Indirect units have +1 range and gain +20% attack. Direct units lose -20% attack (footsoldiers are normal).",
    hooks: {
      onAttackRange({ currentValue, currentPlayerData: currentPlayer }) {
        if (isIndirectAttackUnit(currentPlayer.unitType)) {
          return currentValue + 1;
        }

        return currentValue;
      },
      onAttackModifier({ currentValue, currentPlayerData: currentPlayer }) {
        if (isIndirectAttackUnit(currentPlayer.unitType)) {
          return currentValue + 20;
        }

        if (
          currentPlayer.unitType === "infantry" ||
          currentPlayer.unitType === "mech"
        ) {
          return currentValue;
        }

        return currentValue - 20;
      },
    },
  },
  powers: {
    COPower: {
      name: "Snipe Attack",
      description: "Indirect units gain +1 range and +20% attack.",
      stars: 3,
      hooks: {
        onAttackRange({ currentValue, currentPlayerData: currentPlayer }) {
          if (isIndirectAttackUnit(currentPlayer.unitType)) {
            return currentValue + 1;
          }

          return currentValue;
        },
        onAttackModifier({ currentValue, currentPlayerData: currentPlayer }) {
          if (isIndirectAttackUnit(currentPlayer.unitType)) {
            return currentValue + 20;
          }

          return currentValue;
        },
      },
    },
    superCOPower: {
      name: "Super Snipe",
      description: "Indirect units gain +2 range and +20% attack.",
      stars: 6,
      hooks: {
        onAttackRange({ currentValue, currentPlayerData: currentPlayer }) {
          if (isIndirectAttackUnit(currentPlayer.unitType)) {
            return currentValue + 2;
          }

          return currentValue;
        },
        onAttackModifier({ currentValue, currentPlayerData: currentPlayer }) {
          if (isIndirectAttackUnit(currentPlayer.unitType)) {
            return currentValue + 20;
          }

          return currentValue;
        },
      },
    },
  },
};
