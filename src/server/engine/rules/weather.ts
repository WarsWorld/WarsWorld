import type { Weather } from "server/core/schemas/weather";
import type { MatchWrapper } from "server/engine/entities/match";
import type { PlayerInMatchWrapper } from "server/engine/entities/player-in-match";

/** base random-weather probabilities (percent), before Drake / version adjustments */
const BASE_SNOW_CHANCE = 5;
const BASE_RAIN_CHANCE = 30;
const BASE_SANDSTORM_CHANCE = 5;

/** each non-AWDS Drake in the match adds this much to the rain chance (his D2D passive) */
const DRAKE_RAIN_BONUS = 7;

/** inclusive day range a random non-clear weather effect lasts */
const MIN_WEATHER_DAYS = 1;
const MAX_WEATHER_DAYS = 4;

function getNonAwdsDrakeCount(match: MatchWrapper): number {
  //AWDS Drake doesn't increase weather chances
  return match
    .getAllPlayers()
    .filter((p) => p.data.coId.name === "drake" && p.data.coId.version !== "AWDS").length;
}

/**
 * Random weather draw for `weatherSetting: "random"`.
 *
 * Base table: clear 60% / rain 30% / snow 5% / sandstorm 5%. Rain gains +7% per non-AWDS Drake.
 * Sandstorm is an AWDS-only mechanic, so outside AWDS its 5% folds into snow (snow becomes 10%).
 * Clear absorbs whatever probability is left, so it shrinks as Drakes push rain up.
 */
export function getRandomWeather(match: MatchWrapper): Weather {
  const roll = Math.random() * 100;

  const isAWDS = match.rules.gameVersion === "AWDS";

  // outside AWDS, sandstorm can't happen, so its chance is redistributed to snow
  const snowThreshold = BASE_SNOW_CHANCE + (isAWDS ? 0 : BASE_SANDSTORM_CHANCE);
  const rainThreshold =
    snowThreshold + BASE_RAIN_CHANCE + getNonAwdsDrakeCount(match) * DRAKE_RAIN_BONUS;
  const sandstormThreshold = rainThreshold + (isAWDS ? BASE_SANDSTORM_CHANCE : 0);

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
 * Random duration (in days) a non-clear random weather effect holds. One "day" is a full revolution
 * of turns (player-count turns), so a whole-day duration lasts equally for every player regardless
 * of which player's turn the weather started on.
 */
export function getRandomWeatherDurationDays(): number {
  const span = MAX_WEATHER_DAYS - MIN_WEATHER_DAYS + 1;
  return MIN_WEATHER_DAYS + Math.floor(Math.random() * span);
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

/**
 * In AWDS, snow doubles every unit's fuel use — both per-tile movement fuel and daily upkeep. Olaf's
 * units are immune (their weather resolves to clear via getWeatherSpecialMovement). AW1/AW2 snow slows
 * movement instead and imposes no fuel penalty, so this is AWDS-only.
 */
export const snowDoublesFuel = (player: PlayerInMatchWrapper): boolean => {
  const gameVersion = player.match.rules.gameVersion ?? player.data.coId.version;
  return gameVersion === "AWDS" && getWeatherSpecialMovement(player) === "snow";
};
