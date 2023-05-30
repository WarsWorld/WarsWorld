import { MovementType } from "./movement-type";
import { Weapon } from "./weapon";

export type AttackRange = [number, number];

export interface AbstractUnitMovement {
  movementType: MovementType;
  movementPoints: {
    max: number;
    /** if undefined, assume it is the same as max */
    current?: number;
  };
  fuel: {
    max: number;
    /** if undefined, assume it is the same as max */
    current?: number;
  };
}

export interface AbstractUnitProduction {
  // FIXME: get this type from elsewhere
  facility: "base" | "port" | "airport";
  cost: number;
}

export interface AbstractUnit {
  production: AbstractUnitProduction;
  movement: AbstractUnitMovement;
  visionRange: number;
  /**
   * If it is possible to hit the target with multiple weapons,
   * prefer to use whichever weapon appears first in this array.
   * If this is undefined, the unit does not attack.
   */
  weapons?: readonly Weapon[];
}
