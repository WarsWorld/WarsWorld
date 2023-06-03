import { Layout } from "frontend/components/layout";
import Head from "next/head";
import Link from "next/link";

export default function HowToPlayPage() {
  return (
    <>
      <Head>
        <title>How To Play | Wars World</title>
      </Head>

      <Layout>
        <div className="@text-center @w-[500px]">
          <div>To be constructed...</div>
          <Link href="/">Home</Link>
        </div>
      </Layout>
    </>
  );
}
