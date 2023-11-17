import { DispatchableError } from "shared/DispatchedError";
import type { BuildAction } from "shared/schemas/action";
import type { MainActionToEvent } from "server/routers/action";
import { unitPropertiesMap } from "../buildable-unit";

export const buildActionToEvent: MainActionToEvent<BuildAction> = (
  match,
  action
) => {
  const player = match.players.getCurrentTurnPlayer();

  const { cost, facility } = unitPropertiesMap[action.unitType];
  const effectiveCost = player
    .getCOHooksWithUnit(action.position)
    .onBuildCost(cost);

  if (effectiveCost > player.data.funds) {
    throw new DispatchableError(
      "You don't have enough funds to build this unit"
    );
  }

  if (match.units.hasUnit(action.position)) {
    throw new DispatchableError("Can't build where there's a unit already");
  }

  const tile = match.getTile(action.position);

  if (!("ownerSlot" in tile) || tile.ownerSlot !== player.data.slot) {
    throw new DispatchableError(
      "You don't own this tile or this tile cannot be owned"
    );
  }

  const hachiScopLandUnit =
    facility == "base" &&
    player.data.co === "hachi" &&
    player.data.COPowerState === "super-co-power";

  if (tile.type !== facility && !(hachiScopLandUnit && tile.type === "city")) {
    throw new DispatchableError("You can't build this unit in this facility");
  }

  return {
    type: "build",
    unitType: action.unitType,
    position: action.position,
  };
};
