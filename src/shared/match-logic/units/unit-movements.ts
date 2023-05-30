import { UnitType } from "server/schemas/unit";
import { AbstractUnitMovement } from "./abstract-unit";

export const unitMovements = {
  infantry: {
    movementType: "foot",
    movementPoints: {
      max: 3,
    },
    fuel: {
      max: 99,
    },
  },
  mech: {
    movementType: "boots",
    movementPoints: {
      max: 2,
    },
    fuel: {
      max: 70,
    },
  },
  recon: {
    movementType: "tires",
    movementPoints: {
      max: 8,
    },
    fuel: {
      max: 80,
    },
  },
  apc: {
    movementType: "treads",
    movementPoints: {
      max: 5,
    },
    fuel: {
      max: 70,
    },
  },
  artillery: {
    movementType: "treads",
    movementPoints: {
      max: 5,
    },
    fuel: {
      max: 50,
    },
  },
  tank: {
    movementType: "treads",
    movementPoints: {
      max: 6,
    },
    fuel: {
      max: 70,
    },
  },
  antiAir: {
    movementType: "treads",
    movementPoints: {
      max: 6,
    },
    fuel: {
      max: 60,
    },
  },
  missile: {
    movementType: "tires",
    movementPoints: {
      max: 4,
    },
    fuel: {
      max: 50,
    },
  },
  rocket: {
    movementType: "tires",
    movementPoints: {
      max: 5,
    },
    fuel: {
      max: 50,
    },
  },
  mediumTank: {
    movementType: "treads",
    movementPoints: {
      max: 5,
    },
    fuel: {
      max: 50,
    },
  },
  pipeRunner: {
    movementType: "pipe",
    movementPoints: {
      max: 9,
    },
    fuel: {
      max: 99,
    },
  },
  neoTank: {
    movementType: "treads",
    movementPoints: {
      max: 6,
    },
    fuel: {
      max: 99,
    },
  },
  megaTank: {
    movementType: "treads",
    movementPoints: {
      max: 4,
    },
    fuel: {
      max: 50,
    },
  },
  transportCopter: {
    movementType: "air",
    movementPoints: {
      max: 6,
    },
    fuel: {
      max: 99,
    },
  },
  battleCopter: {
    movementType: "air",
    movementPoints: {
      max: 9000,
    },
    fuel: {
      max: 99,
    },
  },
  fighter: {
    movementType: "air",
    movementPoints: {
      max: 9,
    },
    fuel: {
      max: 50,
    },
  },
  bomber: {
    movementType: "air",
    movementPoints: {
      max: 7,
    },
    fuel: {
      max: 99,
    },
  },
  stealth: {
    movementType: "air",
    movementPoints: {
      max: 6,
    },
    fuel: {
      max: 60,
    },
  },
  blackBomb: {
    movementType: "air",
    movementPoints: {
      max: 9,
    },
    fuel: {
      max: 45,
    },
  },
  blackBoat: {
    movementType: "lander",
    movementPoints: {
      max: 7,
    },
    fuel: {
      max: 60,
    },
  },
  lander: {
    movementType: "lander",
    movementPoints: {
      max: 6,
    },
    fuel: {
      max: 99,
    },
  },
  cruiser: {
    movementType: "sea",
    movementPoints: {
      max: 6,
    },
    fuel: {
      max: 99,
    },
  },
  sub: {
    movementType: "sea",
    movementPoints: {
      max: 5,
    },
    fuel: {
      max: 60,
    },
  },
  battleship: {
    movementType: "sea",
    movementPoints: {
      max: 5,
    },
    fuel: {
      max: 99,
    },
  },
  carrier: {
    movementType: "sea",
    movementPoints: {
      max: 5,
    },
    fuel: {
      max: 99,
    },
  },
} as const satisfies Record<UnitType, AbstractUnitMovement>;
