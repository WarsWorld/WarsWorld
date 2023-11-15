import { WWMap } from "@prisma/client";
import { Position, isSamePosition } from "server/schemas/position";
import { Tile } from "server/schemas/tile";
import { BackendMatchState } from "shared/types/server-match-state";
import { isOutsideOfMap } from "./positions";

export const getCurrentTile = (
  matchState: BackendMatchState,
  position: Position
) => {
  if (isOutsideOfMap(matchState.map, position)) {
    throw new Error(
      `Out of bounds position ${JSON.stringify(position)} 
        for map ${matchState.map.name}`
    );
  }

  const foundChangeableTile = matchState.changeableTiles.find((t) =>
    isSamePosition(t.position, position)
  );

  if (foundChangeableTile !== undefined) {
    return foundChangeableTile;
  }

  return matchState.map.tiles[position[1]][position[0]];
};
