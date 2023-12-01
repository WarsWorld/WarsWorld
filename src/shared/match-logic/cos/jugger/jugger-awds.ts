import type { COProperties } from "../../co";

export const juggerAWDS: COProperties = {
  displayName: "Flak",
  gameVersion: "AW2",
  dayToDay: {
    description: "Units have 30% good luck and 15% bad luck (instead of 10% good luck and 0% bad luck).",
    hooks: {
      maxGoodLuck: () => 30,
      maxBadLuck: () => 15
    }
  },
  powers: {
    COPower: {
      name: "Overclock",
      description: "Luck changes to 55% good luck and 25% bad luck.",
      stars: 3,
      hooks: {
        maxGoodLuck: () => 55,
        maxBadLuck: () => 25
      }
    },
    superCOPower: {
      name: "System Crash",
      description: "Luck changes to 95% good luck and 45% bad luck.",
      stars: 7,
      hooks: {
        maxGoodLuck: () => 95,
        maxBadLuck: () => 45
      }
    }
  }
}