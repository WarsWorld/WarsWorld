import Link from "next/link";

const rLogoPath = "/img/layout/Reddit.png";
const dLogoPath = "/img/layout/Discord.png";
const gLogoPath = "/img/layout/GitHub.png";

const footerLinks1 = [
  { text: "About us", href: "/about" },
  { text: "Terms of Use", href: "/terms" },
  { text: "Donations", href: "/donations" },
];

/*
const footerLinks2 = [
  { imgSrc: rLogoPath, imgAlt: "Reddit Logo", href: "/" },
  { imgSrc: dLogoPath, imgAlt: "Discord Logo", href: "/" },
  {
    imgSrc: gLogoPath,
    imgAlt: "GitHub Logo",
    href: "https://github.com/warsWorld/WarsWorld/",
  },
];
*/

export function Footer() {
  return (
    <footer className="@absolute @left-0 @bottom-0 @w-full @flex @flex-col @items-center @justify-center @gap-4 @bg-gradient-to-t @from-black @pb-5">
      <nav className="@flex @gap-8">
        {footerLinks1.map((item) => (
          <Link
            className="@text-base-a @text-md cellphone:@text-lg smallscreen:@text-2xl @text-primary hover:@text-primary hover:@scale-105"
            key={item.text}
            href={item.href}
          >
            {item.text}
          </Link>
        ))}
      </nav>

      {/*<nav className="@flex @justify-center @gap-8">
        {footerLinks2.map((item) => (
          <Link
            className="@h-8"
            key={item.imgAlt}
            href={item.href}
            target="_blank"
            rel="noreferrer"
          >
            <img src={item.imgSrc} alt={item.imgAlt} />
          </Link>
        ))}
      </nav>*/}

      <p className="@text-center @text-base-p @p-0 @mx-1">
        Advance Wars is (c) 1990-2001 Nintendo and (c) 2001 Intelligent Systems.
        All images are copyright of their respective owners.
      </p>
    </footer>
  );
}
