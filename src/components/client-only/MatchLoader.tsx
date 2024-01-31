import { useQuery } from "@tanstack/react-query";
import { FrontendUnit } from "frontend/components/match/FrontendUnit";
import type { SpritesheetDataByArmy } from "frontend/components/match/getSpritesheetData";
import type { ChangeableTileWithSprite } from "frontend/components/match/types";
import { trpc } from "frontend/utils/trpc-client";
import { loadSpritesFromSpriteMap } from "pixi/load-spritesheet";
import type { FrontendChatMessage } from "shared/types/component-data";
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
        return {
          match: new MatchWrapper<ChangeableTileWithSprite, FrontendUnit>(
            data.id,
            data.leagueType,
            data.changeableTiles.map((tile) => ({ ...tile, sprite: null })),
            data.rules,
            data.status,
            data.map,
            data.players,
            data.units,
            FrontendUnit,
            data.turn,
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

  /* Formatting chat messages */
  const chatMessages: FrontendChatMessage[] = fullMatchQuery.data.chatMessages.map(
    ({ createdAt, author: { name }, content }) => {
      return {
        createdAt: createdAt,
        name: name,
        content: content,
      };
    },
  );

  return (
    <MatchRenderer
      match={fullMatchQuery.data.match}
      spriteSheets={spriteSheetQuery.data}
      player={player}
      chatMessages={chatMessages}
    />
  );
}
