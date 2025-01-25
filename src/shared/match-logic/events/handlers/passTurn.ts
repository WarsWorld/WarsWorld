import { getRandomWeather } from "shared/match-logic/weather";
import type { PassTurnAction } from "shared/schemas/action";
import type { PassTurnEvent, Turn } from "shared/types/events";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { UnitWrapper } from "shared/wrappers/unit";
import type { ApplyEvent, MainActionToEvent } from "../handler-types";
import { getTurnFuelConsumption } from "./passTurn/consumeFuelAndCrash";
import { propertyRepairAndResupply } from "./passTurn/propertyRepairAndResupply";
import { updateWeather } from "./passTurn/updateWeather";

function getNewWeather(nextTurnPlayer: PlayerInMatchWrapper): Turn["newWeather"] {
  const { match } = nextTurnPlayer;

  if (match.playerToRemoveWeatherEffect !== null) {
    if (
      match.playerToRemoveWeatherEffect.data.slot === nextTurnPlayer.data.slot &&
      match.weatherDaysLeft - 1 <= 0
    ) {
      // after non-clear weather, clear weather is always forced for at least one turn
      // (no random weather on the turn we're passing to, unless that player uses a power)
      return "clear";
    }

    // weather stays the same when there's a "playerToRemoveWeatherEffect" and it's not clearing
    return null;
  }

  if (match.rules.weatherSetting === "random") {
    return getRandomWeather(match);
  }

  return null;
}

export const passTurnActionToEvent: MainActionToEvent<PassTurnAction> = (match, action) => {
  const turns: Turn[] = [];

  turnLoop: while (true) {
    const nextTurnPlayer = match.getCurrentTurnPlayer().getNextAlivePlayer();

    if (nextTurnPlayer === null) {
      throw new Error("No next alive player");
    }

    unitLoop: for (const unit of nextTurnPlayer.getUnits()) {
      if (unit.properties.facility === "base") {
        // land units can't crash
        continue unitLoop;
      }

      const tile = unit.getTile();

      const isInRepairFacility = unit.properties.facility === tile.type;

      // if units are on top of a repair property, they can't crash
      if (!isInRepairFacility || !unit.player.owns(tile)) {
        const fuelConsumption = getTurnFuelConsumption(unit);
        const fuelAfterConsumption = unit.getFuel() - fuelConsumption;
        const willCrash = fuelAfterConsumption <= 0;

        if (willCrash && nextTurnPlayer.getUnits().length === 0) {
          // i'm pretty sure even on a turn where a player gets eliminated due to crashing
          // the game still generates a random weather first and sets it if applicable.
          turns.push({
            newWeather: getNewWeather(nextTurnPlayer),
            eliminationReason: "all-units-crashed",
          });

          const singleTeamAlive =
            match.teams.filter((t) => t.players.some((p) => p.data.eliminated !== false)).length <=
            1;

          if (singleTeamAlive) {
            break turnLoop; // TODO not quite sure what should happen then. some MatchEndEvent logic i guess. maybe another field on PassTurnEvent?
          }

          continue turnLoop;
        }
      }
    }

    turns.push({ newWeather: getNewWeather(nextTurnPlayer) });
    break turnLoop;
  }

  return {
    ...action,
    turns,
  };
};

export const applyPassTurnEvent: ApplyEvent<PassTurnEvent> = (match, event) => {
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
   * - (done) fuel drain
   * - (done) refuel (property + apc/blackboat)
   */

  for (const turn of event.turns) {
    // TODO when we pass multiple turns, getCurrentTurnPlayer relies on the just eliminated / previous player still having a turn
    // i'm just marking this in case this doesn't work as planned.
    const lastTurnPlayer = match.getCurrentTurnPlayer();

    unwaitUnits(lastTurnPlayer);

    lastTurnPlayer.data.hasCurrentTurn = false;

    const nextTurnPlayer = lastTurnPlayer.getNextAlivePlayer();

    if (nextTurnPlayer === null) {
      throw new Error("No next alive player");
    }

    nextTurnPlayer.data.hasCurrentTurn = true;
    nextTurnPlayer.data.COPowerState = "no-power";

    updateWeather(nextTurnPlayer, turn.newWeather);
    nextTurnPlayer.data.funds += nextTurnPlayer.getFundsPerTurn();

    // update units
    for (const unit of nextTurnPlayer.getUnits()) {
      const tile = unit.getTile();

      const isInRepairFacility =
        unit.properties.facility === tile.type ||
        (unit.properties.facility === "base" && (tile.type === "city" || tile.type === "hq"));

      // if units are on top of a repair property, they can't crash
      if (isInRepairFacility && unit.player.owns(tile)) {
        propertyRepairAndResupply(unit);
      } else {
        const fuelConsumed = getTurnFuelConsumption(unit);
        unit.drainFuel(fuelConsumed);

        if (unit.properties.facility !== "base" && unit.getFuel() <= 0) {
          // unit crashes
          // (has to be done here cause eagle copters consume 0 fuel per turn, but still crash if they start turn at 0 fuel)
          unit.remove();
        }
      }

      APCresupply(unit);
    }
  }

  for (const team of match.teams) {
    // TODO improve this. maybe later. not prioritary
    team.vision?.recalculateVision(team.getUnits());
  }
};

function unwaitUnits(player: PlayerInMatchWrapper) {
  for (const unit of player.getUnits()) {
    unit.data.isReady = true;
  }
}

function APCresupply(unit: UnitWrapper) {
  if (unit.data.type === "apc") {
    for (const neighbourUnit of unit.getNeighbouringUnits()) {
      if (unit.player.owns(neighbourUnit)) {
        neighbourUnit.resupply();
      }
    }
  }
}
