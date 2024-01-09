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
      <div className="@flex @flex-col @align-middle @items-center">
        <div className="@w-[90vw]">
          <div className="@grid [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] @gap-10">
            {matches === undefined && (isLoading !== undefined && !isLoading)
              ? "Loading..."
              : matches?.map((match) => <MatchCard key={match.id} match={match} inMatch={inMatch} />)}
          </div>
        </div>
      </div>
    </>
  );
}
