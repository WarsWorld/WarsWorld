import Link from "next/link";

interface Props {
  text: string;
  location: string;
}

export function NavItem({ text, location }: Props) {
  return (
    <div className="@flex @justify-center @items-center @h-full">
      <Link className="@text-base-a @text-white" href={location}>
        {text}
      </Link>
    </div>
  );
}
