import { Segment } from 'pages/match/[matchId]';
import TinyQueue from 'tinyqueue';
import { checkTerrain } from './check-terrain';
import { UnitType, factoryBuildableUnits } from './unit-builder';

export type SomeTile = {
  distance: number;
  index: number;
  x: number;
  y: number;
  hasEnemy?: boolean;
};

export type BlueTiles = ReturnType<typeof pathFinding>;

function pathFinding(
  maxX: number,
  maxY: number,
  unitType: UnitType,
  initialTile: number,
  gameState: Segment[],
  ignoreTerrain: boolean,
) {
  const unitData = factoryBuildableUnits.find((u) => u.type === unitType);

  if (unitData === undefined) {
    throw new Error(`Unit ${unitType} not found`);
  }

  // initialTile / 18 will give us a number without a decimal (thanks to Math.trunc), this tells us the current column we are in
  const startY = Math.trunc(initialTile / 18);
  // the remainder of initialTile / 18 is equal to our current row
  const startX = initialTile % 18;

  //maxX maxY = rows columns, multiply together and get all tiles in grid
  const nodeAmount = maxX * maxY;

  //Lets initialize our grid

  //So we need to initialize our visited nodes (which we will use to check if we have used or haven't used the route before)
  const visitedNodes = [];
  // Our presumed distance from start to the given tile
  const distance = [];
  //our previous tiles?
  const previous = [];
  // the cost of movement in this tile?
  const movementCost = [];

  for (let i = 0; i < nodeAmount; i++) {
    // we havent visited it yet
    visitedNodes.push(false);
    //?
    distance.push(Infinity);
    // we havent seen previous yet, so they are all null
    previous.push(null);
    // we still dont have the movement cost of each tile
    movementCost.push(null);
  }

  // where our unit currentNode is, where it starts
  const startTile = startX + startY * maxX;
  // there is 0 distance to transverse the tile we are already in.
  distance[startTile] = 0;

  const priorityQueue = new TinyQueue<SomeTile>([], function (a, b) {
    return a.distance - b.distance;
  });

  // we verify tiles to not include them twice
  const verifyTile: Record<number, number> = {};

  // our initial tile
  const initial: SomeTile = {
    distance: 0,
    index: startTile,
    x: startX,
    y: startY,
  };

  priorityQueue.push(initial);
  //we add our initial tile to our verified array
  verifyTile[startTile] = 0;

  //tiles to draw is literally an array of the tiles we will "draw" in the map as our possible movement options in blue squares
  const tilesToDraw = [initial];

  // here is the "real" djkstras algorithm

  while (priorityQueue.length !== 0) {
    // we get the current Node and pop it to also remove it from the queue array
    const currentNode = priorityQueue.pop()!;
    //the index of the current node (the index of our current tile)
    const index = currentNode.index;
    //the overall to cross this node/ the distance of it???
    const overallDistance = currentNode.distance;

    // if distance of our node is less than our minimum value then we break the loop
    if (distance[index] < overallDistance) continue;

    const x = currentNode.x;
    const y = currentNode.y;

    // we check that we have visited the current node
    visitedNodes[index] = true;
    //Not sure why we delete the verify tile?
    delete verifyTile[index];

    //These are our x / y values, since if we go up, down, right or left we might add a column (1,1 to 2,1) or take one out (2,1 to 1,1) while or row might stay the same because we can only move one tile at the same time and therefore the row/column will increas eor decrease and the other one will stay the same.
    const xMove = [-1, 1, 0, 0];
    const yMove = [0, 0, -1, 1];

    // here we calculate the 4 tilea around the current Node using xMove and yMove
    for (let i = 0; i < 4; i++) {
      // we initialize our adding variables
      const addX = x + xMove[i];
      const addY = y + yMove[i];

      // if we hit an edge, we stop (being -1 or being our max value +1, we enter a tile that doesnt exist (such as a 3x3 having a tile -1 or tile 4)
      if (addY < 0 || addX < 0 || addX >= maxX || addY >= maxY) continue;

      //The next tile is either -1 or +1 on row or column, so either addX or AddY will be 0, 1 or -1, moving us exactly one tile.
      const nextNodeIndex = addX + addY * maxX;

      //If we have already visited this node, we go to the next ones, we don't want to re-calculate a node we have already visited
      if (visitedNodes[nextNodeIndex]) continue;

      //lets check the terrain cost of our next index/tile
      let costToMove;
      let hasEnemy;
      //we use ignoreTerrain to calculate the range of indirect units since their range ignores terrain
      if (ignoreTerrain === true) {
        movementCost[nextNodeIndex] = 1;
        costToMove = 1;
      }
      //if we dont ignore the terrain, then we actually go check it out
      else {
        costToMove = checkTerrain(
          unitData.moveType,
          gameState[nextNodeIndex].tile,
          gameState[initialTile].tile,
        );

        if (costToMove === null) {
          // enemy unit
          movementCost[nextNodeIndex] = 9;
          //is it an indirect? if so, it doesnt show enemy tiles since it would be misleading since arty can only hit stuff if it doesnt move
          if (!unitData.usedAfterMove) {
            hasEnemy = true;
          }

          //lets setup the movement cost of our new tile
        } else {
          movementCost[nextNodeIndex] = costToMove;
        }
      }

      //The new distance from our initial tile to the new tile
      const newDistance = overallDistance + costToMove!;

      //if new distance is less than the distance of the next node AND the new distance isn't bigger than what the unit can move, then we add this tile to ou

      //Check that its an enemy then mark as red, but only if its not more than move points + 1
      if (
        (hasEnemy && overallDistance < unitData.move + 1) ||
        (newDistance < distance[nextNodeIndex] && newDistance <= unitData.move)
      ) {
        previous[nextNodeIndex] = index;
        distance[nextNodeIndex] = newDistance;
        // if we havent verified this tile
        if (!verifyTile[nextNodeIndex]) {
          priorityQueue.push({
            index: nextNodeIndex,
            distance: newDistance,
            x: addX,
            y: addY,
          });
          verifyTile[nextNodeIndex] = newDistance;
          // we push the tile we will draw later
          tilesToDraw.push({
            distance: newDistance,
            index: nextNodeIndex,
            hasEnemy: hasEnemy,
            x: addX,
            y: addY,
          });
          // we can't move anymore
        } else {
          // not sure what exactly happens here...
          // for (const node in priorityQueue) {
          //   if (priorityQueue[node.index === nextNodeIndex])
          //     priorityQueue[node].distance = newDistance;
          // }
        }
      }
    }
  }
  // we return the tiles to draw so the component can "draw" them unto the map
  return {
    tilesToDraw: tilesToDraw,
    previous: previous,
  };
}

export { pathFinding };
