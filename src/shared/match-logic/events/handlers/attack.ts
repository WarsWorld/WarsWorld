import { DispatchableError } from "shared/DispatchedError";
import type { AttackAction } from "shared/schemas/action";
import type { LuckRoll } from "shared/schemas/co";
import type { Position } from "shared/schemas/position";
import { getDistance } from "shared/schemas/position";
import type { AttackEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { UnitWrapper } from "../../../wrappers/unit";
import { calculateEngagementOutcome, getVisualHPfromHP } from "../../calculate-damage";
import {
  canAttackWithPrimary,
  createPipeSeamUnitEquivalent,
  getBaseDamage,
} from "../../game-constants/base-damage";
import { unitPropertiesMap } from "../../game-constants/unit-properties";
import type { SubActionToEvent } from "../handler-types";

type Params = [
  ...Parameters<SubActionToEvent<AttackAction>>,
  unitHasMoved: boolean,
  attackerLuck: LuckRoll,
  defenderLuck: LuckRoll,
];

function getEliminationReason({
  attacker,
  defender,
  attackerHP,
  defenderHP,
}: {
  attacker: PlayerInMatchWrapper;
  defender: PlayerInMatchWrapper;
  attackerHP: number | undefined;
  defenderHP: number | undefined;
}): AttackEvent["eliminationReason"] {
  if (defenderHP === 0 && defender.getUnits().length - 1 <= 0) {
    return "all-defender-units-destroyed";
  }

  if (attackerHP === 0 && attacker.getUnits().length - 1 <= 0) {
    return "all-attacker-units-destroyed";
  }

  return undefined;
}

export const attackActionToEvent: (...params: Params) => AttackEvent = (
  match,
  action,
  fromPosition,
  unitHasMoved, // for indirects not attacking and shooting
  attackerLuck,
  defenderLuck,
) => {
  const player = match.getCurrentTurnPlayer();

  const attacker = match.getUnitOrThrow(fromPosition);

  if (attacker.data.playerSlot !== player.data.slot) {
    throw new DispatchableError("You don't own this unit");
  }

  //check if unit is in range
  const attackerProperties = unitPropertiesMap[attacker.data.type];

  if (!("attackRange" in attackerProperties)) {
    throw new DispatchableError("Unit cannot attack");
  }

  if (attackerProperties.attackRange[0] > 1 && unitHasMoved) {
    throw new DispatchableError("Trying to move and attack with an indirect unit");
  }

  const attackDistance = getDistance(fromPosition, action.defenderPosition);

  let maximumAttackRange =
    attackerProperties.attackRange[1] - (match.getCurrentWeather() === "sandstorm" ? 1 : 0);
  maximumAttackRange =
    attacker.player.getHook("attackRange")?.(maximumAttackRange, attacker) ?? maximumAttackRange;

  // we'll need this logic to prevent e.g. Max from having
  // [2, 1] artillery attack range in sandstorms.
  maximumAttackRange = Math.max(attackerProperties.attackRange[0], maximumAttackRange);

  if (attackerProperties.attackRange[0] > attackDistance || attackDistance > maximumAttackRange) {
    throw new DispatchableError("Unit is not in range to attack");
  }

  const defender = match.getUnit(action.defenderPosition);

  if (defender === undefined) {
    const attackedTile = match.getTile(action.defenderPosition);

    if (attackedTile.type !== "pipeSeam") {
      throw new DispatchableError("No unit found in target location to attack");
    }

    const pipeSeamUnitEquivalent = createPipeSeamUnitEquivalent(
      match,
      attacker,
      action.defenderPosition,
      attackedTile.hp,
    );

    if (getBaseDamage(attacker, pipeSeamUnitEquivalent) === null) {
      throw new DispatchableError("Unit cannot attack specified pipeseam");
    }

    const result = calculateEngagementOutcome(
      attacker,
      pipeSeamUnitEquivalent,
      { goodLuck: 0, badLuck: 0 },
      { goodLuck: 0, badLuck: 0 },
    );

    return {
      ...action,
      defenderHP: Math.max(0, result.defenderHP),
    };
  }

  if (defender.player.team.index === player.team.index) {
    throw new DispatchableError("The target unit is from your own team");
  }

  if (!attacker.player.team.canSeeUnitAtPosition(defender.data.position)) {
    throw new DispatchableError("The target unit is not in vision");
  }

  if (getBaseDamage(attacker, defender) === null) {
    throw new DispatchableError("This unit cannot attack specified enemy unit");
  }

  // sonja scop exception (she attacks first when attacked)
  if (
    defender.player.data.coId.name === "sonja" &&
    defender.player.data.COPowerState === "super-co-power"
  ) {
    // "defender" is sonja unit with scop, "attacker" is unit that attacked sonja unit
    const result = calculateEngagementOutcome(defender, attacker, defenderLuck, attackerLuck);

    if (result.attackerHP === undefined) {
      // that means sonja scop unit killed attacker, so they couldn't "counterattack" the sonja unit
      // therefore, sonja unit (defender) remains untouched
      result.attackerHP = defender.getHP();
    }

    return {
      ...action,
      defenderHP: Math.max(0, result.attackerHP),
      attackerHP: Math.max(0, result.defenderHP),
      eliminationReason: getEliminationReason({
        attacker: attacker.player, // TODO not sure if this is the correct way around...
        defender: defender.player,
        attackerHP: Math.max(0, result.defenderHP),
        defenderHP: Math.max(0, result.attackerHP),
      }),
    };
  }

  const result = calculateEngagementOutcome(attacker, defender, attackerLuck, defenderLuck);
  return {
    ...action,
    defenderHP: Math.max(0, result.defenderHP),
    attackerHp: result.attackerHP !== undefined ? Math.max(0, result.attackerHP) : undefined,
    eliminationReason: getEliminationReason({
      attacker: attacker.player,
      defender: defender.player,
      attackerHP: result.attackerHP !== undefined ? Math.max(0, result.attackerHP) : undefined,
      defenderHP: Math.max(0, result.defenderHP),
    }),
  };
};

export const getPowerChargeGain = (
  attacker: UnitWrapper,
  attackerHpDiff: number,
  defender: UnitWrapper,
  defenderHpDiff: number,
) => {
  //power meter charge
  const attackerVP = attacker.player.getVersionProperties();
  const defenderVP = defender.player.getVersionProperties();

  return {
    attackerPowerCharge:
      attackerVP.powerMeterIncreasePerHP(attacker) * attackerHpDiff +
      attackerVP.powerMeterIncreasePerHP(defender) *
        defenderHpDiff *
        attackerVP.offensivePowerGenMult,
    defenderPowerCharge:
      defenderVP.powerMeterIncreasePerHP(defender) * defenderHpDiff +
      defenderVP.powerMeterIncreasePerHP(attacker) *
        attackerHpDiff *
        defenderVP.offensivePowerGenMult,
  };
};

export const applyAttackEvent = (match: MatchWrapper, event: AttackEvent, position: Position) => {
  const attacker = match.getUnitOrThrow(position);
  const defender = match.getUnit(event.defenderPosition);

  if (defender === undefined) {
    // pipe seam
    const pipeTile = match.getTile(event.defenderPosition);

    if (pipeTile.type !== "pipeSeam") {
      throw new Error("Received pipe seam attack event, but no pipe seam was found");
    }

    const usedVersion = match.rules.gameVersion ?? attacker.player.data.coId.version;

    //ammo consumption
    if (canAttackWithPrimary(attacker, usedVersion === "AW1" ? "mediumTank" : "neoTank")) {
      attacker.setAmmo((attacker.getAmmo() ?? 1) - 1);
    }

    // hp updates (0 means removed)
    pipeTile.hp = event.defenderHP;
    return;
  }

  //Calculate visible hp difference:
  const attackerHpDiff =
    attacker.getVisualHP() - getVisualHPfromHP(event.attackerHP ?? attacker.getVisualHP());
  const defenderHpDiff = defender.getVisualHP() - getVisualHPfromHP(event.defenderHP);

  //sasha scop funds
  if (
    attacker.player.data.coId.name === "sasha" &&
    attacker.player.data.COPowerState === "super-co-power"
  ) {
    attacker.player.data.funds += ((defenderHpDiff * defender.getBuildCost()) / 10) * 0.5;
  }

  if (
    defender.player.data.coId.name === "sasha" &&
    defender.player.data.COPowerState === "super-co-power"
  ) {
    defender.player.data.funds += ((attackerHpDiff * attacker.getBuildCost()) / 10) * 0.5;
  }

  //power charge
  const { attackerPowerCharge, defenderPowerCharge } = getPowerChargeGain(
    attacker,
    attackerHpDiff,
    defender,
    defenderHpDiff,
  );

  attacker.player.gainPowerCharge(attackerPowerCharge);
  defender.player.gainPowerCharge(defenderPowerCharge);

  //ammo consumption
  if (canAttackWithPrimary(attacker, defender.data.type)) {
    attacker.setAmmo((attacker.getAmmo() ?? 1) - 1);
  }

  if (event.attackerHP !== undefined && canAttackWithPrimary(defender, attacker.data.type)) {
    defender.setAmmo((defender.getAmmo() ?? 1) - 1);
  }

  // hp updates (+ removal if unit dies)
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
