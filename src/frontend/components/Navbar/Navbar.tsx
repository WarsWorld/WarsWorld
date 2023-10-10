import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NavGroup } from "./NavGroup";
import { NavGroupMobile } from "./NavGroupMobile";
import { useWindowWidth } from "@react-hook/window-size";
import { NavItem } from "./NavItem";

export function Navbar() {
  const windowWidth = useWindowWidth();
  const [showLinks, setShowLinks] = useState(false);
  const [showMatchLinks, setShowMatchLinks] = useState(false);
  const [isMobileWidth, setIsMobileWidth] = useState(false);

  const handleBurgerMenu = () => {
    setShowLinks(!showLinks);
  };

  const handleMatchLinks = () => {
    setShowMatchLinks(!showMatchLinks);
  };

  useEffect(() => {
    if (windowWidth >= 1024) setIsMobileWidth(true);
    else setIsMobileWidth(false);
  }, [windowWidth]);

  return (
    <header className="@w-full @fixed @top-0 @z-30 @h-[12vh] @shadow-lg @shadow-bg-primary">
      <nav className="@flex @h-full @justify-between @items-center @bg-gradient-to-r @from-bg-primary @via-bg-secondary @to-bg-primary @mx-auto @px-4 smallscreen:@px-8 laptop:@px-6">
        <Link href="/">
          <Image
            className="@flex @w-[18vw] tablet:@w-[12.5vw] smallscreen:@w-[13.5vw] laptop:@w-[4.5vw]"
            src="/img/layout/logo.webp"
            alt="AW Logo"
            width={0}
            height={0}
            sizes="100vw"
          />
        </Link>

        {!isMobileWidth ? (
          <>
            <div className="@flex @justify-center @items-center @relative tablet:@gap-16 @gap-8">
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
              <NavItem
                text="LOGIN"
                location="/"
                iconPath="/img/layout/Stealth-0.png"
                iconAlt="Pink Cosmos Stealth"
                flip={false}
              />
            </div>

            <NavGroupMobile
              showLinks={showLinks}
              handleBurgerMenu={handleBurgerMenu}
              showMatchLinks={showMatchLinks}
              handleMatchLinks={handleMatchLinks}
            />
          </>
        ) : (
          <>
            <NavGroup
              showMatchLinks={showMatchLinks}
              handleMatchLinks={handleMatchLinks}
              setShowLinks={setShowLinks}
            />
          </>
        )}
      </nav>
      <div className="@h-1 @w-full @bg-gradient-to-r @from-primary-dark @from-10% @via-primary @to-primary-dark @to-90%"></div>
    </header>
  );
}
