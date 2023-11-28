import type { COProperties } from "../../co";
import type { Position } from "../../../schemas/position";
import { getDistance } from "../../positions";
import type { MatchWrapper } from "../../../wrappers/match";
import type { PlayerInMatchWrapper } from "../../../wrappers/player-in-match";
import { unitPropertiesMap } from "../../buildable-unit";

export const sturmAW1Campaign: COProperties = {
  displayName: "Sturm",
  gameVersion: "AW1",
  dayToDay: {
    description: "Units have +30% firepower and -20% defense. All terrain movement cost is reduced to 1 (doesn't apply in snow).",
    hooks: {
      movementCost: (_value, match) => {
        if (match.currentWeather !== "snow") {
          return 1;
        }
      },
      attack: () => 130,
      defense: () => 80
    }
  },
  powers: {
    COPower: {
      name: "Meteor Strike",
      // if we WANT rng, then, instead of sending chosen meteor type, we can make it so when a match starts,
      // a random seed is decided ONLY for sturm powers, and shared (doesn't matter that client has info tbh)
      description: "Deals 4 HP of damage to all units at a distance less or equal than 2 from the chosen position, centered on a unit, and gains +10% firepower. The meteor prioritises the most unit value in damages (allied units are dealt damage as well, and contribute negatively to the unit value calculation).",
      stars: 5,
      instantEffect( {match, player} ) {
        match.units.damageUntil1HPInRadius({
          radius: 2,
          damageAmount: 8,
          epicenter: getBestPositionMeteor(match, player)
        });
      },
      hooks: {
        attack: () => 140, //and +10% with non-accurate (xdd) passive power boost
      }
    }
  }
};


// TODO idk where do you want this function, maybe logic can be merged with VB scop (own units don't substract unit value)
export const getBestPositionMeteor = (
  match: MatchWrapper,
  sturmPlayer: PlayerInMatchWrapper
): Position => {
  const sturmTeam = sturmPlayer.data.slot; // TODO team stuff
  let bestPosition: Position = [0,0];
  let bestValue = -100000;

  for (const enemyUnit of sturmPlayer.getEnemyUnits().data) { //centered in an enemy unit
    let unitValue = 0;

    for (const unit of match.units.data) {
      if (getDistance(unit.data.position, enemyUnit.data.position) <= 2) {
        // in this case, SINCE NO CO EXISTS THAT CERTAIN UNITS COST LESS, since it's comparing unit value,
        // no need to apply cost hooks / modifiers
        if (unit.data.playerSlot === sturmTeam) {
          unitValue -= unitPropertiesMap[unit.data.type].cost * Math.min(8, unit.getVisualHP());
        }
        else {
          unitValue += unitPropertiesMap[unit.data.type].cost * Math.min(8, unit.getVisualHP());
        }
      }
    }

    if (bestValue < unitValue) {
      bestValue = unitValue;
      bestPosition = enemyUnit.data.position;
    }
  }

  return bestPosition;
}