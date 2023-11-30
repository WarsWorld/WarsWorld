import { DispatchableError } from "shared/DispatchedError";
import type { COPowerAction } from "shared/schemas/action";
import type { COPowerEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import type { COProperties } from "../../co";
import { getCOProperties } from "../../co";
import type { MainActionToEvent } from "../handler-types";

export const coPowerActionToEvent: MainActionToEvent<COPowerAction> = (
  match,
  action
) => {
  const player = match.players.getCurrentTurnPlayer();
  const powerType: keyof COProperties["powers"] = action.isSuper
    ? "superCOPower"
    : "COPower";

  if (player.data.COPowerState !== "no-power") {
    throw new DispatchableError(
      `Can't use ${powerType} with a power already active`
    );
  }

  const coProperties = getCOProperties(player.data.coId);
  const power = coProperties.powers[powerType];

  if (power === undefined) {
    throw new DispatchableError(
      `Your CO (${coProperties.displayName}) doesn't have ${powerType}`
    );
  }

  const powerCost = power.stars * player.getPowerStarCost();

  if (powerCost > player.data.powerMeter) {
    throw new DispatchableError(`Not enough power meter for ${powerType}`);
  }

  return action;
};

export const applyCOPowerEvent = (match: MatchWrapper, event: COPowerEvent) => {
  const player = match.players.getCurrentTurnPlayer();
  const COProperties = getCOProperties(player.data.coId);
  const powerType: keyof COProperties["powers"] = event.isSuper
    ? "superCOPower"
    : "COPower";
  const power = COProperties.powers[powerType];

  if (power === undefined) {
    throw new Error(
      `Unexpectedly didn't find power ${powerType} on CO ${COProperties.displayName}`
    );
  }

  player.data.powerMeter -= power.stars * player.getPowerStarCost();

  power.instantEffect?.({
    match,
    player
  });
};
