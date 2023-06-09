import { usePlayers } from "frontend/context/players";
import { useRef } from "react";
import { trpc } from "frontend/utils/trpc-client";
import Head from "next/head";
import MatchSection from "frontend/components/match/MatchSection";

export default function YourMatches() {
  const { currentPlayer, setCurrentPlayer, ownedPlayers } = usePlayers();

  const matchesQuery = trpc.match.getPlayerMatches.useQuery(
    { playerId: currentPlayer?.id ?? "" },
    {
      enabled: currentPlayer !== undefined,
    }
  );

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
            <h1>Your matches</h1>
            <p>
              Current player:{" "}
              <select
                className="@bg-gray-800 @px-2 @rounded-lg"
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
                className="@bg-gray-800 @px-2 @rounded-lg"
                onClick={async () => {
                  const mapId = mapSelectionRef.current?.value;

                  if (mapId === undefined || currentPlayer === undefined) {
                    return;
                  }

                  await createMutation.mutateAsync({
                    selectedCO: "andy",
                    mapId,
                    playerId: currentPlayer.id,
                  });
                  matchesQuery.refetch();
                }}
              >
                Create game
              </button>
              <select
                className="@bg-gray-800 @px-2 @rounded-lg"
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
              <h1>Current games</h1>
              <div className="@flex @flex-wrap @justify-around">

              {matchesQuery.data === undefined
                ? "Loading..."
                : <MatchSection title={"Matches"} description={"Your ongoing matches"} />
                }
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
