import { matchMock } from "frontend/utils/mocks/matchDataMock";
import { FrontendMatch } from "shared/types/component-data";
import TitleColorBox from "../layout/TitleColorBox";
import MatchCard from "./MatchCard";
interface Props {
  title: string;
  description: string;
  tailwind_color?: string;
}

export default function MatchSection({
  title,
  description,
  tailwind_color,
}: Props) {
  const matches: FrontendMatch[] = matchMock;
  const demoTitle = "Matches";

  return (
    <section className="@grid @w-full @mt-5 tablet:@mt-0 tablet:@p-10 @h-full">
      <div className="@flex @flex-col monitor:@flex-row @items-center monitor:@space-x-8">
        <div className="@min-w-[75vw] monitor:@min-w-[20vw]">
          <TitleColorBox title={demoTitle} tailwind_color={tailwind_color} />
        </div>
        <p>{description}</p>
      </div>
      <div className="@flex @flex-wrap @justify-center monitor:@justify-start @gap-x-10">
        {matches.map((match) => {
          const randomViewers = Math.floor(Math.random() * 1000);
          const randomFavs = Math.floor(Math.random() * 1000);
          return (
            <MatchCard
              key={match.id}
              map={match.map}
              playersInMatch={match.players}
              state={match.state}
              turn={match.turn}
              spectators={randomViewers}
              favorites={randomFavs}
            />
          );
        })}
      </div>
    </section>
  );
}
