import type { COProperties } from "../../co";


export const jessAWDS: COProperties = {
  displayName: "Jess",
  gameVersion: "AWDS",
  dayToDay: {
    description: "Ground vehicles have +20% firepower. Air and naval units have -10% firepower.",
    hooks: {
      attack: ( {attacker} ) => {
        if (attacker.properties().facility === "base") {
          if (attacker.data.type !== "infantry" && attacker.data.type !== "mech") {
            return 120;
          }
        }
        else {
          return 90;
        }
      },
    }
  },
  powers: {
    COPower: {
      name: "Turbo Charge",
      description: "Supplies all units (fuel and ammo). Ground vehicles gain +20% firepower and +1 movement.",
      stars: 3,
      instantEffect( {player} ) {
        for (const unit of player.getUnits().data) {
          const unitProperties = unit.properties();
          unit.setFuel(unitProperties.initialFuel);

          if ("initialAmmo" in unitProperties) {
            unit.setAmmo(unitProperties.initialAmmo);
          }
        }
      },
      hooks: {
        attack: ( {attacker} ) => {
          if (attacker.properties().facility === "base") {
            if (attacker.data.type !== "infantry" && attacker.data.type !== "mech") {
              return 140;
            }
          }
          else {
            return 90;
          }
        },
        movementRange: (range, unit) => {
          if (unit.properties().facility === "base" && unit.data.type !== "infantry" && unit.data.type !== "mech") {
            return range + 1;
          }
        }
      }
    },
    superCOPower: {
      name: "Overdrive",
      description: "Supplies all units (fuel and ammo). Ground vehicles gain +40% firepower and +2 movement.",
      stars: 6,
      instantEffect( {player} ) {
        for (const unit of player.getUnits().data) {
          const unitProperties = unit.properties();
          unit.setFuel(unitProperties.initialFuel);

          if ("initialAmmo" in unitProperties) {
            unit.setAmmo(unitProperties.initialAmmo);
          }
        }
      },
      hooks: {
        attack: ( {attacker} ) => {
          if (attacker.properties().facility === "base") {
            if (attacker.data.type !== "infantry" && attacker.data.type !== "mech") {
              return 160;
            }
          }
          else {
            return 90;
          }
        },
        movementRange: (range, unit) => {
          if (unit.properties().facility === "base" && unit.data.type !== "infantry" && unit.data.type !== "mech") {
            return range + 2;
          }
        }
      }
    },
  }
}