import Link from "next/link";

interface Props {
  text: string;
  location: string;
}

export function NavItem({ text, location }: Props) {
  return (
    <div>
      <Link
        className="@flex @justify-center @items-center @text-base-a @h-full @w-full"
        href={location}
      >
        {text}
      </Link>
    </div>
  );
}
