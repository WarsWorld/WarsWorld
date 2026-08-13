import { DispatchableError } from "server/engine/DispatchedError";
import type { AbilityAction } from "server/core/schemas/action";
import { addDirection, allDirections } from "server/core/schemas/position";
import type { AbilityEvent } from "server/engine/types/events";
import type { CapturableTile } from "server/core/schemas/tile-state";
import type { MatchWrapper } from "server/engine/entities/match";
import type { UnitWrapper } from "server/engine/entities/unit";
import type { ApplySubEvent, SubActionToEvent } from "server/engine/events/handler-types";

function willCaptureTile(unit: UnitWrapper<"infantry" | "mech">): boolean {
  let capturePoints = unit.data.currentCapturePoints ?? 20;

  if (unit.player.data.coId.name === "sami") {
    if (unit.player.data.COPowerState === "super-co-power") {
      capturePoints = 0; // insta capture
    } else {
      // capture at 1.5x rate, rounded down
      capturePoints -= Math.floor(unit.getVisualHP() * 1.5);
    }
  } else {
    capturePoints -= unit.getVisualHP();
  }

  return capturePoints <= 0;
}

function infantryOrMechAbilityToEvent(
  match: MatchWrapper,
  unit: UnitWrapper<"infantry" | "mech">,
): AbilityEvent {
  const capturingTile = unit.getTile();

  //todo: bugs out, tile is already captured when this triggers so it always believes property cannot be captured
  if (!("playerSlot" in capturingTile) /* || unit.player.owns(capturingTile)*/) {
    throw new DispatchableError("This tile can not be captured");
  }

  const basicEvent: AbilityEvent = {
    type: "ability",
  };

  //Will not capture property
  if (!willCaptureTile(unit)) {
    return basicEvent;
  }

  const currentPlayerPropertiesBeforeCapture = match.changeableTiles.filter((tile) =>
    unit.player.owns(tile),
  );

  if (currentPlayerPropertiesBeforeCapture.length + 1 >= match.rules.captureLimit) {
    return {
      ...basicEvent,
      eliminationReason: "property-goal-reached",
    };
  }

  const previousOwner = match.getPlayerBySlot(capturingTile.playerSlot);

  // Neutral (slot < 0) is not a real player and cannot be eliminated. `getPlayerBySlot(-1)` returns
  // the neutral pseudo-player (NOT undefined), so without the slot guard capturing a neutral HQ/lab
  // would treat "neutral" as eliminated and hand EVERY neutral property + unit to the captor.
  if (previousOwner === undefined || previousOwner.data.slot < 0) {
    return basicEvent;
  }

  const previousOwnerPropertiesBeforeCapture = match.changeableTiles.filter((tile) =>
    previousOwner.owns(tile),
  );

  const previousOwnerHasNoHQ = !previousOwnerPropertiesBeforeCapture.some(
    (tile) => tile.type === "hq",
  );

  const previousOwnerLabs = previousOwnerPropertiesBeforeCapture.filter(
    (tile) => tile.type === "lab",
  );

  const previousOwnerIsEliminated =
    capturingTile.type === "hq" ||
    (previousOwnerHasNoHQ && capturingTile.type === "lab" && previousOwnerLabs.length <= 1);

  if (previousOwnerIsEliminated) {
    return {
      ...basicEvent,
      eliminationReason: "hq-or-labs-captured",
    };
  }

  return basicEvent;
}

/* TODO transfer property ownership on HQ capture */

//Capture, APC supply, black bomb explosion, toggle stealth/sub hide.
export const abilityActionToEvent: SubActionToEvent<AbilityAction> = (
  match,
  action,
  fromPosition,
) => {
  const player = match.getCurrentTurnPlayer();
  const unit = match.getUnitOrThrow(fromPosition);

  if (!player.owns(unit)) {
    throw new DispatchableError("You don't own this unit");
  }

  switch (unit.data.type) {
    case "infantry":
    case "mech": {
      // TODO i think there could be an issue here if it's a sonja
      // unit with hidden stats but theoretically that should never happen.
      // it doesn't show up as a type error because of the `as UnitWrapper<...>` override i think.
      return infantryOrMechAbilityToEvent(match, unit as UnitWrapper<"infantry" | "mech">); // override bc lazy
    }
    case "apc":
    case "blackBomb":
    case "stealth":
    case "sub":
      break;
    default:
      throw new DispatchableError("This unit does not have an ability");
  }

  return action;
};

