import Link from 'next/link';

export default function Navbar() {
  const awLogoPath = '/img/layout/awLogo.webp';

  return (
    <header>
      <nav className="headerNavbar">
        <Link href="/">
          <img className="headerLogo" src={awLogoPath} alt="AW Logo" />
        </Link>
        <div className="headerMenu">
          <Link href="/">Current games</Link>
          <Link href="/match">Start a game</Link>
          <Link href="/">Join a game</Link>
          <Link href="/">How to play</Link>
        </div>
        <Link href="/">Login</Link>
      </nav>
    </header>
  );
}
