import { DispatchableError } from "shared/DispatchedError";
import type { AttackAction } from "shared/schemas/action";
import { unitPropertiesMap } from "../../buildable-unit";
import { calculateDamage } from "../../calculate-damage/calculate-damage";
import type { MatchWrapper } from "shared/wrappers/match";
import type { Position } from "shared/schemas/position";
import type { AttackEvent } from "shared/types/events";
import type { SubActionToEvent } from "../handler-types";
import { getDistance } from "shared/schemas/position";

type Params = [
  ...Parameters<SubActionToEvent<AttackAction>>,
  attackerLuck: number,
  defenderLuck: number
];

export const attackActionToEvent: (...params: Params) => AttackEvent = (
  match,
  action,
  fromPosition,
  attackerLuck,
  defenderLuck
) => {
  const player = match.players.getCurrentTurnPlayer();
  const attacker = player.getUnits().getUnitOrThrow(fromPosition);
  const defender = player
    .getEnemyUnits()
    .getUnitOrThrow(action.defenderPosition);

  //check if unit is in range
  const attackerProperties = unitPropertiesMap[attacker.data.type];

  if (!("attackRange" in attackerProperties)) {
    throw new DispatchableError("Unit cannot attack");
  }

  const attackDistance = getDistance(
    attacker.data.position,
    defender.data.position
  );

  // TODO apply CO hooks and weather and what else might be missing

  // we'll need this logic to prevent e.g. Max from having [2, 1] attack range
  // in sandstorms.
  const maximumAttackRange = Math.max(
    attackerProperties.attackRange[0],
    attackerProperties.attackRange[1]
  );

  if (
    attackerProperties.attackRange[0] > attackDistance ||
    attackDistance > maximumAttackRange
  ) {
    throw new DispatchableError("Unit is not in range to attack");
  }

  // TODO better name: damageByAttacker
  const damageAttackDone = calculateDamage(
    {
      attacker,
      defender
    },
    attackerLuck
  );

  if (damageAttackDone === null) {
    throw new DispatchableError("This unit cannot attack specified enemy unit");
  }

  //check if ded
  if (damageAttackDone >= defender.getHP()) {
    /*
     * TODO IMPORTANT i think we must have a "unit was destroyed" flag on an event
     * bc a client can't tell on sonya units cuz they are effectively always full HP
     */
    return {
      ...action,
      defenderHP: 0
    };
  }

  //check if defender can counterattack
  if (attackDistance === 1) {
    const defenderProperties = unitPropertiesMap[defender.data.type];

    if (
      "attackRange" in defenderProperties &&
      defenderProperties.attackRange[1] === 1
    ) {
      //defender is melee, can counterattack?
      //temporarily substract hp to calculate counter dmg
      const originalHP = defender.getHP();
      defender.setHp(originalHP - damageAttackDone);

      // TODO better name: damageByDefender
      const damageDefendDone = calculateDamage(
        {
          attacker: defender,
          defender: attacker
        },
        defenderLuck
      );

      defender.setHp(originalHP);

      if (damageDefendDone !== null) {
        //return event with counter-attack
        return {
          ...action,
          defenderHP: defender.getHP() - damageAttackDone,
          attackerHP: Math.max(0, attacker.getHP() - damageDefendDone)
        };
      }
    }
  }

  return {
    ...action,
    defenderHP: defender.getHP() - damageAttackDone
  };
};

export const applyAttackEvent = (
  match: MatchWrapper,
  event: AttackEvent,
  position: Position
) => {
  const attacker = match.units.getUnitOrThrow(position);
  const defender = match.units.getUnitOrThrow(event.defenderPosition);

  const attackingPlayer = match.players.getBySlotOrThrow(
    attacker.data.playerSlot
  );
  const defendingPlayer = match.players.getBySlotOrThrow(
    defender.data.playerSlot
  );

  const { attackingPlayerGain, defendingPlayerGain } =
    attacker.getPowerMeterGainsWhenAttacking(
      defender,
      event.attackerHP,
      event.defenderHP
    );

  attackingPlayer.setPowerMeter(attackingPlayer.data.powerMeter + attackingPlayerGain);
  defendingPlayer.setPowerMeter(defendingPlayer.data.powerMeter + defendingPlayerGain);

  if (event.defenderHP === 0) {
    defender.remove();
  } else {
    defender.setHp(event.defenderHP);
  }

  if (event.attackerHP !== undefined) {
    if (event.attackerHP === 0) {
      attacker.remove();
    } else {
      attacker.setHp(event.attackerHP);
    }
  }
};
