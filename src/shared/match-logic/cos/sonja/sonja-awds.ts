import type { COProperties } from "../../co";

export const sonjaAWDS: COProperties = {
  displayName: "Sonja",
  gameVersion: "AWDS",
  dayToDay: {
    description:
      "Units have 1 additional vision range (during FOW), their stats are hidden to the enemies and have 5% bad luck. Enemy terrain stars are reduced by 1 (for a minimum of 0).",
    hooks: {
      // terrain stars handled in calculateDamage
      maxBadLuck: () => 5,
      vision: (value) => value + 1
    }
  },
  powers: {
    COPower: {
      name: "Enhanced Vision",
      description:
        "Units gain +1 additional vision range (for a total of +2), and all woods and reefs inside vision range are revealed. Enemy terrain stars are reduced by 2 instead.",
      stars: 3,
      hooks: {
        vision: (value) => value + 2
      }
    },
    superCOPower: {
      name: "Counter Break",
      description:
        "Units gain +1 additional vision range (for a total of +2), and all woods and reefs inside vision range are revealed. Enemy terrain stars are reduced by 3 instead. Units attack first when being attacked.",
      stars: 5,
      hooks: {
        vision: (value) => value + 2
      }
    }
  }
};
