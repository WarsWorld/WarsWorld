import type { COProperties } from "../../co";
import { olafAW1 } from "./olaf-aw1";

export const olafAW2: COProperties = {
  ...olafAW1,
  gameVersion: "AW2",
  powers: {
    ...olafAW1.powers,
    superCOPower: {
      name: "Winter fury",
      description: "All enemy units lose 2 HP, and causes it to snow until next turn.",
      stars: 6,
      instantEffect( {match, player} ) {
        player.getEnemyUnits().damageAllUntil1HP(20);

        match.currentWeather = "snow";
        match.playerToRemoveWeatherEffect = player;
      }
    }
  }
}
