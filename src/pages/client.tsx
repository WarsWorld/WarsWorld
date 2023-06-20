import { Layout } from "../frontend/components/layout";

export default function ClientPage() {
  return (
    <Layout>
      <h1>Client Side Rendering!</h1>
      <p>This should be wicked fast!</p>
      <p>
        The <strong>useSession()</strong> is a fast way to render pages, we will
        make better use of this when we know what we want
      </p>
      <p>The session state is shared between pages</p>
    </Layout>
  );
}
