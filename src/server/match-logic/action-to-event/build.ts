import { MainActionToEvent } from "../../routers/action";
import { BuildAction } from "../../schemas/action";
import { unitPropertiesMap } from "../../../shared/match-logic/buildable-unit";
import { isSamePosition } from "../../schemas/position";
import { getCurrentTile } from "../../../shared/match-logic/get-current-tile";
import { throwMessage } from "./trpc-error-manager";

export const buildActionToEvent: MainActionToEvent<BuildAction> = ({
  currentPlayer,
  action,
  matchState,
}) => {
  const { cost, facility } = unitPropertiesMap[action.unitType];
  // TODO hook: cost and facility modifiers based on powers etc.

  if (cost > currentPlayer.funds) {
    throwMessage("You don't have enough funds to build this unit");
  }

  if (
    matchState.units.some((u) => isSamePosition(u.position, action.position))
  ) {
    throwMessage("Can't build where there's a unit already");
  }

  if (
    matchState.changeableTiles.find(
      (t) =>
        isSamePosition(action.position, t.position) &&
        t.type === facility &&
        t.ownerSlot === currentPlayer.slot
    )
  ) {
    throwMessage(
      "Can't build here because the tile is missing the correct build facility or you don't own it"
    );
  }

  return {
    type: "build",
    unitType: action.unitType,
    position: action.position,
  };
};
