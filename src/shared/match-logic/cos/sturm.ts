import type { COProperties } from "../co";

export const sturm: COProperties = {
  displayName: "Sturm",
  dayToDay: {
    description: "walky fasty",
    hooks: {
      movementCost: (_value, match) => {
        if (match.currentWeather !== "snow") {
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
      instantEffect() {
        // stub
      },
      hooks: {
        movementRange: (value) => value + 1,
        attack: (value) => value + 10,
      },
    },
  },
};
