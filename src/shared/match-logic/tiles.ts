import { TileType } from "server/schemas/tile";
import { MovementType } from "shared/match-logic/buildable-unit";
import { tsIncludes } from "shared/utils/typesafe-includes";

/**
 * Every unit has exactly one "movement type", for example tanks have type "treads".
 * This object shows the amount of movement points which must be spent
 * to *enter* each type of tile, for each "movement type".
 * `null` means impassible terrain.
 *
 * Note: Movement costs vary based on weather,
 * so we need to either:
 * 1) create one of these objects for each possible weather
 * 2) create one of these objects for "normal" weather and
 * perform some final weather-based modifications in the getter function.
 *
 * Currently we use approach (2).
 */
type TileMovementCosts = Record<MovementType, number | null>;

export interface TileProperties {
  movementCosts: TileMovementCosts;
  defenseStars: number;
}

/**
 * Movement costs which are shared by all ground-based map tiles
 * like forests, rivers and cities.
 * Specifically, if a map tile is passable for infantry,
 * we consider it to be a "land" tile.
 */
const landMovementCosts = {
  boots: 1,
  air: 1,
  pipe: null,
  sea: null,
  lander: null,
  // `as const satisfies ...` allows us essentially define a custom type with exactly
  // these keys, while asserting that the new type *also* matches another type/interface.
} as const satisfies Partial<TileMovementCosts>;

/**
 * All man-made structures (roads, buildings) have the same movement costs,
 * with two exceptions:
 * - Pipes are impassible except by piperunners.
 * - Any building which *could have* produced a unit
 * has a movement cost of 1 for that unit.
 *   - For example, ships can move through ports and piperunners can move through bases.
 */
const manMadeMovementCosts: TileMovementCosts = {
  ...landMovementCosts,
  foot: 1,
  treads: 1,
  tires: 1,
};

/** All man-made *buildings* provide 3 defense, except for the HQ which provides 4. */
const buildingDefense = 3;

/** All ocean tiles are impassible for land units. */
const seaMovementCosts = {
  foot: null,
  boots: null,
  treads: null,
  tires: null,
  air: 1,
  pipe: null,
} as const satisfies Partial<TileMovementCosts>;

/** Pipes and (unbroken) pipe seams are exactly the same */
const pipeTileProperties: TileProperties = {
  defenseStars: 0,
  movementCosts: {
    foot: null,
    boots: null,
    treads: null,
    tires: null,
    air: null,
    pipe: 1,
    sea: null,
    lander: null,
  },
};

/**
 * Defense and movement data for all tiles types.
 *
 * TODO: Create a TileType for a "broken pipe seam".
 *
 * Also we *could* combine usedSilo and unusedSilo
 * because they have the same defense and movement properties.
 * However, that is probably only worth doing if it simplifies silo logic elsewhere.
 */
