import { AttackAction, MoveAction } from "server/schemas/action";
import { isSamePosition } from "server/schemas/position";
import { AttackEvent } from "shared/types/events";
import { BackendMatchState } from "shared/types/server-match-state";

// checked: is player's turn
const generateAttackEvent = (
  moveAction: MoveAction,
  attackAction: AttackAction,
  matchState: BackendMatchState
): AttackEvent => {
  const currentPlayerInMatch = matchState.players.find((p) => p.hasCurrentTurn);

  const attacker = matchState.units.find((u) =>
    isSamePosition(moveAction.path.at(-1)!, u.position)
  );
  const defender = matchState.units.find((u) =>
    isSamePosition(attackAction.defenderPosition, u.position)
  );

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
