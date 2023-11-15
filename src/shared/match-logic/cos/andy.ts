import { COProperties } from "../co";
import { getPlayerUnits, healUnit } from "../units";

export const andy: COProperties = {
  displayName: "Andy",

  powers: {
    COPower: {
      name: "Hyper Repair",
      description: "All units gain +2HP.",
      stars: 3,
      instantEffect({ matchState, currentPlayerData }) {
        getPlayerUnits(matchState, currentPlayerData.player.slot).forEach(
          (unit) => healUnit(unit, 20)
        );
      },
    },
    superCOPower: {
      name: "Hyper Upgrade",
      description: "All units gain +5HP, +10% attack.ts, and +1 movement.",
      stars: 6,
      instantEffect({ matchState, currentPlayerData }) {
        getPlayerUnits(matchState, currentPlayerData.player.slot).forEach(
          (unit) => healUnit(unit, 50)
        );
      },
      hooks: {
        onMovementRange: ({ currentValue }) => currentValue + 1,
        onAttackModifier: ({ currentValue }) => currentValue + 10,
      },
    },
  },
};
