import Link from 'next/link';

export default function Footer() {
  const rLogoPath = '/img/layout/Reddit.png';
  const dLogoPath = '/img/layout/Discord.png';
  const gLogoPath = '/img/layout/GitHub.png';

  return (
    <footer className="@flex @flex-col @items-center @gap-3 @bg-gradient-to-r from-black">
      <nav className="">
        <Link href="/">Home</Link>
        <Link href="/">About us</Link>
        <Link href="/">Terms of Use</Link>
        <Link href="/">Rules</Link>
      </nav>

      <nav className="">
        <img src={rLogoPath} alt="Reddit Logo" />
        <img src={dLogoPath} alt="Discord Logo" />
        <img src={gLogoPath} alt="GitHub Logo" />
      </nav>

      <div className=""> </div>

      <p className="@text-center @text-sm @mb-5">
        {' '}
        Advance Wars is (c) 1990-2001 Nintendo and (c) 2001 Intelligent Systems.
        All images are copyright their respective owners.
      </p>
    </footer>
  );
}
