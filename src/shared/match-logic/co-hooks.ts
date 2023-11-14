import { TileType } from "server/schemas/tile";
import { WWUnit, UnitType } from "server/schemas/unit";
import {
  BackendMatchState,
  PlayerInMatch,
  getCurrentTurnPlayer,
} from "shared/types/server-match-state";
import { COPropertiesMap } from "./co";

export interface COHookPlayerProps {
  player: PlayerInMatch;
  unitType: UnitType;
  tileType: TileType;
  getUnits(): WWUnit[];
}

export interface COHookProps {
  currentValue: number;
  matchState: BackendMatchState;
  currentPlayerData: COHookPlayerProps;
}

export interface COCombatHookProps extends COHookProps {
  defendingPlayerData: COHookPlayerProps;
}

// TODO should we allow returning void/undefined which gets interpreted as "useCurrentValue"?
// could make some code a bit shorter and easier to read, but less explicit.
const defaultCOHook = ({ currentValue }: COHookProps) => currentValue;

type COPacifistHook = typeof defaultCOHook;
type COCombatHook = (props: COCombatHookProps) => number;

type COPacifistHookNames =
  | "onMovementRange"
  | "onMovementCost"
  | "onCost"
  | "onFuelDrain";

type COCombatHookNames =
  | "onAttackModifier"
  | "onDefenseModifier"
  | "onGoodLuck"
  | "onBadLuck"
  | "onTerrainStars"
  | "onAttackRange";

export type COHooks = Record<COPacifistHookNames, COPacifistHook> &
  Record<COCombatHookNames, COCombatHook>;

export const getCOHooksWithPowers = (
  matchState: BackendMatchState
): COHooks => {
  const currentPlayer = getCurrentTurnPlayer(matchState);

  const CO = COPropertiesMap[currentPlayer.co];

  const d2dHooks = getCOHooksWithDefaults(CO.dayToDay?.hooks ?? {});
  const COPHooks = CO.powers.COPower?.hooks ?? {};
  const SCOPHooks = CO.powers.superCOPower?.hooks ?? {};

  switch (currentPlayer.COPowerState) {
    case "no-power":
      return d2dHooks;
    case "co-power":
      return { ...d2dHooks, ...COPHooks };
    case "super-co-power":
      return { ...d2dHooks, ...SCOPHooks };
  }
};

const defaultCOHooks: COHooks = {
  onAttackModifier: defaultCOHook,
  onDefenseModifier: defaultCOHook,
  onGoodLuck: defaultCOHook,
  onBadLuck: defaultCOHook,
  onTerrainStars: defaultCOHook,
  onMovementRange: defaultCOHook,
  onMovementCost: defaultCOHook,
  onAttackRange: defaultCOHook,
  onCost: defaultCOHook,
  onFuelDrain: defaultCOHook,
};

export const getCOHooksWithDefaults = (COHooks: Partial<COHooks>): COHooks => ({
  ...defaultCOHooks,
  ...COHooks,
});
