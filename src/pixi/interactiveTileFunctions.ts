import { Container } from "pixi.js";
import type { Position } from "shared/schemas/position";
import { tileConstructor } from "./sprite-constructor";

// Damage forecast now lives in the engine (`shared/match-logic/combat-forecast`) so the backend
// can compute it. Re-exported here so existing pixi callers keep working unchanged.
// TODO(refactor phase 3): consume this as a backend preview, not by running the engine.
export { getBattleForecast, type BattleForecast } from "shared/match-logic/combat-forecast";

//passable tiles colour: "#43d9e4"
//attackable tiles colour: "#be1919"
export const createTilesContainer = (
  tilePositions: Position[],
  tileColour: string,
  tileZIndex: number,
  containerName?: string,
) => {
  const markedTiles = new Container();
  markedTiles.eventMode = "dynamic";

  for (const pos of tilePositions) {
    const square = tileConstructor(pos, tileColour);

    markedTiles.addChild(square);
  }

  markedTiles.zIndex = tileZIndex;

  if (containerName !== undefined) {
    markedTiles.name = containerName;
  }

  return markedTiles;
};
