import type { Player } from "@prisma/client";
import { trpc } from "frontend/utils/trpc-client";
import { useLocalStorage } from "frontend/utils/use-local-storage";
import { useSession } from "next-auth/react";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type UserContext =
  | {
      ownedPlayers: Player[] | undefined;
      currentPlayerId: string | null;
      setCurrentPlayerId: (value: string) => void;
      refetchOwnedPlayers: () => void;
    }
  | undefined;

const playersContext = createContext<UserContext>(undefined);

export const ProvidePlayers = ({ children }: { children: ReactNode }) => {
  const { status } = useSession();
  const [currentPlayerId, setCurrentPlayerId] = useLocalStorage("currentPlayerId", null);

  const { data, refetch: refetchOwnedPlayers } = trpc.user.me.useQuery(undefined, {
    refetchOnReconnect: false, // reduce trpc logging, this data doesn't really need to be refetched automatically
    refetchOnWindowFocus: false,
  });

  const [user, setUser] = useState<typeof data>();

  useEffect(() => {
    if (data?.user) {
      setUser(data);

      const player = data?.ownedPlayers.at(0);
      const isSavedPlayerIdvalid = data.ownedPlayers.some((p) => p.id === currentPlayerId);

      if (player !== undefined && (!isSavedPlayerIdvalid || currentPlayerId === "")) {
        setCurrentPlayerId(player.id);
      }
    }
  }, [setCurrentPlayerId, data, currentPlayerId, user, status]);

  const userContextValue: UserContext = useMemo(
    () => ({
      ownedPlayers: user?.ownedPlayers,
      currentPlayerId,
      setCurrentPlayerId,
      refetchOwnedPlayers,
    }),
    [user?.ownedPlayers, currentPlayerId, setCurrentPlayerId, refetchOwnedPlayers],
  );

  return <playersContext.Provider value={userContextValue}>{children}</playersContext.Provider>;
};

export const usePlayers = () => {
  const user = useContext(playersContext);
  const ownedPlayers = user?.ownedPlayers;
  const currentPlayerId = user?.currentPlayerId;
  const setCurrentPlayerId = user?.setCurrentPlayerId;
  const currentPlayer = ownedPlayers?.find((p) => p.id === currentPlayerId);

  const setCurrentPlayer = (player: Player) => {
    if (setCurrentPlayerId) {
      setCurrentPlayerId(player.id);
    }
  };

  return {
    ownedPlayers,
    currentPlayer,
    setCurrentPlayer,
    refetchOwnedPlayers: user?.refetchOwnedPlayers,
  };
};
