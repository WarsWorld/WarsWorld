import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import type { Position } from "shared/schemas/position";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";

export function applySenseiPowerSpawn(
  player: PlayerInMatchWrapper,
  unitType: "infantry" | "mech"
) {
  const { match } = player;

  // it's faster to track the unitCount with a variable here than
  // scanning player.getUnits().data.length on every iteration
  let unitCount = player.getUnits().data.length;

  // we're not looping through match.changeableTiles because
  // sensei power spawns are supposed to start top left (0, 0), then go x+ (right), then y+ (down).
  // if we took changeableTiles we'd need to sort them by their position like this
  // which would be more code and processing.

  for (let y = 0; y < match.map.height; y++) {
    for (let x = 0; x < match.map.width; x++) {
      if (unitCount >= match.rules.unitCapPerPlayer) {
        return;
      }

      const position: Position = [x, y];
      const tile = match.getTile(position);

      if (
        tile.type !== "city" ||
        !("ownerSlot" in tile) ||
        !player.owns(tile) ||
        match.units.getUnit(position) !== undefined
      ) {
        continue;
      }

      if (unitType === "infantry") {
        player.addUnwrappedUnit({
          type: "infantry",
          position,
          isReady: true,
          stats: {
            hp: 9,
            fuel: unitPropertiesMap.infantry.initialFuel
          }
        });
      } else {
        player.addUnwrappedUnit({
          type: "mech",
          position,
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
