import { UnitType } from "components/schemas/unit";

type MoveType =
  | "foot"
  | "treads"
  | "wheels"
  | "chains"
  | "air"
  | "see"
  | "see-and-shoals";

export type Facility = "factory" | "airport" | "harbor";

type BuildableUnit = {
  facility: Facility;
  cost: number;
};

export const buildableUnits: Record<UnitType, BuildableUnit> = {
  infantry: {
    facility: "factory",
    cost: 1000,
  },
  mech: {
    facility: "factory",
    cost: 3000,
  },
  apc: {
    facility: "factory",
    cost: 5000,
  },
  tank: {
    facility: "factory",
    cost: 7000,
  },
  "attack-copter": {
    facility: "airport",
    cost: 9000,
  },
  "anti-air": {
    facility: "factory",
    cost: 8000,
  },
  "medium-tank": {
    facility: "factory",
    cost: 16000,
  },
  "mega-tank": {
    facility: "factory",
    cost: 28000,
  },
  "neo-tank": {
    facility: "factory",
    cost: 22000,
  },
  "pipe-runner": {
    facility: "factory",
    cost: 123,
  },
  artillery: {
    facility: "factory",
    cost: 6000,
  },
  missile: {
    facility: "factory",
    cost: 12000,
  },
  recon: {
    facility: "factory",
    cost: 4000,
  },
  rocket: {
    facility: "factory",
    cost: 15000,
  },
};

// const moveTypeMap: Record<UnitType, MoveType> = {
//   infantry: "foot",
//   mech: "foot",
//   apc: "chains",
//   tank: "chains"
// }

// const moveRangeMap: Record<UnitType, number> = {
//   infantry: 3,
//   mech: 2,
//   apc: 5,
//   tank: 6
// }

// const attackRangeMap: Partial<Record<UnitType, [number, number]>> = {
//   infantry: [1, 1],
//   mech: [1, 1],
//   tank: [1, 1]
// }
