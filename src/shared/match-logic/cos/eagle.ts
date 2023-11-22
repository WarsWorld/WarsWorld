import type { COProperties } from "../co";

export const eagle: COProperties = {
  displayName: "Eagle",
  dayToDay: {
    description:
      "Air units gain +15% attack.ts and +10% defense, and consume -2 fuel per day. Naval units lose -30% attack.ts.",
    hooks: {
      attack(value, { attacker }) {
        switch (attacker.properties().facility) {
          case "airport":
            return value + 15;
          case "port":
            return value - 30;
        }
      },
      defense(value, { attacker }) {
        if (attacker.properties().facility === "airport") {
          return value + 10;
        }
      },
    },
  },
  powers: {
    COPower: {
      name: "Lightning Drive",
      stars: 3,
      description: "Air units gain +5% attack.ts and +10% defense.",
      hooks: {
        attack(value, { attacker }) {
          if (attacker.properties().facility === "airport") {
            return value + 5;
          }
        },
        defense(value, { attacker }) {
          if (attacker.properties().facility === "airport") {
            return value + 10;
          }
        },
      },
    },
    superCOPower: {
      name: "Lightning Strike",
      description:
        "Air units gain +5% attack.ts and +10% defense. All non-footsoldier units may move and fire again, even if built this turn.",
      stars: 9,
      instantEffect({ player }) {
        player
          .getUnits()
          .data.filter(
            (unit) => unit.data.type !== "infantry" && unit.data.type !== "mech"
          )
          .forEach((unit) => {
            unit.data.isReady = true;
          });
      },
      hooks: {
        attack(value, { attacker }) {
          if (attacker.properties().facility === "airport") {
            return value + 5;
          }
        },
        defense(value, { attacker }) {
          if (attacker.properties().facility === "airport") {
            return value + 10;
          }
        },
      },
    },
  },
};
