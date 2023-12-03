import type { PlayerInMatchWrapper } from "../../../../wrappers/player-in-match";
import { getDistance} from "../../../../schemas/position";
import type { Position } from "../../../../schemas/position";

export const getUnitValueMeteorPosition = (
  sturmPlayer: PlayerInMatchWrapper,
  damage: number
): Position => {
  let bestPosition: Position = [0, 0];
  let bestValue = Number.NEGATIVE_INFINITY;

  //centered in an enemy unit
  for (const enemyUnit of sturmPlayer.team.getEnemyUnits()) {
    let unitValue = 0;

    for (const unit of sturmPlayer.match.units) {
      if (getDistance(unit.data.position, enemyUnit.data.position) <= 2) {
        const thisUnitValue =
          (unit.getBuildCost() / 10) * Math.min(damage, unit.getVisualHP());

        if (unit.player.team.index === sturmPlayer.team.index) {
          unitValue -= thisUnitValue;
        } else {
          unitValue += thisUnitValue;
        }
      }
    }

    if (bestValue < unitValue) {
      bestValue = unitValue;
      bestPosition = enemyUnit.data.position;
    }
  }

  return bestPosition;
};

export const getIndirectsMeteorPosition = (
  sturmPlayer: PlayerInMatchWrapper,
  damage: number
): Position => {
  let bestPosition: Position = [0, 0];
  let bestValue = Number.NEGATIVE_INFINITY;

  //centered in an enemy unit
  for (const enemyUnit of sturmPlayer.team.getEnemyUnits()) {
    let unitValue = 0;

    for (const unit of sturmPlayer.match.units) {
      if (getDistance(unit.data.position, enemyUnit.data.position) <= 2) {
        let thisUnitValue =
          (unit.getBuildCost() / 10) * Math.min(damage, unit.getVisualHP());

        // duplicate value if unit is an indirect
        // (idk if it only counts for enemy units or for all units)

        if ("attackRange" in unit.properties && unit.properties.attackRange[1] > 1) {
          thisUnitValue *= 2;
        }

        if (unit.player.team.index === sturmPlayer.team.index) {
          unitValue -= thisUnitValue;
        } else {
          unitValue += thisUnitValue;
        }
      }
    }

    if (bestValue < unitValue) {
      bestValue = unitValue;
      bestPosition = enemyUnit.data.position;
    }
  }

  return bestPosition;
};

export const getMostHPMeteorPosition = (
  sturmPlayer: PlayerInMatchWrapper,
  damage: number
): Position => {
  let bestPosition: Position = [0, 0];
  let bestHP = Number.NEGATIVE_INFINITY;

  //centered in an enemy unit
  for (const enemyUnit of sturmPlayer.team.getEnemyUnits()) {
    let hpValue = 0;

    for (const unit of sturmPlayer.match.units) {
      if (getDistance(unit.data.position, enemyUnit.data.position) <= 2) {

        if (unit.player.team.index === sturmPlayer.team.index) {
          hpValue -= Math.min(damage, unit.getVisualHP());
        } else {
          hpValue += Math.min(damage, unit.getVisualHP());
        }
      }
    }

    if (bestHP < hpValue) {
      bestHP = hpValue;
      bestPosition = enemyUnit.data.position;
    }
  }

  return bestPosition;
};
export const getRandomMeteorPosition = (
  sturmPlayer: PlayerInMatchWrapper,
  damage: number
): Position => {
  switch(Math.floor(Math.random() * 3)) {
    case 0: return getUnitValueMeteorPosition(sturmPlayer, damage);
    case 1: return getIndirectsMeteorPosition(sturmPlayer, damage);
    default: return getMostHPMeteorPosition(sturmPlayer, damage);
  }
}
