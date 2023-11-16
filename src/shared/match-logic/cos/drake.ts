import type { COProperties } from "../co";

export const drake: COProperties = {
  displayName: "Drake",
  dayToDay: {
    description:
      "Naval units gain +1 movement and +25% defense. Air units lose -20% attack.ts. Unaffected by rain (except vision), and has a higher chance of rain in random weather.",
    hooks: {
      // TODO higher chance of rain in random weather (idk if we implement random weather)
      // TODO drake's movement is not affected by rain
      onMovementRange: (value, { attackerData: currentPlayerData }) => {
        if (currentPlayerData.unitFacility === "port") {
          return value + 1;
        }
      },
      onDefenseModifier: (value, { attackerData: currentPlayerData }) => {
        if (currentPlayerData.unitFacility === "port") {
          return value + 25;
        }
      },
      onAttackModifier: (value, { attackerData: currentPlayerData }) => {
        if (currentPlayerData.unitFacility === "airport") {
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
      instantEffect({ attackerData: currentPlayerData }) {
        const enemyUnits = currentPlayerData.player.getEnemyUnits();

        enemyUnits.damageAllUntil1HP(10);

        enemyUnits.data.forEach((unit) => {
          unit.stats.fuel = Math.floor(unit.stats.fuel / 2); // half fuel till 0 and round down
        });
      },
    },
    superCOPower: {
      name: "Typhoon",
      description:
        "All enemy units lose 2 HP (to a minimum of 0.1HP) and half their fuel. Weather changes to Rain for 1 day.",
      stars: 7,
      instantEffect({ matchState, attackerData: currentPlayerData }) {
        const enemyUnits = currentPlayerData.player.getEnemyUnits();

        enemyUnits.damageAllUntil1HP(20);

        enemyUnits.data.forEach((unit) => {
          unit.stats.fuel = Math.floor(unit.stats.fuel / 2); // half fuel till 0 and round down
        });

        matchState.currentWeather = "rain";
        matchState.weatherNextDay = "clear";
      },
    },
  },
};
