import { Tile } from "server/schemas/tile";
import { MovementType } from "shared/match-logic/buildable-unit";
import { getMovementCost } from "./tiles/get-movement-cost";

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
