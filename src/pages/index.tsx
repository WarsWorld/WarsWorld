import Head from 'next/head';




export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Wars World Home Page</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

<div className="@rounded-lg @bg-black/70 @center @p-8 @mx-20 @mt-16">
  <h2>Work in progress...</h2>
  <h1>Welcome to Wars World!</h1>
  <p>First of all, congrats on setting your developer environment!</p>
  <p>We are in the process of refactoring &quot;AW-Competitive&quot;/Wars World demo (FemboyDeveloper, Rey, Yeti et al.) into Typescript/React/Next.js + tRPC + Prisma/SQL (FunctionDJ&apos;s idea)</p>
  <p>Before you decide to take on one of our <a href={'https://github.com/WarsWorld/WarsWorld/issues'}> issues (most need to be triaged)</a>. Make sure you&apos;ve talked with us or gotten confirmation that no one else is working on that task. Otherwise, you risk working on something that&apos;s already being done. </p>
  <h3>Please have patience while we continue to do establish the basic foundation.</h3>
</div>
    </>
  );
}

/**
 * If you want to statically render this page
 * - Export `appRouter` & `createContext` from [trpc].ts
 * - Make the `opts` object optional on `createContext()`
 *
 * @link https://trpc.io/docs/ssg
 */
// export const getStaticProps = async (
//   context: GetStaticPropsContext<{ filter: string }>,
// ) => {
//   const ssg = createSSGHelpers({
//     router: appRouter,
//     ctx: await createContext(),
//   });
//
//   await ssg.fetchQuery('post.all');
//
//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//       filter: context.params?.filter ?? 'all',
//     },
//     revalidate: 1,
//   };
// };
