// TODO: Check Weather import
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import type { Spritesheet } from "pixi.js";
import { Container, Sprite } from "pixi.js";
import type { MovementType } from "shared/match-logic/unit-properties";
import {unitPropertiesMap} from "../shared/match-logic/game-constants/unit-properties";
import type { Tile, Weather } from "shared/schemas/tile.ts";
import type { UnitWithVisibleStats } from "shared/schemas/unit";
import type { Position } from "shared/schemas/position";
import { tileConstructor } from "./spriteConstructor";
import type { MatchWrapper } from "shared/wrappers/match";
export type PathNode = {
  //saves distance from origin and parent (to retrieve the shortest path)
  pos: Position;
  dist: number;
  parent: Position | null;
};

export function getAccessibleNodes( //TODO: save result of function? _ (Sturm d2d?)
  mapData: Tile[][],
  enemyUnits: UnitWithVisibleStats[],
  weather: Weather,
  movePoints: number,
  moveType: MovementType,
  x: number,
  y: number,
  match: MatchWrapper
): Map<Position, PathNode> {
  const accessibleTiles = new Map<Position, PathNode>(); //return variable

  //queues[a] has current queued nodes with distance a from origin (technically a "stack", not a queue, but the result doesn't change)
  const queues: PathNode[][] = [];
  queues.push([]);
  queues[0].push({ pos: [x, y], dist: 0, parent: null }); //queues[0] has the origin node, initially

  const visited: boolean[][] = [];

  // Initialize visited matrix
  for (let i = 0; i < mapData.length; i++) {
    visited[i] = [];

    for (let j = 0; j < mapData[i].length; j++) {
      visited[i][j] = false;
    }
  }
  for (const unit of enemyUnits) {
    //enemy tiles are impassible
    visited[unit.position[0]][unit.position[1]] = true;
  }

  function isValidTile(row: number, col: number): boolean {
    //used to check out of boundaries
    return (
      row >= 0 && row < mapData.length && col >= 0 && col < mapData[row].length
    );
  }

  let currentDist = 0; //will check from closest to furthest, to find the shortest path

  while (currentDist < queues.length) {
    if (queues[currentDist].length == 0) {
      //increase currentDist if all nodes within that distance have been processed
      ++currentDist;
      continue;
    }

    const currNode = queues[currentDist].pop();

    let currPos;

    if (currNode?.pos !== null) {
      currPos = currNode?.pos;
    }

    if (currPos === undefined || visited[currPos[0]][currPos[1]]) {
      continue;
    }

    //update variables to mark as visited and add to result
    visited[currPos[0]][currPos[1]] = true;
    accessibleTiles.set(currPos, currNode!);

    //the 4 adjacent node's coordinates:
    const xpositionSchemas = [
      currPos[0] - 1,
      currPos[0] + 1,
      currPos[0],
      currPos[0]
    ];
    const ypositionSchemas = [
      currPos[1],
      currPos[1],
      currPos[1] - 1,
      currPos[1] + 1
    ];

    for (let i = 0; i < 4; ++i) {
      if (isValidTile(xpositionSchemas[i], ypositionSchemas[i])) {
        //if one adjacent tile is valid

        const movementCost = match.getMovementCost(
          mapData[xpositionSchemas[i]][ypositionSchemas[i]].type,
        );

        if (movementCost === null || movementCost < 0) {
          continue;
        } //skip if unit can't move there

        let nodeDist;

        if (currNode != undefined) {
          nodeDist = currNode.dist + movementCost;
        }

        if (nodeDist != undefined && nodeDist <= movePoints) {
          while (queues.length <= nodeDist) {
            queues.push([]);
          } //increase queues size until new node can be added

          queues[nodeDist].push({
            pos: [xpositionSchemas[i], ypositionSchemas[i]],
            dist: nodeDist,
            parent: currPos
          }); //add new node with new distance and parent
        }
      }
    }
  }

  return accessibleTiles;
}

