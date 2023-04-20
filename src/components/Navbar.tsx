import Link from 'next/link';
import NavItem from './NavItem';

export default function Navbar() {
  const awLogoPath = '/img/layout/awLogo.webp';

  return (
    <header>
      <nav className="@flex @justify-between @items-center @bg-gray-800 @mx-auto @px-2 navHeader">
        <Link href="/">
          <img className="@flex headerLogo" src={awLogoPath} alt="AW Logo" />
        </Link>
        <div className="@flex @gap-5">
          <NavItem text="Current Games" location="/" />
          <NavItem text="Start a game" location="/match" />
          <NavItem text="How to play" location="/" />
        </div>
        <div className="@relative @ml-3">
          <NavItem text="Login" location="/" />
        </div>
      </nav>
    </header>
  );
}
