import type { Turn } from "shared/types/events";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";

// TODO wip, i think player -1 should be playing the game as first player,
//  and be responsible to set weather at the start of each day (day = turn cycle)
// - Pau

export function updateWeather(
  nextTurnPlayer: PlayerInMatchWrapper,
  newWeather: Turn["newWeather"]
) {
  const { match } = nextTurnPlayer;

  match.currentWeather = newWeather ?? match.currentWeather;

  if (
    match.playerToRemoveWeatherEffect !== null &&
    match.playerToRemoveWeatherEffect.data.slot === nextTurnPlayer.data.slot
  ) {
    // the weather days left is for olaf awds, since his powers cause snow for TWO days
    match.weatherDaysLeft--;

    if (match.weatherDaysLeft <= 0) {
      match.playerToRemoveWeatherEffect = null;
    }
  }
}