export function showPassableTiles(
  mapData: Tile[][],
  unit: UnitWithVisibleStats,
  enemyUnits: UnitWithVisibleStats[],
  accessibleNodes?: Map<Position, PathNode>
) {
  const unitProperties = unitPropertiesMap[unit.type];

  const markedTiles = new Container();
  markedTiles.eventMode = "static";

  if (accessibleNodes === undefined) {
    accessibleNodes = getAccessibleNodes(
      mapData,
      enemyUnits,
      "clear", //!
      unitProperties.movementPoints,
      unitProperties.movementType,
      unit.position[0],
      unit.position[1]
    );
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
  mapData: Tile[][],
  enemyUnits: UnitWithVisibleStats[],
  weather: Weather,
  movePoints: number,
  moveType: MovementType,
  x: number,
  y: number,
  accessibleNodes?: Map<Position, PathNode>
): Position[] {
  if (accessibleNodes === undefined) {
    accessibleNodes = getAccessibleNodes(
      mapData,
      enemyUnits,
      weather,
      movePoints,
      moveType,
      x,
      y
    );
  }

  function isValidTile(row: number, col: number): boolean {
    //used to check out of boundaries
    return (
      row >= 0 && row < mapData.length && col >= 0 && col < mapData[row].length
    );
  }

  const visited: boolean[][] = [];

  // Initialize visited matrix
  for (let i = 0; i < mapData.length; i++) {
    visited[i] = [];

    for (let j = 0; j < mapData[i].length; j++) {
      visited[i][j] = false;
    }
  }

  const attackpositionSchemas: Position[] = [];

  for (const [pos] of accessibleNodes.entries()) {
    const xpositionSchemas = [pos[0] - 1, pos[0] + 1, pos[0], pos[0]];
    const ypositionSchemas = [pos[1], pos[1], pos[1] - 1, pos[1] + 1];

    for (let i = 0; i < 4; ++i) {
      //all positions adjacent to tiles where the unit can move to are attacking tiles
      if (isValidTile(xpositionSchemas[i], ypositionSchemas[i])) {
        if (!visited[xpositionSchemas[i]][ypositionSchemas[i]]) {
          attackpositionSchemas.push([
            xpositionSchemas[i],
            ypositionSchemas[i]
          ]);
          visited[xpositionSchemas[i]][ypositionSchemas[i]] = true;
        }
      }
    }
  }

  return attackpositionSchemas;
}

export function showAttackableTiles(
  mapData: Tile[][],
  unit: UnitWithVisibleStats,
  enemyUnits: UnitWithVisibleStats[],
  attackableTiles?: Position[]
) {
  const unitProperties = unitPropertiesMap[unit.type];

  const markedTiles = new Container();
  markedTiles.eventMode = "static";

  if ("attackRange" in unitProperties) {
    if (unitProperties.attackRange[0] != 1) {
      //ranged unit
      for (let i = 0; i < mapData.length; ++i) {
        for (let j = 0; j < mapData[0].length; ++j) {
          const distance =
            Math.abs(i - unit.position[0]) + Math.abs(j - unit.position[1]); //untested, maybe swapped

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
    attackableTiles = getAttackableTiles(
      mapData,
      enemyUnits,
      "clear", //!
      unitProperties.movementPoints,
      unitProperties.movementType,
      unit.position[0],
      unit.position[1]
    );
  }

  for (const pos of attackableTiles) {
    const square = tileConstructor(pos, "#be1919");
    markedTiles.addChild(square);
  }

  return markedTiles;
}

export function updatePath(
  mapData: Tile[][],
  match: MatchWrapper,
  movePoints: number,
  moveType: MovementType,
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
    if (
      Math.abs(lastNode.pos[0] - newPos[0]) +
        Math.abs(lastNode.pos[1] - newPos[1]) ==
      1
    ) {
      const tileDist = match.getMovementCost(
        mapData[newPos[0]][newPos[1]].type,
      );

      //if it doesn't surpass movement restrictions, update current path
      if (tileDist !== null && tileDist + lastNode.dist <= movePoints) {
        path.push({
          pos: newPos,
          dist: tileDist + lastNode.dist,
          parent: lastNode.pos
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
