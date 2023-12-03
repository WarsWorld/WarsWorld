import { withType } from "shared/schemas/algebraic-datatypes";
import { ZodFirstPartyTypeKind, z } from "zod";
import {
  unitInMapSharedPropertiesSchema,
  withAmmoUnitStatsSchema,
  withHiddenSchema,
  withNoAmmoUnitStatsSchema
} from "./unit-traits";

//LAND UNITS:
const infantrySchema = withNoAmmoUnitStatsSchema
  .extend(withType("infantry"))
  .extend({
    currentCapturePoints: z.number().positive().optional()
  });

// TODO replace unit capture points with tile HP
const mechSchema = withAmmoUnitStatsSchema.extend(withType("mech")).extend({
  currentCapturePoints: z.number().positive().optional()
});

const soldierSchema = z.discriminatedUnion("type", [
  infantrySchema,
  mechSchema
]);

const APCSchema = withNoAmmoUnitStatsSchema.extend(withType("apc")).extend({
  loadedUnit: z.nullable(soldierSchema)
});

const reconSchema = withNoAmmoUnitStatsSchema.extend(withType("recon"));

const otherLandUnitsWithAmmo = withAmmoUnitStatsSchema.extend({
  type: z.enum([
    "artillery",
    "tank",
    "antiAir",
    "missile",
    "rocket",
    "mediumTank",
    "neoTank",
    "megaTank"
  ])
});

const landUnitSchema = z.discriminatedUnion("type", [
  infantrySchema,
  mechSchema,
  reconSchema,
  APCSchema,
  otherLandUnitsWithAmmo
]);

//AIR UNITS:
const transportCopterSchema = withNoAmmoUnitStatsSchema
  .extend(withType("transportCopter"))
  .extend({
    loadedUnit: z.nullable(soldierSchema)
  });

const battleCopterSchema = withAmmoUnitStatsSchema.extend(
  withType("battleCopter")
);

const blackBombSchema = withNoAmmoUnitStatsSchema.extend(withType("blackBomb"));

const bomberAndFighterSchema = withAmmoUnitStatsSchema.extend({
  type: z.enum(["bomber", "fighter"])
});

const stealthSchema = withAmmoUnitStatsSchema
  .extend(withHiddenSchema.shape)
  .extend(withType("stealth"));

const airUnitSchema = z.discriminatedUnion("type", [
  transportCopterSchema,
  battleCopterSchema,
  blackBombSchema,
  bomberAndFighterSchema,
  stealthSchema
]);

//SEA UNITS:
const blackBoatSchema = withNoAmmoUnitStatsSchema
  .extend(withType("blackBoat"))
  .extend({
    loadedUnit: z.nullable(soldierSchema),
    loadedUnit2: z.nullable(soldierSchema)
  });

const landerSchema = withNoAmmoUnitStatsSchema
  .extend(withType("lander"))
  .extend({
    loadedUnit: z.nullable(landUnitSchema),
    loadedUnit2: z.nullable(landUnitSchema)
  });

const cruiserSchema = withAmmoUnitStatsSchema
  .extend(withType("cruiser"))
  .extend({
    loadedUnit: z.nullable(
      z.discriminatedUnion("type", [transportCopterSchema, battleCopterSchema])
    ),
    loadedUnit2: z.nullable(
      z.discriminatedUnion("type", [transportCopterSchema, battleCopterSchema])
    )
  });

const battleshipSchema = withAmmoUnitStatsSchema.extend(withType("battleship"));

const subSchema = withAmmoUnitStatsSchema
  .extend(withHiddenSchema.shape)
  .extend(withType("sub"));

const carrierSchema = withAmmoUnitStatsSchema
  .extend(withType("carrier"))
  .extend({
    loadedUnit: z.nullable(airUnitSchema),
    loadedUnit2: z.nullable(airUnitSchema)
  });

//PIPE? UNITS:
const pipeRunnerSchema = withAmmoUnitStatsSchema.extend(withType("pipeRunner"));

const shared = unitInMapSharedPropertiesSchema;

export const unitSchema = z.discriminatedUnion("type", [
  // this can't be easily mapped
  // because it'd be pushing the limits of zod or typescript i think
  shared.extend(infantrySchema.shape),
  shared.extend(mechSchema.shape),
  shared.extend(reconSchema.shape),
  shared.extend(APCSchema.shape),
  shared.extend(otherLandUnitsWithAmmo.shape),
  shared.extend(transportCopterSchema.shape),
  shared.extend(battleCopterSchema.shape),
  shared.extend(blackBombSchema.shape),
  shared.extend(blackBoatSchema.shape),
  shared.extend(landerSchema.shape),
  shared.extend(cruiserSchema.shape),
  shared.extend(bomberAndFighterSchema.shape),
  shared.extend(stealthSchema.shape),
  shared.extend(battleshipSchema.shape),
  shared.extend(subSchema.shape),
  shared.extend(carrierSchema.shape),
  shared.extend(pipeRunnerSchema.shape)
]);

export type UnitWithVisibleStats = z.infer<typeof unitSchema>;

export type UnitType = UnitWithVisibleStats["type"];

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
const unitTypes = unitSchema.options.flatMap((option) => {
  const { _def } = option._def.shape().type;

  if (_def.typeName === ZodFirstPartyTypeKind.ZodLiteral) {
    return _def.value;
  }

  return _def.values;
});

type WhatZodWants = [(typeof unitTypes)[number], ...typeof unitTypes];
export const unitTypeSchema = z.enum(unitTypes as WhatZodWants);

export type UnitWithHiddenStats = Omit<UnitWithVisibleStats, "stats"> & {
  stats: "hidden";
};

export type WWUnit = UnitWithHiddenStats | UnitWithVisibleStats;
