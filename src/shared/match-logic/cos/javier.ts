import { COProperties } from "../co";
import { isIndirectAttackUnit } from "../units";

export const javier: COProperties = {
  displayName: "Javier",
  dayToDay: {
    description:
      "Units gain +20% defense against indirect units. Comm Towers grant all units additional +10% defense.",
    hooks: {
      onDefenseModifier(value, { attackerData: currentPlayerData }) {
        const bonusFromIndirectAttacks = isIndirectAttackUnit(
          currentPlayerData.unitType
        )
          ? 20
          : 0;

        return (
          value +
          currentPlayerData.player.getCommtowerAttackBoost() +
          bonusFromIndirectAttacks
        );
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
        onDefenseModifier(
          value,
          { attackerData: currentPlayerData, defenderData: defendingPlayerData }
        ) {
          const bonusFromIndirectAttacks = isIndirectAttackUnit(
            defendingPlayerData.unitType
          )
            ? 20 // 40 with d2d
            : 0;

          return (
            value +
            currentPlayerData.player.getCommtowerAttackBoost() +
            bonusFromIndirectAttacks
          );
        },
        onAttackModifier(value, { attackerData: currentPlayerData }) {
          return value + currentPlayerData.player.getCommtowerAttackBoost();
        },
      },
    },
    superCOPower: {
      name: "Tower of Power",
      stars: 6,
      description:
        "Indirect defense is increased to +80%. Comm Tower bonuses are tripled.",
      hooks: {
        onDefenseModifier(value, { defenderData: defendingPlayerData }) {
          const bonusFromIndirectAttacks = isIndirectAttackUnit(
            defendingPlayerData.unitType
          )
            ? 60 // 80 with d2d
            : 0;

          return (
            value +
            defendingPlayerData.player.getCommtowerAttackBoost() * 2 +
            bonusFromIndirectAttacks
          );
        },
        onAttackModifier(currentValue, { attackerData: currentPlayerData }) {
          return (
            currentValue +
            currentPlayerData.player.getCommtowerAttackBoost() * 2
          );
        },
      },
    },
  },
};
