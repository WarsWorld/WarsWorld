import { z } from "zod";
import { coSchema } from "./co";
import { unitTypeSchema } from "./unit";

const favouriteGamesSchema = z.enum([
  "advance_wars_1",
  "advance_wars_2_black_hole_rising",
  "advance_wars_dual_strike",
  "advance_wars_days_of_ruin",
  "advance_wars_reboot_camp",
  "advance_wars_by_web",
  "wargroove",
]);

export type FavouriteGames = z.infer<typeof favouriteGamesSchema>;

export const preferencesSchema = z.object({
  favouriteCOs: z.optional(z.array(coSchema)),
  favouriteUnits: z.optional(z.array(unitTypeSchema)),
  favouriteGames: z.optional(z.array(favouriteGamesSchema)),
  youtubeChannelId: z.optional(z.string()),
  twitchUserName: z.optional(z.string()),
});

export type Preferences = z.infer<typeof preferencesSchema>;
