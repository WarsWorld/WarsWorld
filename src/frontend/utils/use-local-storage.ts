import { useState } from "react";

export const useLocalStorage = (key: string, initialValue: string | null) => {
  const [value, setValueInternal] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    return window.localStorage.getItem(key);
  });

  const setValueExternal = (value: string) => {
    setValueInternal(value);
    window?.localStorage.setItem(key, value);
  };

  return [value, setValueExternal] as const;
};
