import type { MatchStatus } from "@prisma/client";
import Image from "next/image";

type matchData = {
  //players: PlayerInMatch[];
  mapName: string;
  day: number;
  state: MatchStatus;
  favorites: number;
  spectators: number;
  time: number;
};

export default function MatchCardTop({ mapName, day, state }: matchData) {
  return (
    <>
      <div className="@grid  @grid-cols-12 @items-center @text-center @justify-center @outline @outline-black @outline-2 @bg-bg-primary @h-max ">
        <div className="@col-span-10 @bg-bg-tertiary @px-4 @text-left">
          <p>{mapName}</p>
        </div>
        <div className="@col-span-2 @bg-match-orange @uppercase ">
          <p>Day {day}</p>
        </div>
      </div>

      <div className="@grid  [grid-template-columns:repeat(auto-fit,minmax(50px,1fr))] @items-center @justify-center @outline @outline-black @outline-2 @bg-bg-primary @h-max">
        {state == "setup" ? (
          <div className="@col-span-2  @bg-secondary @text-black @font-bold ">SETUP</div>
        ) : (
          <div className="@col-span-2 @bg-bg-match-live @font-bold ">
            <img className="@h-4 @inline-block" src="/img/matchCard/liveDot.png" alt="live dot" />
            LIVE
          </div>
        )}

        <div className="@col-span-1 ">STD</div>

        <div className="@col-span-1 @bg-bg-secondary">
          <img className="@h-4 @inline-block" src="/img/matchCard/eye.png" alt="eye" /> 0
        </div>

        <div className="@col-span-1  ">
          <img className="@h-4 @inline-block " src="/img/matchCard/star.png" alt="star" /> 0
        </div>
        <div className="@col-span-2 @bg-bg-secondary">
          <img className="@h-4 @inline-block " src="/img/matchCard/clock.png" alt="clock" /> 15m:00s
        </div>
      </div>
    </>
  );
}
