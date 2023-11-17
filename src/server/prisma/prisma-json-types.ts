/* eslint-disable @typescript-eslint/no-namespace */
// ^ couldn't find a way around using namespaces yet
// https://www.npmjs.com/package/prisma-json-types-generator#configuration

import type { Preferences } from "server/schemas/preferences";
import type { Tile } from "server/schemas/tile";
import type { WWEvent } from "shared/types/events";
import type { PlayerInMatch } from "shared/types/server-match-state";

declare global {
  namespace PrismaJson {
    type PrismaPreferences = Preferences;
    type PrismaTiles = Tile[][];
    type PrismaPlayerState = PlayerInMatch[];
    type PrismaEvent = WWEvent;
  }
}
