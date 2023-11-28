import type { COProperties } from "../../co";

export const sashaAWDS: COProperties = {
  displayName: "Sasha",
  gameVersion: "AWDS",
  dayToDay: {
    description: "Properties that give funds give an extra 100 funds per turn.",
    hooks: {
      // TODO handle separately on giving funds
    }
  },
  powers: {
    COPower: {
      name: "Market Crash",
      description: "Reduces all enemies' power charge by 10% for every 5000 funds Sasha currently has.",
      stars: 2,
      instantEffect( {match, player} ) {
        const powerMeterDecrease = player.data.funds / 50000;

        for (const enemy of match.players.data) {
          // TODO team stuff
          if (enemy.data.slot === player.data.slot) {
            continue; //not an enemy
          }

          enemy.increasePowerMeter(- powerMeterDecrease * enemy.getPowerStarCost() * enemy.getMaxPowerMeter());
        }
      }
    },
    superCOPower: {
      name: "War Bonds",
      description: "Turns 50% of the damage units deal into funds.",
      stars: 6,
      hooks: {
        // TODO i think this should be another edge case
      }
    }
  }
};
