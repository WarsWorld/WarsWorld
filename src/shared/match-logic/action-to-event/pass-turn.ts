import type { MainActionToEvent } from "server/routers/action";
import type { PassTurnAction } from "shared/schemas/action";

export const passTurnActionToEvent: MainActionToEvent<PassTurnAction> = (
  match
) => {
  /**
   * Things that probably need to be done here (ordered by best effort)
   *
   * - day limit tracking if the turns have looped back around (= "next day") and maybe ending the match
   * - (done) unwait all current player units
   * - (done) disable other player CO powers
   * - random weather or d2d weather influence
   * - (done) active power weather removal
   * - (done) funds
   * - repairs
   * - refuel (property + apc/blackboat)
   * - fuel drain
   */

  const lastTurnPlayer = match.players.getCurrentTurnPlayer();
  lastTurnPlayer.getUnits().data.forEach((u) => {
    u.data.isReady = true;
  });

  lastTurnPlayer.data.hasCurrentTurn = false;

  const nextTurnPlayer = lastTurnPlayer.getNextAlivePlayer();

  if (nextTurnPlayer === undefined) {
    throw new Error("No next alive player");
  }

  nextTurnPlayer.data.hasCurrentTurn = true;
  nextTurnPlayer.data.COPowerState = "no-power";

  if (
    match.playerToRemoveWeatherEffect?.data.slot === nextTurnPlayer.data.slot
  ) {
    match.currentWeather =
      "clear"; /* TODO random / custom weather  and d2d effects */
  }

  nextTurnPlayer.gainFunds();

  for (const unit of nextTurnPlayer.getUnits().data) {
    const tile = unit.getTile();

    // TODO if is property and is owned by us then repair with special effects
    // i think kindle repairs 3HP or something?

    // if on owned suitable property or apc/blackboat neighbour then refuel

    // fuel drain
  }

  return { type: "passTurn" };
};
