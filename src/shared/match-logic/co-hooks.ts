import type { UnitType } from "shared/schemas/unit";
import type { MatchWrapper } from "shared/wrappers/match";
import type { UnitWrapper } from "shared/wrappers/unit";

export type CombatProps = { attacker: UnitWrapper; defender: UnitWrapper };

type ReturnValue = number | undefined;

export type Hooks = {
  buildCost: (baseBuildCost: number, match: MatchWrapper) => ReturnValue;
  movementCost: <T extends UnitType>(
    baseMovementCost: number,
    unit: UnitWrapper<T>
  ) => ReturnValue;
  movementPoints: <T extends UnitType>(
    baseMovementPoints: number,
    unit: UnitWrapper<T>
  ) => ReturnValue;
  vision: <T extends UnitType>(
    baseVisionRange: number,
    unit: UnitWrapper<T>
  ) => ReturnValue;

  terrainStars: (
    baseTerrainStars: number,
    combatProps: CombatProps
  ) => ReturnValue;
  attackRange: (baseRange: number, combatProps: CombatProps) => ReturnValue;

  attack: (combatProps: CombatProps) => ReturnValue;
  defense: (combatProps: CombatProps) => ReturnValue;

  maxGoodLuck: (combatProps: CombatProps) => ReturnValue;
  maxBadLuck: (combatProps: CombatProps) => ReturnValue;
};
