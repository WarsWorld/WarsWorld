import Link from "next/link";
import NavButton from "./NavButton";

type Props = {
  text: string;
  location: string;
  closeBurgerMenu?: () => void;
};

export function NavItem({ text, location, closeBurgerMenu }: Props) {
  return (
    <div className="@h-full">
      <Link href={location} onClick={closeBurgerMenu}>
        <div className="@flex @justify-center @items-center @gap-2 @h-full">
          <NavButton>{text}</NavButton>
        </div>
      </Link>
    </div>
  );
}
