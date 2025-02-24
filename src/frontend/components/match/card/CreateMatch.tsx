import type { Player } from "@prisma/client";
import type { SelectOption } from "frontend/components/layout/Select";
import Select from "frontend/components/layout/Select";
import SquareButton from "frontend/components/layout/SquareButton";
import { usePlayers } from "frontend/context/players";
import { trpc } from "frontend/utils/trpc-client";
import { useState } from "react";

type Props = {
  currentPlayer: Player | undefined;
  setCurrentPlayer: (player: Player) => void;
};

export default function CreateMatch({ currentPlayer }: Props) {
  const { ownedPlayers } = usePlayers();
  const utils = trpc.useUtils();

  // Get map data
  const { data: mapQuery, isLoading: isLoadingMapQuery } = trpc.map.getAll.useQuery(undefined, {
    onSuccess: (onSuccessMaps) => {
      setCurrentMapId(onSuccessMaps[0].id);
      setSelectMap({
        label: onSuccessMaps[0].name,
        value: onSuccessMaps[0].id,
      });
    },
  });
  const [currentMapId, setCurrentMapId] = useState<string>();
  const createMatchMutation = trpc.match.create.useMutation({
    onSuccess() {
      void utils.match.invalidate();
    },
  });

  // Select Logic
  const players: SelectOption[] = [];
  ownedPlayers?.forEach((player) => players.push({ label: player.name, value: player.id }));
  const maps: SelectOption[] = [];
  mapQuery?.forEach((map) => maps.push({ label: map.name, value: map.id }));

  const [selectMap, setSelectMap] = useState<SelectOption | undefined>({
    label: "No map selected",
    value: "",
  });

  const createMatchHandler = async () => {
    if (currentMapId == null || !currentPlayer) {
      return;
    }

    await createMatchMutation.mutateAsync({
      rules: {
        bannedUnitTypes: [],
        captureLimit: 50,
        dayLimit: 50,
        fogOfWar: false,
        fundsPerProperty: 1000,
        unitCapPerPlayer: 50,
        weatherSetting: "clear",
        labUnitTypes: [],
        //TODO: There needs to be more logic regarding how teamMapping will work, specially beyond 2 players
        teamMapping: [0, 1],
      },
      mapId: currentMapId,
      playerId: currentPlayer.id,
    });
  };

  const selectMapHandler = (o: SelectOption | undefined) => {
    setSelectMap(o);
    const newCurrentMap = mapQuery?.find((p) => p.id === o?.value);
    setCurrentMapId(newCurrentMap?.id);
  };

  return (
    <div className="@w-full">
      <h1>Match Page</h1>
      <p>
        To create a match, first change Current Player to any other player. Then click on create
        game.
      </p>
      <br />

      <div className="@flex @flex-col smallscreen:@flex-row @items-center @justify-center @gap-5 @py-0 smallscreen:@py-4">
        {isLoadingMapQuery ? (
          <p>Loading maps...</p>
        ) : (
          <div className="@flex @flex-col @items-center">
            <Select
              className="@w-64 smallscreen:@w-96"
              options={maps}
              value={selectMap}
              onChange={selectMapHandler}
            />
          </div>
        )}
        <div className="@pt-4 smallscreen:@py-0 @px-2 @w-64 @h-16 smallscreen:@h-12">
          <SquareButton onClick={() => void createMatchHandler()}>Create game</SquareButton>
        </div>
      </div>
    </div>
  );
}
