import { z } from "zod";
import { directionSchema } from "./direction";
import { positionSchema } from "./position";
import { unitTypeSchema } from "./unit";

const buildActionSchema = z.object({
  type: z.literal("build"),
  unitType: unitTypeSchema,
  position: positionSchema,
});

const attemptMoveActionSchema = z.object({
  type: z.literal("attemptMove"),
  path: z.array(positionSchema),
});

/**
 * Can imply joining or loading units depending on the previous move-attempt
 */
const waitActionSchema = z.object({
  type: z.literal("wait"),
});

/**
 * Capture, APC repair, black bomb explosion, toggle stealth/sub hide.
 * Unit inferred by event log (last event must be a "dangling" unit).
 */
const abilityActionSchema = z.object({
  type: z.literal("ability"),
});

const missileSiloActionSchema = z.object({
  type: z.literal("missileSilo"),
  targetPosition: positionSchema,
});

const abortMoveActionSchema = z.object({
  type: z.literal("abortMove"),
});

const unloadActionSchema = z.object({
  type: z.literal("unload"),
  direction: directionSchema,
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

const endTurnActionSchema = z.object({
  type: z.literal("endTurn"),
});

const requestDrawActionSchema = z.object({
  type: z.literal("requestDraw"),
});

const forfeitActionSchema = z.object({
  type: z.literal("forfeit"),
});

export const actionSchema = z.discriminatedUnion("type", [
  buildActionSchema,
  attemptMoveActionSchema,
  waitActionSchema,
  abilityActionSchema,
  missileSiloActionSchema,
  abortMoveActionSchema,
  unloadActionSchema,
  attackActionSchema,
  repairActionSchema,
  coPowerActionSchema,
  superCOPowerActionSchema,
  endTurnActionSchema,
  requestDrawActionSchema,
  forfeitActionSchema,
]);

export type Action = z.infer<typeof actionSchema>;

export type BuildAction = z.infer<typeof buildActionSchema>;
export type AttemptMoveAction = z.infer<typeof attemptMoveActionSchema>;
export type WaitAction = z.infer<typeof waitActionSchema>;
export type AbilityAction = z.infer<typeof abilityActionSchema>;
export type MissileSiloAction = z.infer<typeof missileSiloActionSchema>;
export type AbortMoveAction = z.infer<typeof abortMoveActionSchema>;
export type UnloadAction = z.infer<typeof unloadActionSchema>;
export type AttackAction = z.infer<typeof attackActionSchema>;
export type RepairAction = z.infer<typeof repairActionSchema>;
export type COPowerAction = z.infer<typeof coPowerActionSchema>;
export type SuperCOPowerAction = z.infer<typeof superCOPowerActionSchema>;
export type EndTurnAction = z.infer<typeof endTurnActionSchema>;
export type RequestDrawAction = z.infer<typeof requestDrawActionSchema>;
export type ForfeitAction = z.infer<typeof forfeitActionSchema>;