const tileProperties: Record<TileType, TileProperties> = {
  plain: {
    defenseStars: 1,
    movementCosts: {
      ...landMovementCosts,
      foot: 1,
      treads: 1,
      tires: 2,
    },
  },
  forest: {
    defenseStars: 2,
    movementCosts: {
      ...landMovementCosts,
      foot: 1,
      treads: 2,
      tires: 3,
    },
  },
  mountain: {
    defenseStars: 4,
    movementCosts: {
      ...landMovementCosts,
      foot: 2,
      treads: null,
      tires: null,
    },
  },
  river: {
    defenseStars: 0,
    movementCosts: {
      ...landMovementCosts,
      foot: 2,
      treads: null,
      tires: null,
    },
  },
  road: {
    defenseStars: 0,
    movementCosts: manMadeMovementCosts,
  },
  sea: {
    defenseStars: 0,
    movementCosts: {
      ...seaMovementCosts,
      sea: 1,
      lander: 1,
    },
  },
  shoal: {
    defenseStars: 0,
    movementCosts: {
      ...landMovementCosts,
      foot: 1,
      treads: 1,
      tires: 1,
      // This is a beach, so navy *transports* can go here
      // but no other navy units!
      lander: 1,
    },
  },
  reef: {
    defenseStars: 1,
    movementCosts: {
      ...seaMovementCosts,
      sea: 2,
      lander: 2,
    },
  },
  pipe: pipeTileProperties,
  pipeSeam: pipeTileProperties,
  base: {
    defenseStars: buildingDefense,
    movementCosts: {
      ...manMadeMovementCosts,
      // Any building which *could have* produced a unit has
      // a movement cost of 1 for that unit.
      // Bases build piperunners.
      pipe: 1,
    },
  },
  port: {
    defenseStars: buildingDefense,
    movementCosts: {
      ...manMadeMovementCosts,
      // Any building which *could have* produced a unit has
      // a movement cost of 1 for that unit.
      // Ports build ships.
      sea: 1,
      lander: 1,
    },
  },
  airport: {
    defenseStars: buildingDefense,
    movementCosts: manMadeMovementCosts,
  },
  city: {
    defenseStars: buildingDefense,
    movementCosts: manMadeMovementCosts,
  },
  hq: {
    defenseStars: 4,
    movementCosts: manMadeMovementCosts,
  },
  bridge: {
    defenseStars: 0,
    movementCosts: manMadeMovementCosts,
  },
  lab: {
    defenseStars: buildingDefense,
    movementCosts: manMadeMovementCosts,
  },
  comtower: {
    defenseStars: buildingDefense,
    movementCosts: manMadeMovementCosts,
  },
  unusedSilo: {
    defenseStars: buildingDefense,
    movementCosts: manMadeMovementCosts,
  },
  usedSilo: {
    defenseStars: buildingDefense,
    movementCosts: manMadeMovementCosts,
  },
};

type Weather = "clear" | "rain" | "snow";

/**
 * Every type of map tile has some number of "defense stars",
 * an integer between 0 and 4, which modifies the amount of damage
 * a unit on that tile takes from attacks.
 */
export const getTerrainDefenseStars = (tileType: TileType) =>
  tileProperties[tileType].defenseStars;

/**
 * Caculate the defense of a unit.
 * Specifically, this calculates `D_TR * HP_D` as defined at
 * https://awbw.fandom.com/wiki/Damage_Formula
 *
 * Note: This does *not* round "visual hp", so the defense score is
 * not exactly the same as https://awbw.fandom.com/wiki/Damage_Formula .
 * We might want to add rounding for consistency.
 *
 * @param hp the current hp of the unit, a decimal 0 to 1
 * @param tileType the tile which the unit is on, e.g. "plains"
 */
export const getUnitTerrainDefense = (hp: number, tileType: TileType) => {
  /**
   * Historically, this game series has *stored* health as a number from 1 to 100,
   * and *displayed* health as a number from 1 to 10, by dividing by 10 with rounding.
   * The old damage formula is based on "visual health"
   * which is about 1/10 actual health.
   *
   * However, *we* are currently planning to store health as a number from 0 to 1,
   * and display it as decimal from 1 to 10 *exactly* like "8.7".
   *
   * So instead of dividing by 10 (with rounding), we multiply by 10.
   */
  const visualHp = hp * 10;
  return tileProperties[tileType].defenseStars * visualHp;
};

/**
 * Every turn, units get a certain number of movement points
 * which they can spend by moving.
 * Every unit has exactly one "movement type", for example tanks have type "treads".
 *
 * @param tileType The tile which the unit is trying to enter, e.g. "plains"
 * @param movementType The movement type of the unit, e.g. "treads"
 * @param weather The current weather, e.g. "rain"
 * @returns The amount of movement points which must be spent to *enter* the tile
 * (assuming the unit is already adjacent to the tile).
 * `null` means impassible terrain.
 */
export const getMovementCost = (
  tileType: TileType,
  movementType: MovementType,
  weather: Weather
): number | null => {
  const clearMovementCost =
    tileProperties[tileType].movementCosts[movementType];

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
