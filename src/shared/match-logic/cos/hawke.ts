import { COProperties } from "../co";
import { healUnit, getEnemyUnits, damageUnitUntil1HP } from "../units";

export const hawke: COProperties = {
  displayName: "Hawke",
  dayToDay: {
    description: "Units gain +10% attack.ts.",
    hooks: {
      onAttackModifier: ({ currentValue }) => currentValue + 10,
    },
  },
  powers: {
    COPower: {
      name: "Black Wave",
      stars: 5,
      description:
        "All units gain +1HP, and all enemy units lose -1HP (to a minimum of 0.1HP).",
      instantEffect({ matchState, currentPlayerData }) {
        currentPlayerData.getUnits().forEach((unit) => healUnit(unit, 1));

        getEnemyUnits(matchState, currentPlayerData.player.slot).forEach(
          (unit) => damageUnitUntil1HP(unit, 1)
        );
      },
    },
    superCOPower: {
      name: "Black Storm",
      stars: 9,
      description:
        "All units gain +2HP, and all enemy units lose -2HP (to a minimum of 0.1HP).",
      instantEffect({ matchState, currentPlayerData }) {
        currentPlayerData.getUnits().forEach((unit) => healUnit(unit, 2));

        getEnemyUnits(matchState, currentPlayerData.player.slot).forEach(
          (unit) => damageUnitUntil1HP(unit, 2)
        );
      },
    },
  },
};
