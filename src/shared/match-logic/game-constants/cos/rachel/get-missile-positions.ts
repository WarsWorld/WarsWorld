import type { Position } from "../../../../schemas/position";
import { getDistance } from "../../../../schemas/position";
import type { PlayerInMatchWrapper } from "../../../../wrappers/player-in-match";

/**
 * Returns, in order:
 * 1) Infantry
 * 2) Value
 * 3) HP
 */
export const getMissilePositions = (
  rachelPlayer: PlayerInMatchWrapper
): Position[] => {

  // !!! mechs do count as infantry
  // apparently, this missile is in fact 1x normal hp, 2x infantry hp, 8x capturing infantry hp
  let bestPositionInf: Position = [0,0];
  let mostInfantryHP = Number.NEGATIVE_INFINITY;
  let mostValueInf = Number.NEGATIVE_INFINITY;

  let bestPositionHp: Position = [0,0];
  let mostHP = Number.NEGATIVE_INFINITY;
  let mostValueHP = Number.NEGATIVE_INFINITY; //for tiebreak

  let bestPositionValue: Position = [0,0];
  let mostValue = Number.NEGATIVE_INFINITY;

  for (let y = 0; y < rachelPlayer.match.map.height; y++) {
    for (let x = 0; x < rachelPlayer.match.map.width; x++) {
      let currentInfantryHP = 0, currentValue = 0, currentHP = 0;

      for (const unit of rachelPlayer.match.units) {
        if (getDistance([x, y], unit.data.position) > 2) {
          continue;
        }

        const thisUnitValue =
          (unit.getBuildCost() / 10) * Math.min(3, unit.getVisualHP());
        //"the highest HP total, with foot soldiers given a 2x Multiplier, capturing foot soldiers have an 8x multiplier"
        const thisUnitInfantryHP =
          (unit.getVisualHP()) * (unit.isInfantryOrMech() ? 2 : 1) *
          (("currentCapturePoints" in unit.properties && unit.properties.currentCapturePoints !== undefined) ? 4 : 1);

        if (unit.player.team.index === rachelPlayer.team.index) {
          currentValue -= thisUnitValue;
          currentHP -= unit.getVisualHP();
          currentInfantryHP -= thisUnitInfantryHP;
        }
        else {
          currentValue += thisUnitValue;
          currentHP += unit.getVisualHP();
          currentInfantryHP += thisUnitInfantryHP;
        }
      }

      // tiebreak order: most infantry -> most hp -> most value
      // this if statement is left ugly on purpose :)
      if (currentInfantryHP > mostInfantryHP ||
        (currentInfantryHP === mostInfantryHP && currentValue > mostValueInf)) {

        mostInfantryHP = currentInfantryHP;
        mostValueInf = currentValue;
        bestPositionInf = [x, y];
      }

      if (currentHP > mostHP ||
        (currentHP === mostHP && currentValue > mostValueHP)) {

        mostHP = currentHP;
        mostValueHP = currentValue;
        bestPositionHp = [x, y];
      }

      if (currentValue > mostValue) {
        mostValue = currentValue;
        bestPositionValue = [x, y];
      }
    }
  }

  return [bestPositionInf, bestPositionValue, bestPositionHp];
}