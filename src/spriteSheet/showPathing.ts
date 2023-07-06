//TODO: Fix TS issues, it treats an array as if it was not an array
// with forEach and type-safety is secondary to the project so...  - Javi

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Container, Texture, Sprite } from "pixi.js";
import {
  MovementType,
  unitPropertiesMap,
} from "../shared/match-logic/buildable-unit";
import { getMovementCost } from "../shared/match-logic/tiles";
import { Tile, Weather } from "../server/schemas/tile.ts";
import { CreatableUnit } from "../server/schemas/unit";

type Coord = {
  x: number;
  y: number;
};
type Node = {
  //saves distance from origin and parent (to retrieve the shortest path)
  pos: Coord;
  dist: number;
  parent: Coord | null;
};

function getAccessibleNodes( //TODO: save result of function? _ (Sturm d2d?)
  mapData: Tile[][],
  weather: Weather,
  movePoints: number,
  moveType: MovementType,
  x: number,
  y: number
): Map<Coord, Node> {
  const accessibleTiles: Map<Coord, Node> = new Map(); //return variable

  //queues[a] has current queued nodes with distance a from origin (technically a "stack", not a queue, but the result doesn't change)
  const queues: Node[][] = [];
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

function getAttackableTiles(
  mapData: Tile[][],
  weather: Weather,
  movePoints: number,
  moveType: MovementType,
  x: number,
  y: number
): Coord[] {
  const nodes: Map<Coord, Node> = getAccessibleNodes(
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

export async function showPassableTiles(
  mapData: Tile[][],
  unit: CreatableUnit
): Container {
  const unitProperties = unitPropertiesMap[unit.type];

  //The big container holding everything
  //set its eventmode to static for interactivity and sortable for zIndex
  const markedTiles = new Container();
  markedTiles.eventMode = "static";
  //markedTiles.sortableChildren = true; ?

  const nodes: Map<Coord, Node> = getAccessibleNodes(
    mapData,
    "clear", //!
    unitProperties.moveRange,
    unitProperties.movementType,
    unit.position[0],
    unit.position[1]
  );
  for (const [pos, node] of nodes.entries()) {
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

export async function showAttackableTiles(
  mapData: Tile[][],
  unit: CreatableUnit
): Container {
  const unitProperties = unitPropertiesMap[unit.type];

  //The big container holding everything
  //set its eventmode to static for interactivity and sortable for zIndex
  const markedTiles = new Container();
  markedTiles.eventMode = "static";
  //markedTiles.sortableChildren = true; ?

  const coords: Coord[] = getAttackableTiles(
    mapData,
    "clear", //!
    unitProperties.moveRange,
    unitProperties.movementType,
    unit.position[0],
    unit.position[1]
  );
  for (const pos of coords) {
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
