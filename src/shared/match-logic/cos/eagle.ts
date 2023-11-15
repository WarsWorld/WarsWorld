import { COProperties } from "../co";

export const eagle: COProperties = {
  displayName: "Eagle",
  dayToDay: {
    description:
      "Air units gain +15% attack.ts and +10% defense, and consume -2 fuel per day. Naval units lose -30% attack.ts.",
    hooks: {
      onAttackModifier(value, { attackerData: currentPlayerData }) {
        switch (currentPlayerData.unitFacility) {
          case "airport":
            return value + 15;
          case "port":
            return value - 30;
        }
      },
      onDefenseModifier(value, { attackerData: currentPlayerData }) {
        if (currentPlayerData.unitFacility === "airport") {
          return value + 10;
        }
      },
      onFuelDrain(value, { attackerData: currentPlayerData }) {
        if (currentPlayerData.unitFacility === "airport") {
          return value - 2;
        }
      },
    },
  },
  powers: {
    COPower: {
      name: "Lightning Drive",
      stars: 3,
      description: "Air units gain +5% attack.ts and +10% defense.",
      hooks: {
        onAttackModifier(value, { attackerData: currentPlayerData }) {
          if (currentPlayerData.unitFacility === "airport") {
            return value + 5;
          }
        },
        onDefenseModifier(value, { attackerData: currentPlayerData }) {
          if (currentPlayerData.unitFacility === "airport") {
            return value + 10;
          }
        },
      },
    },
    superCOPower: {
      name: "Lightning Strike",
      description:
        "Air units gain +5% attack.ts and +10% defense. All non-footsoldier units may move and fire again, even if built this turn.",
      stars: 9,
      instantEffect({ attackerData: currentPlayerData }) {
        currentPlayerData.player
          .getUnits()
          .data.filter(
            (unit) => unit.type !== "infantry" && unit.type !== "mech"
          )
          .forEach((unit) => {
            unit.isReady = true;
          });
      },
      hooks: {
        onAttackModifier(value, { attackerData: currentPlayerData }) {
          if (currentPlayerData.unitFacility === "airport") {
            return value + 5;
          }
        },
        onDefenseModifier(value, { attackerData: currentPlayerData }) {
          if (currentPlayerData.unitFacility === "airport") {
            return value + 10;
          }
        },
      },
    },
  },
};
