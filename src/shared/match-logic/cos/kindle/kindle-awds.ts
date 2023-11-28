import type { COProperties } from "../../co";

export const kindleAWDS: COProperties = {
  displayName: "Kindle",
  gameVersion: "AWDS",
  dayToDay: {
    description: "Units have +40% firepower on top of properties (air units included).",
    hooks: {
      attack: ( {attacker} ) => {
        if ("ownerSlot" in attacker.getTileOrThrow()) {
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
      instantEffect( {player} ) {
        for (const unit of player.getEnemyUnits().data) {
          if ("ownerSlot" in unit.getTileOrThrow()) {
            unit.damageUntil1HP(3);
          }
        }
      },
      hooks: {
        attack: ( {attacker} ) => {
          if ("ownerSlot" in attacker.getTileOrThrow()) {
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
          // TODO is this correct? Move this logic somewhere else?
          let bonusFirepower = 0;

          for (const tile of attacker.match.changeableTiles) {
            if ("ownerSlot" in tile && tile.ownerSlot === attacker.player.data.slot) {
              bonusFirepower += 3;
            }
          }

          if (attacker.getTileOrThrow().type === "city") {
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
