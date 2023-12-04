import type { PlayerInMatchWrapper } from "../../../../wrappers/player-in-match";
import type { Position } from "../../../../schemas/position";
import { getDistance } from "../../../../schemas/position";

// TODO i think this logic can be merged with sturm meteor
// by adding a parameter to control whether own units should be ignored (von-bolt)
// or if they should count negatively towards value like with meteor strike.
// i think that this algorithm here can hit a non-unit field though unlike
// meteor strike, right? is that accurate to AWDS?
// - Function

export const getBoltPosition = (
  vbPlayer: PlayerInMatchWrapper
): Position => {
  let bestPosition: Position = [0,0];
  let bestValue = Number.NEGATIVE_INFINITY;

  const enemyUnits = vbPlayer.team.getEnemyUnits();

  for (let y = 0; y < vbPlayer.match.map.height; y++) {
    for (let x = 0; x < vbPlayer.match.map.width; x++) {
      let currentValue = 0;

      for (const enemy of enemyUnits) {
        if (getDistance([x, y], enemy.data.position) > 2) {
          continue;
        }

        currentValue +=
          (enemy.getBuildCost() / 10) * Math.min(3, enemy.getVisualHP());
      }

      if (currentValue > bestValue) {
        bestValue = currentValue;
        bestPosition = [x, y];
      }
    }
  }

  return bestPosition;
}