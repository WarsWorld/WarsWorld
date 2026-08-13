import type { MatchStartEvent } from "server/engine/types/events";
import type { MatchWrapper } from "server/engine/entities/match";

export function createMatchStartEvent(match: MatchWrapper): MatchStartEvent {
  return {
    type: "matchStart",
    // random weather starts clear (rolled per turn once play begins); a fixed setting starts on it
    weather: match.rules.weatherSetting === "random" ? "clear" : match.rules.weatherSetting,
  };
}

/**
 * Apply the start of a match: grant the starting player their first turn's income (every other
 * player gets theirs when their own turn begins, in `applyPassTurnEvent`).
 *
 * This runs both live (once, when all players ready up) and on server rebuild (replaying the stored
 * matchStart event), so day-1 income must live here rather than being baked into the persisted
 * player snapshot — otherwise a rebuild would replay it on top of the snapshot and grant it twice.
 */
export function applyMatchStartEvent(match: MatchWrapper, event: MatchStartEvent) {
  const startingPlayer = match.getCurrentTurnPlayer();
  startingPlayer.data.funds += startingPlayer.getFundsPerTurn();
  match.setInitialWeather(event.weather);
}
