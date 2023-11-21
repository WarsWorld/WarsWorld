import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { COPropertiesMap } from "shared/match-logic/co";
import type {
  COHookAllowReturnUndefined,
  COHookPlayerProps,
  COHookWithDefenderAllowReturnUndefined,
} from "shared/match-logic/co-hooks";
import { type Position } from "shared/schemas/position";
import type { UnitType } from "shared/schemas/unit";
import type { PlayerInMatch } from "shared/types/server-match-state";
import type { MatchWrapper } from "./match";
import type { UnitWrapper } from "./unit";
import { Vision } from "./vision";
import { UnitsWrapper } from "./units";

export class PlayerInMatchWrapper {
  constructor(public data: PlayerInMatch, public match: MatchWrapper) {}

  getCOHookPlayerProps(unitPosition: Position): COHookPlayerProps {
    const attackingUnit = this.match.units.getUnitOrThrow(unitPosition);

    return {
      player: this,
      unitFacility: unitPropertiesMap[attackingUnit.data.type].facility,
      tileType:
        this.match.map.data.tiles[unitPosition[0]][unitPosition[1]].type,
      unitType: attackingUnit.data.type,
    };
  }

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

  isTilePassable(position: Position) {
    // if tile has pipe seam or something?
    // what other obstructions are there?
    return !this.getEnemyUnits().hasUnit(position);
  }

  private getMergedCOHooks() {
    const COProperties = COPropertiesMap[this.data.co];

    const d2dHooks = COProperties.dayToDay?.hooks ?? {};
    const COPHooks = COProperties.powers.COPower?.hooks ?? {};
    const SCOPHooks = COProperties.powers.superCOPower?.hooks ?? {};

    switch (this.data.COPowerState) {
      case "no-power":
        return d2dHooks;
      case "co-power":
        return { ...d2dHooks, ...COPHooks };
      case "super-co-power":
        return { ...d2dHooks, ...SCOPHooks };
    }
  }

  /**
   * The CO definitions use `COHooksAllowReturnUndefined`
   * which is a Partial and also allows returning... well `undefined`.
   * This function will both "fill up" all the gaps for undefined hooks
   * as well as return the input value when the hook returned `undefined` (= no changes).
   */
  getCOHooksWithUnit(unitPosition: Position) {
    const COHooks = this.getMergedCOHooks();
    const props = this.match.getCOHookPropsWithUnit(unitPosition);

    const withDefaults = (hook?: COHookAllowReturnUndefined) => {
      return (val: number) => hook?.(val, props) ?? val;
    };

    return {
      onMovementRange: withDefaults(COHooks.onMovementRange),
      onMovementCost: withDefaults(COHooks.onMovementCost),
      onBuildCost: withDefaults(COHooks.onBuildCost),
      onFuelDrain: withDefaults(COHooks.onFuelDrain),
      onFuelCost: withDefaults(COHooks.onFuelCost),
      onCapture: withDefaults(COHooks.onCapture),
      onVision: withDefaults(COHooks.onVision),
    };
  }

  getCOHooksWithDefender(
    attackerPosition: Position,
    defenderPosition: Position /** TODO maybe pass players or slots instead instead of positions */
  ) {
    const COHooks = this.getMergedCOHooks();
    const props = this.match.getCOHookPropsWithDefender(
      attackerPosition,
      defenderPosition
    );

    const withDefaults = (hook?: COHookWithDefenderAllowReturnUndefined) => {
      return (val: number) => hook?.(val, props) ?? val;
    };

    return {
      ...this.getCOHooksWithUnit(attackerPosition),
      onAttackModifier: withDefaults(COHooks.onAttackModifier),
      onDefenseModifier: withDefaults(COHooks.onDefenseModifier),
      onGoodLuck: withDefaults(COHooks.onGoodLuck),
      onBadLuck: withDefaults(COHooks.onBadLuck),
      onTerrainStars: withDefaults(COHooks.onTerrainStars),
      onAttackRange: withDefaults(COHooks.onAttackRange),
    };
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

    return this.getEnemyUnits().data.filter((enemy) => {
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
}
