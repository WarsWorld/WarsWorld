import type { COProperties } from "../../../co";

export const nellAW1: COProperties = {
  displayName: "Nell",
  gameVersion: "AW1",
  dayToDay: {
    description: "Luck is increased by 10% (for a total of 20%).",
    hooks: {
      maxGoodLuck: () => 20
    }
  },
  powers: {
    COPower: {
      name: "Lucky star",
      description: "Luck is increased by an extra 40% (for a total of 60%).",
      stars: 3,
      hooks: {
        maxGoodLuck: () => 60
      }
    },
  }
};
