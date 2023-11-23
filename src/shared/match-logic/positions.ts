import type { Position } from "shared/schemas/position";
import type { Direction } from "shared/schemas/direction";

// Position / Coordinate System
//
// AWBW and probably AW too starts "x: 0, y: 0" in the top-left corner.
// So going down means y increases.

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
  switch (direction) {
    case "up":
      return [position[0], position[1] - 1];
    case "down":
      return [position[0], position[1] + 1];
    case "left":
      return [position[0] - 1, position[1]];
    case "right":
      return [position[0] + 1, position[1]];
  }
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
