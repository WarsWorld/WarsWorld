import Link from 'next/link';
import { useMediaQuery } from 'utils/useMediaQuery';

interface Props {
  text: string;
  location: string;
}

export function NavItem({ text, location }: Props) {
  const query500 = useMediaQuery('(max-width: 500px)');

  return (
    <div
      className={`${
        query500
          ? '@flex @items-center @justify-center @border @border-black @mx-0'
          : ''
      }`}
    >
      <Link
        className={`@text-base-a ${query500 ? '@p-5' : ''}`}
        href={location}
      >
        {text}
      </Link>
    </div>
  );
}
