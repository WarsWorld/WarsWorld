import { Player } from "@prisma/client";
import { ReactNode, createContext, useContext } from "react";
import { trpc } from "utils/trpc-client";
import { useLocalStorage } from "utils/use-local-storage";

const playersContext = createContext<Player[] | undefined | null>(null);

export const ProvidePlayers = ({ children }: { children: ReactNode }) => {
  const { data } = trpc.user.me.useQuery();

  return (
    <playersContext.Provider value={data?.ownedPlayers}>
      {children}
    </playersContext.Provider>
  );
};

export const usePlayers = () => {
  const ownedPlayers = useContext(playersContext);
  const [currentPlayerId, setCurrentPlayerId] = useLocalStorage(
    "currentPlayerId",
    null,
  );
  const currentPlayer = ownedPlayers?.find((p) => p.id === currentPlayerId);

  const setCurrentPlayer = (player: Player) => setCurrentPlayerId(player.id);

  if (ownedPlayers === null) {
    throw new Error("useOwnedPlayers used outside ProvideOwnedPlayers");
  }

  return {
    ownedPlayers,
    currentPlayer,
    setCurrentPlayer,
  };
};
