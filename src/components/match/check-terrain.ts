import { MapTile } from "server/tools/map-parser";
import { MoveType } from "./unit-builder";

const movementCostClear: Record<string, Record<MoveType, number>> = {
  plain: { F: 1, B: 1, T: 1, W: 2, A: 1, P: 9, S: 9, L: 9 },
  mountain: { F: 2, B: 1, T: 9, W: 9, A: 1, P: 9, S: 9, L: 9 },
  forest: { F: 1, B: 1, T: 2, W: 3, A: 1, P: 9, S: 9, L: 9 },
  river: { F: 2, B: 1, T: 9, W: 9, A: 1, P: 9, S: 9, L: 9 },
  road: { F: 1, B: 1, T: 1, W: 1, A: 1, P: 9, S: 9, L: 9 },
  sea: { F: 9, B: 9, T: 9, W: 9, A: 1, P: 9, S: 1, L: 1 },
  shoal: { F: 1, B: 1, T: 1, W: 1, A: 1, P: 9, S: 9, L: 1 },
  reef: { F: 9, B: 9, T: 9, W: 9, A: 1, P: 9, S: 2, L: 2 },
  pipe: { F: 9, B: 9, T: 9, W: 9, A: 9, P: 1, S: 9, L: 9 },
  base: { F: 1, B: 1, T: 1, W: 1, A: 1, P: 1, S: 9, L: 9 },
  port: { F: 1, B: 1, T: 1, W: 1, A: 1, P: 9, S: 1, L: 1 },
  property: { F: 1, B: 1, T: 1, W: 1, A: 1, P: 9, S: 9, L: 9 },
};

export function checkTerrain(
  moveType: MoveType,
  nextTile: MapTile,
  initialTile: MapTile,
): number | null {
  if (
    nextTile.unit !== false &&
    initialTile.unit !== false &&
    nextTile.unit.country !== initialTile.unit.country
  ) {
    return null; // null means impassable (enemy unit)
  }

  return movementCostClear[nextTile.terrainType][moveType];
}
