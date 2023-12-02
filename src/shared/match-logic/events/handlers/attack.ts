import { DispatchableError } from "shared/DispatchedError";
import type { AttackAction } from "shared/schemas/action";
import { unitPropertiesMap } from "../../game-constants/unit-properties";
import { calculateDamage, getVisualHPfromHP } from "../../calculate-damage";
import type { MatchWrapper } from "shared/wrappers/match";
import type { Position } from "shared/schemas/position";
import type { AttackEvent } from "shared/types/events";
import type { SubActionToEvent } from "../handler-types";
import { getDistance } from "shared/schemas/position";
import type { UnitWrapper } from "../../../wrappers/unit";
import { getBaseDamage } from "../../game-constants/base-damage";
import { gameBehaviourMap } from "../../game-constants/version-properties";

export type LuckRoll = {
  goodLuck: number,
  badLuck: number
};
type Params = [
  ...Parameters<SubActionToEvent<AttackAction>>,
  attackerLuck: LuckRoll,
  defenderLuck: LuckRoll
];

const calculateEngagementOutcome = (
  attacker: UnitWrapper,
  defender: UnitWrapper,
  attackerLuck: LuckRoll,
  defenderLuck: LuckRoll
): {defenderHP: number, attackerHP: number | undefined} => {

  let damageByAttacker = calculateDamage(
    {
      attacker,
      defender
    },
    attackerLuck,
    false
  );

  if (damageByAttacker === null) {
    damageByAttacker = 0; // this is necessary cause sonja scop reverses attacker and defender
  }

  //check if ded
  if (damageByAttacker >= defender.getHP()) {
    /*
     * TODO IMPORTANT i think we must have a "unit was destroyed" flag on an event
     * bc a client can't tell on sonya units cuz they are effectively always full HP
     */
    return {
      defenderHP: 0,
      attackerHP: undefined
    };
  }

  //check if defender can counterattack
  if (getDistance(attacker.data.position, defender.data.position) === 1) {
    const defenderProperties = unitPropertiesMap[defender.data.type];

    if (
      "attackRange" in defenderProperties &&
      defenderProperties.attackRange[1] === 1
    ) {
      //defender is melee, maybe can counterattack
      //temporarily subtract hp to calculate counter dmg
      const originalHP = defender.getHP();
      defender.setHp(originalHP - damageByAttacker);

      const damageByDefender = calculateDamage(
        {
          attacker: defender,
          defender: attacker
        },
        defenderLuck,
        true
      );

      defender.setHp(originalHP);

      if (damageByDefender !== null) {
        //return event with counter-attack
        return {
          defenderHP: defender.getHP() - damageByAttacker,
          attackerHP: Math.max(0, attacker.getHP() - damageByDefender)
        };
      }
    }
  }

  return {
    defenderHP: defender.getHP() - damageByAttacker,
    attackerHP: undefined
  };

}

export const attackActionToEvent: (...params: Params) => AttackEvent = (
  match,
  action,
  fromPosition,
  attackerLuck,
  defenderLuck
) => {
  const player = match.getCurrentTurnPlayer();

  const attacker = match.getUnitOrThrow(fromPosition);

  if (attacker.data.playerSlot !== player.data.slot) {
    throw new DispatchableError("You don't own this unit")
  }

  const defender = match.getUnitOrThrow(action.defenderPosition);
  
  if (defender.player.team.index === player.team.index) {
    throw new DispatchableError("The target unit is from your own team")
  }

  //check if unit is in range
  const attackerProperties = unitPropertiesMap[attacker.data.type];

  if (!("attackRange" in attackerProperties)) {
    throw new DispatchableError("Unit cannot attack");
  }

  if (getBaseDamage(attacker, defender) === null) {
    throw new DispatchableError("This unit cannot attack specified enemy unit");
  }

  const attackDistance = getDistance(
    attacker.data.position,
    defender.data.position
  );


  let maximumAttackRange = attackerProperties.attackRange[1] - (match.currentWeather === "sandstorm" ? 1 : 0);
  maximumAttackRange =
    attacker.player.getHook("attackRange")?.(maximumAttackRange, {attacker, defender}) ?? maximumAttackRange;

  // we'll need this logic to prevent e.g. Max from having
  // [2, 1] artillery attack range in sandstorms.
  maximumAttackRange = Math.max(attackerProperties.attackRange[0], maximumAttackRange);

  if (
    attackerProperties.attackRange[0] > attackDistance ||
    attackDistance > maximumAttackRange
  ) {
    throw new DispatchableError("Unit is not in range to attack");
  }

  // sonja scop exception (she attacks first when attacked)
  if (defender.player.data.coId.name === "sonja" && defender.player.data.COPowerState === "super-co-power") {
    const result = calculateEngagementOutcome(
      defender,
      attacker,
      defenderLuck,
      attackerLuck
    );

    if (result.attackerHP === undefined) {
      //that means sonja scop unit killed attacker, so they couldnt "counterattack" the sonja unit
      result.attackerHP = attacker.getHP();
    }

    return {
      ...action,
      defenderHP: result.attackerHP,
      attackerHP: result.defenderHP
    };
  }

  const result = calculateEngagementOutcome(
    attacker,
    defender,
    attackerLuck,
    defenderLuck
  );
  return {
    ...action,
    defenderHP: result.defenderHP,
    attackerHp: result.attackerHP
  };
};

export const applyAttackEvent = (
  match: MatchWrapper,
  event: AttackEvent,
  position: Position
) => {
  const attacker = match.getUnitOrThrow(position);
  const defender = match.getUnitOrThrow(event.defenderPosition);

  const attackingPlayer = match.getBySlotOrThrow(
    attacker.data.playerSlot
  );
  const defendingPlayer = match.getBySlotOrThrow(
    defender.data.playerSlot
  );

  //Calculate visible hp difference:
  const previousAttackerHP =
    attacker.data.stats === "hidden" ? 100 : attacker.data.stats.hp;
  const previousDefenderHP =
    defender.data.stats === "hidden" ? 100 : defender.data.stats.hp;

  const attackerHpDiff = getVisualHPfromHP(previousAttackerHP) -
    getVisualHPfromHP(event.attackerHP ?? previousAttackerHP);
  const defenderHpDiff = getVisualHPfromHP(previousDefenderHP) -
    getVisualHPfromHP(event.defenderHP);

  //sasha scop funds
  if (attacker.player.data.coId.name === "sasha" && attacker.player.data.COPowerState === "super-co-power") {
    attacker.player.data.funds += defenderHpDiff * defender.getBuildCost() / 10 * 0.5;
  }

  if (defender.player.data.coId.name === "sasha" && defender.player.data.COPowerState === "super-co-power") {
    defender.player.data.funds += attackerHpDiff * attacker.getBuildCost() / 10 * 0.5;
  }

  //power meter charge
  const gb = gameBehaviourMap[match.rules.gameVersion];
  attackingPlayer.gainPowerCharge(
    gb.powerMeterIncreasePerHP(attacker) * attackerHpDiff +
    gb.powerMeterIncreasePerHP(defender) * defenderHpDiff * gb.offensivePowerGenMult
  );
  defendingPlayer.gainPowerCharge(
    gb.powerMeterIncreasePerHP(defender) * defenderHpDiff +
    gb.powerMeterIncreasePerHP(attacker) * attackerHpDiff * gb.offensivePowerGenMult
  )

  //hp updates (+ removal if unit dies)
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
