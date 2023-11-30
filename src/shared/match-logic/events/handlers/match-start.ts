import { getRandomWeather } from "shared/match-logic/weather";
import type { MatchStartEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";

export function createMatchStartEvent(match: MatchWrapper): MatchStartEvent {
  return {
    type: "match-start",
    weather:
      match.rules.weatherSetting === "random"
        ? getRandomWeather(match)
        : match.rules.weatherSetting,
  };
}
