import Link from "next/link";
import NavButton from "../layout/NavButton";

type Props = {
  text: string;
  location: string;
  handleBurgerMenu?: () => void;
}

export function NavItem({ text, location, handleBurgerMenu }: Props) {
  return (
    <Link href={location} onClick={handleBurgerMenu}>
      <div className="@flex @justify-center @items-center @gap-2 @h-full hover:@scale-[1.025]">
        <NavButton>{text}</NavButton>
      </div>
    </Link>
  );
}
