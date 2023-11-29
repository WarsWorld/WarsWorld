import type { COProperties } from "../../co";
import { getBestPositionMeteor } from "./sturm-aw1-campaign";

export const sturmAW2: COProperties = {
  displayName: "Sturm",
  gameVersion: "AW2",
  dayToDay: {
    description:
      "Units have +20% firepower and +20% defense. All terrain movement cost is reduced to 1 (doesn't apply in snow).",
    hooks: {
      movementCost: (_value, {match}) => {
        if (match.currentWeather !== "snow") {
          return 1;
        }
      },
      attack: () => 120,
      defense: () => 120
    }
  },
  powers: {
    // TODO important! meteor strike cannot be deterministic for clients because
    // clients don't see into fog or hidden sub/stealth, which meteor strike ignores.
    // therefore the power event must be extended by the impact position.
    superCOPower: {
      name: "Meteor Strike",
      description:
        "Units gain an additional +20% firepower and +20% defense. Deals 8 HP of damage to all units at a distance less or equal than 2 from the chosen position, centered on a unit. The meteor prioritises the most unit value in damages (allied units are dealt damage as well, and contribute negatively to the unit value calculation).",
      stars: 10,
      instantEffect({ match, player }) {
        match.units.damageUntil1HPInRadius({
          radius: 2,
          damageAmount: 8,
          epicenter: getBestPositionMeteor(match, player)
        });
      },
      hooks: {
        attack: () => 140,
        defense: () => 140
      }
    }
  }
};
