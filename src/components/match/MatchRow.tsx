import { usePlayers } from "components/provide-players";
import Link from "next/link";
import { inferTRPCOutput } from "utils/trpc-client";

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
      <Link href={`/match-pixi/${match.id}`}>Match: {match.id}</Link>
    </div>
  );
};
