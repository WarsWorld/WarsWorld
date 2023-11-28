import type { COProperties } from "../../co";

export const hachiAW2: COProperties = {
  displayName: "Hachi",
  gameVersion: "AW2",
  dayToDay: {
    description: "Units cost 10% less to build.",
    hooks: {
      buildCost: (baseCost) => {
        return baseCost * 0.9;
      }
    }
  },
  powers: {
    COPower: {
      name: "Barter",
      description: "Unit cost is reduced to 50%.",
      stars: 3,
      hooks: {
        buildCost: (baseCost) => {
          return baseCost * 0.5;
        }
      }
    },
    superCOPower: {
      name: "Merchant Union",
      description: "Unit cost is reduced to 50%. Ground units can be built on cities.",
      stars: 5,
      hooks: {
        //building in cities is handled somewhere else (build action / event)
        buildCost: (baseCost) => {
          return baseCost * 0.5;
        }
      }
    }
  }
};
