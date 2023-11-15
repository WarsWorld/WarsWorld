import { Position } from "server/schemas/position";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { COPropertiesMap } from "shared/match-logic/co";
import {
  COHookAllowReturnUndefined,
  COHookPlayerProps,
  COHookWithDefenderAllowReturnUndefined,
} from "shared/match-logic/co-hooks";
import { PlayerInMatch } from "shared/types/server-match-state";
import { MatchWrapper } from "./match";
import { WWUnit } from "server/schemas/unit";

export class PlayerInMatchWrapper {
  constructor(public data: PlayerInMatch, public match: MatchWrapper) {}

  getCOHookPlayerProps(unitPosition: Position): COHookPlayerProps {
    const attackingUnit = this.match.units.getUnitOrThrow(unitPosition);

    return {
      player: this,
      unitFacility: unitPropertiesMap[attackingUnit.type].facility,
      tileType:
        this.match.map.data.tiles[unitPosition[0]][unitPosition[1]].type,
      unitType: attackingUnit.type,
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
    return this.match.units.getPlayerUnits(this.data.slot);
  }

  getEnemyUnits() {
    return this.match.units.getEnemyUnits(this.data.slot);
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
  getCOHooks(unitPosition: Position) {
    const COHooks = this.getMergedCOHooks();
    const props = this.match.getCOHookProps(unitPosition);

    const withDefaults = (hook?: COHookAllowReturnUndefined) => {
      return (val: number) => hook?.(val, props) ?? val;
    };

    return {
      onMovementRange: withDefaults(COHooks.onMovementRange),
      onMovementCost: withDefaults(COHooks.onMovementCost),
      onCost: withDefaults(COHooks.onCost),
      onFuelDrain: withDefaults(COHooks.onFuelDrain),
      onFuelCost: withDefaults(COHooks.onFuelCost),
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
      ...this.getCOHooks(attackerPosition),
      onAttackModifier: withDefaults(COHooks.onAttackModifier),
      onDefenseModifier: withDefaults(COHooks.onDefenseModifier),
      onGoodLuck: withDefaults(COHooks.onGoodLuck),
      onBadLuck: withDefaults(COHooks.onBadLuck),
      onTerrainStars: withDefaults(COHooks.onTerrainStars),
      onAttackRange: withDefaults(COHooks.onAttackRange),
    };
  }

  getMovementPoints(unit: WWUnit) {
    const unitProperties = unitPropertiesMap[unit.type];
    const baseMovement = unitProperties.moveRange;

    const movement = this.getCOHooks(unit.position).onMovementRange(
      baseMovement
    );

    return Math.min(movement, unit.stats.fuel); /** TODO checking fuel twice? */
  }
}