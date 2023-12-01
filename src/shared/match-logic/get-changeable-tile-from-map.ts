import type { WWMap } from "@prisma/client";
import type { Position } from "shared/schemas/position";
import type { PropertyTile, UnusedSiloTile } from "shared/schemas/tile";
import { willBeChangeableTile } from "shared/schemas/tile";
import type { ChangeableTile } from "shared/types/server-match-state";

const getChangeableTileFromTile = (tile: PropertyTile | UnusedSiloTile, position: Position): ChangeableTile => {
  if (tile.type === "unusedSilo") {
    return {
      type: tile.type,
      position,
      fired: false
    };
  }

  return {
    type: tile.type,
    position,
    ownerSlot: tile.playerSlot
  };
};

export const getChangeableTilesFromMap = (map: WWMap): ChangeableTile[] => {
  const changeableTiles: ChangeableTile[] = [];

  for (let y = 0; y < map.tiles.length; y++) {
    const row = map.tiles[y];

    for (let x = 0; x < row.length; x++) {
      const tile = row[x];

      if (willBeChangeableTile(tile)) {
        changeableTiles.push(getChangeableTileFromTile(tile, [x, y]));
      }
    }
  }

  return changeableTiles;
};
