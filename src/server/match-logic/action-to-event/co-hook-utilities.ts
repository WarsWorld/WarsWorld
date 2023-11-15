import { WWUnit } from "../../schemas/unit";
import {
  BackendMatchState,
  PlayerInMatch,
} from "../../../shared/types/server-match-state";
import { COProperties, COPropertiesMap } from "../../../shared/match-logic/co";
import { unitPropertiesMap } from "../../../shared/match-logic/buildable-unit";
import {
  COHookPlayerProps,
  COHookProps,
} from "../../../shared/match-logic/co-hooks";
import { getPlayerUnits } from "../../../shared/match-logic/units";
import { getCurrentTile } from "../../../shared/match-logic/get-current-tile";
import { COPowerState } from "shared/match-logic/co-utilities";

const applyCOPowerHooksForMovementRange = (
  COHookProps: COHookProps,
  COPowerState: COPowerState,
  COProperties: COProperties
) => {
  switch (COPowerState) {
    case "co-power":
      return (
        COProperties.powers.COPower?.hooks?.onMovementRange?.(COHookProps) ??
        COHookProps.currentValue
      );
    case "super-co-power":
      return (
        COProperties.powers.superCOPower.hooks?.onMovementRange?.(
          COHookProps
        ) ?? COHookProps.currentValue
      );
    default:
      return COHookProps.currentValue;
  }
};

export const getMovementRange = (
  unit: WWUnit,
  matchState: BackendMatchState,
  player: PlayerInMatch
) => {
  const COProperties = COPropertiesMap[player.co];

  const unitProperties = unitPropertiesMap[unit.type];
  const baseMovement = unitProperties.moveRange;

  const currentPlayerData: COHookPlayerProps = {
    getUnits: () => getPlayerUnits(matchState, player.slot),
    player,
    tileType: getCurrentTile(matchState, unit.position).type,
    unitType: unit.type,
  };

  const d2dMovementRange =
    COProperties.dayToDay?.hooks.onMovementRange?.({
      currentPlayerData,
      currentValue: baseMovement,
      matchState,
    }) ?? baseMovement; // TODO probably better if there's some wrapper function with a passthrough default

  const powerMovementRange = applyCOPowerHooksForMovementRange(
    {
      currentValue: d2dMovementRange,
      currentPlayerData,
      matchState,
    },
    player.COPowerState,
    COProperties
  );

  return powerMovementRange;
};
