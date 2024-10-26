import type { Position } from "shared/schemas/position";
import type { UnitType, WWUnit } from "shared/schemas/unit";
import type { MatchWrapper } from "shared/wrappers/match";
import { UnitWrapper } from "shared/wrappers/unit";

export const createPipeSeamUnitEquivalent = (
  match: MatchWrapper,
  attacker: UnitWrapper,
  pipeSeamPosition?: Position,
  pipeSeamHp?: number,
) => {
  const usedVersion = match.rules.gameVersion ?? attacker.player.data.coId.version;
  const unitEquivalent: WWUnit = {
    type: usedVersion === "AW1" ? "mediumTank" : "neoTank",
    playerSlot: -1,
    position: pipeSeamPosition ?? [0, 0],
    isReady: false,
    stats: {
      hp: pipeSeamHp ?? 99,
      fuel: 0,
      ammo: 0,
    },
  };
  return new UnitWrapper(unitEquivalent, match);
};

/**
 * Returns if unit is going to attack enemy unit with primary weapon or not
 */
export const canAttackWithPrimary = (attacker: UnitWrapper, defenderType: UnitType): boolean => {
  if (attacker.getAmmo() === 0 || attacker.getAmmo() === null) {
    return false;
  }

  return (
    attacker.player.getVersionProperties().damageChart[attacker.data.type]?.primary?.[
      defenderType
    ] !== undefined
  );
};

export const getBaseDamage = (attacker: UnitWrapper, defender: UnitWrapper): number | null => {
  const damageValues = attacker.player.getVersionProperties().damageChart[attacker.data.type];

  if (damageValues === undefined) {
    return null;
  }

  // hardcoded: hidden subs / stealth can only be damaged by cruiser+sub / fighter+stealth
  if (
    defender.data.type === "sub" &&
    "hidden" in defender.data &&
    defender.data.hidden &&
    attacker.data.type !== "sub" &&
    attacker.data.type !== "cruiser"
  ) {
    return null;
  }

  if (
    defender.data.type === "stealth" &&
    "hidden" in defender.data &&
    defender.data.hidden &&
    attacker.data.type !== "stealth" &&
    attacker.data.type !== "fighter"
  ) {
    return null;
  }

  const primaryDamage = damageValues.primary?.[defender.data.type] ?? null;
  const secondaryDamage = damageValues.secondary?.[defender.data.type] ?? null;
  const cantUsePrimaryWeapon = attacker.getAmmo() === 0 || attacker.getAmmo() === null;

  return cantUsePrimaryWeapon ? secondaryDamage : primaryDamage ?? secondaryDamage;
};

type DamageValues = Partial<Record<UnitType, number>>;

//secondary = machine gun, infinite ammo.
//some units don't have primary weapon (like infantry, recon)
type Weaponry = {
  primary?: DamageValues;
  secondary?: DamageValues;
};

export type DamageChart = Partial<Record<UnitType, Weaponry>>;

