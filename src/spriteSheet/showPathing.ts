//TODO: Fix TS issues, it treats an array as if it was not an array
// with forEach and type-safety is secondary to the project so...  - Javi

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Container, Texture, Sprite, BaseTexture, Spritesheet } from "pixi.js";
import {
  MovementType,
  unitPropertiesMap,
} from "../shared/match-logic/buildable-unit";
import { getMovementCost } from "../shared/match-logic/tiles";
import { Tile, Weather } from "../server/schemas/tile.ts";
import { CreatableUnit } from "../server/schemas/unit";
import { positionSchema } from "../server/schemas/position";
import tileConstructor from "./tileConstructor";
export type Coord = positionSchema;
export type PathNode = {
  //saves distance from origin and parent (to retrieve the shortest path)
  pos: Coord;
  dist: number;
  parent: Coord | null;
};


export function getAccessibleNodes( //TODO: save result of function? _ (Sturm d2d?)
  mapData: Tile[][],
  enemyUnits: CreatableUnit[],
  weather: Weather,
  movePoints: number,
  moveType: MovementType,
  x: number,
  y: number
): Map<Coord, PathNode> {
  const accessibleTiles: Map<Coord, PathNode> = new Map(); //return variable

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
    const currPos = currNode.pos;

    if (visited[currPos[0]][currPos[1]]) continue;
    //update variables to mark as visited and add to result
    visited[currPos[0]][currPos[1]] = true;
    accessibleTiles.set(currPos, currNode);

    //the 4 adjacent node's coordinates:
    const xCoords = [currPos[0] - 1, currPos[0] + 1, currPos[0], currPos[0]];
    const yCoords = [currPos[1], currPos[1], currPos[1] - 1, currPos[1] + 1];

    for (let i = 0; i < 4; ++i) {
      if (isValidTile(xCoords[i], yCoords[i])) {
        //if one adjacent tile is valid
        const movementCost = getMovementCost(
          mapData[xCoords[i]][yCoords[i]].type,
          moveType,
          weather
        );
        if (movementCost === null || movementCost < 0) continue; //skip if unit can't move there
        const nodeDist = currNode.dist + movementCost;
        if (nodeDist <= movePoints) {
          while (queues.length <= nodeDist) queues.push([]); //increase queues size until new node can be added
          queues[nodeDist].push({
            pos: [xCoords[i], yCoords[i]],
            dist: nodeDist,
            parent: currPos,
          }); //add new node with new distance and parent
        }
      }
    }
  }

  return accessibleTiles;
}

export async function showPassableTiles(
  mapData: Tile[][],
  unit: CreatableUnit,
  enemyUnits: CreatableUnit[],
  accessibleNodes?: Map<Coord, PathNode>
): Container {
  const unitProperties = unitPropertiesMap[unit.type];

  const markedTiles = new Container();
  markedTiles.eventMode = "static";

  if (accessibleNodes === undefined) {
    accessibleNodes = getAccessibleNodes(
      mapData,
      enemyUnits,
      "clear", //!
      unitProperties.moveRange,
      unitProperties.movementType,
      unit.position[0],
      unit.position[1]
    );
  }

  //add squares one by one
  for (const [pos, node] of accessibleNodes.entries()) {
    const square = tileConstructor(pos, "#79d8f5");
    square.blendMode = 2; //blend mode Multiply ?

    markedTiles.addChild(square);
  }

  return markedTiles;
}

export function getAttackableTiles(
  mapData: Tile[][],
  enemyUnits: CreatableUnit[],
  weather: Weather,
  movePoints: number,
  moveType: MovementType,
  x: number,
  y: number,
  accessibleNodes?: Map<Coord, PathNode>
): Coord[] {
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

  const attackCoords: Coord[] = [];
  for (const [pos, node] of accessibleNodes.entries()) {
    const xCoords = [pos[0] - 1, pos[0] + 1, pos[0], pos[0]];
    const yCoords = [pos[1], pos[1], pos[1] - 1, pos[1] + 1];
    for (let i = 0; i < 4; ++i) {
      //all positions adjacent to tiles where the unit can move to are attacking tiles
      if (isValidTile(xCoords[i], yCoords[i]))
        if (!visited[xCoords[i]][yCoords[i]]) {
          attackCoords.push([xCoords[i], yCoords[i]]);
          visited[xCoords[i]][yCoords[i]] = true;
        }
    }
  }

  return attackCoords;
}

