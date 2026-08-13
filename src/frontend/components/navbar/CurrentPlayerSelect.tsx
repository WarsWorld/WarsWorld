import { usePlayers } from "frontend/context/players";

/**
 * Shows which player you're acting as and lets you switch between the players you own. Driven by
 * `usePlayers` (backed by the cookie-authenticated `user.me` query), so it reflects the real
 * logged-in identity even when `useSession()` is flaky. Renders nothing when you own no players
 * (logged out, or no player yet).
 */
export default function CurrentPlayerSelect() {
  const { ownedPlayers, currentPlayer, setCurrentPlayer } = usePlayers();

  if (ownedPlayers === undefined || ownedPlayers.length === 0) {
    return null;
  }

  return (
    <label className="@flex @items-center @gap-2 @text-sm @text-white">
      <span className="@whitespace-nowrap @text-primary-light">Playing as</span>
      <select
        className="@cursor-pointer @rounded @border @border-primary-light @bg-black/40 @px-2 @py-1 @text-white"
        value={currentPlayer?.id ?? ""}
        onChange={(event) => {
          const selected = ownedPlayers.find((player) => player.id === event.target.value);

          if (selected !== undefined) {
            setCurrentPlayer(selected);
          }
        }}
      >
        {ownedPlayers.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
      </select>
    </label>
  );
}
