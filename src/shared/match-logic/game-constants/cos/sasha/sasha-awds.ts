import type { COProperties } from "../../../co";

export const sashaAWDS: COProperties = {
  displayName: "Sasha",
  gameVersion: "AWDS",
  dayToDay: {
    description: "Properties that give funds give an extra 100 funds per turn.",
    hooks: {
      // handled in gainFunds()
    }
  },
  powers: {
    COPower: {
      name: "Market Crash",
      description: "Reduces all enemies' power charge by 10% for every 5000 funds Sasha currently has.",
      stars: 2,
      instantEffect(player) {
        //power meter decrease in percentage. 1 means 100% decrease
        const powerMeterDecrease = player.data.funds / 50000;

        for (const enemy of player.match.getAllPlayers()) {
          if (enemy.team.index === player.team.index) {
            continue; //not an enemy
          }

          enemy.data.powerMeter = Math.max(0,
            enemy.data.powerMeter - (powerMeterDecrease * enemy.getMaxPowerMeter()));
        }
      }
    },
    superCOPower: {
      name: "War Bonds",
      description: "Turns 50% of the damage units deal into funds.",
      stars: 6,
      hooks: {
        // edge case handled in attack event
      }
    }
  }
};
