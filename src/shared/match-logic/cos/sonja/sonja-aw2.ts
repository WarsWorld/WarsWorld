import type { COProperties } from "../../co";

export const sonjaAW2: COProperties = {
  displayName: "Sonja",
  gameVersion: "AW2",
  dayToDay: {
    description: "Units have 1 additional vision range (during FOW), their stats are hidden to the enemies, have 10% bad luck and their counter attacks deal 50% extra damage.",
    hooks: {
      // TODO special counter case for sonja and kanbei
      maxBadLuck: () => 10,
      vision: (value) => value + 1
    }
  },
  powers: {
    COPower: {
      name: "Enhanced Vision",
      description: "Units gain +1 additional vision range (for a total of +2), and all woods and reefs inside vision range are revealed.",
      stars: 3,
      hooks: {
        // TODO woods and reefs
        vision: (value) => value + 2
      }
    },
    superCOPower: {
      name: "Counter Break",
      description: "Units gain +1 additional vision range (for a total of +2), and all woods and reefs inside vision range are revealed. Units attack first when being attacked.",
      stars: 5,
      hooks: {
        // TODO woods and reefs
        // TODO attacking first should already be considered edge case somewhere
        vision: (value) => value + 2
      }
    }
  }
}