import type { COProperties } from "../../co";


export const grimmAWDS: COProperties = {
  displayName: "Grimm",
  gameVersion: "AWDS",
  dayToDay: {
    description: "Units have +30% firepower and -20% defense.",
    hooks: {
      attack: () => 130,
      defense: () => 80
    }
  },
  powers: {
    COPower: {
      name: "Knuckleduster",
      description: "Units gain +20% firepower.",
      stars: 3,
      hooks: {
        attack: () => 150
      }
    },
    superCOPower: {
      name: "Haymaker",
      description: "Units gain +50% firepower",
      stars: 6,
      hooks: {
        attack: () => 180
      }
    }
  }
}