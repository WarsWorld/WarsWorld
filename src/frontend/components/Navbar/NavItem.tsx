import Link from "next/link";
import NavButton from "./NavButton";

type Props = {
  text: string;
  location: string;
  handleBurgerMenu?: () => void;
}

export function NavItem({ text, location, handleBurgerMenu }: Props) {
  return (
    <div className="@h-full">
      <Link href={location} onClick={handleBurgerMenu}>
        <div className="@flex @justify-center @items-center @gap-2 @h-full hover:@scale-[1.025]">
          <NavButton>{text}</NavButton>
        </div>
      </Link>
    </div>
  );
}
