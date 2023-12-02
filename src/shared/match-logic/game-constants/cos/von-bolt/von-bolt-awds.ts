import type { COProperties } from "../../../co";
import { getDistance } from "shared/schemas/position";
import { getBoltPosition } from "./get-bolt-position";

export const vonBoltAWDS: COProperties = {
  displayName: "Von Bolt",
  gameVersion: "AWDS",
  dayToDay: {
    description: "Units have +10% firepower and defense.",
    hooks: {
      attack: () => 110,
      defense: () => 110
    }
  },
  powers: {
    superCOPower: {
      name: "Ex Machina",
      description: "Creates a lightning bolt that strikes a position and deals 3 HP of damage and immobilizes all enemy units at distance 2 or less from the center.",
      stars: 10,
      calculatePositions: (player) => [getBoltPosition(player)],
      instantEffect(player, positions) {
        if (positions === undefined || positions.length !== 1) {
          throw new Error("Did not get a bolt position");
        }

        for (const unit of player.team.getEnemyUnits()) {
          if (getDistance(unit.data.position, positions[0]) <= 2) {
            unit.data.isReady = false;
            unit.damageUntil1HP(3);
          }
        }
      }
    }
  }
}

