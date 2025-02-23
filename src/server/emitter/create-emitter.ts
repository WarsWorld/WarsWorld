import type { Match } from "@prisma/client";

type MatchId = Match["id"];

/**
 * Read up on JavaScript event emitters.
 * The code here is a typesafe implementation of the same principal.
 * You can subscribe to events with a callback function
 * that will be called when those events occur.
 */
export const createEmitter = <WithMatchId extends { matchId: MatchId }>() => {
  type Listener = (dispatched: WithMatchId) => void;
  //New update
  const listenerMap = new Map<MatchId, Map<string, Listener[]>>();

  const unsubscribe = (matchId: MatchId, playerId: string, _listenerToUnsub: Listener) => {
    listenerMap.get(matchId)?.delete(playerId);
  };

  return {
    subscribe(matchId: MatchId, playerID: string, listenerToSubscribe: Listener) {
      // Ensure the match exists in the outer map
      if (!listenerMap.has(matchId)) {
        listenerMap.set(matchId, new Map());
      }

      // Get the inner map for the match
      const matchMap = listenerMap.get(matchId)!;

      if (playerID === "spectator") {
        matchMap.set(playerID, [...(matchMap.get(playerID) ?? []), listenerToSubscribe]);
      } else {
        matchMap.set(playerID, [listenerToSubscribe]);
      }

      return () => unsubscribe(matchId, playerID, listenerToSubscribe);
    },
    unsubscribe,
    emit(playerId: string, dispatched?: WithMatchId) {
      if (!dispatched) {
        return;
      }

      listenerMap
        .get(dispatched.matchId)
        ?.get(playerId)
        ?.forEach((listener) => listener(dispatched));
    },
  };
};
