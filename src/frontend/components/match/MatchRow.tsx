import { usePlayers } from "frontend/context/players";
import { inferTRPCOutput, trpc } from "frontend/utils/trpc-client";
import Link from "next/link";

type FrontendMatch = inferTRPCOutput<"match", "getAll">[number];

export const MatchRow = ({ match }: { match: FrontendMatch }) => {
  const { currentPlayer } = usePlayers();
  const joinMatch = trpc.match.join.useMutation();

  //TODO: Allow for players to pick CO
  //TODO: Allow players to be readied
  //TODO: Allow players to leave match
  //TODO: see the name of both players in the match with their CO
  return (
    <div className="@grid  @mb-10 @grid-cols-12 @items-center @justify-center @outline @outline-black @outline-2 @bg-bg-tertiary @text-left ">
      <div className="@col-span-10 @bg-bg-primary">
        <p>STD [T2] Femboy vs Mipin</p>
      </div>
      <div className="@col-span-2 @bg-orange-950">
        <p>Day 3</p>
      </div>
      <div>

        <p>Player component</p>

      </div>

      <div>

        <p>VS</p>

      </div>

      <div>
        <p>Opponent</p>
      </div>

      <div>
        <div className="@bg-green-900 @p-10 @outline @outline-black"></div>

      </div>

      <ul className="">
        <li className="matchInfo">Player 1 vs Player 2</li>
        {match.players.some((p) => p.playerId === currentPlayer?.id) ? (
          <button className="@bg-gray-800 @p-2 @rounded-lg btn">Leave</button>
        ) : (
          <button
            onClick={async () => {
              await joinMatch.mutateAsync({
                selectedCO: "sami",
                matchId: match.id,
                playerId: currentPlayer.id,
              });
            }}
            className="@bg-gray-800 @p-2 @rounded-lg btn"
          >
            Join
          </button>
        )}
        <Link
          className="@bg-gray-800 @p-2 @rounded-lg btn"
          href={`/match/${match.id}`}
        >
          Enter the Match
        </Link>
      </ul>
      <div className="@flex @flex-col @items-center @justify-center">
        <div className="@h-[70vw] @max-h-[150px] @m-3 @bg-green-900 @aspect-square @outline @outline-black @outline-2">
          {match.map.name}
        </div>
      </div>
    </div>
  );
};
