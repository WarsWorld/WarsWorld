import type { ISpritesheetData, ISpritesheetFrameData } from "pixi.js";
import { z } from "zod";

const sizeSchema = z.strictObject({
  w: z.number(),
  h: z.number(),
}) satisfies z.ZodType<ISpritesheetFrameData["sourceSize"]>;

const sizeAndPositionSchema = sizeSchema.extend({
  x: z.number(),
  y: z.number(),
}) satisfies z.ZodType<ISpritesheetFrameData["frame"]>;

const frameSchema = z.strictObject({
  frame: sizeAndPositionSchema,
  rotated: z.boolean(),
  trimmed: z.boolean(),
  spriteSourceSize: sizeAndPositionSchema,
  sourceSize: sizeSchema,
}) satisfies z.ZodType<ISpritesheetFrameData>;

export const spritesheetDataSchema = z.strictObject({
  frames: z.record(frameSchema),
  animations: z.record(z.array(z.string())).optional(),
  meta: z.object({
    scale: z.string().or(z.number()),
    image: z.string(),
  }),
}) satisfies z.ZodType<ISpritesheetData>;
