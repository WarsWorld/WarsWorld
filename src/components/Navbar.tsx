import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavLinks } from './NavLinks';
import { useMediaQuery } from 'utils/useMediaQuery';
import { NavLinksMobile } from './NavLinksMobile';

export function Navbar() {
  const awLogoPath = '/img/layout/awLogo.webp';
  // Might keep useMediaQuery to conditionally switch between full navbar and hamburger menu
  const notPhone = useMediaQuery('(min-width: 480px)');
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
        {notPhone ? (
          <NavLinks />
        ) : (
          <button
            className="@m-4 @relative"
            type="button"
            onClick={() => setShowLinks(!showLinks)}
          >
            <NavLinksMobile showLinks={showLinks} />
          </button>
        )}
      </nav>
    </header>
  );
}
