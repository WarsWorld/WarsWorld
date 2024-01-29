import type { COProperties } from "../../../co";
import { getRandomMeteorPosition } from "./get-meteor-position";

export const sturmAW2: COProperties = {
  displayName: "Sturm",
  gameVersion: "AW2",
  dayToDay: {
    description:
      "Units have +20% firepower and +20% defense. All terrain movement cost is reduced to 1 (doesn't apply in snow).",
    hooks: {
      movementCost: (_value, { match }) => {
        if (match.getCurrentWeather() !== "snow") {
          return 1;
        }
      },
      attack: () => 120,
      defense: () => 120,
    },
  },
  powers: {
    superCOPower: {
      name: "Meteor Strike",
      description:
        "Units gain an additional +20% firepower and +20% defense. Deals 8 HP of damage to all units at a distance less or equal than 2 from the chosen position, centered on a unit. The meteor prioritises the most unit value in damages (allied units are dealt damage as well, and contribute negatively to the unit value calculation).",
      stars: 10,
      calculatePositions: (player) => [getRandomMeteorPosition(player, 8, false)],
      instantEffect(player, positions) {
        if (positions === undefined || positions.length !== 1) {
          throw new Error("Did not get a meteor position");
        }

        player.match.damageUntil1HPInRadius({
          radius: 2,
          visualHpAmount: 8,
          epicenter: positions[0],
        });
      },
      hooks: {
        attack: () => 140,
        defense: () => 140,
      },
    },
  },
};
