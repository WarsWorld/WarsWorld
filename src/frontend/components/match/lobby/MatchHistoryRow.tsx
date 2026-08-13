import { deriveLobbyStatus } from "./match-status";

/**
 * Structural props (not `FrontendMatch`) so both history sources satisfy it: the in-memory
 * `getPlayerMatches` and the DB-backed `getPlayerFinishedMatches`, whose tRPC-inferred types differ
 * slightly. Assignable to `LobbyMatch`, so `deriveLobbyStatus` accepts it directly.
 */
type Props = {
  match: {
    id: string;
    map: { name: string; numberOfPlayers: number };
    players: { id: string; name: string; status?: "alive" | "routed" | "captured" }[];
    state: string;
    turn: number;
    finished?: boolean;
  };
  playerId: string | undefined;
};

const RESULT_META = {
  victory: { label: "Victory", edge: "@bg-emerald-500", text: "@text-emerald-400" },
  defeat: { label: "Defeat", edge: "@bg-red-600", text: "@text-red-400" },
  draw: { label: "Draw", edge: "@bg-slate-400", text: "@text-slate-300" },
  completed: { label: "Completed", edge: "@bg-slate-500", text: "@text-slate-300" },
} as const;

/** One row in the match-history timeline: outcome, opponent and map at a glance. */
export default function MatchHistoryRow({ match, playerId }: Props) {
  const status = deriveLobbyStatus(match, playerId);
  const meta =
    status === "victory" || status === "defeat" || status === "draw"
      ? RESULT_META[status]
      : RESULT_META.completed;
  const opponent = match.players.find((player) => player.id !== playerId);

  return (
    <div className="@relative @grid @grid-cols-[auto_1fr_auto] @items-center @gap-4 @overflow-hidden @rounded-lg @bg-bg-primary @py-3 @pr-4 @outline @outline-2 @outline-black">
      <div className={`@absolute @left-0 @top-0 @bottom-0 @w-1.5 ${meta.edge}`} />
      <div className={`@pl-5 @text-lg @font-bold @uppercase @tracking-wide ${meta.text}`}>
        {meta.label}
      </div>
      <div className="@min-w-0">
        <p className="@truncate @py-0 @text-sm @font-semibold">
          {match.map.name}
          {opponent !== undefined && (
            <span className="@text-slate-400 @font-normal"> vs {opponent.name}</span>
          )}
        </p>
        {match.turn > 0 && <p className="@py-0 @text-xs @text-slate-500">Day {match.turn}</p>}
      </div>
      {/* Finished matches are archived out of the live store, so there's no board to open yet.
          Replay/archived viewing is a follow-up — show a disabled affordance for now. */}
      <span
        className="@cursor-not-allowed @select-none @rounded @border @border-bg-tertiary/40 @px-3 @py-1 @text-xs @font-semibold @text-slate-600"
        title="Replays aren't available yet"
      >
        Replay
      </span>
    </div>
  );
}
