import type { COProperties } from "../../co";
import type { MatchWrapper } from "../../../wrappers/match";
import type { PlayerInMatchWrapper } from "../../../wrappers/player-in-match";
import { getDistance } from "shared/schemas/position";
import { unitPropertiesMap } from "../../buildable-unit";
import type { Position } from "../../../schemas/position";

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
      instantEffect( {match, player} ) {
        const center = getBestPositionBolt(match, player);

        for (const unit of player.team.getEnemyUnits()) {
          if (getDistance(unit.data.position, center) <= 2) {
            unit.data.isReady = false;
            unit.damageUntil1HP(3)
          }
        }
      }
    }
  }
}

export const getBestPositionBolt = (
  match: MatchWrapper,
  vbPlayer: PlayerInMatchWrapper
): Position => {
  let bestPosition: Position = [0,0];
  let bestValue = -100000;

  //ts says this variable is redundant, but wouldnt it get called a lot of times if it was inside the double for?
  const enemyUnits = vbPlayer.team.getEnemyUnits();

  for (let i = 0; i < match.map.width; ++i) { // TODO idk if it's the other way
    for (let j = 0; j < match.map.height; ++j) {
      let currentValue = 0;

      for (const enemy of enemyUnits) {
        if (getDistance([i, j], enemy.data.position) > 2) {
          continue;
        }

        currentValue += unitPropertiesMap[enemy.data.type].cost * Math.min(3, enemy.getVisualHP());
      }

      if (currentValue > bestValue) {
        bestValue = currentValue;
        bestPosition = [i, j];
      }
    }
  }

  return bestPosition;
}