import type { LobbyStatusKind } from "./match-status";
import { STATUS_META } from "./match-status";

type Props = {
  kind: LobbyStatusKind;
};

/** The headline status pill shared by every lobby card. Positioned by its parent. */
export default function MatchStatusBadge({ kind }: Props) {
  const meta = STATUS_META[kind];

  return (
    <span
      className={`@inline-flex @items-center @gap-1.5 @rounded @px-2 @py-0.5 @text-xs @font-bold @uppercase @tracking-wide @select-none ${meta.pill}`}
    >
      {meta.pulse === true && (
        <span className="@h-1.5 @w-1.5 @rounded-full @bg-current @animate-pulse" />
      )}
      {meta.label}
    </span>
  );
}
