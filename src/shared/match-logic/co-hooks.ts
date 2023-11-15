import { TileType } from "server/schemas/tile";
import { UnitType } from "server/schemas/unit";
import { MatchWrapper } from "shared/wrappers/match";
import { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import { Facility } from "./buildable-unit";

export type COHookPlayerProps = {
  player: PlayerInMatchWrapper;
  unitType: UnitType;
  unitFacility: Facility;
  tileType: TileType;
};

export type COHookProps = {
  matchState: MatchWrapper;
  attackerData: COHookPlayerProps;
};

export type COHookPropsWithDefender = COHookProps & {
  defenderData: COHookPlayerProps;
};

const defaultCOHook = (value: number, _props: COHookProps) => value;

export type COHook = typeof defaultCOHook;
export type COHookWithDefender = (
  value: number,
  props: COHookPropsWithDefender
) => number;

export type COHooks = {
  onMovementRange: COHook;
  onMovementCost: COHook;
  onCost: COHook;
  onFuelDrain: COHook;
  onFuelCost: COHook;

  onAttackModifier: COHookWithDefender;
  onDefenseModifier: COHookWithDefender;
  onGoodLuck: COHookWithDefender;
  onBadLuck: COHookWithDefender;
  onTerrainStars: COHookWithDefender;
  onAttackRange: COHookWithDefender;
};

export type COHookAllowReturnUndefined = (
  ...args: Parameters<COHook>
) => number | undefined;
export type COHookWithDefenderAllowReturnUndefined = (
  ...args: Parameters<COHookWithDefender>
) => number | undefined;

/**
 * This type makes CO definitions move convenient.
 * Most of the code uses `COHooks` which
 * expects all hooks to be present and always
 * return a number, which would otherwise mean
 * a lot of boilerplate and redundancy in each individual CO code.
 * With this type, both of these properties
 * are now optional.currentPlayer
 */
export type COHooksAllowReturnUndefined = {
  onMovementRange?: COHookAllowReturnUndefined;
  onMovementCost?: COHookAllowReturnUndefined;
  onCost?: COHookAllowReturnUndefined;
  onFuelDrain?: COHookAllowReturnUndefined;
  onFuelCost?: COHookAllowReturnUndefined;

  onAttackModifier?: COHookWithDefenderAllowReturnUndefined;
  onDefenseModifier?: COHookWithDefenderAllowReturnUndefined;
  onGoodLuck?: COHookWithDefenderAllowReturnUndefined;
  onBadLuck?: COHookWithDefenderAllowReturnUndefined;
  onTerrainStars?: COHookWithDefenderAllowReturnUndefined;
  onAttackRange?: COHookWithDefenderAllowReturnUndefined;
};
