import type { COProperties } from "../../../co";
import { getMissilePositions } from "./get-missile-positions";

export const rachelAWDS: COProperties = {
  displayName: "Rachel",
  gameVersion: "AWDS",
  dayToDay: {
    description: "When repairing on properties, units heal 1 extra HP (consumes additional funds).",
    hooks: {
      // extra repairs handled in pass turn event
    },
  },
  powers: {
    COPower: {
      name: "Lucky lass",
      description: "Luck is increased by 30% (for a total of 40%).",
      stars: 3,
      hooks: {
        maxGoodLuck: () => 40,
      },
    },
    superCOPower: {
      name: "Covering Fire",
      description:
        "Fires three missiles that deal 3 HP of damage to all units at 2 or less distance from the center. The first one targets the largest group of infantry, the second one targets the most unit value (own units subtract value), and the third one tries to inflict as much HP damage as possible (own units subtract value)",
      stars: 6,
      calculatePositions: (player) => getMissilePositions(player),
      instantEffect(player, positions) {
        if (positions === undefined || positions.length !== 3) {
          throw new Error("Did not get missile positions");
        }

        player.match.damageUntil1HPInRadius({
          radius: 2,
          visualHpAmount: 3,
          epicenter: positions[0],
        });
        player.match.damageUntil1HPInRadius({
          radius: 2,
          visualHpAmount: 3,
          epicenter: positions[1],
        });
        player.match.damageUntil1HPInRadius({
          radius: 2,
          visualHpAmount: 3,
          epicenter: positions[2],
        });
      },
    },
  },
};
