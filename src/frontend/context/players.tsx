import { Player } from "@prisma/client";
import { ReactNode, createContext, useContext, useState } from "react";
import { useLocalStorage } from "frontend/utils/use-local-storage";
import { trpc } from "frontend/utils/trpc-client";

type UserContext =
  | {
      ownedPlayers: Player[] | undefined;
      currentPlayerId: string | null;
      setCurrentPlayerId: (value: string) => void;
    }
  | undefined;

const playersContext = createContext<UserContext>(undefined);

export const ProvidePlayers = ({ children }: { children: ReactNode }) => {
  const { data } = trpc.user.me.useQuery(undefined, {
    onSuccess: (newUser) => {
      setUser(newUser);
      if (
        newUser.ownedPlayers &&
        newUser.ownedPlayers[0] &&
        currentPlayerId === ""
      )
        setCurrentPlayerId(newUser.ownedPlayers[0].id);
    },
  });
  const [user, setUser] = useState(data);
  const [currentPlayerId, setCurrentPlayerId] = useLocalStorage(
    "currentPlayerId",
    null
  );

  return (
    <playersContext.Provider
      value={{
        ownedPlayers: user?.ownedPlayers,
        currentPlayerId,
        setCurrentPlayerId,
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

  const currentPlayer = ownedPlayers?.find((p) => p.id === currentPlayerId);
  const setCurrentPlayer = (player: Player) => {
    if (setCurrentPlayerId) setCurrentPlayerId(player.id);
  };
  const clearLSCurrentPlayer = () => {
    if (setCurrentPlayerId) setCurrentPlayerId("");
  };

  return {
    ownedPlayers,
    currentPlayer,
    setCurrentPlayer,
    clearLSCurrentPlayer,
  };
};
