import { MatchRow } from "frontend/match/MatchRow";
import { usePlayers } from "frontend/context/players";
import { useRef } from "react";
import { trpc } from "frontend/utils/trpc-client";

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
    <div>
      <p>
        Current player:
        <select
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
      <h1>Your matches</h1>
      <button
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
      <select ref={mapSelectionRef}>
        {mapQuery.data?.map((map) => (
          <option key={map.id} value={map.id}>
            {map.name}
          </option>
        ))}
      </select>

      {matchesQuery.data === undefined
        ? "Loading..."
        : matchesQuery.data.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
    </div>
  );
}
