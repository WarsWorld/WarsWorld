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
            className="@w-24 smallscreen:@w-56 laptop:@w-60 @h-[30vh] smallscreen:@h-[40vh] laptop:@h-[60vh] @mb-8 @mx-2 smallscreen:@mx-4"
          >
            <PlayerCard
              name={player.name}
              rank={player.rank}
              mmr={player.rating}
              country={player.country}
              co={player.co}
              profileLink={player.profileLink}
            />
          </div>
        );
      })}
    </div>
  );
}
