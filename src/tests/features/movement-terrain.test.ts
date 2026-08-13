import { describe, expect, it } from "vitest";
import type { MovementType } from "shared/match-logic/game-constants/unit-properties";
import { getBaseMovementCost } from "shared/match-logic/movement-cost";
import type { GameVersion } from "shared/schemas/game-version";
import type { TileType } from "shared/schemas/tile";
import type { Weather } from "shared/schemas/weather";

/**
 * Movement cost = terrain × movement-type (× weather, except AWDS). `null` means impassable.
 * Data-driven because the rule is a lookup table plus a small weather-penalty branch — pinning it
 * guards terrain balance and the "impassable stays impassable" invariant against refactors.
 */
type Case = [MovementType, TileType, Weather, GameVersion, number | null];

const MOVEMENT_MATRIX: Case[] = [
  // Clear weather — base costs and impassability.
  ["foot", "plain", "clear", "AW2", 1],
  ["foot", "mountain", "clear", "AW2", 2],
  ["foot", "river", "clear", "AW2", 2],
  ["foot", "sea", "clear", "AW2", null], // land units can't enter the sea
  ["treads", "plain", "clear", "AW2", 1],
  ["treads", "forest", "clear", "AW2", 2],
  ["treads", "mountain", "clear", "AW2", null], // tanks can't climb mountains
  ["tires", "plain", "clear", "AW2", 2],
  ["tires", "forest", "clear", "AW2", 3],
  ["sea", "sea", "clear", "AW2", 1],
  ["sea", "plain", "clear", "AW2", null], // ships can't sail on land
  ["lander", "shoal", "clear", "AW2", 1], // transports can beach on shoals
  ["air", "mountain", "clear", "AW2", 1], // air ignores terrain
  ["air", "sea", "clear", "AW2", 1],
  ["pipe", "pipe", "clear", "AW2", 1],
  ["treads", "pipe", "clear", "AW2", null], // only pipe-runners use pipes

  // Weather penalties (non-AWDS).
  ["treads", "plain", "rain", "AW2", 2], // +1 mud
  ["foot", "plain", "snow", "AW2", 2], // +1 snow
  ["air", "mountain", "snow", "AW2", 2], // air doubles in snow
  ["foot", "mountain", "snow", "AW2", 4], // foot doubles on snowy mountains

  // AWDS ignores weather movement penalties.
  ["treads", "plain", "rain", "AWDS", 1],
];

describe("terrain movement costs", () => {
  it.each(MOVEMENT_MATRIX)(
    "%s on %s (%s/%s) = %s",
    (movementType, tile, weather, version, expected) => {
      expect(getBaseMovementCost(movementType, weather, tile, version)).toBe(expected);
    },
  );
});
