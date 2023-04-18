import Link from "next/link"

export default function Navbar() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about" className="menu">
        About
        <div>
          <Link href="/about/howtoplay">How to Play?</Link>
        </div>
      </Link>
      <Link href="/match">Match</Link>
      <Link href="/donations">Donations</Link>
      <Link href="/tos">Terms of Service</Link>
    </nav>
  )
}