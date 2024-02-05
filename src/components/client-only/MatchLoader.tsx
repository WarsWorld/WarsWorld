import { useQuery } from "@tanstack/react-query";
import { FrontendUnit } from "frontend/components/match/FrontendUnit";
import type { SpritesheetDataByArmy } from "frontend/components/match/getSpritesheetData";
import type { ChangeableTileWithSprite } from "frontend/components/match/types";
import { trpc } from "frontend/utils/trpc-client";
import { loadSpritesFromSpriteMap } from "pixi/load-spritesheet";
import { MatchWrapper } from "shared/wrappers/match";
import { MatchRenderer } from "./MatchRenderer";

type Props = {
  matchId: string;
  playerId: string;
  spritesheetDataByArmy: SpritesheetDataByArmy;
};

export function MatchLoader({ matchId, playerId, spritesheetDataByArmy }: Props) {
  const spriteSheetQuery = useQuery({
    queryKey: ["spritesheets"],
    queryFn: () => loadSpritesFromSpriteMap(spritesheetDataByArmy),
  });

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
      select(data) {
        const matchData = data.match;
        return {
          match: new MatchWrapper<ChangeableTileWithSprite, FrontendUnit>(
            matchData.id,
            matchData.leagueType,
            matchData.changeableTiles.map((tile) => ({ ...tile, sprite: null })),
            matchData.rules,
            matchData.status,
            matchData.map,
            matchData.players,
            matchData.units,
            FrontendUnit,
            matchData.turn,
          ),
          chatMessages: data.chatMessages,
        };
      },
    },
  );

  if (fullMatchQuery.isError || spriteSheetQuery.isError) {
    return <p>error {":("}</p>;
  }

  if (fullMatchQuery.isLoading || spriteSheetQuery.isLoading) {
    return <p>Loading match data...</p>;
  }

  const player = fullMatchQuery.data.match.getPlayerById(playerId);

  if (player === undefined) {
    throw new Error("Could not find player by playerId in match wrapper in MatchLoader");
  }

  return (
    <MatchRenderer
      match={fullMatchQuery.data.match}
      spriteSheets={spriteSheetQuery.data}
      player={player}
      chatMessages={fullMatchQuery.data.chatMessages}
    />
  );
}
