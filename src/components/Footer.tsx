import Link from 'next/link';

export default function Footer() {
  const rLogoPath = '/img/layout/Reddit.png';
  const dLogoPath = '/img/layout/Discord.png';
  const gLogoPath = '/img/layout/GitHub.png';

  return (
    <footer className="@flex @flex-col @items-center @justify-center @gap-4 @bg-gradient-to-t @from-black @p-0">
      <nav className="@flex @gap-10">
        <Link href="/">Home</Link>
        <Link href="/">About us</Link>
        <Link href="/">Terms of Use</Link>
        <Link href="/">Rules</Link>
      </nav>

      <nav className="@flex @justify-center @gap-5">
        <img className="footerLogo" src={rLogoPath} alt="Reddit Logo" />
        <img className="footerLogo" src={dLogoPath} alt="Discord Logo" />
        <img className="footerLogo" src={gLogoPath} alt="GitHub Logo" />
      </nav>

      <p className="@text-center @text-sm @p-0 @mx-1">
        Advance Wars is (c) 1990-2001 Nintendo and (c) 2001 Intelligent Systems.
        All images are copyright their respective owners.
      </p>
    </footer>
  );
}
