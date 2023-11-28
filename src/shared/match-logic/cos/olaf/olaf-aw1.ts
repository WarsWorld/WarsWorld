import type { COProperties } from "../../co";

export const olafAW1: COProperties = {
  displayName: "Olaf",
  gameVersion: "AW1",
  dayToDay: {
    description: "Units have clear movement costs in snow, and snow movement costs in rain.",
    hooks: {
      //handled in "getWeatherSpecialMovement"
    }
  },
  powers: {
    COPower: {
      name: "Blizzard",
      description: "Causes it to snow until next turn.",
      stars: 3,
      instantEffect( {match, player} ) {
        match.currentWeather = "snow";
        match.playerToRemoveWeatherEffect = player;
      }
    },
  }
};
