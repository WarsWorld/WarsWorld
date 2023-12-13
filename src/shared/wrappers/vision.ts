import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import type { Position } from "shared/schemas/position";
import { getDistance } from "shared/schemas/position";
import type { TeamWrapper } from "./team";

const getUnitVisionRangeCache = (team: TeamWrapper) =>
  team.getUnits().map((unit) => {
    const { type, position } = unit.data;
    const { vision: baseVision } = unitPropertiesMap[type];

    const hasMountainBonus =
      unit.isInfantryOrMech() && unit.getTile().type === "mountain";

    const modifiedVision = unit.player.getHook("vision")?.(baseVision);

    const coVisionRange =
      (modifiedVision ?? baseVision) + (hasMountainBonus ? 3 : 0);

    const weatherVisionRange =
      team.match.currentWeather === "rain"
        ? coVisionRange - 1
        : coVisionRange;

    const activeSonjaPower =
      unit.player.data.coId.name === "sonja" && unit.player.data.COPowerState !== "no-power";

    return {
      position,
      canLookInsideForestsAndReefs: activeSonjaPower,
      visionRange: Math.max(weatherVisionRange, 0),
    };
  });

export class Vision {
  private visionArray: Uint8Array;
  private mapWidth: number;

  constructor(team: TeamWrapper) {
    const { map } = team.match;
    this.mapWidth = map.width;
    const visionArraySize = this.mapWidth * map.height;
    this.visionArray = new Uint8Array(visionArraySize);
    const unitVisionRangeCache = getUnitVisionRangeCache(team);

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        // if property is owned by the team, it gives vision
        const tile = team.match.getTile([x, y]);

        if ("playerSlot" in tile && team.match.getPlayerBySlot(tile.playerSlot)?.team.index === team.index) {
          this.visionArray[y * this.mapWidth + x] = 1;
          continue;
        }

        unitLoop: for (const unit of unitVisionRangeCache) {
          const distance = getDistance([x, y], unit.position);
          let isVisible = distance <= unit.visionRange

          const tileType = map.data.tiles[y][x].type

          if (
            (tileType === "forest" || tileType === "reef")
            && distance > 1 // no team unit next to tile
            && !unit.canLookInsideForestsAndReefs
          ) {
            isVisible = false
          }

          if (isVisible) {
            this.visionArray[y * this.mapWidth + x] = 1;
            break unitLoop;
          }
        }
      }
    }
  }

  isPositionVisible(position: Position): boolean {
    const result: number | undefined =
      this.visionArray[position[1] * this.mapWidth + position[0]];

    if (result === undefined) {
      throw new Error("Position for visible check is out of bounds");
    }

    return result === 1;
  }
}
