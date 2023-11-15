import { WWUnit } from "../../schemas/unit";
import { PlayerSlot } from "../../schemas/player-slot";
import { Position } from "../../schemas/position";
import { TRPCError } from "@trpc/server";
import { UnloadNoWaitAction, UnloadWaitAction } from "../../schemas/action";

export const throwMessage = (message: string) => {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: message,
  });
}

export const throwIfUnitOwned = (unit: WWUnit, playerSlot: PlayerSlot) => {
  if (unit.playerSlot === playerSlot) {
    //TODO: team stuff
    throwMessage("You don't own this unit");
  }
};

export const throwIfUnitNotOwned = (unit: WWUnit, playerSlot: PlayerSlot) => {
  if (unit.playerSlot !== playerSlot) {
    throwMessage("You don't own this unit");
  }
};

export const throwIfUnitIsWaited = (unit: WWUnit) => {
  if (!unit.isReady) {
    throwMessage("You can't move a waited unit");
  }
};

export const throwIfPositionsNotAdjacent = (
  position1: Position,
  position2: Position
) => {
  if (
    Math.abs(position1[0] - position2[0]) +
      Math.abs(position1[1] - position2[1]) !==
    1
  ) {
    throwMessage("Positions are not adjacent");
  }
};

export const throwIfNoUnload = (action: UnloadWaitAction) => {
  if (action.unloads.length < 1) throwMessage("No unit specified to unload");
};
