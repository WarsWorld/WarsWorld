import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NavGroup } from "./NavGroup";
import { NavGroupMobile } from "./NavGroupMobile";
import { useWindowWidth } from "@react-hook/window-size";
import SquareButton from "../layout/SquareButton";
import LoginSignupModal from "../modals/LoginSignupModal";
import { useSearchParams } from "next/navigation";
import NavLoginLogout from "./NavLoginLogout";

export function Navbar() {
  const searchParams = useSearchParams();

  const windowWidth = useWindowWidth();
  const [showLinks, setShowLinks] = useState(false);
  const [showMatchLinks, setShowMatchLinks] = useState(false);
  const [isMobileWidth, setIsMobileWidth] = useState(false);
  const [isOpen, setIsOpen] = useState(searchParams.has("loginOpen"));

  const handleBurgerMenu = () => {
    setShowLinks(!showLinks);
  };

  useEffect(() => {
    if (windowWidth >= 1024) setIsMobileWidth(true);
    else setIsMobileWidth(false);
  }, [windowWidth]);

  return (
    <header className="@w-screen @fixed @top-0 @z-30 @shadow-lg @shadow-bg-primary">
      <nav className="@flex @h-full @justify-between @items-center @bg-gradient-to-r @from-bg-primary @via-bg-secondary @to-bg-primary @mx-auto @px-4 smallscreen:@px-8 laptop:@px-6">
        <div className="@h-full @w-[25vw] smallscreen:@w-[10vw] @flex @flex-col @justify-center @align-middle">
          <Link className="@flex @align-middle @justify-start" href="/">
            <Image
              className="@w-16 smallscreen:@w-20"
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
                <NavLoginLogout
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  width="90vw"
                />
              </div>
            </div>

            <NavGroupMobile
              showLinks={showLinks}
              handleBurgerMenu={handleBurgerMenu}
            />
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
      <div className="@h-1 @w-full @bg-gradient-to-r @from-primary-dark @from-10% @via-primary @to-primary-dark @to-90%" />
    </header>
  );
}
