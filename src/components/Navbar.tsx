import Link from "next/link";
import { trpc } from 'utils/trpc';

export default function Navbar() {
  const awLogoPath = "/img/layout/awLogo.webp"
  const { data } = trpc.match.getAll.useQuery();
  return (
    <header>
      <nav className="headerMenu">
        <Link href="/">
          <img className="headerLogo" src={awLogoPath} alt="AW Logo" />
        </Link>
        <Link href="/">Current games</Link>
        <Link href="/match">Start a game</Link>
        <Link href="/">Join a game</Link>
        <Link href="/">How to play</Link>
        <Link href="/">Login</Link>
      </nav>
    </header>
  )
}
