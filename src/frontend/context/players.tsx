import type { Player } from "@prisma/client";
import { trpc } from "frontend/utils/trpc-client";
import { useLocalStorage } from "frontend/utils/use-local-storage";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type UserContext =
  | {
      ownedPlayers: Player[] | undefined;
      currentPlayerId: string | null;
      setCurrentPlayerId: (value: string) => void;
    }
  | undefined;

const playersContext = createContext<UserContext>(undefined);

export const ProvidePlayers = ({ children }: { children: ReactNode }) => {
  const [currentPlayerId, setCurrentPlayerId] = useLocalStorage("currentPlayerId", null);

  const { data } = trpc.user.me.useQuery(undefined, {
    refetchOnReconnect: false, // reduce trpc logging, this data doesn't really need to be refetched automatically
    refetchOnWindowFocus: false,
  });

  const [user, setUser] = useState<typeof data>();

  useEffect(() => {
    if (data?.user && data !== user) {
      setUser(data);

      // Auto-select a player whenever the stored selection isn't usable: none chosen yet
      // (`useLocalStorage` defaults to `null`, and "" also means unset), OR a stale id left over
      // from another account that isn't among THIS user's owned players. Without the stale-id
      // recovery, `currentPlayer` stays undefined and the match page is stuck on "Loading..."
      // forever with no way to pick a valid player.
      const ownedPlayers = data.ownedPlayers;
      const hasUsableSelection =
        currentPlayerId !== null &&
        currentPlayerId !== "" &&
        ownedPlayers.some((player) => player.id === currentPlayerId);

      if (ownedPlayers.length > 0 && !hasUsableSelection) {
        setCurrentPlayerId(ownedPlayers[0].id);
      }
    }
  }, [data, currentPlayerId, setCurrentPlayerId, user]);

  const userContextValue: UserContext = useMemo(
    () => ({
      ownedPlayers: user?.ownedPlayers,
      currentPlayerId,
      setCurrentPlayerId,
    }),
    [user?.ownedPlayers, currentPlayerId, setCurrentPlayerId],
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
  };
};
