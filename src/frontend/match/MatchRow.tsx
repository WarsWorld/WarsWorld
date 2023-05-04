import { usePlayers } from "frontend/context/players";
import { inferTRPCOutput } from "frontend/utils/trpc-client";
import Link from "next/link";

type FrontendMatch = inferTRPCOutput<"match", "getAll">[number];

export const MatchRow = ({ match }: { match: FrontendMatch }) => {
  const { currentPlayer } = usePlayers();

  return (
    <div
      style={{
        padding: "0.2rem",
        border: "2px solid black",
      }}
    >
      {match.players.some((p) => p.playerId === currentPlayer?.id) ? (
        <button>Leave</button>
      ) : (
        <button>Join</button>
      )}
      <Link href={`/match/${match.id}`}>Match: {match.id}</Link>
    </div>
  );
};
