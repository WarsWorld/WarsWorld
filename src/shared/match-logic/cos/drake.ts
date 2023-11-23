import type { COProperties } from "../co";

export const drake: COProperties = {
  displayName: "Drake",
  dayToDay: {
    description:
      "Naval units gain +1 movement and +25% defense. Air units lose -20% attack.ts. Unaffected by rain (except vision), and has a higher chance of rain in random weather.",
    hooks: {
      movementRange: (value, unit) => {
        if (unit.properties().facility === "port") {
          return value + 1;
        }
      },
      defense: (value, { attacker }) => {
        if (attacker.properties().facility === "port") {
          return value + 25;
        }
      },
      attack: (value, { attacker }) => {
        if (attacker.properties().facility === "airport") {
          return value - 20;
        }
      },
    },
  },
  powers: {
    COPower: {
      name: "Tsunami",
      description:
        "All enemy units lose 1 HP (to a minimum of 0.1HP) and half their fuel.",
      stars: 4,
      instantEffect({ player }) {
        const enemyUnits = player.getEnemyUnits();

        enemyUnits.damageAllUntil1HP(10);

        enemyUnits.data.forEach((unit) => {
          unit.data.stats.fuel = Math.floor(unit.data.stats.fuel / 2); // half fuel till 0 and round down
        });
      },
    },
    superCOPower: {
      name: "Typhoon",
      description:
        "All enemy units lose 2 HP (to a minimum of 0.1HP) and half their fuel. Weather changes to Rain for 1 day.",
      stars: 7,
      instantEffect({ match, player }) {
        const enemyUnits = player.getEnemyUnits();

        enemyUnits.damageAllUntil1HP(20);

        enemyUnits.data.forEach((unit) => {
          unit.data.stats.fuel = Math.floor(unit.data.stats.fuel / 2); // half fuel till 0 and round down
        });

        match.currentWeather = "rain";
        match.playerToRemoveWeatherEffect = player;
      },
    },
  },
};
