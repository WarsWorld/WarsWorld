import PlayerCard from "./PlayerCard";
import { PlayerLeaderboard } from "./LeaderboardData";

interface Props {
  bestPlayers: PlayerLeaderboard[];
}

export default function BestPlayersSection({ bestPlayers }: Props) {
  return (
    <div className="@flex @flex-row @flex-wrap @justify-center @items-center">
      {bestPlayers.map((player) => {
        return (
          <div
            key={player.id}
            className="@w-28 smallscreen:@w-56 laptop:@w-60 large_monitor:@w-[24rem] @h-[30vh] smallscreen:@h-[40vh] laptop:@h-[60vh] large_monitor:@h-[70vh] @mb-8 @mx-1 smallscreen:@mx-4 large_monitor:@mb-16"
          >
            <PlayerCard
              name={player.name}
              rank={player.rank}
              mmr={player.rating}
              country={player.armyNumber}
              co={player.co}
              profileLink={player.profileLink}
            />
          </div>
        );
      })}
    </div>
  );
}
