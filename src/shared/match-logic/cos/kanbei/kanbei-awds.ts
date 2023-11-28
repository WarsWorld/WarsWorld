import type { COProperties } from "../../co";
import { kanbeiAW1 } from "./kanbei-aw1";


export const kanbeiAWDS: COProperties = {
  ...kanbeiAW1,
  gameVersion: "AWDS",
  powers: {
    COPower: {
      name: "Morale Boost",
      description: "Units gain +30% firepower.",
      stars: 4,
      hooks: {
        attack: () => 150
      }
    },
    superCOPower: {
      name: "Samurai Spirit",
      description: "Units gain +30% firepower and defense, and their counterattacks deal double damage.", // TODO counterattacks
      stars: 7,
      hooks: {
        attack: () => 150,
        defense: () => 150,
      }
    }
  }
}