import { Preferences } from "server/schemas/preferences";
import { Tile } from "server/schemas/tile";
import { PlayerInMatch } from "server/match-logic/server-match-states";
import { WWEvent } from "shared/types/events";

declare global {
  namespace PrismaJson {
    type PrismaPreferences = Preferences;
    type PrismaTiles = Tile[][];
    type PrismaPlayerState = PlayerInMatch[];
    type PrismaEvent = WWEvent;
  }
}
