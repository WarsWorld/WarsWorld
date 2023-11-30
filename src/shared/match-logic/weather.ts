import type { Weather } from "shared/schemas/weather";
import type { MatchWrapper } from "shared/wrappers/match";

function getBaseChanceOfRainOrSnow(match: MatchWrapper): number {
  switch (match.getAllPlayers().length) {
    case 2:
      return 4;
    case 3:
      return 3;
    default:
      return 2;
  }
}

function getChanceOfRain(match: MatchWrapper) {
  const numberOfDrakes = match
    .getAllPlayers()
    .filter((p) => p.data.coId.name === "drake").length;

  return getBaseChanceOfRainOrSnow(match) + numberOfDrakes * 7;
}

/**
 * TODO we don't handle sandstorm yet.
 * do we ever even want to..?
 */
export function getRandomWeather(match: MatchWrapper): Weather {
  const roll = Math.random() * 100;

  const snowThreshold = getBaseChanceOfRainOrSnow(match);
  const rainThreshold = getChanceOfRain(match) + snowThreshold;

  if (roll < snowThreshold) {
    return "snow";
  }

  if (roll < rainThreshold) {
    return "rain";
  }

  return "clear";
}
