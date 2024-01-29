import type { COProperties } from "../../../co";
import { getDistance } from "shared/schemas/position";
import { getMissilePositions } from "../rachel/get-missile-positions";

export const vonBoltAWDS: COProperties = {
  displayName: "Von Bolt",
  gameVersion: "AWDS",
  dayToDay: {
    description: "Units have +10% firepower and defense.",
    hooks: {
      attack: () => 110,
      defense: () => 110,
    },
  },
  powers: {
    superCOPower: {
      name: "Ex Machina",
      description:
        "Creates a lightning bolt that strikes a position and deals 3 HP of damage and immobilizes all units at distance 2 or less from the center. The strike position is decided randomly between most HP or most value in damages, subtracting own units hp/value.",
      stars: 10,
      calculatePositions: (player) => {
        // vb and rachel share missile position calculations. vb can either get the hp or the value position (random).
        const missilePositions = getMissilePositions(player);
        return [missilePositions[Math.floor(Math.random() * 2) + 1]];
      },
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
      },
    },
  },
};
