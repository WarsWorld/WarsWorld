import { COProperties } from "../co";

export const sturm: COProperties = {
  displayName: "Sturm",
  dayToDay: {
    description: "walky fasty",
    hooks: {
      onMovementCost: (_value, { matchState }) => {
        if (matchState.currentWeather !== "snow") {
          return 1;
        }
      },
    },
  },
  powers: {
    superCOPower: {
      name: "Meteor Strike",
      description: "TODO",
      stars: 9,
      instantEffect({ attackerData: currentPlayerData }) {
        // stub
      },
      hooks: {
        onMovementRange: (value) => value + 1,
        onAttackModifier: (value) => value + 10,
      },
    },
  },
};
