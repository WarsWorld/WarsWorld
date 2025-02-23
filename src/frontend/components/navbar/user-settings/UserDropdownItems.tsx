import Link from "next/link";

type Props = {
  href: string;
  text: string;
};

export default function UserDropdownItem({ href, text }: Props) {
  return (
    <>
      <li>
        <Link
          className="@flex @flex-row @align-middle @justify-start @items-center @px-8 @py-2 @gap-6 @duration-0 hover:@bg-black/20 @text-white hover:@text-white"
          href={href}
        >
          <span className="@text-2xl">{text}</span>
        </Link>
      </li>
    </>
  );
}
