import type { COProperties } from "../../../co";

export const jessAW2: COProperties = {
  displayName: "Jess",
  gameVersion: "AW2",
  dayToDay: {
    description:
      "Ground vehicles have +10% firepower. Other units (including footsoldiers) have -10% firepower.",
    hooks: {
      attack: ({ attacker }) => {
        if (
          attacker.properties.facility === "base" &&
          !attacker.isInfantryOrMech()
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
      instantEffect(player) {
        player.getUnits().forEach((unit) => unit.resupply());
      },
      hooks: {
        attack: ({ attacker }) => {
          if (
            attacker.properties.facility === "base" &&
            !attacker.isInfantryOrMech()
          ) {
            return 130;
          }

          return 90;
        },
        movementPoints: (points, unit) => {
          if (
            unit.properties.facility === "base" &&
            !unit.isInfantryOrMech()
          ) {
            return points + 1;
          }
        }
      }
    },
    superCOPower: {
      name: "Overdrive",
      description:
        "Supplies all units (fuel and ammo). Ground vehicles gain +40% firepower and +2 movement.",
      stars: 6,
      instantEffect(player) {
        player.getUnits().forEach((unit) => unit.resupply());
      },
      hooks: {
        attack: ({ attacker }) => {
          if (
            attacker.properties.facility === "base" &&
            !attacker.isInfantryOrMech()
          ) {
            return 150;
          }

          return 90;
        },
        movementPoints: (points, unit) => {
          if (
            unit.properties.facility === "base" &&
            !unit.isInfantryOrMech()
          ) {
            return points + 2;
          }
        }
      }
    }
  }
};
