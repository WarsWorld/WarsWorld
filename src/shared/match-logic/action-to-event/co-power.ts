import type { MainActionToEvent } from "server/routers/action";
import { DispatchableError } from "shared/DispatchedError";
import type { COPowerAction, SuperCOPowerAction } from "shared/schemas/action";
import { COPropertiesMap } from "../co";

export const coPowerActionToEvent: MainActionToEvent<
  COPowerAction | SuperCOPowerAction
> = (match, action) => {
  const player = match.players.getCurrentTurnPlayer();

  if (player.data.COPowerState !== "no-power") {
    throw new DispatchableError(
      `Can't use ${action.type} with a power already active`
    );
  }

  const coProperties = COPropertiesMap[player.data.co];

  const power =
    action.type === "coPower"
      ? coProperties.powers.COPower
      : coProperties.powers.superCOPower;

  if (power === undefined) {
    throw new DispatchableError(
      `Your CO (${coProperties.displayName}) doesn't have ${action.type}`
    );
  }

  const powerCost = power.stars * 9000;

  if (powerCost > player.data.powerMeter) {
    throw new DispatchableError(`Not enough power meter for ${action.type}`);
  }

  return action;
};
