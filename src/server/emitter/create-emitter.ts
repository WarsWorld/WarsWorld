export const createEmitter = <D extends { matchId: string }>() => {
  type Listener = (dispatched: D) => void;
  const listenerMap = new Map<string, Listener[]>();

  const unsubscribe = (id: string, listenerToUnsub: Listener) => {
    listenerMap.set(
      id,
      listenerMap.get(id)?.filter((l) => l !== listenerToUnsub) ?? [],
    );
  };

  return {
    subscribe: (id: string, listenerToSubscribe: Listener) => {
      const listeners = listenerMap.get(id);

      listenerMap.set(id, [...(listeners ?? []), listenerToSubscribe]);

      return () => unsubscribe(id, listenerToSubscribe);
    },
    unsubscribe,
    emit: (dispatched: D) => {
      listenerMap.get(dispatched.matchId)?.forEach((l) => l(dispatched));
    },
  };
};
