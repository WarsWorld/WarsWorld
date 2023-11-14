import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";

export const ProtectPage = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push(".", {
        query: `authModalOpen&error=ProtectedPage&callbackUrl=${encodeURIComponent(
          window.location.href
        )}`,
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
