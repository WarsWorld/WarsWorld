import type { PassTurnEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { UnitWrapper } from "shared/wrappers/unit";
import { consumeFuelAndCrash } from "./passTurn/consumeFuelAndCrash";
import { gainFunds } from "./passTurn/gainFunds";
import { propertyRepairAndResupply } from "./passTurn/propertyRepairAndResupply";
import { updateWeather } from "./passTurn/updateWeather";

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
   * - (done) fuel drain
   * - (done) refuel (property + apc/blackboat)
   */

  const lastTurnPlayer = match.getCurrentTurnPlayer();

  unwaitUnits(lastTurnPlayer);

  lastTurnPlayer.data.hasCurrentTurn = false;

  const nextTurnPlayer = lastTurnPlayer.getNextAlivePlayer();

  if (nextTurnPlayer === null) {
    throw new Error("No next alive player");
  }

  nextTurnPlayer.data.hasCurrentTurn = true;
  nextTurnPlayer.data.COPowerState = "no-power";

  updateWeather(nextTurnPlayer);
  gainFunds(nextTurnPlayer);

  // update units
  for (const unit of nextTurnPlayer.getUnits()) {
    consumeFuelAndCrash(unit);
    APCresupply(unit);
    propertyRepairAndResupply(unit);
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
