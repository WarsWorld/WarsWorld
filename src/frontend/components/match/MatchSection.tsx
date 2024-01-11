import PageTitle from "frontend/components/layout/PageTitle";
import MatchCard from "./MatchCard";
import type { PlayerInMatch } from "shared/types/server-match-state";
import type { MatchStatus } from "@prisma/client";

type Props = {
  jump?: string;
  matches:
    | {
        id: string;
        map: {
          id: string;
          name: string;
          numberOfPlayers: number;
        };
        players: PlayerInMatch[];
        state: MatchStatus;
        turn: number;
      }[]
    | undefined;
  title: string;
  inMatch?: boolean;
  description?: string;
  isLoading?: boolean;
}

export default function MatchSection({ jump, title, matches, inMatch = false, description, isLoading }: Props) {
  return (
    <>
      <div id={jump} className="@w-full @my-2">
        <PageTitle>{title}</PageTitle>
        <p className="@py-0 @mt-4">{description}</p>
      </div>
      {/* <div> */}
      <div className="
        @max-w-[650px] @w-[100vw] @m-auto @px-auto @gap-5
        tablet:@w-[90vw]
        laptop:@w-auto @px-5 laptop:@grid laptop:@grid-cols-[repeat(2,minmax(100px,650px))] laptop:@max-w-[2500px]
        monitor:@grid-cols-[repeat(3,minmax(100px,650px))]
        large_monitor:@grid-cols-[repeat(4,minmax(100px,650px))]
        ">
        {matches === undefined && (isLoading !== undefined && !isLoading)
          ? "Loading..."
          : matches?.map((match) => (
            // <div className="@flex @flex-col @items-center" key={match.id}>
            //   <MatchCard match={match} inMatch={inMatch} />
            // </div>
            <MatchCard match={match} inMatch={inMatch} key={match.id}/>
          ))}
      </div>
    </>
  );
}
