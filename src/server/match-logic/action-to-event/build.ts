import { unitPropertiesMap } from "../../../shared/match-logic/buildable-unit";
import type { MainActionToEvent } from "../../routers/action";
import type { BuildAction } from "../../schemas/action";
import { badRequest } from "./trpc-error-manager";

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
    throw badRequest("You don't have enough funds to build this unit");
  }

  if (match.units.hasUnit(action.position)) {
    throw badRequest("Can't build where there's a unit already");
  }

  const tile = match.getTile(action.position);

  if (!("ownerSlot" in tile) || tile.ownerSlot !== player.data.slot) {
    throw badRequest("You don't own this tile or this tile cannot be owned");
  }

  const hachiScopLandUnit =
    facility == "base" &&
    player.data.co === "hachi" &&
    player.data.COPowerState === "super-co-power";

  if (tile.type !== facility && !(hachiScopLandUnit && tile.type === "city")) {
    throw badRequest("You can't build this unit in this facility");
  }

  return {
    type: "build",
    unitType: action.unitType,
    position: action.position,
  };
};
