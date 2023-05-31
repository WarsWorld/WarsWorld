import Link from "next/link";

export function Footer() {
  const rLogoPath = "/img/layout/Reddit.png";
  const dLogoPath = "/img/layout/Discord.png";
  const gLogoPath = "/img/layout/GitHub.png";

  return (
    <footer className="@max-h-[200px] @w-full @flex @flex-col @items-center @justify-center @gap-4 @bg-gradient-to-t @from-black">
      <nav className="@flex @gap-8">
        <Link className="@text-base-a" href="/about">
          About us
        </Link>
        <Link className="@text-base-a" href="/terms">
          Terms of Use
        </Link>
        <Link className="@text-base-a" href="/donations">
          Donations
        </Link>
      </nav>

      <nav className="@flex @justify-center @gap-8">
        <Link href="/">
          <img className="@h-8" src={rLogoPath} alt="Reddit Logo" />
        </Link>
        <Link href="/">
          <img className="@h-8" src={dLogoPath} alt="Discord Logo" />
        </Link>
        <Link
          href="https://github.com/warsWorld/WarsWorld/"
          target="_blank"
          rel="noreferrer"
        >
          <img className="@h-8" src={gLogoPath} alt="GitHub Logo" />
        </Link>
      </nav>

      <p className="@text-center @text-base-p @p-0 @mx-1">
        Advance Wars is (c) 1990-2001 Nintendo and (c) 2001 Intelligent Systems.
        All images are copyright of their respective owners.
      </p>
    </footer>
  );
}
