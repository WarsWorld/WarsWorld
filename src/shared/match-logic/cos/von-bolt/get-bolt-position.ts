import type { PlayerInMatchWrapper } from "../../../wrappers/player-in-match";
import type { Position } from "../../../schemas/position";
import { getDistance } from "../../../schemas/position";

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