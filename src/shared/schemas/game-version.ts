import { z } from "zod";

export const gameVersionSchema = z.enum(["AW1", "AW2", "AWDS"]);

export type GameVersion = z.infer<typeof gameVersionSchema>;
