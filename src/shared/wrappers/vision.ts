import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { getDistance } from "shared/schemas/position";
import type { Position } from "shared/schemas/position";
import type { PlayerInMatchWrapper } from "./player-in-match";
import type { TeamWrapper } from "./team";

/**
 * TODO doesn't account for teams
 */
const getUnitVisionRangeCache = (player: PlayerInMatchWrapper) =>
  player.getUnits().data.map((unit) => {
    const { type, position } = unit.data;
    const { vision: baseVision } = unitPropertiesMap[type];

    const hasMountainBonus =
      unit.isInfantryOrMech() && unit.getTile().type === "mountain";

    const modifiedVision = player.getHook("vision")?.(baseVision, unit);

    const coVisionRange =
      (modifiedVision ?? baseVision) + (hasMountainBonus ? 3 : 0);

    const weatherVisionRange =
      player.match.currentWeather === "rain"
        ? coVisionRange - 1
        : coVisionRange;

    return {
      position,
      visionRange: Math.max(weatherVisionRange, 1),
    };
  });

/** WIP / Unused */
const _getUnitVisionRangeCache_ForTeams = (team: TeamWrapper) =>
  team.players.flatMap(getUnitVisionRangeCache);

export class Vision {
  private visionArray: Uint8Array;
  private mapWidth: number;

  constructor(player: PlayerInMatchWrapper) {
    const { map } = player.match;
    this.mapWidth = map.width;
    const visionArraySize = this.mapWidth * map.height;
    this.visionArray = new Uint8Array(visionArraySize);
    const unitVisionRangeCache = getUnitVisionRangeCache(player);

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const rowOffset = this.getVisionIndexRowOffset(y);

        unitLoop: for (const unit of unitVisionRangeCache) {
          const distance = getDistance([x, y], unit.position);

          if (distance <= unit.visionRange) {
            const visionIndex = x * rowOffset;
            this.visionArray[visionIndex] = 1;
            break unitLoop;
          }
        }
      }
    }
  }

  private getVisionIndexRowOffset(y: Position[1]) {
    return y * this.mapWidth;
  }

  isPositionVisible(position: Position): boolean {
    const visionIndex = this.getVisionIndexRowOffset(position[1]) + position[0];
    const result: number | undefined = this.visionArray[visionIndex];

    if (result === undefined) {
      throw new Error("Position for visible check is out of bounds");
    }

    return result === 1;
  }
}
