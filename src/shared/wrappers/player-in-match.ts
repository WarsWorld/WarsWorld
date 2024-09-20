import { getCOProperties } from "shared/match-logic/co";
import type { Hooks } from "shared/match-logic/co-hooks";
import type { PropertyTile, Tile } from "shared/schemas/tile";
import type { UnitWithVisibleStats } from "shared/schemas/unit";
import type { ChangeableTile, PlayerInMatch } from "shared/types/server-match-state";
import { versionPropertiesMap } from "../match-logic/game-constants/version-properties";
import type { MatchWrapper } from "./match";
import type { TeamWrapper } from "./team";
import { UnitWrapper } from "./unit";

//TODO: Band-aid fix from chatGPT, needs to be fixed down below

// Type guard to check if the object is a UnitWrapper
function isUnitWrapper(object: any): object is UnitWrapper {
  return "data" in object && "playerSlot" in object.data;
}

// Type guard to check if the object is a PropertyTile (or has playerSlot directly)
function isPropertyTile(object: any): object is PropertyTile {
  return "playerSlot" in object;
}

export class PlayerInMatchWrapper {
  public match: MatchWrapper;

  constructor(
    public data: PlayerInMatch,
    public team: TeamWrapper,
  ) {
    this.match = team.match;
  }

  /**
   * returns amount of commtowers owned * 10 (since 1 commtower gives 10% attack boost)
   */
  getCommtowerAttackBoost() {
    return (
      10 *
      this.match.changeableTiles.reduce(
        (prev, cur) =>
          cur.type === "commtower" && cur.playerSlot === this.data.slot ? prev + 1 : prev,
        0,
      )
    );
  }

  possessesLab() {
    return (
      this.match.changeableTiles.find(
        (tile) => tile.type === "lab" && tile.playerSlot === this.data.slot,
      ) !== undefined
    );
  }

  getUnits() {
    //TODO: If the match.units is undefined, this throws an error. The error kills usePlayers() which stops FrontEnd work.
    if (this.match.units !== undefined) {
      return this.match.units.filter((u) => u.data.playerSlot === this.data.slot);
    } else {
      return [];
    }
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
    const nextSlot = (n: number) => (n + 1) % this.match.map.data.numberOfPlayers;

    for (let i = nextSlot(this.data.slot); i !== this.data.slot; i = nextSlot(i)) {
      const player = this.match.getPlayerBySlot(i);

      //TODO: This should be false since if the player is NOT eliminated, then we return that player, right?
      if (player?.data.eliminated === false) {
        return player;
      }
    }

    return null;
  }

  getPowerStarCost() {
    const versionProperties = this.getVersionProperties();
    return (
      versionProperties.baseStarValue *
      (1 + versionProperties.powerMeterScaling * Math.min(this.data.timesPowerUsed, 10))
    );
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

  //TODO: Band aid fix applied here
  owns(tileOrUnit: Tile | ChangeableTile | UnitWrapper): boolean {

    // If it's a UnitWrapper, the playerSlot is under tileOrUnit.data
    if (isUnitWrapper(tileOrUnit)) {
      return tileOrUnit.data.playerSlot === this.data.slot;
    }

    // If it's a PropertyTile, playerSlot is directly on the object
    if (isPropertyTile(tileOrUnit)) {
      return tileOrUnit.playerSlot === this.data.slot;
    }

    // If none of the conditions match, return false
    return false;
  }

  addUnwrappedUnit(rawUnit: Omit<UnitWithVisibleStats, "playerSlot">) {
    const unit = new UnitWrapper(
      { ...rawUnit, playerSlot: this.data.slot } as UnitWithVisibleStats,
      this.match,
    );

    this.match.units.push(unit);

    this.team.vision?.addUnitVision(unit);

    return unit;
  }
}
