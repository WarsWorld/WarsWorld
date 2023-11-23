import type { COProperties } from "../co";

export const lash: COProperties = {
  displayName: "Lash",
  powers: {
    superCOPower: {
      name: "Prime Tactics",
      stars: 8,
      description: "", // TODO
      hooks: {
        terrainStars: (v) => v * 2,
        movementCost: () => 1,
      },
    },
  },
};
