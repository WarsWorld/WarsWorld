//TODO: only implemented for standard. for FOW it's a lot harder.
import { WWUnit } from "../../schemas/unit";
import { BackendMatchState } from "../../../shared/types/server-match-state";
import { Position } from "../../schemas/position";
import {
  getUnitAtPosition,
  isOutsideOfMap,
} from "../../../shared/match-logic/positions";

const dirsX = [-1, 1, 0, 0];
const dirsY = [0, 0, -1, 1];

export const getDiscoveredUnits = (
  matchState: BackendMatchState,
  position: Position
) => {
  const units: WWUnit[] = [];
  for (let i = 0; i < 4; ++i) {
    const position1: Position = [
      position[0] + dirsX[i],
      position[1] + dirsY[i],
    ];
    if (isOutsideOfMap(matchState.map, position1)) continue;
    const adjacentUnit = getUnitAtPosition(matchState, position);
    if (adjacentUnit === null) continue; //TODO: check if unit is enemy (hard?)
    if (adjacentUnit.type === "sub" || adjacentUnit.type === "stealth") {
      if (adjacentUnit.hidden) units.push(adjacentUnit);
    }
  }
  return units;
};
