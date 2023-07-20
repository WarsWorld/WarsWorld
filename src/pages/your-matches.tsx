import { usePlayers } from "frontend/context/players";
import { useRef } from "react";
import { trpc } from "frontend/utils/trpc-client";
import Head from "next/head";
import { MatchRow } from "frontend/components/match/MatchRow";

export default function YourMatches() {
  const { currentPlayer, setCurrentPlayer, ownedPlayers } = usePlayers();

  const yourMatchesQuery = trpc.match.getPlayerMatches.useQuery(
    { playerId: currentPlayer?.id ?? "" },
    {
      enabled: currentPlayer !== undefined,
    }
  );

  const allMatchesQuery = trpc.match.getAll.useQuery();

  const mapQuery = trpc.map.getAll.useQuery();
  const createMutation = trpc.match.create.useMutation();
  const mapSelectionRef = useRef<HTMLSelectElement>(null);

  return (
    <>
      <Head>
        <title>Game Lobby | Wars World</title>
      </Head>

      <div className="@flex @justify-center @w-full">
        <div className="@h-full @w-full @p-5 @grid @gap-10 @text-center allGames">
          <div>
            <h1>Hello dev! Read Instructions</h1>
            <p>
              To create a match, first change Current Player to any other
              player.
              <br />
              Then click on Create Game and then on Enter Match
            </p>

            <br />
            <p>
              Current player:{" "}
              <select
                className="@bg-gray-800 @px-2 @rounded-lg btn"
                onChange={(e) => {
                  const foundPlayer = ownedPlayers?.find(
                    (p) => p.id === e.target.value
                  );

                  if (foundPlayer !== undefined) {
                    setCurrentPlayer(foundPlayer);
                  }
                }}
              >
                {ownedPlayers?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </p>
            <div className="@flex @justify-center @gap-5">
              <button
                className="@bg-gray-800 @px-2 @rounded-lg btn"
                onClick={async () => {
                  const mapId = mapSelectionRef.current?.value;

                  if (mapId === undefined || currentPlayer === undefined) {
                    return;
                  }

                  await createMutation.mutateAsync({
                    selectedCO: "sami",
                    mapId,
                    playerId: currentPlayer.id,
                  });
                  yourMatchesQuery.refetch();
                }}
              >
                Create game
              </button>
              <select
                className="@bg-gray-800 @px-2 @rounded-lg btn"
                ref={mapSelectionRef}
              >
                {mapQuery.data?.map((map) => (
                  <option key={map.id} value={map.id}>
                    {map.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div id="currentGames" className="currentGames">
            <h1>Matches you created</h1>
            <div className="@flex @flex-wrap @justify-around">
              {yourMatchesQuery.data === undefined
                ? "Loading..."
                : yourMatchesQuery.data.map((match) => (
                    <MatchRow key={match.id} match={match} />
                  ))}
            </div>
          </div>

          <div id="currentGames" className="currentGames">
            <h1>Join a match</h1>
            <div className="@flex @flex-wrap @justify-around">
              {allMatchesQuery.data === undefined
                ? "Loading..."
                : allMatchesQuery.data.map((match) => {

                  //Lets make sure we didn't make this match,
                  if (match.players[0].playerId !== currentPlayer.id) return <MatchRow key={match.id} match={match} />;
                })}
            </div>
          </div>

          <div id="completedGames" className="completedGames">
            <h1 className="@text-center">Completed games</h1>
          </div>
        </div>
      </div>
    </>
  );
}
