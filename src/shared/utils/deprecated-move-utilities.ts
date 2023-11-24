import { TRPCError } from "@trpc/server";
import type { Direction } from "shared/schemas/direction";
import type { Path, Position } from "shared/schemas/position";
import { isSamePosition } from "shared/schemas/position";
import type { UnitWithVisibleStats } from "shared/schemas/unit";

/**
 * I've kept this code around because we might want to use these algorithms at some point
 * for compressing/decompressing paths. - Function
 */

/**
 * Diagonal movement must be explicit, so there must not be changes to both X and Y between corner positions.
 * @deprecated
 */
const _throwIfPathIsAmbiguous = (path: Path) => {
  path.forEach((nextPosition, index) => {
    const previousPosition = path[index - 1];

    const xHasChanged = previousPosition[0] !== nextPosition[0];
    const yHasChanged = previousPosition[1] !== nextPosition[1];

    if (xHasChanged && yHasChanged) {
      throw new Error(
        "Path is ambiguous (one position to the next changes both X and Y)"
      );
    }
  });
};

/**
 * Duplicate positions are not allowed because they'd mess up inflatePath.
 * Alternative we could allow duplicates but deduplicate them before further processing.
 *
 * TODO change this from "subsequent" to make sure all positions in the path are unique because
 * units can't cross their own path.
 *
 * @deprecated
 */
const _throwIfPathContainsDuplicatePositions = (path: Path) => {
  path.forEach((currentPosition, index) => {
    const previousPosition = path[index - 1];

    if (
      previousPosition !== undefined &&
      isSamePosition(previousPosition, currentPosition)
    ) {
      throw new Error(
        "Duplicate, subsequent positions are not allowed in a path"
      );
    }
  });
};

const _throwIfUnitIsWaited = (unit: UnitWithVisibleStats) => {
  if (!unit.isReady) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You can't move a waited unit"
    });
  }
};

const getDirectionToGoFromOneToAnotherPosition = (
  currentPosition: Position,
  nextPosition: Position
): Direction => {
  if (nextPosition[0] === currentPosition[0]) {
    return nextPosition[1] > currentPosition[1] ? "down" : "up";
  }

  if (nextPosition[1] === nextPosition[1]) {
    throw new Error(
      "Can't determine the direction between two positions with same X & Y"
    );
  }

  return nextPosition[0] > currentPosition[0] ? "right" : "left";
};

const getNewPositionByApplyingDirectionOnce = (
  position: Position,
  direction: Direction
): Position => {
  const xChange = direction === "right" ? 1 : direction === "left" ? -1 : 0;
  const yChange = direction === "down" ? -1 : direction === "up" ? -1 : 0;

  return [position[0] + xChange, position[1] + yChange];
};

const getAllPositionsBetweenTwoPositions = (
  positionA: Position,
  positionB: Position | undefined
): Path => {
  if (positionB === undefined) {
    return [];
  }

  const directionToMoveIn = getDirectionToGoFromOneToAnotherPosition(
    positionA,
    positionB
  );

  const positions: Position[] = [];

  // while last added position isn't equal to positionB
  while (
    positions.at(-1)?.[0] !== positionB[0] &&
    positions.at(-1)?.[1] !== positionB[1]
  ) {
    const previousPosition = positions.at(-1) ?? positionA;
    positions.push(
      getNewPositionByApplyingDirectionOnce(previousPosition, directionToMoveIn)
    );
  }

  return positions.slice(0, -1); // last position is equal to positionB and we only want in-between
};

/**
 * Fills the gaps between all path corners.
 * @deprecated
 */
const _inflatePath = (path: Path): Path => {
  return path.reduce<Path>((previousPositions, currentPosition, index) => {
    const nextPosition = path[index + 1]; // can be undefined (last position), then positionsBetween will be empty
    const positionsBetween = getAllPositionsBetweenTwoPositions(
      currentPosition,
      nextPosition
    );
    return [...previousPositions, currentPosition, ...positionsBetween];
  }, []);
};
