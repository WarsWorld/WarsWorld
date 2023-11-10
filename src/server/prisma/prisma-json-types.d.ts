import { Preferences } from "server/schemas/preferences";
import { Tile } from "server/schemas/tile";
import { PlayerInMatch } from "server/match-logic/server-match-states";
import { WWEvent } from "shared/types/events";

// TODO rename file extension from .d.ts to .ts and use ES2015 syntax instead of namespaces maybe?

declare global {
  namespace PrismaJson {
    type PrismaPreferences = Preferences;
    type PrismaTiles = Tile[][];
    type PrismaPlayerState = PlayerInMatch[];
    type PrismaEvent = WWEvent;
  }
}
