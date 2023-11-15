import { withType } from "server/schemas/algebraic-datatypes";
import { ZodFirstPartyTypeKind, z } from "zod";
import { PlayerSlot } from "./player-slot";
import { Position } from "./position";
import {
  withAmmoUnitStatsSchema,
  withHiddenSchema,
  withNoAmmoUnitStatsSchema,
  unitInMapSharedPropertiesSchema,
} from "./unit-traits";

const creatableInfantrySchema = withNoAmmoUnitStatsSchema.extend(
  withType("infantry")
);

const creatableMechSchema = withAmmoUnitStatsSchema.extend(withType("mech"));

const creatableSoldierSchema = z.discriminatedUnion("type", [
  creatableInfantrySchema,
  creatableMechSchema,
]);

const creatableAPCSchema = withNoAmmoUnitStatsSchema
  .extend(withType("apc"))
  .extend({
    loadedUnit: z.nullable(creatableSoldierSchema),
  });

const creatableTransportCopterSchema = withNoAmmoUnitStatsSchema
  .extend(withType("transportCopter"))
  .extend({
    loadedUnit: z.nullable(creatableSoldierSchema),
  });

const creatableBattleCopterSchema = withAmmoUnitStatsSchema.extend(
  withType("battleCopter")
);

const creatableBlackBombSchema = withNoAmmoUnitStatsSchema.extend(
  withType("blackBomb")
);

const createReconSchema = withNoAmmoUnitStatsSchema.extend(withType("recon"));

const creatableOtherLandUnitsWithAmmo = withAmmoUnitStatsSchema.extend({
  type: z.enum([
    "artillery",
    "tank",
    "antiAir",
    "missile",
    "rocket",
    "mediumTank",
    "neoTank",
    "megaTank",
  ]),
});

const creatableBlackBoatSchema = withNoAmmoUnitStatsSchema
  .extend(withType("blackBoat"))
  .extend({
    loadedUnit: z.nullable(creatableSoldierSchema),
    loadedUnit2: z.nullable(creatableSoldierSchema),
  });

const creatableLanderSchema = withNoAmmoUnitStatsSchema
  .extend(withType("lander"))
  .extend({
    loadedUnit: z.nullable(
      z.discriminatedUnion("type", [
        creatableInfantrySchema,
        creatableMechSchema,
        createReconSchema,
        creatableAPCSchema,
        creatableOtherLandUnitsWithAmmo,
      ])
    ),
    loadedUnit2: z.nullable(
      z.discriminatedUnion("type", [
        creatableInfantrySchema,
        creatableMechSchema,
        createReconSchema,
        creatableAPCSchema,
        creatableOtherLandUnitsWithAmmo,
      ])
    ),
  });

const creatableCruiserSchema = withAmmoUnitStatsSchema
  .extend(withType("cruiser"))
  .extend({
    loadedUnit: z.nullable(
      z.discriminatedUnion("type", [
        creatableTransportCopterSchema,
        creatableBattleCopterSchema,
      ])
    ),
    loadedUnit2: z.nullable(
      z.discriminatedUnion("type", [
        creatableTransportCopterSchema,
        creatableBattleCopterSchema,
      ])
    ),
  });

const creatableBomberAndFighterSchema = withAmmoUnitStatsSchema.extend({
  type: z.enum(["bomber", "fighter"]),
});

const creatableStealthSchema = withAmmoUnitStatsSchema
  .extend(withHiddenSchema.shape)
  .extend(withType("stealth"));

const creatableBattleshipSchema = withAmmoUnitStatsSchema.extend(
  withType("battleship")
);

const creatableSubSchema = withAmmoUnitStatsSchema
  .extend(withHiddenSchema.shape)
  .extend(withType("sub"));

const creatableCarrierSchema = withAmmoUnitStatsSchema
  .extend(withType("carrier"))
  .extend({
    loadedUnit: z.nullable(
      z.discriminatedUnion("type", [
        creatableTransportCopterSchema,
        creatableBattleCopterSchema,
        creatableBomberAndFighterSchema,
        creatableStealthSchema,
      ])
    ),
    loadedUnit2: z.nullable(
      z.discriminatedUnion("type", [
        creatableTransportCopterSchema,
        creatableBattleCopterSchema,
        creatableBomberAndFighterSchema,
        creatableStealthSchema,
      ])
    ),
  });

const creatablePipeRunnerSchema = withAmmoUnitStatsSchema.extend(
  withType("pipeRunner")
);

