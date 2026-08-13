import { calculateEngagementOutcome } from "shared/match-logic/calculate-damage";
import { createPipeSeamUnitEquivalent } from "shared/match-logic/game-constants/base-damage";
import type { Position } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import type { UnitWrapper } from "shared/wrappers/unit";

/**
 * Damage forecast for an engagement — the min/max HP each side would lose. Pure engine query used
 * to preview a battle before it is committed; the backend computes it and the client renders it.
 */
export type BattleForecast = {
  attackerDamage: { max: number; min: number };
  defenderDamage: { max: number; min: number };
};

export const getBattleForecast = (
  match: MatchWrapper,
  attacker: UnitWrapper,
  newUnitPosition: Position,
  attackingAtPosition: Position,
): BattleForecast => {
  let defender = match.getUnit(attackingAtPosition);
  const isPipeSeamAttack = defender === undefined;

  if (!defender) {
    const attackedTile = match.getTile(attackingAtPosition);

    if (attackedTile.type == "pipeSeam") {
      defender = createPipeSeamUnitEquivalent(
        match,
        attacker,
        attackingAtPosition,
        attackedTile.hp,
      );
    } else {
      throw Error(
        "Creating attackable tile functionality to a tile that does not have a unit / pipeseam",
      );
    }
  }

  //temporarily move newUnit to new position (WON'T CHECK VALIDITY!)
  const oldUnitPosition = attacker.data.position;
  attacker.data.position = newUnitPosition;

  const bestAttackerOutcome = isPipeSeamAttack
    ? calculateEngagementOutcome(
        attacker,
        defender,
        { goodLuck: 0, badLuck: 0 },
        { goodLuck: 0, badLuck: 0 },
      )
    : calculateEngagementOutcome(
        attacker,
        defender,
        { goodLuck: 1, badLuck: 0 },
        { goodLuck: 0, badLuck: 1 },
      );

  const bestDefenderOutcome = isPipeSeamAttack
    ? calculateEngagementOutcome(
        attacker,
        defender,
        { goodLuck: 0, badLuck: 0 },
        { goodLuck: 0, badLuck: 0 },
      )
    : calculateEngagementOutcome(
        attacker,
        defender,
        { goodLuck: 0, badLuck: 1 },
        { goodLuck: 1, badLuck: 0 },
      );

  attacker.data.position = oldUnitPosition;

  //create display of engagement result
  const maxDamageDealt = defender.getHP() - bestAttackerOutcome.defenderHP;
  const minDamageDealt = defender.getHP() - bestDefenderOutcome.defenderHP;

  const maxDamageTaken = attacker.getHP() - (bestDefenderOutcome.attackerHP ?? attacker.getHP());
  const minDamageTaken = attacker.getHP() - (bestAttackerOutcome.attackerHP ?? attacker.getHP());

  //Enemy unit is dead or can't attack
  if (minDamageDealt >= defender?.getHP() || maxDamageTaken === attacker.getHP()) {
    return {
      attackerDamage: { max: maxDamageDealt, min: minDamageDealt },
      defenderDamage: { min: 0, max: 0 },
    };
  }

  return {
    attackerDamage: { max: maxDamageDealt, min: minDamageDealt },
    defenderDamage: { min: minDamageTaken, max: maxDamageTaken },
  };
};
