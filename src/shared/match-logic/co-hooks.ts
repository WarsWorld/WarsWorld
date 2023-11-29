import type { UnitType } from "shared/schemas/unit";
import type { MatchWrapper } from "shared/wrappers/match";
import type { UnitWrapper } from "shared/wrappers/unit";

export type CombatProps = { attacker: UnitWrapper; defender: UnitWrapper };

type ReturnValue = number | undefined;

export type Hooks = {
  buildCost: (baseBuildCost: number, match: MatchWrapper) => ReturnValue;
  movementCost: (
    baseMovementCost: number,
    props: { match: MatchWrapper; unitType: UnitType }
  ) => ReturnValue;
  movementRange: (baseMovementRange: number, unit: UnitWrapper) => ReturnValue;
  vision: (baseVisionRange: number, unit: UnitWrapper) => ReturnValue;

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
