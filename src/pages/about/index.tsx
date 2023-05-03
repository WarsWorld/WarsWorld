import { Layout } from 'components/layout';
import Link from 'next/link';
import { useState } from 'react';
import { trpc } from 'utils/trpc';

export default function AboutPage() {
  const [num, setNumber] = useState<number>();
  trpc.randomNumber.useSubscription(undefined, {
    onData(n) {
      setNumber(n);
    },
  });

  return (
    <Layout>
      <div className="@text-center @w-[500px]">
        <p>
          Here&apos;s a random number from a sub: {num?.toFixed(5)} <br />
        </p>
        <Link href="/">Home</Link>
      </div>
    </Layout>
  );
}
