import { unitPropertiesMap } from "../buildable-unit";
import { COProperties } from "../co";
import { getEnemyUnits, damageUnitUntil1HP } from "../units";

export const drake: COProperties = {
  displayName: "Drake",
  dayToDay: {
    description:
      "Naval units gain +1 movement and +25% defense. Air units lose -20% attack. Unaffected by rain (except vision), and has a higher chance of rain in random weather.",
    hooks: {
      // TODO higher chance of rain in random weather (idk if we implement random weather)
      // TODO drake's movement is not affected by rain
      onMovementRange: ({ currentValue, currentPlayerData }) =>
        currentValue +
        (unitPropertiesMap[currentPlayerData.unitType].facility === "port"
          ? 1
          : 0),
      onDefenseModifier: ({ currentValue, currentPlayerData }) =>
        currentValue +
        (unitPropertiesMap[currentPlayerData.unitType].facility === "port"
          ? 25
          : 0),
      onAttackModifier: ({ currentValue, currentPlayerData }) =>
        currentValue +
        (unitPropertiesMap[currentPlayerData.unitType].facility === "airport"
          ? -20
          : 0),
    },
  },
  powers: {
    COPower: {
      name: "Tsunami",
      description:
        "All enemy units lose 1 HP (to a minimum of 0.1HP) and half their fuel.",
      stars: 4,
      instantEffect({ matchState, currentPlayerData }) {
        getEnemyUnits(matchState, currentPlayerData.player.slot).forEach(
          (unit) => {
            damageUnitUntil1HP(unit, 1);
            unit.stats.fuel = Math.ceil(unit.stats.fuel / 2); // drain fuel till 1
          }
        );
      },
    },
    superCOPower: {
      name: "Typhoon",
      description:
        "All enemy units lose 2 HP (to a minimum of 0.1HP) and half their fuel. Weather changes to Rain for 1 day.",
      stars: 7,
      instantEffect({ matchState, currentPlayerData }) {
        getEnemyUnits(matchState, currentPlayerData.player.slot).forEach(
          (unit) => {
            damageUnitUntil1HP(unit, 2);
            unit.stats.fuel = Math.ceil(unit.stats.fuel / 2); // drain fuel till 1
          }
        );

        matchState.currentWeather = "rain";
        matchState.weatherNextDay = "clear";
      },
    },
  },
};
