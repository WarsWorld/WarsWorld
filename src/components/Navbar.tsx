import Link from "next/link";

export default function Navbar() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <div className="menu">
        <Link href="/about">About</Link>
        <Link href="/about/howtoplay" className="menuDropdown">How to Play?</Link>
      </div>
      <Link href="/match">Match</Link>
      <Link href="/donations">Donations</Link>
      <Link href="/tos">Terms of Service</Link>
    </nav>
  )
}