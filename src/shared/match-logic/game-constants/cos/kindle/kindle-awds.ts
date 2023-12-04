import type { COProperties } from "../../../co";

export const kindleAWDS: COProperties = {
  displayName: "Kindle",
  gameVersion: "AWDS",
  dayToDay: {
    description: "Units have +40% firepower on top of properties (air units included).",
    hooks: {
      attack: ( {attacker} ) => {
        if ("playerSlot" in attacker.getTile()) {
          return 140;
        }
      }
    }
  },
  powers: {
    COPower: {
      name: "Urban Blight",
      description: "Units gain +40% more firepower on top of properties. Enemy units on top of a property lose 3 HP.",
      stars: 3,
      instantEffect(player) {
        for (const unit of player.team.getEnemyUnits()) {
          if ("playerSlot" in unit.getTile()) {
            unit.damageUntil1HP(3);
          }
        }
      },
      hooks: {
        attack: ( {attacker} ) => {
          if ("playerSlot" in attacker.getTile()) {
            return 180;
          }
        }
      }
    },
    superCOPower: {
      name: "High Society",
      description: "Units gain +80% more firepower on top of properties, and all units gain an additional +3% firepower per property owned.",
      stars: 6,
      hooks: {
        attack: ( {attacker} ) => {
          let bonusFirepower = 0;

          for (const tile of attacker.match.changeableTiles) {
            if ("playerSlot" in tile && attacker.player.owns(tile)) {
              bonusFirepower += 3;
            }
          }

          if (attacker.getTile().type === "city") {
            return 220 + bonusFirepower;
          }
          else {
            return 100 + bonusFirepower;
          }
        }
      }
    }
  }
};
