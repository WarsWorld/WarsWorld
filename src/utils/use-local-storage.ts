import { useState } from "react";

export const useLocalStorage = (key: string, initialValue: string | null) => {
  const [value, setValueInternal] = useState(
    () => window?.localStorage.getItem(key) ?? initialValue,
  );

  const setValueExternal = (value: string) => {
    setValueInternal(value);
    window?.localStorage.setItem(key, value);
  };

  return [value, setValueExternal] as const;
};
