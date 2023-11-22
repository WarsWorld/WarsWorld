import type { Player } from "@prisma/client";
import type { SelectOption } from "frontend/components/layout/Select";
import Select from "frontend/components/layout/Select";
import SquareButton from "frontend/components/layout/SquareButton";
import { usePlayers } from "frontend/context/players";
import { trpc } from "frontend/utils/trpc-client";
import { useEffect, useState } from "react";

type Props = {
  currentPlayer: Player | undefined;
  refecthYourMatches: () => any;
  refecthAllMatches: () => any;
  setCurrentPlayer: (player: Player) => any;
};

export default function CreateMatch({ currentPlayer, refecthYourMatches, refecthAllMatches, setCurrentPlayer }: Props) {
  const { ownedPlayers, areOwnedPlayersLoaded } = usePlayers();

  // Get map data
  const { data: mapQuery, isLoading: isLoadingMapQuery } = trpc.map.getAll.useQuery();
  const [currentMapId, setCurrentMapId] = useState<string>();
  const createMutation = trpc.match.create.useMutation();

  // Select Logic
  const players: SelectOption[] = [];
  ownedPlayers?.forEach((player) => players.push({ label: player.name, value: player.id }));
  const maps: SelectOption[] = [];
  mapQuery?.forEach((map) => maps.push({ label: map.name, value: map.id }));

  const [selectPlayer, setSelectPlayer] = useState<SelectOption | undefined>({
    label: "No player selected",
    value: ""
  });
  const [selectMap, setSelectMap] = useState<SelectOption | undefined>(
    !isLoadingMapQuery && mapQuery
      ? {
          label: mapQuery[0].name,
          value: mapQuery[0].id
        }
      : {
          label: "No map selected",
          value: ""
        }
  );

  useEffect(() => {
    if (currentPlayer) {
      setSelectPlayer({
        label: currentPlayer.name,
        value: currentPlayer.id
      });
    }
  }, [currentPlayer]);

  const createMatchHandler = async () => {
    const mapId = currentMapId;

    if (!mapId || !currentPlayer) {
      return;
    }

    await createMutation.mutateAsync({
      selectedCO: "lash",
      mapId,
      playerId: currentPlayer.id
    });

    refecthAllMatches();
    refecthYourMatches();
  };

  const selectPlayerHandler = (o: SelectOption | undefined) => {
    if (!ownedPlayers) {
      return;
    }

    setSelectPlayer(o);
    const newCurrentPlayer = ownedPlayers.find((p) => p.id === o?.value);

    if (newCurrentPlayer) {
      setCurrentPlayer(newCurrentPlayer);
    }
  };

  const selectMapHandler = (o: SelectOption | undefined) => {
    setSelectMap(o);
    const newCurrentMap = mapQuery?.find((p) => p.id === o?.value);
    setCurrentMapId(newCurrentMap?.id);
  };

  return (
    <div className="@w-[100vw]">
      <h1>Hello dev! Read Instructions</h1>
      <p>
        To create a match, first change Current Player to any other player.
        <br />
        Then click on Create Game and then on Enter Match
      </p>
      <br />
      {areOwnedPlayersLoaded ? (
        <div className="@flex @flex-col smallscreen:@flex-row @justify-center @items-center @py-2 @pb-6">
          <p className="@px-0 smallscreen:@pr-8">Current Player: </p>
          <div className="@relative @w-64 @my-4 smallscreen:@m-0">
            <Select options={players} value={selectPlayer} onChange={selectPlayerHandler} />
          </div>
        </div>
      ) : (
        <p>Loading Players...</p>
      )}

      <div className="@flex @flex-col smallscreen:@flex-row @items-center @justify-center @gap-5 @py-0 smallscreen:@py-4">
        {isLoadingMapQuery ? (
          <p>Loading maps...</p>
        ) : (
          <div className="@flex @flex-col @items-center">
            <div className="@w-64 smallscreen:@w-96">
              <Select options={maps} value={selectMap} onChange={selectMapHandler} />
            </div>
          </div>
        )}
        <div className="@pt-4 smallscreen:@py-0 @px-2 @w-64 @h-16 smallscreen:@h-12">
          <SquareButton onClick={() => void createMatchHandler()}>Create game</SquareButton>
        </div>
      </div>
    </div>
  );
}
