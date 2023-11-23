import type { PassTurnEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";

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
   * - repairs
   * - refuel (property + apc/blackboat)
   * - fuel drain
   *      if (eagle) {
  *         if (currentPlayerData.unitFacility === "airport") {
              return fuelDrain - 2;
            }
   *      }
   */

  const lastTurnPlayer = match.players.getCurrentTurnPlayer();
  lastTurnPlayer.getUnits().data.forEach((u) => {
    u.data.isReady = true;
  });

  lastTurnPlayer.data.hasCurrentTurn = false;

  const nextTurnPlayer = lastTurnPlayer.getNextAlivePlayer();

  if (nextTurnPlayer === null) {
    throw new Error("No next alive player");
  }

  nextTurnPlayer.data.hasCurrentTurn = true;
  nextTurnPlayer.data.COPowerState = "no-power";

  if (
    match.playerToRemoveWeatherEffect?.data.slot === nextTurnPlayer.data.slot
  ) {
    // after non-clear weather, clear weather is always forced for at least one turn
    // (no random weather on the turn we're passing to, unless that player uses a power)
    match.currentWeather = "clear";
  }

  nextTurnPlayer.gainFunds();

  for (const unit of nextTurnPlayer.getUnits().data) {
    const tile = unit.getTileOrThrow();

    // TODO if is property and is owned by us then repair with special effects
    // i think kindle repairs 3HP or something?

    // if on owned suitable property or apc/blackboat neighbour then refuel

    // fuel drain
  }
};
