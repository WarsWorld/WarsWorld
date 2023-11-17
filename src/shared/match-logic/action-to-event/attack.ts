import { DispatchableError } from "shared/DispatchedError";
import type { AttackAction } from "shared/schemas/action";
import type { SubActionToEvent } from "server/routers/action";
import { unitPropertiesMap } from "../buildable-unit";
import { calculateDamage } from "../calculate-damage";
import { getDistance } from "../positions";

export const attackActionToEvent: SubActionToEvent<AttackAction> = (
  match,
  action,
  fromPosition
) => {
  const player = match.players.getCurrentTurnPlayer();
  const attacker = player.getUnits().getUnitOrThrow(fromPosition);
  const defender = player
    .getEnemyUnits()
    .getUnitOrThrow(action.defenderPosition);

  //check if unit is in range
  const attackerProperties = unitPropertiesMap[attacker.type];

  if (!("attackRange" in attackerProperties)) {
    throw new DispatchableError("Unit cannot attack");
  }

  const attackDistance = getDistance(attacker.position, defender.position);

  if (
    attackerProperties.attackRange[0] > attackDistance ||
    attackDistance > attackerProperties.attackRange[1]
  ) {
    throw new DispatchableError("Unit is not in range to attack");
  }

  const damageAttackDone = calculateDamage(
    match,
    attacker.position,
    defender.position
  );

  if (damageAttackDone === null) {
    throw new DispatchableError("This unit cannot attack specified enemy unit");
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
        match,
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
