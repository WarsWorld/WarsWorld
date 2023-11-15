//TODO: only implemented for standard. for FOW it's a lot harder.
import { MatchWrapper } from "shared/wrappers/match";
import { Position } from "../../schemas/position";
import { WWUnit } from "../../schemas/unit";

const dirsX = [-1, 1, 0, 0];
const dirsY = [0, 0, -1, 1];

export const getDiscoveredUnits = (
  matchState: MatchWrapper,
  position: Position
) => {
  const units: WWUnit[] = [];
  for (let i = 0; i < 4; ++i) {
    const position1: Position = [
      position[0] + dirsX[i],
      position[1] + dirsY[i],
    ];

    if (matchState.map.isOutOfBounds(position1)) {
      continue;
    }

    const adjacentUnit = matchState.players
      .getCurrentTurnPlayer()
      .getEnemyUnits()
      .getUnit(position1);

    if (adjacentUnit === undefined) {
      continue;
    }

    if ("hidden" in adjacentUnit && adjacentUnit.hidden) {
      units.push(adjacentUnit);
    }
  }
  return units;
};
