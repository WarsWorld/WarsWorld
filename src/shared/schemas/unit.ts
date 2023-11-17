import { withType } from "shared/schemas/algebraic-datatypes";
import { ZodFirstPartyTypeKind, z } from "zod";
import type { PlayerSlot } from "./player-slot";
import type { Position } from "./position";
import {
  withAmmoUnitStatsSchema,
  withHiddenSchema,
  withNoAmmoUnitStatsSchema,
  unitInMapSharedPropertiesSchema,
} from "./unit-traits";

//LAND UNITS:
const creatableInfantrySchema = withNoAmmoUnitStatsSchema
  .extend(withType("infantry"))
  .extend({
    currentCapturePoints: z.number().positive().optional(),
  });

const creatableMechSchema = withAmmoUnitStatsSchema
  .extend(withType("mech"))
  .extend({
    currentCapturePoints: z.number().positive().optional(),
  });

const creatableSoldierSchema = z.discriminatedUnion("type", [
  creatableInfantrySchema,
  creatableMechSchema,
]);

const creatableAPCSchema = withNoAmmoUnitStatsSchema
  .extend(withType("apc"))
  .extend({
    loadedUnit: z.nullable(creatableSoldierSchema),
  });

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

const creatableLandUnitSchema = z.discriminatedUnion("type", [
  creatableInfantrySchema,
  creatableMechSchema,
  createReconSchema,
  creatableAPCSchema,
  creatableOtherLandUnitsWithAmmo,
]);

//AIR UNITS:
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

const creatableBomberAndFighterSchema = withAmmoUnitStatsSchema.extend({
  type: z.enum(["bomber", "fighter"]),
});

const creatableStealthSchema = withAmmoUnitStatsSchema
  .extend(withHiddenSchema.shape)
  .extend(withType("stealth"));

const creatableAirUnitSchema = z.discriminatedUnion("type", [
  creatableTransportCopterSchema,
  creatableBattleCopterSchema,
  creatableBlackBombSchema,
  creatableBomberAndFighterSchema,
  creatableStealthSchema,
]);

//SEA UNITS:
const creatableBlackBoatSchema = withNoAmmoUnitStatsSchema
  .extend(withType("blackBoat"))
  .extend({
    loadedUnit: z.nullable(creatableSoldierSchema),
    loadedUnit2: z.nullable(creatableSoldierSchema),
  });

const creatableLanderSchema = withNoAmmoUnitStatsSchema
  .extend(withType("lander"))
  .extend({
    loadedUnit: z.nullable(creatableLandUnitSchema),
    loadedUnit2: z.nullable(creatableLandUnitSchema),
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

const creatableBattleshipSchema = withAmmoUnitStatsSchema.extend(
  withType("battleship")
);

const creatableSubSchema = withAmmoUnitStatsSchema
  .extend(withHiddenSchema.shape)
  .extend(withType("sub"));

const creatableCarrierSchema = withAmmoUnitStatsSchema
  .extend(withType("carrier"))
  .extend({
    loadedUnit: z.nullable(creatableAirUnitSchema),
    loadedUnit2: z.nullable(creatableAirUnitSchema),
  });

//PIPE? UNITS:
const creatablePipeRunnerSchema = withAmmoUnitStatsSchema.extend(
  withType("pipeRunner")
);

const shared = unitInMapSharedPropertiesSchema;

const creatableUnitSchema = z.discriminatedUnion("type", [
  // this can't be easily mapped
  // because it'd be pushing the limits of zod or typescript i think
  shared.extend(creatableInfantrySchema.shape),
  shared.extend(creatableMechSchema.shape),
  shared.extend(createReconSchema.shape),
  shared.extend(creatableAPCSchema.shape),
  shared.extend(creatableOtherLandUnitsWithAmmo.shape),
  shared.extend(creatableTransportCopterSchema.shape),
  shared.extend(creatableBattleCopterSchema.shape),
  shared.extend(creatableBlackBombSchema.shape),
  shared.extend(creatableBlackBoatSchema.shape),
  shared.extend(creatableLanderSchema.shape),
  shared.extend(creatableCruiserSchema.shape),
  shared.extend(creatableBomberAndFighterSchema.shape),
  shared.extend(creatableStealthSchema.shape),
  shared.extend(creatableBattleshipSchema.shape),
  shared.extend(creatableSubSchema.shape),
  shared.extend(creatableCarrierSchema.shape),
  shared.extend(creatablePipeRunnerSchema.shape),
]);

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
  unit: creatableUnitSchema.optional(),
});
