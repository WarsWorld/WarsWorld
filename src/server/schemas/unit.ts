import { withType } from "server/schemas/algebraic-datatypes";
import { ZodFirstPartyTypeKind, z } from "zod";
import { PlayerSlot } from "./player-slot";
import { Position } from "./position";
import {
  withAmmoUnitStatsSchema,
  withHiddenSchema,
  withNoAmmoUnitStatsSchema,
  withPlayerSlotAndPositionSchema,
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
    loadedUnits: z.array(creatableSoldierSchema).min(0).max(2),
  });

const creatableLanderSchema = withNoAmmoUnitStatsSchema
  .extend(withType("lander"))
  .extend({
    loadedUnits: z
      .array(
        z.discriminatedUnion("type", [
          creatableInfantrySchema,
          creatableMechSchema,
          createReconSchema,
          creatableAPCSchema,
          creatableOtherLandUnitsWithAmmo,
        ])
      )
      .min(0)
      .max(2),
  });

const creatableCruiserSchema = withAmmoUnitStatsSchema
  .extend(withType("cruiser"))
  .extend({
    loadedUnits: z
      .array(
        z.discriminatedUnion("type", [
          creatableTransportCopterSchema,
          creatableBattleCopterSchema,
        ])
      )
      .min(0)
      .max(2),
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
    loadedUnits: z
      .array(
        z.discriminatedUnion("type", [
          creatableTransportCopterSchema,
          creatableBattleCopterSchema,
          creatableBomberAndFighterSchema,
          creatableStealthSchema,
        ])
      )
      .min(0)
      .max(2),
  });

const creatablePipeRunnerSchema = withAmmoUnitStatsSchema.extend(
  withType("pipeRunner")
);

export const creatableUnitSchema = z.discriminatedUnion("type", [
  // this can't be easily mapped
  // because it'd be pushing the limits of zod or typescript i think
  withPlayerSlotAndPositionSchema.extend(creatableInfantrySchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatableMechSchema.shape),
  withPlayerSlotAndPositionSchema.extend(createReconSchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatableAPCSchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatableOtherLandUnitsWithAmmo.shape),
  withPlayerSlotAndPositionSchema.extend(creatableTransportCopterSchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatableBattleCopterSchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatableBlackBombSchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatableBlackBoatSchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatableLanderSchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatableCruiserSchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatableBomberAndFighterSchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatableStealthSchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatableBattleshipSchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatableSubSchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatableCarrierSchema.shape),
  withPlayerSlotAndPositionSchema.extend(creatablePipeRunnerSchema.shape),
]);

export const unitWithoutAmmoSchema = z.discriminatedUnion("type", [
  creatableInfantrySchema,
  createReconSchema,
  creatableBlackBombSchema,
]);

export const unitWithoutWeaponSchema = z.discriminatedUnion("type", [
  creatableAPCSchema,
  creatableTransportCopterSchema,
  creatableBlackBoatSchema,
  creatableLanderSchema,
]);

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

export type CreatableUnit = z.infer<typeof creatableUnitSchema>;

export type UnitType = CreatableUnit["type"];

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

interface WithActionState {
  actionState: "ready" | "waited" | "unloadable";
}

export type UnitDuringMatch = CreatableUnit & WithActionState;

export interface UnitDuringMatchHiddenStats extends WithActionState {
  type: UnitType;
  playerSlot: PlayerSlot;
  stats: "hidden";
  position: Position;
}

export type FrontendUnit = UnitDuringMatch | UnitDuringMatchHiddenStats;

export const withUnit = z.object({
  unit: z.optional(creatableUnitSchema),
});
