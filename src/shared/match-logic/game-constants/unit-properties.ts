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

type UnitPropertiesWithoutWeapon = {
  cost: number;
  facility: Facility;
  movementType: MovementType;
  movementPoints: number;
  initialFuel: number;
  vision: number;
};

type Range = [number, number];

const directRange: Range = [1, 1];

type UnitPropertiesWithoutAmmo = UnitPropertiesWithoutWeapon & {
  attackRange: Range;
};

type UnitPropertiesWithAmmo = UnitPropertiesWithoutAmmo & {
  initialAmmo: number;
};

export type UnitProperties =
  | UnitPropertiesWithAmmo
  | UnitPropertiesWithoutAmmo
  | UnitPropertiesWithoutWeapon;

const infantry: UnitPropertiesWithoutAmmo = {
  cost: 1000,
  facility: "base",
  movementType: "foot",
  movementPoints: 3,
  initialFuel: 99,
  vision: 2,
  attackRange: directRange
};

const mech: UnitPropertiesWithAmmo = {
  cost: 3000,
  facility: "base",
  movementType: "boots",
  movementPoints: 2,
  initialFuel: 70,
  vision: 2,
  initialAmmo: 3,
  attackRange: directRange
};

const recon: UnitPropertiesWithoutAmmo = {
  cost: 4000,
  facility: "base",
  vision: 5,
  initialFuel: 80,
  attackRange: directRange,
  movementType: "tires",
  movementPoints: 8
};

const apc: UnitPropertiesWithoutWeapon = {
  cost: 5000,
  facility: "base",
  movementPoints: 5,
  vision: 1,
  initialFuel: 70,
  movementType: "treads"
};

const artillery: UnitPropertiesWithAmmo = {
  cost: 6000,
  facility: "base",
  vision: 1,
  initialFuel: 50,
  attackRange: [2, 3],
  initialAmmo: 9,
  movementType: "treads",
  movementPoints: 5
};

const tank: UnitPropertiesWithAmmo = {
  cost: 7000,
  facility: "base",
  movementPoints: 6,
  vision: 3,
  initialAmmo: 9,
  attackRange: directRange,
  movementType: "treads",
  initialFuel: 70
};

const antiAir: UnitPropertiesWithAmmo = {
  cost: 8000,
  facility: "base",
  vision: 2,
  initialFuel: 60,
  movementType: "treads",
  attackRange: directRange,
  movementPoints: 6,
  initialAmmo: 9
};

const missile: UnitPropertiesWithAmmo = {
  cost: 12000,
  facility: "base",
  movementType: "tires",
  movementPoints: 4,
  initialAmmo: 6,
  attackRange: [3, 5],
  vision: 5,
  initialFuel: 50
};

const rocket: UnitPropertiesWithAmmo = {
  cost: 15000,
  facility: "base",
  movementType: "tires",
  attackRange: [3, 5],
  movementPoints: 5,
  initialAmmo: 6,
  vision: 1,
  initialFuel: 50
};

const mediumTank: UnitPropertiesWithAmmo = {
  cost: 16000,
  facility: "base",
  vision: 1,
  movementPoints: 5,
  initialFuel: 50,
  initialAmmo: 8,
  movementType: "treads",
  attackRange: directRange
};

const pipeRunner: UnitPropertiesWithAmmo = {
  cost: 20000,
  facility: "base",
  attackRange: [2, 5],
  movementType: "pipe",
  movementPoints: 9,
  vision: 4,
  initialAmmo: 9,
  initialFuel: 99
};

const neoTank: UnitPropertiesWithAmmo = {
  cost: 22000,
  facility: "base",
  initialAmmo: 9,
  movementPoints: 6,
  vision: 1,
  initialFuel: 99,
  movementType: "treads",
  attackRange: directRange
};

const megaTank: UnitPropertiesWithAmmo = {
  cost: 28000,
  facility: "base",
  initialAmmo: 3,
  vision: 1,
  movementPoints: 4,
  initialFuel: 50,
  movementType: "treads",
  attackRange: directRange
};

const transportCopter: UnitPropertiesWithoutWeapon = {
  cost: 5000,
  movementPoints: 6,
  vision: 2,
  facility: "airport",
  movementType: "air",
  initialFuel: 99
};

const battleCopter: UnitPropertiesWithAmmo = {
  cost: 9000,
  vision: 3,
  initialFuel: 99,
  facility: "airport",
  movementType: "air",
  movementPoints: 9000,
  initialAmmo: 6,
  attackRange: directRange
};

const fighter: UnitPropertiesWithAmmo = {
  cost: 20000,
  vision: 2,
  initialFuel: 99,
  movementType: "air",
  facility: "airport",
  movementPoints: 9,
  initialAmmo: 9,
  attackRange: directRange
};

const bomber: UnitPropertiesWithAmmo = {
  cost: 22000,
  vision: 2,
  initialAmmo: 9,
  movementType: "air",
  facility: "airport",
  movementPoints: 7,
  initialFuel: 99,
  attackRange: directRange
};

const stealth: UnitPropertiesWithAmmo = {
  cost: 24000,
  vision: 4,
  initialFuel: 60,
  movementPoints: 6,
  movementType: "air",
  facility: "airport",
  initialAmmo: 6,
  attackRange: directRange
};

const blackBomb: UnitPropertiesWithoutWeapon = {
  cost: 25000,
  vision: 1,
  movementPoints: 9,
  movementType: "air",
  facility: "airport",
  initialFuel: 45
};

const blackBoat: UnitPropertiesWithoutWeapon = {
  cost: 7500,
  vision: 1,
  movementPoints: 7,
  movementType: "lander",
  facility: "port",
  initialFuel: 60
};

const lander: UnitPropertiesWithoutWeapon = {
  cost: 12000,
  vision: 1,
  movementType: "lander",
  facility: "port",
  movementPoints: 6,
  initialFuel: 99
};

const cruiser: UnitPropertiesWithAmmo = {
  cost: 18000,
  vision: 3,
  movementPoints: 6,
  movementType: "sea",
  facility: "port",
  initialAmmo: 9,
  initialFuel: 99,
  attackRange: directRange
};

const sub: UnitPropertiesWithAmmo = {
  cost: 20000,
  vision: 5,
  movementPoints: 5,
  facility: "port",
  movementType: "sea",
  initialAmmo: 6,
  initialFuel: 60,
  attackRange: directRange
};

const battleship: UnitPropertiesWithAmmo = {
  cost: 28000,
  attackRange: [2, 6],
  vision: 2,
  movementType: "sea",
  movementPoints: 5,
  facility: "port",
  initialAmmo: 9,
  initialFuel: 99
};

const carrier: UnitPropertiesWithAmmo = {
  cost: 30000,
  attackRange: [3, 8],
  vision: 4,
  movementType: "sea",
  facility: "port",
  movementPoints: 5,
  initialAmmo: 9,
  initialFuel: 99
};

export const unitPropertiesMap = {
  infantry,
  mech,
  recon,
  apc,
  artillery,
  tank,
  antiAir,
  missile,
  rocket,
  mediumTank,
  pipeRunner,
  neoTank,
  megaTank,
  transportCopter,
  battleCopter,
  fighter,
  bomber,
  stealth,
  blackBomb,
  blackBoat,
  lander,
  cruiser,
  sub,
  battleship,
  carrier
};
