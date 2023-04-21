import { useState } from 'react';
import Link from 'next/link';
import NavItem from './NavItem';
import { useMediaQuery } from 'utils/useMediaQuery';

export default function Navbar() {
  const awLogoPath = '/img/layout/awLogo.webp';
  const burgerMenuPath = '/img/layout/burgerMenu.png';
  const query500 = useMediaQuery('(max-width: 500px)');
  const [showLinks, setShowLinks] = useState(false);

  return (
    <header className="@w-screen @relative @z-30">
      <nav className="@flex @justify-between @items-center @bg-gray-800 @mx-auto @px-3 navHeader">
        <Link href="/">
          <img className="@flex headerLogo" src={awLogoPath} alt="AW Logo" />
        </Link>
        {query500 ? (
          <button
            className="@rounded-full @p-1 @relative"
            type="button"
            onClick={() => setShowLinks(!showLinks)}
          >
            <img
              className="@h-7 burgerMenu"
              src={burgerMenuPath}
              alt="burger menu icon"
            />
            {showLinks ? (
              <div className="@grid @absolute @mt-2 @bg-slate-900/90 @right-0 @h-80 @w-48">
                <NavItem text="Current Games" location="/" />
                <NavItem text="Start a game" location="/match" />
                <NavItem text="How to play" location="/" />
                <NavItem text="Login" location="/" />
              </div>
            ) : null}
          </button>
        ) : (
          <>
            <div className="@flex @gap-5 @text-center">
              <NavItem text="Current Games" location="/" />
              <NavItem text="Start a game" location="/match" />
              <NavItem text="How to play" location="/" />
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
