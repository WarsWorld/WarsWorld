import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NavLinks } from "./NavLinks";
import { NavLinksMobile } from "./NavLinksMobile";

export function Navbar() {
  const [showLinks, setShowLinks] = useState(false);
  const [showMatchLinks, setShowMatchLinks] = useState(false);

  const handleBurgerMenu = () => {
    setShowLinks(!showLinks);
    setShowMatchLinks(false);
  };

  const handleMatchLinks = () => {
    setShowMatchLinks(!showMatchLinks);
  };

  return (
    <header className="@w-full @relative @z-30">
      <nav className="@flex @h-full @justify-between @items-center @bg-gray-800 @mx-auto @px-5">
        <Link href="/">
          <Image
            className="@flex "
            src={"/img/layout/logo.webp"}
            width={90}
            height={90}
            alt="AW Logo"
          />
        </Link>

        <NavLinks
          showMatchLinks={showMatchLinks}
          handleMatchLinks={handleMatchLinks}
        />

        {/* Mobile Navbar */}

        <button
          className="@h-7 @w-7 @absolute @right-7 @cursor-pointer burgerMenuBtn"
          type="button"
          onClick={handleBurgerMenu}
        >
          <div className="@flex @flex-col @gap-1 burgerMenuIcon">
            <div className="@h-1 @w-7 @rounded"></div>
            <div className="@h-1 @w-7 @rounded"></div>
            <div className="@h-1 @w-7 @rounded"></div>
          </div>
        </button>
        <NavLinksMobile
          showLinks={showLinks}
          showMatchLinks={showMatchLinks}
          handleMatchLinks={handleMatchLinks}
        />
      </nav>
    </header>
  );
}
