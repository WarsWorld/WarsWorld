import { usePlayers } from "frontend/context/players";
import { useRef, useEffect, useState } from "react";
import { trpc } from "frontend/utils/trpc-client";
import Head from "next/head";
import { MatchRow } from "frontend/components/match/MatchRow";
import MatchCardTop from "../frontend/components/match/v2/MatchCardTop";
import MatchPlayer from "../frontend/components/match/v2/MatchPlayer";
import MatchCard from "../frontend/components/match/v2/MatchCard";
import PageTitle from "frontend/components/layout/PageTitle";
import SquareButton from "frontend/components/layout/SquareButton";
import Select, { SelectOption } from "frontend/components/layout/Select";
interface Map {
  id: string;
  name: string;
  author: string;
  numberOfPlayers: number;
  size: {
    width: number;
    height: number;
  };
  cities: number;
  bases: number;
  ports: number;
  airports: number;
  comtowers: number;
  labs: number;
  created: Date;
}

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

  useEffect(() => {
    if (currentPlayer)
      setPlayer({
        label: currentPlayer.name,
        value: currentPlayer.id,
      });
  }, [currentPlayer]);

  const allMatchesQuery = trpc.match.getAll.useQuery();

  const mapQuery = trpc.map.getAll.useQuery();
  const createMutation = trpc.match.create.useMutation();
  const [currentMap, setCurrentMap] = useState<Map>();

  const players: SelectOption[] = [];
  ownedPlayers?.forEach((player) =>
    players.push({ label: player.name, value: player.id })
  );

  const maps: SelectOption[] = [];
  mapQuery.data?.forEach((map) =>
    maps.push({ label: map.name, value: map.id })
  );

  const [player, setPlayer] = useState<SelectOption | undefined>({
    label: "No players loaded",
    value: "",
  });
  const [selectMap, setSelectMap] = useState<SelectOption | undefined>(
    mapQuery.data
      ? {
          label: mapQuery.data[0].name,
          value: mapQuery.data[0].id,
        }
      : {
          label: "No maps loaded",
          value: "",
        }
  );

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
            {areOwnedPlayersLoaded && currentPlayer ? (
              <div className="@flex @flex-row @justify-center @items-center @py-2 @pb-6">
                <p className="@pr-8">Current Player: </p>
                <div className="@relative @w-64">
                  <Select
                    options={players}
                    value={player}
                    onChange={(o) => {
                      setPlayer(o);
                      const newCurrentPlayer = ownedPlayers?.find(
                        (p) => p.id === o?.value
                      );
                      setCurrentPlayer(newCurrentPlayer ?? currentPlayer);
                    }}
                  />
                </div>
              </div>
            ) : (
              // Loading Players Section
              <p>Loading Players...</p>
            )}

            <div className="@flex @justify-center @gap-5 @py-4">
              <div className="@px-2">
                <SquareButton
                  onClick={async () => {
                    const mapId = currentMap?.id;

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
                </SquareButton>
              </div>
              <div className="@flex @flex-col @items-center ">
                <div className="@w-96">
                  <Select
                    options={maps}
                    value={selectMap}
                    onChange={(o) => {
                      setSelectMap(o);
                      const newCurrentMap = mapQuery.data?.find(
                        (p) => p.id === o?.value
                      );
                      setCurrentMap(newCurrentMap);
                    }}
                  />
                </div>
              </div>
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