const eliminatePlayerByCapture = (match: MatchWrapper, capturingUnit: UnitWrapper) => {
  const capturedTile = capturingUnit.getTile() as CapturableTile; // `as` because lazy

  const playerToEliminate = match.getPlayerBySlot(capturedTile.playerSlot);

  if (playerToEliminate === undefined) {
    throw new Error(
      `Could not eliminate player by slot ${capturedTile.playerSlot} because they could not be found`,
    );
  }

  const newOwnerSlot = capturingUnit.data.playerSlot;
  const previousOwnerVision = playerToEliminate.team.vision;
  const newOwnerVision = capturingUnit.player.team.vision;

  for (const changeableTile of match.changeableTiles) {
    if ("playerSlot" in changeableTile && playerToEliminate.owns(changeableTile)) {
      // Everyone watching the tile as it changes hands learns its new owner (fog last-known); the
      // losing player always sees their own property flip. Must run BEFORE removeOwnedProperty, while
      // the previous owner still has vision of it.
      match.rememberPropertyOwnerForWatchers(changeableTile.position, newOwnerSlot);
      // Hand the property's fog vision over with its ownership: drop it from the eliminated player's
      // team (so a surviving teammate can't keep seeing it) and grant it to the new owner. Without
      // this the next recalculateVision() would rebuild the OLD owner's sight of transferred tiles.
      previousOwnerVision?.removeOwnedProperty(changeableTile.position);
      changeableTile.playerSlot = newOwnerSlot;
      newOwnerVision?.addOwnedProperty(changeableTile.position);
    }
  }

  for (const unit of playerToEliminate.getUnits()) {
    unit.remove();
  }

  playerToEliminate.data.status = "captured";

  if (match.playerToRemoveWeatherEffect?.data.id === playerToEliminate.data.id) {
    match.playerToRemoveWeatherEffect = playerToEliminate.getNextAlivePlayer();
  }

  // TODO what happens with olaf snow and other CO powers?
};

export const applyAbilityEvent: ApplySubEvent<AbilityEvent> = (match, event, fromPosition) => {
  const unit = match.getUnitOrThrow(fromPosition);

  switch (unit.data.type) {
    case "infantry":
    case "mech": {
      //capture tile

      if (event.eliminationReason === "hq-or-labs-captured") {
        eliminatePlayerByCapture(match, unit);
        break;
      }

      if (unit.data.stats === "hidden") {
        break;
      }

      //TODO: For some reason, if the unit completes the capture, this function will run twice, therefore, this check is necessary to stop that
      const capturingTile = unit.getTile();

      if (!("playerSlot" in capturingTile) || unit.player.owns(capturingTile)) {
        unit.data.currentCapturePoints = undefined;
        break;
      }

      if (unit.data.currentCapturePoints === undefined) {
        unit.data.currentCapturePoints = 20;
      }

      if (unit.player.data.coId.name === "sami") {
        if (unit.player.data.COPowerState === "super-co-power") {
          unit.data.currentCapturePoints = 0; // insta capture
        } else {
          // capture at 1.5x rate, rounded down
          unit.data.currentCapturePoints -= Math.floor(unit.getVisualHP() * 1.5);
        }
      } else {
        unit.data.currentCapturePoints -= unit.getVisualHP();
      }

      if (unit.data.currentCapturePoints <= 0) {
        // finished capturing
        unit.data.currentCapturePoints = undefined;

        const tile = unit.getTile();

        if (!("playerSlot" in tile)) {
          throw new Error(
            `Could not capture tile at ${JSON.stringify(
              unit.data.position,
            )}: no playerSlot property! (Not changeable tile?)`,
          );
        }

        // Everyone with vision on the tile at the moment it flips learns the new owner (fog
        // last-known); the previous owner always sees their OWN property being captured. Must run
        // BEFORE removeOwnedProperty, while that previous owner still has vision of it.
        match.rememberPropertyOwnerForWatchers(unit.data.position, unit.data.playerSlot);
        match
          .getPlayerBySlot(tile.playerSlot)
          ?.team.vision?.removeOwnedProperty(unit.data.position);
        tile.playerSlot = unit.data.playerSlot;
        unit.player.team.vision?.addOwnedProperty(unit.data.position);
      }

      break;
    }
    case "apc": {
      //supply
      for (const dir of allDirections) {
        match.getUnit(addDirection(unit.data.position, dir))?.resupply();
      }

      break;
    }
    case "blackBomb": {
      match.damageUntil1HPInRadius({
        radius: 3,
        visualHpAmount: 5,
        epicenter: unit.data.position,
      });
      unit.remove();
      break;
    }
    case "stealth":
    case "sub": {
      //toggle hide
      if ("hidden" in unit.data) {
        unit.data.hidden = !unit.data.hidden;
      }

      break;
    }
  }
};
