import Link from "next/link";
import type { MouseEventHandler } from "react";
import NavButton from "./NavButton";

type Props = {
  text: string;
  location: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function NavItem({ text, location, onClick }: Props) {
  return (
    <div className="@h-full">
      <Link href={location} onClick={onClick}>
        <div className="@flex @justify-center @items-center @gap-2 @h-full">
          <NavButton>{text}</NavButton>
        </div>
      </Link>
    </div>
  );
}
