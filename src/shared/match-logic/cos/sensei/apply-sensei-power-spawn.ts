import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";

export function applySenseiPowerSpawn(
  player: PlayerInMatchWrapper,
  unitType: "infantry" | "mech"
) {
  const { match } = player;
  let unitCount = player.getUnits().data.length;

  for (let x = 0; x < match.map.width; x++) {
    for (let y = 0; y < match.map.height; y++) {
      if (unitCount >= match.rules.unitCapPerPlayer) {
        return;
      }

      const tile = match.getTile([x, y]);

      if (tile.type === "city" && "ownerSlot" in tile) {
        if (
          tile.ownerSlot === player.data.slot &&
          match.units.getUnit([x, y]) === undefined
        ) {
          if (unitType === "infantry") {
            player.addUnwrappedUnit({
              type: "infantry",
              position: [x, y],
              isReady: true,
              stats: {
                hp: 9,
                fuel: unitPropertiesMap.infantry.initialFuel
              }
            });
          } else {
            player.addUnwrappedUnit({
              type: "mech",
              position: [x, y],
              isReady: true,
              stats: {
                hp: 9,
                fuel: unitPropertiesMap.mech.initialFuel,
                ammo: unitPropertiesMap.mech.initialAmmo
              }
            });
          }

          unitCount++;
        }
      }
    }
  }
}
