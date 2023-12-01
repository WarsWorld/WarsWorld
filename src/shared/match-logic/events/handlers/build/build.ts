import { DispatchableError } from "shared/DispatchedError";
import type { BuildAction } from "shared/schemas/action";
import { unitPropertiesMap } from "../../../buildable-unit";

import type { BuildEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import type { MainActionToEvent } from "../../handler-types";
import { createUnitFromBuildEvent } from "./create-unit-from-build-event";

export const buildActionToEvent: MainActionToEvent<BuildAction> = (
  match,
  action
) => {
  const player = match.getCurrentTurnPlayer();

  if (player.getUnits().length >= match.rules.unitCapPerPlayer) {
    throw new DispatchableError("Unit cap alreaedy reached");
  }

  const { cost, facility } = unitPropertiesMap[action.unitType];
  const modifiedCost = player.getHook("buildCost")?.(cost, match);
  const effectiveCost = modifiedCost ?? cost;

  if (effectiveCost > player.data.funds) {
    throw new DispatchableError(
      "You don't have enough funds to build this unit"
    );
  }

  if (match.hasUnit(action.position)) {
    throw new DispatchableError("Can't build where there's a unit already");
  }

  const tile = match.getTile(action.position);

  if (!("ownerSlot" in tile) || tile.ownerSlot !== player.data.slot) {
    throw new DispatchableError(
      "You don't own this tile or this tile cannot be owned"
    );
  }

  const hachiScopLandUnit =
    facility === "base" &&
    player.data.coId.name === "hachi" &&
    player.data.COPowerState === "super-co-power";

  if (tile.type !== facility && !(hachiScopLandUnit && tile.type === "city")) {
    throw new DispatchableError("You can't build this unit in this facility");
  }

  return {
    type: "build",
    unitType: action.unitType,
    position: action.position
  };
};

export const applyBuildEvent = (match: MatchWrapper, event: BuildEvent) => {
  const player = match.getCurrentTurnPlayer();

  return player.addUnwrappedUnit(
    createUnitFromBuildEvent(player.data.slot, event)
  );
};
