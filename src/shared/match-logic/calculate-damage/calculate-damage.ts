import type { CombatProps } from "../co-hooks";
import { getTerrainDefenseStars } from "../terrain";
import { getBaseDamage } from "./base-damage";

/** @returns 1-10, whole numbers */
export const getVisualHPfromHP = (hp: number) => Math.ceil(hp / 10);

const roundUpTo = (value: number, step: number) => {
  const scalingFactor = 1 / step;
  return Math.ceil(value * scalingFactor) / scalingFactor;
};

/**
 * @param {number} luckValue number between 0 and 1, will be rounded down by 0.1
 * (0.0, 0.1, ... 0.9, 1.0)
 *
 * @see https://awbw.fandom.com/wiki/Damage_Formula?so=search
 */
export const calculateDamage = (
  { attacker, defender }: CombatProps,
  luckValue: number
) => {
  const visualHPOfAttacker = getVisualHPfromHP(attacker.getHP());
  const visualHPOfDefender = getVisualHPfromHP(defender.getHP());

  const hookProps: CombatProps = { attacker, defender };

  // TODO is this correct or needlessly complicated to start with a
  // commtower-affected multiplier value?
  const attackHook = attacker.player.getHook("attack");
  const modifiedAttack = attackHook?.(hookProps) ?? 100;

  const attackModifier =
    modifiedAttack + attacker.player.getCommtowerAttackBoost();

  const defenseHook = defender.player.getHook("defense");
  const defenseModifier = defenseHook?.(hookProps) ?? 100;

  // base luck: 0-9, whole numbers i think
  //const goodLuckRoll = Math.floor(luckValue * 10);
  const goodLuckHook = attacker.player.getHook("maxGoodLuck");
  const maxGoodLuck = goodLuckHook?.(hookProps) ?? 10; // TODO this 10 should be inside match rules
  const badLuckHook = attacker.player.getHook("maxBadLuck");
  const maxBadLuck = badLuckHook?.(hookProps) ?? 0;

  const goodLuckValue = luckValue * maxGoodLuck;
  const badLuckValue = 1 * maxBadLuck; // TODO this function should get goodLuckRoll and badLuckRoll (also change name of param)

  // 0-4 (+ lash COP) whole numbers
  const baseTerrainStars = getTerrainDefenseStars(
    defender.getTileOrThrow().type
  );

  const terrainStarsHook = attacker.player.getHook("terrainStars");
  const terrainStars =
    terrainStarsHook?.(baseTerrainStars, hookProps) ?? baseTerrainStars;

  // TODO maybe the attack hook should be applied here instead?

  // baseDamage: 1-100
  const baseDamage = getBaseDamage(attacker, defender);

  if (baseDamage === null) {
    return null;
  }

  // TODO explain magic values

  const luckModifier = goodLuckValue - badLuckValue;
  const attackFactor = (baseDamage * attackModifier) / 100 + luckModifier;
  const defenseFactor =
    (200 - (defenseModifier + terrainStars * visualHPOfDefender)) / 100;

  const dirtyDamageAsPercentage =
    attackFactor * (visualHPOfAttacker / 10) * defenseFactor;

  return Math.floor(roundUpTo(dirtyDamageAsPercentage, 0.05));
};
