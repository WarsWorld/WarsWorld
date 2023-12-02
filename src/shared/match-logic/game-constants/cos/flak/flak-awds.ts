import type { COProperties } from "../../../co";

export const flakAWDS: COProperties = {
  displayName: "Flak",
  gameVersion: "AWDS",
  dayToDay: {
    description: "Units have 25% good luck and 10% bad luck (instead of 10% good luck and 0% bad luck).",
    hooks: {
      maxGoodLuck: () => 25,
      maxBadLuck: () => 10
    }
  },
  powers: {
    COPower: {
      name: "Brute Force",
      description: "Luck changes to 50% good luck and 20% bad luck.",
      stars: 3,
      hooks: {
        maxGoodLuck: () => 50,
        maxBadLuck: () => 20
      }
    },
    superCOPower: {
      name: "Barbaric Blow",
      description: "Luck changes to 90% good luck and 40% bad luck.",
      stars: 6,
      hooks: {
        maxGoodLuck: () => 90,
        maxBadLuck: () => 40
      }
    }
  }
}