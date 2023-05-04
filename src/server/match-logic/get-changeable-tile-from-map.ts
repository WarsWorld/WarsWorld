import { WWMap } from "@prisma/client";
import { Position } from "components/schemas/position";
import {
  PropertyTile,
  UnusedSiloTile,
  willBeChangeableTile,
} from "components/schemas/tile";
import { ChangeableTile } from "types/core-game/server-match-state";

const getChangeableTileFromTile = (
  tile: PropertyTile | UnusedSiloTile,
  position: Position,
): ChangeableTile => {
  if (tile.type === "unusedSilo") {
    return {
      type: tile.type,
      position,
      fired: false,
    };
  }

  return {
    type: tile.type,
    position,
    hp: 20,
    ownerSlot: tile.playerSlot,
  };
};

export const getChangeableTilesFromMap = (map: WWMap): ChangeableTile[] => {
  const changeableTiles: ChangeableTile[] = [];

  for (const y in map.tiles) {
    const row = map.tiles[y];

    for (const x in row) {
      const tile = row[x];

      if (willBeChangeableTile(tile)) {
        const position: Position = [
          Number.parseInt(x, 10),
          Number.parseInt(y, 10),
        ];

        changeableTiles.push(getChangeableTileFromTile(tile, position));
      }
    }
  }

  return changeableTiles;
};
