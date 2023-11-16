import { calculateDamage } from "../../../shared/match-logic/calculate-damage";
import type { SubActionToEvent } from "../../routers/action";
import type { AttackAction } from "../../schemas/action";
import { badRequest } from "./trpc-error-manager";
import { getDistance } from "../../../shared/match-logic/positions";
import { unitPropertiesMap } from "../../../shared/match-logic/buildable-unit";

export const attackActionToEvent: SubActionToEvent<AttackAction> = ({
  currentPlayer,
  action,
  matchState,
  fromPosition,
}) => {
  const attacker = currentPlayer.getUnits().getUnitOrThrow(fromPosition);
  const defender = currentPlayer
    .getEnemyUnits()
    .getUnitOrThrow(action.defenderPosition);

  //check if unit is in range
  const attackerProperties = unitPropertiesMap[attacker.type];

  if (!("attackRange" in attackerProperties)) {
    throw badRequest("Unit cannot attack");
  }

  const attackDistance = getDistance(attacker.position, defender.position);

  if (
    attackerProperties.attackRange[0] > attackDistance ||
    attackDistance > attackerProperties.attackRange[1]
  ) {
    throw badRequest("Unit is not in range to attack");
  }

  const damageAttackDone = calculateDamage(
    matchState,
    attacker.position,
    defender.position
  );

  if (damageAttackDone === null) {
    throw badRequest("This unit cannot attack specified enemy unit");
  }

  //check if ded
  if (damageAttackDone >= defender.stats.hp) {
    return {
      ...action,
      defenderHP: 0,
    };
  }

  //check if defender can counterattack
  if (attackDistance === 1) {
    const defenderProperties = unitPropertiesMap[defender.type];

    if (
      "attackRange" in defenderProperties &&
      defenderProperties.attackRange[1] === 1
    ) {
      //defender is melee, can counterattack?
      //temporarily substract hp to calculate counter dmg
      defender.stats.hp -= damageAttackDone;
      const damageDefendDone = calculateDamage(
        matchState,
        defender.position,
        attacker.position
      );
      defender.stats.hp += damageAttackDone;

      if (damageDefendDone !== null) {
        //return event with counter-attack
        return {
          ...action,
          defenderHP: defender.stats.hp - damageAttackDone,
          attackerHP: Math.max(0, attacker.stats.hp - damageDefendDone),
        };
      }
    }
  }

  return {
    ...action,
    defenderHP: defender.stats.hp - damageAttackDone,
  };
};
