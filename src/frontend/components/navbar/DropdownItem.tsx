import Link from "next/link";
import type { MouseEventHandler } from "react";

type Props = {
  href: string;
  text: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export default function DropdownItem({ href, text, className, onClick }: Props) {
  return (
    <>
      <li className={className}>
        <Link
          className={`@flex @flex-row @align-middle @justify-start @items-center @px-8 @py-2 @gap-6 
            @duration-0 hover:@bg-black/20 @text-white hover:@text-white`}
          onClick={onClick}
          href={href}
        >
          <span className="@text-2xl">{text}</span>
        </Link>
      </li>
    </>
  );
}
