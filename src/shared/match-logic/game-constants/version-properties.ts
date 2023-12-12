import type { GameVersion } from "../../schemas/game-version";
import type { Weather } from "../../schemas/weather";
import type { UnitWrapper } from "../../wrappers/unit";
import type { DamageChart } from "./base-damage";
import { damageChartAW1, damageChartAW2, damageChartAWDS } from "./base-damage";

type VersionProperties = {
  gameVersion: GameVersion,
  /**
   * Max good luck possible (usually 10 or 15)
   */
  baseGoodLuck: number,
  /**
   * Max bad luck possible (usually 0)
   */
  baseBadLuck: number,
  /**
   * Weathers that can appear in a match (either randomly, forced or by default)
   * currently unused, maybe useful for checking match settings validity?
   */
  existingWeathers: Weather[],
  /**
   * Damage Chart (attack engagement "base damage" for unit types)
   */
  damageChart: DamageChart,
  /**
   * Allow AWBW unload mechanics if set to false
   */
  unloadOnlyAfterMove: boolean,
  /**
   * Highly dependant on game version, the amount of power charge needed to fill a star
   * (AW1 star is arbitrarily 10.000 for compatibility reasons)
   */
  baseStarValue: number,
  /**
   * Multiplicative scaling of star cost/value after popping power
   * Number between 0 and 1 (usually 0.2 = 20%)
   */
  powerMeterScaling: number,
  /**
   * In AW games, activating power reduces power bar by the amount is costs after
   * applying the scaling value (this results in a 120% power bar spent of the actual
   * amount it takes to use it), so this boolean is set to true (raise power cost,
   * then spend power meter). In AWBW it's false, for example.
   */
  raisePowerCostBeforeUsing: boolean,
  /**
   * multiplier for when dealing damage instead of taking damage
   * (taking dmg is always 100% power generated)
   * Number between 0 and 1 (0.25 in AW1, 0.5 in AW2 and AWDS)
   */
  offensivePowerGenMult: number,
  /**
   * Power generation algorithm
   */
  powerMeterIncreasePerHP: (affectedUnit: UnitWrapper) => number,
  /**
   * Additional firepower gained when using CO Power/Super
   */
  powerFirepowerMod: (baseFirepower: number) => number,
  /**
   * Additional defense gained when using CO Power/Super
   */
  powerDefenseMod: (baseDefense: number) => number
}

const AW1Properties: VersionProperties = {
  gameVersion: "AW1",
  baseGoodLuck: 10,
  baseBadLuck: 0,
  existingWeathers: ["clear", "rain", "snow"],
  damageChart: damageChartAW1,
  unloadOnlyAfterMove: true,
  baseStarValue: 10000, // to make an equivalent, arbitrary
  powerMeterScaling: 0.2,
  raisePowerCostBeforeUsing: true,
  offensivePowerGenMult: 0.25,
  powerMeterIncreasePerHP: (affectedUnit) => affectedUnit.getBuildCost() / 10,
  powerFirepowerMod: (baseFirepower) => (baseFirepower * 1.1),
  powerDefenseMod: (baseDefense) => (baseDefense * 1.1)
};

const AW2Properties: VersionProperties = {
  gameVersion: "AW2",
  baseGoodLuck: 10,
  baseBadLuck: 0,
  existingWeathers: ["clear", "rain", "snow"],
  damageChart: damageChartAW2,
  unloadOnlyAfterMove: true,
  baseStarValue: 9000,
  powerMeterScaling: 0.2,
  raisePowerCostBeforeUsing: true,
  offensivePowerGenMult: 0.5,
  powerMeterIncreasePerHP: (affectedUnit) => affectedUnit.getBuildCost() / 10,
  powerFirepowerMod: (baseFirepower) => (baseFirepower),
  powerDefenseMod: (baseDefense) => (baseDefense + 10)
};

const AWDSProperties: VersionProperties = {
  gameVersion: "AWDS",
  baseGoodLuck: 10, //it seems like base luck is also 10
  baseBadLuck: 0,
  existingWeathers: ["clear", "rain", "snow", "sandstorm"],
  damageChart: damageChartAWDS,
  unloadOnlyAfterMove: true,
  baseStarValue: 50, // star calculations are different in awds
  powerMeterScaling: 0.2,
  raisePowerCostBeforeUsing: true,
  offensivePowerGenMult: 0.5,
  powerMeterIncreasePerHP: (affectedUnit) => {
    switch (affectedUnit.data.type) {
      case "infantry":
      case "mech":
        return 2;
      case "blackBomb":
        return 3;
      case "apc":
        return 4;
      case "recon":
      case "artillery":
      case "tank":
      case "transportCopter":
      case "blackBoat":
        return 5;
      case "battleCopter":
      case "lander":
        return 6;
      case "missile":
      case "rocket":
        return 7;
      case "mediumTank":
      case "cruiser":
        return 8;
      case "neoTank":
      case "bomber":
      case "fighter":
      case "sub":
        return 9;
      case "pipeRunner":
      case "stealth":
        return 10;
      case "megaTank":
      case "battleship":
        return 11;
      default:
        return 0;
    }
  },
  powerFirepowerMod: (baseFirepower) => (baseFirepower + 10),
  powerDefenseMod: (baseDefense) => (baseDefense + 10)
};

// as proof of concept:
const AWBWProperties: VersionProperties = {
  gameVersion: "AW2", // not accurate
  baseGoodLuck: 10,
  baseBadLuck: 0,
  existingWeathers: ["clear", "rain", "snow"],
  damageChart: damageChartAW2, // not accurate
  unloadOnlyAfterMove: false,
  baseStarValue: 9000,
  powerMeterScaling: 0.2,
  raisePowerCostBeforeUsing: false,
  offensivePowerGenMult: 0.5,
  powerMeterIncreasePerHP: (affectedUnit) => affectedUnit.getBuildCost() / 10,
  powerFirepowerMod: (baseFirepower) => (baseFirepower + 10),
  powerDefenseMod: (baseDefense) => (baseDefense + 10)
};

export const versionPropertiesMap: Record<GameVersion, VersionProperties> = {
  AW1: AW1Properties,
  AW2: AW2Properties,
  AWDS: AWDSProperties
};