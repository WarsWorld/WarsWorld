import type { LoadedSpriteSheet } from "frontend/pixi/load-spritesheet";
import { trpc } from "frontend/utils/trpc-client";
import { MatchWrapper } from "shared/wrappers/match";
import { FrontendUnit } from "./FrontendUnit";
import { MatchRenderer } from "./MatchRenderer";
import { type ChangeableTileWithSprite } from "./types";

type Props = {
  matchId: string;
  playerId: string;
  spriteSheets: LoadedSpriteSheet;
};

export function MatchLoader({ matchId, playerId, spriteSheets }: Props) {
  const fullMatchQuery = trpc.match.full.useQuery(
    { matchId, playerId },
    {
      queryKey: [
        "match.full",
        {
          matchId,
          playerId,
        },
      ],
      refetchIntervalInBackground: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      select(match) {
        return new MatchWrapper<ChangeableTileWithSprite, FrontendUnit>(
          match.id,
          match.leagueType,
          match.changeableTiles.map((tile) => ({ ...tile, sprite: null })),
          match.rules,
          match.status,
          match.map,
          match.players,
          match.units,
          FrontendUnit,
          match.turn,
        );
      },
    },
  );

  if (fullMatchQuery.isError) {
    return <p>error {":("}</p>;
  }

  if (fullMatchQuery.isLoading) {
    return <p>Loading match data...</p>;
  }

  const player = fullMatchQuery.data.getPlayerById(playerId);

  if (player === undefined) {
    throw new Error("Could not find player by playerId in match wrapper in MatchLoader");
  }

  return <MatchRenderer match={fullMatchQuery.data} spriteSheets={spriteSheets} player={player} />;
}
