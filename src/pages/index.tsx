import { Layout } from 'components/layout';
import { Home } from '../components/Home';

export default function IndexPage() {
  // const updateDocumentHeightCSSProperty = () => {
  //   if (typeof window !== 'undefined') {
  //     const doc = window.document.documentElement;
  //     doc.style.setProperty('--doc-height', `${window.innerHeight}px`);
  //   }
  // };

  // if (typeof window !== 'undefined') {
  //   window.addEventListener('resize', updateDocumentHeightCSSProperty);
  //   updateDocumentHeightCSSProperty();
  // }

  return (
    <Layout footer>
      <Home />
    </Layout>
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