export const creatableUnitSchema = z.discriminatedUnion("type", [
  // this can't be easily mapped
  // because it'd be pushing the limits of zod or typescript i think
  unitInMapSharedPropertiesSchema.extend(creatableInfantrySchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatableMechSchema.shape),
  unitInMapSharedPropertiesSchema.extend(createReconSchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatableAPCSchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatableOtherLandUnitsWithAmmo.shape),
  unitInMapSharedPropertiesSchema.extend(creatableTransportCopterSchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatableBattleCopterSchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatableBlackBombSchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatableBlackBoatSchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatableLanderSchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatableCruiserSchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatableBomberAndFighterSchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatableStealthSchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatableBattleshipSchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatableSubSchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatableCarrierSchema.shape),
  unitInMapSharedPropertiesSchema.extend(creatablePipeRunnerSchema.shape),
]);

/** These units have a weapon, and have finite ammo. */
export const unitWithAmmoSchema = z.discriminatedUnion("type", [
  creatableMechSchema,
  creatableBattleCopterSchema,
  creatableOtherLandUnitsWithAmmo,
  creatableCruiserSchema,
  creatableBomberAndFighterSchema,
  creatableStealthSchema,
  creatableBattleshipSchema,
  creatableSubSchema,
  creatableCarrierSchema,
  creatablePipeRunnerSchema,
]);

/**
 * These units do *not* have a weapon.
 * Specifically, they have no "Attack" option.
 * Note: "Black Bomb" can "Explode", which deals damage but is not an attack.ts.
 */
export const unitWithoutWeaponSchema = z.discriminatedUnion("type", [
  creatableAPCSchema,
  creatableBlackBoatSchema,
  creatableBlackBombSchema,
  creatableLanderSchema,
  creatableTransportCopterSchema,
]);

/** These units have a weapon, but the weapon has infinite ammo */
export const unitWithoutAmmoSchema = z.discriminatedUnion("type", [
  creatableInfantrySchema,
  createReconSchema,
]);

const unitTypesWithAmmo: string[] = [
  // TODO derive this from `unitWithAmmoSchema`
  "mech",
  "battleCopter",
  "artillery",
  "tank",
  "antiAir",
  "missile",
  "rocket",
  "mediumTank",
  "neoTank",
  "megaTank",
  "cruiser",
  "bomber",
  "fighter",
  "stealth",
  "battleship",
  "sub",
  "carrier",
  "pipeRunner",
] satisfies UnitType[];

export const unitTypeIsUnitWithAmmo = (
  unitType: UnitType
): unitType is WithAmmoUnitType => {
  return unitTypesWithAmmo.includes(unitType);
};

const transportUnitTypes = [
  "apc",
  "transportCopter",
  "blackBoat",
  "lander",
  "cruiser",
  "carrier",
] satisfies UnitType[];

export const unitTypeIsTransport = (
  unitType: UnitType
): unitType is (typeof transportUnitTypes)[number] =>
  (transportUnitTypes as string[]).includes(unitType);

export type WithoutAmmoUnitType = z.infer<typeof unitWithoutAmmoSchema>["type"];
export type WithoutWeaponUnitType = z.infer<
  typeof unitWithoutWeaponSchema
>["type"];
export type WithAmmoUnitType = z.infer<typeof unitWithAmmoSchema>["type"];

export type WWUnit = z.infer<typeof creatableUnitSchema>;

export type UnitType = WWUnit["type"];

/**
 * i would usually extract the following into a function with a good name
 * like "indexDiscriminatedUnionSchema"
 * but that would require that either i give up type safety
 * for this (doesn't make any sense, that's the point of zod)
 * or i write types to make this generic which will be literally
 * the deepest and ugliest of all hells.
 * so it must stay here unless someone sacrifices their firstborn at moonlight
 * to an eldritch god and receives the forbidden types that will actually
 * make this work in a generic way.
 * yes, i think this comment is probably still shorter
 * than the types you'd need to write.
 */
const unitTypes = creatableUnitSchema.options.flatMap((option) => {
  const { _def } = option._def.shape().type;

  if (_def.typeName === ZodFirstPartyTypeKind.ZodLiteral) {
    return _def.value;
  }

  return _def.values;
});

type WhatZodWants = [(typeof unitTypes)[number], ...typeof unitTypes];
export const unitTypeSchema = z.enum(unitTypes as WhatZodWants);

export type WWHiddenUnit = {
  type: UnitType;
  playerSlot: PlayerSlot;
  stats: "hidden";
  position: Position;
};

export type FrontendUnit = WWUnit | WWHiddenUnit;

export const withUnit = z.object({
  unit: z.nullable(creatableUnitSchema),
});
