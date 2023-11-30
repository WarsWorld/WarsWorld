import type { COProperties } from "../../co";

export const eagleAW2: COProperties = {
  displayName: "Eagle",
  gameVersion: "AW2",
  dayToDay: {
    description:
      "Air units have +15% firepower and +10% defense, and consume -2 fuel per day. Naval units have -30% firepower.",
    hooks: {
      attack({ attacker }) {
        switch (attacker.properties().facility) {
          case "airport":
            return 115;
          case "port":
            return 70;
        }
      },
      defense({ attacker }) {
        if (attacker.properties().facility === "airport") {
          return 110;
        }
      }
    }
  },
  powers: {
    COPower: {
      name: "Lightning Drive",
      stars: 3,
      description: "Air units gain +15% firepower and +10% defense.",
      hooks: {
        attack({ attacker }) {
          if (attacker.properties().facility === "airport") {
            return 130;
          }
        },
        defense({ attacker }) {
          if (attacker.properties().facility === "airport") {
            return 120;
          }
        }
      }
    },
    superCOPower: {
      name: "Lightning Strike",
      description:
        "Air units gain +15% firepower and +10% defense. All non-footsoldier units may move and fire again, even if built this turn.",
      stars: 9,
      instantEffect({ player }) {
        player
          .getUnits()
          .filter(
          (unit) => unit.data.type !== "infantry" && unit.data.type !== "mech"
        )
          .forEach((unit) => {
            unit.data.isReady = true;
          });
      },
      hooks: {
        attack({ attacker }) {
          if (attacker.properties().facility === "airport") {
            return 130;
          }
        },
        defense({ attacker }) {
          if (attacker.properties().facility === "airport") {
            return 120;
          }
        }
      }
    }
  }
};
