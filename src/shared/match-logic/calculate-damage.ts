import type { CombatProps } from "./co-hooks";
import { getTerrainDefenseStars } from "./game-constants/terrain-properties";
import { getBaseDamage } from "./game-constants/base-damage";
import type { LuckRoll } from "./events/handlers/attack";
import { versionPropertiesMap } from "./game-constants/version-properties";

/** @returns 1-10, whole numbers */
export const getVisualHPfromHP = (hp: number) => Math.ceil(hp / 10);

const roundUpTo = (value: number, step: number) => {
  const scalingFactor = 1 / step;
  return Math.ceil(value * scalingFactor) / scalingFactor;
};

/**
 * @param luckRoll contains goodLuck roll and badLuck roll
 * goodLuck roll number between 0 and 1: 1 = max luck, 0 = no luck
 * badLuck roll same as goodLuck roll (but not always used): 1 = max bad luck, 0 = no bad luck
 * @param isCounterAttack only used for sonja d2d and kanbei during scop (bonus counterattack damage).
 *
 * @see https://awbw.fandom.com/wiki/Damage_Formula?so=search
 */
export const calculateDamage = (
  { attacker, defender }: CombatProps,
  luckRoll: LuckRoll,
  isCounterAttack: boolean
) => {
  const baseDamage = getBaseDamage(attacker, defender);

  // null baseDamage = unit can't attack this other unit
  if (baseDamage === null) {
    return null;
  }

  const visualHPOfAttacker = getVisualHPfromHP(attacker.getHP());
  const visualHPOfDefender = getVisualHPfromHP(defender.getHP());

  const hookProps: CombatProps = { attacker, defender };

  // attack and defense multipliers
  const attackHook = attacker.player.getHook("attack");
  let attackModifier =
    attackHook?.(hookProps) ?? 100
    + attacker.player.getCommtowerAttackBoost();

  if (isCounterAttack) {
    const dCoId = defender.player.data.coId;

    if (dCoId.name === "sonja" && (dCoId.version === "AW1" || dCoId.version === "AW2")) {
      attackModifier += 50; //aw1 and aw2 sonja d2d is +50% firepower on counters
    } else if (dCoId.name === "kanbei" && defender.player.data.COPowerState === "super-co-power") {
      if (dCoId.version === "AW2") {
        attackModifier *= 5/3; //aw2 kanbei with super deals x5/3 dmg on counters
      } else {
        attackModifier *= 2; //awds kanbei with super deals double dmg on counters
      }
    }
  }

  const versionProperties = versionPropertiesMap[attacker.match.rules.gameVersion];

  if (attacker.player.data.COPowerState !== "no-power") {
    attackModifier = versionProperties.powerFirepowerMod(attackModifier);
  }

  const defenseHook = defender.player.getHook("defense");
  let defenseModifier = defenseHook?.(hookProps) ?? 100;

  if (defender.player.data.COPowerState !== "no-power") {
    defenseModifier = versionProperties.powerDefenseMod(defenseModifier);
  }

  // luck calculations
  const goodLuckHook = attacker.player.getHook("maxGoodLuck");
  const maxGoodLuck = goodLuckHook?.(hookProps) ?? versionProperties.baseGoodLuck;
  const badLuckHook = attacker.player.getHook("maxBadLuck");
  const maxBadLuck = badLuckHook?.(hookProps) ?? versionProperties.baseBadLuck;

  const goodLuckValue = luckRoll.goodLuck * maxGoodLuck;
  const badLuckValue = luckRoll.badLuck * maxBadLuck;

  // terrain stars calculations
  const baseTerrainStars = getTerrainDefenseStars(
    defender.getTile().type
  );

  const terrainStarsDefenderHook = defender.player.getHook("terrainStars");
  let defenderTerrainStars =
    terrainStarsDefenderHook?.(baseTerrainStars, hookProps) ?? baseTerrainStars;

  if (attacker.player.data.coId.name === "sonja" &&
    attacker.player.data.coId.version === "AWDS") {
    // hmm ackshually, if sonja pops powers before lash, outcome is different than popping after lash
    switch (attacker.player.data.COPowerState) {
      case "no-power": {
        defenderTerrainStars = Math.max(0, defenderTerrainStars - 1);
        break;
      }
      case "co-power": {
        defenderTerrainStars = Math.max(0, defenderTerrainStars - 2);
        break;
      }
      case "super-co-power": {
        defenderTerrainStars = Math.max(0, defenderTerrainStars - 3);
        break;
      }
    }
  }

  // TODO explain magic values
  // damage formula application
  const luckModifier = goodLuckValue - badLuckValue;
  const attackFactor = baseDamage * (attackModifier / 100) + luckModifier;
  const defenseFactor =
    (200 - (defenseModifier + defenderTerrainStars * visualHPOfDefender)) /
    100;

  const dirtyDamageAsPercentage =
    attackFactor * (visualHPOfAttacker / 10) * defenseFactor;

  return Math.floor(roundUpTo(dirtyDamageAsPercentage, 0.05));
};
