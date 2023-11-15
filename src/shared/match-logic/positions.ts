import { Position, isSamePosition } from "server/schemas/position";
import { WWUnit } from "server/schemas/unit";
import { BackendMatchState } from "shared/types/server-match-state";
import { WWMap } from "@prisma/client";
import { Direction } from "../../server/schemas/direction";

export const addPositions = (
  position1: Position,
  position2: Position
): Position => {
  return [position1[0] + position2[0], position1[1] + position2[1]];
};

export const addDirection = (
  position: Position,
  direction: Direction
): Position => {
  //TODO: check that directions are correct
  switch (direction) {
    case "up":
      return [position[0], position[1] - 1];
    case "down":
      return [position[0], position[1] + 1];
    case "left":
      return [position[0] + 1, position[1]];
    case "right":
      return [position[0] - 1, position[1]];
  }
};

export const isOutsideOfMap = (map: WWMap, position: Position): boolean => {
  if (position[0] < 0 || position[1] < 0) return true;
  if (position[0] >= map.tiles.length) return true;
  return position[1] >= map.tiles[position[0]].length;
};

export const getDistance = (
  position1: Position,
  position2: Position
): number => {
  return (
    Math.abs(position1[0] - position2[0]) +
    Math.abs(position1[1] - position2[1])
  );
};

export const getUnitAtPosition = (
  matchState: BackendMatchState,
  position: Position
): WWUnit | null => {
  const unit = matchState.units.find((u) =>
    isSamePosition(u.position, position)
  );

  if (unit === undefined) return null;
  return unit;
};

