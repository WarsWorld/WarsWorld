import { Tile } from "components/schemas/tile";
import { getMovementCost } from "server/match-logic/tiles";
import { MovementType } from "types/core-game/buildable-unit";

export function checkTerrain(
  moveType: MovementType,
  nextTile: Tile,
  initialTile: Tile,
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
