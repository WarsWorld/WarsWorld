import type { COProperties } from "../../../co";

export const eagleAW1: COProperties = {
  displayName: "Eagle",
  gameVersion: "AW1",
  dayToDay: {
    description:
      "Air units have +15% firepower and +10% defense, and consume -2 fuel per day. Naval units have -20% firepower.",
    hooks: {
      attack({ attacker }) {
        switch (attacker.properties.facility) {
          case "airport":
            return 115;
          case "port":
            return 80;
        }
      },
      defense({ attacker }) {
        if (attacker.properties.facility === "airport") {
          return 110;
        }
      },
    },
  },
  powers: {
    COPower: {
      name: "Lightning Strike",
      description:
        "All non-footsoldier units may move and fire again, even if built this turn. All units (including footsoldiers) are affected with -20% damage and -30% defense (including power boost).",
      stars: 5,
      instantEffect(player) {
        player
          .getUnits()
          .filter((unit) => unit.data.type !== "infantry" && unit.data.type !== "mech")
          .forEach((unit) => {
            unit.data.isReady = true;
          });
      },
      hooks: {
        attack({ attacker }) {
          switch (attacker.properties.facility) {
            case "airport":
              return 85; //115 + (-10 - 20) = 85, -10 to counteract the passive +10, which is not +10 in aw1 but whatever power boost
            case "port":
              return 50;
            default:
              return 70;
          }
        },
        defense({ attacker }) {
          if (attacker.properties.facility === "airport") {
            return 80;
          }

          return 60;
        },
      },
    },
  },
};
