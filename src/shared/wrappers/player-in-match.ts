import { getCOProperties } from "shared/match-logic/co";
import type { Hooks } from "shared/match-logic/co-hooks";
import type {
  UnitWithVisibleStats
} from "shared/schemas/unit";
import type { Weather } from "shared/schemas/weather";
import type {
  CapturableTile,
  PlayerInMatch
} from "shared/types/server-match-state";
import { clamp } from "shared/utils/clamp";
import type { MatchWrapper } from "./match";
import type { TeamWrapper } from "./team";
import { UnitWrapper } from "./unit";

export class PlayerInMatchWrapper {
  public match: MatchWrapper;

  constructor(public data: PlayerInMatch, public team: TeamWrapper) {
    this.match = team.match;
  }

  /**
   * returns amount of commtowers owned * 10 (since 1 commtower gives 10% attack boost)
   */
  getCommtowerAttackBoost() {
    return 10 * this.match.changeableTiles.reduce(
      (prev, cur) =>
        cur.type === "commtower" && cur.ownerSlot === this.data.slot
          ? prev + 1
          : prev,
      0
    );
  }

  getUnits() {
    return this.match.units.filter((u) => u.data.playerSlot === this.data.slot)
  }

  getHook<HookType extends keyof Hooks>(hookType: HookType) {
    const COProperties = getCOProperties(this.data.coId);

    switch (this.data.COPowerState) {
      case "no-power":
        return COProperties.dayToDay?.hooks[hookType];
      case "co-power":
        return COProperties.powers.COPower?.hooks?.[hookType];
      case "super-co-power":
        return COProperties.powers.superCOPower?.hooks?.[hookType];
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
      const player = this.match.getBySlot(i);

      if (player?.data.eliminated === true) {
        return player;
      }
    }

    return null;
  }

  gainFunds() {
    let numberOfFundsGivingProperties = 0;

    for (const tile of this.match.changeableTiles) {
      if (!("ownerSlot" in tile)) {
        // is non-ownable changeable tile, like a pipe seam or missile silo etc.
        continue;
      }

      if (tile.type === "lab" || tile.type === "commtower") {
        continue;
      }

      if (this.owns(tile)) {
        numberOfFundsGivingProperties++;
      }
    }

    let { fundsPerProperty } = this.match.rules;

    if (this.data.coId.name === "sasha") {
      fundsPerProperty += 100;
    }

    this.data.funds += numberOfFundsGivingProperties * fundsPerProperty;
  }

  getPowerStarCost() {
    return 9000 * (1 + 0.2 * Math.min(this.data.timesPowerUsed, 10));
  }

  getMaxPowerMeter() {
    const COPowers = getCOProperties(this.data.coId).powers;

    if (COPowers.superCOPower !== undefined) {
      return COPowers.superCOPower.stars * this.getPowerStarCost();
    } else if (COPowers.COPower !== undefined) {
      return COPowers.COPower.stars * this.getPowerStarCost();
    }

    return 0;
  }

  setPowerMeter(value: number) {
    if (this.data.COPowerState !== "no-power") {
      return;
    }

    this.data.powerMeter = clamp(value, 0, this.getMaxPowerMeter());
  }

  owns(capturableTileOrUnit: CapturableTile | UnitWrapper) {
    if ("ownerSlot" in capturableTileOrUnit) {
      return capturableTileOrUnit.ownerSlot === this.data.slot;
    }

    return capturableTileOrUnit.data.playerSlot === this.data.slot;
  }

  /**
   * some COs use the movement factors of different weather
   * depending on the current weather (and their powers).
   * e.g.: olaf has clear weather cost during snow.
   *
   * sturm is handled with a movementCost hook.
   *
   * TODO: if this method continues to be only used once, it's a candidate
   * to be moved outside this class.
   */
  getWeatherSpecialMovement(): Weather {
    const weather = this.match.currentWeather;

    switch (this.data.coId.name) {
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
    const unit = new UnitWrapper(
      { ...rawUnit, playerSlot: this.data.slot } as UnitWithVisibleStats,
      this.match
    );

    this.match.units.push(unit);

    return unit;
  }
}
