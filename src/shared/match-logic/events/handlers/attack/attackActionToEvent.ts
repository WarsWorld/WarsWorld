import { DispatchableError } from "shared/DispatchedError";
import { calculateEngagementOutcome } from "shared/match-logic/calculate-damage";
import {
  createPipeSeamUnitEquivalent,
  getBaseDamage,
} from "shared/match-logic/game-constants/base-damage";
import type { AttackAction } from "shared/schemas/action";
import type { LuckRoll } from "shared/schemas/co";
import { getDistance } from "shared/schemas/position";
import type { AttackEvent } from "shared/types/events";
import type { SubActionToEvent } from "../../handler-types";
import { getEliminationReason } from "./getEliminationReason";

type Params = [
  ...Parameters<SubActionToEvent<AttackAction>>,
  unitHasMoved: boolean,
  attackerLuck: LuckRoll,
  defenderLuck: LuckRoll,
];

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
  const attackRange = attacker.getAttackRange();

  if (attackRange === undefined) {
    throw new DispatchableError("Unit cannot attack");
  }

  if (attackRange.minRange > 1 && unitHasMoved) {
    throw new DispatchableError("Trying to move and attack with an indirect unit");
  }

  const attackDistance = getDistance(fromPosition, action.defenderPosition);

  if (attackRange.minRange > attackDistance || attackDistance > attackRange.maxRange) {
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
    attackerHP: result.attackerHP !== undefined ? Math.max(0, result.attackerHP) : undefined,
    eliminationReason: getEliminationReason({
      attacker: attacker.player,
      defender: defender.player,
      attackerHP: result.attackerHP !== undefined ? Math.max(0, result.attackerHP) : undefined,
      defenderHP: Math.max(0, result.defenderHP),
    }),
  };
};
