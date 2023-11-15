import { SubActionToEvent } from "../../routers/action";
import { AttackAction } from "../../schemas/action";
import { getUnitAtPosition } from "../../../shared/match-logic/positions";
import { TRPCError } from "@trpc/server";
import { throwIfUnitNotOwned, throwIfUnitOwned } from "./trpc-error-manager";
import { calculateDamage } from "../../../shared/match-logic/calculate-damage";

export const attackActionToEvent: SubActionToEvent<AttackAction> = ({
  currentPlayer,
  action,
  matchState,
  fromPosition,
}) => {

  const attacker = getUnitAtPosition(matchState, fromPosition);

  if (attacker === null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No unit found at specified attacker position",
    });
  }
  throwIfUnitNotOwned(attacker, currentPlayer.slot);

  const defender = getUnitAtPosition(matchState, action.defenderPosition);

  if (defender === null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No unit found at specified defender position",
    });
  }
  throwIfUnitOwned(attacker, currentPlayer.slot);

  //check if unit is in range

  const damageDone = calculateDamage(matchState, attacker, defender, ?);

  // is defending unit attackable by attacking unit

  // if co power etc etc etc

  return {
    ...attackAction,
    defenderHP: 1,
    attackerHP: 1,
  };
};
