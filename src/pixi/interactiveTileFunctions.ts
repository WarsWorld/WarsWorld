import { calculateEngagementOutcome } from "shared/match-logic/calculate-damage";
import { createPipeSeamUnitEquivalent } from "shared/match-logic/game-constants/base-damage";
import type { Position } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import type { UnitWrapper } from "shared/wrappers/unit";

export const readyUnitClickedAccessibleTile = (
  match: MatchWrapper,
  unit: UnitWrapper,
  position: Position,
) => {
  //check if can be a final location (empty tile or join or load)
  //display subaction menu
};

export const readyUnitHoveredAttackableTile = (
  match: MatchWrapper,
  attacker: UnitWrapper,
  newUnitPosition: Position,
  attackingPosition: Position,
) => {
  let defender = match.getUnit(attackingPosition);
  const isPipeSeamAttack = defender === undefined;

  if (!defender) {
    const attackedTile = match.getTile(attackingPosition);

    if (attackedTile.type == "pipeSeam") {
      defender = createPipeSeamUnitEquivalent(match, attacker, attackingPosition, attackedTile.hp);
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

  const maxDamageTaken = attacker.getHP() - (bestDefenderOutcome.attackerHP ?? 0);
  const minDamageTaken = attacker.getHP() - (bestAttackerOutcome.attackerHP ?? 0);

  //TODO create display showing those 4 numbers (don't display damage taken if both are 0 (never counterattack))
  // also remove it when not hovering it anymore
};

export const readyUnitClickedAttackableTile = (
  confirmation: boolean, //only sends action if true
  match: MatchWrapper,
  attacker: UnitWrapper,
  newUnitPosition: Position,
  attackingPosition: Position,
) => {
  if (!confirmation) {
    //remove path tiles, make damage outcome display not disappear until clicked somewhere
  } else {
    //send action
  }
};
