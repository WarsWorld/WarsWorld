import { unitPropertiesMap } from "../../../shared/match-logic/buildable-unit";
import type { MainActionToEvent } from "../../routers/action";
import type { BuildAction } from "../../schemas/action";
import { badRequest } from "./trpc-error-manager";

export const buildActionToEvent: MainActionToEvent<BuildAction> = ({
  currentPlayer,
  action,
  matchState,
}) => {
  const { cost, facility } = unitPropertiesMap[action.unitType];
  const effectiveCost = currentPlayer
    .getCOHooksWithUnit(action.position)
    .onBuildCost(cost);

  if (effectiveCost > currentPlayer.data.funds) {
    throw badRequest("You don't have enough funds to build this unit");
  }

  if (matchState.units.hasUnit(action.position)) {
    throw badRequest("Can't build where there's a unit already");
  }

  const tile = matchState.getTile(action.position);

  if (!("ownerSlot" in tile) || tile.ownerSlot !== currentPlayer.data.slot) {
    throw badRequest("You don't own this tile or this tile cannot be owned");
  }

  const hachiScopLandUnit =
    facility == "base" &&
    currentPlayer.data.co === "hachi" &&
    currentPlayer.data.COPowerState === "super-co-power";

  if (tile.type !== facility && !(hachiScopLandUnit && tile.type === "city")) {
    throw badRequest("You can't build this unit in this facility");
  }

  return {
    type: "build",
    unitType: action.unitType,
    position: action.position,
  };
};
