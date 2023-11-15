import { TRPCError } from "@trpc/server";
import { PlayerSlot } from "../../schemas/player-slot";
import { Position } from "../../schemas/position";
import { WWUnit } from "../../schemas/unit";

export const badRequest = (message: string) =>
  new TRPCError({
    code: "BAD_REQUEST",
    message: message,
  });

export const throwMessage = (message: string) => {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: message,
  });
};

export const throwIfUnitOwned = (unit: WWUnit, playerSlot: PlayerSlot) => {
  if (unit.playerSlot === playerSlot) {
    //TODO: team stuff
    throw badRequest("You don't own this unit");
  }
};

export const throwIfUnitNotOwned = (unit: WWUnit, playerSlot: PlayerSlot) => {
  if (unit.playerSlot !== playerSlot) {
    throw badRequest("You don't own this unit");
  }
};

export const throwIfUnitIsWaited = (unit: WWUnit) => {
  if (!unit.isReady) {
    throw badRequest("You can't move a waited unit");
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
