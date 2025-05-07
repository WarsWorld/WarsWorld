import { useCallback, useEffect, useRef } from "react";

export const useClickOutsideRef = (callback: () => void, exceptElementId?: string) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const exceptionElement =
        exceptElementId !== undefined ? document?.getElementById(exceptElementId) : null;

      if (
        ref.current &&
        !ref.current.contains(event.target as Node) &&
        (!exceptionElement || !exceptionElement.contains(event.target as Node))
      ) {
        callback();
      }
    },
    [callback, exceptElementId],
  );

  useEffect(() => {
    document.addEventListener("mouseup", handleClickOutside);
    document.addEventListener("touchend", handleClickOutside);

    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, [handleClickOutside]);

  return ref;
};
