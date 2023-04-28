import { MatchRow } from "components/match/MatchRow";
import { usePlayers } from "components/provide-players";
import { useRef } from "react";
import { trpc } from "utils/trpc-client";

export default function YourMatches() {
  const { currentPlayer } = usePlayers();

  const matchesQuery = trpc.match.getPlayerMatches.useQuery(
    { playerId: currentPlayer?.id ?? "" },
    {
      enabled: currentPlayer !== undefined,
    },
  );

  const mapQuery = trpc.map.getAll.useQuery();
  const createMutation = trpc.match.create.useMutation();
  const mapSelectionRef = useRef<HTMLSelectElement>(null);

  return (
    <div>
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
