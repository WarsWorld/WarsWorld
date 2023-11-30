import type { Spritesheet } from "pixi.js";
import { Container, Sprite } from "pixi.js";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import type { Position } from "shared/schemas/position";
import { tileConstructor } from "./sprite-constructor";
import type { MatchWrapper } from "shared/wrappers/match";
import { DispatchableError } from "../shared/DispatchedError";
import {
  getNeighbourPositions,
  positionsAreNeighbours,
} from "shared/schemas/position";
import type { UnitWrapper } from "../shared/wrappers/unit";
import { getDistance } from "../shared/match-logic/positions";
export type PathNode = {
  //saves distance from origin and parent (to retrieve the shortest path)
  pos: Position;
  dist: number;
  parent: Position | null;
};

export function getAccessibleNodes( //TODO: save result of function? _ (Sturm d2d?)
  match: MatchWrapper,
  unit: UnitWrapper
): Map<Position, PathNode> {
  const ownerUnitPlayer = match.players.getBySlot(unit.data.playerSlot);

  if (ownerUnitPlayer === undefined) {
    throw new DispatchableError("This unit doesn't have an owner");
  }

  const accessibleTiles: Map<Position, PathNode> = new Map(); //return variable

  //queues[a] has current queued nodes with distance a from origin (technically a "stack", not a queue, but the result doesn't change)
  const queues: PathNode[][] = new Array(unit.getMovementPoints());
  queues.push([]);
  queues[0].push({ pos: unit.data.position, dist: 0, parent: null }); //queues[0] has the origin node, initially

  //initialize visited matrix
  const visited: boolean[][] = new Array(match.map.getWidth())
    .fill(false)
    .map(() => new Array(match.map.getHeight()).fill(false));

  for (const unit of ownerUnitPlayer.getEnemyUnits().data) {
    //enemy tiles are impassible
    visited[unit.data.position[0]][unit.data.position[1]] = true;
  }

  let currentDist = 0; //will check from closest to furthest, to find the shortest path

  while (currentDist < queues.length) {
    if (queues[currentDist].length == 0) {
      //increase currentDist if all nodes within that distance have been processed
      ++currentDist;
      continue;
    }

    const currNode = queues[currentDist].pop();
    const currPos = currNode?.pos;

    if (
      currNode == undefined ||
      currPos === undefined ||
      visited[currPos[0]][currPos[1]]
    ) {
      continue;
    }

    //update variables to mark as visited and add to result
    visited[currPos[0]][currPos[1]] = true;
    accessibleTiles.set(currPos, <PathNode>currNode);

    for (const pos of getNeighbourPositions(currPos)) {
      if (match.map.isOutOfBounds(pos)) {
        continue;
      }

      const movementCost = match.getMovementCost(
        pos,
        unit.data.type
      );

      if (movementCost === null) {
        continue;
      } //skip if unit can't move there

      const nodeDist = currNode.dist + movementCost;

      if (nodeDist <= unit.getMovementPoints()) {
        queues[nodeDist].push({
          pos: pos,
          dist: nodeDist,
          parent: currPos,
        }); //add new node with new distance and parent
      }
    }
  }

  return accessibleTiles;
}

export async function showPassableTiles(
  match: MatchWrapper,
  unit: UnitWrapper,
  accessibleNodes?: Map<Position, PathNode>
) {
  const markedTiles = new Container();
  markedTiles.eventMode = "static";

  if (accessibleNodes === undefined) {
    accessibleNodes = getAccessibleNodes(match, unit);
  }

  //add squares one by one
  for (const [pos] of accessibleNodes.entries()) {
    //TODO: Add a border to "edge" tiles
    const square = tileConstructor(pos, "#43d9e4");
    markedTiles.addChild(square);
  }

  return markedTiles;
}

export function getAttackableTiles(
  match: MatchWrapper,
  unit: UnitWrapper,
  accessibleNodes?: Map<Position, PathNode>
): Position[] {
  if (accessibleNodes === undefined) {
    accessibleNodes = getAccessibleNodes(match, unit);
  }

  //initialize visited matrix
  const visited: boolean[][] = new Array(match.map.getWidth())
    .fill(false)
    .map(() => new Array(match.map.getHeight()).fill(false));

  const attackpositions: Position[] = [];

  for (const [pos] of accessibleNodes.entries()) {
    for (const adjPos of getNeighbourPositions(pos)) {
      //all positions adjacent to tiles where the unit can move to are attacking tiles
      if (!match.map.isOutOfBounds(adjPos)) {
        if (!visited[adjPos[0]][adjPos[1]]) {
          attackpositions.push(adjPos);
          visited[adjPos[0]][adjPos[1]] = true;
        }
      }
    }
  }

  return attackpositions;
}

export async function showAttackableTiles(
  match: MatchWrapper,
  unit: UnitWrapper,
  attackableTiles?: Position[]
) {
  const unitProperties = unitPropertiesMap[unit.data.type];

  const markedTiles = new Container();
  markedTiles.eventMode = "static";

  if ("attackRange" in unitProperties) {
    if (unitProperties.attackRange[0] > 1) {
      //ranged unit
      for (let i = 0; i < match.map.getWidth(); ++i) {
        for (let j = 0; j < match.map.getHeight(); ++j) {
          const distance = getDistance([i, j], unit.data.position);

          if (
            distance <= unitProperties.attackRange[1] &&
            distance >= unitProperties.attackRange[0]
          ) {
            const square = tileConstructor([i, j], "#be1919");
            markedTiles.addChild(square);
          }
        }
      }

      return markedTiles;
    }
  }

  if (attackableTiles === undefined) {
    attackableTiles = getAttackableTiles(match, unit);
  }

  for (const pos of attackableTiles) {
    const square = tileConstructor(pos, "#be1919");
    markedTiles.addChild(square);
  }

  return markedTiles;
}

export function updatePath(
  match: MatchWrapper,
  unit: UnitWrapper,
  accessibleNodes: Map<Position, PathNode>,
  path: PathNode[],
  newPos: Position
): PathNode[] {
  if (newPos === undefined || newPos === null || !accessibleNodes.has(newPos)) {
    throw new Error("Trying to add an unreachable position!");
  }

  if (path.length !== 0) {
    const lastNode = path[path.length - 1];

    for (const node of path) {
      if (node.pos === newPos) {
        //the "new" node is part of the current path, so delete all nodes after that one
        while (node !== path[path.length - 1]) {
          path.pop();
        }

        return path;
      }
    }

    //check if new node is adjacent
    if (positionsAreNeighbours(lastNode.pos, newPos)) {
      const moveCost = match.getMovementCost(
        newPos,
        unit.data.type
      );

      //if it doesn't surpass movement restrictions, update current path
      if (
        moveCost !== null &&
        moveCost + lastNode.dist <= unit.getMovementPoints()
      ) {
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

  return newPath.reverse();
}

export function showPath(spriteSheet: Spritesheet, path: PathNode[]) {
  if (path.length < 1) {
    throw new Error("Empty path!");
  }

  const arrowContainer = new Container();
  arrowContainer.eventMode = "static";

  function getSpriteName(a: Position, b: Position, c: Position): string {
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
  }

  const len = path.length;
  const path2 = [...path];
  path2.push(path[len - 1]); //to detect the final node

  for (let i = 0; i < len; ++i) {
    let spriteName: string;

    if (i === 0) {
      //special case for original node
      spriteName = getSpriteName(path2[0].pos, path2[i].pos, path2[i + 1].pos);
    } else {
      spriteName = getSpriteName(
        path2[i - 1].pos,
        path2[i].pos,
        path2[i + 1].pos
      );
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
}