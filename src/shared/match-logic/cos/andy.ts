import type { COProperties } from "../co";

export const andy: COProperties = {
  displayName: "Andy",

  powers: {
    COPower: {
      name: "Hyper Repair",
      description: "All units gain +2HP.",
      stars: 3,
      instantEffect({ attackerData: currentPlayerData }) {
        currentPlayerData.player.getUnits().healAll(20);
      },
    },
    superCOPower: {
      name: "Hyper Upgrade",
      description: "All units gain +5HP, +10% attack.ts, and +1 movement.",
      stars: 6,
      instantEffect({ attackerData: currentPlayerData }) {
        currentPlayerData.player.getUnits().healAll(50);
      },
      hooks: {
        onMovementRange: (value) => value + 1,
        onAttackModifier: (value) => value + 10,
      },
    },
  },
};
