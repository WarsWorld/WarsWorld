import { Container, Sprite } from "pixi.js";
import type { PathNode } from "shared/match-logic/pathfinding";
import type { Position } from "shared/schemas/position";
import { isSamePosition, positionsAreNeighbours } from "shared/schemas/position";
import { baseTileSize } from "../components/client-only/MatchRenderer";
import type { UnitWrapper } from "../shared/wrappers/unit";
import type { LoadedSpriteSheet } from "./load-spritesheet";

// Movement/attack reachability now lives in the engine (`shared/match-logic/pathfinding`) so the
// backend can compute it. Re-exported here so existing pixi callers keep working unchanged.
// TODO(refactor phase 3): callers should consume these as backend previews, not run the engine.
export {
  getAccessibleNodes,
  getAttackableTiles,
  getAttackTargetTiles,
} from "shared/match-logic/pathfinding";
export type { PathNode } from "shared/match-logic/pathfinding";

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
  path: Position[],
  newPos: Position,
): Position[] => {
  if (path.length !== 0) {
    const lastPosition = path.at(-1)!;

    for (const pos of path) {
      if (isSamePosition(pos, newPos)) {
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
  let currentPathNode = undefined;

  for (const [key, value] of accessibleNodes) {
    if (isSamePosition(key, newPos)) {
      currentPathNode = value;
      break;
    }
  }

  if (currentPathNode === undefined) {
    return path;
  }

  while (currentPathNode !== undefined) {
    newPath.push(currentPathNode.pos);

    if (currentPathNode.parent === null) {
      break;
    }

    currentPathNode = accessibleNodes.get(currentPathNode.parent);
  }

  if (newPath.length === 0) {
    return path;
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
  arrowContainer.name = "pathArrows";
  arrowContainer.zIndex = 9999;
  return arrowContainer;
};
