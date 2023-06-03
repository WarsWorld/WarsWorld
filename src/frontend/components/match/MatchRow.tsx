import { usePlayers } from "frontend/context/players";
import { inferTRPCOutput } from "frontend/utils/trpc-client";
import Link from "next/link";

type FrontendMatch = inferTRPCOutput<"match", "getAll">[number];

export const MatchRow = ({ match }: { match: FrontendMatch }) => {
  const { currentPlayer } = usePlayers();

  return (
    <div className="@grid @p-2 @mb-10 matchRowGrid @outline @outline-black @outline-2">
      <ul className="@flex @flex-col @justify-center @items-center @text-center @gap-2">
        <li className="matchInfo">Player 1 vs. Player 2</li>
        {match.players.some((p) => p.playerId === currentPlayer?.id) ? (
          <button className="@bg-gray-800 @p-2 @rounded-lg">Leave</button>
        ) : (
          <button className="@bg-gray-800 @p-2 @rounded-lg">Join</button>
        )}
      </ul>
      <div className="@flex @flex-col @items-center @justify-center">
        <Link
          className="@bg-gray-800 @p-2 @rounded-lg"
          href={`/match/${match.id}`}
        >
          Enter the Match
        </Link>
        <div className="@h-[70vw] @max-h-[350px] @m-3 @bg-green-700 @aspect-square @outline @outline-black @outline-2">
          Placeholder
        </div>
      </div>
    </div>
  );
};
