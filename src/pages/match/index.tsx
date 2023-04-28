import { MatchRow } from "components/match/MatchRow";
import { trpc } from "utils/trpc-client";

export default function Matches() {
  const { data, refetch } = trpc.match.getAll.useQuery();
  const createMutation = trpc.match.create.useMutation();

  return (
    <div>
      <h1>Current games</h1>
      <button
        onClick={async () => {
          await createMutation.mutateAsync({
            mapId: "12345",
            selectedCO: "andy",
            playerId: "function",
          });
          refetch();
        }}
      >
        Create game
      </button>
      {data === undefined
        ? "Loading..."
        : data.map((match) => <MatchRow key={match.id} match={match} />)}
    </div>
  );
}
