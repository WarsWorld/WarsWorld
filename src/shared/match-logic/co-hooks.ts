import type { MatchWrapper } from "shared/wrappers/match";
import type { UnitWrapper } from "shared/wrappers/unit";

type Hook<Props> = (value: number, props: Props) => number | undefined;

export type CombatHook = Hook<{ attacker: UnitWrapper; defender: UnitWrapper }>;

export type Hooks = {
  buildCost: Hook<MatchWrapper>;
  movementCost: Hook<MatchWrapper>;
  movementRange: Hook<UnitWrapper>;
  vision: Hook<UnitWrapper>;
  attack: CombatHook;
  defense: CombatHook;
  goodLuck: CombatHook;
  badLuck: CombatHook;
  terrainStars: CombatHook;
  attackRange: CombatHook;
};
