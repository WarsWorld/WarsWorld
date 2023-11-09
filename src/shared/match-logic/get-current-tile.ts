import { WWMap } from "@prisma/client";
import { Position, isSamePosition } from "server/schemas/position";
import { Tile } from "server/schemas/tile";
import { BackendMatchState } from "shared/types/server-match-state";

export const getMapDimensions = (map: WWMap) => ({
  width: map.tiles[0].length,
  height: map.tiles.length,
});

export const validatePositionIsInBounds = (
  map: WWMap,
  position: Position
): void => {
  const { width, height } = getMapDimensions(map);

  if (
    position[0] < 0 ||
    position[0] >= width ||
    position[1] < 0 ||
    position[1] >= height
  ) {
    throw new Error(
      `Out of bounds position ${JSON.stringify(position)} for map ${map.name}`
    );
  }
};

export const getCurrentTile = (
  matchState: BackendMatchState,
  position: Position
) => {
  validatePositionIsInBounds(matchState.map, position);

  const foundChangeableTile = matchState.changeableTiles.find((t) =>
    isSamePosition(t.position, position)
  );

  if (foundChangeableTile !== undefined) {
    return foundChangeableTile;
  }

  return matchState.map.tiles[position[1]][position[0]];
};
