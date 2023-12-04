import type { COProperties } from "../../../co";
import { getRandomMeteorPosition } from "./get-meteor-position";

export const sturmAW1Campaign: COProperties = {
  displayName: "Sturm (Campaign)",
  gameVersion: "AW1",
  dayToDay: {
    description:
      "Units have +30% firepower and -20% defense. All terrain movement cost is reduced to 1 (doesn't apply in snow).",
    hooks: {
      movementCost: (_value, { match }) => {
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
      description:
        "Deals 8 HP of damage to all units at a distance less or equal than 2 from the chosen position, centered on a unit, and gains +10% firepower. The meteor prioritises the most unit value in damages (allied units are dealt damage as well, and contribute negatively to the unit value calculation).",
      stars: 5,
      calculatePositions: (player) => [getRandomMeteorPosition(player, 8)],
      instantEffect(player, positions) {
        if (positions === undefined || positions.length !== 1) {
          throw new Error("Did not get a meteor position");
        }

        player.match.damageUntil1HPInRadius({
          radius: 2,
          visualHpAmount: 8,
          epicenter: getRandomMeteorPosition(player, 8)
        });
      },
      hooks: {
        attack: () => 140 //and +10% with non-accurate (xdd) passive power boost
      }
    }
  }
};

