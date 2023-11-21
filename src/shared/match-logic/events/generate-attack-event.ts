import type { AttackAction, MoveAction } from "shared/schemas/action";
import { getFinalPositionSafe } from "shared/schemas/position";
import type { AttackEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";

// checked: is player's turn
export const generateAttackEvent = (
  moveAction: MoveAction,
  attackAction: AttackAction,
  matchState: MatchWrapper
): AttackEvent => {
  const _currentPlayerInMatch = matchState.players.getCurrentTurnPlayer();

  const attacker = matchState.units.getUnit(
    getFinalPositionSafe(moveAction.path)
  );

  const defender = matchState.units.getUnit(attackAction.defenderPosition);

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
