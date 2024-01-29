import type { Weather } from "shared/schemas/weather";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "../wrappers/player-in-match";

/**
 * chance of random weather when starting a turn depends on the amount of
 * players present in the match
 */
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
    .filter((p) => p.data.coId.name === "drake" && p.data.coId.version !== "AWDS").length;

  return weatherBaseChance(match) + numberOfDrakes * 7;
}

export function getRandomWeather(match: MatchWrapper): Weather {
  const roll = Math.random() * 100;

  // Of 100 "numbers", some of them are assigned to rain, others to snow,
  // others to sandstorm (if game version is AWDS), and the remaining to clear
  const snowThreshold = weatherBaseChance(match);
  const rainThreshold = getChanceOfRain(match) + snowThreshold;
  const sandstormThreshold =
    (match.rules.gameVersion === "AWDS" ? weatherBaseChance(match) : 0) + rainThreshold;

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

/**
 * some COs use the movement factors of different weather
 * depending on the current weather (and their powers).
 * e.g.: olaf has clear weather cost during snow.
 *
 * sturm and lash are handled with a movementCost hook.
 */
export const getWeatherSpecialMovement = (player: PlayerInMatchWrapper): Weather => {
  const weather = player.match.getCurrentWeather();

  switch (player.data.coId.name) {
    case "drake": {
      if (weather === "rain") {
        return "clear";
      }

      return weather;
    }
    case "olaf": {
      if (weather === "rain") {
        return "snow";
      } else if (weather === "snow") {
        return "clear";
      }

      return weather;
    }

    default: {
      return weather;
    }
  }
};
