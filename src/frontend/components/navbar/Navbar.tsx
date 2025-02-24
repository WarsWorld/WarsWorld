import { useWindowWidth } from "@react-hook/window-size";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { NavGroup } from "./NavGroup";
import { NavGroupMobile } from "./NavGroupMobile";

export function Navbar() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const windowWidth = useWindowWidth();
  const [isMobileWidth, setIsMobileWidth] = useState(false);
  const isOpen = searchParams.has("authModalOpen");

  const setIsOpen = async (value: boolean, callbackUrl?: string) => {
    if (value) {
      await router.replace("", {
        pathname: window.location.pathname,
        query: "authModalOpen",
      });
    } else {
      await router.replace(
        callbackUrl ?? {
          pathname: window.location.pathname,
          query: "",
        },
      );
    }
  };

  useEffect(() => {
    if (windowWidth >= 1024) {
      setIsMobileWidth(false);
    } else {
      setIsMobileWidth(true);
    }
  }, [windowWidth]);

  return (
    <header className="@w-screen @fixed @top-0 @z-40 @shadow-lg @shadow-bg-primary">
      <nav className="@flex @h-full @justify-between @items-center @bg-gradient-to-r @from-bg-primary @via-bg-secondary @to-bg-primary @mx-auto @px-4 smallscreen:@px-8 laptop:@px-6">
        <div className="@relative @h-full @w-auto smallscreen:@w-[12%] @flex @flex-col @justify-center @align-middle">
          <Link
            className="smallscreen:@absolute smallscreen:@left-4 smallscreen:@top-0 @flex @align-middle @justify-start"
            href="/"
          >
            <Image
              className="@w-20 smallscreen:@w-24"
              src="/img/layout/logo.webp"
              alt="AW Logo"
              width={0}
              height={0}
              sizes="100vw"
            />
          </Link>
        </div>

        {isMobileWidth ? (
          <NavGroupMobile isOpen={isOpen} setIsOpen={setIsOpen} />
        ) : (
          <NavGroup setIsOpen={setIsOpen} isOpen={isOpen} />
        )}
      </nav>
    </header>
  );
}
