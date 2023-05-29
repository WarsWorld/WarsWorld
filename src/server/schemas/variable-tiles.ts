import { z } from "zod";
import { withUnit } from "./unit";

const axisConnectionsSchema = z.enum(["right-left", "top-bottom"]);

const oneWayConnectionsSchema = z.enum(["top", "right", "bottom", "left"]);

const twoWayConnectionsSchema = axisConnectionsSchema.or(
  z.enum(["top-right", "right-bottom", "bottom-left", "top-left"])
);

const threeWayConnectionSchema = z.enum([
  "right-bottom-left",
  "top-right-bottom",
  "top-bottom-left",
  "top-right-left",
]);

const fourWayConnectionSchema = z.literal("top-right-bottom-left");

export const roadTileSchema = withUnit.extend({
  type: z.literal("road"),
  variant: twoWayConnectionsSchema
    .or(threeWayConnectionSchema)
    .or(fourWayConnectionSchema),
});

export const bridgeTileSchema = withUnit.extend({
  type: z.literal("bridge"),
  variant: axisConnectionsSchema,
});

export const pipeTileSchema = withUnit.extend({
  type: z.literal("pipe"),
  variant: oneWayConnectionsSchema.or(twoWayConnectionsSchema),
});

export const pipeSeamTileSchema = withUnit.extend({
  type: z.literal("pipeSeam"),
  variant: axisConnectionsSchema,
  hp: z.number().int().min(1).max(100),
});

export const plainTileSchema = withUnit.extend({
  type: z.literal("plain"),
  variant: z.enum([
    "normal",
    "broken-pipe-right-left",
    "broken-pipe-top-bottom",
  ]),
});

export const riverTileSchema = withUnit.extend({
  type: z.literal("river"),
  // TODO rivers have MANY more variants with flow direction and all
  variant: twoWayConnectionsSchema
    .or(threeWayConnectionSchema)
    .or(fourWayConnectionSchema),
});

export const variableTileSchema = z.discriminatedUnion("type", [
  roadTileSchema,
  bridgeTileSchema,
  pipeSeamTileSchema,
  pipeTileSchema,
  riverTileSchema,
  plainTileSchema,
]);
