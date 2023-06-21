import Link from "next/link";

interface Props {
  text: string;
  location: string;
  iconPath?: string;
  iconAlt?: string;
  flip?: boolean;
  handleBurgerMenu?: () => void;
}

export function NavItem({
  text,
  location,
  iconPath,
  iconAlt,
  flip,
  handleBurgerMenu,
}: Props) {
  return (
    <div className="@flex @justify-center @items-center @gap-2 @h-full">
      <Link
        className="@text-base-a @text-white"
        href={location}
        onClick={handleBurgerMenu}
      >
        {text}
      </Link>
      <img
        className={flip ? "@transform @scale-x-[-1]" : ""}
        src={iconPath}
        alt={iconAlt}
      />
    </div>
  );
}
