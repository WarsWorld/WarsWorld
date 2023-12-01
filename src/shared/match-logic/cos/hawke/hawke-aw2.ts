import type { COProperties } from "../../co";

export const hawkeAW2: COProperties = {
  displayName: "Hawke",
  gameVersion: "AW2",
  dayToDay: {
    description: "Units have +10% firepower.",
    hooks: {
      attack: () => 110
    }
  },
  powers: {
    COPower: {
      name: "Black Wave",
      stars: 5,
      description:
        "All units heal 1 HP, and all enemy units lose 1 HP (to a minimum of 0.1HP).",
      instantEffect(player) {
        player.getUnits().forEach((unit) => unit.heal(10));
        player.team.getEnemyUnits().forEach(unit => unit.damageUntil1HP(10));
      }
    },
    superCOPower: {
      name: "Black Storm",
      stars: 9,
      description:
        "All units heal 2 HP, and all enemy units lose 2 HP (to a minimum of 0.1HP).",
      instantEffect(player) {
        player.getUnits().forEach((unit) => unit.heal(20));
        player.team.getEnemyUnits().forEach(unit => unit.damageUntil1HP(20));
      }
    }
  }
};
