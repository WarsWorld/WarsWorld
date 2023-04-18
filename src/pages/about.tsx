import Head from 'next/head';
import { useState } from 'react';
import { trpc } from 'utils/trpc';
import Navbar from 'components/Navbar';

export default function AboutPage() {
  const [num, setNumber] = useState<number>();
  trpc.randomNumber.useSubscription(undefined, {
    onData(n) {
      setNumber(n);
    },
  });

  return (
    <>
      <Head>
        <title>Wars World About Page</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

      <section>
        <div>
          Here&apos;s a random number from a sub: 
          <br />
          {num}
        </div>
      </section>
    </>
  );
}
