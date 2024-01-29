import type { COProperties } from "../../../co";

export const eagleAWDS: COProperties = {
  displayName: "Eagle",
  gameVersion: "AWDS",
  dayToDay: {
    description:
      "Air units have +20% firepower, and consume -2 fuel per day. Naval units have -10% firepower.",
    hooks: {
      // fuel consumption handled in pass turn event
      attack({ attacker }) {
        switch (attacker.properties.facility) {
          case "airport":
            return 120;
          case "port":
            return 90;
        }
      },
    },
  },
  powers: {
    COPower: {
      name: "Lightning Drive",
      stars: 3,
      description:
        "All non-footsoldier units may move and fire again, even if built this turn. Firepower is reduced to 70% for air units, 60% for vehicles and 55% for naval units (including power boost)",
      instantEffect(player) {
        player
          .getUnits()
          .filter((unit) => unit.data.type !== "infantry" && unit.data.type !== "mech")
          .forEach((unit) => {
            unit.data.isReady = true;
          });
      },
      hooks: {
        //after applying passive power boost, firepower is going to be just as the description says
        attack({ attacker }) {
          switch (attacker.properties.facility) {
            case "airport":
              return 60;
            case "port":
              return 45;
            default:
              return 50;
          }
        },
      },
    },
    superCOPower: {
      name: "Lightning Strike",
      description: "All non-footsoldier units may move and fire again, even if built this turn.",
      stars: 9,
      instantEffect(player) {
        player
          .getUnits()
          .filter((unit) => unit.data.type !== "infantry" && unit.data.type !== "mech")
          .forEach((unit) => {
            unit.data.isReady = true;
          });
      },
    },
  },
};
