import { DispatchableError } from "shared/DispatchedError";
import {
  createPipeSeamUnitEquivalent,
  getBaseDamage,
} from "shared/match-logic/game-constants/base-damage";
import type { Position } from "shared/schemas/position";
import { getDistance, getNeighbourPositions, isSamePosition } from "shared/schemas/position";
import type { MapWrapper } from "shared/wrappers/map";
import type { MatchWrapper } from "shared/wrappers/match";
import type { UnitWrapper } from "shared/wrappers/unit";

/**
 * Movement / attack reachability — pure engine queries used to preview what a unit can do. Kept
 * framework-free so the backend can compute them server-side and expose the results to the client
 * (the client renders the previews, it does not run this).
 */

export type PathNode = {
  //saves distance from origin and parent (to retrieve the shortest path)
  pos: Position;
  dist: number;
  parent: Position | null;
};

const makeVisitedMatrix = (map: MapWrapper) =>
  Array.from({ length: map.width })
    .fill(false)
    .map(() => Array.from<boolean>({ length: map.height }).fill(false));

export const getAccessibleNodes = (
  //TODO: save result of function? _ (Sturm d2d?)
  match: MatchWrapper,
  unit: UnitWrapper,
): Map<Position, PathNode> => {
  const ownerUnitPlayer = match.getPlayerBySlot(unit.data.playerSlot);

  if (ownerUnitPlayer === undefined) {
    throw new DispatchableError("This unit doesn't have an owner");
  }

  const accessibleTiles = new Map<Position, PathNode>(); //return variable

  //queues[a] has current queued nodes with distance a from origin (technically a "stack", not a queue, but the result doesn't change)
  const queues: PathNode[][] = Array.from({ length: unit.getMovementPoints() }, () => []);
  queues[0].push({ pos: unit.data.position, dist: 0, parent: null }); //queues[0] has the origin node, initially

  const visited = makeVisitedMatrix(match.map);

  for (const unit of ownerUnitPlayer.team.getEnemyUnits()) {
    //enemy tiles are impassible
    visited[unit.data.position[0]][unit.data.position[1]] = true;
  }

  let currentDist = 0; //will check from closest to furthest, to find the shortest path

  while (currentDist < queues.length) {
    if (queues[currentDist].length === 0) {
      //increase currentDist if all nodes within that distance have been processed
      ++currentDist;
      continue;
    }

    const currNode = queues[currentDist].pop();
    const currPos = currNode?.pos;

    if (currNode === undefined || currPos === undefined || visited[currPos[0]][currPos[1]]) {
      continue;
    }

    //update variables to mark as visited and add to result
    visited[currPos[0]][currPos[1]] = true;
    accessibleTiles.set(currPos, currNode);

    for (const pos of getNeighbourPositions(currPos)) {
      if (match.map.isOutOfBounds(pos)) {
        continue;
      }

      const movementCost = unit.getMovementCost(pos);

      if (movementCost === null) {
        continue;
      } //skip if unit can't move there

      const nodeDist = currNode.dist + movementCost;

      if (nodeDist <= unit.getMovementPoints()) {
        queues[nodeDist - 1].push({
          pos: pos,
          dist: nodeDist,
          parent: currPos,
        }); //add new node with new distance and parent
      }
    }
  }

  return accessibleTiles;
};

export const getAttackableTiles = (
  match: MatchWrapper,
  unit: UnitWrapper,
  fromPosition?: Position,
  accessibleNodes?: Map<Position, PathNode>,
): Position[] => {
  const attackPositions: Position[] = [];
  const sourcePosition = fromPosition ?? unit.data.position;

  const attackRange = unit.getAttackRange();

  if (unit.isIndirect() && attackRange !== undefined) {
    // Ranged unit (2nd condition is for typescript)

    for (let x = 0; x < match.map.width; x++) {
      for (let y = 0; y < match.map.height; y++) {
        const distance = getDistance([x, y], sourcePosition);

        if (distance <= attackRange.maxRange && distance >= attackRange.minRange) {
          attackPositions.push([x, y]);
        }
      }
    }
  } else {
    // Melee unit
    if (accessibleNodes === undefined) {
      accessibleNodes = fromPosition
        ? new Map([[fromPosition, { pos: fromPosition, dist: 0, parent: null }]]) // Create a minimal node if specific position given
        : getAccessibleNodes(match, unit);
    }

    const visited = makeVisitedMatrix(match.map);

    for (const [pos] of accessibleNodes.entries()) {
      if (match.getUnit(pos) !== undefined && !isSamePosition(pos, unit.data.position)) {
        //another unit occupies this spot so we can't move to it to attack
        //(compare by value: an explicit `fromPosition` is a fresh tuple, so `!==` would wrongly
        // treat the unit's own tile as occupied and drop its neighbours — breaking in-place attack)
        continue;
      }

      for (const adjPos of getNeighbourPositions(pos)) {
        if (!match.map.isOutOfBounds(adjPos)) {
          if (!visited[adjPos[0]][adjPos[1]]) {
            attackPositions.push(adjPos);
            visited[adjPos[0]][adjPos[1]] = true;
          }
        }
      }
    }
  }

  return attackPositions;
};

export const getAttackTargetTiles = (
  match: MatchWrapper,
  unit: UnitWrapper,
  fromPosition?: Position,
  attackableTiles?: Position[],
) => {
  const attackTargetPositions: Position[] = [];

  if (attackableTiles === undefined) {
    attackableTiles = getAttackableTiles(match, unit, fromPosition);
  }

  const canAttackPipeseams =
    getBaseDamage(unit, createPipeSeamUnitEquivalent(match, unit)) !== null;

  for (const position of attackableTiles) {
    const enemy = match.getUnit(position);

    if (enemy === undefined) {
      if (match.getTile(position).type === "pipeSeam" && canAttackPipeseams) {
        attackTargetPositions.push(position);
      }
    } else {
      if (enemy.player.team !== unit.player.team && getBaseDamage(unit, enemy) !== null) {
        attackTargetPositions.push(position);
      }
    }
  }

  return attackTargetPositions;
};
