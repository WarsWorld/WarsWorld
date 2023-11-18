import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { getDistance } from "shared/match-logic/positions";
import { isHiddenTile } from "shared/match-logic/tiles";
import {
  getNeighbourPositions,
  isSamePosition,
  type Position,
} from "shared/schemas/position";
import type { WWUnit } from "shared/schemas/unit";
import type { MatchWrapper } from "./match";
import type { PlayerInMatchWrapper } from "./player-in-match";

export class UnitWrapper {
  public player: PlayerInMatchWrapper;

  constructor(public data: WWUnit, public match: MatchWrapper) {
    this.player = match.players.getBySlotOrThrow(data.playerSlot);
  }

  damageUntil1HP(damageAmount: number) {
    this.data.stats.hp = Math.max(1, this.data.stats.hp - damageAmount);
  }

  getDistance(position: Position) {
    return getDistance(this.data.position, position);
  }

  /** TODO might not be used */
  isNextTo(unit: UnitWrapper) {
    return getDistance(this.data.position, unit.data.position) === 1;
  }

  isAtPosition(position: Position) {
    return isSamePosition(this.data.position, position);
  }

  getNeighbouringUnits() {
    const neighbourPositions = getNeighbourPositions(this.data.position);

    return this.match.units.data.filter((u) =>
      neighbourPositions.some((p) => u.isAtPosition(p))
    );
  }

  /** ignores forests/reefs because they get checked separately */
  getVision(): Position[] {
    const baseVision = unitPropertiesMap[this.data.type].vision;

    /* TODO rain! */
    const visionRange = this.player
      .getCOHooksWithUnit(this.data.position)
      .onVision(baseVision);

    const visionPositions: Position[] = [];
    const [x, y] = this.data.position;

    for (let i = 1; i <= visionRange; i++) {
      visionPositions.push([x + i, y], [x - i, y], [x, y + 1], [x, y - 1]);
    }

    return visionPositions.filter((p) => !this.match.map.isOutOfBounds(p));
  }

  /** sub, stealth */
  private isHiddenThroughHiddenProperty() {
    return "hidden" in this.data && this.data.hidden;
  }

  private isOnHiddenTile() {
    return isHiddenTile(this.match.getTileOrThrow(this.data.position));
  }

  isHiddenFromPlayerThroughHiddenPropertyOrTile(player: PlayerInMatchWrapper) {
    if (this.isHiddenThroughHiddenProperty() || this.isOnHiddenTile()) {
      return this.getNeighbouringUnits().some(
        (u) => u.data.playerSlot === player.data.slot
      );
    }

    return false;
  }

  getTile() {
    return this.match.getTileOrThrow(this.data.position);
  }
}
