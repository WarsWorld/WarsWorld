import { z } from "zod";

export const weatherSchema = z.union([
  z.literal("clear"),
  z.literal("snow"),
  z.literal("rain"),
  z.literal("sandstorm"),
]);

export type Weather = z.infer<typeof weatherSchema>;

export const weatherSettingSchema = weatherSchema.or(z.literal("random"));

export type WeatherSetting = z.infer<typeof weatherSettingSchema>;
