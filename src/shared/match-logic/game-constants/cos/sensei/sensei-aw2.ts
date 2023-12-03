import type { COProperties } from "../../../co";
import { applySenseiPowerSpawn } from "./apply-sensei-power";

export const senseiAW2: COProperties = {
  displayName: "Sensei",
  gameVersion: "AW2",
  dayToDay: {
    description: "Footsoldiers have +40% firepower, B-Copters have +50% firepower, and transport units have +1 movement. Ground vehicles and naval units have -10% firepower.",
    hooks: {
      attack: ( {attacker} ) => {
        if (attacker.isInfantryOrMech()) {
          return 140;
        }

        if (attacker.data.type === "battleCopter") {
          return 150;
        }

        if (attacker.properties.facility !== "airport") {
          return 90;
        }
      },
      movementPoints: (value, unit) => {
        if ("loadedUnit" in unit.properties()) { //if it's a transport unit
          return value + 1;
        }
      }
    }
  },
  powers: {
    COPower: {
      name: "Copter Command",
      description: "B-Copters gain +25% firepower. Spawns 9 HP infantry units on top of unoccupied owned cities, ready to move.",
      stars: 2,
      instantEffect(player) {
        applySenseiPowerSpawn(player, "infantry")
      },
      hooks: {
        attack: ( {attacker} ) => {
          if (attacker.isInfantryOrMech()) {
            return 140;
          }

          if (attacker.data.type === "battleCopter") {
            return 175;
          }

          if (attacker.properties.facility !== "airport") {
            return 90;
          }
        },
      }
    },
    superCOPower: {
      name: "Airborne Assault",
      description: "B-Copters gain +25% firepower. Spawns 9 HP mech units on top of unoccupied owned cities, ready to move.",
      stars: 2,
      instantEffect(player) {
        applySenseiPowerSpawn(player, "mech")
      },
      hooks: {
        attack: ( {attacker} ) => {
          if (attacker.isInfantryOrMech()) {
            return 140;
          }

          if (attacker.data.type === "battleCopter") {
            return 175;
          }

          if (attacker.properties.facility !== "airport") {
            return 90;
          }
        },
      }
    }
  }
}