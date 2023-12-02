import type { COProperties } from "../../../co";

export const maxAWDS: COProperties = {
  displayName: "Max",
  gameVersion: "AWDS",
  dayToDay: {
    description: "Non-footsoldier direct units have +20% firepower, but indirect units have -1 range.",
    hooks: {
      attack: ({ attacker }) => {
        if (!attacker.isIndirect() && attacker.data.type !== "infantry" && attacker.data.type !== "mech") {
          return 120;
        }
      },
      attackRange(value, { attacker }) {
        if (attacker.isIndirect()) {
          return value - 1;
        }
      },
    }
  },
  powers: {
    COPower: {
      name: "Max Force",
      description: "Non-footsoldier direct units gain +30% firepower.",
      stars: 3,
      hooks: {
        attack: ({ attacker }) => {
          if (!attacker.isIndirect() && attacker.data.type !== "infantry" && attacker.data.type !== "mech") {
            return 150;
          }
        },
      },
    },
    superCOPower: {
      name: "Max Blast",
      description: "Non-footsoldier direct units gain +50% firepower.",
      stars: 6,
      hooks: {
        attack: ({ attacker }) => {
          if (!attacker.isIndirect() && attacker.data.type !== "infantry" && attacker.data.type !== "mech") {
            return 170;
          }
        },
      },
    }
  },
};
