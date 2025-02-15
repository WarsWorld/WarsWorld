import type { Match } from "@prisma/client";
import type { GameEvent } from "./emitter-schema";

/**
 * Read up on JavaScript event emitters.
 * The code here is a typesafe implementation of the same principal.
 * You can subscribe to events with a callback function
 * that will be called when those events occur.
 */
export const createEmitter = <D extends { matchId: Match["id"] }>() => {
  type Listener = (dispatched: D) => void;
  //New update
  const listenerMap = new Map<Match["id"], Map<string, Listener[]>>();

  const unsubscribe = (matchId: Match["id"], playerId: string, listenerToUnsub: Listener) => {
    listenerMap.get(matchId)?.delete(playerId);
  };

  return {
    subscribe: (matchId: Match["id"], playerID: string, listenerToSubscribe: Listener) => {
      // Ensure the match exists in the outer map
      if (!listenerMap.has(matchId)) {
        listenerMap.set(matchId, new Map());
      }

      // Get the inner map for the match
      const matchMap = listenerMap.get(matchId)!;

      //is it an spectator
      if (playerID === "spectator") {
        matchMap.set(playerID, [...(matchMap.get(playerID) ?? []), listenerToSubscribe]);
      } else {
        matchMap.set(playerID, [listenerToSubscribe]);
      }

      return () => unsubscribe(matchId, playerID, listenerToSubscribe);
    },
    unsubscribe,
    emit: (gameEvent: GameEvent, dispatched?: D) => {
      if (dispatched) {
        const matchMap = listenerMap.get(dispatched.matchId);

        // Null check for matchMap
        if (!matchMap) {
          return;
        }

        let listeners;

        if (gameEvent.type !== "matchStart" && gameEvent?.playerId) {
          listeners = matchMap.get(gameEvent.playerId);
        }
        // Use get method instead of iteration

        // If listeners exist, call them
        if (listeners) {
          listeners.forEach((l) => l(dispatched));
        }
      }
    },
  };
};
