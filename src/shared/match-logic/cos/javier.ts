import { COProperties } from "../co";
import { getCommtowerAttackBoost } from "../co-utilities";
import { isIndirectAttackUnit } from "../units";

export const javier: COProperties = {
  displayName: "Javier",
  dayToDay: {
    description:
      "Units gain +20% defense against indirect units. Comm Towers grant all units additional +10% defense.",
    hooks: {
      onDefenseModifier({ currentValue, matchState, currentPlayerData }) {
        const commTowerBonus = getCommtowerAttackBoost(
          matchState,
          currentPlayerData.player.slot
        );

        const bonusFromIndirectAttacks = isIndirectAttackUnit(
          currentPlayerData.unitType
        )
          ? 20
          : 0;

        return currentValue + commTowerBonus + bonusFromIndirectAttacks;
      },
    },
  },
  powers: {
    COPower: {
      name: "Tower Shield",
      stars: 3,
      description:
        "Indirect defense is increased to +40%. Comm Tower bonuses are doubled.",
      hooks: {
        onDefenseModifier({
          matchState,
          currentValue,
          currentPlayerData,
          defendingPlayerData,
        }) {
          const commTowerBonus = getCommtowerAttackBoost(
            matchState,
            defendingPlayerData.player.slot
          );

          const bonusFromIndirectAttacks = isIndirectAttackUnit(
            currentPlayerData.unitType
          )
            ? 20 // 40 with d2d
            : 0;

          return currentValue + commTowerBonus + bonusFromIndirectAttacks;
        },
        onAttackModifier({ matchState, currentValue, currentPlayerData }) {
          const commTowerBonus = getCommtowerAttackBoost(
            matchState,
            currentPlayerData.player.slot
          );
          return currentValue + commTowerBonus;
        },
      },
    },
    superCOPower: {
      name: "Tower of Power",
      stars: 6,
      description:
        "Indirect defense is increased to +80%. Comm Tower bonuses are tripled.",
      hooks: {
        onDefenseModifier({
          matchState,
          currentValue,
          currentPlayerData,
          defendingPlayerData,
        }) {
          const commTowerBonus = getCommtowerAttackBoost(
            matchState,
            defendingPlayerData.player.slot
          );

          const bonusFromIndirectAttacks = isIndirectAttackUnit(
            currentPlayerData.unitType
          )
            ? 60 // 80 with d2d
            : 0;

          return currentValue + commTowerBonus * 2 + bonusFromIndirectAttacks;
        },
        onAttackModifier({ matchState, currentValue, currentPlayerData }) {
          const commTowerBonus = getCommtowerAttackBoost(
            matchState,
            currentPlayerData.player.slot
          );
          return currentValue + commTowerBonus * 2;
        },
      },
    },
  },
};
