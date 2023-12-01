import type { COProperties } from "../../co";

export const flakAW2: COProperties = {
  displayName: "Flak",
  gameVersion: "AW2",
  dayToDay: {
    description: "Units have 15% good luck and 10% bad luck (instead of 10% good luck and 0% bad luck).",
    hooks: {
      maxGoodLuck: () => 15,
      maxBadLuck: () => 10
    }
  },
  powers: {
    COPower: {
      name: "Brute Force",
      description: "Luck changes to 40% good luck and 20% bad luck.",
      stars: 3,
      hooks: {
        maxGoodLuck: () => 40,
        maxBadLuck: () => 20
      }
    },
    superCOPower: {
      name: "Barbaric Blow",
      description: "Luck changes to 80% good luck and 40% bad luck.",
      stars: 6,
      hooks: {
        maxGoodLuck: () => 80,
        maxBadLuck: () => 40
      }
    }
  }
}