import type { Player } from "@prisma/client";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "frontend/utils/use-local-storage";
import type { ReactNode } from "react";
import { trpc } from "frontend/utils/trpc-client";

type UserContext =
  | {
      ownedPlayers: Player[] | undefined;
      currentPlayerId: string | null;
      setCurrentPlayerId: (value: string) => void;
      refetchUser: () => void;
    }
  | undefined;

const playersContext = createContext<UserContext>(undefined);

export const ProvidePlayers = ({ children }: { children: ReactNode }) => {
  const [currentPlayerId, setCurrentPlayerId] = useLocalStorage(
    "currentPlayerId",
    null
  );

  const { data, refetch } = trpc.user.me.useQuery();

  const [user, setUser] = useState<typeof data>();

  useEffect(() => {
    if (data && data !== user) {
      setUser(data);

      if (data.ownedPlayers?.[0] != undefined && currentPlayerId === "") {
        setCurrentPlayerId(data.ownedPlayers[0].id);
      }
    }

  }, [data, currentPlayerId, setCurrentPlayerId]);

  const refetchUser = () => void refetch();

  return (
    <playersContext.Provider
      value={{
        ownedPlayers: user?.ownedPlayers,
        currentPlayerId,
        setCurrentPlayerId,
        refetchUser
      }}
    >
      {children}
    </playersContext.Provider>
  );
};

export const usePlayers = () => {
  const user = useContext(playersContext);
  const ownedPlayers = user?.ownedPlayers;
  const currentPlayerId = user?.currentPlayerId;
  const setCurrentPlayerId = user?.setCurrentPlayerId;
  const refetchUser = user?.refetchUser;
  const currentPlayer = ownedPlayers?.find((p) => p.id === currentPlayerId);

  const setCurrentPlayer = (player: Player) => {
    if (setCurrentPlayerId) {
      setCurrentPlayerId(player.id);
    }
  };

  const clearLSCurrentPlayer = () => {
    if (setCurrentPlayerId) {
      setCurrentPlayerId("");
    }
  };

  return {
    ownedPlayers,
    currentPlayer,
    setCurrentPlayer,
    clearLSCurrentPlayer,
    refetchUser,
  };
};
