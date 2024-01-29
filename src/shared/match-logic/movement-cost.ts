import type { TileType } from "shared/schemas/tile";
import type { Weather } from "shared/schemas/weather";
import type { MovementType } from "./game-constants/unit-properties";
import { terrainProperties } from "./game-constants/terrain-properties";
import type { GameVersion } from "../schemas/game-version";

export function getBaseMovementCost(
  movementType: MovementType,
  weather: Weather,
  tileType: TileType,
  gameVersion: GameVersion,
): number | null {
  const clearMovementCost = terrainProperties[tileType].movementCosts[movementType];

  // impassible terrain remains impassible regardless of weather
  if (clearMovementCost === null) {
    return null;
  }

  if (gameVersion === "AWDS") {
    return clearMovementCost; // weather doesn't inflict move penalties in awds
  }

  switch (weather) {
    case "rain": {
      if (["plain", "forest"].includes(tileType) && ["treads", "tires"].includes(movementType)) {
        return clearMovementCost + 1;
      }

      return clearMovementCost;
    }
    case "snow": {
      if (movementType === "air") {
        return clearMovementCost * 2;
      }

      if (tileType === "plain" && ["foot", "tires", "treads"].includes(movementType)) {
        return clearMovementCost + 1;
      }

      if (tileType === "forest" && movementType === "foot") {
        return clearMovementCost + 1;
      }

      if (tileType === "mountain" && ["foot", "boots"].includes(movementType)) {
        return clearMovementCost * 2;
      }

      if (["sea", "port"].includes(tileType) && ["sea", "lander"].includes(movementType)) {
        return clearMovementCost + 1;
      }

      return clearMovementCost;
    }
    default: {
      return clearMovementCost;
    }
  }
}
