import type { COProperties } from "../../../co";

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
    // IMPORTANT: only type of healing that does not round up!
    COPower: {
      name: "Black Wave",
      stars: 5,
      description:
        "All units heal 1 HP, and all enemy units lose 1 HP (to a minimum of 0.1HP).",
      instantEffect(player) {
        player.getUnits().forEach((unit) => {
          // need to add this hidden check, but units will never be hidden cause they are hawke's units, not sonja's
          if (unit.data.stats !== "hidden") {
            unit.data.stats.hp = Math.min(unit.data.stats.hp + 10, 100);
          }
        });
        player.team.getEnemyUnits().forEach(unit => unit.damageUntil1HP(1));
      }
    },
    superCOPower: {
      name: "Black Storm",
      stars: 9,
      description:
        "All units heal 2 HP, and all enemy units lose 2 HP (to a minimum of 0.1HP).",
      instantEffect(player) {
        player.getUnits().forEach((unit) => {
          // need to add this hidden check, but units will never be hidden cause they are hawke's units, not sonja's
          if (unit.data.stats !== "hidden") {
            unit.data.stats.hp = Math.min(unit.data.stats.hp + 20, 100);
          }
        });
        player.team.getEnemyUnits().forEach(unit => unit.damageUntil1HP(2));
      }
    }
  }
};
