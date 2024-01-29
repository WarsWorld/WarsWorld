import type { COProperties } from "../../../co";
import { getRandomMeteorPosition } from "./get-meteor-position";

export const sturmAW1Versus: COProperties = {
  displayName: "Sturm (Versus)",
  gameVersion: "AW1",
  dayToDay: {
    description:
      "Units have -20% firepower and +20% defense. All terrain movement cost is reduced to 1 (doesn't apply in snow).",
    hooks: {
      movementCost: (_value, { match }) => {
        if (match.getCurrentWeather() !== "snow") {
          return 1;
        }
      },
      attack: () => 80,
      defense: () => 120,
    },
  },
  powers: {
    COPower: {
      name: "Meteor Strike",
      description:
        "Deals 4 HP of damage to all units at a distance less or equal than 2 from the chosen position, centered on a unit. The meteor prioritises the most unit value in damages (allied units are dealt damage as well, and contribute negatively to the unit value calculation).",
      stars: 5,
      calculatePositions: (player) => [getRandomMeteorPosition(player, 4, true)],
      instantEffect(player, positions) {
        if (positions === undefined || positions.length !== 1) {
          throw new Error("Did not get a meteor position");
        }

        player.match.damageUntil1HPInRadius({
          radius: 2,
          visualHpAmount: 4,
          epicenter: positions[0],
        });
      },
    },
  },
};
