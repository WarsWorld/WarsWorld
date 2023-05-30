import { TileType } from "server/schemas/tile";
import {
  AbstractDestructibleTile,
  AbstractProductionBuilding,
  AbstractProperty,
  AbstractTile,
  TileMovementCosts,
} from "./abstract-tile";

/** All ocean tiles are impassible for land units. */
const commonOceanMovementCosts = {
  foot: null,
  boots: null,
  treads: null,
  tires: null,
  air: 1,
  pipe: null,
} satisfies Partial<TileMovementCosts>;

/**
 * Some movement costs are shared by all ground-based map tiles
 * like forests, rivers and cities.
 * Specifically, if a map tile is passable for infantry,
 * we consider it to be a "land" tile.
 */
const commonLandMovementCosts = {
  boots: 1,
  air: 1,
  pipe: null,
  sea: null,
  lander: null,
} satisfies Partial<TileMovementCosts>;

/**
 * All man-made structures (roads, buildings) have the same movement costs,
 * with two exceptions:
 * - Pipes are impassible except by piperunners.
 * - Any building which *could have* produced a unit
 * has a movement cost of 1 for that unit.
 *   - For example, ships can move through ports and piperunners can move through bases.
 */
const manMadeMovementCosts: TileMovementCosts = {
  ...commonLandMovementCosts,
  foot: 1,
  treads: 1,
  tires: 1,
};

const buildingTileProperties: AbstractTile = {
  /** All buildings provide 3 defense, except for the HQ which provides 4. */
  defenseStars: 3,
  movementCosts: manMadeMovementCosts,
};

/** Pipes and (unbroken) pipe seams are the same */
const pipeTileProperties: AbstractTile = {
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
 * Everything there is to know about the various types of tiles,
 * such as `forest` and `city`.
 *
 * The movement costs defined here assume clear weather and no CO powers.
 * Therefore, to calculate actual movement costs @see getMovementCost
 *
 * Terrain stars can also be modified by CO powers (Lash)
 */
export const tiles = {
  plain: {
    defenseStars: 1,
    movementCosts: {
      ...commonLandMovementCosts,
      foot: 1,
      treads: 1,
      tires: 2,
    },
  },
  forest: {
    defenseStars: 2,
    movementCosts: {
      ...commonLandMovementCosts,
      foot: 1,
      treads: 2,
      tires: 3,
    },
  },
  mountain: {
    defenseStars: 4,
    movementCosts: {
      ...commonLandMovementCosts,
      foot: 2,
      treads: null,
      tires: null,
    },
  },
  river: {
    defenseStars: 0,
    movementCosts: {
      ...commonLandMovementCosts,
      foot: 2,
      treads: null,
      tires: null,
    },
  },
  road: {
    defenseStars: 0,
    movementCosts: manMadeMovementCosts,
  },
  bridge: {
    defenseStars: 0,
    movementCosts: manMadeMovementCosts,
  },
  sea: {
    defenseStars: 0,
    movementCosts: {
      ...commonOceanMovementCosts,
      sea: 1,
      lander: 1,
    },
  },
  shoal: {
    defenseStars: 0,
    movementCosts: {
      ...commonLandMovementCosts,
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
      ...commonOceanMovementCosts,
      sea: 2,
      lander: 2,
    },
  },
  pipe: pipeTileProperties,
  pipeSeam: {
    ...pipeTileProperties,
    canBecomeTile: "brokenPipeSeam",
    maxHp: 99,
  } satisfies AbstractDestructibleTile,
  // same stats as plains, but not the same visually or for Jake CO powers
  brokenPipeSeam: {
    defenseStars: 1,
    movementCosts: {
      ...commonLandMovementCosts,
      foot: 1,
      treads: 1,
      tires: 2,
    },
  },
  base: {
    isProperty: true,
    providesFunds: true,
    resuppliedMovementTypes: ["foot", "boots", "treads", "tires", "pipe"],
    buildableMovementTypes: ["foot", "boots", "treads", "tires", "pipe"],
    defenseStars: buildingTileProperties.defenseStars,
    movementCosts: {
      ...manMadeMovementCosts,
      // Any building which *could have* produced a unit has
      // a movement cost of 1 for that unit.
      // Bases build piperunners.
      pipe: 1,
    },
  } satisfies AbstractProductionBuilding,
  port: {
    isProperty: true,
    providesFunds: true,
    resuppliedMovementTypes: ["sea", "lander"],
    buildableMovementTypes: ["sea", "lander"],
    defenseStars: buildingTileProperties.defenseStars,
    movementCosts: {
      ...manMadeMovementCosts,
      // Any building which *could have* produced a unit has
      // a movement cost of 1 for that unit.
      // Ports build ships.
      sea: 1,
      lander: 1,
    },
  } satisfies AbstractProductionBuilding,
  airport: {
    isProperty: true,
    providesFunds: true,
    resuppliedMovementTypes: ["air"],
    buildableMovementTypes: ["air"],
    ...buildingTileProperties,
  } satisfies AbstractProductionBuilding,
  city: {
    isProperty: true,
    providesFunds: true,
    // Piperunners cannot enter this tile, but they can _start_ on it.
    // If a piperunner starts on a captured city, should it be resupplied?
    resuppliedMovementTypes: ["foot", "boots", "treads", "tires"],
    ...buildingTileProperties,
  } satisfies AbstractProperty,
  hq: {
    isProperty: true,
    providesFunds: true,
    defenseStars: 4,
    movementCosts: manMadeMovementCosts,
  } satisfies AbstractProperty,
  lab: {
    isProperty: true,
    providesFunds: false,
    ...buildingTileProperties,
  } satisfies AbstractProperty,
  comtower: {
    isProperty: true,
    providesFunds: false,
    ...buildingTileProperties,
  } satisfies AbstractProperty,
  // This is a special building which you can only "use" once,
  // instead of capturing it as a property.
  unusedSilo: {
    ...buildingTileProperties,
    canBecomeTile: "usedSilo",
  },
  usedSilo: buildingTileProperties,
} as const satisfies Record<TileType, AbstractTile>;