//if no game version is specified, all of them share the same dmg values
//otherwise, if a version doesn't appear, it uses the newer version (if AW1 is not present, it uses AW2 table)
const infantryWeaponry = {
  secondary: {
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
};
const mechWeaponry = {
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
};
const reconWeaponry = {
  secondary: {
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
};
const artilleryWeaponryAWDS = {
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
};
const artilleryWeaponryAW2 = {
  primary: {
    ...artilleryWeaponryAWDS.primary,
    cruiser: 65,
  },
};
const tankWeaponry = {
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
};
const antiAirWeaponryAWDS = {
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
};
const antiAirWeaponryAW2 = {
  primary: {
    ...antiAirWeaponryAWDS.primary,
    battleCopter: 120,
    transportCopter: 120,
  },
};
const missileWeaponry = {
  primary: {
    battleCopter: 120,
    transportCopter: 120,
    fighter: 100,
    bomber: 100,
    stealth: 100,
    blackBomb: 120,
  },
};
const rocketWeaponryAWDS = {
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
};
const rocketWeaponryAW2 = {
  primary: {
    ...rocketWeaponryAWDS.primary,
    tank: 85,
    cruiser: 85,
  },
};
const mediumTankWeaponryAWDS = {
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
};
const mediumTankWeaponryAW2 = {
  primary: {
    ...mediumTankWeaponryAWDS.primary,
    cruiser: 45,
  },
  secondary: {
    ...mediumTankWeaponryAWDS.secondary,
  },
};
const mediumTankWeaponryAW1 = {
  //xdd
  primary: {
    ...mediumTankWeaponryAWDS.primary,
    cruiser: 55,
  },
  secondary: {
    ...mediumTankWeaponryAWDS.secondary,
  },
};
const pipeRunnerWeaponry = {
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
};
const neoTankWeaponryAWDS = {
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
};
const neoTankWeaponryAW2 = {
  primary: {
    ...neoTankWeaponryAWDS.primary,
    cruiser: 50,
    battleship: 10,
  },
  secondary: {
    ...neoTankWeaponryAWDS.secondary,
  },
};
const megaTankWeaponry = {
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
};
const battleCopterWeaponryAWDS = {
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
};
const battleCopterWeaponryAW2 = {
  primary: {
    ...battleCopterWeaponryAWDS.primary,
    cruiser: 55,
  },
  secondary: {
    ...battleCopterWeaponryAWDS.secondary,
  },
};
const fighterWeaponryAWDS = {
  primary: {
    battleCopter: 120,
    transportCopter: 120,
    fighter: 55,
    bomber: 100,
    stealth: 85,
    blackBomb: 120,
  },
};
const fighterWeaponryAW2 = {
  primary: {
    ...fighterWeaponryAWDS.primary,
    battleCopter: 100,
    transportCopter: 100,
  },
};
const bomberWeaponryAWDS = {
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
};
const bomberWeaponryAW2 = {
  primary: {
    ...bomberWeaponryAWDS.primary,
    cruiser: 85,
  },
};
const stealthWeaponry = {
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
};
const cruiserWeaponryAWDS = {
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
};
const cruiserWeaponryAW2 = {
  primary: {
    // aw2 (and aw1) cruisers can only attack subs
    sub: 90,
  },
  secondary: {
    ...cruiserWeaponryAWDS.secondary,
    battleCopter: 115,
    transportCopter: 115,
    fighter: 55,
    bomber: 65,
  },
};
const subWeaponryAWDS = {
  primary: {
    lander: 95,
    cruiser: 25,
    sub: 55,
    battleship: 65,
    carrier: 75,
    blackBoat: 95,
  },
};
const subWeaponryAW2 = {
  primary: {
    ...subWeaponryAWDS.primary,
    battleship: 55,
  },
};
const battleshipWeaponryAWDS = {
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
};
const battleshipWeaponryAW2 = {
  primary: {
    ...battleshipWeaponryAWDS.primary,
    tank: 85,
  },
};
const carrierWeaponry = {
  primary: {
    battleCopter: 115,
    transportCopter: 115,
    fighter: 100,
    bomber: 100,
    stealth: 100,
    blackBomb: 120,
  },
};

export const damageChartAWDS: DamageChart = {
  infantry: infantryWeaponry,
  mech: mechWeaponry,
  recon: reconWeaponry,
  tank: tankWeaponry,
  mediumTank: mediumTankWeaponryAWDS,
  neoTank: neoTankWeaponryAWDS,
  megaTank: megaTankWeaponry,
  artillery: artilleryWeaponryAWDS,
  rocket: rocketWeaponryAWDS,
  antiAir: antiAirWeaponryAWDS,
  missile: missileWeaponry,
  pipeRunner: pipeRunnerWeaponry,
  battleCopter: battleCopterWeaponryAWDS,
  fighter: fighterWeaponryAWDS,
  bomber: bomberWeaponryAWDS,
  stealth: stealthWeaponry,
  cruiser: cruiserWeaponryAWDS,
  sub: subWeaponryAWDS,
  battleship: battleshipWeaponryAWDS,
  carrier: carrierWeaponry,
};

export const damageChartAW2: DamageChart = {
  //including more units than the game has cause whatever
  ...damageChartAWDS,
  mediumTank: mediumTankWeaponryAW2,
  neoTank: neoTankWeaponryAW2,
  artillery: artilleryWeaponryAW2,
  rocket: rocketWeaponryAW2,
  antiAir: antiAirWeaponryAW2,
  battleCopter: battleCopterWeaponryAW2,
  fighter: fighterWeaponryAW2,
  bomber: bomberWeaponryAW2,
  cruiser: cruiserWeaponryAW2,
  sub: subWeaponryAW2,
  battleship: battleshipWeaponryAW2,
};

export const damageChartAW1: DamageChart = {
  //including more units than the game has cause whatever
  ...damageChartAW2,
  mediumTank: mediumTankWeaponryAW1,
};
