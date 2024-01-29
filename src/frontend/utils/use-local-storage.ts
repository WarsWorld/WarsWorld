import { useState } from "react";

export const useLocalStorage = (key: string, initialValue: string | null) => {
  const [value, setValueInternal] = useState<string | null>(() => {
    //check to see if this has a window (client side rendering) or not (server-side-rendering)
    if (typeof window === "undefined") {
      return initialValue;
    }

    const item = window.localStorage.getItem(key);

    //if item is null, lets return initialValue. else return item
    return item ?? initialValue;
  });

  const setValueExternal = (newValue: string | null) => {
    setValueInternal(newValue);

    if (newValue === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, newValue);
    }
  };

  return [value, setValueExternal] as const;
};
