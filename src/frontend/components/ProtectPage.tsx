import { signIn, useSession } from "next-auth/react";
import { ReactNode } from "react";

export const ProtectPage = ({ children }: { children: ReactNode }) => {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      signIn(undefined, {
        callbackUrl: window.location.href,
      });
    },
  });

  if (status === "loading") {
    return (
      <div className="@flex @flex-col @items-center @align-middle @justify-center @w-full @h-[50vh]">
        <div>LOADING . . .</div>
      </div>
    );
  }

  return <>{children}</>;
};
