import { signIn, useSession } from "next-auth/react";
import { ReactNode } from "react";

export const ProtectedPage = ({ children }: { children: ReactNode }) => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      signIn(undefined, {
        callbackUrl: window.location.href,
      });
    },
  });

  if (status === "loading") {
    return <>Loading...</>;
  }

  return <>{children}</>;
};
