import { Preferences } from "components/schemas/preferences";
import { Tile } from "components/schemas/tile";
import { PlayerInMatch } from "server/match-logic/server-match-states";
import { WWEvent } from "types/core-game/event";

declare global {
  namespace PrismaJson {
    type PrismaPreferences = Preferences;
    type PrismaTiles = Tile[][];
    type PrismaPlayerState = PlayerInMatch[];
    type PrismaEvent = WWEvent;
  }
}
