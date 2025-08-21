import { DispatchableError } from "shared/DispatchedError";
import type { Position } from "shared/schemas/position";
import { getNeighbourPositions } from "shared/schemas/position";
import type { MapWrapper } from "shared/wrappers/map";
import type { MatchWrapper } from "shared/wrappers/match";
import type { UnitWrapper } from "shared/wrappers/unit";

export type PathNode = {
  pos: Position;
  dist: number;
  parent: Position | null;
};

const makeVisitedMatrix = (map: MapWrapper) =>
  Array.from({ length: map.width })
    .fill(false)
    .map(() => Array.from<boolean>({ length: map.height }).fill(false));

export const getAccessibleNodes = (
  match: MatchWrapper,
  unit: UnitWrapper,
): Map<Position, PathNode> => {
  const ownerUnitPlayer = match.getPlayerBySlot(unit.data.playerSlot);

  if (ownerUnitPlayer === undefined) {
    throw new DispatchableError("This unit doesn't have an owner");
  }

  const accessibleTiles = new Map<Position, PathNode>();

  const queues: PathNode[][] = Array.from({ length: unit.getMovementPoints() }, () => []);
  queues[0].push({ pos: unit.data.position, dist: 0, parent: null });

  const visited = makeVisitedMatrix(match.map);

  for (const unit of ownerUnitPlayer.team.getEnemyUnits()) {
    visited[unit.data.position[0]][unit.data.position[1]] = true;
  }

  let currentDist = 0;

  while (currentDist < queues.length) {
    if (queues[currentDist].length === 0) {
      ++currentDist;
      continue;
    }

    const currNode = queues[currentDist].pop();
    const currPos = currNode?.pos;

    if (currNode === undefined || currPos === undefined || visited[currPos[0]][currPos[1]]) {
      continue;
    }

    visited[currPos[0]][currPos[1]] = true;
    accessibleTiles.set(currPos, currNode);

    for (const pos of getNeighbourPositions(currPos)) {
      if (match.map.isOutOfBounds(pos)) {
        continue;
      }

      const movementCost = unit.getMovementCost(pos);

      if (movementCost === null) {
        continue;
      }

      const nodeDist = currNode.dist + movementCost;

      if (nodeDist <= unit.getMovementPoints()) {
        queues[nodeDist - 1].push({
          pos: pos,
          dist: nodeDist,
          parent: currPos,
        });
      }
    }
  }

  return accessibleTiles;
};

export const calculatePathDistance = (unit: UnitWrapper, path: Position[]) => {
  let dist = 0;

  path.forEach((pos, index) => {
    if (index !== 0) {
      const moveCost = unit.getMovementCost(pos);

      if (moveCost === null) {
        return null;
      }

      dist += moveCost;
    }
  });

  return dist;
};

export const reconstructPath = (
  accessibleNodes: Map<Position, PathNode>,
  targetPosition: Position,
): Position[] | null => {
  const targetNode = accessibleNodes.get(targetPosition);

  if (!targetNode) {
    return null;
  }

  const path: Position[] = [];
  let currentNode: PathNode | undefined = targetNode;

  while (currentNode) {
    path.unshift(currentNode.pos);

    if (currentNode.parent === null) {
      break;
    }

    currentNode = accessibleNodes.get(currentNode.parent);
  }

  return path;
};
