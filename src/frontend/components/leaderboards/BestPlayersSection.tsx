import PlayerCard from "./PlayerCard";
import type { PlayerLeaderboard } from "./LeaderboardData";

type Props = {
  bestPlayers: PlayerLeaderboard[];
}

export default function BestPlayersSection({ bestPlayers }: Props) {
  return (
    <div className="@flex @flex-row @flex-wrap @justify-center @items-center">
      {bestPlayers.map((player) => {
        return (
          <div
            key={player.id}
            className="@w-28 smallscreen:@w-56 laptop:@w-60 large_monitor:@w-[20rem] @h-[20rem] smallscreen:@h-[40rem] large-monitor:@h-[52rem] @mb-8 @mx-1 smallscreen:@mx-4 large_monitor:@mb-16"
          >
            <PlayerCard
              name={player.name}
              rank={player.rank}
              mmr={player.rating}
              country={player.army}
              co={player.co}
              profileLink={player.profileLink}
            />
          </div>
        );
      })}
    </div>
  );
}
