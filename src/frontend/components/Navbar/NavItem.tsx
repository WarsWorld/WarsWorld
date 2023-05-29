import Link from "next/link";

interface Props {
  text: string;
  location: string;
}

export function NavItem({ text, location }: Props) {
  return (
    <div className="@sm:border @sm:border-black @sm:mx-0">
      <Link
        className="@flex @justify-center @items-center @text-base-a @h-full @w-full @px-4"
        href={location}
      >
        {text}
      </Link>
    </div>
  );
}
