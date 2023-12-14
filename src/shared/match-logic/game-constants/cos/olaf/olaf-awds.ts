import type { COProperties } from "../../../co";

export const olafAWDS: COProperties = {
  displayName: "Olaf",
  gameVersion: "AWDS",
  dayToDay: {
    description: "Units ignore snow penalties and have +20% firepower during snow.",
    hooks: {
      //in AWDS, olaf d2d is that units ignore fuel extra consumption during snow
      attack: ( {attacker} ) => {
        if (attacker.match.getCurrentWeather() === "snow") {
          return 120;
        }
      }
    }
  },
  powers: {
    COPower: {
      name: "Blizzard",
      description: "Causes it to snow for the next 2 days.",
      stars: 3,
      instantEffect(player) {
        player.match.setWeather("snow", 2);
      }
    },
    superCOPower: {
      name: "Winter fury",
      description: "All enemy units lose 2 HP, and causes it to snow for the next 2 days.",
      stars: 6,
      instantEffect(player) {
        player.team.getEnemyUnits().forEach(unit => unit.damageUntil1HP(2));

        player.match.setWeather("snow", 2);
      }
    }
  }
}
