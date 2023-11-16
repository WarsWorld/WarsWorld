import { unitPropertiesMap } from "../../../shared/match-logic/buildable-unit";
import type { MainActionToEvent } from "../../routers/action";
import type { BuildAction } from "../../schemas/action";
import { isSamePosition } from "../../schemas/position";
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

  if (
    matchState.changeableTiles.find(
      (t) =>
        isSamePosition(action.position, t.position) &&
        t.type === facility /* TODO check for hachi SCOP */ &&
        t.ownerSlot === currentPlayer.data.slot
    )
  ) {
    throw badRequest(
      "Can't build here because the tile is missing the correct build facility or you don't own it"
    );
  }

  return {
    type: "build",
    unitType: action.unitType,
    position: action.position,
  };
};
