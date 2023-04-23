import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NavItem } from './NavItem';
import { useMediaQuery } from 'utils/useMediaQuery';

export function Navbar() {
  const awLogoPath = '/img/layout/awLogo.webp';
  const query500 = useMediaQuery('(max-width: 500px)');
  const [showLinks, setShowLinks] = useState(false);

  return (
    <header className="@w-screen @relative @z-30">
      <nav className="@flex @justify-between @items-center @bg-gray-800 @mx-auto @px-3 navHeader">
        <Link href="/">
          <Image
            className="@flex headerLogo"
            src={awLogoPath}
            width={216}
            height={80}
            alt="AW Logo"
          />
        </Link>
        {query500 ? (
          <button
            className="@rounded-full @p-1 @relative"
            type="button"
            onClick={() => setShowLinks(!showLinks)}
          >
            <div className="@flex @flex-col @gap-1 burgerMenu">
              <div className="@h-1 @w-7 @rounded"></div>
              <div className="@h-1 @w-7 @rounded"></div>
              <div className="@h-1 @w-7 @rounded"></div>
            </div>
            {showLinks ? (
              <div className="@grid @absolute @mt-2 @bg-slate-900/90 @right-0 @h-80 @w-48">
                <NavItem text="Current Games" location="/match" />
                <NavItem text="Start a game" location="/match" />
                <NavItem text="How to play" location="/howtoplay" />
                <NavItem text="Login" location="/" />
              </div>
            ) : null}
          </button>
        ) : (
          <>
            <div className="@grid @grid-cols-3 @gap-10 @text-center @mx-3">
              <NavItem text="Current Games" location="/match" />
              <NavItem text="Start a game" location="/match" />
              <NavItem text="How to play" location="/howtoplay" />
            </div>
            <div className="@text-center @relative @px-3 loginLink">
              <NavItem text="Login" location="/" />
            </div>
          </>
        )}
      </nav>
    </header>
  );
}
