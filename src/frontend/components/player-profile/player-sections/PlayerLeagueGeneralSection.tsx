import { PlayerMMR } from "pages/players/[playerName]";
import { PlayerMMRCard } from "../PlayerMMRCard";

type Props = {
  playerLeaguesMMR: PlayerMMR[] | undefined;
};

export function PLayerLeagueGeneralSection({ playerLeaguesMMR }: Props) {
  return (
    <section className="@grid @grid-cols-3 @gap-4 @p-8 @h-full @bg-black/60 @my-4">
      {playerLeaguesMMR?.map((league) => {
        return (
          <PlayerMMRCard
            leagueType={league.leagueType}
            rank={league.rank}
            data={[league]}
            key={league.leagueType}
          />
        );
      })}
    </section>
  );
}
