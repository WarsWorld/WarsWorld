import { z } from "zod";
import { directionSchema } from "./direction";
import { positionSchema } from "./position";
import { unitTypeSchema } from "./unit";

const buildActionSchema = z.object({
  type: z.literal("build"),
  unitType: unitTypeSchema,
  position: positionSchema,
});

const waitActionSchema = z.object({
  type: z.literal("wait"),
});

/**
 * Capture, APC supply, black bomb explosion, toggle stealth/sub hide.
 * Unit inferred by event log (last event must be a "dangling" unit).
 */
const abilityActionSchema = z.object({
  type: z.literal("ability"),
});

const launchMissileActionSchema = z.object({
  type: z.literal("launchMissile"),
  targetPosition: positionSchema,
});

const unloadActionSchema = z.object({
  type: z.literal("unload"),
  unloads: z
    .array(
      // 1 allowed by default, 2 for DoR move+unload
      z.object({
        loadedUnitIndex: z.number().int().nonnegative(),
        direction: directionSchema,
      })
    )
    .min(1)
    .max(2),
});

const attackActionSchema = z.object({
  type: z.literal("attack"),
  defenderPosition: positionSchema,
});

const repairActionSchema = z.object({
  type: z.literal("repair"),
  direction: directionSchema,
});

const coPowerActionSchema = z.object({
  type: z.literal("coPower"),
});

const superCOPowerActionSchema = z.object({
  type: z.literal("superCOPower"),
});

const passTurnActionSchema = z.object({
  type: z.literal("endTurn"),
});

const subActionSchema = z.discriminatedUnion("type", [
  attackActionSchema,
  waitActionSchema,
  abilityActionSchema,
  unloadActionSchema,
  repairActionSchema,
  launchMissileActionSchema,
]);

const moveActionSchema = z.object({
  type: z.literal("move"),
  path: z.array(positionSchema),
  subAction: subActionSchema,
});

export const mainActionSchema = z.discriminatedUnion("type", [
  buildActionSchema,
  moveActionSchema,
  waitActionSchema,
  // for DoR unload, unloading wouldn't be plainly (i.e. partially) allowed,
  // only as a subaction of move - Function
  unloadActionSchema,
  coPowerActionSchema,
  superCOPowerActionSchema,
  passTurnActionSchema,
]);

export type MainAction = z.infer<typeof mainActionSchema>;
export type SubAction = z.infer<typeof subActionSchema>;

export type Action = MainAction | SubAction;

export type BuildAction = z.infer<typeof buildActionSchema>;
export type MoveAction = z.infer<typeof moveActionSchema>;
export type WaitAction = z.infer<typeof waitActionSchema>;
export type AbilityAction = z.infer<typeof abilityActionSchema>;
export type LaunchMissileAction = z.infer<typeof launchMissileActionSchema>;
export type UnloadAction = z.infer<typeof unloadActionSchema>;
export type AttackAction = z.infer<typeof attackActionSchema>;
export type RepairAction = z.infer<typeof repairActionSchema>;
export type COPowerAction = z.infer<typeof coPowerActionSchema>;
export type SuperCOPowerAction = z.infer<typeof superCOPowerActionSchema>;
export type PassTurnAction = z.infer<typeof passTurnActionSchema>;
