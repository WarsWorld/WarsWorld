import { useRouter } from "next/router";
import type { ReactNode } from "react";
import type { LobbyView } from "./match-status";

type Props = {
  active: LobbyView;
  counts: Record<LobbyView, number>;
  onSelect: (view: LobbyView) => void;
  onCreate: () => void;
  playerName: string | undefined;
};

const ICONS: Record<LobbyView, ReactNode> = {
  needs: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  mine: <path d="M3 4h18v4H3zM3 12h18v8H3z" />,
  find: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4-4" />
    </>
  ),
  watch: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  history: (
    <>
      <path d="M12 8v4l3 2" />
      <circle cx="12" cy="12" r="9" />
    </>
  ),
};

const ITEMS: { view: LobbyView; label: string }[] = [
  { view: "needs", label: "Needs you" },
  { view: "mine", label: "Your matches" },
  { view: "find", label: "Find a game" },
  { view: "watch", label: "Spectate" },
  { view: "history", label: "History" },
];

export default function LobbyRail({ active, counts, onSelect, onCreate, playerName }: Props) {
  const router = useRouter();

  return (
    <aside className="@flex @flex-col @gap-4 laptop:@sticky laptop:@top-20">
      <button
        onClick={onCreate}
        className="@flex @w-full @items-center @justify-center @gap-2 @rounded-xl @bg-primary @py-3 @font-bold @uppercase @tracking-wide @text-black @shadow-md @shadow-black/40 @transition hover:@scale-[1.02] hover:@bg-primary-light"
      >
        <svg
          className="@h-5 @w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Create match
      </button>

      <nav className="@flex @gap-1 @overflow-x-auto @rounded-xl @bg-bg-primary/70 @p-2 @outline @outline-1 @outline-bg-tertiary laptop:@flex-col">
        {ITEMS.map(({ view, label }) => {
          const isActive = view === active;
          const isUrgent = view === "needs" && counts.needs > 0;

          return (
            <button
              key={view}
              onClick={() => onSelect(view)}
              className={`@flex @flex-none @items-center @gap-3 @rounded-lg @px-3 @py-2.5 @text-left @text-sm @transition ${
                isActive
                  ? "@bg-bg-secondary @text-white @outline @outline-1 @outline-bg-tertiary"
                  : "@text-slate-400 hover:@bg-bg-secondary hover:@text-white"
              }`}
            >
              <svg
                className={`@h-[1.05rem] @w-[1.05rem] @flex-none ${isUrgent ? "@text-amber-400" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {ICONS[view]}
              </svg>
              <span className="@flex-1 @whitespace-nowrap">{label}</span>
              <span
                className={`@rounded-full @px-2 @py-0.5 @text-xs @font-semibold @tabular-nums ${
                  isUrgent ? "@bg-amber-400 @text-black" : "@bg-bg-tertiary @text-slate-300"
                }`}
              >
                {counts[view]}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="@rounded-xl @bg-bg-primary/70 @p-4 @outline @outline-1 @outline-bg-tertiary">
        <p className="@py-0 @text-xs @uppercase @tracking-wide @text-slate-500">Playing as</p>
        <p className="@truncate @py-0 @font-semibold">{playerName ?? "No player selected"}</p>
        <button
          onClick={() => void router.push("/leaderboard")}
          className="@mt-3 @w-full @rounded-lg @border @border-bg-tertiary @py-2 @text-xs @font-semibold @uppercase @tracking-wide @text-slate-300 @transition hover:@bg-primary-light hover:@text-black"
        >
          Leaderboard
        </button>
      </div>
    </aside>
  );
}
