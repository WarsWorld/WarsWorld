import type { Weather } from "shared/schemas/weather";
import type { PlayersWrapper } from "shared/wrappers/players";

function getBaseChanceOfRainOrSnow(players: PlayersWrapper): number {
  switch (players.data.length) {
    case 2:
      return 4;
    case 3:
      return 3;
    default:
      return 2;
  }
}

function getChanceOfRain(players: PlayersWrapper) {
  const numberOfDrakes = players.data.filter(
    (p) => p.data.co === "drake"
  ).length;

  return getBaseChanceOfRainOrSnow(players) + numberOfDrakes * 7;
}

/**
 * TODO we don't handle sandstorm yet.
 * do we ever even want to..?
 */
export function getRandomWeather(players: PlayersWrapper): Weather {
  const roll = Math.random() * 100;

  const snowThreshold = getBaseChanceOfRainOrSnow(players);
  const rainThreshold = getChanceOfRain(players) + snowThreshold;

  if (roll < snowThreshold) {
    return "snow";
  }

  if (roll < rainThreshold) {
    return "rain";
  }

  return "clear";
}
