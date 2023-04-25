import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavLinks } from './NavLinks';
// TODO: Hook can be removed after media query is fully implemented for tailwind
import { useMediaQuery } from 'utils/useMediaQuery';
import { NavLinksMobile } from './NavLinksMobile';

export function Navbar() {
  const awLogoPath = '/img/layout/awLogo.webp';
  // TODO: Hook can be removed after media query is fully implemented for tailwind
  const query500 = useMediaQuery('(max-width: 500px)');
  const [showLinks, setShowLinks] = useState(false);

  return (
    <header className="@w-full @relative @z-30">
      <nav className="@flex @h-full @justify-between @items-center @bg-gray-800 @mx-auto @px-3">
        <Link href="/">
          <Image
            className="@flex"
            src={awLogoPath}
            width={190}
            height={50}
            alt="AW Logo"
          />
        </Link>
        {query500 ? (
          <button
            className="@m-4 @relative"
            type="button"
            onClick={() => setShowLinks(!showLinks)}
          >
            <NavLinksMobile showLinks={showLinks} />
          </button>
        ) : (
          <NavLinks />
        )}
      </nav>
    </header>
  );
}
