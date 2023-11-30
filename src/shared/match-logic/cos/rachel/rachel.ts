import type { COProperties } from "../../co";
import type { Position } from "../../../schemas/position";
import { getDistance } from "shared/schemas/position";
import { unitPropertiesMap } from "../../buildable-unit";

export const rachelAWDS: COProperties = {
  displayName: "Rachel",
  gameVersion: "AWDS",
  dayToDay: {
    description: "When repairing, units heal 1 extra HP (consumes additional funds).",
    hooks: {
      // TODO i think this is an edge case
    }
  },
  powers: {
    COPower: {
      name: "Lucky lass",
      description: "Luck is increased by 30% (for a total of 40%).",
      stars: 3,
      hooks: {
        maxGoodLuck: () => 40
      }
    },
    superCOPower: {
      name: "Covering Fire",
      description:
      // TODO check if infantry missile prioritises capturing infantry
      // TODO check all tiebreaks
      // TODO check if hp matters for unit value missile
      // TODO check if each missile is recalculated after the first
      // TODO i'm guessing not, but does infantry count as mech as well?
        "Fires three missiles that deal 3 HP of damage to all units at 2 or less distance from the center. The first one targets the largest group of infantry, the second one targets the most unit value (own units subtract value), and the third one tries to inflict as much HP damage as possible (own units subtract value)",
      stars: 6,
      instantEffect( {match, player} ) {
        const rachelTeam = player.data.slot; // TODO teams

        let bestPositionInf: Position = [0,0];
        let mostInfantry = -10000;

        let bestPositionValue: Position = [0,0];
        let mostValue = -10000;

        let bestPositionHp: Position = [0,0];
        let mostHP = -10000, mostValueHP = -10000; //for tiebreak

        for (let i = 0; i < match.map.width; ++i) { // TODO idk if it's the other way
          for (let j = 0; j < match.map.height; ++j) {
            let currentInfantry = 0, currentValue = 0, currentHP = 0;

            for (const unit of match.units.data) {
              if (getDistance([i, j], unit.data.position) > 2) {
                continue;
              }

              // in this case, SINCE NO CO EXISTS THAT CERTAIN UNITS COST LESS, since it's comparing unit value,
              // no need to apply cost hooks / modifiers
              if (unit.data.playerSlot === rachelTeam) {
                currentValue -= unitPropertiesMap[unit.data.type].cost * Math.min(3, unit.getVisualHP());
                currentHP -= unit.getVisualHP();
              }
              else {
                currentValue += unitPropertiesMap[unit.data.type].cost * Math.min(3, unit.getVisualHP());
                currentHP += unit.getVisualHP();

                if (unit.data.type === "infantry") {
                  ++currentInfantry;
                }
              }
            }

            if (currentInfantry > mostInfantry) {
              mostInfantry = currentInfantry;
              bestPositionInf = [i, j];
            }

            if (currentHP > mostHP || (currentHP === mostHP && currentValue > mostValueHP)) {
              mostHP = currentHP;
              mostValueHP = currentValue;
              bestPositionHp = [i, j];
            }

            if (currentValue > mostValue) {
              mostValue = currentValue;
              bestPositionValue = [i, j];
            }
          }
        }

        match.units.damageUntil1HPInRadius({
          radius: 2,
          damageAmount: 3,
          epicenter: bestPositionInf
        });
        match.units.damageUntil1HPInRadius({
          radius: 2,
          damageAmount: 3,
          epicenter: bestPositionValue
        });
        match.units.damageUntil1HPInRadius({
          radius: 2,
          damageAmount: 3,
          epicenter: bestPositionHp
        });
      }
    }
  }
};
