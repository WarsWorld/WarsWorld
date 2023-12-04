import type { PlayerSlot } from "shared/schemas/player-slot";
import { getFinalPositionSafe } from "shared/schemas/position";
import type { MoveEvent, PlayerEliminatedEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import type { Apply } from "../handler-types";
import { consumeFuelAndCrash } from "./passTurn/consumeFuelAndCrash";

export const getPlayerEliminatedEventDueToFuelDrain = (
  match: MatchWrapper
): PlayerEliminatedEvent | null => {
  const nextTurnPlayer = match.getCurrentTurnPlayer().getNextAlivePlayer();

  if (nextTurnPlayer === null) {
    throw new Error("No next alive player");
  }

  // TODO do we need to set their COP state to "no-power"?
  // TODO do we need to check weather in case it affects daily fuel?

  for (const unit of nextTurnPlayer.getUnits()) {
    if (unit.properties.facility === "base") {
      // land units can't crash
      continue;
    }

    const tile = unit.getTile();

    const isInRepairFacility = unit.properties.facility === tile.type;

    // if units are on top of a repair property, they can't crash
    if (!isInRepairFacility || !unit.player.owns(tile)) {
      const willCrash = consumeFuelAndCrash(unit, true);

      if (willCrash && nextTurnPlayer.getUnits().length === 0) {
        return {
          type: "player-eliminated",
          eliminationType: "all-units-destroyed",
          playerId: nextTurnPlayer.data.id
        };
      }
    }
  }

  return null;
};

export const getPlayerEliminatedEventDueToCaptureOrAttack = (match: MatchWrapper, moveEvent: MoveEvent): PlayerEliminatedEvent | null => {
  if (moveEvent.subEvent.type === "ability") {
    const unit = match.getUnitOrThrow(moveEvent.path[0]!);

    if (!unit.isInfantryOrMech()) {
      return null; // not a capture
    }

    const tile = match.getTile(getFinalPositionSafe(moveEvent.path))

    if (!("playerSlot" in tile)) {
      throw new Error("This should never happen: When checking win conditions of capture, tile wasn't capturable")
    }

    const previousOwner = match.getPlayerBySlot(tile.playerSlot);

    if (previousOwner === undefined) {
      return null; // should only happen when capturing tiles owned by neutral (slot = -1)
    }

    const playerHasNoHQ = false; // TODO

    const playerLabs = match.changeableTiles.filter(tile => (
      tile.type === "lab"
      && tile.playerSlot === previousOwner.data.slot
    ))

    const playerHasNoLabsLeft = playerLabs.length === 0

    const isEliminated =             tile.type === "hq"
    || (playerHasNoHQ && tile.type === "lab" && playerHasNoLabsLeft)

    if (!isEliminated) {
      return null
    }

    return {
      type: "player-eliminated",
      playerId: previousOwner.data.id,
      eliminationType: "hq-or-labs-captured",
      capturedByPlayerId: unit.player.data.id,
    }
  }

  if (moveEvent.subEvent.type === "attack") {
    if (moveEvent.subEvent.defenderHP === 0) {
      const defender = match.getUnitOrThrow(moveEvent.subEvent.defenderPosition);
      const defenderWillHaveNoUnits = (defender.player.getUnits().length - 1) <= 0;

      if (defenderWillHaveNoUnits) {
        return {
          type: "player-eliminated",
          eliminationType: "all-units-destroyed",
          playerId: defender.player.data.id,
        }
      } else {
        return null;
      }
    }

    if (moveEvent.subEvent.attackerHP === 0) {
      const attacker = match.getUnitOrThrow(getFinalPositionSafe(moveEvent.path));
      const attackerWillHaveNoUnits = (attacker.player.getUnits().length - 1) <= 0;

      if (attackerWillHaveNoUnits) {
        return {
          type: "player-eliminated",
          eliminationType: "all-units-destroyed",
          playerId: attacker.player.data.id,
        }
      } else {
        return null;
      }
    }
  }

  return null;
}

const getNewOwnerSlot = (
  match: MatchWrapper,
  event: PlayerEliminatedEvent
): PlayerSlot => {
  if (event.eliminationType === "hq-or-labs-captured") {
    const newOwner = match.getPlayerById(event.capturedByPlayerId);

    if (newOwner === undefined) {
      throw new Error(
        "Could not find new owner for eliminated by hq-or-labs-captured properties"
      );
    }

    return newOwner.data.slot;
  }

  return -1; // neutral
};

export const applyPlayerEliminatedEvent: Apply<PlayerEliminatedEvent> = (
  match,
  event
) => {
  const playerToEliminate = match.getPlayerById(event.playerId);

  if (playerToEliminate === undefined) {
    throw new Error(
      `Could not eliminate player ${event.playerId} because they could not be found`
    );
  }

  const newOwnerSlot = getNewOwnerSlot(match, event);

  for (const changeableTile of match.changeableTiles) {
    if (
      "playerSlot" in changeableTile &&
      playerToEliminate.owns(changeableTile)
    ) {
      changeableTile.playerSlot = newOwnerSlot;
    }
  }

  for (const unit of playerToEliminate.getUnits()) {
    unit.remove();
  }

  playerToEliminate.data.eliminated = true;

  if (
    match.playerToRemoveWeatherEffect?.data.id === playerToEliminate.data.id
  ) {
    match.playerToRemoveWeatherEffect = playerToEliminate.getNextAlivePlayer();
  }

  // TODO what happens with olaf snow and other CO powers?
};
