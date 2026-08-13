/* eslint-disable @typescript-eslint/no-namespace */
// ^ couldn't find a way around using namespaces yet
// https://www.npmjs.com/package/prisma-json-types-generator#configuration

import type { MatchRules } from "shared/schemas/match-rules";
import type { Preferences } from "server/players/schemas";
import type { Tile } from "shared/schemas/tile";
import type { UnitWithVisibleStats } from "shared/schemas/unit";
import type { MainEventWithSubEvents } from "server/engine/types/events";
import type { PlayerInMatch } from "server/engine/entities/player-in-match-state";

declare global {
  namespace PrismaJson {
    type PrismaPreferences = Preferences;
    type PrismaTiles = Tile[][];
    type PrismaUnits = UnitWithVisibleStats[];
    type PrismaPlayerState = PlayerInMatch[];
    type PrismaEvent = MainEventWithSubEvents;
    type PrismaMatchRules = MatchRules;
  }
}
