import Link from "next/link";
import NavButton from "../layout/NavButton";

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
    <div className="@flex @justify-center @items-center @gap-2 @h-full hover:@scale-[1.025]">
      <Link href={location} onClick={handleBurgerMenu}>
        <NavButton>{text}</NavButton>
      </Link>
      {/*<img
        className={flip ? "@transform @scale-x-[-1]" : ""}
        src={iconPath}
        alt={iconAlt}
  />*/}
    </div>
  );
}
