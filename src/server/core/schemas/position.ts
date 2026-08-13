import { z } from "zod";

// Position / Coordinate System
//
// AWBW and probably AW too starts "x: 0, y: 0" in the top-left corner.
// So going down means y increases.

// === POSITION ===

export const positionSchema = z.tuple([
  z.number().int().nonnegative(),
  z.number().int().nonnegative(),
]);

export type Position = z.infer<typeof positionSchema>;

/** throws if no final position */
export const getFinalPositionSafe = (path: Path) => {
  const finalPosition = path.at(-1);

  if (finalPosition === undefined) {
    throw new Error("Could not get final position of empty path");
  }

  return finalPosition;
};

export const isSamePosition = (positionA: Position, positionB: Position) =>
  positionA[0] === positionB[0] && positionA[1] === positionB[1];

export const positionsAreNeighbours = (positionA: Position, positionB: Position) => {
  const xDiff = Math.abs(positionA[0] - positionB[0]);
  const yDiff = Math.abs(positionA[1] - positionB[1]);

  return xDiff + yDiff <= 1;
};

export const getNeighbourPositions = (p: Position): Position[] => [
  [p[0] + 1, p[1]],
  [p[0] - 1, p[1]],
  [p[0], p[1] + 1],
  [p[0], p[1] - 1],
];

export const getDistance = (positionA: Position, positionB: Position): number => {
  return Math.abs(positionA[0] - positionB[0]) + Math.abs(positionA[1] - positionB[1]);
};

// === PATH ===

export const pathSchema = z.array(positionSchema);

export type Path = z.infer<typeof pathSchema>;

// === DIRECTION ===

export const directionSchema = z.enum(["up", "down", "left", "right"]);

export type Direction = z.infer<typeof directionSchema>;

export const allDirections: Direction[] = ["up", "down", "left", "right"];

export const addDirection = (position: Position, direction: Direction): Position => {
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

//untested!!
export const getDirection = (fromPosition: Position, toPosition: Position): Direction => {
  const dx = toPosition[0] - fromPosition[0];
  const dy = toPosition[1] - fromPosition[1];

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) {
      return "right";
    }

    return "left";
  }

  if (dy > 0) {
    return "down";
  }

  return "up";
};
