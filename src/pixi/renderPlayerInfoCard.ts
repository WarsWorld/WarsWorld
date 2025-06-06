import { getCOProperties } from "shared/match-logic/co";
import type { MatchWrapper } from "shared/wrappers/match";

/* eslint-disable @typescript-eslint/no-unused-vars */
// TODO: unused yet
export const renderPlayerInfoCard = (match: MatchWrapper, playerSlot: number) => {
  const player = match.getPlayerBySlot(playerSlot);

  if (player === undefined) {
    return;
  }

  const coId = player.data.coId;

  const currentPower = player.data.powerMeter;
  const startCost = player.getPowerStarCost();
  const currentStarsFilled = currentPower / startCost;

  const coPowersInfo = getCOProperties(coId).powers;
  const coPowerCost = coPowersInfo.COPower?.stars;
  const coSuperCost = coPowersInfo.superCOPower?.stars;

  const income = player.getFundsPerTurn();

  const funds = player.data.funds;

  const units = player.getUnits();
  const unitCount = units.length;

  //const unitValue = //sum of unit.getBuildCost() * unit.getVisualHP()/10

  const unitValue = 0; // TODO: sum of unit.getBuildCost() * unit.getVisualHP()/10
};
