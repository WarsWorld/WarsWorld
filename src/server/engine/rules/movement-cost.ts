import type { TileType } from "server/core/schemas/tile";
import type { Weather } from "server/core/schemas/weather";
import type { MovementType } from "server/engine/constants/unit-properties";
import { terrainProperties } from "server/engine/constants/terrain-properties";
import type { GameVersion } from "server/core/schemas/game-version";

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
      // Air units: double cost on every terrain.
      if (movementType === "air") {
        return clearMovementCost * 2;
      }

      // Infantry: double cost on plains, woods and mountains (mountains become impassable at move 3).
      if (movementType === "foot" && ["plain", "forest", "mountain"].includes(tileType)) {
        return clearMovementCost * 2;
      }

      // Mechs: double cost on mountains.
      if (movementType === "boots" && tileType === "mountain") {
        return clearMovementCost * 2;
      }

      // Tires and treads: +1 on plains AND woods (same terrains rain slows them on).
      if (["tires", "treads"].includes(movementType) && ["plain", "forest"].includes(tileType)) {
        return clearMovementCost + 1;
      }

      // Ships and landers: double cost on sea and port.
      if (["sea", "lander"].includes(movementType) && ["sea", "port"].includes(tileType)) {
        return clearMovementCost * 2;
      }

      return clearMovementCost;
    }
    default: {
      return clearMovementCost;
    }
  }
}
