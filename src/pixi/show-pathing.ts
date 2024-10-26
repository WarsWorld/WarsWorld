import type { Spritesheet } from "pixi.js";
import { Container, Sprite } from "pixi.js";
import {
  createPipeSeamUnitEquivalent,
  getBaseDamage,
} from "shared/match-logic/game-constants/base-damage";
import type { Position } from "shared/schemas/position";
import {
  getDistance,
  getNeighbourPositions,
  positionsAreNeighbours,
} from "shared/schemas/position";
import type { MapWrapper } from "shared/wrappers/map";
import type { MatchWrapper } from "shared/wrappers/match";
import { DispatchableError } from "../shared/DispatchedError";
import type { UnitWrapper } from "../shared/wrappers/unit";
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
  accessibleNodes?: Map<Position, PathNode>,
): Position[] => {
  const attackPositions: Position[] = [];

  if ("attackRange" in unit.properties && unit.properties.attackRange[0] > 1) {
    //ranged unit
    for (let x = 0; x < match.map.width; x++) {
      for (let y = 0; y < match.map.height; y++) {
        const distance = getDistance([x, y], unit.data.position);

        if (
          distance <= unit.properties.attackRange[1] &&
          distance >= unit.properties.attackRange[0]
        ) {
          attackPositions.push([x, y]);
        }
      }
    }
  } else {
    if (accessibleNodes === undefined) {
      accessibleNodes = getAccessibleNodes(match, unit);
    }

    const visited = makeVisitedMatrix(match.map);

    for (const [pos] of accessibleNodes.entries()) {
      for (const adjPos of getNeighbourPositions(pos)) {
        //all positions adjacent to tiles where the unit can move to are attacking tiles
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
  attackableTiles?: Position[],
) => {
  const attackTargetPositions: Position[] = [];

  if (attackableTiles === undefined) {
    attackableTiles = getAttackableTiles(match, unit);
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

export const updatePath = (
  unit: UnitWrapper,
  accessibleNodes: Map<Position, PathNode>,
  path: PathNode[] | undefined,
  newPos: Position,
): PathNode[] => {
  if (!accessibleNodes.has(newPos)) {
    throw new Error("Trying to add an unreachable position!");
  }

  if (path !== undefined && path.length !== 0) {
    const lastNode = path.at(-1)!;

    for (const node of path) {
      if (node.pos === newPos) {
        //the "new" node is part of the current path, so delete all nodes after that one
        while (node !== path.at(-1)) {
          path.pop();
        }

        return path;
      }
    }

    //check if new node is adjacent
    if (positionsAreNeighbours(lastNode.pos, newPos)) {
      const moveCost = unit.getMovementCost(newPos);

      //if it doesn't surpass movement restrictions, update current path
      if (moveCost !== null && moveCost + lastNode.dist <= unit.getMovementPoints()) {
        path.push({
          pos: newPos,
          dist: moveCost + lastNode.dist,
          parent: lastNode.pos,
        });
        return path;
      }
    }
  }

  //if the new position can't be added to the current path, recreate the entire path
  const newPath: PathNode[] = [];
  let currentPos: [number, number] | null = newPos;

  while (currentPos !== null) {
    const accessibleNodesPath = accessibleNodes.get(currentPos);

    if (accessibleNodesPath !== undefined) {
      newPath.push(accessibleNodesPath);
      currentPos = accessibleNodesPath.parent;
    }
  }

  return newPath.toReversed();
};

const getSpriteName = (a: Position, b: Position, c: Position): string => {
  //path from a to b to c, the sprite is the one displayed in b (middle node)
  const dify = Math.abs(a[1] - c[1]);
  const difx = Math.abs(a[0] - c[0]);

  if (dify + difx === 2) {
    //not start nor end
    if (dify === 2) {
      return "ew";
    }

    if (difx === 2) {
      return "ns";
    }

    let ans: string;

    if (a[0] > b[0] || c[0] > b[0]) {
      ans = "s";
    } else {
      ans = "n";
    }

    if (a[1] > b[1] || c[1] > b[1]) {
      ans += "e";
    } else {
      ans += "w";
    }

    return ans;
  }

  if (a[1] === b[1] && a[0] === b[0]) {
    //starting node
    if (c[1] === b[1] && c[0] === b[0]) {
      //AND ending node
      return "od";
    }

    if (c[1] < b[1]) {
      return "ow";
    }

    if (c[1] > b[1]) {
      return "oe";
    }

    if (c[0] > b[0]) {
      return "os";
    }

    return "on";
  } else {
    //ending node
    if (a[1] < b[1]) {
      return "wd";
    }

    if (a[1] > b[1]) {
      return "ed";
    }

    if (a[0] < b[0]) {
      return "nd";
    }

    return "sd";
  }
};

export const showPath = (spriteSheet: Spritesheet, path: PathNode[]) => {
  if (path.length < 1) {
    throw new Error("Empty path!");
  }

  const arrowContainer = new Container();
  arrowContainer.eventMode = "static";

  const len = path.length;
  const path2 = [...path];
  path2.push(path[len - 1]); //to detect the final node

  for (let i = 0; i < len; ++i) {
    let spriteName: string;

    if (i === 0) {
      //special case for original node
      spriteName = getSpriteName(path2[0].pos, path2[i].pos, path2[i + 1].pos);
    } else {
      spriteName = getSpriteName(path2[i - 1].pos, path2[i].pos, path2[i + 1].pos);
    }

    const nodeSprite = new Sprite(spriteSheet.textures[spriteName + ".png"]);
    nodeSprite.anchor.set(1, 1);
    nodeSprite.x = (path2[i].pos[1] + 1) * 16;
    nodeSprite.y = (path2[i].pos[0] + 1) * 16;
    arrowContainer.addChild(nodeSprite);
  }

  //this name will let us easily remove arrows later
  arrowContainer.name = "arrows";
  return arrowContainer;
};
