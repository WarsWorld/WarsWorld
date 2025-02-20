import { getCOProperties } from "shared/match-logic/co";
import { MatchWrapper } from "shared/wrappers/match";

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
  const unitValue = //sum of unit.getBuildCost() * unit.getVisualHP()/10
};
