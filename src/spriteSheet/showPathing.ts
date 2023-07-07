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

export type Coord = {
  x: number;
  y: number;
};
export type PathNode = {
  //saves distance from origin and parent (to retrieve the shortest path)
  pos: Coord;
  dist: number;
  parent: Coord | null;
};

export function getAccessibleNodes( //TODO: save result of function? _ (Sturm d2d?)
  mapData: Tile[][],
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
  queues[0].push({ pos: { x: x, y: y }, dist: 0, parent: null }); //queues[0] has the origin node, initially

  const visited: boolean[][] = [];
  // Initialize visited matrix
  for (let i = 0; i < mapData.length; i++) {
    visited[i] = [];
    for (let j = 0; j < mapData[i].length; j++) {
      visited[i][j] = false;
    }
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

    if (visited[currPos.x][currPos.y]) continue;
    //update variables to mark as visited and add to result
    visited[currPos.x][currPos.y] = true;
    accessibleTiles.set(currPos, currNode);

    //the 4 adjacent node's coordinates:
    const xCoords = [currPos.x - 1, currPos.x + 1, currPos.x, currPos.x];
    const yCoords = [currPos.y, currPos.y, currPos.y - 1, currPos.y + 1];

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
            pos: { x: xCoords[i], y: yCoords[i] },
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
  accessibleNodes?: Map<Coord, PathNode>
): Container {
  const unitProperties = unitPropertiesMap[unit.type];

  //The big container holding everything
  //set its eventmode to static for interactivity and sortable for zIndex
  const markedTiles = new Container();
  markedTiles.eventMode = "static";
  //markedTiles.sortableChildren = true; ?

  if (accessibleNodes === undefined) {
    accessibleNodes = getAccessibleNodes(
      mapData,
      "clear", //!
      unitProperties.moveRange,
      unitProperties.movementType,
      unit.position[0],
      unit.position[1]
    );
  }

  for (const [pos, node] of accessibleNodes.entries()) {
    const square = new Sprite(Texture.WHITE);
    square.anchor.set(0.5, 1); //?
    square.x = (pos.y + 1) * 16; //<- inverted for some reason
    square.y = (pos.x + 1) * 16;
    square.width = 16;
    square.height = 16;
    square.eventMode = "static";
    //square.tint = "#1000" + (16 + value.dist*30).toString(16);
    square.tint = "#80FF80";
    square.blendMode = 2; //blend mode Multiply ?

    markedTiles.addChild(square);
  }

  return markedTiles;
}

export function getAttackableTiles(
  mapData: Tile[][],
  weather: Weather,
  movePoints: number,
  moveType: MovementType,
  x: number,
  y: number
): Coord[] {
  const nodes: Map<Coord, PathNode> = getAccessibleNodes(
    mapData,
    weather,
    movePoints,
    moveType,
    x,
    y
  );

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
  for (const [pos, node] of nodes.entries()) {
    const xCoords = [pos.x - 1, pos.x + 1, pos.x, pos.x];
    const yCoords = [pos.y, pos.y, pos.y - 1, pos.y + 1];
    for (let i = 0; i < 4; ++i) {
      //all positions adjacent to tiles where the unit can move to are attacking tiles
      if (isValidTile(xCoords[i], yCoords[i]))
        if (!visited[xCoords[i]][yCoords[i]]) {
          attackCoords.push({ x: xCoords[i], y: yCoords[i] });
          visited[xCoords[i]][yCoords[i]] = true;
        }
    }
  }

  return attackCoords;
}

export async function showAttackableTiles(
  mapData: Tile[][],
  unit: CreatableUnit,
  attackableTiles?: Coord[]
): Container {
  const unitProperties = unitPropertiesMap[unit.type];

  //The big container holding everything
  //set its eventmode to static for interactivity and sortable for zIndex
  const markedTiles = new Container();
  markedTiles.eventMode = "static";
  //markedTiles.sortableChildren = true; ?

  if (attackableTiles === undefined) {
    attackableTiles = getAttackableTiles(
      mapData,
      "clear", //!
      unitProperties.moveRange,
      unitProperties.movementType,
      unit.position[0],
      unit.position[1]
    );
  }

  for (const pos of attackableTiles) {
    const square = new Sprite(Texture.WHITE);
    square.anchor.set(0.5, 1); //?
    square.x = (pos.y + 1) * 16; //<- inverted for some reason
    square.y = (pos.x + 1) * 16;
    square.width = 16;
    square.height = 16;
    square.eventMode = "static";
    //square.tint = "#1000" + (16 + value.dist*30).toString(16);
    square.tint = "#FF8080";
    square.blendMode = 2; //blend mode Multiply ?

    markedTiles.addChild(square);
  }

  return markedTiles;
}

//TODO COMPLETELY UNTESTED!!
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
      Math.abs(lastNode.pos.x - newPos.x) +
        Math.abs(lastNode.pos.y - newPos.y) ==
      1
    ) {
      const tileDist = getMovementCost(
        mapData[newPos.x][newPos.y].type,
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
  } //TODO does that work?
  return newPath.reverse();
}

export function showPath(spriteSheet: Spritesheet, path: PathNode[]) {
  if (path.length < 1) throw new Error("Empty path!");

  const mapContainer = new Container();
  mapContainer.eventMode = "static";

  function getSpriteName(a: Coord, b: Coord, c: Coord): string {
    //path from a to b to c, the sprite is the one displayed in b (middle node)
    const dify = Math.abs(a.y - c.y);
    const difx = Math.abs(a.x - c.x);
    if (dify + difx === 2) {
      //not start nor end
      if (dify === 2) return "ew";
      if (difx === 2) return "ns";

      let ans: string;
      if (a.x > b.x || c.x > b.x) ans = "s";
      else ans = "n";
      if (a.y > b.y || c.y > b.y) ans += "e";
      else ans += "w";
      return ans;
    }
    if (a.y === b.y && a.x === b.x) {
      //starting node
      if (c.y === b.y && c.x === b.x)
          //AND ending node
        return "od";
      if (c.y < b.y) return "ow";
      if (c.y > b.y) return "oe";
      if (c.x > b.x) return "os";
      return "on";
    } else {
      //ending node
      if (a.y < b.y) return "wd";
      if (a.y > b.y) return "ed";
      if (a.x < b.x) return "nd";
      return "sd";
    }
  }

  const len = path.length;
  const path2 = [...path];
  path2.push(path[len - 1]);

  for (let i = 0; i < len; ++i) {
    let spriteName: string;
    if (i === 0)
      spriteName = getSpriteName(path2[0].pos, path2[i].pos, path2[i + 1].pos);
    else
      spriteName = getSpriteName(path2[i - 1].pos, path2[i].pos, path2[i + 1].pos);

    const nodeSprite = new Sprite(spriteSheet.textures[spriteName + ".png"]);
    nodeSprite.anchor.set(0.5, 1); //?
    nodeSprite.x = (path2[i].pos.y + 1) * 16; //swapped, again...?
    nodeSprite.y = (path2[i].pos.x + 1) * 16;
    mapContainer.addChild(nodeSprite);
  }

  return mapContainer;
}
