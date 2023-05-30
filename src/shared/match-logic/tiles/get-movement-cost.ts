import { TileType } from "server/schemas/tile";
import { tsIncludes } from "shared/utils/typesafe-includes";
import { MovementType } from "../buildable-unit";
import { tiles } from "./tiles";

export type Weather = "clear" | "rain" | "snow";

/**
 * Every turn, units get a certain number of movement points
 * which they can spend by moving.
 * Every unit has exactly one "movement type", for example tanks have type "treads".
 * See https://awbw.fandom.com/wiki/Units#Movement for more details.
 *
 * @param tileType The tile which the unit is trying to enter, e.g. 'plains'
 * @param movementType The movement type of the unit, e.g. 'treads'
 * @param weather The current weather
 * @returns The amount of movement points which must be spent to *enter* the tile
 * (assuming the unit is already adjacent to the tile).
 * `null` means impassible terrain.
 */
export const getMovementCost = (
  tileType: TileType,
  movementType: MovementType,
  weather: Weather
): number | null => {
  const clearMovementCost = tiles[tileType].movementCosts[movementType];

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

      if (
        tileType === "forest" &&
        tsIncludes(movementType, ["foot", "boots"])
      ) {
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
  }
};
