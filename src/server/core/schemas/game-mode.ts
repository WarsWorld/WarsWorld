import { z } from "zod";

/**
 * The two axes that replaced the old flat `LeagueType` (see .ai/plans/ranked-ladder-plan.md §3.1).
 * Game vocabulary, so it lives in the kernel: every feature may import it, and it imports nothing.
 *
 * A queue is identified by all THREE of mode × ruleset × ranked (`isRanked`, already on Match/Lobby).
 * Ratings are a different question — they pool by MODE only, across rulesets. Don't conflate them.
 */

/**
 * Seat shape. Values are identifiers, NOT display labels — Prisma enum members can't start with a
 * digit, so "1v1" is unspellable. Mirrors the Prisma `GameMode` enum; the UI renders the labels.
 */
export const gameModeSchema = z.enum(["duel", "teams", "ffa"]);
export type GameMode = z.infer<typeof gameModeSchema>;

/** Rules a match plays under. Mirrors the Prisma `Ruleset` enum. */
export const rulesetSchema = z.enum(["standard", "fog", "highFunds", "broken"]);
export type Ruleset = z.infer<typeof rulesetSchema>;

// Seat/team counts per mode are NOT here — `server/matches/layout.ts` already owns that grid
// (teamCount × slotsPerTeam, plus seat validation and slot mapping). This file is vocabulary only.
