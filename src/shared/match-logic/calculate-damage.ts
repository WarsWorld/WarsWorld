import { Position } from "server/schemas/position";
import { UnitType, WWUnit } from "server/schemas/unit";
import { MatchWrapper } from "shared/wrappers/match";
import { getTerrainDefenseStars } from "./tiles";

const getBaseDamage = (
  attackerUnit: WWUnit,
  defenderUnit: WWUnit
): number | null => {
  const damageTable = damageMatrix[attackerUnit.type];

  if (damageTable === undefined) {
    return null;
  }

  const primaryDamage = damageTable.primary[defenderUnit.type] ?? null;
  const secondaryDamage = damageTable.secondary?.[defenderUnit.type] ?? null;
  const cantUsePrimaryWeapon =
    "ammo" in attackerUnit.stats && attackerUnit.stats.ammo === 0;

  return cantUsePrimaryWeapon
    ? secondaryDamage
    : primaryDamage ?? secondaryDamage;
};

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
  matchState: MatchWrapper,
  attackerPosition: Position,
  defenderPosition: Position
) => {
  const COHooks = matchState.players
    .getCurrentTurnPlayer()
    .getCOHooksWithDefender(attackerPosition, defenderPosition);
  const attackerUnit = matchState.units.getUnitOrThrow(attackerPosition);
  const defenderUnit = matchState.units.getUnitOrThrow(defenderPosition);

  const COHookProps = matchState.getCOHookPropsWithDefender(
    attackerPosition,
    defenderPosition
  );

  const visualHPOfAttacker = getVisualHPfromHP(attackerUnit.stats.hp);
  const visualHPOfDefender = getVisualHPfromHP(defenderUnit.stats.hp);

  const attackModifier =
    COHooks.onAttackModifier(100) +
    matchState.players.getCurrentTurnPlayer().getCommtowerAttackBoost();

  /** TODO are you dense? these are ATTACKER hooks, not DEFENDER. */
  const defenseModifier = COHooks.onDefenseModifier(100);

  // base luck: 0-9, whole numbers i think
  const goodLuckValue = COHooks.onGoodLuck(Math.floor(Math.random() * 10));
  const badLuckValue = COHooks.onBadLuck(0);

  // 0-4 (+ lash COP) whole numbers
  const terrainStars = COHooks.onTerrainStars(
    getTerrainDefenseStars(COHookProps.defenderData.tileType)
  );

  // baseDamage: 1-100
  const baseDamage = getBaseDamage(attackerUnit, defenderUnit);

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

type DamageTable = Partial<Record<UnitType, number>>;

type Weaponry = {
  primary: DamageTable;
  secondary?: DamageTable;
};

type DamageMatrix = Partial<Record<UnitType, Weaponry>>;

const damageMatrix: DamageMatrix = {
  mech: {
    primary: {
      recon: 85,
      tank: 55,
      mediumTank: 15,
      neoTank: 15,
      megaTank: 5,
      apc: 75,
      artillery: 70,
      rocket: 85,
      antiAir: 65,
      missile: 85,
      pipeRunner: 55,
    },
    secondary: {
      infantry: 65,
      mech: 55,
      recon: 18,
      tank: 6,
      mediumTank: 1,
      neoTank: 1,
      megaTank: 1,
      apc: 20,
      artillery: 32,
      rocket: 35,
      antiAir: 6,
      missile: 35,
      pipeRunner: 6,
      battleCopter: 9,
      transportCopter: 35,
    },
  },
  artillery: {
    primary: {
      infantry: 90,
      mech: 85,
      recon: 80,
      tank: 70,
      mediumTank: 45,
      neoTank: 40,
      megaTank: 15,
      apc: 70,
      artillery: 75,
      rocket: 80,
      antiAir: 75,
      missile: 80,
      pipeRunner: 70,
      lander: 55,
      cruiser: 50,
      sub: 60,
      battleship: 40,
      carrier: 45,
      blackBoat: 55,
    },
  },
  tank: {
    primary: {
      recon: 85,
      tank: 55,
      mediumTank: 15,
      neoTank: 15,
      megaTank: 10,
      apc: 75,
      artillery: 70,
      rocket: 85,
      antiAir: 65,
      missile: 85,
      pipeRunner: 55,
      lander: 10,
      cruiser: 5,
      sub: 1,
      battleship: 1,
      carrier: 1,
      blackBoat: 10,
    },
    secondary: {
      infantry: 75,
      mech: 70,
      recon: 40,
      tank: 6,
      mediumTank: 1,
      neoTank: 1,
      megaTank: 1,
      apc: 45,
      artillery: 45,
      rocket: 55,
      antiAir: 5,
      missile: 30,
      pipeRunner: 6,
      battleCopter: 10,
      transportCopter: 40,
    },
  },
  antiAir: {
    primary: {
      infantry: 105,
      mech: 105,
      recon: 60,
      tank: 25,
      mediumTank: 10,
      neoTank: 5,
      megaTank: 1,
      apc: 50,
      artillery: 50,
      rocket: 45,
      antiAir: 45,
      missile: 55,
      pipeRunner: 25,
      battleCopter: 105,
      transportCopter: 105,
      fighter: 65,
      bomber: 75,
      stealth: 75,
      blackBomb: 120,
    },
  },
  missile: {
    primary: {
      battleCopter: 120,
      transportCopter: 120,
      fighter: 100,
      bomber: 100,
      stealth: 100,
      blackBomb: 120,
    },
  },
  rocket: {
    primary: {
      infantry: 95,
      mech: 90,
      recon: 90,
      tank: 80,
      mediumTank: 55,
      neoTank: 50,
      megaTank: 25,
      apc: 80,
      artillery: 80,
      rocket: 85,
      antiAir: 85,
      missile: 90,
      pipeRunner: 80,
      lander: 60,
      cruiser: 60,
      sub: 85,
      battleship: 55,
      carrier: 60,
      blackBoat: 60,
    },
  },
  mediumTank: {
    primary: {
      recon: 105,
      tank: 85,
      mediumTank: 55,
      neoTank: 45,
      megaTank: 25,
      apc: 105,
      artillery: 105,
      rocket: 105,
      antiAir: 105,
      missile: 105,
      pipeRunner: 85,
      lander: 35,
      cruiser: 30,
      sub: 10,
      battleship: 10,
      carrier: 10,
      blackBoat: 35,
    },
    secondary: {
      infantry: 105,
      mech: 95,
      recon: 45,
      tank: 8,
      mediumTank: 1,
      neoTank: 1,
      megaTank: 1,
      apc: 45,
      artillery: 45,
      rocket: 55,
      antiAir: 7,
      missile: 35,
      pipeRunner: 7,
      battleCopter: 12,
      transportCopter: 45,
    },
  },
  pipeRunner: {
    primary: {
      infantry: 95,
      mech: 90,
      recon: 90,
      tank: 80,
      mediumTank: 55,
      neoTank: 50,
      megaTank: 25,
      apc: 80,
      artillery: 80,
      rocket: 85,
      antiAir: 85,
      missile: 90,
      pipeRunner: 80,
      battleCopter: 105,
      transportCopter: 105,
      fighter: 65,
      bomber: 75,
      stealth: 75,
      blackBomb: 105,
      lander: 60,
      cruiser: 60,
      sub: 85,
      battleship: 55,
      carrier: 60,
      blackBoat: 60,
    },
  },
  neoTank: {
    primary: {
      recon: 125,
      tank: 105,
      mediumTank: 75,
      neoTank: 55,
      megaTank: 35,
      apc: 125,
      artillery: 115,
      rocket: 125,
      antiAir: 115,
      missile: 125,
      pipeRunner: 105,
      lander: 40,
      cruiser: 30,
      sub: 15,
      battleship: 15,
      carrier: 15,
      blackBoat: 40,
    },
    secondary: {
      infantry: 125,
      mech: 115,
      recon: 65,
      tank: 10,
      mediumTank: 1,
      neoTank: 1,
      megaTank: 1,
      apc: 65,
      artillery: 65,
      rocket: 75,
      antiAir: 17,
      missile: 55,
      pipeRunner: 17,
      battleCopter: 22,
      transportCopter: 55,
    },
  },
  megaTank: {
    primary: {
      recon: 185,
      tank: 180,
      mediumTank: 125,
      neoTank: 115,
      megaTank: 65,
      apc: 195,
      artillery: 195,
      rocket: 195,
      antiAir: 195,
      missile: 195,
      pipeRunner: 180,
      lander: 75,
      cruiser: 65,
      sub: 45,
      battleship: 45,
      carrier: 45,
      blackBoat: 105,
    },
    secondary: {
      infantry: 135,
      mech: 125,
      recon: 65,
      tank: 10,
      mediumTank: 1,
      neoTank: 1,
      megaTank: 1,
      apc: 65,
      artillery: 65,
      rocket: 75,
      antiAir: 17,
      missile: 55,
      pipeRunner: 17,
      battleCopter: 22,
      transportCopter: 55,
    },
  },
  battleCopter: {
    primary: {
      recon: 55,
      tank: 55,
      mediumTank: 25,
      neoTank: 20,
      megaTank: 10,
      apc: 60,
      artillery: 65,
      rocket: 65,
      antiAir: 25,
      missile: 65,
      pipeRunner: 55,
      lander: 25,
      cruiser: 25,
      sub: 25,
      battleship: 25,
      carrier: 25,
      blackBoat: 25,
    },
    secondary: {
      infantry: 75,
      mech: 75,
      recon: 30,
      tank: 6,
      mediumTank: 1,
      neoTank: 1,
      megaTank: 1,
      apc: 20,
      artillery: 25,
      rocket: 35,
      antiAir: 6,
      missile: 35,
      pipeRunner: 6,
      battleCopter: 65,
      transportCopter: 95,
    },
  },
  fighter: {
    primary: {
      battleCopter: 120,
      transportCopter: 120,
      fighter: 55,
      bomber: 100,
      stealth: 85,
      blackBomb: 120,
    },
  },
  bomber: {
    primary: {
      infantry: 110,
      mech: 110,
      recon: 105,
      tank: 105,
      mediumTank: 95,
      neoTank: 90,
      megaTank: 35,
      apc: 105,
      artillery: 105,
      rocket: 105,
      antiAir: 95,
      missile: 105,
      pipeRunner: 105,
      lander: 95,
      cruiser: 50,
      sub: 95,
      battleship: 75,
      carrier: 75,
      blackBoat: 105,
    },
  },
  stealth: {
    primary: {
      infantry: 90,
      mech: 90,
      recon: 85,
      tank: 75,
      mediumTank: 70,
      neoTank: 60,
      megaTank: 15,
      apc: 85,
      artillery: 75,
      rocket: 85,
      antiAir: 50,
      missile: 85,
      pipeRunner: 80,
      battleCopter: 85,
      transportCopter: 95,
      fighter: 45,
      bomber: 70,
      stealth: 55,
      blackBomb: 120,
      lander: 65,
      cruiser: 35,
      sub: 55,
      battleship: 45,
      carrier: 45,
      blackBoat: 65,
    },
  },
  cruiser: {
    primary: {
      lander: 25,
      cruiser: 25,
      sub: 90,
      battleship: 5,
      carrier: 5,
      blackBoat: 25,
    },
    secondary: {
      battleCopter: 105,
      transportCopter: 105,
      fighter: 85,
      bomber: 100,
      stealth: 100,
      blackBomb: 120,
    },
  },
  sub: {
    primary: {
      lander: 95,
      cruiser: 25,
      sub: 55,
      battleship: 65,
      carrier: 75,
      blackBoat: 95,
    },
  },
  battleship: {
    primary: {
      infantry: 95,
      mech: 90,
      recon: 90,
      tank: 80,
      mediumTank: 55,
      neoTank: 50,
      megaTank: 25,
      apc: 80,
      artillery: 80,
      rocket: 85,
      antiAir: 85,
      missile: 90,
      pipeRunner: 80,
      lander: 95,
      cruiser: 95,
      sub: 95,
      battleship: 50,
      carrier: 60,
      blackBoat: 95,
    },
  },
  carrier: {
    primary: {
      battleCopter: 115,
      transportCopter: 115,
      fighter: 100,
      bomber: 100,
      stealth: 100,
      blackBomb: 120,
    },
  },
  infantry: {
    primary: {
      infantry: 55,
      mech: 45,
      recon: 12,
      tank: 5,
      mediumTank: 1,
      neoTank: 1,
      megaTank: 1,
      apc: 14,
      artillery: 15,
      rocket: 25,
      antiAir: 5,
      missile: 25,
      pipeRunner: 5,
      battleCopter: 7,
      transportCopter: 30,
    },
  },
  recon: {
    primary: {
      infantry: 70,
      mech: 65,
      recon: 35,
      tank: 6,
      mediumTank: 1,
      neoTank: 1,
      megaTank: 1,
      apc: 45,
      artillery: 45,
      rocket: 55,
      antiAir: 4,
      missile: 28,
      pipeRunner: 6,
      battleCopter: 10,
      transportCopter: 35,
    },
  },
};
