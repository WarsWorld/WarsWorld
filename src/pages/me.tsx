import { useSession } from "next-auth/react";
import { Layout } from "../frontend/components/layout";

export default function MePage() {
  const { data } = useSession();

  return (
    <Layout>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Layout>
  );
}
