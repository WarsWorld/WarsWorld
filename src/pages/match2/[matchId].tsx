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

// Snapshot-driven, server-authoritative board — now the DEFAULT (the FE-engine cut). The old
// engine-on-client board is kept behind `?v1` as a fallback during the cutover.
const MatchBoardV2NoSSR = dynamic(
  () => import("components/client-only/MatchBoardV2").then((res) => res.MatchBoardV2),
  {
    ssr: false,
    loading: () => <p>Loading board...</p>,
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

  // Old engine-on-client board, kept as a fallback during the cutover.
  if (query.v1 !== undefined) {
    return (
      <MatchLoaderNoSSR
        matchId={matchIdResult.data}
        playerId={currentPlayer.id}
        spritesheetDataByArmy={spritesheetDataByArmy}
      />
    );
  }

  return (
    <MatchBoardV2NoSSR
      matchId={matchIdResult.data}
      playerId={currentPlayer.id}
      spritesheetDataByArmy={spritesheetDataByArmy}
    />
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
