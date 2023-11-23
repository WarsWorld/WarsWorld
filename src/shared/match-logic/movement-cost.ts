import type { TileType } from "shared/schemas/tile";
import type { Weather } from "shared/schemas/weather";
import { tsIncludes } from "shared/utils/typesafe-includes";
import type { MovementType } from "./buildable-unit";
import { terrainProperties } from "./terrain";

export function getBaseMovementCost(
  movementType: MovementType,
  weather: Weather,
  tileType: TileType
): number | null {
  const clearMovementCost =
    terrainProperties[tileType].movementCosts[movementType];

  // impassible terrain remains impassible regardless of weather
  if (clearMovementCost === null) {
    return null;
  }

  switch (weather) {
    case "clear":
      return clearMovementCost;
    case "rain": {
      if (
        tsIncludes(tileType, ["plain", "forest"]) &&
        tsIncludes(movementType, ["treads", "tires"])
      ) {
        return clearMovementCost + 1;
      }

      return clearMovementCost;
    }
    case "snow": {
      if (movementType === "air") {
        return clearMovementCost * 2;
      }

      if (
        tileType === "plain" &&
        tsIncludes(movementType, ["foot", "tires", "treads"])
      ) {
        return clearMovementCost + 1;
      }

      if (tileType === "forest" && movementType === "foot") {
        return clearMovementCost + 1;
      }

      if (
        tileType === "mountain" &&
        tsIncludes(movementType, ["foot", "boots"])
      ) {
        return clearMovementCost * 2;
      }

      if (
        tsIncludes(tileType, ["sea", "port"]) &&
        tsIncludes(movementType, ["sea", "lander"])
      ) {
        return clearMovementCost + 1;
      }

      return clearMovementCost;
    }
    default: {
      throw new Error(`Can't handle weather ${weather} yet!`);
    }
  }
}
