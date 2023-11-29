import type { Position } from "shared/schemas/position";
import type { Direction } from "shared/schemas/direction";

// Position / Coordinate System
//
// AWBW and probably AW too starts "x: 0, y: 0" in the top-left corner.
// So going down means y increases.

// TODO move these to position schema maybe?

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
  positionA: Position,
  positionB: Position
): number => {
  return (
    Math.abs(positionA[0] - positionB[0]) +
    Math.abs(positionA[1] - positionB[1])
  );
};
