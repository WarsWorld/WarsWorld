import { ProtectPage } from "frontend/components/auth/ProtectPage";
import SquareButton from "frontend/components/layout/SquareButton";
import CreateMatch from "frontend/components/match/card/CreateMatch";
import MatchSection from "frontend/components/match/card/MatchSection";
import { usePlayers } from "frontend/context/players";
import { trpc } from "frontend/utils/trpc-client";
import Head from "next/head";
import { useRouter } from "next/router";

export default function YourMatches() {
  const route = useRouter();
  const { currentPlayer, setCurrentPlayer } = usePlayers();

  // Get and make your, all, joinable, and spectator matches
  const { data: yourMatchesQuery } = trpc.match.getPlayerMatches.useQuery(
    { playerId: currentPlayer?.id ?? "" },
    {
      enabled: currentPlayer !== undefined,
    },
  );

  const { data: allMatchesQuery } = trpc.match.getAll.useQuery({ pageNumber: 0 });

  const joinableMatchesQuery = allMatchesQuery?.filter(
    (match) =>
      match.players.filter((player) => player.id == currentPlayer?.id || match.players.length == 2)
        .length == 0,
  );

  const spectatorMatches = allMatchesQuery?.filter(
    (match) =>
      match.players.filter((player) => player.id == currentPlayer?.id || match.players.length != 2)
        .length == 0,
  );

  return (
    <ProtectPage>
      <Head>
        <title>Game Lobby | Wars World</title>
      </Head>

      <div className="@h-full @w-full @mt-4 @mb-16 @grid @gap-10 @text-center">
        {/* Temporal button for ease of access to leaderboard. */}
        <div className="@absolute @right-12 @top-8 @h-16 @text-xl">
          <SquareButton
            onClick={() => {
              void route.push("/leaderboard");
            }}
          >
            <svg className="@fill-white" height="40" viewBox="0 -960 960 960" width="40">
              <path d="M280-880h400v314q0 23-10 41t-28 29l-142 84 28 92h152l-124 88 48 152-124-94-124 94 48-152-124-88h152l28-92-142-84q-18-11-28-29t-10-41v-314Zm80 80v234l80 48v-282h-80Zm240 0h-80v282l80-48v-234ZM480-647Zm-40-12Zm80 0Z" />
            </svg>
          </SquareButton>
        </div>
        <CreateMatch currentPlayer={currentPlayer} setCurrentPlayer={setCurrentPlayer} />
        <MatchSection title="Your Matches" matches={yourMatchesQuery} inMatch />
        <MatchSection
          title="Join a match"
          matches={joinableMatchesQuery}
          description="Matches you can join."
        />
        <MatchSection
          title="Spectate a Match"
          matches={spectatorMatches}
          description="Matches with two players (not you)."
        />
        <MatchSection
          jump="completedGames"
          title="Completed games"
          matches={undefined}
          description="Work is progress..."
        />
      </div>
    </ProtectPage>
  );
}
