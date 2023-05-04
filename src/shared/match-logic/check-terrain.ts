import { Tile } from "server/schemas/tile";
import { getMovementCost } from "shared/match-logic/tiles";
import { MovementType } from "shared/match-logic/buildable-unit";

export function checkTerrain(
  moveType: MovementType,
  nextTile: Tile,
  initialTile: Tile
): number | null {
  if (
    nextTile.unit !== undefined &&
    initialTile.unit !== undefined &&
    nextTile.unit.playerSlot !== initialTile.unit.playerSlot
  ) {
    return null; // null means impassable (enemy unit)
  }

  return getMovementCost(nextTile.type, moveType, "clear");
}
