import { calculateDamage } from "../../../shared/match-logic/calculate-damage";
import { SubActionToEvent } from "../../routers/action";
import { AttackAction } from "../../schemas/action";

export const attackActionToEvent: SubActionToEvent<AttackAction> = ({
  currentPlayer,
  action,
  matchState,
  fromPosition,
}) => {
  const attacker = currentPlayer.getUnits().getUnitOrThrow(fromPosition)
  const defender = currentPlayer.getEnemyUnits().getUnitOrThrow(action.defenderPosition)

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
