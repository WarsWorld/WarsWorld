import { Container, Sprite } from "pixi.js";
import {
  createPipeSeamUnitEquivalent,
  getBaseDamage,
} from "shared/match-logic/game-constants/base-damage";
import type { Position } from "shared/schemas/position";
import {
  getDistance,
  getNeighbourPositions,
  isSamePosition,
  positionsAreNeighbours,
} from "shared/schemas/position";
import type { MapWrapper } from "shared/wrappers/map";
import type { MatchWrapper } from "shared/wrappers/match";
import { baseTileSize } from "../components/client-only/MatchRenderer";
import { DispatchableError } from "../shared/DispatchedError";
import type { UnitWrapper } from "../shared/wrappers/unit";
import type { LoadedSpriteSheet } from "./load-spritesheet";
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

  if ("attackRange" in unit.properties && unit.properties.attackRange[0] > 1) {
    // Ranged unit
    for (let x = 0; x < match.map.width; x++) {
      for (let y = 0; y < match.map.height; y++) {
        const distance = getDistance([x, y], sourcePosition);

        if (
          distance <= unit.properties.attackRange[1] &&
          distance >= unit.properties.attackRange[0]
        ) {
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

export const calculatePathDistance = (unit: UnitWrapper, path: Position[]) => {
  let dist = 0;

  path.forEach((pos, index) => {
    if (index !== 0) {
      const moveCost = unit.getMovementCost(pos); //TODO cache movement costs

      if (moveCost === null) {
        return null;
      }

      dist += moveCost;
    }
  });

  return dist;
};

export const updatePath = (
  unit: UnitWrapper,
  accessibleNodes: Map<Position, PathNode>,
  path: Position[] | null,
  newPos: Position,
): Position[] => {
  if (path !== null && path.length !== 0) {
    const lastPosition = path.at(-1)!;

    for (const pos of path) {
      if (pos === newPos) {
        //the "new" node is part of the current path, so delete all nodes after that one
        while (pos !== path.at(-1)) {
          path.pop();
        }

        return path;
      }
    }

    //check if new node is adjacent
    if (positionsAreNeighbours(lastPosition, newPos)) {
      const moveCost = unit.getMovementCost(newPos);
      const distanceCovered = calculatePathDistance(unit, path);

      //if it doesn't surpass movement restrictions, update current path
      if (moveCost !== null && moveCost + distanceCovered <= unit.getMovementPoints()) {
        path.push(newPos);
        return path;
      }
    }
  }

  //if the new position can't be added to the current path, recreate the entire path
  const newPath: Position[] = [];
  let currentPos: [number, number] | null = newPos;

  while (currentPos !== null) {
    let accessibleNodesPath: PathNode | undefined = undefined;

    for (const [key, value] of accessibleNodes.entries()) {
      if (isSamePosition(key, currentPos)) {
        accessibleNodesPath = value;
        break;
      }
    }

    if (accessibleNodesPath !== undefined) {
      newPath.push(accessibleNodesPath.pos);
      currentPos = accessibleNodesPath.parent;
    }
  }

  return newPath.toReversed();
};

const getSpriteName = (a: Position, b: Position, c: Position): string => {
  //path from a to b to c, the sprite is the one displayed in b (middle node)
  const difx = Math.abs(a[0] - c[0]);
  const dify = Math.abs(a[1] - c[1]);

  if (dify + difx === 2) {
    //not start nor end
    if (difx === 2) {
      return "ew";
    }

    if (dify === 2) {
      return "ns";
    }

    let ans: string;

    if (a[1] > b[1] || c[1] > b[1]) {
      ans = "s";
    } else {
      ans = "n";
    }

    if (a[0] > b[0] || c[0] > b[0]) {
      ans += "e";
    } else {
      ans += "w";
    }

    return ans;
  }

  if (a[0] === b[0] && a[1] === b[1]) {
    //starting node
    if (c[0] === b[0] && c[1] === b[1]) {
      //AND ending node
      return "od";
    }

    if (c[0] < b[0]) {
      return "ow";
    }

    if (c[0] > b[0]) {
      return "oe";
    }

    if (c[1] > b[1]) {
      return "os";
    }

    return "on";
  } else {
    //ending node
    if (a[0] < b[0]) {
      return "wd";
    }

    if (a[0] > b[0]) {
      return "ed";
    }

    if (a[1] < b[1]) {
      return "nd";
    }

    return "sd";
  }
};

export const showPath = (spriteSheet: LoadedSpriteSheet, path: Position[]) => {
  if (path.length < 1) {
    throw new Error("Empty path!");
  }

  const arrowContainer = new Container();
  arrowContainer.eventMode = "static";

  const len = path.length;
  const path2 = [...path];
  path2.push(path[len - 1]); //to detect the final node

  for (let i = 0; i < len; ++i) {
    let spriteName = "";

    if (i === 0) {
      //TODO i don't understand what this does
      //special case for original node
      //spriteName = getSpriteName(path2[0], path2[i], path2[i + 1]);
    } else {
      spriteName = getSpriteName(path2[i - 1], path2[i], path2[i + 1]);
    }

    const nodeSprite = new Sprite(spriteSheet.arrow?.textures[spriteName + ".png"]);
    nodeSprite.anchor.set(1, 1);
    nodeSprite.x = (path2[i][0] + 1) * baseTileSize;
    nodeSprite.y = (path2[i][1] + 1) * baseTileSize;
    arrowContainer.addChild(nodeSprite);
  }

  //this name will let us easily remove arrows later
  arrowContainer.name = "arrows";
  arrowContainer.zIndex = 9999;
  return arrowContainer;
};
