import { TileType } from "server/schemas/tile";
import { MovementType } from "shared/match-logic/buildable-unit";
import { tsIncludes } from "shared/utils/typesafe-includes";

export interface TileProperties {
  movementCosts: Record<MovementType, number | null>;
  defenseStars: number;
}

const roadTileProperties: TileProperties = {
  defenseStars: 0,
  movementCosts: {
    foot: 1,
    boots: 1,
    treads: 1,
    tires: 1,
    air: 1,
    pipe: null,
    sea: null,
    lander: null,
  },
};

const plainTileProperties: TileProperties = {
  defenseStars: 1,
  movementCosts: {
    ...roadTileProperties.movementCosts,
    tires: 2,
  },
};

const cityTileProperties: TileProperties = {
  defenseStars: 3,
  movementCosts: roadTileProperties.movementCosts,
};

const mountainTileProperties: TileProperties = {
  defenseStars: 4,
  movementCosts: {
    foot: 2,
    boots: 1,
    treads: null,
    tires: null,
    air: 1,
    pipe: null,
    sea: null,
    lander: null,
  },
};

const seaTileProperties: TileProperties = {
  defenseStars: 0,
  movementCosts: {
    foot: null,
    boots: null,
    treads: null,
    tires: null,
    air: 1,
    pipe: null,
    sea: 1,
    lander: 1,
  },
};

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

const movementCostMap: Record<TileType, TileProperties> = {
  plain: plainTileProperties,
  mountain: mountainTileProperties,
  forest: {
    defenseStars: 2,
    movementCosts: {
      ...plainTileProperties.movementCosts,
      treads: 2,
      tires: 3,
    },
  },
  river: {
    ...mountainTileProperties,
    defenseStars: 0,
  },
  road: roadTileProperties,
  sea: seaTileProperties,
  shoal: {
    defenseStars: 0,
    movementCosts: {
      ...roadTileProperties.movementCosts,
      lander: 1,
    },
  },
  reef: {
    defenseStars: 1,
    movementCosts: {
      ...seaTileProperties.movementCosts,
      sea: 2,
      lander: 2,
    },
  },
  pipe: pipeTileProperties,
  pipeSeam: pipeTileProperties,
  base: {
    defenseStars: cityTileProperties.defenseStars,
    movementCosts: {
      ...cityTileProperties.movementCosts,
      pipe: 1,
    },
  },
  port: {
    defenseStars: cityTileProperties.defenseStars,
    movementCosts: {
      ...cityTileProperties.movementCosts,
      sea: 1,
      lander: 1,
    },
  },
  airport: cityTileProperties,
  city: cityTileProperties,
  hq: {
    ...cityTileProperties,
    defenseStars: 4,
  },
  bridge: roadTileProperties,
  lab: cityTileProperties,
  comtower: cityTileProperties,
  unusedSilo: cityTileProperties,
  usedSilo: cityTileProperties,
};

type Weather = "clear" | "rain" | "snow";

export const getTerrainDefenseStars = (tileType: TileType) =>
  movementCostMap[tileType].defenseStars;

export const getUnitTerrainDefense = (hp: number, tileType: TileType) =>
  movementCostMap[tileType].defenseStars * 10 * hp;

export const getMovementCost = (
  tileType: TileType,
  movementType: MovementType,
  weather: Weather
): number | null => {
  const clearMovementCost =
    movementCostMap[tileType].movementCosts[movementType];

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
