import { z } from "zod";

export const directionSchema = z.enum(["up", "down", "left", "right"]);

export type Direction = z.infer<typeof directionSchema>;

export const allDirections: Direction[] = ["up", "down", "left", "right"];
