import type { PassTurnEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import { getVisualHPfromHP } from "../../calculate-damage";
import { getRandomWeather } from "../../weather";

export const applyPassTurnEvent = (
  match: MatchWrapper,
  _event: PassTurnEvent
) => {
  /**
   * Things that probably need to be done here (ordered by best effort)
   *
   * - day limit tracking if the turns have looped back around (= "next day") and maybe ending the match
   * - (done) unwait all current player units
   * - (done) disable other player CO powers
   * - random weather or d2d weather influence (use getRandomWeather!!)
   * - (done) active power weather removal
   * - (done) funds
   * - (done) repairs
   * - (done) refuel (property + apc/blackboat)
   * - (done) fuel drain
   */

  const lastTurnPlayer = match.getCurrentTurnPlayer();

  lastTurnPlayer.getUnits().forEach((u) => {
    u.data.isReady = true;
  });

  lastTurnPlayer.data.hasCurrentTurn = false;

  const nextTurnPlayer = lastTurnPlayer.getNextAlivePlayer();

  if (nextTurnPlayer === null) {
    throw new Error("No next alive player");
  }

  nextTurnPlayer.data.hasCurrentTurn = true;
  nextTurnPlayer.data.COPowerState = "no-power";

  // update weather
  // TODO wip, i think player -1 should be playing the game as first player,
  //  and be responsible to set weather at the start of each day (day = turn cycle)
  if (match.playerToRemoveWeatherEffect === null) {
    if (match.rules.weatherSetting === "random") {
      match.currentWeather = getRandomWeather(match);
    }
  }
  else if (match.playerToRemoveWeatherEffect.data.slot === nextTurnPlayer.data.slot) {
    // the weather days left is for olaf awds, since his powers cause snow for TWO days
    --match.weatherDaysLeft;

    if (match.weatherDaysLeft <= 0) {
      // after non-clear weather, clear weather is always forced for at least one turn
      // (no random weather on the turn we're passing to, unless that player uses a power)
      match.currentWeather = "clear";
      match.playerToRemoveWeatherEffect = null;
    }
  }

  { // gain funds
    let numberOfFundsGivingProperties = 0;

    for (const tile of match.changeableTiles) {
      if (!("ownerSlot" in tile)) {
        // is non-ownable changeable tile, like a pipe seam or missile silo etc.
        continue;
      }

      if (tile.type === "lab" || tile.type === "commtower") {
        continue;
      }

      if (nextTurnPlayer.owns(tile)) {
        numberOfFundsGivingProperties++;
      }
    }

    let { fundsPerProperty } = match.rules;

    if (nextTurnPlayer.data.coId.name === "sasha") {
      fundsPerProperty += 100;
    }

    nextTurnPlayer.data.funds += numberOfFundsGivingProperties * fundsPerProperty;
  }

  // update units
  for (const unit of nextTurnPlayer.getUnits()) {

    { // consume fuel
      let fuelConsumed = 0;

      if (unit.properties().facility === "airport") {
        fuelConsumed = 5;

        if (unit.data.type === "transportCopter" || unit.data.type === "battleCopter") {
          fuelConsumed = 2;
        } else if ("hidden" in unit.data && unit.data.hidden) { // hidden stealth
          fuelConsumed = 8;
        }

        if (unit.player.data.coId.name === "eagle") {
          fuelConsumed -= 2;
        }
      } else if (unit.properties().facility === "port") {
        fuelConsumed = 1;

        if ("hidden" in unit.data && unit.data.hidden) { // hidden sub
          fuelConsumed = 5;
        }
      }

      if (fuelConsumed !== 0) {
        unit.drainFuel(fuelConsumed);
      }

      if (unit.properties().facility !== "base" && unit.getFuel() <= 0) {
        // unit crashes
        // (has to be done here cause eagle copters consume 0 fuel per turn, but still crash if they start turn at 0 fuel)
        unit.remove();
      }
    }

    // resupply own neighbour units if apc
    if (unit.data.type === "apc") {
      for (const neighbourUnit of unit.getNeighbouringUnits()) {
        if (neighbourUnit.data.playerSlot === unit.data.playerSlot) {
          neighbourUnit.resupply();
        }
      }
    }

    { // heal and resupply if on top of appropriate facility
      const tile = unit.getTile();

      // TODO is this correct? comparing Facility with Tile type
      const isInRepairFacility = unit.properties().facility === tile.type ||
        (unit.properties().facility === "base" && (tile.type === "city" || tile.type === "hq"));

      if ("ownerSlot" in tile && unit.player.owns(tile) && isInRepairFacility) {
        unit.resupply();

        // rachel d2d repairs +1
        const repairAmount = (unit.player.data.coId.name == "rachel") ? 3 : 2;

        //heal for free if visual hp is 10
        if (getVisualHPfromHP(unit.getVisualHP()) === 10) {
          unit.heal(10 * repairAmount);
        } else {
          //check if enough funds for heal, and heal if it's the case
          const oneHpRepairCost = unit.getBuildCost() / 10;

          if (oneHpRepairCost * repairAmount <= unit.player.data.funds) {
            unit.heal(10 * repairAmount);
            unit.player.data.funds -= oneHpRepairCost * repairAmount;
          } else {
            // if not enough funds to repair the total amount, repair as much as possible
            const visualHpRepairPossible = Math.floor(unit.player.data.funds / oneHpRepairCost);
            unit.heal(10 * visualHpRepairPossible);
            unit.player.data.funds -= oneHpRepairCost * visualHpRepairPossible;
          }
        }
      }
    }
  }
};
