import type { COProperties } from "../../../co";
import { applySenseiPowerSpawn } from "./apply-sensei-power";

export const senseiAWDS: COProperties = {
  displayName: "Sensei",
  gameVersion: "AWDS",
  dayToDay: {
    description:
      "Footsoldiers have +10% firepower, B-Copters have +50% firepower, and transport units have +1 movement. Naval units have -10% firepower.",
    hooks: {
      attack: ({ attacker }) => {
        if (attacker.isInfantryOrMech()) {
          return 110;
        }

        if (attacker.data.type === "battleCopter") {
          return 150;
        }

        if (attacker.properties.facility === "port") {
          return 90;
        }
      },
      movementPoints: (value, unit) => {
        if (unit.isTransport()) {
          return value + 1;
        }
      },
    },
  },
  powers: {
    COPower: {
      name: "Copter Command",
      description:
        "B-Copters gain +20% firepower. Spawns 9 HP infantry units on top of unoccupied owned cities, ready to move.",
      stars: 2,
      instantEffect(player) {
        applySenseiPowerSpawn(player, "infantry");
      },
      hooks: {
        attack: ({ attacker }) => {
          if (attacker.isInfantryOrMech()) {
            return 110;
          }

          if (attacker.data.type === "battleCopter") {
            return 170;
          }

          if (attacker.properties.facility === "port") {
            return 90;
          }
        },
      },
    },
    superCOPower: {
      name: "Airborne Assault",
      description:
        "B-Copters gain +20% firepower. Spawns 9 HP mech units on top of unoccupied owned cities, ready to move.",
      stars: 2,
      instantEffect(player) {
        applySenseiPowerSpawn(player, "mech");
      },
      hooks: {
        attack: ({ attacker }) => {
          if (attacker.isInfantryOrMech()) {
            return 110;
          }

          if (attacker.data.type === "battleCopter") {
            return 170;
          }

          if (attacker.properties.facility === "port") {
            return 90;
          }
        },
      },
    },
  },
};
