import { useQuery } from "@tanstack/react-query";
import { MatchLoader } from "frontend/components/match/MatchLoader";
import { usePlayers } from "frontend/context/players";
import { loadSpritesFromSpriteMap } from "frontend/pixi/load-spritesheet";
import type { SpritesheetDataByArmy } from "gameFunction/get-sprite-sheets";
import getSpriteSheets from "gameFunction/get-sprite-sheets";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { z } from "zod";

type Props = { spritesheetDataByArmy: SpritesheetDataByArmy };

const MatchPage = ({ spritesheetDataByArmy }: Props) => {
  const spriteSheetQuery = useQuery({
    queryKey: ["spritesheets"],
    queryFn: () => loadSpritesFromSpriteMap(spritesheetDataByArmy),
  });

  const { query } = useRouter();
  const { currentPlayer } = usePlayers();
  const matchIdResult = z.string().safeParse(query.matchId);

  if (spriteSheetQuery.isError || !matchIdResult.success) {
    return <p>error {":("}</p>;
  }

  if (spriteSheetQuery.isLoading || currentPlayer === undefined) {
    return <p>Loading...</p>;
  }

  return (
    <MatchLoader
      matchId={matchIdResult.data}
      playerId={currentPlayer.id}
      spriteSheets={spriteSheetQuery.data}
    ></MatchLoader>
  );
};

export default MatchPage;

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  //TODO: Should we call all the spritesheets or just the ones the players will need?
  // Unsure how we would know which players are playing what before even loading the match
  // (which right now we do this call before the tRPC call that gets the match data...)
  const spritesheetDataByArmy = await getSpriteSheets([
    "yellow-comet",
    "green-earth",
    "black-hole",
    "orange-star",
    "blue-moon",
  ]);

  return { props: { spritesheetDataByArmy } };
};
