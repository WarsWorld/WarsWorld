import Link from 'next/link';

interface Props {
  text: string;
  location: string;
}

export function NavItem({ text, location }: Props) {
  return (
    <div className="@flex @justify-center @items-center @sm:border @sm:border-black @sm:mx-0">
      <Link className="@text-base-a" href={location}>
        {text}
      </Link>
    </div>
  );
}
