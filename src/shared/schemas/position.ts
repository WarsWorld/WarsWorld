import { z } from "zod";

export const positionSchema = z.tuple([
  z.number().int().nonnegative(),
  z.number().int().nonnegative(),
]);

export type Position = z.infer<typeof positionSchema>;

export const pathSchema = z.array(positionSchema);

export type Path = z.infer<typeof pathSchema>;

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

export const positionsAreNeighbours = (
  positionA: Position,
  positionB: Position
) => {
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
