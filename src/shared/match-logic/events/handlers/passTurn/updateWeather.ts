import { getRandomWeather } from "shared/match-logic/weather";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";

export function updateWeather(nextTurnPlayer: PlayerInMatchWrapper) {
  const { match } = nextTurnPlayer;

  // TODO wip, i think player -1 should be playing the game as first player,
  //  and be responsible to set weather at the start of each day (day = turn cycle)
  if (match.playerToRemoveWeatherEffect === null) {
    if (match.rules.weatherSetting === "random") {
      match.currentWeather = getRandomWeather(match);
    }
  } else if (
    match.playerToRemoveWeatherEffect.data.slot === nextTurnPlayer.data.slot
  ) {
    // the weather days left is for olaf awds, since his powers cause snow for TWO days
    match.weatherDaysLeft--;

    if (match.weatherDaysLeft <= 0) {
      // after non-clear weather, clear weather is always forced for at least one turn
      // (no random weather on the turn we're passing to, unless that player uses a power)
      match.currentWeather = "clear";
      match.playerToRemoveWeatherEffect = null;
    }
  }
}
