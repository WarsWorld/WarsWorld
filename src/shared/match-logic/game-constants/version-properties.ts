import type { GameVersion } from "../../schemas/game-version";
import type { Weather } from "../../schemas/weather";
import type { UnitWrapper } from "../../wrappers/unit";

type GameBehaviour = {
  gameVersion: GameVersion,
  baseGoodLuck: number,
  baseBadLuck: number,
  existingWeathers: Weather[], // currently unused, maybe useful for checking match settings validity?
  baseStarValue: number, // highly dependent on game version
  powerMeterScaling: number, // multiplicative scaling after popping power, usually +20%
  offensivePowerGenMult: number, // multiplier for when dealing damage instead of taking damage (taking dmg is always 100% power generated)
  powerMeterIncreasePerHP: (affectedUnit: UnitWrapper) => number,
  powerFirepowerMod: (baseFirepower: number) => number,
  powerDefenseMod: (baseDefense: number) => number
}

const AW1Behaviour: GameBehaviour = {
  gameVersion: "AW1",
  baseGoodLuck: 10,
  baseBadLuck: 0,
  existingWeathers: ["clear", "rain", "snow"],
  baseStarValue: 10000, // to make an equivalent, arbitrary
  powerMeterScaling: 0.2,
  offensivePowerGenMult: 0.25,
  powerMeterIncreasePerHP: (affectedUnit) => affectedUnit.getBuildCost() / 10,
  powerFirepowerMod: (baseFirepower) => (baseFirepower * 1.1),
  powerDefenseMod: (baseDefense) => (baseDefense * 1.1)
};

const AW2Behaviour: GameBehaviour = {
  gameVersion: "AW2",
  baseGoodLuck: 10,
  baseBadLuck: 0,
  existingWeathers: ["clear", "rain", "snow"],
  baseStarValue: 9000,
  powerMeterScaling: 0.2,
  offensivePowerGenMult: 0.5,
  powerMeterIncreasePerHP: (affectedUnit) => affectedUnit.getBuildCost() / 10,
  powerFirepowerMod: (baseFirepower) => (baseFirepower),
  powerDefenseMod: (baseDefense) => (baseDefense + 10)
};

const AWDSBehaviour: GameBehaviour = {
  gameVersion: "AWDS",
  baseGoodLuck: 15,
  baseBadLuck: 0,
  existingWeathers: ["clear", "rain", "snow", "sandstorm"],
  baseStarValue: 50, // star calculations are different in awds
  powerMeterScaling: 0.2,
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

export const gameBehaviourMap: Record<GameVersion, GameBehaviour> = {
  AW1: AW1Behaviour,
  AW2: AW2Behaviour,
  AWDS: AWDSBehaviour
};