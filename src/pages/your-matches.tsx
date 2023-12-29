import { usePlayers } from "frontend/context/players";
import { trpc } from "frontend/utils/trpc-client";
import Head from "next/head";
import MatchSection from "frontend/components/match/v2/MatchSection";
import CreateMatch from "frontend/components/match/v2/CreateMatch";
import { ProtectPage } from "frontend/components/ProtectPage";

export default function YourMatches() {
  const { currentPlayer, setCurrentPlayer } = usePlayers();

  // Get and make your, all, joinable, and spectator matches
  const { data: yourMatchesQuery, refetch: refecthYourMatches } =
    trpc.match.getPlayerMatches.useQuery(
      { playerId: currentPlayer?.id ?? "" },
      {
        enabled: currentPlayer !== undefined,
      }
    );

  const { data: allMatchesQuery, refetch: refecthAllMatches } =
    trpc.match.getAll.useQuery({ pageNumber: 0 });

  const joinableMatchesQuery = allMatchesQuery?.filter(
    (match) =>
      match.players.filter(
        (player) => player.id == currentPlayer?.id || match.players.length == 2
      ).length == 0
  );


  const spectatorMatches = allMatchesQuery?.filter(
    (match) =>
      match.players.filter(
        (player) => player.id == currentPlayer?.id || match.players.length != 2
      ).length == 0
  );

  return (
    <ProtectPage>
      <Head>
        <title>Game Lobby | Wars World</title>
      </Head>

      <div className="@h-full @w-full @mt-4 @mb-16 @grid @gap-10 @text-center">
        <CreateMatch
          refecthYourMatches={refecthYourMatches}
          refecthAllMatches={refecthAllMatches}
          currentPlayer={currentPlayer}
          setCurrentPlayer={setCurrentPlayer}
        />
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
          title="Completed games"
          matches={undefined}
          description="Work is progress..."
        />
      </div>
    </ProtectPage>
  );
}
