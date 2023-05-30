import { UnitType } from "server/schemas/unit";
import { AbstractUnit } from "./abstract-unit";
import { unitMovements } from "./unit-movements";
import { directRange } from "./weapon";

export const units = {
  infantry: {
    production: {
      facility: "base",
      cost: 1000,
    },
    movement: unitMovements["infantry"],
    visionRange: 2,
    weapons: [
      {
        name: "machineGun",
        attackRange: directRange,
        damage: { infantry: 50 },
      },
    ],
  },
  mech: {
    production: {
      facility: "base",
      cost: 3000,
    },
    movement: unitMovements["mech"],
    visionRange: 2,
    weapons: [
      {
        name: "bazooka",
        attackRange: directRange,
        damage: { tank: 50 },
        ammo: { max: 3 },
      },
      {
        name: "machineGun",
        attackRange: directRange,
        damage: { infantry: 50 },
      },
    ],
  },
  recon: {
    production: {
      facility: "base",
      cost: 4000,
    },
    movement: unitMovements["recon"],
    visionRange: 5,
    weapons: [
      {
        attackRange: directRange,
        damage: { infantry: 50 },
      },
    ],
  },
  apc: {
    production: {
      facility: "base",
      cost: 5000,
    },
    movement: unitMovements["apc"],
    visionRange: 1,
  },
  artillery: {
    production: {
      facility: "base",
      cost: 6000,
    },
    movement: unitMovements["artillery"],
    visionRange: 1,
    weapons: [
      {
        attackRange: [2, 3],
        damage: { tank: 50 },
        ammo: { max: 9 },
      },
    ],
  },
  tank: {
    production: {
      facility: "base",
      cost: 7000,
    },
    movement: unitMovements["tank"],
    visionRange: 3,
    weapons: [
      {
        attackRange: directRange,
        damage: { tank: 50 },
        ammo: { max: 9 },
      },
    ],
  },
  antiAir: {
    production: {
      facility: "base",
      cost: 8000,
    },
    movement: unitMovements["antiAir"],
    visionRange: 2,
    weapons: [
      {
        attackRange: directRange,
        damage: { battleCopter: 100 },
        ammo: { max: 9 },
      },
    ],
  },
  missile: {
    production: {
      facility: "base",
      cost: 12000,
    },
    movement: unitMovements["missile"],
    visionRange: 5,
    weapons: [
      {
        attackRange: [3, 5],
        damage: { bomber: 100 },
        ammo: { max: 6 },
      },
    ],
  },
  rocket: {
    production: {
      facility: "base",
      cost: 15000,
    },
    movement: unitMovements["rocket"],
    visionRange: 1,
    weapons: [
      {
        attackRange: [3, 5],
        damage: { tank: 100 },
        ammo: { max: 6 },
      },
    ],
  },
  mediumTank: {
    production: {
      facility: "base",
      cost: 16000,
    },
    movement: unitMovements["mediumTank"],
    visionRange: 1,
    weapons: [
      {
        attackRange: directRange,
        damage: { tank: 80 },
        ammo: { max: 8 },
      },
    ],
  },
  pipeRunner: {
    production: {
      facility: "base",
      cost: 20000,
    },
    movement: unitMovements["pipeRunner"],
    visionRange: 4,
    weapons: [
      {
        attackRange: [2, 5],
        damage: { tank: 80 },
        ammo: { max: 9 },
      },
    ],
  },
  neoTank: {
    production: {
      facility: "base",
      cost: 22000,
    },
    movement: unitMovements["neoTank"],
    visionRange: 1,
    weapons: [
      {
        attackRange: directRange,
        damage: { tank: 90 },
        ammo: { max: 9 },
      },
    ],
  },
  megaTank: {
    production: {
      facility: "base",
      cost: 28000,
    },
    movement: unitMovements["megaTank"],
    visionRange: 1,
    weapons: [
      {
        attackRange: directRange,
        damage: { tank: 100 },
        ammo: { max: 3 },
      },
    ],
  },
  transportCopter: {
    production: {
      facility: "airport",
      cost: 5000,
    },
    movement: unitMovements["transportCopter"],
    visionRange: 2,
  },
  battleCopter: {
    production: {
      facility: "airport",
      cost: 9000,
    },
    movement: unitMovements["battleCopter"],
    visionRange: 3,
    weapons: [
      {
        attackRange: directRange,
        damage: { tank: 50 },
        ammo: { max: 6 },
      },
    ],
  },
  fighter: {
    production: {
      facility: "airport",
      cost: 20000,
    },
    movement: unitMovements["fighter"],
    visionRange: 2,
    weapons: [
      {
        attackRange: directRange,
        damage: { fighter: 75 },
        ammo: { max: 9 },
      },
    ],
  },
  bomber: {
    production: {
      facility: "airport",
      cost: 22000,
    },
    movement: unitMovements["bomber"],
    visionRange: 2,
    weapons: [
      {
        attackRange: directRange,
        damage: { tank: 100 },
        ammo: { max: 9 },
      },
    ],
  },
  stealth: {
    production: {
      facility: "airport",
      cost: 24000,
    },
    movement: unitMovements["stealth"],
    visionRange: 4,
    weapons: [
      {
        attackRange: directRange,
        damage: { tank: 60 },
        ammo: { max: 6 },
      },
    ],
  },
  blackBomb: {
    production: {
      facility: "airport",
      cost: 25000,
    },
    movement: unitMovements["blackBomb"],
    visionRange: 1,
  },
  blackBoat: {
    production: {
      facility: "port",
      cost: 7500,
    },
    movement: unitMovements["blackBoat"],
    visionRange: 1,
  },
  lander: {
    production: {
      facility: "port",
      cost: 12000,
    },
    movement: unitMovements["lander"],
    visionRange: 1,
  },
  cruiser: {
    production: {
      facility: "port",
      cost: 18000,
    },
    movement: unitMovements["cruiser"],
    visionRange: 3,
    weapons: [
      {
        attackRange: directRange,
        damage: { battleCopter: 90 },
        ammo: { max: 9 },
      },
    ],
  },
  sub: {
    production: {
      facility: "port",
      cost: 20000,
    },
    movement: unitMovements["sub"],
    visionRange: 5,
    weapons: [
      {
        attackRange: directRange,
        damage: { battleship: 70 },
        ammo: { max: 6 },
      },
    ],
  },
  battleship: {
    production: {
      facility: "port",
      cost: 28000,
    },
    movement: unitMovements["battleship"],
    visionRange: 2,
    weapons: [
      {
        attackRange: [2, 6],
        damage: { battleship: 40 },
        ammo: { max: 9 },
      },
    ],
  },
  carrier: {
    production: {
      facility: "port",
      cost: 30000,
    },
    movement: unitMovements["carrier"],
    visionRange: 4,
    weapons: [
      {
        attackRange: [3, 8],
        damage: { bomber: 100 },
        ammo: { max: 9 },
      },
    ],
  },
} as const satisfies Record<UnitType, AbstractUnit>;
