import { usePlayers } from "frontend/context/players";
import { useRef } from "react";
import { trpc } from "frontend/utils/trpc-client";
import Head from "next/head";
import { MatchRow } from "frontend/components/match/MatchRow";
import MatchCardTop from "../frontend/components/match/v2/MatchCardTop";
import MatchPlayer from "../frontend/components/match/v2/MatchPlayer";
import MatchCard from "../frontend/components/match/v2/MatchCard";

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
        <div className="@h-full @w-full @p-5 @grid @gap-10 @text-center">
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
                    selectedCO: "lash",
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

          <div>
            <h1>
              Your Matches
              <p>Matches you are part of/joined.</p>
            </h1>
            <div className="@grid [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] @gap-10">
              {yourMatchesQuery.data === undefined
                ? "Loading..."
                : yourMatchesQuery.data.map((match) => (
                    <MatchCard key={match.id} match={match} inMatch={true} />
                  ))}
            </div>
          </div>

          <div>
            <h1>
              Join a match
              <p>Matches you can join.</p>
            </h1>
            <div className="@grid [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] @gap-10">
              {allMatchesQuery.data === undefined
                ? "Loading..."
                : allMatchesQuery.data.map((match) => {
                    let inMatch = false;
                    match.players.forEach((player) => {
                      if (
                        player.playerId == currentPlayer.id ||
                        match.players.length == 2
                      )
                        inMatch = true;
                    });
                    if (!inMatch)
                      return (
                        <MatchCard
                          key={match.id}
                          match={match}
                          inMatch={false}
                        />
                      );
                  })}
            </div>
          </div>

          <div>
            <h1>
              Spectate a Match
              <p>Matches with two players (not you).</p>
            </h1>
            <div className="@grid [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] @gap-10">
              {allMatchesQuery.data === undefined
                ? "Loading..."
                : allMatchesQuery.data.map((match) => {
                    let inMatch = false;
                    match.players.forEach((player) => {
                      if (
                        player.playerId == currentPlayer.id ||
                        match.players.length != 2
                      )
                        inMatch = true;
                    });
                    if (!inMatch)
                      return (
                        <MatchCard
                          key={match.id}
                          match={match}
                          inMatch={false}
                        />
                      );
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
