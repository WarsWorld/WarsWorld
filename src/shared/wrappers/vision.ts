import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { getDistance } from "shared/match-logic/positions";
import type { Position } from "shared/schemas/position";
import type { PlayerInMatchWrapper } from "./player-in-match";
import type { TeamWrapper } from "./team";

/**
 * TODO doesn't account for teams
 */
const getUnitVisionRangeCache = (player: PlayerInMatchWrapper) =>
  player.getUnits().data.map((unit) => {
    const { type, position } = unit.data;
    const baseVision = unitPropertiesMap[type].vision;

    /** TODO infantry/mech on mountain?? weather?? */
    const { onVision } = player.getCOHooksWithUnit(position);

    /* TODO rain! */
    const visionRange = onVision(baseVision);

    return {
      position,
      visionRange,
    };
  });

/** WIP / Unused */
const _getUnitVisionRangeCache_ForTeams = (team: TeamWrapper) =>
  team.players.flatMap(getUnitVisionRangeCache);

export class Vision {
  private visionArray: Uint8Array;

  constructor(player: PlayerInMatchWrapper) {
    const map = player.match.map;
    const visionArraySize = map.width * map.height;
    this.visionArray = new Uint8Array(visionArraySize);
    const unitVisionRangeCache = getUnitVisionRangeCache(player);

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        unitLoop: for (const unit of unitVisionRangeCache) {
          const distance = getDistance([x, y], unit.position);

          if (distance <= unit.visionRange) {
            const visionIndex = x * y;
            this.visionArray[visionIndex] = 1;
            break unitLoop;
          }
        }
      }
    }
  }

  isPositionVisible(position: Position): boolean {
    const visionIndex = position[0] * position[1];
    const result: number | undefined = this.visionArray[visionIndex];

    if (result === undefined) {
      throw new Error("Position for visible check is out of bounds");
    }

    return result === 1;
  }
}
