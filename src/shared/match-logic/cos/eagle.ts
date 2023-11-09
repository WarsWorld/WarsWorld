import { unitPropertiesMap } from "../buildable-unit";
import { COProperties } from "../co";
import { getPlayerUnits } from "../units";

export const eagle: COProperties = {
  displayName: "Eagle",
  dayToDay: {
    description:
      "Air units gain +15% attack and +10% defense, and consume -2 fuel per day. Naval units lose -30% attack.",
    hooks: {
      onAttackModifier({ currentValue, currentPlayerData }) {
        switch (unitPropertiesMap[currentPlayerData.unitType].facility) {
          case "airport":
            return currentValue + 15;
          case "port":
            return currentValue - 30;
          default:
            return currentValue;
        }
      },
      onDefenseModifier({ currentValue, currentPlayerData }) {
        return unitPropertiesMap[currentPlayerData.unitType].facility ===
          "airport"
          ? currentValue + 10
          : currentValue;
      },
      onFuelDrain({ currentValue, currentPlayerData }) {
        return unitPropertiesMap[currentPlayerData.unitType].facility ===
          "airport"
          ? currentValue - 2
          : currentValue;
      },
    },
  },
  powers: {
    COPower: {
      name: "Lightning Drive",
      stars: 3,
      description: "Air units gain +5% attack and +10% defense.",
      hooks: {
        onAttackModifier({ currentValue, currentPlayerData }) {
          return unitPropertiesMap[currentPlayerData.unitType].facility ===
            "airport"
            ? currentValue + 5
            : currentValue;
        },
        onDefenseModifier({ currentValue, currentPlayerData }) {
          return unitPropertiesMap[currentPlayerData.unitType].facility ===
            "airport"
            ? currentValue + 10
            : currentValue;
        },
      },
    },
    superCOPower: {
      name: "Lightning Strike",
      description:
        "Air units gain +5% attack and +10% defense. All non-footsoldier units may move and fire again, even if built this turn.",
      stars: 9,
      instantEffect({ matchState, currentPlayerData }) {
        getPlayerUnits(matchState, currentPlayerData.player.slot)
          .filter((unit) => unit.type !== "infantry" && unit.type !== "mech")
          .forEach((unit) => unit.isReady);
      },
      hooks: {
        onAttackModifier({ currentValue, currentPlayerData }) {
          return unitPropertiesMap[currentPlayerData.unitType].facility ===
            "airport"
            ? currentValue + 5
            : currentValue;
        },
        onDefenseModifier({ currentValue, currentPlayerData }) {
          return unitPropertiesMap[currentPlayerData.unitType].facility ===
            "airport"
            ? currentValue + 10
            : currentValue;
        },
      },
    },
  },
};
