import { BackendMatchState } from "shared/types/server-match-state";
import { unitPropertiesMap } from "./buildable-unit";

// TODO: need to test this function once basic game functionality is complete
export const calculateUnitCount = (
  matchState: BackendMatchState, // the interface containing all of the unit data of the current match
  player: number // the ID of the player whose army count you want to calculate
) => {
  let unitCount = 0;
  for (let i = 0; i < matchState.units.length; i++) {
    if (matchState.units[i].playerSlot == player) { // only count units belonging to the specified player
      unitCount++;
    }
  }

  return unitCount;
};

// TODO: need to test this function once basic game functionality is complete
export const calculateArmyValue = (
  matchState: BackendMatchState, // the interface containing all of the unit data of the current match
  player: number // the ID of the player whose army value you want to calculate
) => {
  let armyValue = 0;
  for (let i = 0; i < matchState.units.length; i++) {
    let unit = matchState.units[i];
    if (unit.playerSlot == player) { // only calculate units belonging to the specified player
      /**
       * We need to scale the value of the unit based on how much HP it is missing.
       * For example, a full HP tank is worth 7000, but a 3HP tank is only worth 2100.
       */
      let scalar = Math.ceil(Math.ceil(unit.stats.hp / 10) / 10);
      let unitValue = unitPropertiesMap[unit.type].cost * scalar;
      armyValue += unitValue;
    }
  }

  return armyValue;
};