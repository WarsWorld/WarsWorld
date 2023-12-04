import { getCOProperties } from "shared/match-logic/co";
import type { Hooks } from "shared/match-logic/co-hooks";
import type { Tile } from "shared/schemas/tile";
import type {
  UnitWithVisibleStats
} from "shared/schemas/unit";
import type { Weather } from "shared/schemas/weather";
import type {
  ChangeableTile,
  PlayerInMatch
} from "shared/types/server-match-state";
import type { MatchWrapper } from "./match";
import type { TeamWrapper } from "./team";
import { UnitWrapper } from "./unit";
import { versionPropertiesMap } from "../match-logic/game-constants/version-properties";

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
        cur.type === "commtower" && cur.playerSlot === this.data.slot
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

  getVersionProperties() {
    if (this.match.rules.gameVersion === undefined) {
      return versionPropertiesMap[this.data.coId.version];
    }

    return versionPropertiesMap[this.match.rules.gameVersion];
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

  getPowerStarCost() {
    const versionProperties = this.getVersionProperties();
    return versionProperties.baseStarValue * (1 + versionProperties.powerMeterScaling * Math.min(this.data.timesPowerUsed, 10));
  }

  getMaxPowerMeter() {
    const COPowers = getCOProperties(this.data.coId).powers;

    if (COPowers.superCOPower !== undefined) {
      return COPowers.superCOPower.stars * this.getPowerStarCost();
    }

    if (COPowers.COPower !== undefined) {
      return COPowers.COPower.stars * this.getPowerStarCost();
    }

    return 0;
  }

  gainPowerCharge(value: number) {
    if (this.data.COPowerState !== "no-power") {
      return;
    }

    this.data.powerMeter = Math.min(value, this.getMaxPowerMeter());
  }

  owns(tileOrUnit: Tile | ChangeableTile | UnitWrapper) {
    if ("playerSlot" in tileOrUnit) {
      return tileOrUnit.playerSlot === this.data.slot;
    }

    return false;
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
