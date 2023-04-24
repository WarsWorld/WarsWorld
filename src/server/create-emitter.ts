export const createEmitter = <D>() => {
  type Listener = (dispatched: D) => void;
  let listeners: Listener[] = [];

  return {
    subscribe: (listenerToSubscribe: Listener) => {
      listeners.push(listenerToSubscribe);

      return () => {
        listeners = listeners.filter(
          (listener) => listener !== listenerToSubscribe,
        );
      };
    },
    unsubscribe: (listenerToUnsub: Listener) => {
      listeners.filter((listener) => listener !== listenerToUnsub);
    },
    emit: (dispatched: D) => {
      listeners.forEach((listener) => listener(dispatched));
    },
  };
};
