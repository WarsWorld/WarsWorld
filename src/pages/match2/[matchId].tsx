import type {
  ArmySpritesheetData,
  SpritesheetDataByArmy,
} from "frontend/components/match/getSpritesheetData";
import { usePlayers } from "frontend/context/players";
import type { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import fs from "node:fs/promises";
import path from "node:path";
import { spritesheetDataSchema } from "shared/schemas/spritesheet-data";
import { z } from "zod";

const MatchLoaderNoSSR = dynamic(
  () => import("components/client-only/MatchLoader").then((res) => res.MatchLoader),
  {
    ssr: false,
    loading: () => <p>Loading MatchLoader component...</p>,
  },
);

type Props = { spritesheetDataByArmy: SpritesheetDataByArmy };

const MatchPage = ({ spritesheetDataByArmy }: Props) => {
  const { query } = useRouter();
  const { currentPlayer } = usePlayers();
  const matchIdResult = z.string().safeParse(query.matchId);

  if (!matchIdResult.success) {
    return <p>error {":("}</p>;
  }

  if (currentPlayer === undefined) {
    return <p>Loading...</p>;
  }

  return (
    <MatchLoaderNoSSR
      matchId={matchIdResult.data}
      playerId={currentPlayer.id}
      spritesheetDataByArmy={spritesheetDataByArmy}
    ></MatchLoaderNoSSR>
  );
};

export default MatchPage;

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const spritesheetDatas = await Promise.all(
    [
      "yellow-comet",
      "green-earth",
      "black-hole",
      "orange-star",
      "blue-moon",
      "neutral",
      "arrow",
      "icons",
    ].map(async (sheetName) => {
      const filePath = path.join(process.cwd(), `public/img/spriteSheet/${sheetName}.json`);
      const fileData = await fs.readFile(filePath, "utf-8");
      const spritesheetData = spritesheetDataSchema.parse(JSON.parse(fileData));

      return {
        sheetName,
        data: spritesheetData as ArmySpritesheetData,
      };
    }),
  );

  const spritesheetDataByArmy = spritesheetDatas.reduce<Partial<SpritesheetDataByArmy>>(
    (prev, cur) => ({
      ...prev,
      [cur.sheetName]: cur.data,
    }),
    {},
  );

  return {
    props: {
      spritesheetDataByArmy: spritesheetDataByArmy as SpritesheetDataByArmy,
    },
  };
};
