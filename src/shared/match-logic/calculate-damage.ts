import type { LuckRoll } from "shared/schemas/co";
import { getDistance } from "shared/schemas/position";
import type { UnitWrapper } from "shared/wrappers/unit";
import type { CombatProps } from "./co-hooks";
import { getBaseDamage } from "./game-constants/base-damage";
import { getTerrainDefenseStars } from "./game-constants/terrain-properties";

/** @returns 1-10, whole numbers */
export const getVisualHPfromHP = (hp: number) => Math.ceil(hp / 10);

// unused yet
const _roundUpTo = (value: number, step: number) => {
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
  isCounterAttack: boolean,
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
  let attackModifier = attackHook?.(hookProps) ?? 100 + attacker.player.getCommtowerAttackBoost();

  if (isCounterAttack) {
    const dCoId = defender.player.data.coId;

    if (dCoId.name === "sonja" && (dCoId.version === "AW1" || dCoId.version === "AW2")) {
      attackModifier += 50; //aw1 and aw2 sonja d2d is +50% firepower on counters
    } else if (dCoId.name === "kanbei" && defender.player.data.COPowerState === "super-co-power") {
      if (dCoId.version === "AW2") {
        attackModifier *= 5 / 3; //aw2 kanbei with super deals x5/3 dmg on counters
      } else {
        attackModifier *= 2; //awds kanbei with super deals double dmg on counters
      }
    }
  }

  const attackerVersionProperties = attacker.player.getVersionProperties();

  if (attacker.player.data.COPowerState !== "no-power") {
    attackModifier = attackerVersionProperties.powerFirepowerMod(attackModifier);
  }

  const defenseHook = defender.player.getHook("defense");
  let defenseModifier = defenseHook?.(hookProps) ?? 100;

  if (defender.player.data.COPowerState !== "no-power") {
    defenseModifier = defender.player.getVersionProperties().powerDefenseMod(defenseModifier);
  }

  // luck calculations
  const goodLuckHook = attacker.player.getHook("maxGoodLuck");
  const maxGoodLuck = goodLuckHook?.(hookProps) ?? attackerVersionProperties.baseGoodLuck;
  const badLuckHook = attacker.player.getHook("maxBadLuck");
  const maxBadLuck = badLuckHook?.(hookProps) ?? attackerVersionProperties.baseBadLuck;

  //needs the special case luckRoll == 1 (so maxLuck = 1 gives expected results consistent with floor)
  const goodLuckValue =
    luckRoll.goodLuck === 1 ? maxGoodLuck - 1 : Math.floor(luckRoll.goodLuck * maxGoodLuck);
  const badLuckValue =
    luckRoll.badLuck === 1 ? maxBadLuck - 1 : Math.floor(luckRoll.badLuck * maxBadLuck);

  // terrain stars calculations
  const baseTerrainStars = getTerrainDefenseStars(defender.getTile().type);

  const terrainStarsDefenderHook = defender.player.getHook("terrainStars");
  let defenderTerrainStars =
    terrainStarsDefenderHook?.(baseTerrainStars, hookProps) ?? baseTerrainStars;

  if (attacker.player.data.coId.name === "sonja" && attacker.player.data.coId.version === "AWDS") {
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

  const attackFactor = Math.max(0, Math.floor(baseDamage * (attackModifier / 100) + luckModifier));

  const attackHPFactor = Math.floor(attackFactor * (visualHPOfAttacker / 10));

  const defenseFactor =
    Math.floor(200 - (defenseModifier + defenderTerrainStars * visualHPOfDefender)) / 100;

  const damageAsPercentage = Math.floor(attackHPFactor * defenseFactor);

  return damageAsPercentage;
};

//can return negative hp values (useful for damage calculator / displaying damage range)
export const calculateEngagementOutcome = (
  attacker: UnitWrapper,
  defender: UnitWrapper,
  attackerLuck: LuckRoll,
  defenderLuck: LuckRoll,
): { defenderHP: number; attackerHP: number | undefined } => {
  let damageByAttacker = calculateDamage(
    {
      attacker,
      defender,
    },
    attackerLuck,
    false,
  );

  if (damageByAttacker === null) {
    damageByAttacker = 0; // this is necessary cause sonja scop reverses attacker and defender
  }

  //check if ded
  if (damageByAttacker >= defender.getHP()) {
    return {
      defenderHP: defender.getHP() - damageByAttacker,
      attackerHP: undefined,
    };
  }

  //check if defender can counterattack
  if (getDistance(attacker.data.position, defender.data.position) === 1) {
    if ("attackRange" in defender.properties && defender.properties.attackRange[1] === 1) {
      //defender is melee, maybe can counterattack
      //temporarily subtract hp to calculate counter dmg
      const originalHP = defender.getHP();
      defender.setHp(originalHP - damageByAttacker);

      const damageByDefender = calculateDamage(
        {
          attacker: defender,
          defender: attacker,
        },
        defenderLuck,
        true,
      );

      defender.setHp(originalHP);

      if (damageByDefender !== null) {
        //return event with counter-attack
        return {
          defenderHP: defender.getHP() - damageByAttacker,
          attackerHP: attacker.getHP() - damageByDefender,
        };
      }
    }
  }

  return {
    defenderHP: defender.getHP() - damageByAttacker,
    attackerHP: undefined,
  };
};
