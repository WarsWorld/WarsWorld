import type { COProperties } from "../../co";

export const jessAW2: COProperties = {
  displayName: "Jess",
  gameVersion: "AW2",
  dayToDay: {
    description:
      "Ground vehicles have +10% firepower. Other units (including footsoldiers) have -10% firepower.",
    hooks: {
      attack: ({ attacker }) => {
        if (
          attacker.properties().facility === "base" &&
          attacker.data.type !== "infantry" &&
          attacker.data.type !== "mech"
        ) {
          return 110;
        }

        return 90;
      }
    }
  },
  powers: {
    COPower: {
      name: "Turbo Charge",
      description:
        "Supplies all units (fuel and ammo). Ground vehicles gain +20% firepower and +1 movement.",
      stars: 3,
      instantEffect({ player }) {
        player.getUnits().data.forEach((unit) => unit.resupply());
      },
      hooks: {
        attack: ({ attacker }) => {
          if (
            attacker.properties().facility === "base" &&
            attacker.data.type !== "infantry" &&
            attacker.data.type !== "mech"
          ) {
            return 130;
          }

          return 90;
        },
        movementRange: (range, unit) => {
          if (
            unit.properties().facility === "base" &&
            unit.data.type !== "infantry" &&
            unit.data.type !== "mech"
          ) {
            return range + 1;
          }
        }
      }
    },
    superCOPower: {
      name: "Overdrive",
      description:
        "Supplies all units (fuel and ammo). Ground vehicles gain +40% firepower and +2 movement.",
      stars: 6,
      instantEffect({ player }) {
        player.getUnits().data.forEach((unit) => unit.resupply());
      },
      hooks: {
        attack: ({ attacker }) => {
          if (
            attacker.properties().facility === "base" &&
            attacker.data.type !== "infantry" &&
            attacker.data.type !== "mech"
          ) {
            return 150;
          }

          return 90;
        },
        movementRange: (range, unit) => {
          if (
            unit.properties().facility === "base" &&
            unit.data.type !== "infantry" &&
            unit.data.type !== "mech"
          ) {
            return range + 2;
          }
        }
      }
    }
  }
};
