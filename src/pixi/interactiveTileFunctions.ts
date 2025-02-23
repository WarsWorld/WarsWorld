import { Container } from "pixi.js";
import { calculateEngagementOutcome } from "shared/match-logic/calculate-damage";
import { createPipeSeamUnitEquivalent } from "shared/match-logic/game-constants/base-damage";
import type { Position } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import type { UnitWrapper } from "shared/wrappers/unit";
import { tileConstructor } from "./sprite-constructor";

export type BattleForecast = {
  attackerDamage: { max: number; min: number };
  defenderDamage: { max: number; min: number };
};

export const getBattleForecast = (
  match: MatchWrapper,
  attacker: UnitWrapper,
  newUnitPosition: Position,
  attackingPosition: Position,
): BattleForecast => {
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

export const readyUnitClickedAttackableTile = (
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // TODO: unused yet
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

export const readyUnitClickedAccessibleTile = (
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // TODO: unused yet
  match: MatchWrapper,
  unit: UnitWrapper,
  position: Position,
) => {
  //check if can be a final location (empty tile or join or load)
  //display subaction menu
};

//passable tiles colour: "#43d9e4"
//attackable tiles colour: "#be1919"
export const createTilesContainer = (
  tilePositions: Position[],
  tileColour: string,
  tileZIndex: number,
  containerName?: string,
) => {
  const markedTiles = new Container();
  markedTiles.eventMode = "dynamic";

  for (const pos of tilePositions) {
    const square = tileConstructor(pos, tileColour);

    markedTiles.addChild(square);
  }

  markedTiles.zIndex = tileZIndex;

  if (containerName !== undefined) {
    markedTiles.name = containerName;
  }

  return markedTiles;
};
