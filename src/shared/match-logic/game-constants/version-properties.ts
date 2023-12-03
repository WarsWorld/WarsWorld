import type { GameVersion } from "../../schemas/game-version";
import type { Weather } from "../../schemas/weather";
import type { UnitWrapper } from "../../wrappers/unit";

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
   * Power activation reduces power bar by more than its actual cost in AW games.
   * In AW2 and AWDS, activating power reduces power bar by (up to) 120% of the power cost
   * (only takes effect when using CO power while having extra power stored)
   * Number between 0 and 1 (usually 0.2 = 20%)
   */
  powerUsagePenalty: number,
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
  baseStarValue: 10000, // to make an equivalent, arbitrary
  powerMeterScaling: 0.2,
  powerUsagePenalty: 0.2,
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
  baseStarValue: 9000,
  powerMeterScaling: 0.2,
  powerUsagePenalty: 0.2,
  offensivePowerGenMult: 0.5,
  powerMeterIncreasePerHP: (affectedUnit) => affectedUnit.getBuildCost() / 10,
  powerFirepowerMod: (baseFirepower) => (baseFirepower),
  powerDefenseMod: (baseDefense) => (baseDefense + 10)
};

const AWDSProperties: VersionProperties = {
  gameVersion: "AWDS",
  baseGoodLuck: 15,
  baseBadLuck: 0,
  existingWeathers: ["clear", "rain", "snow", "sandstorm"],
  baseStarValue: 50, // star calculations are different in awds
  powerMeterScaling: 0.2,
  powerUsagePenalty: 0.2,
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

export const versionPropertiesMap: Record<GameVersion, VersionProperties> = {
  AW1: AW1Properties,
  AW2: AW2Properties,
  AWDS: AWDSProperties
};