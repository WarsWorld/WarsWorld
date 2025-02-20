import { useWindowWidth } from "@react-hook/window-size";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { NavGroup } from "./NavGroup";
import { NavGroupMobile } from "./NavGroupMobile";
import NavLoginLogout from "./NavLoginLogout";

export function Navbar() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const windowWidth = useWindowWidth();
  const [showLinks, setShowLinks] = useState(false);
  const [showMatchLinks, setShowMatchLinks] = useState(false);
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

  const handleBurgerMenu = () => {
    setShowLinks(!showLinks);
  };

  useEffect(() => {
    if (windowWidth >= 1024) {
      setIsMobileWidth(true);
    } else {
      setIsMobileWidth(false);
    }
  }, [windowWidth]);

  return (
    <header className="@w-screen @fixed @top-0 @z-40 @shadow-lg @shadow-bg-primary">
      <nav className="@flex @h-full @justify-between @items-center @bg-gradient-to-r @from-bg-primary @via-bg-secondary @to-bg-primary @mx-auto @px-4 smallscreen:@px-8 laptop:@px-6">
        <div className="@relative @h-full @w-[25%] smallscreen:@w-[10%] @flex @flex-col @justify-center @align-middle">
          <Link className=" @absolute @left-4 @top-2 @flex @align-middle @justify-start" href="/">
            <Image
              className="@w-16 smallscreen:@w-24"
              src="/img/layout/logo.webp"
              alt="AW Logo"
              width={0}
              height={0}
              sizes="100vw"
            />
          </Link>
        </div>

        {!isMobileWidth ? (
          <>
            <div className="@w-screen @flex @justify-end @items-center @relative @gap-8 tablet:@gap-10 laptop:@gap-16">
              <button
                className="@flex @justify-center @items-center @h-7 @w-7"
                onClick={handleBurgerMenu}
              >
                <div className="@flex @flex-col @gap-[0.35rem] smallscreen:@gap-[0.7rem] burgerMenuIcon active:@scale-105">
                  <div className="@h-1 @w-9 smallscreen:@h-[0.3rem] smallscreen:@w-14 @rounded @bg-gradient-to-r @from-primary @to-primary-dark" />
                  <div className="@h-1 @w-9 smallscreen:@h-[0.3rem] smallscreen:@w-14 @rounded @bg-gradient-to-r @from-primary @to-primary-dark" />
                  <div className="@h-1 @w-9 smallscreen:@h-[0.3rem] smallscreen:@w-14 @rounded @bg-gradient-to-r @from-primary @to-primary-dark" />
                </div>
              </button>
              <div className="@flex @h-full @justify-center @items-center @relative">
                <NavLoginLogout isOpen={isOpen} setIsOpen={setIsOpen} width="95vw" />
              </div>
            </div>

            <NavGroupMobile showLinks={showLinks} handleBurgerMenu={handleBurgerMenu} />
          </>
        ) : (
          <>
            <NavGroup
              showMatchLinks={showMatchLinks}
              setShowMatchLinks={setShowMatchLinks}
              setShowLinks={setShowLinks}
              setIsOpen={setIsOpen}
              isOpen={isOpen}
            />
          </>
        )}
      </nav>
    </header>
  );
}
