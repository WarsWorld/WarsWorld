import type { Position } from "../../../schemas/position";
import { getDistance } from "../../../schemas/position";
import type { PlayerInMatchWrapper } from "../../../wrappers/player-in-match";

export const getMissilePositions = (
  rachelPlayer: PlayerInMatchWrapper
): Position[] => {

  // !!! mechs do count as infantry
  let bestPositionInf: Position = [0,0];
  let mostInfantry = Number.NEGATIVE_INFINITY;
  let mostHPInf = Number.NEGATIVE_INFINITY; //for tiebreak
  let mostValueInf = Number.NEGATIVE_INFINITY;

  let bestPositionHp: Position = [0,0];
  let mostHP = Number.NEGATIVE_INFINITY;
  let mostValueHP = Number.NEGATIVE_INFINITY; //for tiebreak

  let bestPositionValue: Position = [0,0];
  let mostValue = Number.NEGATIVE_INFINITY;

  for (let y = 0; y < rachelPlayer.match.map.height; y++) {
    for (let x = 0; x < rachelPlayer.match.map.width; x++) {
      let currentInfantry = 0, currentValue = 0, currentHP = 0;

      for (const unit of rachelPlayer.match.units) {
        if (getDistance([x, y], unit.data.position) > 2) {
          continue;
        }

        const thisUnitValue =
          (unit.getBuildCost() / 10) * Math.min(3, unit.getVisualHP());

        if (unit.player.team.index === rachelPlayer.team.index) {
          currentValue -= thisUnitValue;
          currentHP -= unit.getVisualHP();
        }
        else {
          currentValue += thisUnitValue;
          currentHP += unit.getVisualHP();

          if (unit.isInfantryOrMech()) {
            ++currentInfantry;

            if ("currentCapturePoints" in unit.data && unit.data.currentCapturePoints !== undefined) {
              ++currentInfantry; //capping infantry counts as double
            }
          }
        }
      }

      // tiebreak order: most infantry -> most hp -> most value
      // this if statement is left ugly on purpose :)
      if (currentInfantry > mostInfantry ||
        (currentInfantry === mostInfantry && (currentHP > mostHPInf || (currentHP === mostHPInf && currentValue > mostValueInf)))) {

        mostInfantry = currentInfantry;
        mostHPInf = currentHP;
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