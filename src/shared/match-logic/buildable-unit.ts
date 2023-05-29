import {
  UnitDuringMatch,
  WithAmmoUnitType,
  WithoutAmmoUnitType,
  WithoutWeaponUnitType,
} from "server/schemas/unit";

export const isSeaUnit = (unit: UnitDuringMatch) =>
  ["sea", "lander"].includes(unitPropertiesMap[unit.type].movementType);

export const getDailyFuelUsage = (unit: UnitDuringMatch): number => {
  const { movementType } = unitPropertiesMap[unit.type];

  if (movementType === "sea" || movementType === "lander") {
    return unit.type === "sub" && unit.hidden ? 5 : 1;
  }

  if (movementType === "air") {
    if (unit.type === "battleCopter" || unit.type === "transportCopter") {
      return 2;
    } else if (unit.type === "stealth" && unit.hidden) {
      return 8;
    }
    return 5;
  }

  return 0;
};

export type MovementType =
  | "foot"
  | "boots"
  | "treads"
  | "tires"
  | "air"
  | "sea"
  | "lander"
  | "pipe";

export type Facility = "base" | "airport" | "port";

interface UnitPropertiesWithoutWeapon {
  cost: number;
  facility: Facility;
  movementType: MovementType;
  moveRange: number;
  initialFuel: number;
  vision: number;
}

export type Range = [number, number];

const directRange: Range = [1, 1];

interface UnitPropertiesWithoutAmmo extends UnitPropertiesWithoutWeapon {
  attackRange: Range;
}

interface UnitPropertiesWithAmmo extends UnitPropertiesWithoutAmmo {
  initialAmmo: number;
}

type UnitPropertiesMap = Record<
  WithoutAmmoUnitType,
  UnitPropertiesWithoutAmmo
> &
  Record<WithAmmoUnitType, UnitPropertiesWithAmmo> &
  Record<WithoutWeaponUnitType, UnitPropertiesWithoutWeapon>;

export const unitPropertiesMap: UnitPropertiesMap = {
  infantry: {
    cost: 1000,
    facility: "base",
    movementType: "foot",
    moveRange: 3,
    initialFuel: 99,
    vision: 2,
    attackRange: directRange,
  },
  mech: {
    cost: 3000,
    facility: "base",
    movementType: "boots",
    moveRange: 2,
    initialFuel: 70,
    vision: 2,
    initialAmmo: 3,
    attackRange: directRange,
  },
  recon: {
    cost: 4000,
    facility: "base",
    vision: 5,
    initialFuel: 80,
    attackRange: directRange,
    movementType: "tires",
    moveRange: 8,
  },
  apc: {
    cost: 5000,
    facility: "base",
    moveRange: 5,
    vision: 1,
    initialFuel: 70,
    movementType: "treads",
  },
  artillery: {
    cost: 6000,
    facility: "base",
    vision: 1,
    initialFuel: 50,
    attackRange: [2, 3],
    initialAmmo: 9,
    movementType: "treads",
    moveRange: 5,
  },
  tank: {
    cost: 7000,
    facility: "base",
    moveRange: 6,
    vision: 3,
    initialAmmo: 9,
    attackRange: directRange,
    movementType: "treads",
    initialFuel: 70,
  },
  antiAir: {
    cost: 8000,
    facility: "base",
    vision: 2,
    initialFuel: 60,
    movementType: "treads",
    attackRange: directRange,
    moveRange: 6,
    initialAmmo: 9,
  },
  missile: {
    cost: 12000,
    facility: "base",
    movementType: "tires",
    moveRange: 4,
    initialAmmo: 6,
    attackRange: [3, 5],
    vision: 5,
    initialFuel: 50,
  },
  rocket: {
    cost: 15000,
    facility: "base",
    movementType: "tires",
    attackRange: [3, 5],
    moveRange: 5,
    initialAmmo: 6,
    vision: 1,
    initialFuel: 50,
  },
  mediumTank: {
    cost: 16000,
    facility: "base",
    vision: 1,
    moveRange: 5,
    initialFuel: 50,
    initialAmmo: 8,
    movementType: "treads",
    attackRange: directRange,
  },
  pipeRunner: {
    cost: 20000,
    facility: "base",
    attackRange: [2, 5],
    movementType: "pipe",
    moveRange: 9,
    vision: 4,
    initialAmmo: 9,
    initialFuel: 99,
  },
  neoTank: {
    cost: 22000,
    facility: "base",
    initialAmmo: 9,
    moveRange: 6,
    vision: 1,
    initialFuel: 99,
    movementType: "treads",
    attackRange: directRange,
  },
  megaTank: {
    cost: 28000,
    facility: "base",
    initialAmmo: 3,
    vision: 1,
    moveRange: 4,
    initialFuel: 50,
    movementType: "treads",
    attackRange: directRange,
  },
  transportCopter: {
    cost: 5000,
    moveRange: 6,
    vision: 2,
    facility: "airport",
    movementType: "air",
    initialFuel: 99,
  },
  battleCopter: {
    cost: 9000,
    vision: 3,
    initialFuel: 99,
    facility: "airport",
    movementType: "air",
    moveRange: 9000,
    initialAmmo: 6,
    attackRange: directRange,
  },
  fighter: {
    cost: 20000,
    vision: 2,
    initialFuel: 99,
    movementType: "air",
    facility: "airport",
    moveRange: 9,
    initialAmmo: 9,
    attackRange: directRange,
  },
  bomber: {
    cost: 22000,
    vision: 2,
    initialAmmo: 9,
    movementType: "air",
    facility: "airport",
    moveRange: 7,
    initialFuel: 99,
    attackRange: directRange,
  },
  stealth: {
    cost: 24000,
    vision: 4,
    initialFuel: 60,
    moveRange: 6,
    movementType: "air",
    facility: "airport",
    initialAmmo: 6,
    attackRange: directRange,
  },
  blackBomb: {
    cost: 25000,
    vision: 1,
    moveRange: 9,
    // TODO: Black Bombs do not attack other units, and instead have an "Explode" command
    movementType: "air",
    facility: "airport",
    initialFuel: 45,
  },
  blackBoat: {
    cost: 7500,
    vision: 1,
    moveRange: 7,
    movementType: "lander",
    facility: "port",
    initialFuel: 60,
  },
  lander: {
    cost: 12000,
    vision: 1,
    movementType: "lander",
    facility: "port",
    moveRange: 6,
    initialFuel: 99,
  },
  cruiser: {
    cost: 18000,
    vision: 3,
    moveRange: 6,
    movementType: "sea",
    facility: "port",
    initialAmmo: 9,
    initialFuel: 99,
    attackRange: directRange,
  },
  sub: {
    cost: 20000,
    vision: 5,
    moveRange: 5,
    facility: "port",
    movementType: "sea",
    initialAmmo: 6,
    initialFuel: 60,
    attackRange: directRange,
  },
  battleship: {
    cost: 28000,
    attackRange: [2, 6],
    vision: 2,
    movementType: "sea",
    moveRange: 5,
    facility: "port",
    initialAmmo: 9,
    initialFuel: 99,
  },
  carrier: {
    cost: 30000,
    attackRange: [3, 8],
    vision: 4,
    movementType: "sea",
    facility: "port",
    moveRange: 5,
    initialAmmo: 9,
    initialFuel: 99,
  },
};
