import type { COProperties } from "../../co";

export const drakeAW2: COProperties = {
  displayName: "Drake",
  gameVersion: "AW2",
  dayToDay: {
    description:
      "Naval units have +1 movement and +10% defense. Air units have -30% firepower. Drake has clear weather movement costs in rain and raises the chance of rain by +7% in random weather.",
    hooks: {
      movementPoints: (value, unit) => {
        if (unit.properties().facility === "port") {
          return value + 1;
        }
      },
      defense: ({ attacker }) => {
        if (attacker.properties().facility === "port") {
          return 110;
        }
      },
      attack: ({ attacker }) => {
        if (attacker.properties().facility === "airport") {
          return 70;
        }
      }
    }
  },
  powers: {
    COPower: {
      name: "Tsunami",
      description:
        "All enemy units lose 1 HP (to a minimum of 0.1HP) and half their current fuel.",
      stars: 4,
      instantEffect({ player }) {
        const enemyUnits = player.team.getEnemyUnits();

        enemyUnits.forEach(unit => {
          unit.drainFuel(Math.floor(unit.getFuel() / 2)); // half fuel till 0 and round down
          unit.damageUntil1HP(10);
        });
      }
    },
    superCOPower: {
      name: "Typhoon",
      description:
        "All enemy units lose 2 HP (to a minimum of 0.1HP) and half their current fuel. Weather changes to rain for 1 day.",
      stars: 7,
      instantEffect({ match, player }) {
        const enemyUnits = player.team.getEnemyUnits();

        enemyUnits.forEach(unit => {
          unit.drainFuel(Math.floor(unit.getFuel() / 2)); // half fuel till 0 and round down
          unit.damageUntil1HP(20);
        });

        match.currentWeather = "rain";
        match.playerToRemoveWeatherEffect = player;
      }
    }
  }
};
