import type { Turn } from "server/engine/types/events";
import type { PlayerInMatchWrapper } from "server/engine/entities/player-in-match";

export function updateWeather(
  nextTurnPlayer: PlayerInMatchWrapper,
  newWeather: Turn["newWeather"],
  newWeatherDays: Turn["newWeatherDays"] = 1,
) {
  const { match } = nextTurnPlayer;

  if (newWeather !== null) {
    // TODO maybe this gets the previous player instead of next turn player
    //  but if it's the case, i think we should change current turn player before doing all these updates
    match.setWeather(newWeather, newWeatherDays);
    return;
  }

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
