import { calculateEngagementOutcome } from "server/engine/rules/calculate-damage";
import { createPipeSeamUnitEquivalent } from "server/engine/constants/base-damage";
import type { Position } from "server/core/schemas/position";
import type { MatchWrapper } from "server/engine/entities/match";
import { UnitWrapper } from "server/engine/entities/unit";

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
  // When the viewer can't see the defender's real HP (e.g. a Sonja unit masks it), forecast against a
  // FULL-HP defender so nothing leaks it. Every output — the defense scaling, the counter, and the
  // HP-cap on damage dealt — depends on the defender's HP, so assuming full life is the only way the
  // damage range gives away no information about the true value.
  assumeDefenderFullHp = false,
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
  } else if (assumeDefenderFullHp && defender.data.stats !== "hidden") {
    // Forecast against a full-HP copy. Deep-clone the data (so we don't mutate the live unit's shared
    // stats object) and set HP to full; the UnitWrapper ctor has no side effects, so nothing else in
    // authoritative state is touched.
    const fullHpData = structuredClone(defender.data);
    fullHpData.stats.hp = 100;
    defender = new UnitWrapper(fullHpData, match);
  }

  // Forecast the engagement from the destination WITHOUT touching the live attacker. Instead of
  // mutating `attacker.data.position` on the authoritative in-memory MatchWrapper (a read query must
  // not corrupt shared state — any concurrent read or thrown calc would leave the unit stranded), we
  // evaluate against a throwaway clone placed at `newUnitPosition`. The UnitWrapper constructor has
  // no side effects (it does not register in `match.units`), so this clone is free and isolated.
  const forecastAttacker = new UnitWrapper({ ...attacker.data, position: newUnitPosition }, match);

  const bestAttackerOutcome = isPipeSeamAttack
    ? calculateEngagementOutcome(
        forecastAttacker,
        defender,
        { goodLuck: 0, badLuck: 0 },
        { goodLuck: 0, badLuck: 0 },
      )
    : calculateEngagementOutcome(
        forecastAttacker,
        defender,
        { goodLuck: 1, badLuck: 0 },
        { goodLuck: 0, badLuck: 1 },
      );

  const bestDefenderOutcome = isPipeSeamAttack
    ? calculateEngagementOutcome(
        forecastAttacker,
        defender,
        { goodLuck: 0, badLuck: 0 },
        { goodLuck: 0, badLuck: 0 },
      )
    : calculateEngagementOutcome(
        forecastAttacker,
        defender,
        { goodLuck: 0, badLuck: 1 },
        { goodLuck: 1, badLuck: 0 },
      );

  //create display of engagement result
  const maxDamageDealt = defender.getHP() - bestAttackerOutcome.defenderHP;
  const minDamageDealt = defender.getHP() - bestDefenderOutcome.defenderHP;

  const attackerHP = forecastAttacker.getHP();
  const maxDamageTaken = attackerHP - (bestDefenderOutcome.attackerHP ?? attackerHP);
  const minDamageTaken = attackerHP - (bestAttackerOutcome.attackerHP ?? attackerHP);

  //Enemy unit is dead or can't attack
  if (minDamageDealt >= defender.getHP() || maxDamageTaken === attackerHP) {
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
