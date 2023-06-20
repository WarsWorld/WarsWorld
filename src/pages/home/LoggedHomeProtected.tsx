import { ProtectedPage } from "frontend/components/ProtectedPage";
import { useSession } from "next-auth/react";
import { NextPage } from "next";

const LoggedHome: NextPage = () => {
  const { data } = useSession();
  return (
    <ProtectedPage>
      <h1>This will be what the user sees after sucessful login</h1>
      <p>
        We will likely port most of BasicHome.tsx here and then modify as for
        the personalized/logged in functions. The session token for the logged
        in user will persist throughout all pages until logout so you can call
        the useSession along with any user details(username, email, preferences)
      </p>
      <pre>Example: {JSON.stringify(data, null, 2)}</pre>
    </ProtectedPage>
  );
};

export default LoggedHome;
