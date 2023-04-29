import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavLinks } from './NavLinks';
import { NavLinksMobile } from './NavLinksMobile';

export function Navbar() {
  const awLogoPath = '/img/layout/awLogo.webp';
  const [showLinks, setShowLinks] = useState(false);

  return (
    <header className="@w-full @relative @z-30">
      <nav className="@flex @h-full @justify-between @items-center @bg-gray-800 @mx-auto @px-3">
        <Link href="/">
          <Image
            className="@flex"
            src={awLogoPath}
            width={180}
            height={50}
            alt="AW Logo"
          />
        </Link>
        <NavLinks />
        <button
          className="@m-4 @relative burgerMenuBtn"
          type="button"
          onClick={() => setShowLinks(!showLinks)}
        >
          <NavLinksMobile showLinks={showLinks} />
        </button>
      </nav>
    </header>
  );
}
