import type { PlayerInMatchWrapper } from "../../../wrappers/player-in-match";
import { getDistance} from "../../../schemas/position";
import type { Position } from "../../../schemas/position";
import type { MatchWrapper } from "../../../wrappers/match";

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
        const unitProperties = unit.properties();

        if ("attackRange" in unitProperties && unitProperties.attackRange[1] > 1) {
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

/**
 * Calculates a hash (evenly distributed mod 3) from a match state.
 * Used for "randomizing" sturm meteor type.
 * Not recommended to use if not for getting a modulo of a small number after.
 */
const calculateMatchHash = (match: MatchWrapper): number => {
  let hashResult = match.map.data.id.charCodeAt(0);

  //those 2 numbers are primes
  for (const unit of match.units) {
    if (unit.getFuel() % 2) {
      hashResult += unit.getHP() * 5333;
    } else {
      hashResult -= unit.getHP() * 3371;
    }
  }

  while (hashResult < 0) {
    hashResult += 1e9 + 7; //this is a prime as well
  }

  return hashResult;
}

export const getRandomMeteorPosition = (
  sturmPlayer: PlayerInMatchWrapper,
  damage: number
): Position => {
  switch(calculateMatchHash(sturmPlayer.match) % 3) {
    case 0: return getUnitValueMeteorPosition(sturmPlayer, damage);
    case 1: return getIndirectsMeteorPosition(sturmPlayer, damage);
    default: return getMostHPMeteorPosition(sturmPlayer, damage);
  }
}
