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
    <header className="@w-full @fixed @top-0 @z-30">
      <nav className="@flex @h-full @justify-between @items-center @bg-bg-secondary @mx-auto @px-5">
        <Link href="/">
          <Image
            className="@flex"
            src="/img/layout/logo.webp"
            width={60}
            height={60}
            alt="AW Logo"
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
    </header>
  );
}
