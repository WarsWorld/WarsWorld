import { usePlayers } from "frontend/context/players";
import { useRef, useEffect, useState } from "react";
import { trpc } from "frontend/utils/trpc-client";
import Head from "next/head";
import { MatchRow } from "frontend/components/match/MatchRow";
import MatchCardTop from "../frontend/components/match/v2/MatchCardTop";
import MatchPlayer from "../frontend/components/match/v2/MatchPlayer";
import MatchCard from "../frontend/components/match/v2/MatchCard";
import PageTitle from "frontend/components/layout/PageTitle";

export default function YourMatches() {
  const {
    currentPlayer,
    setCurrentPlayer,
    ownedPlayers,
    areOwnedPlayersLoaded,
  } = usePlayers();

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
        <div className="@h-full @w-full @mt-4 @grid @gap-10 @text-center">
          <div>
            <h1>Hello dev! Read Instructions</h1>
            <p>
              To create a match, first change Current Player to any other
              player.
              <br />
              Then click on Create Game and then on Enter Match
            </p>
            <br />
            {areOwnedPlayersLoaded ? (
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
                  defaultValue={currentPlayer?.id}
                >
                  {ownedPlayers?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </p>
            ) : (
              // Loading Players Section
              <p>Loading Players...</p>
            )}

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

          <div className="@w-full @my-2">
            <PageTitle>Your Matches</PageTitle>
          </div>
          <div className="@flex @flex-col @align-middle @items-center">
            <div className="@w-[90vw]">
              <div className="@grid [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] @gap-10">
                {yourMatchesQuery.data === undefined
                  ? "Loading..."
                  : yourMatchesQuery.data.map((match) => (
                      <MatchCard key={match.id} match={match} inMatch={true} />
                    ))}
              </div>
            </div>
          </div>

          <div className="@w-full @my-2">
            <PageTitle>Join a match</PageTitle>
            <p className="@py-0 @mt-4">Matches you can join.</p>
          </div>
          <div className="@flex @flex-col @align-middle @items-center">
            <div className="@w-[90vw]">
              <div className="@grid [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] @gap-10">
                {allMatchesQuery.data === undefined ||
                yourMatchesQuery.data === undefined
                  ? "Loading..."
                  : allMatchesQuery.data.map((match) => {
                      let inMatch = false;
                      match.players.forEach((player) => {
                        if (
                          currentPlayer !== undefined &&
                          (player.playerId == currentPlayer.id ||
                            match.players.length == 2)
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
          </div>
          <div className="@w-full @my-2">
            <PageTitle>Spectate a Match</PageTitle>
            <p className="@py-0 @mt-4">Matches with two players (not you).</p>
          </div>
          <div className="@flex @flex-col @align-middle @items-center">
            <div className="@w-[90vw]">
              <div className="@grid [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] @gap-10">
                {allMatchesQuery.data === undefined ||
                yourMatchesQuery.data === undefined
                  ? "Loading..."
                  : allMatchesQuery.data.map((match) => {
                      let inMatch = false;
                      match.players.forEach((player) => {
                        if (
                          currentPlayer !== undefined &&
                          (player.playerId == currentPlayer.id ||
                            match.players.length != 2)
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
          </div>

          <div className="@w-full @my-2">
            <PageTitle>Completed games</PageTitle>
          </div>
          <div id="completedGames" className="@mb-12">
            <h1 className="@text-center">Work is progress...</h1>
          </div>
        </div>
      </div>
    </>
  );
}
