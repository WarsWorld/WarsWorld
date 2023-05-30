import { UnitType } from "server/schemas/unit";

export type AttackRange = readonly [number, number];
export const directRange: AttackRange = [1, 1];

export interface Weapon {
  name?: string;
  attackRange: AttackRange;
  /** If a unit cannot be targetted, damage is undefined */
  damage: Partial<Record<UnitType, number>>;
  /** if undefined, this weapon has unlimited ammo */
  ammo?: {
    max: number;
    /** if undefined, assume it is the same as max */
    current?: number;
  };
}
