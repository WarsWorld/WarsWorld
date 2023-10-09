import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NavGroup } from "./NavGroup";
import { NavGroupMobile } from "./NavGroupMobile";

export function Navbar() {
  const [showLinks, setShowLinks] = useState(false);
  const [showMatchLinks, setShowMatchLinks] = useState(false);

  const handleBurgerMenu = () => {
    setShowLinks(!showLinks);
  };

  const handleMatchLinks = () => {
    setShowMatchLinks(!showMatchLinks);
  };

  return (
    <header className="@w-full @fixed @top-0 @z-30 @h-[12vh] @shadow-lg @shadow-bg-primary">
      <nav className="@flex @h-full @justify-between @items-center @bg-gradient-to-r @from-bg-primary @via-bg-secondary @to-bg-primary @mx-auto @px-6">
        <Link href="/">
          <Image
            className="@flex @w-[4.5vw]"
            src="/img/layout/logo.webp"
            alt="AW Logo"
            width={0}
            height={0}
            sizes="100vw"
          />
        </Link>

        <NavGroup
          showMatchLinks={showMatchLinks}
          handleMatchLinks={handleMatchLinks}
          setShowLinks={setShowLinks}
        />

        {/* Mobile Navbar */}

        <button
          className="@flex @justify-center @items-center @h-7 @w-7 @absolute @right-7"
          onClick={handleBurgerMenu}
        >
          <div className="@flex @flex-col @gap-1 burgerMenuIcon">
            <div className="@h-1 @w-7 @rounded" />
            <div className="@h-1 @w-7 @rounded" />
            <div className="@h-1 @w-7 @rounded" />
          </div>
        </button>
        <NavGroupMobile
          showLinks={showLinks}
          handleBurgerMenu={handleBurgerMenu}
          showMatchLinks={showMatchLinks}
          handleMatchLinks={handleMatchLinks}
        />
      </nav>
      <div className="@h-1 @w-full @bg-gradient-to-r @from-bg-primary @from-10% @via-primary @to-bg-primary @to-90%"></div>
    </header>
  );
}
