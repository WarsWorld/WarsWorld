import Link from 'next/link';

interface Props {
  text: string;
  location: string;
}

export default function NavItem({ text, location }: Props) {
  return (
    <div className="@mx-2">
      <Link href={location}>{text}</Link>
    </div>
  );
}
