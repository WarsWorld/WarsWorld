import type { COProperties } from "../co";

export const hawke: COProperties = {
  displayName: "Hawke",
  dayToDay: {
    description: "Units gain +10% attack.ts.",
    hooks: {
      attack: (value) => value + 10,
    },
  },
  powers: {
    COPower: {
      name: "Black Wave",
      stars: 5,
      description:
        "All units gain +1HP, and all enemy units lose -1HP (to a minimum of 0.1HP).",
      instantEffect({ player }) {
        player.getUnits().healAll(10);
        player.getEnemyUnits().damageAllUntil1HP(10);
      },
    },
    superCOPower: {
      name: "Black Storm",
      stars: 9,
      description:
        "All units gain +2HP, and all enemy units lose -2HP (to a minimum of 0.1HP).",
      instantEffect({ player }) {
        player.getUnits().healAll(20);
        player.getEnemyUnits().damageAllUntil1HP(20);
      },
    },
  },
};
