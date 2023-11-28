import type { COProperties } from "../../co";

export const sonjaAW1: COProperties = {
  displayName: "Sonja",
  gameVersion: "AW1",
  dayToDay: {
    description: "Units have 1 additional vision range (during FOW), their stats are hidden to the enemies, and have 25% good luck (instead of 10%) and 15% bad luck (instead of 0%).",
    hooks: {
      // TODO hidden stats special case
      maxGoodLuck: () => 25,
      maxBadLuck: () => 15,
      vision: (value) => value + 1
    }
  },
  powers: {
    COPower: {
      name: "Enhanced Vision",
      description: "Units gain +2 additional vision range (for a total of +3), and all woods and reefs inside vision range are revealed.",
      stars: 3,
      hooks: {
        // TODO woods and reefs
        vision: (value) => value + 3
      }
    }
  }
}