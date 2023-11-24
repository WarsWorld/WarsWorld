import { COPropertiesMap } from "shared/match-logic/co";
import type { Hooks } from "shared/match-logic/co-hooks";
import type {
  UnitWithHiddenStats,
  UnitWithVisibleStats
} from "shared/schemas/unit";
import type { Weather } from "shared/schemas/weather";
import type { PlayerInMatch } from "shared/types/server-match-state";
import type { MatchWrapper } from "./match";
import { UnitWrapper } from "./unit";
import { UnitsWrapper } from "./units";
import { Vision } from "./vision";

export class PlayerInMatchWrapper {
  constructor(public data: PlayerInMatch, public match: MatchWrapper) {}

  getCommtowerAttackBoost() {
    return this.match.changeableTiles.reduce(
      (prev, cur) =>
        cur.type === "commtower" && cur.ownerSlot === this.data.slot
          ? prev + 1
          : prev,
      0
    );
  }

  getUnits() {
    return new UnitsWrapper(
      this.match.units.data.filter((u) => u.data.playerSlot === this.data.slot)
    );
  }

  /**
   * TODO Teams/Allies!
   */
  getEnemyUnits() {
    return new UnitsWrapper(
      this.match.units.data.filter((u) => u.data.playerSlot !== this.data.slot)
    );
  }

  getHook<HookType extends keyof Hooks>(hookType: HookType) {
    const COProperties = COPropertiesMap[this.data.co];

    switch (this.data.COPowerState) {
      case "no-power":
        return COProperties.dayToDay?.hooks[hookType];
      case "co-power":
        return COProperties.powers.COPower?.hooks?.[hookType];
      case "super-co-power":
        return COProperties.powers.superCOPower.hooks?.[hookType];
    }
  }

  /**
   * gets the next player, looping back around to index 0
   * if needed until current player slot.
   */
  getNextAlivePlayer(): PlayerInMatchWrapper | null {
    const nextSlot = (n: number) =>
      (n + 1) % this.match.map.data.numberOfPlayers;

    for (
      let i = nextSlot(this.data.slot);
      i !== this.data.slot;
      i = nextSlot(i)
    ) {
      const player = this.match.players.getBySlot(i);

      if (player?.data.eliminated === true) {
        return player;
      }
    }

    return null;
  }

  /**
   * This might be suboptimal - especially considering clear-weather matches,
   * but it should cover discovering hidden units as well as fog of war
   * without too much complexity.
   */
  getEnemyUnitsInVision() {
    const vision = this.match.rules.fogOfWar ? new Vision(this) : null;

    return this.getEnemyUnits()
      .data.filter((enemy) => {
        if (enemy.isHiddenThroughHiddenProperty()) {
          return enemy.getNeighbouringUnits().some((u) => this.ownsUnit(u));
        }

        if (vision === null) {
          return true;
        }

        const isSonjaAndPower =
          this.data.co === "sonja" && this.data.COPowerState !== "no-power";

        if (!isSonjaAndPower && enemy.isOnHiddenTile()) {
          return enemy.getNeighbouringUnits().some((u) => this.ownsUnit(u));
        }

        return vision.isPositionVisible(enemy.data.position);
      })
      .map<UnitWithVisibleStats | UnitWithHiddenStats>((visibleEnemyUnit) => {
        if (visibleEnemyUnit.player.data.co === "sonja") {
          const hiddenUnit: UnitWithHiddenStats = {
            ...visibleEnemyUnit.data,
            stats: "hidden"
          };

          return hiddenUnit;
        }

        return visibleEnemyUnit.data;
      });
  }

  gainFunds() {
    // TODO get all owned properties + check if high funds mode + ?
  }

  getPowerStarCost() {
    return 9000 * (1 + 0.2 * Math.min(this.data.timesPowerUsed, 10));
  }

  increasePowerMeter(amount: number) {
    if (this.data.COPowerState !== "no-power") {
      return;
    }

    const maxPowerMeter =
      COPropertiesMap[this.data.co].powers.superCOPower.stars *
      this.getPowerStarCost();

    this.data.powerMeter = Math.min(
      this.data.powerMeter + amount,
      maxPowerMeter
    );
  }

  ownsUnit(unit: UnitWrapper) {
    return unit.data.playerSlot === this.data.slot;
  }

  /**
   * some COs use the movement factors of different weather
   * depending on the current weather (and their powers).
   * e.g.: olaf has clear weather cost during snow.
   *
   * sturm is handled with a movementCost hook.
   */
  getWeatherSpecialMovement(): Weather {
    const weather = this.match.currentWeather;

    switch (this.data.co) {
      case "drake": {
        if (weather === "rain") {
          return "clear";
        }

        return weather;
      }
      case "olaf": {
        if (weather === "rain") {
          return "snow";
        } else if (weather === "snow") {
          return "clear";
        }

        return weather;
      }
      case "lash": {
        if (weather !== "snow" && this.data.COPowerState !== "no-power") {
          return "clear";
        }

        return weather;
      }
      default: {
        return weather;
      }
    }
  }

  addUnwrappedUnit(rawUnit: Omit<UnitWithVisibleStats, "playerSlot">) {
    this.match.units.data.push(
      new UnitWrapper(
        { ...rawUnit, playerSlot: this.data.slot } as UnitWithVisibleStats,
        this.match
      )
    );
  }
}
