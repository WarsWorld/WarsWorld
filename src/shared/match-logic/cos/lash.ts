import { COProperties } from "../co";

export const lash: COProperties = {
  displayName: "Lash",
  powers: {
    superCOPower: {
      name: "Prime Tactics",
      stars: 123, // TODO
      description: "TODO",
      hooks: {
        onTerrainStars({ currentValue }) {
          return currentValue * 2;
        },
      },
    },
  },
};
