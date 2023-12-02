import type { Weather } from "shared/schemas/weather";
import type { MatchWrapper } from "shared/wrappers/match";

// chance of random weather when starting a turn depends on the amount of
// players present in the match
function weatherBaseChance(match: MatchWrapper): number {
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
  //AWDS Drake doesn't increase weather chances
  const numberOfDrakes = match
    .getAllPlayers()
    .filter((p) => (p.data.coId.name === "drake" && p.data.coId.version !== "AWDS")).length;

  return weatherBaseChance(match) + numberOfDrakes * 7;
}

export function getRandomWeather(match: MatchWrapper): Weather {
  const roll = Math.random() * 100;

  // Of 100 "numbers", some of them are assigned to rain, others to snow,
  // others to sandstorm (if game version is AWDS), and the remaining to clear
  const snowThreshold = weatherBaseChance(match);
  const rainThreshold = getChanceOfRain(match) + snowThreshold;
  const sandstormThreshold =
    (match.rules.gameVersion === "AWDS" ? weatherBaseChance(match) : 0)
    + rainThreshold;

  if (roll < snowThreshold) {
    return "snow";
  }

  if (roll < rainThreshold) {
    return "rain";
  }

  if (roll < sandstormThreshold) {
    return "sandstorm";
  }

  return "clear";
}
