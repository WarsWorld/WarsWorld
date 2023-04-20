import Link from 'next/link';
import NavItem from './NavItem';

export default function Navbar() {
  const awLogoPath = '/img/layout/awLogo.webp';

  return (
    <header>
      <nav className="@flex @bg-gray-800 @mx-auto @px-2">
        <Link href="/">
          <img className="@flex @w-24" src={awLogoPath} alt="AW Logo" />
        </Link>
        <NavItem text="Current Games" location="/" />
        <NavItem text="Start a game" location="/match" />
        <NavItem text="How to play" location="/" />
        <div className="@relative @ml-3">
          <NavItem text="Login" location="/" />
        </div>
      </nav>
    </header>
  );
}
