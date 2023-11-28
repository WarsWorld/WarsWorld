import { getCOProperties } from "shared/match-logic/co";
import type { Hooks } from "shared/match-logic/co-hooks";
import { isHiddenTile } from "shared/match-logic/terrain";
import type {
  UnitWithHiddenStats,
  UnitWithVisibleStats
} from "shared/schemas/unit";
import type { Weather } from "shared/schemas/weather";
import type {
  CapturableTile,
  PlayerInMatch
} from "shared/types/server-match-state";
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
    const COProperties = getCOProperties(this.data.co);

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
      const player = this.match.players.getBySlot(i);

      if (player?.data.eliminated === true) {
        return player;
      }
    }

    return null;
  }

  getEnemyUnitsInVision() {
    const vision = this.match.rules.fogOfWar ? new Vision(this) : null;

    return this.getEnemyUnits()
      .data.filter((enemy) => {
        // sub or stealth ability
        const isHiddenThroughAbility =
          "hidden" in enemy.data && enemy.data.hidden;

        /**
         * TODO -_-
         * for when we have the data/properties for different match versions (AW1/2/DS)
         *
         * Enigami — Today at 02:14
         * AWDS behavior: subs/stealths are revealed if they are on properties you own
         * AW2 behavior: subs are revealed if they are on ports you own
         *
         */

        if (isHiddenThroughAbility) {
          return enemy.getNeighbouringUnits().some((unit) => this.owns(unit));
        }

        if (vision === null) {
          return true;
        }

        const tile = enemy.getTileOrThrow();

        if ("ownerSlot" in tile && this.owns(tile)) {
          return true;
        }

        const activeSonjaPower =
          this.data.co === "sonja" && this.data.COPowerState !== "no-power";

        if (isHiddenTile(tile) && !activeSonjaPower) {
          return enemy.getNeighbouringUnits().some((unit) => this.owns(unit));
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

    if (this.data.co === "sasha") {
      fundsPerProperty += 100;
    }

    this.data.funds += numberOfFundsGivingProperties * fundsPerProperty;
  }

  getPowerStarCost() {
    return 9000 * (1 + 0.2 * Math.min(this.data.timesPowerUsed, 10));
  }

  getMaxPowerMeter() {
    const COPowers = getCOProperties(this.data.co).powers;

    if (COPowers.superCOPower !== undefined) {
      return COPowers.superCOPower.stars * this.getPowerStarCost();
    }
    else if (COPowers.COPower !== undefined) {
      return COPowers.COPower.stars * this.getPowerStarCost();
    }

    return 0;
  }

  increasePowerMeter(amount: number) {
    if (this.data.COPowerState !== "no-power") {
      return;
    }

    //max is because it accounts for negative increments (aka Sasha's COP)
    this.data.powerMeter = Math.max(0, Math.min(
      this.data.powerMeter + amount,
      this.getMaxPowerMeter()
    ));
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
    const unit = new UnitWrapper(
      { ...rawUnit, playerSlot: this.data.slot } as UnitWithVisibleStats,
      this.match
    );

    this.match.units.data.push(unit);

    return unit;
  }
}
