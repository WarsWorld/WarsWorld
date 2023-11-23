import type { Position } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import { getTerrainDefenseStars } from "../terrain";
import { getBaseDamage } from "./base-damage";
import { getCombatHooks } from "./combat-hooks";

/** @returns 1-10, whole numbers */
export const getVisualHPfromHP = (hp: number) => Math.ceil(hp / 10);

const roundUpTo = (value: number, step: number) => {
  const scalingFactor = 1 / step;
  return Math.ceil(value * scalingFactor) / scalingFactor;
};

/**
 * @see https://awbw.fandom.com/wiki/Damage_Formula?so=search
 */
export const calculateDamage = (
  match: MatchWrapper,
  attackerPosition: Position,
  defenderPosition: Position
) => {
  const attacker = match.units.getUnitOrThrow(attackerPosition);
  const defender = match.units.getUnitOrThrow(defenderPosition);

  const hooks = getCombatHooks(attacker, defender);

  const visualHPOfAttacker = getVisualHPfromHP(attacker.data.stats.hp);
  const visualHPOfDefender = getVisualHPfromHP(defender.data.stats.hp);

  const attackModifier =
    hooks.onAttackModifier(100) +
    match.players.getCurrentTurnPlayer().getCommtowerAttackBoost();

  /** TODO are you dense? these are ATTACKER hooks, not DEFENDER. */
  const defenseModifier = hooks.onDefenseModifier(100);

  // base luck: 0-9, whole numbers i think
  const goodLuckValue = hooks.onGoodLuck(Math.floor(Math.random() * 10));
  const badLuckValue = hooks.onBadLuck(0);

  // 0-4 (+ lash COP) whole numbers
  const terrainStars = hooks.onTerrainStars(
    getTerrainDefenseStars(match.getTile(defenderPosition).type)
  );

  // baseDamage: 1-100
  const baseDamage = getBaseDamage(attacker, defender);

  if (baseDamage === null) {
    return null;
  }

  const luckModifier = goodLuckValue - badLuckValue;
  const attackFactor = (baseDamage * attackModifier) / 100 + luckModifier;
  const defenseFactor =
    (200 - (defenseModifier + terrainStars * visualHPOfDefender)) / 100;

  const dirtyDamageAsPercentage =
    attackFactor * (visualHPOfAttacker / 10) * defenseFactor;

  return Math.floor(roundUpTo(dirtyDamageAsPercentage, 0.05));
};
