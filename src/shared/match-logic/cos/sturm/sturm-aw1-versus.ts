import type { COProperties } from "../../co";
import { getBestPositionMeteor } from "./sturm-aw1-campaign";

export const sturmAW1Versus: COProperties = { // TODO make a way to differenciate between the 2 versions?
  displayName: "Sturm",
  gameVersion: "AW1",
  dayToDay: {
    description: "Units have -20% firepower and +20% defense. All terrain movement cost is reduced to 1 (doesn't apply in snow).",
    hooks: {
      movementCost: (_value, {match}) => {
        if (match.currentWeather !== "snow") {
          return 1;
        }
      },
      attack: () => 80,
      defense: () => 120
    }
  },
  powers: {
    COPower: { // TODO idk if the firepower thing is accurate
      name: "Meteor Strike",
      description: "Deals 4 HP of damage to all units at a distance less or equal than 2 from the chosen position, centered on a unit. The meteor prioritises the most unit value in damages (allied units are dealt damage as well, and contribute negatively to the unit value calculation).",
      stars: 5,
      instantEffect( {match, player} ) {
        match.units.damageUntil1HPInRadius({
          radius: 2,
          damageAmount: 8,
          epicenter: getBestPositionMeteor(match, player)
        });
      },
      hooks: {
        movementRange: (value) => value + 1,
        attack: () => 110
      }
    }
  }
};