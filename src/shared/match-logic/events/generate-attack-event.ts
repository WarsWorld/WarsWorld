import type { AttackAction, MoveAction } from "shared/schemas/action";
import { getFinalPositionSafe } from "shared/schemas/position";
import type { AttackEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";

export const generateAttackEvent = (
  moveAction: MoveAction,
  attackAction: AttackAction,
  match: MatchWrapper
): AttackEvent => {
  const _currentPlayerInMatch = match.players.getCurrentTurnPlayer();

  const attacker = match.units.getUnit(getFinalPositionSafe(moveAction.path));

  const defender = match.units.getUnit(attackAction.defenderPosition);

  if (defender === undefined) {
    throw new Error("Defending unit not found");
  }

  if (attacker === undefined) {
    throw new Error("Attacking unit not found");
  }

  // is attacker unit of current player and is not waited
  // is defending unit actually an enemy
  // is defending unit in range
  // is defending unit visible
  // is defending unit attackable by attacking unit

  // if co power etc etc etc

  return {
    ...attackAction,
    defenderHP: 1,
    attackerHP: 1,
  };
};
