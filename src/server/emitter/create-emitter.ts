import type { Match } from "@prisma/client";

/**
 * Read up on JavaScript event emitters.
 * The code here is a typesafe implementation of the same principal.
 * You can subscribe to events with a callback function
 * that will be called when those events occur.
 */
export const createEmitter = <D extends { matchId: Match["id"] }>() => {
  type Listener = (dispatched: D) => void;
  const listenerMap = new Map<Match["id"], Listener[]>();

  const unsubscribe = (matchId: Match["id"], listenerToUnsub: Listener) => {
    listenerMap.set(matchId, listenerMap.get(matchId)?.filter((l) => l !== listenerToUnsub) ?? []);
  };

  return {
    subscribe: (matchId: Match["id"], listenerToSubscribe: Listener) => {
      const listeners = listenerMap.get(matchId);

      listenerMap.set(matchId, [...(listeners ?? []), listenerToSubscribe]);

      return () => unsubscribe(matchId, listenerToSubscribe);
    },
    unsubscribe,
    emit: (dispatched?: D) => {
      if (dispatched) {
        listenerMap.get(dispatched.matchId)?.forEach((l) => l(dispatched));
      }
    },
  };
};
