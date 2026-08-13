import type { MatchStatus } from "@prisma/client";
import type { ReactNode } from "react";

type matchData = {
  //players: PlayerInMatch[];
  mapName: string;
  day: number;
  state: MatchStatus;
  favorites: number;
  spectators: number;
  time: number;
  /** The lobby status pill, rendered inline so it never overlaps the header text. */
  statusBadge?: ReactNode;
};

export default function MatchCardTop({
  mapName,
  day,
  favorites,
  spectators,
  statusBadge,
}: matchData) {
  return (
    <div className="@flex @flex-col @gap-2 @border-b @border-black/60 @bg-bg-secondary @px-3 @py-2.5 @pl-4">
      <div className="@flex @items-center @justify-between @gap-3">
        <p className="@truncate @py-0 @text-base @font-semibold @leading-tight">{mapName}</p>
        {statusBadge}
      </div>

      <div className="@flex @items-center @gap-3 @text-xs @text-slate-300">
        <span className="@font-semibold @uppercase @tracking-wide @text-primary-light">
          Day {day}
        </span>
        <span className="@text-slate-400">STD</span>
        <span className="@flex @items-center @gap-1">
          <img
            className="@h-3.5 [image-rendering:pixelated]"
            src="/img/matchCard/eye.png"
            alt="spectators"
          />
          {spectators}
        </span>
        <span className="@flex @items-center @gap-1">
          <img
            className="@h-3.5 [image-rendering:pixelated]"
            src="/img/matchCard/star.png"
            alt="favorites"
          />
          {favorites}
        </span>
        <span className="@ml-auto @flex @items-center @gap-1 @text-slate-400">
          <img
            className="@h-3.5 [image-rendering:pixelated]"
            src="/img/matchCard/clock.png"
            alt="time"
          />
          15:00
        </span>
      </div>
    </div>
  );
}
