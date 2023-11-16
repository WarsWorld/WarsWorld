import type { COProperties } from "../co";

export const lash: COProperties = {
  displayName: "Lash",
  powers: {
    superCOPower: {
      name: "Prime Tactics",
      stars: 123, // TODO
      description: "TODO",
      hooks: {
        onTerrainStars(value) {
          return value * 2;
        },
      },
    },
  },
};