export async function showAttackableTiles(
  mapData: Tile[][],
  unit: CreatableUnit,
  enemyUnits: CreatableUnit[],
  attackableTiles?: Coord[]
): Container {
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
            const square = tileConstructor([i, j], "#FF8080");
            square.blendMode = 2; //blend mode Multiply ?
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
      unitProperties.moveRange,
      unitProperties.movementType,
      unit.position[0],
      unit.position[1]
    );
  }

  for (const pos of attackableTiles) {
    const square = tileConstructor(pos, "#FF8080");
    square.blendMode = 2; //blend mode Multiply ?
    markedTiles.addChild(square);
  }

  return markedTiles;
}

export function updatePath(
  mapData: Tile[][],
  weather: Weather,
  movePoints: number,
  moveType: MovementType,
  accessibleNodes: Map<Coord, PathNode>,
  path: PathNode[],
  newPos: Coord
): PathNode[] {
  if (newPos === undefined || newPos === null || !accessibleNodes.has(newPos))
    throw new Error("Trying to add an unreachable position!");
  if (path.length !== 0) {
    const lastNode = path[path.length - 1];

    for (const node of path) {
      if (node.pos === newPos) {
        //the "new" node is part of the current path, so delete all nodes after that one
        while (node !== path[path.length - 1]) path.pop();
        return path;
      }
    }

    //check if new node is adjacent
    if (
      Math.abs(lastNode.pos[0] - newPos[0]) +
        Math.abs(lastNode.pos[1] - newPos[1]) ==
      1
    ) {
      const tileDist = getMovementCost(
        mapData[newPos[0]][newPos[1]].type,
        moveType,
        weather
      );
      //if it doesn't surpass movement restrictions, update current path
      if (tileDist + lastNode.dist <= movePoints) {
        path.push({
          pos: newPos,
          dist: tileDist + lastNode.dist,
          parent: lastNode.pos,
        });
        return path;
      }
    }
  }

  //if the new position can't be added to the current path, recreate the entire path
  const newPath: PathNode[] = [];
  let currentPos = newPos;
  while (currentPos !== null) {
    newPath.push(accessibleNodes.get(currentPos));
    currentPos = accessibleNodes.get(currentPos).parent;
  }
  return newPath.reverse();
}

export function showPath(spriteSheet: Spritesheet, path: PathNode[]) {
  if (path.length < 1) throw new Error("Empty path!");

  const mapContainer = new Container();
  mapContainer.eventMode = "static";

  function getSpriteName(a: Coord, b: Coord, c: Coord): string {
    //path from a to b to c, the sprite is the one displayed in b (middle node)
    const dify = Math.abs(a[1] - c[1]);
    const difx = Math.abs(a[0] - c[0]);
    if (dify + difx === 2) {
      //not start nor end
      if (dify === 2) return "ew";
      if (difx === 2) return "ns";

      let ans: string;
      if (a[0] > b[0] || c[0] > b[0]) ans = "s";
      else ans = "n";
      if (a[1] > b[1] || c[1] > b[1]) ans += "e";
      else ans += "w";
      return ans;
    }
    if (a[1] === b[1] && a[0] === b[0]) {
      //starting node
      if (c[1] === b[1] && c[0] === b[0])
        //AND ending node
        return "od";
      if (c[1] < b[1]) return "ow";
      if (c[1] > b[1]) return "oe";
      if (c[0] > b[0]) return "os";
      return "on";
    } else {
      //ending node
      if (a[1] < b[1]) return "wd";
      if (a[1] > b[1]) return "ed";
      if (a[0] < b[0]) return "nd";
      return "sd";
    }
  }

  const len = path.length;
  const path2 = [...path];
  path2.push(path[len - 1]); //to detect the final node

  for (let i = 0; i < len; ++i) {
    let spriteName: string;
    if (i === 0)
      //special case for original node
      spriteName = getSpriteName(path2[0].pos, path2[i].pos, path2[i + 1].pos);
    else
      spriteName = getSpriteName(
        path2[i - 1].pos,
        path2[i].pos,
        path2[i + 1].pos
      );

    const nodeSprite = new Sprite(spriteSheet.textures[spriteName + ".png"]);
    nodeSprite.anchor.set(0.5, 1); //?
    nodeSprite.x = (path2[i].pos[1] + 1) * 16; //swapped, again...?
    nodeSprite.y = (path2[i].pos[0] + 1) * 16;
    mapContainer.addChild(nodeSprite);
  }

  return mapContainer;
}
