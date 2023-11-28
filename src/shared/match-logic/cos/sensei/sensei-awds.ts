import type { COProperties } from "../../co";
import { unitPropertiesMap } from "../../buildable-unit";

export const senseiAWDS: COProperties = {
  displayName: "Sensei",
  gameVersion: "AWDS",
  dayToDay: {
    description: "Footsoldiers have +10% firepower, B-Copters have +50% firepower, and transport units have +1 movement. Naval units have -10% firepower.",
    hooks: {
      attack: ( {attacker} ) => {
        if (attacker.data.type === "infantry" || attacker.data.type === "mech") {
          return 110;
        }

        if (attacker.data.type === "battleCopter") {
          return 150;
        }

        if (attacker.properties().facility === "port") {
          return 90;
        }
      },
      movementRange: (value, unit) => {
        if ("loadedUnit" in unit.properties()) { //if it's a transport unit
          return value + 1;
        }
      }
    }
  },
  powers: {
    COPower: {
      name: "Copter Command",
      description: "B-Copters gain +20% firepower. Spwans 9 HP infantry units on top of unoccupied owned cities, ready to move.",
      stars: 2,
      instantEffect({match, player}) {
        for (let i = 0; i < match.map.width; ++i) {
          for (let j = 0; j < match.map.height; ++j) {
            const tile = match.getTile([i, j]);

            if (tile.type === "city" && "ownerSlot" in tile) {
              if (tile.ownerSlot === player.data.slot &&
                match.units.getUnit([i, j]) === undefined) {
                player.addUnwrappedUnit({
                  type: "infantry",
                  position: [i, j],
                  isReady: true,
                  stats: {
                    hp: 9,
                    fuel: unitPropertiesMap.infantry.initialFuel
                  }
                })
              }
            }
          }
        }
      },
      hooks: {
        attack: ( {attacker} ) => {
          if (attacker.data.type === "infantry" || attacker.data.type === "mech") {
            return 110;
          }

          if (attacker.data.type === "battleCopter") {
            return 170;
          }

          if (attacker.properties().facility === "port") {
            return 90;
          }
        },
      }
    },
    superCOPower: {
      name: "Airborne Assault",
      description: "B-Copters gain +20% firepower. Spwans 9 HP mech units on top of unoccupied owned cities, ready to move.",
      stars: 2,
      instantEffect({match, player}) {
        for (let i = 0; i < match.map.width; ++i) {
          for (let j = 0; j < match.map.height; ++j) {
            const tile = match.getTile([i, j]);

            if (tile.type === "city" && "ownerSlot" in tile) {
              if (tile.ownerSlot === player.data.slot &&
                match.units.getUnit([i, j]) === undefined) {
                player.addUnwrappedUnit({
                  type: "mech",
                  position: [i, j],
                  isReady: true,
                  stats: {
                    hp: 9,
                    fuel: unitPropertiesMap.infantry.initialFuel,
                    ammo: unitPropertiesMap.mech.initialAmmo
                  }
                })
              }
            }
          }
        }
      },
      hooks: {
        attack: ( {attacker} ) => {
          if (attacker.data.type === "infantry" || attacker.data.type === "mech") {
            return 110;
          }

          if (attacker.data.type === "battleCopter") {
            return 170;
          }

          if (attacker.properties().facility === "port") {
            return 90;
          }
        },
      }
    }
  }
}